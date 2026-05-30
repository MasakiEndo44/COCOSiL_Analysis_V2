// Hybrid Distance (Theory ⊕ Evidence) の計算
//
// 設計根拠:
//   - lib/constitution/three-layer-model.ts §Hybrid Distance Function 設定
//   - Q4 §4.3 階層別 α 提案
//
// 認知科学的階層性:
//   内奥 (Layer 1) ほど理論規則 (Rule) の拘束力が強まる → α 高
//   表層 (Layer 3) ほど文脈 (Embedding) の支配力が強まる → α 低
//
// 現フェーズ (v2):
//   - Rule 部: 軸の observation_keywords と Trunks 対応 vocab の substring 一致
//   - Embedding 部: stub (=0.5 固定)。v3 で OpenAI text-embedding-3-small 等を導入予定。

import {
  HYBRID_DISTANCE_ALPHA,
  type Layer3Phase,
} from '@/lib/constitution/three-layer-model'
import { OBSERVATION_AXES } from '@/lib/constitution/observation-axes'
import { LAYER1_VOCABULARY } from '@/lib/data/three-layer-vocab/layer1'
import { LAYER2_VOCABULARY } from '@/lib/data/three-layer-vocab/layer2'
import { LAYER3_VOCABULARY } from '@/lib/data/three-layer-vocab/layer3'
import type { VocabEntry } from '@/lib/data/three-layer-vocab/types'
import type {
  FourSystemTrunks,
  LayerKey,
  ObservationAxisId,
} from './types'

// ============================================================================
// 階層別 α: Constitution の HYBRID_DISTANCE_ALPHA を layer 単位に解釈
//
// layer1: layer1→layer2 transition の α = 0.7 (Rule 重視)
// layer2: layer1→layer2 と layer2→layer3 の中間点 (Constitution は明示しないため
//         (0.7 + 0.3) / 2 = 0.5 を採用。フラットな解釈。)
// layer3: layer2→layer3 transition の α = 0.3 (Embedding 重視)
// ============================================================================

const LAYER_ALPHA: Record<LayerKey, number> = {
  layer1: HYBRID_DISTANCE_ALPHA.layer1ToLayer2,
  layer2:
    (HYBRID_DISTANCE_ALPHA.layer1ToLayer2 +
      HYBRID_DISTANCE_ALPHA.layer2ToLayer3) /
    2,
  layer3: HYBRID_DISTANCE_ALPHA.layer2ToLayer3,
}

export function getLayerAlpha(layer: LayerKey): number {
  return LAYER_ALPHA[layer]
}

// ============================================================================
// Trunks → 各 Layer の関連 vocab 抽出
// ============================================================================

function collectLayerVocab(
  trunks: FourSystemTrunks,
  layer: LayerKey,
  phase?: Layer3Phase,
): VocabEntry[] {
  switch (layer) {
    case 'layer1':
      // Layer 1: zodiac 由来の元素 (20 語)
      return [...LAYER1_VOCABULARY[trunks.zodiacElement]]
    case 'layer2':
      // Layer 2: keirsey + animalStyle (各 20 語 = 40 語)
      return [
        ...LAYER2_VOCABULARY[trunks.keirsey],
        ...LAYER2_VOCABULARY[trunks.animalStyle],
      ]
    case 'layer3': {
      // Layer 3: phase 指定時のみ (20 語)。未指定なら空集合。
      const p = phase ?? trunks.phase
      return p ? [...LAYER3_VOCABULARY[p]] : []
    }
  }
}

// ============================================================================
// Rule スコア: observation_keywords × vocab の substring 一致を正規化
// ============================================================================

function computeRuleScore(
  keywords: readonly string[],
  vocab: VocabEntry[],
): number {
  if (vocab.length === 0 || keywords.length === 0) return 0

  let matches = 0
  for (const entry of vocab) {
    for (const kw of keywords) {
      if (entry.term.includes(kw)) {
        matches += 1
      }
    }
  }
  // 正規化: 全 vocab × 全 keyword のペアで最大値を 1 とする
  const maxPossible = vocab.length * keywords.length
  return matches / maxPossible
}

// ============================================================================
// Embedding スコア (stub)
// ============================================================================

const EMBEDDING_STUB_SCORE = 0.5

function computeEmbeddingScore(
  _keywords: readonly string[],
  _vocab: VocabEntry[],
): number {
  // TODO (v3): OpenAI text-embedding-3-small で keyword 群と vocab を埋め込み、
  // コサイン類似度の平均を返す。それまでは中立値の 0.5 で hybrid を α 由来に
  // 偏らせる。
  return EMBEDDING_STUB_SCORE
}

// ============================================================================
// 主関数: 軸親和性 (Hybrid Distance) の計算
// ============================================================================

export interface AxisAffinity {
  rule: number
  embedding: number
  alpha: number
  hybrid: number
}

export function computeAxisAffinity(
  trunks: FourSystemTrunks,
  axis: ObservationAxisId,
  layer: LayerKey,
  phase?: Layer3Phase,
): AxisAffinity {
  const keywords = OBSERVATION_AXES[axis].observation_keywords
  const vocab = collectLayerVocab(trunks, layer, phase)
  const rule = computeRuleScore(keywords, vocab)
  const embedding = computeEmbeddingScore(keywords, vocab)
  const alpha = getLayerAlpha(layer)
  const hybrid = alpha * rule + (1 - alpha) * embedding
  return { rule, embedding, alpha, hybrid }
}
