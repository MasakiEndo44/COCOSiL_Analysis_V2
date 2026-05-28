import { describe, expect, test } from 'vitest'
import { harvest } from '@/lib/diagnostics/integration/harvest'
import { OBSERVATION_AXIS_IDS } from '@/lib/constitution/observation-axes'
import { BANNED_WORDS } from '@/lib/constitution/banned-words'
import type { MbtiType } from '@/lib/data/three-layer-vocab/twigs'
import type { UserDiagnosticInput } from '@/lib/diagnostics/integration/types'

function buildInput(date: Date, mbti: MbtiType, phase?: 'spring' | 'summer' | 'autumn' | 'winter'): UserDiagnosticInput {
  return { birthDate: date, mbti, phase }
}

describe('harvest: 5 軸スコアの正当性', () => {
  test('5 軸全てが [0, 1] に収まる', () => {
    const result = harvest(buildInput(new Date(1992, 6, 15), 'ENFP', 'summer'))
    for (const axis of OBSERVATION_AXIS_IDS) {
      expect(result.axisScores[axis], `axis=${axis}`).toBeGreaterThanOrEqual(0)
      expect(result.axisScores[axis], `axis=${axis}`).toBeLessThanOrEqual(1)
    }
  })

  test('5 軸全てが定義されている (欠損なし)', () => {
    const result = harvest(buildInput(new Date(1985, 0, 1), 'INTJ'))
    for (const axis of OBSERVATION_AXIS_IDS) {
      expect(Number.isFinite(result.axisScores[axis])).toBe(true)
    }
  })

  test('trunks と layer1Distribution が含まれる (可観測性)', () => {
    const result = harvest(buildInput(new Date(2000, 1, 29), 'ENFJ', 'spring'))
    expect(result.trunks).toBeDefined()
    expect(result.trunks.keirsey).toBe('nf')
    expect(result.layer1Distribution).toBeDefined()
    const sum =
      result.layer1Distribution.fire +
      result.layer1Distribution.earth +
      result.layer1Distribution.air +
      result.layer1Distribution.water
    expect(sum).toBeCloseTo(1.0, 3)
  })
})

describe('harvest: 再現性 (B-3 防止)', () => {
  test('同一入力 × 10 回で全く同じ結果', () => {
    const input = buildInput(new Date(1990, 5, 20), 'ISTP', 'autumn')
    const first = harvest(input)
    for (let i = 0; i < 9; i++) {
      const next = harvest(input)
      expect(next.axisScores).toEqual(first.axisScores)
      expect(next.meta).toBe(first.meta)
    }
  })
})

describe('harvest: meta フィールドの言語規律', () => {
  test('meta は 1 文字以上の日本語文', () => {
    const result = harvest(buildInput(new Date(1995, 8, 10), 'ESTJ'))
    expect(result.meta.length).toBeGreaterThan(0)
    // 句点で終わる (2 文構成)
    expect(result.meta.endsWith('。')).toBe(true)
  })

  test('meta に禁止語 (占い/鑑定/運勢/占星術/当たる/霊感/霊視) を含まない', () => {
    const samples: Array<UserDiagnosticInput> = [
      buildInput(new Date(1985, 0, 1), 'INTJ', 'spring'),
      buildInput(new Date(2000, 1, 29), 'ENFP', 'summer'),
      buildInput(new Date(1998, 7, 15), 'ESTJ', 'autumn'),
      buildInput(new Date(1993, 5, 21), 'ISFP', 'winter'),
      buildInput(new Date(1976, 11, 31), 'INFJ'),
    ]
    for (const input of samples) {
      const result = harvest(input)
      for (const banned of BANNED_WORDS) {
        expect(
          result.meta.includes(banned),
          `meta "${result.meta}" に禁止語 "${banned}" が含まれる`,
        ).toBe(false)
      }
    }
  })

  test('異なる入力で meta が異なる (テンプレート化されていない)', () => {
    const a = harvest(buildInput(new Date(1985, 0, 1), 'INTJ', 'winter'))
    const b = harvest(buildInput(new Date(2000, 6, 15), 'ESFP', 'summer'))
    // 必ずしも全く同じ文字列を返さないことを期待 (axisScores 分布が大きく異なる入力)
    // 完全一致するのは axisScores が偶然同一になった場合のみ
    if (JSON.stringify(a.axisScores) !== JSON.stringify(b.axisScores)) {
      expect(a.meta).not.toBe(b.meta)
    }
  })
})

describe('harvest: フェーズ変調がスコアに影響', () => {
  test('同一トランクで phase を変えると axisScores が変化する', () => {
    const date = new Date(1990, 3, 10)
    const noPhase = harvest({ birthDate: date, mbti: 'ENTJ' })
    const winter = harvest({ birthDate: date, mbti: 'ENTJ', phase: 'winter' })
    // layer3 計算は phase 必須なので no-phase と winter で差が出る
    const same = JSON.stringify(noPhase.axisScores) === JSON.stringify(winter.axisScores)
    expect(same).toBe(false)
  })
})
