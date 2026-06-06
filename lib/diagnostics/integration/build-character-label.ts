// characterLabel の決定論導出: axisScores + identity → 形容詞＋名詞
//
// 設計根拠:
//   - docs/discussions/20260607_議論ログ_characterLabel名詞パターン.md
//   - lib/data/character-label-vocab.ts（Gate 2 承認済み語彙）
//
// 設計原則:
//   - 最強軸が名詞の核、第2軸が名詞の固有化と形容詞を駆動する（実差に接地）。
//   - LLM を使わずテーブル引きで決定論導出（同一入力 → 同一ラベル）。

import type { ObservationAxisId } from '@/lib/constitution/observation-axes'
import {
  CORE_NOUN,
  NOUN_GRID,
  ADJECTIVE,
} from '@/lib/data/character-label-vocab'
import { rankAxes } from './rank-axes'
import type { Identity } from './profile-core'

export function buildCharacterLabel(
  axisScores: Record<ObservationAxisId, number>,
  identity: Identity,
): string {
  const ranked = rankAxes(axisScores)
  const top = ranked[0]
  const second = ranked[1]

  const noun = NOUN_GRID[top]?.[second] ?? CORE_NOUN[top]
  const adjective = ADJECTIVE[second][identity]

  return `${adjective}${noun}`
}
