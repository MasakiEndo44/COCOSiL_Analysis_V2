// Harvest: 5 観察軸スコア + 識メタ層の純関数生成
//
// 設計根拠:
//   - docs/output/goals/f3-keyword-tree-integration.md (Tree of 4, Harvest 1.)
//   - lib/constitution/observation-axes.ts (5 軸 + META_LAYER)
//
// 設計原則:
//   ③ Harvest, Don't Hallucinate — LLM を呼ばず純関数で導出。
//      再現性 (B-3 防止) と禁止語混入ゼロを構造的に保証。

import {
  OBSERVATION_AXES,
  OBSERVATION_AXIS_IDS,
} from '@/lib/constitution/observation-axes'
import { resolveFourSystemTrunks } from './trunks'
import { computeLayer1Distribution } from './probability'
import { computeAxisAffinity } from './hybrid-distance'
import type {
  FourSystemTrunks,
  HarvestResult,
  ObservationAxisId,
  UserDiagnosticInput,
} from './types'

// ============================================================================
// 軸別スコア集約: Layer 1→2 と Layer 2→3 の hybrid 平均を [0, 1] にクリップ
// ============================================================================

function aggregateAxisScore(
  trunks: FourSystemTrunks,
  axis: ObservationAxisId,
): number {
  const aff1 = computeAxisAffinity(trunks, axis, 'layer1')
  const aff2 = computeAxisAffinity(trunks, axis, 'layer2')
  // Layer 3 は phase 指定時のみ意味を持つ
  const aff3 = trunks.phase
    ? computeAxisAffinity(trunks, axis, 'layer3')
    : null

  const values = aff3 ? [aff1.hybrid, aff2.hybrid, aff3.hybrid] : [aff1.hybrid, aff2.hybrid]
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return Math.max(0, Math.min(1, avg))
}

// ============================================================================
// 識 (META_LAYER): 5 軸スコアから自然な日本語要約を branching で生成
//
// 「文言テンプレート禁止」: 固定文に値を埋めるのではなく、
//                          軸スコアの分布に応じて文の構造そのものを分岐させる。
// ============================================================================

function generateMeta(scores: Record<ObservationAxisId, number>): string {
  const ranked = [...OBSERVATION_AXIS_IDS].sort(
    (a, b) => scores[b] - scores[a],
  )
  const top = ranked[0]
  const second = ranked[1]
  const bottom = ranked[ranked.length - 1]
  const topScore = scores[top]
  const bottomScore = scores[bottom]
  const spread = topScore - bottomScore

  const topLabel = OBSERVATION_AXES[top].label_ja
  const secondLabel = OBSERVATION_AXES[second].label_ja
  const bottomLabel = OBSERVATION_AXES[bottom].label_ja

  // 第 1 文: トップ軸の強度で文型を分岐
  let lead: string
  if (topScore >= 0.6) {
    lead = `${topLabel}が際立って前面に出る輪郭`
  } else if (topScore >= 0.45) {
    lead = `${topLabel}を中心に組み上がる輪郭`
  } else if (spread < 0.05) {
    lead = `5 軸がほぼ均衡し平坦に広がる輪郭`
  } else {
    lead = `${topLabel}がわずかに優位な穏やかな輪郭`
  }

  // 第 2 文: 二位の軸と最下位の軸の関係で文型を分岐
  let supplement: string
  if (bottomScore < 0.2) {
    supplement = `${bottomLabel}は背景に退き、${secondLabel}が補助線として支える構成`
  } else if (spread < 0.1) {
    supplement = `${secondLabel}が並走し、各軸が独立性を保ったまま同居する構成`
  } else {
    supplement = `${secondLabel}が次点で寄り添い、${bottomLabel}が静かな余韻を残す構成`
  }

  return `${lead}。${supplement}。`
}

// ============================================================================
// 主関数: ユーザー入力 → HarvestResult
// ============================================================================

export function harvest(input: UserDiagnosticInput): HarvestResult {
  const trunks = resolveFourSystemTrunks(input)
  const layer1Distribution = computeLayer1Distribution(trunks, input.phase)

  const axisScores = {} as Record<ObservationAxisId, number>
  for (const axis of OBSERVATION_AXIS_IDS) {
    axisScores[axis] = aggregateAxisScore(trunks, axis)
  }

  const meta = generateMeta(axisScores)
  return { axisScores, meta, trunks, layer1Distribution }
}
