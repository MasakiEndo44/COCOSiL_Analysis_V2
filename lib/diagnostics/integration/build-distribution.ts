// 分布比較: 各軸スコアが「設計上の理論分布」のどこに位置するかを決定論的に算出する。
//
// 設計根拠:
//   - docs/output/goals/f3-report-determinism-and-self-anchor.md（出自を持つ座標 / Dispel）
//   - docs/discussions/20260604_議論ログ_F3レポート揺らぎ改善.md（七海: 出自なき断定は装飾）
//
// 設計原則:
//   - 母集団を「一般分布」と詐称しない。出自は「設計上の理論分布」= 親和行列が定義する
//     有限の Trunks 設計空間（4×4×4×2 = 128 通り）を全列挙して得た実分布。
//   - 実ユーザーデータが蓄積されたら origin '同タイプ内傾向' を別途追加する（本関数は理論分布のみ）。

import {
  OBSERVATION_AXIS_IDS,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import {
  KEIRSEY_AFFINITY,
  ANIMAL_STYLE_AFFINITY,
  ZODIAC_ELEMENT_AFFINITY,
  ROKUSEI_POLARITY_AFFINITY,
  type RokuseiPolarityKey,
} from '@/lib/constitution/axis-affinity-matrix'
import type {
  Layer1Element,
  Layer2KeirseyStyle,
  Layer2AnimalStyle,
} from '@/lib/constitution/three-layer-model'
import { computeAxisScores } from './affinity-score'
import type { DistributionEntry } from './profile-core'

// ============================================================================
// 設計空間の全列挙（phase 非依存・モジュール初期化時に1回だけ計算）
// ============================================================================

const KEIRSEY_KEYS = Object.keys(KEIRSEY_AFFINITY) as Layer2KeirseyStyle[]
const ANIMAL_KEYS = Object.keys(ANIMAL_STYLE_AFFINITY) as Layer2AnimalStyle[]
const ZODIAC_KEYS = Object.keys(ZODIAC_ELEMENT_AFFINITY) as Layer1Element[]
const ROKUSEI_KEYS = Object.keys(ROKUSEI_POLARITY_AFFINITY) as RokuseiPolarityKey[]

function buildDesignSpaceScores(): Record<ObservationAxisId, number[]> {
  const acc = Object.fromEntries(
    OBSERVATION_AXIS_IDS.map((id) => [id, [] as number[]]),
  ) as Record<ObservationAxisId, number[]>

  for (const keirsey of KEIRSEY_KEYS) {
    for (const animalStyle of ANIMAL_KEYS) {
      for (const zodiacElement of ZODIAC_KEYS) {
        for (const rokuseiPolarity of ROKUSEI_KEYS) {
          const scores = computeAxisScores({
            keirsey,
            animalStyle,
            zodiacElement,
            rokuseiPolarity,
          })
          for (const id of OBSERVATION_AXIS_IDS) acc[id].push(scores[id])
        }
      }
    }
  }
  // 二分探索のため昇順ソート
  for (const id of OBSERVATION_AXIS_IDS) acc[id].sort((a, b) => a - b)
  return acc
}

const DESIGN_SPACE_SCORES = buildDesignSpaceScores()

// ============================================================================
// パーセンタイル: 設計空間内で score 以下の割合（[0,100]・整数）
// ============================================================================

function percentileOf(sorted: number[], score: number): number {
  let countLe = 0
  for (const v of sorted) {
    if (v <= score) countLe++
    else break // 昇順なのでここで打ち切れる
  }
  return Math.round((countLe / sorted.length) * 100)
}

// ============================================================================
// 主関数: axisScores → 設計上の理論分布での位置
// ============================================================================

export function buildDistribution(
  axisScores: Record<ObservationAxisId, number>,
): DistributionEntry[] {
  return OBSERVATION_AXIS_IDS.map((axis) => ({
    axis,
    percentile: percentileOf(DESIGN_SPACE_SCORES[axis], axisScores[axis]),
    origin: '設計上の理論分布' as const,
  }))
}

// テスト・可観測性用に設計空間スコアを公開
export function getDesignSpaceScores(): Record<ObservationAxisId, number[]> {
  return DESIGN_SPACE_SCORES
}
