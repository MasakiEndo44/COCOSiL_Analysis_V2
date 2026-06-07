import { describe, it, expect } from 'vitest'
import { deriveStrengthsWeakness } from '@/lib/diagnostics/integration/derive-strengths-weakness'
import {
  STRENGTH,
  WEAKNESS,
  COMMAND_FORM_GUARD,
  SELF_NEGATION_GUARD,
} from '@/lib/data/strength-weakness-vocab'
import {
  OBSERVATION_AXIS_IDS,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import { containsBannedWord } from '@/lib/constitution/banned-words'
import { ProfileCoreSchema } from '@/lib/diagnostics/integration/profile-core'

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

describe('deriveStrengthsWeakness', () => {
  it('決定論的: 同一入力で同一結果', () => {
    const s = scoresWith('cognitive_style', 'relational_mode')
    expect(deriveStrengthsWeakness(s)).toEqual(deriveStrengthsWeakness(s))
  })

  it('強みは上位2軸（最強軸＋第2軸）から', () => {
    const sw = deriveStrengthsWeakness(scoresWith('cognitive_style', 'relational_mode'))
    expect(sw.strengths).toEqual([STRENGTH.cognitive_style, STRENGTH.relational_mode])
  })

  it('弱みは最強軸の影（trait＋exit）', () => {
    const sw = deriveStrengthsWeakness(scoresWith('motivation_drive', 'cognitive_style'))
    expect(sw.weakness).toEqual(WEAKNESS.motivation_drive)
  })

  it('強み2件・弱みは ProfileCore スキーマ部分に適合', () => {
    const sw = deriveStrengthsWeakness(scoresWith('relational_mode', 'emotional_response'))
    expect(() => ProfileCoreSchema.shape.strengths.parse(sw.strengths)).not.toThrow()
    expect(() => ProfileCoreSchema.shape.weakness.parse(sw.weakness)).not.toThrow()
  })

  it('全 top×second で禁止語・命令形・人格否定を含まない', () => {
    for (const [top, second] of PAIRS) {
      const sw = deriveStrengthsWeakness(scoresWith(top, second))
      const texts = [...sw.strengths, sw.weakness.trait, sw.weakness.exit]
      for (const t of texts) {
        expect(containsBannedWord(t), t).toBe(false)
        for (const g of COMMAND_FORM_GUARD) expect(t.includes(g), `${t}/${g}`).toBe(false)
        for (const g of SELF_NEGATION_GUARD) expect(t.includes(g), `${t}/${g}`).toBe(false)
      }
    }
  })

  it('exit は軸ごとに別 tactic（5軸の exit が全て異なる）', () => {
    const exits = OBSERVATION_AXIS_IDS.map((a) => WEAKNESS[a].exit)
    expect(new Set(exits).size).toBe(exits.length)
  })

  it('exit はトリガー（いつ）を含む（似たり寄ったり防止）', () => {
    // 各 exit に行動の発火トリガーらしい語が含まれること
    const triggerHints = ['たら', '前に', '最初', '迷っ']
    for (const a of OBSERVATION_AXIS_IDS) {
      const exit = WEAKNESS[a].exit
      expect(triggerHints.some((h) => exit.includes(h)), exit).toBe(true)
    }
  })
})
