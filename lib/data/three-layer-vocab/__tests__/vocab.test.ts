import { describe, expect, test } from 'vitest'
import {
  LAYER1_ELEMENTS,
  LAYER2_STYLES,
  LAYER3_PHASES,
} from '@/lib/constitution/three-layer-model'
import { BANNED_WORDS } from '@/lib/constitution/banned-words'
import {
  LAYER1_VOCABULARY,
  LAYER2_VOCABULARY,
  LAYER3_VOCABULARY,
  VocabEntrySchema,
  LayerVocabularySchema,
} from '@/lib/data/three-layer-vocab'

describe('Three-Layer Vocabulary: 語数・スキーマ・カバー範囲', () => {
  test('Layer 1: 全 4 元素に 15-25 語ずつ (実装上は 20 語固定)', () => {
    for (const elem of LAYER1_ELEMENTS) {
      const vocab = LAYER1_VOCABULARY[elem]
      expect(LayerVocabularySchema.safeParse(vocab).success).toBe(true)
      expect(vocab).toHaveLength(20)
    }
  })

  test('Layer 2: 全 8 カテゴリに 15-25 語ずつ', () => {
    for (const style of LAYER2_STYLES) {
      const vocab = LAYER2_VOCABULARY[style]
      expect(LayerVocabularySchema.safeParse(vocab).success).toBe(true)
      expect(vocab).toHaveLength(20)
    }
  })

  test('Layer 3: 全 4 フェーズに 15-25 語ずつ', () => {
    for (const phase of LAYER3_PHASES) {
      const vocab = LAYER3_VOCABULARY[phase]
      expect(LayerVocabularySchema.safeParse(vocab).success).toBe(true)
      expect(vocab).toHaveLength(20)
    }
  })

  test('合計 320 語 (80 + 160 + 80)', () => {
    const l1Total = LAYER1_ELEMENTS.reduce(
      (s, e) => s + LAYER1_VOCABULARY[e].length, 0,
    )
    const l2Total = LAYER2_STYLES.reduce(
      (s, e) => s + LAYER2_VOCABULARY[e].length, 0,
    )
    const l3Total = LAYER3_PHASES.reduce(
      (s, e) => s + LAYER3_VOCABULARY[e].length, 0,
    )
    expect(l1Total).toBe(80)
    expect(l2Total).toBe(160)
    expect(l3Total).toBe(80)
    expect(l1Total + l2Total + l3Total).toBe(320)
  })
})

describe('VocabEntry: 各エントリの構造検証', () => {
  test('全エントリが VocabEntrySchema を通過 (term ≤20 文字、source / semanticTag 非空)', () => {
    const allVocab = [
      ...LAYER1_ELEMENTS.flatMap((e) => LAYER1_VOCABULARY[e]),
      ...LAYER2_STYLES.flatMap((s) => LAYER2_VOCABULARY[s]),
      ...LAYER3_PHASES.flatMap((p) => LAYER3_VOCABULARY[p]),
    ]
    for (const entry of allVocab) {
      const result = VocabEntrySchema.safeParse(entry)
      expect(result.success, `${entry.term}: ${JSON.stringify(result.error?.issues)}`).toBe(true)
    }
  })

  test('全 term が 20 文字以内', () => {
    const allVocab = [
      ...LAYER1_ELEMENTS.flatMap((e) => LAYER1_VOCABULARY[e]),
      ...LAYER2_STYLES.flatMap((s) => LAYER2_VOCABULARY[s]),
      ...LAYER3_PHASES.flatMap((p) => LAYER3_VOCABULARY[p]),
    ]
    for (const entry of allVocab) {
      expect(entry.term.length).toBeLessThanOrEqual(20)
      expect(entry.term.length).toBeGreaterThan(0)
    }
  })
})

describe('COCOSiL 言語設計ルール: 禁止語彙の不混入', () => {
  test('全カテゴリの全 term に禁止語彙 (占い / 鑑定 / 運勢 / 占星術 / 当たる / 当たった / 霊感 / 霊視) が含まれない', () => {
    const allEntries = [
      ...LAYER1_ELEMENTS.flatMap((e) => LAYER1_VOCABULARY[e]),
      ...LAYER2_STYLES.flatMap((s) => LAYER2_VOCABULARY[s]),
      ...LAYER3_PHASES.flatMap((p) => LAYER3_VOCABULARY[p]),
    ]
    for (const entry of allEntries) {
      for (const banned of BANNED_WORDS) {
        expect(
          entry.term.includes(banned),
          `${entry.term} に禁止語 "${banned}" が含まれる`,
        ).toBe(false)
      }
    }
  })
})

describe('Layer 1 / Layer 2 / Layer 3 間の重複検出', () => {
  test('Layer 1 と Layer 2 間で完全一致 term が 0 件 (Q3b §3.1)', () => {
    const l1Terms = new Set(
      LAYER1_ELEMENTS.flatMap((e) => LAYER1_VOCABULARY[e].map((v) => v.term)),
    )
    const l2Terms = new Set(
      LAYER2_STYLES.flatMap((s) => LAYER2_VOCABULARY[s].map((v) => v.term)),
    )
    const duplicates = [...l1Terms].filter((t) => l2Terms.has(t))
    expect(duplicates).toEqual([])
  })

  test('Layer 3 と Layer 1 / Layer 2 間で完全一致 term が 0 件 (Q3c §6.1)', () => {
    const l1l2Terms = new Set([
      ...LAYER1_ELEMENTS.flatMap((e) => LAYER1_VOCABULARY[e].map((v) => v.term)),
      ...LAYER2_STYLES.flatMap((s) => LAYER2_VOCABULARY[s].map((v) => v.term)),
    ])
    const l3Terms = LAYER3_PHASES.flatMap((p) =>
      LAYER3_VOCABULARY[p].map((v) => v.term),
    )
    const duplicates = l3Terms.filter((t) => l1l2Terms.has(t))
    expect(duplicates).toEqual([])
  })
})
