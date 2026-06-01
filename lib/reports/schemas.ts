import { z } from 'zod/v4'
import { MBTI_TYPES } from '@/lib/data/three-layer-vocab/twigs'

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

export interface ReportContent {
  catchphrase: string
  opening: string
  four_lights: string
  integration: string
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
