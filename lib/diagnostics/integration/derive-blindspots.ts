// ジョハリの窓「盲点」: 自覚しにくい強みを軸スコアから決定論導出する。
//
// 設計根拠:
//   - docs/output/goals/f3-report-determinism-and-self-anchor.md（ジョハリ盲点 / 出自明示）
//   - docs/discussions/20260604_議論ログ_F3レポート揺らぎ改善.md
//     （七海: LLM印象推定でなく core数値から導く / 出自を保持）
//
// 設計原則:
//   - 盲点 = 「設計上の理論分布で notably 強い（percentile≥SALIENT）が、本人の自己像の
//     先頭ではない軸」。先頭軸（最高スコア）は自覚済みの像なので盲点から除外する。
//   - text は観察軸の承認済みラベル（label_ja）を使い、新規の散文は作らない（Gate 2 回避）。
//     豊かな語りは Phase 2 の LLM 翻訳層が担う（Score Once, Narrate Freely）。

import {
  OBSERVATION_AXES,
  OBSERVATION_AXIS_IDS,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import { buildDistribution } from './build-distribution'
import type { JohariBlindspot } from './profile-core'

// 設計空間で「際立って強い」とみなす理論分布パーセンタイルの下限
const SALIENT_PERCENTILE = 60

export function deriveBlindspots(
  axisScores: Record<ObservationAxisId, number>,
): JohariBlindspot[] {
  // 自己像の先頭軸（最高スコア）= 自覚済み。同点は ID 順で決定論的に1つだけ先頭とする。
  const headAxis = [...OBSERVATION_AXIS_IDS].sort(
    (a, b) => axisScores[b] - axisScores[a] || OBSERVATION_AXIS_IDS.indexOf(a) - OBSERVATION_AXIS_IDS.indexOf(b),
  )[0]

  const percentileByAxis = new Map(
    buildDistribution(axisScores).map((d) => [d.axis, d.percentile]),
  )

  return OBSERVATION_AXIS_IDS.filter(
    (axis) =>
      axis !== headAxis &&
      (percentileByAxis.get(axis) ?? 0) >= SALIENT_PERCENTILE,
  ).map((axis) => ({
    text: OBSERVATION_AXES[axis].label_ja,
    sourceAxis: axis,
  }))
}
