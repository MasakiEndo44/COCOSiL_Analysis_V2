// Step 3: Zod schema 検証 (二重防御)
//
// AI SDK の generateObject は responseFormat=json_schema で生成段で type を強制するが、
// 値域 (confidence ≥ 0.3 / features ≤ 20 chars / 禁止語など) は AI が破る可能性がある。
// ここで Zod を通して明示的に validate し、失敗時は retryHints として LLM に返す。

import {
  ObservationTreeDataSchema,
  type ObservationTreeData,
} from '@/lib/constitution/observation-tree-schema'

export type Step3Result =
  | { ok: true; data: ObservationTreeData }
  | { ok: false; errors: string[] }

export function validateObservationTree(data: unknown): Step3Result {
  const parsed = ObservationTreeDataSchema.safeParse(data)
  if (parsed.success) {
    return { ok: true, data: parsed.data }
  }
  return {
    ok: false,
    errors: parsed.error.issues.map(
      (i) => `${i.path.join('.') || '(root)'}: ${i.message}`,
    ),
  }
}

export function formatRetryHints(args: {
  step3Errors?: string[]
  step4Violations?: ReadonlyArray<{ category: string; type: string; detail: string }>
  step4Hints?: string
}): string {
  const lines: string[] = []
  if (args.step3Errors?.length) {
    lines.push('## Step 3 Zod 検証エラー (修正必須)')
    for (const e of args.step3Errors) lines.push(`- ${e}`)
    lines.push('')
  }
  if (args.step4Violations?.length) {
    lines.push('## Step 4 Critique violations (修正必須)')
    for (const v of args.step4Violations) {
      lines.push(`- [${v.type}] ${v.category}: ${v.detail}`)
    }
    lines.push('')
  }
  if (args.step4Hints) {
    lines.push('## Step 4 retry_hints')
    lines.push(args.step4Hints)
  }
  return lines.join('\n')
}
