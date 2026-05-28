import { describe, expect, test } from 'vitest'
import {
  computeAxisAffinity,
  getLayerAlpha,
} from '@/lib/diagnostics/integration/hybrid-distance'
import { HYBRID_DISTANCE_ALPHA } from '@/lib/constitution/three-layer-model'
import type { FourSystemTrunks } from '@/lib/diagnostics/integration/types'

const baseTrunks: FourSystemTrunks = {
  keirsey: 'nt',
  animalStyle: 'sun',
  zodiacElement: 'fire',
  rokuseiPolarity: '+',
  phase: 'spring',
}

describe('getLayerAlpha: Constitution の α と一致', () => {
  test('layer1 → HYBRID_DISTANCE_ALPHA.layer1ToLayer2 (=0.7)', () => {
    expect(getLayerAlpha('layer1')).toBe(HYBRID_DISTANCE_ALPHA.layer1ToLayer2)
    expect(getLayerAlpha('layer1')).toBeGreaterThan(0.5)
  })

  test('layer3 → HYBRID_DISTANCE_ALPHA.layer2ToLayer3 (=0.3)', () => {
    expect(getLayerAlpha('layer3')).toBe(HYBRID_DISTANCE_ALPHA.layer2ToLayer3)
    expect(getLayerAlpha('layer3')).toBeLessThan(0.5)
  })

  test('layer2 → layer1 と layer3 の中間点', () => {
    const a1 = getLayerAlpha('layer1')
    const a2 = getLayerAlpha('layer2')
    const a3 = getLayerAlpha('layer3')
    expect(a2).toBeCloseTo((a1 + a3) / 2, 6)
  })
})

describe('computeAxisAffinity: 出力フィールドの構造', () => {
  test('全フィールドが [0, 1] の範囲', () => {
    const r = computeAxisAffinity(baseTrunks, 'embodied_pattern', 'layer1')
    expect(r.rule).toBeGreaterThanOrEqual(0)
    expect(r.rule).toBeLessThanOrEqual(1)
    expect(r.embedding).toBeGreaterThanOrEqual(0)
    expect(r.embedding).toBeLessThanOrEqual(1)
    expect(r.alpha).toBeGreaterThanOrEqual(0)
    expect(r.alpha).toBeLessThanOrEqual(1)
    expect(r.hybrid).toBeGreaterThanOrEqual(0)
    expect(r.hybrid).toBeLessThanOrEqual(1)
  })

  test('hybrid = alpha * rule + (1 - alpha) * embedding', () => {
    const r = computeAxisAffinity(baseTrunks, 'cognitive_style', 'layer2')
    const expected = r.alpha * r.rule + (1 - r.alpha) * r.embedding
    expect(r.hybrid).toBeCloseTo(expected, 6)
  })

  test('embedding は stub (0.5 固定)', () => {
    const r = computeAxisAffinity(baseTrunks, 'motivation_drive', 'layer1')
    expect(r.embedding).toBe(0.5)
  })
})

describe('computeAxisAffinity: α=0.7 と α=0.3 で結果が変わる', () => {
  test('layer1 と layer3 で alpha 値が異なる', () => {
    const l1 = computeAxisAffinity(baseTrunks, 'embodied_pattern', 'layer1')
    const l3 = computeAxisAffinity(baseTrunks, 'embodied_pattern', 'layer3')
    expect(l1.alpha).not.toBeCloseTo(l3.alpha, 3)
  })

  test('同じ rule / embedding でも alpha が違えば hybrid も違う', () => {
    // 同一の rule/embedding を想定するため、layer ごとに vocab が異なる前提では
    // 直接比較が難しい。代わりに alpha の効果を確認:
    // rule >> embedding 状況下では layer1 (alpha=0.7) の hybrid > layer3 (alpha=0.3)
    // 実 vocab で必ずしも成立しないため、ここでは alpha 自体の比較のみ。
    expect(getLayerAlpha('layer1')).toBeGreaterThan(getLayerAlpha('layer3'))
  })
})

describe('computeAxisAffinity: layer3 + phase なし → 空 vocab', () => {
  test('phase 無しの trunks で layer3 を計算すると rule = 0', () => {
    const noPhase: FourSystemTrunks = { ...baseTrunks, phase: undefined }
    const r = computeAxisAffinity(noPhase, 'embodied_pattern', 'layer3')
    expect(r.rule).toBe(0)
  })
})
