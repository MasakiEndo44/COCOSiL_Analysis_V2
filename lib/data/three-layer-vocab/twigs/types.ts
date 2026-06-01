// F3.1 葉ノード (Twigs) 4 体系語彙コーパスの共通型
//
// 設計根拠:
//   - docs/input/deep-research/12星座葉ノード語彙コーパス生成.md (Q5a)
//   - docs/input/deep-research/動物キャラ分類語彙コーパス生成.md (Q5b-1)
//   - docs/input/deep-research/動物語彙コーパス後半30体作成.md (Q5b-2)
//   - docs/input/deep-research/動物キャラクター分類語彙コーパス補完.md (Q5b-3)
//   - docs/input/deep-research/Q5c_16MBTI葉ノード語彙コーパス生成.md (Q5c)
//   - docs/input/deep-research/Q5d_12六星人葉ノード語彙コーパス生成.md (Q5d)
//   - docs/output/F3/animal-60-name-mapping.md (動物 60 公式呼称マッピング)
//
// 本 vocab は Mutable (Q5 系の改訂で随時更新可能)。
// 葉ノード共通の VocabEntry 構造は lib/data/three-layer-vocab/types.ts を継承し、
// 体系固有メタ情報 (officialId / baseAnimal 等) を拡張フィールドで保持する。

import { z } from 'zod/v4'
import { VocabEntrySchema, type VocabEntry } from '../types'

// ============================================================================
// TwigEntry: VocabEntry に意味カテゴリ (Q5 各 DR のメタ情報) を任意で付与
// ============================================================================

export const TwigEntrySchema = VocabEntrySchema.extend({
  semanticCategory: z.string().optional(),
})

export type TwigEntry = z.infer<typeof TwigEntrySchema>

// ============================================================================
// 動物 60: 公式 ID (1-60) ↔ 公式呼称 ↔ 基本動物の整合性を保持
// 出典: lib/data/animal-characters.ts (Single Source of Truth)
// ============================================================================

export const AnimalTwigEntrySchema = TwigEntrySchema.extend({
  officialId: z.number().int().min(1).max(60),
  officialName: z.string().min(1),
  baseAnimal: z.string().min(1),
})

export type AnimalTwigEntry = z.infer<typeof AnimalTwigEntrySchema>

// 公式 60 体それぞれに 8 語の特徴語コーパスを保持する
export const AnimalVocabularyByIdSchema = z.record(
  z.string().regex(/^\d+$/),
  z.array(AnimalTwigEntrySchema).length(8),
)

export type AnimalVocabularyById = Record<number, AnimalTwigEntry[]>

// ============================================================================
// 12 星座
// ============================================================================

export const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number]

// ============================================================================
// 16 MBTI タイプ
// ============================================================================

export const MBTI_TYPES = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
] as const

export type MbtiType = (typeof MBTI_TYPES)[number]

// ============================================================================
// 12 六星人 (六星占術)
// ============================================================================

export const ROKUSEI_TYPES = [
  'saturnPlus',
  'saturnMinus',
  'venusPlus',
  'venusMinus',
  'marsPlus',
  'marsMinus',
  'uranusPlus',
  'uranusMinus',
  'jupiterPlus',
  'jupiterMinus',
  'mercuryPlus',
  'mercuryMinus',
] as const

export type RokuseiType = (typeof ROKUSEI_TYPES)[number]

// ============================================================================
// 体系名 (twigs 間メタ参照用)
// ============================================================================

export const TWIG_SYSTEMS = ['zodiac', 'animal', 'mbti', 'rokusei'] as const
export type TwigSystem = (typeof TWIG_SYSTEMS)[number]

// VocabEntry 互換 (Layer 1/2/3 との横断検証で使用)
export type { VocabEntry }
