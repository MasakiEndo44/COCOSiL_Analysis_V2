// 強み／弱み語彙: axisScores から決定論導出する強み2・弱み1（trait＋exit）の語彙テーブル。
// Gate 2 承認済み（2026-06-07・exit は if-then 改訂版）。
//
// 設計根拠:
//   - docs/discussions/20260607_議論ログ_弱みexit具体化.md
//   - docs/output/goals/f3-report-determinism-and-self-anchor.md（Phase 1.6 / 強み2:弱み1）
//
// 設計原則:
//   - 強み = 上位2軸（最強軸＋第2軸）から各1つ。
//   - 弱み = 最強軸の「長所の裏面（影）」。trait（状況依存の癖）＋ exit（行動の出口）。
//   - exit は if-then 構造（① Exit = Trigger × Micro-action）。軸ごとに別 tactic で
//     「似たり寄ったり」を排し、命令形でなく効用形で書く（③ Personal, Not Preachy）。
//   - ProfileCore は骨子を固定し、生活文脈の具体例は Phase 2 LLM が肉付けする
//     （② Score the Direction, Narrate the Tactic）。

import type { ObservationAxisId } from '@/lib/constitution/observation-axes'

// ============================================================================
// 強み: 軸ごとの体言フレーズ（上位2軸から2つ選ぶ）
// ============================================================================

export const STRENGTH: Record<ObservationAxisId, string> = {
  embodied_pattern: '状況に体ごと飛び込める瞬発力',
  emotional_response: '人の機微や場の空気を察する細やかさ',
  cognitive_style: '筋道を立てて捉える明晰さ',
  motivation_drive: '前へ進もうとする推進力',
  relational_mode: '人との間合いを取る調整力',
}

// ============================================================================
// 弱み: 最強軸の影（trait＝状況依存の癖 / exit＝if-then の行動の出口）
// ============================================================================

export interface WeaknessEntry {
  trait: string
  exit: string
}

export const WEAKNESS: Record<ObservationAxisId, WeaknessEntry> = {
  embodied_pattern: {
    trait: '考える前に動き、後から段取りを整え直すことがある',
    exit: '動きたくなったら、まず終わりの時刻だけ先に決める（「17時まで」とタイマー）。勢いを止めずに暴走だけ抑えられる',
  },
  emotional_response: {
    trait: '人の気持ちを受け取りすぎて、自分まで巻き込まれやすい',
    exit: '心が重くなったら「これは私の感情？相手の感情？」と一度ラベルを貼る。線が引けると飲み込まれにくい',
  },
  cognitive_style: {
    trait: '筋を通そうとして考えすぎ、動き出しが遅れることがある',
    exit: '迷ったら「これは後で戻せる決定か？」と自問する。戻せるなら即決、戻せない時だけじっくり——速度を可逆性で切り替えるとラク',
  },
  motivation_drive: {
    trait: '勢いが強く、周りの足並みより先に動いてしまうことがある',
    exit: '走り出す前に「最初に通す相手」を1人だけ決めておく。全員でなく1人に共有するルールにすると、独走も巻き込み漏れも防げる',
  },
  relational_mode: {
    trait: '場を整えようとして、自分の希望を後回しにしがち',
    exit: '話し合いの最初の5分で「自分はこうしたい」を1回だけ口に出す枠を作る。先に置くと、後から言い出す気まずさが消える',
  },
}

// ============================================================================
// トーンガード: 弱み記述に混入してはいけない命令形・人格否定（原則③）
// ============================================================================

export const COMMAND_FORM_GUARD = [
  'ましょう',
  'しなさい',
  'してください',
  'すべき',
  'するべき',
] as const

export const SELF_NEGATION_GUARD = ['ダメ', '欠陥', '失格', '劣って'] as const
