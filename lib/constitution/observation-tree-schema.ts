// COCOSiL Constitution: F3.1 観察軸ツリーデータの Zod スキーマ
// パイプライン Step 3（決定論的 Schema 検証）で使用。
// 議論計画.md（2026-05-27）の §3.1 Schema-First, Content-Second に基づく。
//
// 根拠:
//   - docs/output/F3/observation-tree-pipeline.md（パイプライン全体設計）
//   - docs/discussions/議論ログ_F3-1観察軸5軸確定.md
//   - lib/constitution/observation-axes.ts（軸の単一の真実）
//   - lib/constitution/banned-words.ts（禁止語彙の単一の真実）
//
// 設計原則（パイプライン§2）:
//   ⑤ Empty Sources = Pipeline Fail
//   - primary_sources 空配列は Schema レベルで reject
//   - vector 多様性（3値全出現）と confidence 分散（≥0.10）も体系レベルで強制

import { z } from 'zod/v4'
import { OBSERVATION_AXIS_IDS } from './observation-axes'
import { BANNED_WORDS } from './banned-words'

export const VECTOR_VALUES = ['positive', 'negative', 'neutral'] as const
export type Vector = (typeof VECTOR_VALUES)[number]

export const SYSTEM_IDS = ['zodiac', 'animal', 'rokusei', 'mbti'] as const
export type SystemId = (typeof SYSTEM_IDS)[number]

export const PRIMARY_SOURCE_TYPES = ['book', 'academic', 'web'] as const
export type PrimarySourceType = (typeof PRIMARY_SOURCE_TYPES)[number]

export const PrimarySourceSchema = z.object({
  citation: z.string().min(10, '引用記述は10文字以上必要'),
  type: z.enum(PRIMARY_SOURCE_TYPES),
  url: z.string().url().optional(),
})

export const VectorSchema = z.enum(VECTOR_VALUES)

export const FeatureSchema = z
  .string()
  .min(1)
  .max(20, '特徴語は20文字以内')
  .refine(
    (s) => !BANNED_WORDS.some((w) => s.includes(w)),
    { message: '禁止語彙の混入（占い・鑑定・運勢・霊感等）' },
  )

export const CategorySchema = z.object({
  category_id: z.string().regex(/^[a-z][a-z0-9_]*$/, 'snake_case の英小文字のみ'),
  category_label_ja: z.string().min(1),
  features: z.array(FeatureSchema).min(5).max(10),
  vector: VectorSchema,
  confidence: z.number().min(0.3).max(1.0),
  primary_sources: z
    .array(PrimarySourceSchema)
    .min(2, 'primary_sources は最低2件必須（空配列は不可）')
    .refine(
      (sources) => sources.some((s) => s.type === 'book' || s.type === 'academic'),
      { message: 'primary_sources に書籍または学術記事を最低1件含める必要がある' },
    ),
})

export type Category = z.infer<typeof CategorySchema>

export const ObservationTreeDataSchema = z
  .object({
    system: z.enum(SYSTEM_IDS),
    axis: z.enum(OBSERVATION_AXIS_IDS as readonly [string, ...string[]]),
    generated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 形式'),
    source_method: z.literal('deep-research-pipeline'),
    categories: z.array(CategorySchema).min(1),
    axis_definition_used: z.string().min(1),
    observation_keywords_used: z.array(z.string()).min(3).max(5),
  })
  .refine(
    (data) => {
      const vectors = new Set(data.categories.map((c) => c.vector))
      return vectors.has('positive') && vectors.has('negative') && vectors.has('neutral')
    },
    {
      message:
        '体系内で positive/negative/neutral の3vectorが全て出現する必要がある（議論計画§3.1 欠陥②: LLMポジティブバイアス対策）',
    },
  )
  .refine(
    (data) => {
      const values = data.categories.map((c) => c.confidence)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
      const stdDev = Math.sqrt(variance)
      return stdDev >= 0.1
    },
    {
      message:
        'confidence の体系内標準偏差が 0.10 未満（飽和状態、議論計画§3.1 欠陥①: ルーブリック欠如対策）',
    },
  )

export type ObservationTreeData = z.infer<typeof ObservationTreeDataSchema>

// パイプライン Step 4（Critique LLM）の出力スキーマ
export const CRITIQUE_VIOLATION_TYPES = [
  'vector_diversity',
  'sources',
  'axis_purity',
  'stereotype',
  'gender_bias',
  'broken_japanese',
  'info_loss_from_source',
] as const
export type CritiqueViolationType = (typeof CRITIQUE_VIOLATION_TYPES)[number]

export const CritiqueResultSchema = z.object({
  result: z.enum(['PASS', 'FAIL']),
  violations: z.array(
    z.object({
      category: z.string(),
      type: z.enum(CRITIQUE_VIOLATION_TYPES),
      detail: z.string(),
    }),
  ),
  retry_hints: z.string(),
})

export type CritiqueResult = z.infer<typeof CritiqueResultSchema>
