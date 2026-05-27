import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  ObservationTreeDataSchema,
  CategorySchema,
} from '@/lib/constitution/observation-tree-schema'

const goldenSamplePath = path.resolve(
  __dirname,
  '../aries-embodied_pattern.json',
)

const raw = JSON.parse(readFileSync(goldenSamplePath, 'utf-8'))

describe('Golden Sample: zodiac × embodied_pattern (Gate 2 待ち下書き)', () => {
  test('ObservationTreeDataSchema を通過する（パイプライン Step 3 互換性）', () => {
    const parsed = ObservationTreeDataSchema.safeParse(raw)
    if (!parsed.success) {
      console.error(JSON.stringify(parsed.error.issues, null, 2))
    }
    expect(parsed.success).toBe(true)
  })

  test('12星座すべてが含まれる', () => {
    const expectedIds = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
    ]
    const actualIds = raw.categories.map((c: { category_id: string }) => c.category_id)
    expect(actualIds).toEqual(expectedIds)
  })

  test('各カテゴリが CategorySchema を個別通過する', () => {
    for (const cat of raw.categories) {
      const result = CategorySchema.safeParse(cat)
      if (!result.success) {
        console.error(`category=${cat.category_id} issues=`, JSON.stringify(result.error.issues, null, 2))
      }
      expect(result.success, `category ${cat.category_id} が CategorySchema を通らない`).toBe(true)
    }
  })

  test('vector が positive/negative/neutral の3値すべて出現する (議論計画 §3.1 欠陥②対策)', () => {
    const vectors = new Set<string>(raw.categories.map((c: { vector: string }) => c.vector))
    expect(vectors.has('positive')).toBe(true)
    expect(vectors.has('negative')).toBe(true)
    expect(vectors.has('neutral')).toBe(true)
  })

  test('confidence の標準偏差が 0.10 以上（議論計画 §3.1 欠陥①対策）', () => {
    const values = raw.categories.map((c: { confidence: number }) => c.confidence)
    const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length
    const variance =
      values.reduce((sum: number, v: number) => sum + (v - mean) ** 2, 0) / values.length
    const stdDev = Math.sqrt(variance)
    expect(stdDev).toBeGreaterThanOrEqual(0.1)
  })

  test('全カテゴリの primary_sources が最低2件、書籍/学術1件以上', () => {
    for (const cat of raw.categories) {
      expect(cat.primary_sources.length).toBeGreaterThanOrEqual(2)
      const hasBookOrAcademic = cat.primary_sources.some(
        (s: { type: string }) => s.type === 'book' || s.type === 'academic',
      )
      expect(hasBookOrAcademic, `category ${cat.category_id} に書籍/学術源がない`).toBe(true)
    }
  })

  test('features は各カテゴリ5-10語、各20文字以内', () => {
    for (const cat of raw.categories) {
      expect(cat.features.length).toBeGreaterThanOrEqual(5)
      expect(cat.features.length).toBeLessThanOrEqual(10)
      for (const f of cat.features) {
        expect(f.length, `category ${cat.category_id} feature "${f}" が20文字超`).toBeLessThanOrEqual(20)
      }
    }
  })

  test('axis_definition_used / observation_keywords_used が観察軸 Constitution と一致する', () => {
    expect(raw.axis_definition_used).toBe(
      '体質・気質・行動テンポ・エネルギー水準など、身体性に根ざした個人特性',
    )
    expect(raw.observation_keywords_used).toEqual([
      '気質', '体質', 'テンポ', 'エネルギー', '気力',
    ])
  })
})
