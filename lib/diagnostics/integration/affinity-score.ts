// 構造的親和スコア: Trunks → 5 観察軸スコア [0,1] の決定論的導出
//
// 設計根拠:
//   - lib/constitution/axis-affinity-matrix.ts (順序重み行列)
//   - docs/output/decisions/20260602_harvest親和行列_根拠表.md
//
// 導出フロー（3段）:
//   1. accumulate — 各 Trunk 値の順序重みを軸ごとに合算
//   2. normalize  — 軸ごとの理論的 min/max で [0,1] 正規化（ユーザー間分散を確保）
//   3. profile    — 軸間順位差は 1+2 で自然に生じるため別処理は行わない（Spread Before Profile）

import {
  OBSERVATION_AXIS_IDS,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import {
  KEIRSEY_AFFINITY,
  ANIMAL_STYLE_AFFINITY,
  ZODIAC_ELEMENT_AFFINITY,
  ROKUSEI_POLARITY_AFFINITY,
  PHASE_AFFINITY,
  type AxisWeights,
} from '@/lib/constitution/axis-affinity-matrix'
import type { FourSystemTrunks } from './types'

// ============================================================================
// 寄与する重み行（phase は指定時のみ）
// ============================================================================

function contributingRows(trunks: FourSystemTrunks): AxisWeights[] {
  const rows: AxisWeights[] = [
    KEIRSEY_AFFINITY[trunks.keirsey],
    ANIMAL_STYLE_AFFINITY[trunks.animalStyle],
    ZODIAC_ELEMENT_AFFINITY[trunks.zodiacElement],
    ROKUSEI_POLARITY_AFFINITY[trunks.rokuseiPolarity],
  ]
  if (trunks.phase) rows.push(PHASE_AFFINITY[trunks.phase])
  return rows
}

// ============================================================================
// 軸別の理論的 min/max（寄与する各次元の per-axis min/max を合算）
//
// phase の有無で次元集合が変わるため 2 系列を事前計算してメモ化する。
// ============================================================================

interface AxisBound {
  min: number
  max: number
}

const BASE_DIMENSIONS: Record<string, AxisWeights>[] = [
  KEIRSEY_AFFINITY,
  ANIMAL_STYLE_AFFINITY,
  ZODIAC_ELEMENT_AFFINITY,
  ROKUSEI_POLARITY_AFFINITY,
]

function computeBounds(
  dimensions: Record<string, AxisWeights>[],
): Record<ObservationAxisId, AxisBound> {
  const bounds = {} as Record<ObservationAxisId, AxisBound>
  for (const axis of OBSERVATION_AXIS_IDS) {
    let min = 0
    let max = 0
    for (const dim of dimensions) {
      const values = Object.values(dim).map((row) => row[axis])
      min += Math.min(...values)
      max += Math.max(...values)
    }
    bounds[axis] = { min, max }
  }
  return bounds
}

const BOUNDS_WITHOUT_PHASE = computeBounds(BASE_DIMENSIONS)
const BOUNDS_WITH_PHASE = computeBounds([...BASE_DIMENSIONS, PHASE_AFFINITY])

// ============================================================================
// 主関数: Trunks → 5 軸スコア [0,1]
// ============================================================================

export function computeAxisScores(
  trunks: FourSystemTrunks,
): Record<ObservationAxisId, number> {
  const rows = contributingRows(trunks)
  const bounds = trunks.phase ? BOUNDS_WITH_PHASE : BOUNDS_WITHOUT_PHASE

  const scores = {} as Record<ObservationAxisId, number>
  for (const axis of OBSERVATION_AXIS_IDS) {
    const raw = rows.reduce((sum, row) => sum + row[axis], 0)
    const { min, max } = bounds[axis]
    const structural = max > min ? (raw - min) / (max - min) : 0.5

    // v3 拡張点: score = α·structural + (1−α)·embedding。
    // 現フェーズは embedding 未使用（α=1 相当）。OpenAI embedding 導入時に
    // ここで computeEmbeddingAffinity(trunks, axis) を blend する。
    scores[axis] = structural
  }
  return scores
}

// テスト・可観測性用に bounds を公開
export function getAxisBounds(includePhase: boolean): Record<ObservationAxisId, AxisBound> {
  return includePhase ? BOUNDS_WITH_PHASE : BOUNDS_WITHOUT_PHASE
}
