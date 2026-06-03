import { describe, expect, test } from 'vitest'
import {
  computeAxisScores,
  getAxisBounds,
} from '@/lib/diagnostics/integration/affinity-score'
import {
  KEIRSEY_AFFINITY,
  ANIMAL_STYLE_AFFINITY,
  ZODIAC_ELEMENT_AFFINITY,
  ROKUSEI_POLARITY_AFFINITY,
  type AxisWeights,
} from '@/lib/constitution/axis-affinity-matrix'
import {
  OBSERVATION_AXIS_IDS,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import {
  LAYER1_ELEMENTS,
  LAYER2_KEIRSEY_STYLES,
  LAYER2_ANIMAL_STYLES,
} from '@/lib/constitution/three-layer-model'
import type { FourSystemTrunks } from '@/lib/diagnostics/integration/types'

const POLARITIES = ['+', '-'] as const

// 全 4×4×4×2 = 128 trunk 組合せを生成（phase なし）
function allTrunks(): FourSystemTrunks[] {
  const out: FourSystemTrunks[] = []
  for (const keirsey of LAYER2_KEIRSEY_STYLES)
    for (const animalStyle of LAYER2_ANIMAL_STYLES)
      for (const zodiacElement of LAYER1_ELEMENTS)
        for (const rokuseiPolarity of POLARITIES)
          out.push({ keirsey, animalStyle, zodiacElement, rokuseiPolarity })
  return out
}

function std(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length,
  )
}

function topAxis(scores: Record<ObservationAxisId, number>): ObservationAxisId {
  return OBSERVATION_AXIS_IDS.reduce(
    (best, axis) => (scores[axis] > scores[best] ? axis : best),
    OBSERVATION_AXIS_IDS[0],
  )
}

describe('computeAxisScores: 出力の健全性', () => {
  test('全 128 組合せで 5 軸が [0,1] に収まる', () => {
    for (const trunks of allTrunks()) {
      const scores = computeAxisScores(trunks)
      for (const axis of OBSERVATION_AXIS_IDS) {
        expect(scores[axis], `${JSON.stringify(trunks)} / ${axis}`).toBeGreaterThanOrEqual(0)
        expect(scores[axis]).toBeLessThanOrEqual(1)
        expect(Number.isFinite(scores[axis])).toBe(true)
      }
    }
  })

  test('同一 trunks は決定論的に同値（B-3 防止）', () => {
    const trunks: FourSystemTrunks = {
      keirsey: 'nt',
      animalStyle: 'sun',
      zodiacElement: 'fire',
      rokuseiPolarity: '+',
    }
    const first = computeAxisScores(trunks)
    for (let i = 0; i < 10; i++) {
      expect(computeAxisScores(trunks)).toEqual(first)
    }
  })
})

describe('受け入れ基準①: ユーザー間で軸が散る', () => {
  const combos = allTrunks().map(computeAxisScores)

  test.each(OBSERVATION_AXIS_IDS)(
    '軸 %s のユーザー間 std が 0.15 を超える',
    (axis) => {
      const values = combos.map((c) => c[axis])
      expect(std(values)).toBeGreaterThan(0.15)
    },
  )

  test('各軸が [0,1] のほぼ全域を使う（range > 0.8）', () => {
    for (const axis of OBSERVATION_AXIS_IDS) {
      const values = combos.map((c) => c[axis])
      const range = Math.max(...values) - Math.min(...values)
      expect(range, axis).toBeGreaterThan(0.8)
    }
  })
})

describe('受け入れ基準②: 軸間に順位差（デコボコ）', () => {
  const combos = allTrunks().map(computeAxisScores)

  test('軸間 spread の平均が 0.30 を超える', () => {
    const spreads = combos.map((c) => {
      const vals = OBSERVATION_AXIS_IDS.map((a) => c[a])
      return Math.max(...vals) - Math.min(...vals)
    })
    const avg = spreads.reduce((a, b) => a + b, 0) / spreads.length
    expect(avg).toBeGreaterThan(0.3)
  })

  test('5 軸すべてが、いずれかのユーザーの最強軸になる', () => {
    const tops = new Set(combos.map(topAxis))
    expect(tops.size).toBe(OBSERVATION_AXIS_IDS.length)
  })
})

describe('行間距離: 行列が将来 flatten されないことを保証', () => {
  // 各次元の行ベクトル（軸重み）が互いに十分離れていること。
  // これが崩れると全ユーザーが同一スコアに潰れる（Issue #72 の再発条件）。
  function minPairwiseL1(matrix: Record<string, AxisWeights>): number {
    const rows = Object.values(matrix).map((r) =>
      OBSERVATION_AXIS_IDS.map((a) => r[a]),
    )
    let min = Infinity
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const l1 = rows[i].reduce<number>((s, _, k) => s + Math.abs(rows[i][k] - rows[j][k]), 0)
        min = Math.min(min, l1)
      }
    }
    return min
  }

  test.each([
    ['keirsey', KEIRSEY_AFFINITY],
    ['animalStyle', ANIMAL_STYLE_AFFINITY],
    ['zodiacElement', ZODIAC_ELEMENT_AFFINITY],
    ['rokuseiPolarity', ROKUSEI_POLARITY_AFFINITY],
  ] as const)('%s の行間 L1 距離が 3 以上', (_label, matrix) => {
    expect(minPairwiseL1(matrix)).toBeGreaterThanOrEqual(3)
  })
})

describe('getAxisBounds: phase 有無で別系列', () => {
  test('phase あり/なしで bounds が異なる', () => {
    const withPhase = getAxisBounds(true)
    const without = getAxisBounds(false)
    // phase 寄与のある軸（例: relational_mode）で max が広がる
    expect(withPhase.relational_mode.max).toBeGreaterThan(without.relational_mode.max)
  })
})
