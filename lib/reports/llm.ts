import OpenAI from 'openai'
import {
  resolveIntegratedReportSystemPrompt,
  buildIntegratedReportUserPrompt,
} from '@/lib/prompts/integrated-report'
import { OBSERVATION_AXES } from '@/lib/constitution/observation-axes'
import type { ProfileCore } from '@/lib/diagnostics/integration'
import type {
  FourLightSystem,
  ReportContent,
  ReportStrength,
  ReportJohari,
  ReportDistribution,
} from './schemas'

const TIMEOUT_MS = 30_000

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
  return new OpenAI({ apiKey })
}

export interface LLMReportInput {
  displayName: string | null
  /** diagnostics 層が確定した決定論スコア核（Source of Truth）。LLM は再計算しない。 */
  profileCore: ProfileCore
  zodiacSign: string
  animalCharacter: string
  sixStar: string
  mbtiType: string
}

/** seed 文字列を OpenAI seed パラメータ用の非負整数へ決定論的に畳み込む。 */
function seedToInt(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export async function generateReportContent(
  input: LLMReportInput,
  attempt = 0,
): Promise<ReportContent> {
  const openai = getOpenAIClient()

  const hasName = !!(input.displayName && input.displayName !== 'あなた')
  const systemPrompt = resolveIntegratedReportSystemPrompt(hasName)

  const userMessage = buildIntegratedReportUserPrompt({
    displayName: input.displayName,
    profileCore: input.profileCore,
    zodiac: { label: input.zodiacSign },
    animal: { label: input.animalCharacter },
    sixStar: { label: input.sixStar },
    mbti: { label: input.mbtiType },
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        // Score Once, Narrate Freely: 数値は確定済み。語り口も temperature=0 + seed で固定し揺らぎを抑える。
        // 検証失敗時の再試行は seed を attempt 分ずらす（temperature=0 では同一 seed の再試行は同一結果になり無意味なため）。
        temperature: 0,
        seed: seedToInt(input.profileCore.seed) + attempt,
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

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Unexpected LLM response: not an object')
  }
  return value as Record<string, unknown>
}

/** parsed[key] を {anchor: string} の配列とみなし、anchor→string の Map にする。 */
function indexByAnchor(
  parsed: Record<string, unknown>,
  key: string,
  anchorKey: string,
  valueKey: string,
): Map<string, string> {
  const arr = parsed[key]
  if (!Array.isArray(arr)) {
    throw new Error(`Unexpected LLM response: ${key} is not an array`)
  }
  const map = new Map<string, string>()
  for (const item of arr) {
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>
      if (typeof o[anchorKey] === 'string' && typeof o[valueKey] === 'string') {
        map.set(o[anchorKey] as string, o[valueKey] as string)
      }
    }
  }
  return map
}

/**
 * LLM 応答（narration のみ）を検証し、ProfileCore の確定値を Source of Truth として
 * 合成し ReportContent を組み立てる。決定論アンカー（system / axis / 順序）に narration をキー付けし、
 * 欠落・構造不正があれば throw（route 側でリトライ）。
 */
function assembleReportContent(
  parsed: unknown,
  input: LLMReportInput,
): ReportContent {
  const obj = asObject(parsed)
  const core = input.profileCore

  // ---- four_lights: 4体系すべてが揃うことを検証し、ラベルを注入 ----
  const labels = buildSystemLabels(input)
  const readingBySystem = indexByAnchor(obj, 'four_lights', 'system', 'reading')
  const four_lights = FOUR_LIGHT_SYSTEMS.map((system) => {
    const reading = readingBySystem.get(system)
    if (!reading) throw new Error(`Unexpected LLM response: four_lights missing ${system}`)
    return { system, label: labels[system], reading }
  })

  // ---- strengths: ProfileCore の label を確定値とし、LLM の text を順序 zip ----
  const rawStrengths = obj.strengths
  if (!Array.isArray(rawStrengths) || rawStrengths.length < core.strengths.length) {
    throw new Error('Unexpected LLM response: strengths missing or too short')
  }
  const strengths: ReportStrength[] = core.strengths.map((label, i) => {
    const item = rawStrengths[i] as Record<string, unknown> | undefined
    const text = item && typeof item.text === 'string' ? item.text : ''
    if (!text.trim()) throw new Error(`Unexpected LLM response: strengths[${i}].text missing`)
    return { label, text }
  })

  // ---- weakness: trait/exit ともに ProfileCore 固定（LLM を介さない・完全決定論） ----
  const weakness = {
    trait: core.weakness.trait,
    exit: core.weakness.exit,
  }

  // ---- core: 統合像（AC-1） ----
  const coreText = obj.core
  if (typeof coreText !== 'string' || coreText.trim().length === 0) {
    throw new Error('Unexpected LLM response: core missing')
  }

  // ---- johari: ProfileCore の盲点（出自）を確定値とし、axis で narration を引く ----
  // 盲点は可変長で LLM が取りこぼしやすい。temperature=0 では再試行も同じ欠落になるため、
  // 欠落時は軸ラベル（label_ja・出自そのもの）へグレースフルフォールバックして決して hard-fail させない。
  const johariByAxis = indexByAnchor(obj, 'johari', 'axis', 'text')
  const johari: ReportJohari[] = core.johariBlindspots.map((b) => ({
    sourceAxis: b.sourceAxis,
    text: johariByAxis.get(b.sourceAxis)?.trim() || OBSERVATION_AXES[b.sourceAxis].label_ja,
  }))

  // ---- distribution: ProfileCore の数値・出自を確定値とし、axis で comment を引く ----
  const commentByAxis = indexByAnchor(obj, 'distribution', 'axis', 'comment')
  const distribution: ReportDistribution[] = core.distribution.map((d) => {
    const comment = commentByAxis.get(d.axis)
    if (!comment) throw new Error(`Unexpected LLM response: distribution missing ${d.axis}`)
    return { axis: d.axis, percentile: d.percentile, origin: d.origin, comment }
  })

  // ---- relational_hint / closing ----
  const relational_hint = obj.relational_hint
  const closing = obj.closing
  if (typeof relational_hint !== 'string' || typeof closing !== 'string') {
    throw new Error('Unexpected LLM response: missing relational_hint/closing')
  }

  return {
    catchphrase: core.characterLabel, // 命名は決定論。LLM 出力を使わない。
    four_lights,
    strengths,
    weakness,
    core: coreText,
    johari,
    distribution,
    relational_hint,
    closing,
  }
}
