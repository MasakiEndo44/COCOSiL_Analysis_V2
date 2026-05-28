// 3 段階モデル語彙コーパスの共通型
//
// 設計根拠:
//   - docs/input/deep-research/4元素×ユング機能 コア語彙生成.md (Q3a, Layer 1)
//   - docs/input/deep-research/Layer 2 振る舞いスタイル語彙コーパス生成.md (Q3b)
//   - docs/input/deep-research/Layer 3 時期変調コーパス生成.md (Q3c)
//
// 本 vocab は Mutable (Q3a-c の改訂で随時更新可能)。
// 不変構造は lib/constitution/three-layer-model.ts (Immutable Constitution) を参照。

import { z } from 'zod/v4'

export const VocabEntrySchema = z.object({
  term: z.string().min(1).max(20, '特徴語は 20 文字以内'),
  source: z.string().min(1),
  semanticTag: z.string().min(1),
})

export type VocabEntry = z.infer<typeof VocabEntrySchema>

export const LayerVocabularySchema = z.array(VocabEntrySchema).min(15).max(25)

export type LayerVocabulary = VocabEntry[]
