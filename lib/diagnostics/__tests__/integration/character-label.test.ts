import { describe, it, expect } from 'vitest'
import { buildCharacterLabel } from '@/lib/diagnostics/integration/build-character-label'
import {
  CORE_NOUN,
  NOUN_GRID,
  ADJECTIVE,
  EXAGGERATION_GUARD,
} from '@/lib/data/character-label-vocab'
import {
  OBSERVATION_AXIS_IDS,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import { containsBannedWord } from '@/lib/constitution/banned-words'
import type { Identity } from '@/lib/diagnostics/integration/profile-core'

// top を最大、second を 2 番目にした axisScores を組む
function scoresWith(top: ObservationAxisId, second: ObservationAxisId): Record<ObservationAxisId, number> {
  const s = Object.fromEntries(OBSERVATION_AXIS_IDS.map((id) => [id, 0.1])) as Record<ObservationAxisId, number>
  s[top] = 0.9
  s[second] = 0.6
  return s
}

const PAIRS: [ObservationAxisId, ObservationAxisId][] = []
for (const top of OBSERVATION_AXIS_IDS)
  for (const second of OBSERVATION_AXIS_IDS)
    if (top !== second) PAIRS.push([top, second])

const IDENTITIES: Identity[] = ['A', 'T']

describe('buildCharacterLabel', () => {
  it('決定論的: 同一入力で同一ラベル', () => {
    const s = scoresWith('cognitive_style', 'relational_mode')
    expect(buildCharacterLabel(s, 'A')).toBe(buildCharacterLabel(s, 'A'))
  })

  it('合成例が期待どおり', () => {
    expect(buildCharacterLabel(scoresWith('cognitive_style', 'relational_mode'), 'A')).toBe('社交的な翻訳者')
    expect(buildCharacterLabel(scoresWith('relational_mode', 'cognitive_style'), 'T')).toBe('思慮深い進行役')
    expect(buildCharacterLabel(scoresWith('motivation_drive', 'cognitive_style'), 'A')).toBe('明晰な戦略家')
  })

  it('立たないセルは核名詞へフォールバック', () => {
    // cognitive_style × embodied_pattern は NOUN_GRID 未定義 → 核名詞「分析者」
    expect(NOUN_GRID.cognitive_style?.embodied_pattern).toBeUndefined()
    const label = buildCharacterLabel(scoresWith('cognitive_style', 'embodied_pattern'), 'T')
    expect(label.endsWith(CORE_NOUN.cognitive_style)).toBe(true)
  })

  it('全 top×second×identity で空でなく禁止語・誇張語を含まない', () => {
    for (const [top, second] of PAIRS) {
      for (const identity of IDENTITIES) {
        const label = buildCharacterLabel(scoresWith(top, second), identity)
        expect(label.length).toBeGreaterThan(0)
        expect(containsBannedWord(label), label).toBe(false)
        for (const g of EXAGGERATION_GUARD) {
          expect(label.includes(g), `${label} contains ${g}`).toBe(false)
        }
      }
    }
  })

  it('語彙テーブル自体も禁止語・誇張語フリー', () => {
    const allWords = [
      ...Object.values(CORE_NOUN),
      ...Object.values(NOUN_GRID).flatMap((row) => Object.values(row ?? {})),
      ...Object.values(ADJECTIVE).flatMap((m) => Object.values(m)),
    ]
    for (const w of allWords) {
      expect(containsBannedWord(w), w).toBe(false)
      for (const g of EXAGGERATION_GUARD) expect(w.includes(g), `${w}/${g}`).toBe(false)
    }
  })

  it('固有名詞に重複がない（One Name per cell の識別性）', () => {
    const distinct = Object.values(NOUN_GRID).flatMap((row) => Object.values(row ?? {}))
    expect(new Set(distinct).size).toBe(distinct.length)
  })
})
