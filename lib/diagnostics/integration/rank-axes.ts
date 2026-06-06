// 観察軸をスコア降順にランクする共有ユーティリティ。
// 同点は OBSERVATION_AXIS_IDS の定義順で決定論的に解決する（characterLabel / strengths-weakness 共用）。

import {
  OBSERVATION_AXIS_IDS,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'

export function rankAxes(
  axisScores: Record<ObservationAxisId, number>,
): ObservationAxisId[] {
  return [...OBSERVATION_AXIS_IDS].sort(
    (a, b) =>
      axisScores[b] - axisScores[a] ||
      OBSERVATION_AXIS_IDS.indexOf(a) - OBSERVATION_AXIS_IDS.indexOf(b),
  )
}
