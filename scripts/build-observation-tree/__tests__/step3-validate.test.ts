import { describe, expect, test } from 'vitest'
import { validateObservationTree, formatRetryHints } from '../steps/step3-validate'

const VALID_SOURCES = [
  { citation: 'プトレマイオス『テトラビブロス』第3巻', type: 'book' as const },
  { citation: 'Lilly W., Christian Astrology (1647)', type: 'book' as const },
]

const makeCategory = (overrides: Partial<Record<string, unknown>> = {}) => ({
  category_id: 'aries',
  category_label_ja: '牡羊座',
  features: [
    '瞬発的な運動エネルギー',
    '急進的な行動テンポ',
    '熱狂的な胆汁質',
    '頭部への血流集中',
    '急性な発熱反応',
  ],
  vector: 'positive' as const,
  confidence: 0.85,
  primary_sources: VALID_SOURCES,
  ...overrides,
})

const makeValidTree = () => ({
  system: 'zodiac' as const,
  axis: 'embodied_pattern' as const,
  generated_at: '2026-05-27',
  source_method: 'deep-research-pipeline' as const,
  axis_definition_used:
    '体質・気質・行動テンポ・エネルギー水準など、身体性に根ざした個人特性',
  observation_keywords_used: ['気質', '体質', 'テンポ', 'エネルギー', '気力'],
  categories: [
    makeCategory({ category_id: 'a1', vector: 'positive', confidence: 0.95 }),
    makeCategory({ category_id: 'a2', vector: 'negative', confidence: 0.55 }),
    makeCategory({ category_id: 'a3', vector: 'neutral', confidence: 0.75 }),
  ],
})

describe('Step 3: validateObservationTree', () => {
  test('正常データは PASS する', () => {
    const result = validateObservationTree(makeValidTree())
    expect(result.ok).toBe(true)
  })

  test('primary_sources 空配列で FAIL', () => {
    const data = makeValidTree()
    data.categories[0] = makeCategory({ category_id: 'a1', primary_sources: [] })
    const result = validateObservationTree(data)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('primary_sources'))).toBe(true)
    }
  })

  test('vector が positive/neutral のみで FAIL (議論計画§3.1欠陥②)', () => {
    const data = makeValidTree()
    data.categories = [
      makeCategory({ category_id: 'a1', vector: 'positive', confidence: 0.95 }),
      makeCategory({ category_id: 'a2', vector: 'neutral', confidence: 0.55 }),
      makeCategory({ category_id: 'a3', vector: 'positive', confidence: 0.75 }),
    ]
    const result = validateObservationTree(data)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('vector'))).toBe(true)
    }
  })

  test('confidence 飽和 (σ < 0.10) で FAIL (議論計画§3.1欠陥①)', () => {
    const data = makeValidTree()
    data.categories = [
      makeCategory({ category_id: 'a1', vector: 'positive', confidence: 0.92 }),
      makeCategory({ category_id: 'a2', vector: 'negative', confidence: 0.93 }),
      makeCategory({ category_id: 'a3', vector: 'neutral', confidence: 0.91 }),
    ]
    const result = validateObservationTree(data)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('confidence'))).toBe(true)
    }
  })

  test('禁止語混入で FAIL', () => {
    const data = makeValidTree()
    data.categories[0] = makeCategory({
      category_id: 'a1',
      features: ['気質', '体質', 'テンポ', '占いの影響', 'エネルギー'],
    })
    const result = validateObservationTree(data)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('禁止語彙'))).toBe(true)
    }
  })

  test('error path が JSON 階層を含む形式で整形される', () => {
    const data = makeValidTree()
    data.categories[0] = makeCategory({ category_id: 'a1', primary_sources: [] })
    const result = validateObservationTree(data)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors[0]).toMatch(/^\[.+\]/)
    }
  })
})

describe('Step 3: formatRetryHints', () => {
  test('引数空で「初回試行」を返す', () => {
    expect(formatRetryHints({})).toBe('（初回試行）')
  })

  test('Step 3 errors のみで Zod セクションを構築', () => {
    const out = formatRetryHints({
      step3Errors: ['[categories.0.primary_sources] 最低2件必要'],
    })
    expect(out).toContain('Step 3 (Zod 検証) 失敗')
    expect(out).toContain('categories.0.primary_sources')
  })

  test('Step 4 violations と hints が両方ある場合に両セクションを連結', () => {
    const out = formatRetryHints({
      step4Violations: [
        { category: '牡羊座', type: 'axis_purity', detail: '「精緻な自己管理」は cognitive_style' },
      ],
      step4Hints: '心理語を除去せよ',
    })
    expect(out).toContain('Step 4 (Critique) 違反')
    expect(out).toContain('axis_purity')
    expect(out).toContain('次回の必須修正')
    expect(out).toContain('心理語を除去せよ')
  })

  test('Step 3 と Step 4 両方失敗時に両セクションを連結', () => {
    const out = formatRetryHints({
      step3Errors: ['err1'],
      step4Violations: [{ category: 'overall', type: 'vector_diversity', detail: 'negativeなし' }],
    })
    expect(out).toContain('Step 3')
    expect(out).toContain('Step 4')
  })
})
