import { describe, expect, test } from 'vitest'
import { computeLayer1Distribution } from '@/lib/diagnostics/integration/probability'
import type { FourSystemTrunks } from '@/lib/diagnostics/integration/types'

const baseTrunks: FourSystemTrunks = {
  keirsey: 'nt',
  animalStyle: 'sun',
  zodiacElement: 'fire',
  rokuseiPolarity: '+',
}

function sumDistribution(d: { fire: number; earth: number; air: number; water: number }): number {
  return d.fire + d.earth + d.air + d.water
}

describe('computeLayer1Distribution: Σ=1.00 保存則', () => {
  test('phase なしで Σ=1.00 (±0.001)', () => {
    const d = computeLayer1Distribution(baseTrunks)
    expect(sumDistribution(d)).toBeCloseTo(1.0, 3)
  })

  test('全 4 フェーズで Σ=1.00 を保つ', () => {
    for (const phase of ['spring', 'summer', 'autumn', 'winter'] as const) {
      const d = computeLayer1Distribution(baseTrunks, phase)
      expect(sumDistribution(d), `phase=${phase}`).toBeCloseTo(1.0, 3)
    }
  })

  test('各成分は [0, 1] の範囲内', () => {
    const d = computeLayer1Distribution(baseTrunks, 'summer')
    expect(d.fire).toBeGreaterThanOrEqual(0)
    expect(d.fire).toBeLessThanOrEqual(1)
    expect(d.earth).toBeGreaterThanOrEqual(0)
    expect(d.earth).toBeLessThanOrEqual(1)
    expect(d.air).toBeGreaterThanOrEqual(0)
    expect(d.air).toBeLessThanOrEqual(1)
    expect(d.water).toBeGreaterThanOrEqual(0)
    expect(d.water).toBeLessThanOrEqual(1)
  })
})

describe('computeLayer1Distribution: 体系を変えると分布も変わる', () => {
  test('zodiacElement を fire → water に変えると water 成分が増える', () => {
    const fire = computeLayer1Distribution({ ...baseTrunks, zodiacElement: 'fire' })
    const water = computeLayer1Distribution({ ...baseTrunks, zodiacElement: 'water' })
    expect(water.water).toBeGreaterThan(fire.water)
    expect(fire.fire).toBeGreaterThan(water.fire)
  })

  test('rokuseiPolarity を + → - に変えると water 成分が増える', () => {
    const plus = computeLayer1Distribution({ ...baseTrunks, rokuseiPolarity: '+' })
    const minus = computeLayer1Distribution({ ...baseTrunks, rokuseiPolarity: '-' })
    expect(minus.water).toBeGreaterThan(plus.water)
  })

  test('keirsey を nt → nf に変えると water 成分が増える', () => {
    const nt = computeLayer1Distribution({ ...baseTrunks, keirsey: 'nt' })
    const nf = computeLayer1Distribution({ ...baseTrunks, keirsey: 'nf' })
    expect(nf.water).toBeGreaterThan(nt.water)
  })
})

describe('computeLayer1Distribution: 陽性ケース (sj × autumn) で earth が最大', () => {
  test('sj × earth × earthMode × autumn は earth 最大', () => {
    const d = computeLayer1Distribution(
      {
        keirsey: 'sj',
        animalStyle: 'earthMode',
        zodiacElement: 'earth',
        rokuseiPolarity: '+',
      },
      'autumn',
    )
    expect(d.earth).toBeGreaterThan(d.fire)
    expect(d.earth).toBeGreaterThan(d.air)
    expect(d.earth).toBeGreaterThan(d.water)
  })
})

describe('computeLayer1Distribution: phase 変調が分布を変える', () => {
  test('同一 trunks でも spring と winter で分布が異なる', () => {
    const spring = computeLayer1Distribution(baseTrunks, 'spring')
    const winter = computeLayer1Distribution(baseTrunks, 'winter')
    // spring は air +0.3 が効くため air が増え、winter は water +0.3 が効くため water が増える
    expect(spring.air).toBeGreaterThan(winter.air)
    expect(winter.water).toBeGreaterThan(spring.water)
  })

  test('phase 指定なしと spring で結果が異なる', () => {
    const none = computeLayer1Distribution(baseTrunks)
    const spring = computeLayer1Distribution(baseTrunks, 'spring')
    expect(spring.fire).not.toBeCloseTo(none.fire, 4)
  })
})
