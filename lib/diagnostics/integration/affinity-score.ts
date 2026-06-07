// 構造的親和スコア: Trunks → 5 観察軸スコア [0,1] の決定論的導出
//
// 設計根拠:
//   - lib/constitution/axis-affinity-matrix.ts (順序重み行列)
//   - docs/output/decisions/20260602_harvest親和行列_根拠表.md
//   - docs/output/goals/f3-report-determinism-and-self-anchor.md (重み係数の明示・MBTI寄り再調整)
//   - docs/discussions/20260604_議論ログ_F3レポート揺らぎ改善.md
//
// 導出フロー（3段）:
//   1. accumulate — 各 Trunk 値の順序重みを「体系別寄与重み」で加重合算
//   2. normalize  — 軸ごとの加重理論 min/max で [0,1] 正規化（ユーザー間分散を確保）
//   3. profile    — 軸間順位差は 1+2 で自然に生じるため別処理は行わない（Spread Before Profile）
//
// 体系別寄与重み（SYSTEM_WEIGHTS）:
//   2026-06-02 FB「算命学:MBTI≈1:1 を MBTI 寄りへ再調整」を実装。等価合算（実質 1:1:1:1）を
//   廃し、MBTI(keirsey) を主軸として重く取る。正規化が相対重みのみを使うため、値は比率として
//   意味を持つ（keirsey:他 = 2:1）。最終値は Gate 2（えんまさ）承認対象。

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
// 体系別寄与重み（MBTI 寄り）— Gate 2 承認対象
// ============================================================================

export const SYSTEM_WEIGHTS = {
  keirsey: 0.4, // MBTI: 主軸（整合性の核）
  animalStyle: 0.2, // 動物60
  zodiacElement: 0.2, // 星座
  rokuseiPolarity: 0.2, // 六星
  phase: 0.2, // 時期フェーズ（入力時のみ寄与）
} as const

export type SystemWeightKey = keyof typeof SYSTEM_WEIGHTS

interface WeightedDimension {
  weight: number
  map: Record<string, AxisWeights>
}

// ============================================================================
// 寄与する加重次元（phase は指定時のみ）
// ============================================================================

const BASE_WEIGHTED_DIMENSIONS: WeightedDimension[] = [
  { weight: SYSTEM_WEIGHTS.keirsey, map: KEIRSEY_AFFINITY },
  { weight: SYSTEM_WEIGHTS.animalStyle, map: ANIMAL_STYLE_AFFINITY },
  { weight: SYSTEM_WEIGHTS.zodiacElement, map: ZODIAC_ELEMENT_AFFINITY },
  { weight: SYSTEM_WEIGHTS.rokuseiPolarity, map: ROKUSEI_POLARITY_AFFINITY },
]

const PHASE_WEIGHTED_DIMENSION: WeightedDimension = {
  weight: SYSTEM_WEIGHTS.phase,
  map: PHASE_AFFINITY,
}

function contributingWeightedRows(
  trunks: FourSystemTrunks,
): { weight: number; row: AxisWeights }[] {
  const rows: { weight: number; row: AxisWeights }[] = [
    { weight: SYSTEM_WEIGHTS.keirsey, row: KEIRSEY_AFFINITY[trunks.keirsey] },
    { weight: SYSTEM_WEIGHTS.animalStyle, row: ANIMAL_STYLE_AFFINITY[trunks.animalStyle] },
    { weight: SYSTEM_WEIGHTS.zodiacElement, row: ZODIAC_ELEMENT_AFFINITY[trunks.zodiacElement] },
    { weight: SYSTEM_WEIGHTS.rokuseiPolarity, row: ROKUSEI_POLARITY_AFFINITY[trunks.rokuseiPolarity] },
  ]
  if (trunks.phase) {
    rows.push({ weight: SYSTEM_WEIGHTS.phase, row: PHASE_AFFINITY[trunks.phase] })
  }
  return rows
}

// ============================================================================
// 軸別の加重理論 min/max（寄与する各次元の per-axis min/max を加重合算）
//
// phase の有無で次元集合が変わるため 2 系列を事前計算してメモ化する。
// ============================================================================

interface AxisBound {
  min: number
  max: number
}

function computeBounds(
  dimensions: WeightedDimension[],
): Record<ObservationAxisId, AxisBound> {
  const bounds = {} as Record<ObservationAxisId, AxisBound>
  for (const axis of OBSERVATION_AXIS_IDS) {
    let min = 0
    let max = 0
    for (const { weight, map } of dimensions) {
      const values = Object.values(map).map((row) => row[axis])
      min += weight * Math.min(...values)
      max += weight * Math.max(...values)
    }
    bounds[axis] = { min, max }
  }
  return bounds
}

const BOUNDS_WITHOUT_PHASE = computeBounds(BASE_WEIGHTED_DIMENSIONS)
const BOUNDS_WITH_PHASE = computeBounds([
  ...BASE_WEIGHTED_DIMENSIONS,
  PHASE_WEIGHTED_DIMENSION,
])

// ============================================================================
// 主関数: Trunks → 5 軸スコア [0,1]
// ============================================================================

export function computeAxisScores(
  trunks: FourSystemTrunks,
): Record<ObservationAxisId, number> {
  const rows = contributingWeightedRows(trunks)
  const bounds = trunks.phase ? BOUNDS_WITH_PHASE : BOUNDS_WITHOUT_PHASE

  const scores = {} as Record<ObservationAxisId, number>
  for (const axis of OBSERVATION_AXIS_IDS) {
    const raw = rows.reduce((sum, { weight, row }) => sum + weight * row[axis], 0)
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
