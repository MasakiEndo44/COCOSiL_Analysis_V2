// F3 ProfileCore: レポート生成の単一の確定スコア核（Source of Truth）
//
// 設計根拠:
//   - docs/output/goals/f3-report-determinism-and-self-anchor.md（要件・AC-1〜10）
//   - docs/output/goals/f3-report-determinism-implementation-plan.md（Phase 0・1）
//   - docs/discussions/20260604_議論ログ_F3レポート揺らぎ改善.md
//
// 設計原則:
//   ① Score Once, Narrate Freely — 数値は diagnostics 層で一度だけ確定。
//      ProfileCore は不変の読み取り専用契約であり、LLM 翻訳層・チャット層・課金境界は
//      これを参照するだけで再計算しない。
//   ② Append-Only Self — schema を変えたら PROFILE_CORE_VERSION を上げ、旧 version は凍結。
//      過去レポートは生成時の version で再現する（最新ロジックで過去を再計算しない）。
//   ③ Reproducible Evidence Dispels — 全フィールドは harvest 等の決定論計算に由来し、
//      出自を持つ。出自なき断定（LLM 推定・捏造分布）はこの契約に載せない。
//
// 本ファイルは Phase 0「型契約」。buildProfileCore 等の導出ロジックは Phase 1 で追加する。

import { z } from 'zod/v4'
import {
  OBSERVATION_AXIS_IDS,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'

// ============================================================================
// version: Append-Only Self の要。schema を変更したら必ずインクリメントする。
// ============================================================================

export const PROFILE_CORE_VERSION = 1

// ============================================================================
// MBTI Identity 軸（A: 自己主張型 / T: 慎重型）と 32 型
//
// 16 型 × A/T = 32 型。入力ベクトルを一意化し、サポーター/リーダーの分岐を確定させる。
// 入力側の収集ロジックは TSK-DB-002 が担うが、出力契約としての型はここを正とする。
// ============================================================================

export const IdentitySchema = z.enum(['A', 'T'])
export type Identity = z.infer<typeof IdentitySchema>

/** 例: "INTJ-A"。16 MBTI 型 + Identity。 */
export const Type32Schema = z.string().regex(/^[EI][SN][TF][JP]-[AT]$/, {
  message: 'type32 は "INTJ-A" 形式（MBTI4文字-A/T）である必要があります',
})
export type Type32 = z.infer<typeof Type32Schema>

// ============================================================================
// 5 軸スコア [0,1]（harvest 由来・全軸必須）
// ============================================================================

const axisScoresShape = Object.fromEntries(
  OBSERVATION_AXIS_IDS.map((id) => [id, z.number().min(0).max(1)]),
) as Record<ObservationAxisId, z.ZodNumber>

export const AxisScoresSchema = z.object(axisScoresShape)

// ============================================================================
// 自己像の核を構成する派生フィールド
// ============================================================================

/** キャラ名（形容詞＋名詞）。axisScores + type32 から決定論導出される自己投影の錨。 */
export const CharacterLabelSchema = z.string().min(1)

/** 強み（2件固定）。強み2:弱み1 の両面提示の「強み」側。 */
export const StrengthsSchema = z.tuple([z.string().min(1), z.string().min(1)])

/**
 * 弱み（1件）。瞋（防衛・自己否定）を招かないため、必ず行動の出口とセットで持つ。
 * trait は状況依存表現（この条件で出やすい癖）、exit は行動の出口（だから〇〇するとラク）。
 */
export const WeaknessSchema = z.object({
  trait: z.string().min(1),
  exit: z.string().min(1),
})

/**
 * ジョハリの窓「盲点」= 自覚しにくい強み。
 * LLM 推定ではなく軸スコアから決定論導出し、出自（由来軸）を必ず保持する（Dispel 担保）。
 */
export const JohariBlindspotSchema = z.object({
  text: z.string().min(1),
  sourceAxis: z.enum(OBSERVATION_AXIS_IDS),
})
export type JohariBlindspot = z.infer<typeof JohariBlindspotSchema>

/**
 * 分布比較。母集団を「一般分布」と詐称せず出自を正直に明示する。
 * percentile は当該 origin の中での相対位置 [0,100]。
 */
export const DistributionEntrySchema = z.object({
  axis: z.enum(OBSERVATION_AXIS_IDS),
  percentile: z.number().min(0).max(100),
  origin: z.enum(['同タイプ内傾向', '設計上の理論分布']),
})
export type DistributionEntry = z.infer<typeof DistributionEntrySchema>
export type DistributionOrigin = DistributionEntry['origin']

/**
 * 体系別寄与重み。算命学:MBTI≈1:1 の曖昧さを廃し、採用した重みを明示記録する。
 * phase は入力に時期が与えられたときのみ寄与する。
 */
export const ProfileWeightsSchema = z.object({
  keirsey: z.number(),
  animalStyle: z.number(),
  zodiacElement: z.number(),
  rokuseiPolarity: z.number(),
  phase: z.number().optional(),
})

// ============================================================================
// ProfileCore 本体（不変・読み取り専用の Source of Truth）
// ============================================================================

export const ProfileCoreSchema = z.object({
  axisScores: AxisScoresSchema,
  type32: Type32Schema,
  identity: IdentitySchema,
  characterLabel: CharacterLabelSchema,
  strengths: StrengthsSchema,
  weakness: WeaknessSchema,
  johariBlindspots: z.array(JohariBlindspotSchema),
  distribution: z.array(DistributionEntrySchema),
  weights: ProfileWeightsSchema,
  /** 入力から決定論的に導く識別子。語り口の有限集合選択キーにも使う。 */
  seed: z.string().min(1),
  /** 生成時の schema version。Append-Only Self の凍結キー。 */
  version: z.number().int().positive(),
})

export type ProfileCore = z.infer<typeof ProfileCoreSchema>
