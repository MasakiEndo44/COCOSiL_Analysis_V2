// COCOSiL Constitution: F3.1 統合アルゴリズム 構造的親和行列（Axis Affinity Matrix）
//
// Trunks 値（keirsey / animalStyle / zodiacElement / rokuseiPolarity / phase）から
// 5 観察軸への寄与を、理論的根拠を持つ「順序尺度」で定義する。
// harvest() はこの行列を引いて合算し、軸内正規化でスコアを導出する。
//
// 設計根拠:
//   - docs/output/decisions/20260602_harvest親和行列_根拠表.md (Gate 2 承認済みドラフト)
//   - docs/discussions/20260602_議論ログ_harvestスコアモデル再設計.md
//   - lib/constitution/observation-axes.ts (5 軸 + 識メタ層)
//   - lib/constitution/three-layer-model.ts (Trunks の値域)
//
// 設計3原則:
//   ① Map, Don't Match.        — substring 照合せず Trunks→軸を写像する
//   ② Spread Before Profile.   — 軸内正規化でユーザー間分散を先に確保する
//   ③ Ordinal Roots, No Decoration. — 重みは理論的根拠を持つ順序尺度のみ。
//                                     分散稼ぎの連続値微調整は禁止。

import type { ObservationAxisId } from './observation-axes'
import type {
  Layer1Element,
  Layer2KeirseyStyle,
  Layer2AnimalStyle,
  Layer3Phase,
} from './three-layer-model'

// ============================================================================
// 順序尺度: 強+ / 弱+ / 中立 / 弱−（連続値は使わない = No Decoration）
// ============================================================================

export const ORDINAL_WEIGHT = {
  strongPositive: 2,
  weakPositive: 1,
  neutral: 0,
  weakNegative: -1,
} as const

export type OrdinalWeight = (typeof ORDINAL_WEIGHT)[keyof typeof ORDINAL_WEIGHT]

const { strongPositive: PP, weakPositive: P, neutral: O, weakNegative: N } =
  ORDINAL_WEIGHT

export type AxisWeights = Record<ObservationAxisId, OrdinalWeight>
export type RokuseiPolarityKey = '+' | '-'

// ============================================================================
// keirsey（MBTI → Keirsey 1998 気質4群）
// 根拠: Keirsey (1998) — NT 達成/熟達, NF 共感/意味, SJ 規範/義務, SP 運動/即興
// ============================================================================

export const KEIRSEY_AFFINITY: Record<Layer2KeirseyStyle, AxisWeights> = {
  nt: { embodied_pattern: O, emotional_response: N, cognitive_style: PP, motivation_drive: PP, relational_mode: O },
  nf: { embodied_pattern: O, emotional_response: PP, cognitive_style: P, motivation_drive: P, relational_mode: PP },
  sj: { embodied_pattern: P, emotional_response: N, cognitive_style: O, motivation_drive: P, relational_mode: P },
  sp: { embodied_pattern: PP, emotional_response: P, cognitive_style: N, motivation_drive: O, relational_mode: O },
} as const

// ============================================================================
// animalStyle（動物占い 3社会分類 × モード派生）
// 根拠: 太陽群=外向/高エネルギー, 地球群=現実/マイペース,
//       満月群=他者志向/協調, 新月群=慎重/内省
// ============================================================================

export const ANIMAL_STYLE_AFFINITY: Record<Layer2AnimalStyle, AxisWeights> = {
  sun: { embodied_pattern: PP, emotional_response: O, cognitive_style: O, motivation_drive: P, relational_mode: P },
  earthMode: { embodied_pattern: P, emotional_response: N, cognitive_style: P, motivation_drive: O, relational_mode: N },
  fullMoon: { embodied_pattern: O, emotional_response: P, cognitive_style: O, motivation_drive: N, relational_mode: PP },
  newMoon: { embodied_pattern: N, emotional_response: P, cognitive_style: P, motivation_drive: O, relational_mode: O },
} as const

// ============================================================================
// zodiacElement（4元素 ↔ Jung 4機能 1:1 — 最強アンカー）
// 根拠: LAYER1_TO_JUNG（fire→直観 / earth→感覚 / air→思考 / water→感情）
//       + 古典4体液（熱乾/冷乾/熱湿/冷湿）
// ============================================================================

export const ZODIAC_ELEMENT_AFFINITY: Record<Layer1Element, AxisWeights> = {
  fire: { embodied_pattern: P, emotional_response: O, cognitive_style: P, motivation_drive: PP, relational_mode: O },
  earth: { embodied_pattern: PP, emotional_response: N, cognitive_style: P, motivation_drive: O, relational_mode: O },
  air: { embodied_pattern: O, emotional_response: N, cognitive_style: PP, motivation_drive: O, relational_mode: P },
  water: { embodied_pattern: N, emotional_response: PP, cognitive_style: O, motivation_drive: N, relational_mode: P },
} as const

// ============================================================================
// rokuseiPolarity（陽/陰 — 全体変調・弱のみで大域支配を防ぐ）
// 根拠: 陽=能動/外向, 陰=受動/内向
// ============================================================================

export const ROKUSEI_POLARITY_AFFINITY: Record<RokuseiPolarityKey, AxisWeights> = {
  '+': { embodied_pattern: O, emotional_response: O, cognitive_style: O, motivation_drive: P, relational_mode: P },
  '-': { embodied_pattern: O, emotional_response: P, cognitive_style: P, motivation_drive: N, relational_mode: O },
} as const

// ============================================================================
// phase（任意 / Layer3 時期変調 — 弱の正ナッジのみ。未指定時は寄与ゼロ）
// 根拠: LAYER3_TO_HUMOR（春=多血/air, 夏=胆汁/fire, 秋=黒胆汁/earth, 冬=粘液/water）
// ============================================================================

export const PHASE_AFFINITY: Record<Layer3Phase, AxisWeights> = {
  spring: { embodied_pattern: O, emotional_response: O, cognitive_style: P, motivation_drive: O, relational_mode: P },
  summer: { embodied_pattern: P, emotional_response: O, cognitive_style: O, motivation_drive: P, relational_mode: O },
  autumn: { embodied_pattern: P, emotional_response: O, cognitive_style: P, motivation_drive: O, relational_mode: O },
  winter: { embodied_pattern: O, emotional_response: P, cognitive_style: O, motivation_drive: O, relational_mode: P },
} as const
