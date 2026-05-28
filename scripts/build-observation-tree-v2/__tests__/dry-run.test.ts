// DRY_RUN モードのモック LLM 応答が schema/critique を通貫することを検証する。
//
// 実 LLM 呼び出しは行わない (AI Gateway 認証不要)。
// CI でもこの test で pipeline v2 の構造的健全性を担保する。

import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  OBSERVATION_AXIS_IDS,
} from '@/lib/constitution/observation-axes'
import {
  SYSTEM_IDS,
  type SystemId,
} from '@/lib/constitution/observation-tree-schema'
import { BANNED_WORDS } from '@/lib/constitution/banned-words'
import { loadContext } from '../steps/step1-load'
import { extractObservationTree } from '../steps/step2-extract'
import { validateObservationTree } from '../steps/step3-schema'
import {
  critiqueObservationTree,
  runDeterministicChecks,
} from '../steps/step4-critique'
import { buildMockTree } from '../steps/dry-run-mocks'

const INPUTS_DIR = path.resolve(__dirname, '..', 'inputs')

beforeEach(() => {
  process.env.DRY_RUN = '1'
})

afterEach(() => {
  delete process.env.DRY_RUN
})

describe('build-observation-tree-v2: SystemId 列挙', () => {
  test('SYSTEM_IDS に新規 system が追加されたら test 側も拡張される signal', () => {
    expect(SYSTEM_IDS).toEqual(['zodiac', 'animal', 'rokusei', 'mbti'])
  })
})

describe('buildMockTree: 全 SystemId × 全 ObservationAxisId で Schema を通る', () => {
  for (const system of SYSTEM_IDS) {
    for (const axis of OBSERVATION_AXIS_IDS) {
      test(`${system} × ${axis}`, () => {
        const tree = buildMockTree(system, axis)
        const r = validateObservationTree(tree)
        expect(r.ok, r.ok ? '' : r.errors.join('\n')).toBe(true)
      })
    }
  }
})

describe('runDeterministicChecks: モックは決定論的 critique を 0 違反で通る', () => {
  for (const system of SYSTEM_IDS) {
    test(`${system} × embodied_pattern`, async () => {
      const context = await loadContext({
        system,
        axis: 'embodied_pattern',
        inputsDir: INPUTS_DIR,
      })
      const tree = buildMockTree(system, 'embodied_pattern')
      const violations = runDeterministicChecks({
        system,
        axis: 'embodied_pattern',
        context,
        generatedJson: tree,
      })
      expect(violations).toEqual([])
    })
  }
})

describe('pipeline 統合: zodiac × embodied_pattern を dry-run で通貫', () => {
  test('Step 1 → 2 → 3 → 4 が PASS で完走する', async () => {
    const system: SystemId = 'zodiac'
    const axis = 'embodied_pattern'

    const context = await loadContext({ system, axis, inputsDir: INPUTS_DIR })
    expect(context.markdownInput.length).toBeGreaterThan(0)
    expect(context.twigTermSet.size).toBeGreaterThan(0)

    const step2 = await extractObservationTree({ system, axis, context })
    expect(step2.data.categories.length).toBeGreaterThanOrEqual(3)

    const step3 = validateObservationTree(step2.data)
    expect(step3.ok, step3.ok ? '' : step3.errors.join('\n')).toBe(true)
    if (!step3.ok) return

    const step4 = await critiqueObservationTree({
      system,
      axis,
      context,
      generatedJson: step3.data,
    })
    expect(step4.result.result).toBe('PASS')
    expect(step4.deterministicViolations).toEqual([])
  })
})

describe('runDeterministicChecks: 禁止語混入で FAIL', () => {
  test('feature に禁止語が含まれると violation が立つ', async () => {
    const system: SystemId = 'zodiac'
    const axis = 'embodied_pattern'
    const context = await loadContext({ system, axis, inputsDir: INPUTS_DIR })
    const tree = buildMockTree(system, axis)
    // 1 件だけ禁止語混入
    const corrupted = {
      ...tree,
      categories: tree.categories.map((c, i) =>
        i === 0
          ? {
              ...c,
              features: [...c.features.slice(0, -1), `${BANNED_WORDS[0]}テスト`],
            }
          : c,
      ),
    }
    const violations = runDeterministicChecks({
      system,
      axis,
      context,
      generatedJson: corrupted,
    })
    expect(violations.length).toBeGreaterThan(0)
    expect(violations.some((v) => v.type === 'broken_japanese')).toBe(true)
  })
})

describe('runDeterministicChecks: ホワイトリスト外語で FAIL', () => {
  test('twigs 集合に存在しない語は info_loss_from_source 違反', async () => {
    const system: SystemId = 'zodiac'
    const axis = 'embodied_pattern'
    const context = await loadContext({ system, axis, inputsDir: INPUTS_DIR })
    const tree = buildMockTree(system, axis)
    const corrupted = {
      ...tree,
      categories: tree.categories.map((c, i) =>
        i === 0
          ? {
              ...c,
              features: [...c.features.slice(0, -1), '架空の創作特徴語'],
            }
          : c,
      ),
    }
    const violations = runDeterministicChecks({
      system,
      axis,
      context,
      generatedJson: corrupted,
    })
    expect(violations.some((v) => v.type === 'info_loss_from_source')).toBe(true)
  })
})
