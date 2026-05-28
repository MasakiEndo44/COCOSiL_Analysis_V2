// F3.1 4 体系統合アルゴリズム: 共通型定義
//
// 設計根拠:
//   - docs/output/goals/f3-keyword-tree-integration.md (Tree of 4, Harvest 1.)
//   - lib/constitution/three-layer-model.ts (Constitution-as-Code)
//   - lib/constitution/observation-axes.ts (5 軸 + 識メタ層)
//
// 設計原則:
//   ① ユーザー入力 (生年月日 + MBTI) → 4 体系 Trunks への射影は決定論的
//   ② 確率分布計算は Σ=1.00 保存則を満たす
//   ③ Layer 3 phase は optional (省略時はフェーズ変調なし)
//   ④ Harvest 結果は LLM を使わず純関数で導出 (再現性確保)

import { z } from 'zod/v4'
import type {
  Layer1Element,
  Layer2KeirseyStyle,
  Layer2AnimalStyle,
  Layer3Phase,
} from '@/lib/constitution/three-layer-model'
import type { ObservationAxisId } from '@/lib/constitution/observation-axes'
import { OBSERVATION_AXIS_IDS } from '@/lib/constitution/observation-axes'
import type { MbtiType } from '@/lib/data/three-layer-vocab/twigs'
import { MBTI_TYPES } from '@/lib/data/three-layer-vocab/twigs'

// ============================================================================
// 入力: ユーザー診断データ
// ============================================================================

export const UserDiagnosticInputSchema = z.object({
  birthDate: z.date(),
  mbti: z.enum(MBTI_TYPES),
  phase: z.enum(['spring', 'summer', 'autumn', 'winter']).optional(),
})

export type UserDiagnosticInput = z.infer<typeof UserDiagnosticInputSchema>

// ============================================================================
// 中間結果: 4 体系 Trunks (大分類)
// ============================================================================

export const RokuseiPolaritySchema = z.enum(['+', '-'])
export type RokuseiPolarity = z.infer<typeof RokuseiPolaritySchema>

export interface FourSystemTrunks {
  keirsey: Layer2KeirseyStyle // MBTI 4 文字 → sp/sj/nf/nt
  animalStyle: Layer2AnimalStyle // 動物 60 → 4 モード (sun/earthMode/fullMoon/newMoon)
  zodiacElement: Layer1Element // 12 サイン → 4 元素 (fire/earth/air/water)
  rokuseiPolarity: RokuseiPolarity // 六星 12 タイプ → +/-
  phase?: Layer3Phase // 時期フェーズ (optional)
}

// ============================================================================
// 出力: Harvest 結果 (5 軸スコア + 識メタ層)
// ============================================================================

export interface HarvestResult {
  axisScores: Record<ObservationAxisId, number> // 各軸 [0..1]
  meta: string // 識: 5 軸スコアから branching で生成 (1-2 文)
  trunks: FourSystemTrunks // 計算根拠 (デバッグ・可観測性)
  layer1Distribution: {
    fire: number
    earth: number
    air: number
    water: number
  }
}

// ============================================================================
// 補助: Layer 階層識別子 (Hybrid Distance API で使用)
// ============================================================================

export const LAYER_KEYS = ['layer1', 'layer2', 'layer3'] as const
export type LayerKey = (typeof LAYER_KEYS)[number]

// 観察軸 ID re-export (利便性)
export { OBSERVATION_AXIS_IDS, type ObservationAxisId, type MbtiType }
