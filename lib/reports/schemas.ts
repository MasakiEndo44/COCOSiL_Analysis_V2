import { z } from 'zod/v4'
import { MBTI_TYPES } from '@/lib/data/three-layer-vocab/twigs'
import type { ObservationAxisId } from '@/lib/constitution/observation-axes'
import type { DistributionOrigin } from '@/lib/diagnostics/integration'

export const GenerateReportBodySchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で指定してください'),
  mbtiType: z.enum(MBTI_TYPES),
  animalCharacter: z.string().min(1),
  animalType: z.string().min(1),
  zodiacSign: z.string().min(1),
  sixStar: z.string().min(1),
  /** MBTI A/T 軸の自己申告/判定。未指定時は route で 'T'（中立）にフォールバック。 */
  identity: z.enum(['A', 'T']).optional(),
  displayName: z.string().max(40).nullable().optional(),
  phase: z.enum(['spring', 'summer', 'autumn', 'winter']).optional(),
  userId: z.string().optional(),
})

export type GenerateReportBody = z.infer<typeof GenerateReportBodySchema>

export interface GenerateReportResponse {
  success: boolean
  reportId?: string
  reportUrl?: string
  content?: ReportContent
  fallback?: boolean
  error?: string
}

/** 4体系の識別子。four_lights テーブルの行キー。 */
export type FourLightSystem = 'zodiac' | 'animal' | 'sixStar' | 'mbti'

/**
 * 4体系それぞれの読み取り（4つの視点テーブルの1行）。
 * label（蟹座・リーダーとなるゾウ等）はLLMに生成させず route が既知入力から注入する
 * （Harvest, Don't Hallucinate）。reading のみ LLM 生成。
 */
export interface FourLightReading {
  system: FourLightSystem
  label: string
  reading: string
}

/**
 * 強み（2件）。label は ProfileCore.strengths（決定論・Gate 2 承認済み語彙）をそのまま採用し、
 * text のみ LLM が生活文脈に肉付けする（Score Once, Narrate Freely）。
 */
export interface ReportStrength {
  label: string
  text: string
}

/**
 * 弱み（1件・完全決定論）。trait（状況依存の癖）→ exit（if-then の行動の出口）の二層。
 * いずれも ProfileCore.weakness をそのまま採用し LLM を介さない（瞋ガード済み・冗長な言い換えを構造的に排除）。
 */
export interface ReportWeakness {
  trait: string
  exit: string
}

/**
 * ジョハリの窓「盲点」＝自覚しにくい強み。sourceAxis は ProfileCore.johariBlindspots 由来（出自明示）。
 * text のみ LLM 生成（軸ラベルを生活文脈で言い換える・新規の強みを発明しない）。
 */
export interface ReportJohari {
  sourceAxis: ObservationAxisId
  text: string
}

/**
 * 分布での位置。axis / percentile / origin は ProfileCore.distribution 由来（数値・出自は固定）。
 * comment のみ LLM が「みんなより〜多め」型の一言に言語化する。「一般分布」「平均」と詐称しない。
 */
export interface ReportDistribution {
  axis: ObservationAxisId
  percentile: number
  origin: DistributionOrigin
  comment: string
}

/**
 * 統合レポート本文。UXシーケンス（共感→安心→分析→行動）順。
 * catchphrase は ProfileCore.characterLabel をそのまま採用（LLM 不使用・完全決定論）。
 * strengths/weakness/johari/distribution は ProfileCore のスコア核を確定値とし、LLM は narration のみ生成。
 */
export interface ReportContent {
  /** = ProfileCore.characterLabel。命名（観の入口）。 */
  catchphrase: string
  /** 4体系の読み取り（共感の素材）。 */
  four_lights: FourLightReading[]
  /** 強み2（安心①・強み先）。 */
  strengths: ReportStrength[]
  /** 弱み1（安心②・出口付き後置）。 */
  weakness: ReportWeakness
  /** 統合像＝識。5軸を貫く核を1つの像として描く文章（観の山場・AC-1）。 */
  core: string
  /** 自覚しにくい強み（分析・ジョハリ盲点）。 */
  johari: ReportJohari[]
  /** 設計上の理論分布での位置（分析）。 */
  distribution: ReportDistribution[]
  /** 大切な人との関係ヒント（行動の入口・AC-2）。 */
  relational_hint: string
  /** 結び＋「次は何を知りたい？」の招待（行動）。 */
  closing: string
}

export const MarkerBodySchema = z.object({
  reportId: z.string().uuid(),
  sectionId: z.string().min(1),
  sectionText: z.string().max(500).optional(),
  userId: z.string().optional(),
})

export type MarkerBody = z.infer<typeof MarkerBodySchema>

export const MarkerDeleteBodySchema = z.object({
  reportId: z.string().uuid(),
  sectionId: z.string().min(1),
  userId: z.string().optional(),
})

export type MarkerDeleteBody = z.infer<typeof MarkerDeleteBodySchema>

export interface MarkerResponse {
  success: boolean
  markerId?: string
  error?: string
}

export const SurveyBodySchema = z.object({
  reportId: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  userId: z.string().optional(),
})

export type SurveyBody = z.infer<typeof SurveyBodySchema>

export interface SurveyResponse {
  success: boolean
  error?: string
}
