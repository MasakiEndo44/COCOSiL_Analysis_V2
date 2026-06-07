import { describe, it, expect } from 'vitest'
import {
  ProfileCoreSchema,
  Type32Schema,
  PROFILE_CORE_VERSION,
} from '@/lib/diagnostics/integration/profile-core'
import { OBSERVATION_AXIS_IDS } from '@/lib/constitution/observation-axes'

function validAxisScores(): Record<string, number> {
  return Object.fromEntries(OBSERVATION_AXIS_IDS.map((id) => [id, 0.5]))
}

function validCore() {
  return {
    axisScores: validAxisScores(),
    type32: 'INTJ-A',
    identity: 'A',
    characterLabel: '慎重な調停者',
    strengths: ['一貫した判断軸', '静かな観察力'],
    weakness: {
      trait: '負荷が高い場面で抱え込みやすい',
      exit: 'だから早めに一言共有するとラクになる',
    },
    johariBlindspots: [
      { text: '場を整える調整力', sourceAxis: 'relational_mode' },
    ],
    distribution: [
      { axis: 'cognitive_style', percentile: 72, origin: '同タイプ内傾向' },
    ],
    weights: {
      keirsey: 0.6,
      animalStyle: 0.15,
      zodiacElement: 0.15,
      rokuseiPolarity: 0.1,
    },
    seed: 'abc123',
    version: PROFILE_CORE_VERSION,
  }
}

describe('ProfileCoreSchema', () => {
  it('正常な ProfileCore を parse できる', () => {
    expect(() => ProfileCoreSchema.parse(validCore())).not.toThrow()
  })

  it('5 軸すべてが必須（欠落で reject）', () => {
    const core = validCore()
    delete (core.axisScores as Record<string, number>)[OBSERVATION_AXIS_IDS[0]]
    expect(() => ProfileCoreSchema.parse(core)).toThrow()
  })

  it('軸スコアは [0,1] の範囲外を reject', () => {
    const core = validCore()
    core.axisScores[OBSERVATION_AXIS_IDS[0]] = 1.5
    expect(() => ProfileCoreSchema.parse(core)).toThrow()
  })

  it('strengths は 2 件固定（1 件は reject）', () => {
    const core = validCore()
    ;(core as { strengths: string[] }).strengths = ['一つだけ']
    expect(() => ProfileCoreSchema.parse(core)).toThrow()
  })

  it('weakness は trait と exit の両方が必須', () => {
    const core = validCore()
    ;(core as { weakness: { trait: string } }).weakness = { trait: '癖だけ' }
    expect(() => ProfileCoreSchema.parse(core)).toThrow()
  })

  it('distribution.origin は出自を一般分布と詐称できない（enum 外を reject）', () => {
    const core = validCore()
    core.distribution[0].origin = '一般分布' as never
    expect(() => ProfileCoreSchema.parse(core)).toThrow()
  })
})

describe('Type32Schema', () => {
  it.each(['INTJ-A', 'ENFP-T', 'ESTP-A'])('%s を受理する', (t) => {
    expect(() => Type32Schema.parse(t)).not.toThrow()
  })

  it.each(['INTJ', 'INTJ-X', 'intj-a', 'INTJA'])('%s を reject する', (t) => {
    expect(() => Type32Schema.parse(t)).toThrow()
  })
})
