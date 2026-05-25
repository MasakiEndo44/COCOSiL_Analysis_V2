import { z } from 'zod/v4'

// API 入力検証スキーマ（POST /api/reports/generate）
export const GenerateReportInputSchema = z.object({
  diagnosisId: z.string().uuid().optional(),
  mbtiResultId: z.string().uuid().optional(),
  zodiacSign: z.string().min(1),
  animalType: z.string().min(1),
  animalCharacter: z.string().nullable().optional(),
  sixStar: z.string().min(1),
  mbtiType: z.string().nullable().optional(),
  userId: z.string().optional(),
})

export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>

// LLM 出力検証スキーマ（ReportContent の構造）
export const ReportSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['overview', 'integration', 'relationship', 'strength', 'shadow', 'growth']),
})

export const ReportContentSchema = z.object({
  headline: z.string().min(1).max(30),
  sections: z.array(ReportSectionSchema).min(4),
})

export type ReportContentSchemaOutput = z.infer<typeof ReportContentSchema>
