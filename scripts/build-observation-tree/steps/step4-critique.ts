// Step 4: 敵対的批評器（Critique LLM）
// Step 2 とは「別の API コール」で同モデルを叩く。生成と批評の分離が原則。
// AI Gateway 経由で別のモデルにフォールバックすることも将来的に可能。

import fs from 'node:fs/promises'
import path from 'node:path'
import { generateObject } from 'ai'
import {
  CritiqueResultSchema,
  type CritiqueResult,
  type ObservationTreeData,
} from '@/lib/constitution/observation-tree-schema'
import {
  OBSERVATION_AXES,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import type { SystemId } from '@/lib/constitution/observation-tree-schema'

export const CRITIQUE_MODEL = 'anthropic/claude-sonnet-4-6'

const SYSTEM_LABEL_JA: Record<SystemId, string> = {
  zodiac: '12星座',
  animal: '動物性格診断',
  rokusei: '六星占術',
  mbti: 'MBTI',
}

export type Step4Input = {
  system: SystemId
  axis: ObservationAxisId
  markdownInput: string
  generatedJson: ObservationTreeData
  promptDir?: string
}

export type Step4Output = {
  result: CritiqueResult
  prompt: string
}

export async function critiqueObservationTree(input: Step4Input): Promise<Step4Output> {
  const prompt = await buildCritiquePrompt(input)

  const response = await generateObject({
    model: CRITIQUE_MODEL,
    schema: CritiqueResultSchema,
    schemaName: 'submit_critique_result',
    schemaDescription: '敵対的批評の結果（PASS/FAIL、violations、retry_hints）',
    prompt,
    temperature: 0.2,
  })

  return { result: response.object, prompt }
}

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
      axis.observation_keywords.map((kw: string) => `\`${kw}\``).join(' / '),
    )
    .replaceAll('{{markdown_input}}', input.markdownInput)
    .replaceAll('{{json_input}}', JSON.stringify(input.generatedJson, null, 2))
}
