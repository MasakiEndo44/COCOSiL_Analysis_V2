// COCOSiL Constitution: F3.1 4体系統合「幹と枝」3 段階モデル
//
// パイプライン v2 の中核設計。Procrustean Mapping 問題（軸先行射影による情報損失）を
// 解消し、各体系の自然な大分類（Trunks）を 3 段階の階層で統合する。
//
// 設計根拠:
//   - docs/discussions/議論ログ_4体系統合メソッド幹と枝モデル.md (Turn 1-6)
//   - docs/input/deep-research/4体系の伝統的大分類文献調査.md (Q1)
//   - docs/input/deep-research/心理類型体系間象徴対応の検証.md (Q2)
//   - docs/input/deep-research/4元素×ユング機能 コア語彙生成.md (Q3a)
//   - docs/input/deep-research/Layer 2 振る舞いスタイル語彙コーパス生成.md (Q3b)
//   - docs/input/deep-research/Layer 3 時期変調コーパス生成.md (Q3c)
//   - docs/input/deep-research/N_M確率対応モデルの既存研究網羅.md (Q4)
//
// 設計原則 (Turn 6 確定):
//   ① Trunks Before Twigs. — 幹を先、枝は派生。Procrustean Mapping を禁ず
//   ② Pancha at Macro, Trunks at Micro. — マクロでパンチャ哲学、ミクロで幹
//   ③ Hybrid Distance: Theory ⊕ Evidence. — α × Rule + (1-α) × Embedding
//   ④ Cognitive Below, Behavior Middle, Phase Above. — 3 段階モデル
//   ⑤ Determinism Down, Probability Middle, Modulation Up. — 層別の決定論性
//
// 本ファイルは Immutable Constitution（不変）。語彙コーパス（合計 320 語）は
// 別ファイル (lib/data/three-layer-vocab/) で Mutable として管理する。

import { z } from 'zod/v4'

// ============================================================================
// Layer 1: 心の核 (4 元素 ↔ ユング 4 機能、1:1 対応、一生変わらない)
// ============================================================================

export const LAYER1_ELEMENTS = ['fire', 'earth', 'air', 'water'] as const
export type Layer1Element = (typeof LAYER1_ELEMENTS)[number]

export const JUNG_FUNCTIONS = ['intuition', 'sensation', 'thinking', 'feeling'] as const
export type JungFunction = (typeof JUNG_FUNCTIONS)[number]

// Q2 §1, §5.2 で全 4 ペア 5/5 評価で確定した 1:1 対応
export const LAYER1_TO_JUNG: Record<Layer1Element, JungFunction> = {
  fire: 'intuition',
  earth: 'sensation',
  air: 'thinking',
  water: 'feeling',
} as const

// 古典 4 体液との対応 (Hippocrates / Galen / Avicenna)
export const LAYER1_TO_HUMOR: Record<Layer1Element, string> = {
  fire: 'choleric', // 黄胆汁 (熱乾)
  earth: 'melancholic', // 黒胆汁 (冷乾)
  air: 'sanguine', // 多血質 (熱湿)
  water: 'phlegmatic', // 粘液質 (冷湿)
} as const

// ============================================================================
// Layer 2: 振る舞いスタイル (8 カテゴリ、N:M 確率ベクトル、生まれつきだが少し変わる)
// ============================================================================

export const LAYER2_KEIRSEY_STYLES = ['sp', 'sj', 'nf', 'nt'] as const
export const LAYER2_ANIMAL_STYLES = ['sun', 'earthMode', 'fullMoon', 'newMoon'] as const
export const LAYER2_STYLES = [
  ...LAYER2_KEIRSEY_STYLES,
  ...LAYER2_ANIMAL_STYLES,
] as const

export type Layer2KeirseyStyle = (typeof LAYER2_KEIRSEY_STYLES)[number]
export type Layer2AnimalStyle = (typeof LAYER2_ANIMAL_STYLES)[number]
export type Layer2Style = (typeof LAYER2_STYLES)[number]

// Q4 §5.1 で学術的に正当化された N:M 確率分布
// 各行合計 = 1.00 (確率分布の保存則)
export const LAYER2_TO_LAYER1: Record<Layer2Style, Record<Layer1Element, number>> = {
  sp: { fire: 0.45, earth: 0.40, air: 0.05, water: 0.10 },
  sj: { fire: 0.05, earth: 0.85, air: 0.10, water: 0.00 },
  nf: { fire: 0.25, earth: 0.05, air: 0.10, water: 0.60 },
  nt: { fire: 0.10, earth: 0.05, air: 0.85, water: 0.00 },
  sun: { fire: 0.55, earth: 0.15, air: 0.25, water: 0.05 },
  earthMode: { fire: 0.10, earth: 0.65, air: 0.20, water: 0.05 },
  fullMoon: { fire: 0.20, earth: 0.05, air: 0.45, water: 0.30 },
  newMoon: { fire: 0.05, earth: 0.25, air: 0.10, water: 0.60 },
} as const

// ============================================================================
// Layer 3: 時期の出方 (4 フェーズ、Modulator、時期によって変わる)
// ============================================================================

export const LAYER3_PHASES = ['spring', 'summer', 'autumn', 'winter'] as const
export type Layer3Phase = (typeof LAYER3_PHASES)[number]

// Hippocrates 古典医学 + エリザベス朝宇宙論の対応
// (春=多血、夏=胆汁、秋=黒胆汁、冬=粘液)
export const LAYER3_TO_HUMOR: Record<Layer3Phase, string> = {
  spring: 'sanguine',
  summer: 'choleric',
  autumn: 'melancholic',
  winter: 'phlegmatic',
} as const

// Q3c §5.1: Layer 1 への変調係数 (-0.3 〜 +0.3)
// 対角構造: 春=Air +0.3 / 夏=Fire +0.3 / 秋=Earth +0.3 / 冬=Water +0.3
// (Hippocrates 古典医学・エリザベス朝宇宙論・六星理論の 3 系統で一致)
export const LAYER3_TO_LAYER1_MODULATION: Record<
  Layer3Phase,
  Record<Layer1Element, number>
> = {
  spring: { fire: 0.1, earth: 0.0, air: 0.3, water: -0.1 },
  summer: { fire: 0.3, earth: -0.1, air: 0.0, water: -0.2 },
  autumn: { fire: -0.1, earth: 0.3, air: 0.1, water: 0.0 },
  winter: { fire: -0.2, earth: 0.0, air: -0.1, water: 0.3 },
} as const

// Q3c §5.2: Layer 2 (8 カテゴリ) への変調係数 (-0.3 〜 +0.3)
export const LAYER3_TO_LAYER2_MODULATION: Record<
  Layer3Phase,
  Record<Layer2Style, number>
> = {
  spring: {
    sp: 0.2, sj: -0.1, nf: 0.1, nt: 0.0,
    sun: 0.1, earthMode: -0.1, fullMoon: 0.2, newMoon: -0.1,
  },
  summer: {
    sp: 0.2, sj: -0.2, nf: 0.0, nt: 0.0,
    sun: 0.3, earthMode: -0.1, fullMoon: 0.0, newMoon: -0.2,
  },
  autumn: {
    sp: -0.1, sj: 0.3, nf: 0.0, nt: 0.1,
    sun: -0.1, earthMode: 0.3, fullMoon: 0.0, newMoon: 0.1,
  },
  winter: {
    sp: -0.2, sj: 0.0, nf: 0.1, nt: 0.0,
    sun: -0.2, earthMode: 0.0, fullMoon: -0.1, newMoon: 0.3,
  },
} as const

// ============================================================================
// Hybrid Distance Function 設定 (Q4 §4.3 階層別 α 提案)
//
// 認知科学的階層性: 内奥 (Layer 1) に近づくほど理論規則 (Rule) の拘束力が強まり、
// 表層 (Layer 3) に近づくほど文脈 (Embedding) の支配力が強まる。
// ============================================================================

export const HYBRID_DISTANCE_ALPHA = {
  layer1ToLayer2: 0.7, // Rule (理論) 重視 — 心理測定相関や象徴体系の不変ルール優先
  layer2ToLayer3: 0.3, // Embedding (経験) 重視 — 言語表現や感情ニュアンスに柔軟適応
} as const

export type LayerTransition = keyof typeof HYBRID_DISTANCE_ALPHA

// ============================================================================
// Zod スキーマ (ランタイム検証)
// ============================================================================

export const Layer1ElementSchema = z.enum(LAYER1_ELEMENTS)
export const JungFunctionSchema = z.enum(JUNG_FUNCTIONS)
export const Layer2StyleSchema = z.enum(LAYER2_STYLES)
export const Layer3PhaseSchema = z.enum(LAYER3_PHASES)

// Layer 2 → Layer 1 確率分布 (Σ=1.00 の保存則を強制)
export const Layer2ProbabilityVectorSchema = z
  .object({
    fire: z.number().min(0).max(1),
    earth: z.number().min(0).max(1),
    air: z.number().min(0).max(1),
    water: z.number().min(0).max(1),
  })
  .refine(
    (v) => Math.abs(v.fire + v.earth + v.air + v.water - 1.0) < 0.001,
    { message: '確率分布の保存則違反: Σ=1.00 を満たす必要がある' },
  )

// 変調係数 (-0.3 〜 +0.3 の範囲)
export const ModulationCoefficientSchema = z.number().min(-0.3).max(0.3)

// Hybrid Distance 計算結果
export const HybridDistanceSchema = z.object({
  ruleDistance: z.number().min(0).max(1),
  embeddingDistance: z.number().min(0).max(1),
  alpha: z.number().min(0).max(1),
  hybridDistance: z.number().min(0).max(1),
})

export type Layer2ProbabilityVector = z.infer<typeof Layer2ProbabilityVectorSchema>
export type HybridDistance = z.infer<typeof HybridDistanceSchema>

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * Hybrid Distance を計算する
 * distance = α × ruleDistance + (1-α) × embeddingDistance
 *
 * @param transition - 'layer1ToLayer2' (α=0.7) or 'layer2ToLayer3' (α=0.3)
 */
export function computeHybridDistance(
  ruleDistance: number,
  embeddingDistance: number,
  transition: LayerTransition,
): HybridDistance {
  const alpha = HYBRID_DISTANCE_ALPHA[transition]
  const hybridDistance = alpha * ruleDistance + (1 - alpha) * embeddingDistance
  return { ruleDistance, embeddingDistance, alpha, hybridDistance }
}

/**
 * Layer 2 スタイルの Layer 1 確率分布を取得
 */
export function getLayer1Distribution(style: Layer2Style): Layer2ProbabilityVector {
  return LAYER2_TO_LAYER1[style]
}

/**
 * 時期フェーズによる動的分布を計算
 * P_active(t) = T_static ⊙ M_phase(t)
 *
 * Layer 3 変調を Layer 1 確率分布に加算的に適用し、[0,1] クリップ後に
 * 再正規化して Σ=1.00 を保つ。
 */
export function applyPhaseModulationToLayer1(
  staticDistribution: Layer2ProbabilityVector,
  phase: Layer3Phase,
): Layer2ProbabilityVector {
  const modulation = LAYER3_TO_LAYER1_MODULATION[phase]
  const clipped = {
    fire: Math.max(0, Math.min(1, staticDistribution.fire + modulation.fire)),
    earth: Math.max(0, Math.min(1, staticDistribution.earth + modulation.earth)),
    air: Math.max(0, Math.min(1, staticDistribution.air + modulation.air)),
    water: Math.max(0, Math.min(1, staticDistribution.water + modulation.water)),
  }
  const sum = clipped.fire + clipped.earth + clipped.air + clipped.water
  return {
    fire: clipped.fire / sum,
    earth: clipped.earth / sum,
    air: clipped.air / sum,
    water: clipped.water / sum,
  }
}
