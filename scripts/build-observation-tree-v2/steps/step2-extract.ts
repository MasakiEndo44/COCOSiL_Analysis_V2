// Step 2: 本文 Markdown → 構造化 JSON 抽出 (v2)
//
// v1 との差分:
//   - LoadedContext (twigs vocab block / α / phase modulator / banned words) を
//     プロンプトに注入
//   - DRY_RUN モードでは AI Gateway を呼ばずモック JSON を返す
//
// AI Gateway 経由のモデル指定は string prefix で。Vercel AI Gateway がデフォルト解決する。
// 直接 @ai-sdk/anthropic を import するのは NG。

import fs from 'node:fs/promises'
import path from 'node:path'
import { generateObject } from 'ai'
import {
  ObservationTreeDataSchema,
  type ObservationTreeData,
  type SystemId,
} from '@/lib/constitution/observation-tree-schema'
import {
  OBSERVATION_AXES,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import type { LoadedContext } from './step1-load'
import { isDryRun } from '../env'
import { buildMockTree } from './dry-run-mocks'

// 推奨デフォルト: Free tier で完走可能な Haiku 4.5
export const EXTRACT_MODEL =
  process.env.EXTRACT_MODEL ?? 'anthropic/claude-haiku-4-5'

const SYSTEM_LABEL_JA: Record<SystemId, string> = {
  zodiac: '12星座',
  animal: '動物性格診断',
  rokusei: '六星占術',
  mbti: 'MBTI',
}

export type Step2Input = {
  system: SystemId
  axis: ObservationAxisId
  context: LoadedContext
  retryHints?: string
  generatedAt?: string
  promptDir?: string
}

export type Step2Output = {
  data: ObservationTreeData
  raw: string
  prompt: string
}

export async function extractObservationTree(
  input: Step2Input,
): Promise<Step2Output> {
  const prompt = await buildExtractPrompt(input)

  if (isDryRun()) {
    const mock = buildMockTree(input.system, input.axis)
    return { data: mock, raw: JSON.stringify(mock, null, 2), prompt }
  }

  const result = await generateObject({
    model: EXTRACT_MODEL,
    schema: ObservationTreeDataSchema,
    schemaName: 'submit_observation_tree',
    schemaDescription:
      '観察軸ツリーデータ (カテゴリ毎の特徴語・vector・confidence・primary_sources)',
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
    .replaceAll('{{markdown_input}}', input.context.markdownInput)
    .replaceAll('{{system_id}}', input.system)
    .replaceAll('{{system_name_ja}}', SYSTEM_LABEL_JA[input.system])
    .replaceAll('{{axis_id}}', axis.id)
    .replaceAll('{{axis_label_ja}}', axis.label_ja)
    .replaceAll('{{axis_definition}}', axis.definition)
    .replaceAll(
      '{{observation_keywords}}',
      axis.observation_keywords.map((kw) => `\`${kw}\``).join(' / '),
    )
    .replaceAll('{{twig_vocab_block}}', input.context.twigVocabBlock)
    .replaceAll('{{alpha_block}}', input.context.alphaBlock)
    .replaceAll('{{phase_modulator_block}}', input.context.phaseModulatorBlock)
    .replaceAll('{{banned_words_block}}', input.context.bannedWordsBlock)
    .replaceAll('{{generated_at}}', generatedAt)
    .replaceAll('{{retry_hints}}', input.retryHints ?? '（初回試行）')
}
