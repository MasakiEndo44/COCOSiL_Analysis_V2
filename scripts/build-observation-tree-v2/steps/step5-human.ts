// Step 5: 人間サンプリング用の出力書き出し
//
// Step 4 PASS 後の JSON を outputs/ に保存し、人間レビューしやすいよう
// メタ情報 (生成日時 / 体系・軸 / category 数 / vector 分布) を併記する。

import fs from 'node:fs/promises'
import path from 'node:path'
import type { ObservationTreeData } from '@/lib/constitution/observation-tree-schema'

export interface Step5Input {
  data: ObservationTreeData
  system: string
  axis: string
  outputsDir: string
}

export interface Step5Output {
  outputPath: string
  summary: string
}

export async function writeForHumanReview(input: Step5Input): Promise<Step5Output> {
  await fs.mkdir(input.outputsDir, { recursive: true })
  const outputPath = path.join(input.outputsDir, `${input.system}-${input.axis}.json`)
  await fs.writeFile(
    outputPath,
    JSON.stringify(input.data, null, 2) + '\n',
    'utf-8',
  )

  const vectorCounts: Record<string, number> = {}
  for (const c of input.data.categories) {
    vectorCounts[c.vector] = (vectorCounts[c.vector] ?? 0) + 1
  }
  const conf = input.data.categories.map((c) => c.confidence)
  const mean = conf.reduce((a, b) => a + b, 0) / conf.length
  const variance =
    conf.reduce((s, v) => s + (v - mean) ** 2, 0) / conf.length
  const std = Math.sqrt(variance)

  const summary = [
    `system=${input.system} axis=${input.axis}`,
    `categories=${input.data.categories.length}`,
    `vectors=${JSON.stringify(vectorCounts)}`,
    `confidence_mean=${mean.toFixed(3)} std=${std.toFixed(3)}`,
  ].join(' | ')

  return { outputPath, summary }
}
