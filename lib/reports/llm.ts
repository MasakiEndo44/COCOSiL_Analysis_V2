import OpenAI from 'openai'
import {
  resolveIntegratedReportSystemPrompt,
  buildIntegratedReportUserPrompt,
} from '@/lib/prompts/integrated-report'
import type { ReportContent } from './schemas'

const TIMEOUT_MS = 30_000

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
  return new OpenAI({ apiKey })
}

export interface LLMReportInput {
  displayName: string | null
  zodiacSign: string
  animalCharacter: string
  sixStar: string
  mbtiType: string
  harvestMeta?: string
}

export async function generateReportContent(input: LLMReportInput): Promise<ReportContent> {
  const openai = getOpenAIClient()

  const hasName = !!(input.displayName && input.displayName !== 'あなた')
  const systemPrompt = resolveIntegratedReportSystemPrompt(hasName)

  const userMessage = buildIntegratedReportUserPrompt({
    displayName: input.displayName,
    zodiac: { label: input.zodiacSign },
    animal: { label: input.animalCharacter },
    sixStar: { label: input.sixStar },
    mbti: { label: input.mbtiType },
  })

  const harvestContext = input.harvestMeta
    ? `\n\n【4体系統合アルゴリズムによる観察メタ】\n${input.harvestMeta}`
    : ''

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage + harvestContext },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      },
      { signal: controller.signal },
    )

    clearTimeout(timer)

    const raw = response.choices[0]?.message?.content ?? ''
    const parsed: unknown = JSON.parse(raw)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('catchphrase' in parsed) ||
      !('integration' in parsed)
    ) {
      throw new Error('Unexpected LLM response structure')
    }

    return parsed as ReportContent
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}
