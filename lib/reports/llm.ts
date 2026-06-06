import OpenAI from 'openai'
import {
  resolveIntegratedReportSystemPrompt,
  buildIntegratedReportUserPrompt,
} from '@/lib/prompts/integrated-report'
import { OBSERVATION_AXIS_IDS } from '@/lib/constitution/observation-axes'
import type { FourLightSystem, ReportContent } from './schemas'

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

    return assembleReportContent(parsed, input)
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

/** 4体系ラベル（蟹座・リーダーとなるゾウ等）。LLMには生成させず入力から注入する。 */
function buildSystemLabels(input: LLMReportInput): Record<FourLightSystem, string> {
  return {
    zodiac: input.zodiacSign,
    animal: input.animalCharacter,
    sixStar: input.sixStar,
    mbti: input.mbtiType,
  }
}

const FOUR_LIGHT_SYSTEMS: readonly FourLightSystem[] = [
  'zodiac',
  'animal',
  'sixStar',
  'mbti',
]

/**
 * LLM応答（four_lights: {system,reading}[] / integration: {axisKey,manifestation}[]）を
 * 検証し、4体系ラベルを注入して ReportContent へ組み立てる。
 * 構造不正・体系/軸の欠落があれば throw（route 側でリトライ）。
 */
function assembleReportContent(
  parsed: unknown,
  input: LLMReportInput,
): ReportContent {
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Unexpected LLM response: not an object')
  }
  const obj = parsed as Record<string, unknown>

  const catchphrase = obj.catchphrase
  const core = obj.core
  const relational_hint = obj.relational_hint
  const closing = obj.closing
  if (
    typeof catchphrase !== 'string' ||
    typeof core !== 'string' ||
    core.trim().length === 0 ||
    typeof relational_hint !== 'string' ||
    typeof closing !== 'string'
  ) {
    throw new Error('Unexpected LLM response: missing text fields')
  }

  // four_lights: 4体系すべてが揃うことを検証し、ラベルを注入
  const labels = buildSystemLabels(input)
  const rawLights = obj.four_lights
  if (!Array.isArray(rawLights)) {
    throw new Error('Unexpected LLM response: four_lights is not an array')
  }
  const readingBySystem = new Map<string, string>()
  for (const item of rawLights) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as Record<string, unknown>).system === 'string' &&
      typeof (item as Record<string, unknown>).reading === 'string'
    ) {
      const r = item as { system: string; reading: string }
      readingBySystem.set(r.system, r.reading)
    }
  }
  const four_lights = FOUR_LIGHT_SYSTEMS.map((system) => {
    const reading = readingBySystem.get(system)
    if (!reading) {
      throw new Error(`Unexpected LLM response: four_lights missing ${system}`)
    }
    return { system, label: labels[system], reading }
  })

  // integration: 5観察軸すべてが揃うことを検証
  const rawAxes = obj.integration
  if (!Array.isArray(rawAxes)) {
    throw new Error('Unexpected LLM response: integration is not an array')
  }
  const manifestationByAxis = new Map<string, string>()
  for (const item of rawAxes) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as Record<string, unknown>).axisKey === 'string' &&
      typeof (item as Record<string, unknown>).manifestation === 'string'
    ) {
      const a = item as { axisKey: string; manifestation: string }
      manifestationByAxis.set(a.axisKey, a.manifestation)
    }
  }
  const integration = OBSERVATION_AXIS_IDS.map((axisKey) => {
    const manifestation = manifestationByAxis.get(axisKey)
    if (!manifestation) {
      throw new Error(`Unexpected LLM response: integration missing ${axisKey}`)
    }
    return { axisKey, manifestation }
  })

  return { catchphrase, four_lights, integration, core, relational_hint, closing }
}
