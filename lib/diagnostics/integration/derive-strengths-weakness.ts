// 強み2／弱み1（trait＋exit）の決定論導出。
//
// 設計根拠:
//   - docs/discussions/20260607_議論ログ_弱みexit具体化.md
//   - lib/data/strength-weakness-vocab.ts（Gate 2 承認済み語彙）
//
// 設計原則:
//   - 強み = 上位2軸（最強軸・第2軸）から各1つ。弱み = 最強軸の影（長所の裏面）。
//   - LLM 不使用のテーブル引きで決定論導出。生活文脈の肉付けは Phase 2 LLM が担う。

import type { ObservationAxisId } from '@/lib/constitution/observation-axes'
import { STRENGTH, WEAKNESS } from '@/lib/data/strength-weakness-vocab'
import { rankAxes } from './rank-axes'
import type { ProfileCore } from './profile-core'

export interface StrengthsWeakness {
  strengths: ProfileCore['strengths']
  weakness: ProfileCore['weakness']
}

export function deriveStrengthsWeakness(
  axisScores: Record<ObservationAxisId, number>,
): StrengthsWeakness {
  const ranked = rankAxes(axisScores)
  const top = ranked[0]
  const second = ranked[1]

  return {
    strengths: [STRENGTH[top], STRENGTH[second]],
    weakness: WEAKNESS[top],
  }
}
