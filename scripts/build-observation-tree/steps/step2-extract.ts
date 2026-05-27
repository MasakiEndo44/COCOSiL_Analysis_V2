// Step 2: 本文 Markdown → 構造化 JSON 抽出
// AI SDK v6 の generateObject + Vercel AI Gateway 経由で Claude Sonnet 4.6 を呼び出す。
// モデル指定は文字列 prefix（'anthropic/claude-sonnet-4-6'）で AI Gateway がデフォルト解決する。

import fs from 'node:fs/promises'
import path from 'node:path'
import { generateObject } from 'ai'
import {
  ObservationTreeDataSchema,
  type ObservationTreeData,
} from '@/lib/constitution/observation-tree-schema'
import {
  OBSERVATION_AXES,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import type { SystemId } from '@/lib/constitution/observation-tree-schema'

// デフォルトは Sonnet 4.6 (品質重視・設計判断)。Free tier では Top-up 必要のため
// 環境変数 EXTRACT_MODEL で Haiku 4.5 等にダウングレード可能。
export const EXTRACT_MODEL = process.env.EXTRACT_MODEL ?? 'anthropic/claude-sonnet-4-6'

const SYSTEM_LABEL_JA: Record<SystemId, string> = {
  zodiac: '12星座',
  animal: '動物性格診断',
  rokusei: '六星占術',
  mbti: 'MBTI',
}

export type Step2Input = {
  system: SystemId
  axis: ObservationAxisId
  markdownInput: string
  retryHints?: string
  generatedAt?: string
  promptDir?: string
}

export type Step2Output = {
  data: ObservationTreeData
  raw: string
  prompt: string
}

export async function extractObservationTree(input: Step2Input): Promise<Step2Output> {
  const prompt = await buildExtractPrompt(input)

  const result = await generateObject({
    model: EXTRACT_MODEL,
    schema: ObservationTreeDataSchema,
    schemaName: 'submit_observation_tree',
    schemaDescription:
      '観察軸ツリーデータ（カテゴリ毎の特徴語・vector・confidence・primary_sources）',
    prompt,
    temperature: 0.3,
  })

  return {
    data: result.object,
    raw: JSON.stringify(result.object, null, 2),
    prompt,
  }
}

async function buildExtractPrompt(input: Step2Input): Promise<string> {
  const promptDir = input.promptDir ?? path.resolve(__dirname, '..', 'prompts')
  const template = await fs.readFile(path.join(promptDir, 'extract.md'), 'utf-8')
  const axis = OBSERVATION_AXES[input.axis]
  const generatedAt = input.generatedAt ?? new Date().toISOString().slice(0, 10)

  return template
    .replaceAll('{{markdown_input}}', input.markdownInput)
    .replaceAll('{{system_id}}', input.system)
    .replaceAll('{{system_name_ja}}', SYSTEM_LABEL_JA[input.system])
    .replaceAll('{{axis_id}}', axis.id)
    .replaceAll('{{axis_label_ja}}', axis.label_ja)
    .replaceAll('{{axis_definition}}', axis.definition)
    .replaceAll(
      '{{observation_keywords}}',
      axis.observation_keywords.map((kw: string) => `\`${kw}\``).join(' / '),
    )
    .replaceAll('{{categories_list_ja}}', describeCategories(input.system))
    .replaceAll('{{generated_at}}', generatedAt)
    .replaceAll('{{retry_hints}}', input.retryHints ?? '（初回試行）')
}

function describeCategories(system: SystemId): string {
  switch (system) {
    case 'zodiac':
      return '牡羊座 / 牡牛座 / 双子座 / 蟹座 / 獅子座 / 乙女座 / 天秤座 / 蠍座 / 射手座 / 山羊座 / 水瓶座 / 魚座（計12カテゴリ）'
    case 'animal':
      return '動物性格診断の60キャラクター（チーター・ペガサス・狼・羊 等、本文記載のラベルを採用）'
    case 'rokusei':
      return '土星人 / 金星人 / 火星人 / 天王星人 / 木星人 / 水星人（各±/霊合星含む、本文記載のラベルを採用）'
    case 'mbti':
      return '16タイプ（INTJ / INTP / ENTJ / ENTP / INFJ / INFP / ENFJ / ENFP / ISTJ / ISFJ / ESTJ / ESFJ / ISTP / ISFP / ESTP / ESFP）'
  }
}
