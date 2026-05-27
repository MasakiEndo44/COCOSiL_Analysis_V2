// Step 3: 決定論的 Schema 検証
// パイプライン全体の Empty Sources = Pipeline Fail 原則の最終防衛線。
// Step 2 の generateObject が内部で Zod を通すため成功ケースでは redundant だが、
// 生成失敗時の raw リカバリやリトライ後 JSON の追加検証で必要。

import { ZodError } from 'zod/v4'
import {
  ObservationTreeDataSchema,
  type ObservationTreeData,
} from '@/lib/constitution/observation-tree-schema'

export type Step3Result =
  | { ok: true; data: ObservationTreeData }
  | { ok: false; errors: string[] }

export function validateObservationTree(input: unknown): Step3Result {
  const parsed = ObservationTreeDataSchema.safeParse(input)
  if (parsed.success) {
    return { ok: true, data: parsed.data }
  }
  return { ok: false, errors: formatZodErrors(parsed.error) }
}

function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '<root>'
    return `[${path}] ${issue.message}`
  })
}

// Step 4 の retry_hints / Step 3 violations を Step 2 プロンプトに再注入する整形ロジック。
// LLM への指示は冗長を避けて箇条書きで提示。
export function formatRetryHints(params: {
  step3Errors?: string[]
  step4Violations?: Array<{ category: string; type: string; detail: string }>
  step4Hints?: string
}): string {
  const blocks: string[] = []

  if (params.step3Errors && params.step3Errors.length > 0) {
    const lines = params.step3Errors.map((e) => `  - ${e}`).join('\n')
    blocks.push(`## Step 3 (Zod 検証) 失敗:\n${lines}`)
  }

  if (params.step4Violations && params.step4Violations.length > 0) {
    const lines = params.step4Violations
      .map((v) => `  - [${v.type}] (${v.category}) ${v.detail}`)
      .join('\n')
    blocks.push(`## Step 4 (Critique) 違反:\n${lines}`)
  }

  if (params.step4Hints && params.step4Hints.trim().length > 0) {
    blocks.push(`## 次回の必須修正:\n${params.step4Hints.trim()}`)
  }

  if (blocks.length === 0) return '（初回試行）'
  return blocks.join('\n\n')
}
