// F3 統合レポート — ドメイン型定義
// NOTE: user_reports テーブルが migration 後に生成されるまでの暫定型。
// `pnpm db:types` 実行後は lib/types/database.ts の自動生成型に移行する。

export type GenerationStatus = 'pending' | 'completed' | 'failed'

export type SectionType =
  | 'overview'
  | 'integration'
  | 'relationship'
  | 'strength'
  | 'shadow'
  | 'growth'

export interface ReportSection {
  id: string
  title: string
  content: string
  type: SectionType
}

export interface ReportContent {
  headline: string
  sections: ReportSection[]
}

export interface DiagnosisContext {
  zodiacSign: string
  animalType: string
  animalCharacter: string | null
  sixStar: string
  mbtiType: string | null
}

export type ReportFormat = 'image' | 'markdown'

export interface GenerateReportResult {
  reportId: string
  storageUrl: string | null
  markdownFallback: string
  content: ReportContent
  format: ReportFormat
}

// API レスポンス型
export interface GenerateReportResponse {
  success: true
  reportId: string
  storageUrl: string | null
  markdownFallback: string
  format: ReportFormat
}

export interface GenerateReportErrorResponse {
  success: false
  error: string
  retryable: boolean
}
