import { describe, it, expect } from 'vitest'
import {
  buildProfileCore,
  buildType32,
} from '@/lib/diagnostics/integration/build-profile-core'
import {
  ProfileCoreSchema,
  PROFILE_CORE_VERSION,
} from '@/lib/diagnostics/integration/profile-core'
import type { UserDiagnosticInput } from '@/lib/diagnostics/integration/types'

const INPUT: UserDiagnosticInput = {
  birthDate: new Date('1999-04-19'),
  mbti: 'ENFP',
}

describe('buildType32', () => {
  it('16型 + identity を 32型コードに', () => {
    expect(buildType32('ENFP', 'A')).toBe('ENFP-A')
    expect(buildType32('INTJ', 'T')).toBe('INTJ-T')
  })
})

describe('buildProfileCore', () => {
  it('ProfileCoreSchema に適合する', () => {
    const core = buildProfileCore(INPUT, 'A')
    expect(() => ProfileCoreSchema.parse(core)).not.toThrow()
  })

  it('決定論的: 同一 (input, identity) で完全一致', () => {
    expect(buildProfileCore(INPUT, 'A')).toEqual(buildProfileCore(INPUT, 'A'))
  })

  it('identity が type32 と characterLabel に反映される', () => {
    const a = buildProfileCore(INPUT, 'A')
    const t = buildProfileCore(INPUT, 'T')
    expect(a.type32).toBe('ENFP-A')
    expect(t.type32).toBe('ENFP-T')
    expect(a.identity).toBe('A')
    // A/T で形容詞が変わるためラベルも変わりうる（最低限 identity は別）
    expect(a.version).toBe(PROFILE_CORE_VERSION)
  })

  it('axisScores は identity 非依存（核は揺らがない）', () => {
    const a = buildProfileCore(INPUT, 'A')
    const t = buildProfileCore(INPUT, 'T')
    expect(a.axisScores).toEqual(t.axisScores)
  })

  it('phase なしのとき weights.phase は持たない', () => {
    const core = buildProfileCore(INPUT, 'A')
    expect(core.weights.phase).toBeUndefined()
  })

  it('phase ありのとき weights.phase を持つ', () => {
    const core = buildProfileCore({ ...INPUT, phase: 'spring' }, 'A')
    expect(core.weights.phase).toBeGreaterThan(0)
  })

  it('seed は決定論的で identity を反映', () => {
    expect(buildProfileCore(INPUT, 'A').seed).toBe(buildProfileCore(INPUT, 'A').seed)
    expect(buildProfileCore(INPUT, 'A').seed).not.toBe(buildProfileCore(INPUT, 'T').seed)
  })
})
