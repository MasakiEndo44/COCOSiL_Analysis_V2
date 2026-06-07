// characterLabel 語彙: 形容詞 × 名詞 の決定論合成テーブル（Gate 2 承認済み 2026-06-07）
//
// 設計根拠:
//   - docs/discussions/20260607_議論ログ_characterLabel名詞パターン.md（名詞2次元化）
//   - docs/output/goals/f3-report-determinism-and-self-anchor.md（Phase 1.3）
//
// 設計3原則（議論で確定）:
//   ① Branch on Difference, Not Synonym — 名詞分岐は実スコア差（第2軸）に接地。同義語の水増し禁止。
//   ② One Name per Self — characterLabel は観察軸由来に統一。動物60typeとレイヤー分離。
//   ③ Distinct, Not Decorated — 誇張形容詞を持ち込まない（Dispel, Don't Decorate）。
//
// 合成式: 形容詞[第2軸 × A/T] ＋ 名詞[最強軸 × 第2軸]（立たないセルは核名詞へフォールバック）

import type { ObservationAxisId } from '@/lib/constitution/observation-axes'
import type { Identity } from '@/lib/diagnostics/integration/profile-core'

// ============================================================================
// 名詞: 核名詞（最強軸ごと・フォールバック先）
// ============================================================================

export const CORE_NOUN: Record<ObservationAxisId, string> = {
  embodied_pattern: '実践者',
  emotional_response: '共感者',
  cognitive_style: '分析者',
  motivation_drive: '開拓者',
  relational_mode: '調停者',
}

// ============================================================================
// 名詞グリッド: [最強軸][第2軸] → 固有名詞（別概念のみ。同義語は置かない）
// 未定義セルは CORE_NOUN[最強軸] にフォールバックする。
// ============================================================================

export const NOUN_GRID: Partial<
  Record<ObservationAxisId, Partial<Record<ObservationAxisId, string>>>
> = {
  embodied_pattern: {
    emotional_response: '情熱家',
    cognitive_style: '職人',
    relational_mode: '盛り上げ役',
  },
  emotional_response: {
    embodied_pattern: '表現者',
    relational_mode: '寄り添い役',
  },
  cognitive_style: {
    emotional_response: '洞察者',
    motivation_drive: '設計者',
    relational_mode: '翻訳者',
  },
  motivation_drive: {
    embodied_pattern: '突破者',
    cognitive_style: '戦略家',
    relational_mode: '推進者',
  },
  relational_mode: {
    emotional_response: 'つなぎ手',
    cognitive_style: '進行役',
    motivation_drive: '旗振り役',
  },
}

// ============================================================================
// 形容詞: [第2軸][A/T 調性] → 形容詞（A=自己主張型 / T=慎重型）
// ============================================================================

export const ADJECTIVE: Record<ObservationAxisId, Record<Identity, string>> = {
  embodied_pattern: { A: '機動力ある', T: '粘り強い' },
  emotional_response: { A: '情熱的な', T: '繊細な' },
  cognitive_style: { A: '明晰な', T: '思慮深い' },
  motivation_drive: { A: '意欲的な', T: '着実な' },
  relational_mode: { A: '社交的な', T: '誠実な' },
}

// ============================================================================
// 誇張語ガード: characterLabel に混入してはいけない誇張・優劣語（原則③）
// banned-words.ts（占い系）とは別に、ラベル品位を守るための補助リスト。
// ============================================================================

export const EXAGGERATION_GUARD = [
  '無敵',
  '最強',
  '天才',
  'カリスマ',
  '究極',
  '完璧',
  'スーパー',
] as const
