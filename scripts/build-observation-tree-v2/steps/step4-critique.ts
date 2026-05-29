// Step 4: 5 問のリトマス試験紙 + 禁止語チェック + ホワイトリスト判定
//
// v2 では Critique を以下の 2 段で行う:
//   ① 決定論的: banned-words + twigs ホワイトリスト判定 (LLM 不要)
//   ② LLM: 設計中枢 5 問のリトマス試験紙 (Critique LLM)
//
// DRY_RUN 時は ② をスキップし、決定論層のみで PASS/FAIL を返す。

import fs from 'node:fs/promises'
import path from 'node:path'
import { generateObject } from 'ai'
import {
  CritiqueResultSchema,
  type CritiqueResult,
  type ObservationTreeData,
  type SystemId,
} from '@/lib/constitution/observation-tree-schema'
import {
  OBSERVATION_AXES,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import { BANNED_WORDS } from '@/lib/constitution/banned-words'
import type { LoadedContext } from './step1-load'
import { isDryRun } from '../env'

export const CRITIQUE_MODEL =
  process.env.CRITIQUE_MODEL ?? 'anthropic/claude-haiku-4-5'

const SYSTEM_LABEL_JA: Record<SystemId, string> = {
  zodiac: '12星座',
  animal: '動物性格診断',
  rokusei: '六星占術',
  mbti: 'MBTI',
}

export type Step4Input = {
  system: SystemId
  axis: ObservationAxisId
  context: LoadedContext
  generatedJson: ObservationTreeData
  promptDir?: string
}

export type Step4Output = {
  result: CritiqueResult
  prompt: string
  deterministicViolations: CritiqueResult['violations']
}

export async function critiqueObservationTree(
  input: Step4Input,
): Promise<Step4Output> {
  // ① 決定論層
  const deterministicViolations = runDeterministicChecks(input)

  // 決定論的に既に FAIL が確定したら、コスト節約のため LLM critique をスキップ
  if (deterministicViolations.length > 0) {
    return {
      result: {
        result: 'FAIL',
        violations: deterministicViolations,
        retry_hints:
          '禁止語/ホワイトリスト/3 値分散の決定論的チェックに違反。features を twigs 集合から選び直し、禁止語を排除すること。',
      },
      prompt: '(skipped — deterministic FAIL)',
      deterministicViolations,
    }
  }

  // ② LLM 層
  const prompt = await buildCritiquePrompt(input)

  if (isDryRun()) {
    return {
      result: { result: 'PASS', violations: [], retry_hints: '' },
      prompt,
      deterministicViolations: [],
    }
  }

  const response = await generateObject({
    model: CRITIQUE_MODEL,
    schema: CritiqueResultSchema,
    schemaName: 'submit_critique_result',
    schemaDescription:
      '敵対的批評の結果 (PASS/FAIL、violations、retry_hints)',
    prompt,
    temperature: 0.2,
  })

  return {
    result: response.object,
    prompt,
    deterministicViolations: [],
  }
}

// ============================================================================
// 決定論的チェック (LLM を使わない)
// ============================================================================

export function runDeterministicChecks(
  input: Step4Input,
): CritiqueResult['violations'] {
  const violations: CritiqueResult['violations'] = []
  const tree = input.generatedJson

  for (const cat of tree.categories) {
    for (const feature of cat.features) {
      // 禁止語チェック
      for (const banned of BANNED_WORDS) {
        if (feature.includes(banned)) {
          violations.push({
            category: cat.category_id,
            type: 'broken_japanese', // 該当する critique 違反種別
            detail: `feature "${feature}" に禁止語 "${banned}" が混入`,
          })
        }
      }
      // ホワイトリスト (twigs 集合) チェック
      if (input.context.twigTermSet.size > 0 && !input.context.twigTermSet.has(feature)) {
        violations.push({
          category: cat.category_id,
          type: 'info_loss_from_source',
          detail: `feature "${feature}" が twigs 集合に存在しない`,
        })
      }
    }
  }
  return violations
}

// ============================================================================
// LLM Critique プロンプト構築
// ============================================================================

async function buildCritiquePrompt(input: Step4Input): Promise<string> {
  const promptDir = input.promptDir ?? path.resolve(__dirname, '..', 'prompts')
  const template = await fs.readFile(path.join(promptDir, 'critique.md'), 'utf-8')
  const axis = OBSERVATION_AXES[input.axis]

  return template
    .replaceAll('{{system_id}}', input.system)
    .replaceAll('{{system_name_ja}}', SYSTEM_LABEL_JA[input.system])
    .replaceAll('{{axis_id}}', axis.id)
    .replaceAll('{{axis_label_ja}}', axis.label_ja)
    .replaceAll('{{axis_definition}}', axis.definition)
    .replaceAll(
      '{{observation_keywords}}',
      axis.observation_keywords.map((kw) => `\`${kw}\``).join(' / '),
    )
    .replaceAll('{{markdown_input}}', input.context.markdownInput)
    .replaceAll('{{json_input}}', JSON.stringify(input.generatedJson, null, 2))
    .replaceAll('{{banned_words_block}}', input.context.bannedWordsBlock)
    .replaceAll('{{twig_vocab_block}}', input.context.twigVocabBlock)
}
