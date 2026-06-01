import type { ReportContent } from './schemas'
import { REPORT_SECTION_IDS } from '@/lib/prompts/integrated-report'

export interface FallbackSection {
  id: string
  label: string
  text: string
}

const SECTION_LABELS: Record<string, string> = {
  catchphrase: 'あなたという人',
  opening: 'はじめに',
  four_lights: '4つの視点',
  integration: '統合像',
  relational_hint: '大切な人との関係',
  closing: 'おわりに',
}

export function buildFallbackSections(content: ReportContent): FallbackSection[] {
  return REPORT_SECTION_IDS.map((id) => ({
    id,
    label: SECTION_LABELS[id] ?? id,
    text: content[id] ?? '',
  })).filter((s) => s.text.length > 0)
}
