import { describe, it, expect } from 'vitest'
import {
  buildDistribution,
  getDesignSpaceScores,
} from '@/lib/diagnostics/integration/build-distribution'
import { deriveBlindspots } from '@/lib/diagnostics/integration/derive-blindspots'
import { harvest } from '@/lib/diagnostics/integration/harvest'
import {
  OBSERVATION_AXIS_IDS,
  OBSERVATION_AXES,
} from '@/lib/constitution/observation-axes'
import { DistributionEntrySchema } from '@/lib/diagnostics/integration/profile-core'

const SAMPLE = { birthDate: new Date('1999-04-19'), mbti: 'ENFP' } as const

describe('buildDistribution', () => {
  it('全 5 軸のエントリを返し、各エントリは schema 準拠', () => {
    const dist = buildDistribution(harvest(SAMPLE).axisScores)
    expect(dist).toHaveLength(OBSERVATION_AXIS_IDS.length)
    for (const entry of dist) {
      expect(() => DistributionEntrySchema.parse(entry)).not.toThrow()
      expect(entry.origin).toBe('設計上の理論分布')
    }
  })

  it('決定論的: 同一スコアで同一パーセンタイル', () => {
    const scores = harvest(SAMPLE).axisScores
    expect(buildDistribution(scores)).toEqual(buildDistribution(scores))
  })

  it('設計空間の最小スコアは低 percentile、最大スコアは percentile=100', () => {
    const space = getDesignSpaceScores()
    const axis = OBSERVATION_AXIS_IDS[0]
    const min = space[axis][0]
    const max = space[axis][space[axis].length - 1]
    const minPct = buildDistribution({
      ...zeroScores(),
      [axis]: min,
    } as Record<string, number>).find((d) => d.axis === axis)!.percentile
    const maxPct = buildDistribution({
      ...zeroScores(),
      [axis]: max,
    } as Record<string, number>).find((d) => d.axis === axis)!.percentile
    expect(maxPct).toBe(100)
    expect(minPct).toBeLessThanOrEqual(maxPct)
  })

  it('設計空間は 4×4×4×2 = 128 通りを列挙している', () => {
    const space = getDesignSpaceScores()
    expect(space[OBSERVATION_AXIS_IDS[0]]).toHaveLength(128)
  })
})

describe('deriveBlindspots', () => {
  it('決定論的: 同一入力で同一結果', () => {
    const scores = harvest(SAMPLE).axisScores
    expect(deriveBlindspots(scores)).toEqual(deriveBlindspots(scores))
  })

  it('先頭軸（最高スコア）は盲点に含めない', () => {
    const scores = harvest(SAMPLE).axisScores
    const head = [...OBSERVATION_AXIS_IDS].sort((a, b) => scores[b] - scores[a])[0]
    expect(deriveBlindspots(scores).some((b) => b.sourceAxis === head)).toBe(false)
  })

  it('text は承認済みの観察軸ラベル（label_ja）を使う', () => {
    const scores = harvest(SAMPLE).axisScores
    for (const b of deriveBlindspots(scores)) {
      expect(b.text).toBe(OBSERVATION_AXES[b.sourceAxis].label_ja)
    }
  })
})

function zeroScores(): Record<string, number> {
  return Object.fromEntries(OBSERVATION_AXIS_IDS.map((id) => [id, 0]))
}
