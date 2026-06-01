import { NextResponse } from 'next/server'
import { GenerateReportBodySchema } from '@/lib/reports/schemas'
import { generateReportContent } from '@/lib/reports/llm'
import { uploadReportImage, saveReportRecord } from '@/lib/reports/storage'
import { moderateDisplayName } from '@/lib/constitution/name-moderation'
import { harvest } from '@/lib/diagnostics/integration'
import { buildOgImageResponse } from '@/lib/reports/og-builder'
import type { GenerateReportResponse, ReportContent } from '@/lib/reports/schemas'

const MAX_RETRIES = 3

export async function POST(request: Request): Promise<NextResponse<GenerateReportResponse>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'リクエストの解析に失敗しました' }, { status: 400 })
  }

  const parsed = GenerateReportBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: '入力データが不正です' },
      { status: 400 },
    )
  }

  const {
    birthDate,
    mbtiType,
    animalCharacter,
    zodiacSign,
    sixStar,
    displayName: rawDisplayName,
    userId,
    phase,
  } = parsed.data

  const { sanitized: displayName } = moderateDisplayName(rawDisplayName ?? null)

  let harvestMeta: string | undefined
  try {
    const [yearStr, monthStr, dayStr] = birthDate.split('-')
    const harvestResult = harvest({
      birthDate: new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr)),
      mbti: mbtiType,
      phase,
    })
    harvestMeta = harvestResult.meta
  } catch (err) {
    console.error('harvest() error (non-fatal):', err)
  }

  let content: ReportContent | undefined
  let llmError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      content = await generateReportContent({
        displayName,
        zodiacSign,
        animalCharacter,
        sixStar,
        mbtiType,
        harvestMeta,
      })
      break
    } catch (err) {
      llmError = err
      console.error(`LLM attempt ${attempt + 1} failed:`, err)
    }
  }

  if (!content) {
    console.error('All LLM retries exhausted:', llmError)
    return NextResponse.json(
      {
        success: false,
        error: 'レポートの生成に時間がかかっています。もう一度試してみてください。',
      },
      { status: 503 },
    )
  }

  let reportId: string | undefined
  let reportUrl: string | undefined
  let usedFallback = false

  let pngBuffer: ArrayBuffer | null = null
  try {
    pngBuffer = await buildOgImageResponse(content, displayName, birthDate)
    console.log('[reports/generate] OG image built, size:', pngBuffer.byteLength, 'bytes')
  } catch (err) {
    console.warn('[reports/generate] OG image generation failed — fallback:', err)
    usedFallback = true
  }

  if (pngBuffer && userId) {
    try {
      const tempId = crypto.randomUUID()
      const { publicUrl } = await uploadReportImage(userId, tempId, pngBuffer)
      reportId = await saveReportRecord(userId, publicUrl)
      reportUrl = publicUrl
      console.log('[reports/generate] saved to storage:', reportUrl)
    } catch (err) {
      console.error('[reports/generate] storage save failed (non-fatal):', err)
      usedFallback = true
    }
  } else if (!pngBuffer) {
    usedFallback = true
    if (userId) {
      try {
        reportId = await saveReportRecord(userId, '')
      } catch (err) {
        console.error('[reports/generate] report record save failed (non-fatal):', err)
      }
    }
  }

  const responseBody: GenerateReportResponse = {
    success: true,
    reportId,
    reportUrl,
    content,
    fallback: usedFallback,
  }

  console.log('[reports/generate] response:', {
    success: responseBody.success,
    reportId: responseBody.reportId,
    reportUrl: responseBody.reportUrl ? responseBody.reportUrl.slice(0, 60) + '…' : undefined,
    fallback: responseBody.fallback,
    contentKeys: responseBody.content ? Object.keys(responseBody.content) : [],
  })

  return NextResponse.json<GenerateReportResponse>(responseBody)
}
