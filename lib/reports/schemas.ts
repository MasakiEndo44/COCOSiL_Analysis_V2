import { z } from 'zod/v4'
import { MBTI_TYPES } from '@/lib/data/three-layer-vocab/twigs'
import type { ObservationAxisId } from '@/lib/constitution/observation-axes'

export const GenerateReportBodySchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で指定してください'),
  mbtiType: z.enum(MBTI_TYPES),
  animalCharacter: z.string().min(1),
  animalType: z.string().min(1),
  zodiacSign: z.string().min(1),
  sixStar: z.string().min(1),
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
 * 5観察軸それぞれの「現れ方」（統合力テーブルの1行）。
 * axisLabel は UI が OBSERVATION_AXES[axisKey].label_ja から導出（ドリフト防止）。
 * manifestation のみ LLM 生成（評価語禁止・具体的な場面描写を内包）。
 */
export interface AxisManifestation {
  axisKey: ObservationAxisId
  manifestation: string
}

export interface ReportContent {
  catchphrase: string
  four_lights: FourLightReading[]
  integration: AxisManifestation[]
  /** 統合像＝識。5軸を貫く核を1つの像として描く文章（テーブル化しない・観の山場）。 */
  core: string
  relational_hint: string
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
