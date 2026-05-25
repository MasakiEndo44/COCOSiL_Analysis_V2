import { NextResponse } from 'next/server'
import { ImageResponse } from 'next/og'
import { GenerateReportInputSchema } from '@/lib/reports/schemas'
import { generateReportContent, LlmTimeoutError, LlmUnavailableError } from '@/lib/reports/llm'
import { ReportOGImage } from '@/lib/reports/og-image'
import { buildMarkdownFallback } from '@/lib/reports/markdown-fallback'
import { uploadReportImage, saveReportRecord } from '@/lib/reports/storage'
import type {
  GenerateReportResponse,
  GenerateReportErrorResponse,
} from '@/lib/reports/types'

const OG_WIDTH = 1024
const OG_HEIGHT = 1792

/**
 * POST /api/reports/generate
 *
 * リクエストボディ: GenerateReportInput
 *
 * レスポンス:
 *   200: GenerateReportResponse — storageUrl（PNG）または markdownFallback（HTML）
 *   400: バリデーションエラー
 *   503: LLM タイムアウト / 障害（retryable: true）
 *   500: 予期しないエラー
 */
export async function POST(request: Request) {
  // 1. Zod バリデーション
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<GenerateReportErrorResponse>(
      { success: false, error: 'リクエストの形式が正しくありません', retryable: false },
      { status: 400 },
    )
  }

  const parsed = GenerateReportInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<GenerateReportErrorResponse>(
      {
        success: false,
        error: '入力データが不足しています。診断を完了してからお試しください',
        retryable: false,
      },
      { status: 400 },
    )
  }

  const input = parsed.data
  const diagnosisCtx = {
    zodiacSign: input.zodiacSign,
    animalType: input.animalType,
    animalCharacter: input.animalCharacter ?? null,
    sixStar: input.sixStar,
    mbtiType: input.mbtiType ?? null,
  }

  // 2. LLM でレポートコンテンツ生成
  let content
  try {
    content = await generateReportContent(diagnosisCtx)
  } catch (err) {
    if (err instanceof LlmTimeoutError || err instanceof LlmUnavailableError) {
      return NextResponse.json<GenerateReportErrorResponse>(
        { success: false, error: err.message, retryable: true },
        { status: 503 },
      )
    }
    console.error('[reports/generate] unexpected llm error:', err)
    return NextResponse.json<GenerateReportErrorResponse>(
      {
        success: false,
        error: '少し時間がかかっています。もう一度試してみてください',
        retryable: true,
      },
      { status: 503 },
    )
  }

  // 3. Vercel OG で PNG 生成 → Storage アップロード
  let storageUrl: string | null = null
  let format: 'image' | 'markdown' = 'markdown'
  const reportId = crypto.randomUUID()

  try {
    const imageResponse = new ImageResponse(
      ReportOGImage({ content }),
      { width: OG_WIDTH, height: OG_HEIGHT },
    )
    const buffer = await imageResponse.arrayBuffer()

    // Storage アップロード（失敗してもリクエスト自体は成功）
    storageUrl = await uploadReportImage(input.userId ?? null, reportId, buffer)
    if (storageUrl) {
      format = 'image'
    }
  } catch (err) {
    // OG 生成失敗 → Markdown フォールバックへ。ユーザーに悟らせない
    console.error('[reports/generate] og image generation failed, using markdown fallback:', err)
  }

  // 4. DB にレポートレコードを保存（バックグラウンド — 失敗しても応答には影響しない）
  void saveReportRecord({
    userId: input.userId ?? null,
    diagnosisId: input.diagnosisId,
    mbtiResultId: input.mbtiResultId,
    content: content as object,
    storageUrl,
    status: 'completed',
  }).catch((err) => {
    console.error('[reports/generate] db save error (non-fatal):', err)
  })

  // 5. レスポンス返却
  const markdownFallback = buildMarkdownFallback(content)

  return NextResponse.json<GenerateReportResponse>({
    success: true,
    reportId,
    storageUrl,
    markdownFallback,
    format,
  })
}
