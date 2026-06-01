// Layer 1 確率分布計算 (N:M 確率対応モデル + フェーズ変調)
//
// 4 体系の Trunks 表象を Layer 1 (4 元素) 確率ベクトルに変換し、
// 平均集約 → Layer 3 フェーズ変調 → Σ=1.00 再正規化。
//
// 根拠:
//   - lib/constitution/three-layer-model.ts (LAYER2_TO_LAYER1, applyPhaseModulation)
//   - Q4 §5.1 学術的に正当化された N:M 確率分布
//   - Q5d §13.3 六星人 12 タイプ × Layer 1 主成分対応表
//
// 注意: zodiac は既に Layer 1 (元素) なので one-hot。
//       rokusei polarity は Q5d の 6 ペア × 2 元素割当 (1 タイプあたり 2 元素均等) を
//       極性別に経験的に平均した分布を用いる。
//       (詳細導出は docs/discussions/議論ログ_4体系統合メソッド幹と枝モデル.md 参照)

import {
  LAYER2_TO_LAYER1,
  applyPhaseModulationToLayer1,
  type Layer1Element,
  type Layer3Phase,
} from '@/lib/constitution/three-layer-model'
import type { FourSystemTrunks, RokuseiPolarity } from './types'

type Distribution = { fire: number; earth: number; air: number; water: number }

// ============================================================================
// 各体系 → Layer 1 確率分布への射影
// ============================================================================

/** zodiac (Layer 1 の元素そのもの) を one-hot 化 */
function zodiacToLayer1(element: Layer1Element): Distribution {
  return {
    fire: element === 'fire' ? 1 : 0,
    earth: element === 'earth' ? 1 : 0,
    air: element === 'air' ? 1 : 0,
    water: element === 'water' ? 1 : 0,
  }
}

/**
 * 六星人 polarity の経験的 Layer 1 分布
 *
 * Q5d 各タイプの 2 元素ペア (各 0.5/0.5) を 6 タイプで平均:
 *   ＋ 群 (土星人+/金星人+/火星人+/天王星人+/木星人+/水星人+):
 *     2(Fire) + 1.5(Earth) + 2(Air) + 0.5(Water) → /6 → 正規化
 *   − 群 (各 -):
 *     1(Fire) + 1.5(Earth) + 1(Air) + 2.5(Water) → /6 → 正規化
 *
 * 結果: + は active 元素 (Fire/Air) 寄り、- は receptive 元素 (Water) 寄り。
 */
const ROKUSEI_POLARITY_DISTRIBUTION: Record<RokuseiPolarity, Distribution> = {
  '+': { fire: 0.333, earth: 0.25, air: 0.333, water: 0.083 },
  '-': { fire: 0.167, earth: 0.25, air: 0.167, water: 0.417 },
}

function rokuseiToLayer1(polarity: RokuseiPolarity): Distribution {
  return normalize(ROKUSEI_POLARITY_DISTRIBUTION[polarity])
}

// ============================================================================
// 集約 + 変調 + 正規化
// ============================================================================

function average(dists: Distribution[]): Distribution {
  const n = dists.length
  const sum: Distribution = { fire: 0, earth: 0, air: 0, water: 0 }
  for (const d of dists) {
    sum.fire += d.fire
    sum.earth += d.earth
    sum.air += d.air
    sum.water += d.water
  }
  return {
    fire: sum.fire / n,
    earth: sum.earth / n,
    air: sum.air / n,
    water: sum.water / n,
  }
}

function normalize(d: Distribution): Distribution {
  const s = d.fire + d.earth + d.air + d.water
  if (s === 0) {
    // 入力が完全に空の場合の防御。理論上は到達しないが Σ=1.00 保存則を満たすため均等分布を返す。
    return { fire: 0.25, earth: 0.25, air: 0.25, water: 0.25 }
  }
  return {
    fire: d.fire / s,
    earth: d.earth / s,
    air: d.air / s,
    water: d.water / s,
  }
}

/**
 * 4 体系 Trunks → Layer 1 確率分布
 *
 * 手順:
 *   1. 4 体系を個別に Layer 1 分布化
 *      - keirsey, animalStyle: LAYER2_TO_LAYER1 を適用
 *      - zodiac: one-hot
 *      - rokusei: 極性別経験分布
 *   2. 4 分布を等加重平均
 *   3. phase が指定されていれば applyPhaseModulationToLayer1 で変調
 *   4. Σ=1.00 となるよう再正規化 (clipping 後に必須)
 */
export function computeLayer1Distribution(
  trunks: FourSystemTrunks,
  phase?: Layer3Phase,
): Distribution {
  const dists: Distribution[] = [
    LAYER2_TO_LAYER1[trunks.keirsey],
    LAYER2_TO_LAYER1[trunks.animalStyle],
    zodiacToLayer1(trunks.zodiacElement),
    rokuseiToLayer1(trunks.rokuseiPolarity),
  ]
  const averaged = normalize(average(dists))

  const activePhase = phase ?? trunks.phase
  if (!activePhase) {
    return averaged
  }
  // applyPhaseModulationToLayer1 は内部で正規化済みだが、念のため再正規化。
  return normalize(applyPhaseModulationToLayer1(averaged, activePhase))
}
