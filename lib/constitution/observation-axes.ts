// COCOSiL Constitution: F3.1 4体系統合アルゴリズム「Tree of 4, Harvest 1.」の観察軸5軸
// 設計中枢 §2.3 パンチャ構造（色受想行識）を性格心理学的5軸に展開した machine-readable 定義。
// 識（vijñāna）は軸ではなく Harvest 結果が表現するメタ層に置く（META_LAYER）。
//
// 根拠:
//   - docs/discussions/議論ログ_F3-1観察軸5軸確定.md
//   - docs/discussions/議論ログ_F3-1キーワードツリー4体系統合アルゴリズム.md
//   - docs/output/goals/f3-keyword-tree-integration.md
//
// 設計3原則 (Pancha to Five Axes.):
//   ① Four Aggregates Expand, Fifth Transcends.
//      色受想行の4蘊を5軸に展開、識は Harvest 結果が表現するメタ層
//   ② Minimal Signature, Rich Expression.
//      observation_keywords は識別シグネチャ（3-5語）、表現語彙は Deep Research が担う
//   ③ Priority Resolves Crossings.
//      軸間の越境概念は layer_priority で主軸を1つ指定して解決

export const OBSERVATION_AXES = {
  embodied_pattern: {
    id: 'embodied_pattern',
    label_ja: '身体・気質パターン',
    pancha_origin: 'rūpa（色）',
    definition:
      '体質・気質・行動テンポ・エネルギー水準など、身体性に根ざした個人特性',
    observation_keywords: ['気質', '体質', 'テンポ', 'エネルギー', '気力'],
    layer_priority: ['行動層', '生理層'],
  },
  emotional_response: {
    id: 'emotional_response',
    label_ja: '感情反応パターン',
    pancha_origin: 'vedanā（受の内的側面）',
    definition: '内的情動（喜怒哀楽）・刺激への反応・情動の表出パターン',
    observation_keywords: ['感情', '情動', '反応', '気分', '感受性'],
    layer_priority: ['内的情動', '情動表出'],
  },
  cognitive_style: {
    id: 'cognitive_style',
    label_ja: '認知スタイル',
    pancha_origin: 'saṃjñā（想）',
    definition: '知覚・概念化・判断・意思決定における処理癖',
    observation_keywords: ['思考', '判断', '直観', '分析', '認識'],
    layer_priority: ['処理特性', '判断癖'],
  },
  motivation_drive: {
    id: 'motivation_drive',
    label_ja: '動機エネルギー',
    pancha_origin: 'saṃskāra（行）',
    definition: '何に駆動されるか・意志の方向・活動エネルギーの源',
    observation_keywords: ['動機', '意志', '駆動', '目標', '欲求'],
    layer_priority: ['衝動', '目標'],
  },
  relational_mode: {
    id: 'relational_mode',
    label_ja: '対人モード',
    pancha_origin: 'vedanā（受の対人側面）+ saṃskāra（行の関係側面）',
    definition:
      '他者との距離の取り方・関係構築パターン・親密圏と公的圏での振る舞い',
    observation_keywords: ['関係性', '距離感', 'コミュニケーション', '共感', '境界'],
    layer_priority: ['親密圏', '公的圏'],
  },
} as const

// 識（vijñāna）— 軸ではなく Harvest 結果が表現するメタ層
// LLM プロンプトで「軸」として扱ってはいけない（議論ログ_F3-1観察軸5軸確定 Turn 4 R2）
export const META_LAYER = {
  id: 'self_integration',
  label_ja: '自己統合（識）',
  pancha_origin: 'vijñāna（識）',
  definition: '5軸の harvest 結果が織り成すあなたという統合的な像',
  note: 'これは軸ではなく Harvest 結果そのものが表現するメタ層。LLM プロンプトで「軸」として扱ってはいけない。',
} as const

export type ObservationAxisId = keyof typeof OBSERVATION_AXES
export type ObservationAxis = (typeof OBSERVATION_AXES)[ObservationAxisId]

export const OBSERVATION_AXIS_IDS = Object.keys(
  OBSERVATION_AXES,
) as readonly ObservationAxisId[]

export function isObservationAxisId(value: unknown): value is ObservationAxisId {
  return typeof value === 'string' && value in OBSERVATION_AXES
}

export function getAxis(id: ObservationAxisId): ObservationAxis {
  return OBSERVATION_AXES[id]
}
