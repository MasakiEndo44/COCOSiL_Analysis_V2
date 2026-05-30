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
} from '@/lib/data/three-layer-vocab'
import {
  ZODIAC_VOCABULARY,
  ANIMAL_VOCABULARY,
  MBTI_VOCABULARY,
  ROKUSEI_VOCABULARY,
  AnimalTwigEntrySchema,
  TwigEntrySchema,
  ZODIAC_SIGNS,
  MBTI_TYPES,
  ROKUSEI_TYPES,
} from '@/lib/data/three-layer-vocab/twigs'
import { ANIMAL_60_CHARACTERS } from '@/lib/data/animal-characters'

// ============================================================================
// 語数の Σ チェック
// ============================================================================

describe('Twigs Vocabulary: 語数・スキーマ・カバー範囲', () => {
  test('Q5a Zodiac: 全 12 サインに 10 語ずつ (合計 120 語)', () => {
    let total = 0
    for (const sign of ZODIAC_SIGNS) {
      const vocab = ZODIAC_VOCABULARY[sign]
      expect(vocab).toHaveLength(10)
      total += vocab.length
    }
    expect(total).toBe(120)
  })

  test('Q5b Animal: 全 60 体に 8 語ずつ (合計 480 語)', () => {
    let total = 0
    for (let id = 1; id <= 60; id++) {
      const vocab = ANIMAL_VOCABULARY[id]
      expect(vocab, `ID ${id} の特徴語が未定義`).toBeDefined()
      expect(vocab).toHaveLength(8)
      total += vocab.length
    }
    expect(total).toBe(480)
  })

  test('Q5c MBTI: 全 16 タイプに 11 語ずつ (合計 176 語)', () => {
    let total = 0
    for (const type of MBTI_TYPES) {
      const vocab = MBTI_VOCABULARY[type]
      expect(vocab).toHaveLength(11)
      total += vocab.length
    }
    expect(total).toBe(176)
  })

  test('Q5d Rokusei: 全 12 タイプに 9 語ずつ (合計 108 語)', () => {
    let total = 0
    for (const type of ROKUSEI_TYPES) {
      const vocab = ROKUSEI_VOCABULARY[type]
      expect(vocab).toHaveLength(9)
      total += vocab.length
    }
    expect(total).toBe(108)
  })

  test('Twigs 合計 884 語 (120 + 480 + 176 + 108)', () => {
    const zodiacTotal = ZODIAC_SIGNS.reduce(
      (s, k) => s + ZODIAC_VOCABULARY[k].length,
      0,
    )
    const animalTotal = Object.values(ANIMAL_VOCABULARY).reduce(
      (s, v) => s + v.length,
      0,
    )
    const mbtiTotal = MBTI_TYPES.reduce(
      (s, k) => s + MBTI_VOCABULARY[k].length,
      0,
    )
    const rokuseiTotal = ROKUSEI_TYPES.reduce(
      (s, k) => s + ROKUSEI_VOCABULARY[k].length,
      0,
    )
    expect(zodiacTotal).toBe(120)
    expect(animalTotal).toBe(480)
    expect(mbtiTotal).toBe(176)
    expect(rokuseiTotal).toBe(108)
    expect(zodiacTotal + animalTotal + mbtiTotal + rokuseiTotal).toBe(884)
  })

  test('Trunks (Layer 1+2+3 = 320) + Twigs (884) = 1,204 語', () => {
    const trunks =
      LAYER1_ELEMENTS.reduce((s, e) => s + LAYER1_VOCABULARY[e].length, 0) +
      LAYER2_STYLES.reduce((s, e) => s + LAYER2_VOCABULARY[e].length, 0) +
      LAYER3_PHASES.reduce((s, e) => s + LAYER3_VOCABULARY[e].length, 0)
    const twigs =
      120 +
      Object.values(ANIMAL_VOCABULARY).reduce((s, v) => s + v.length, 0) +
      176 +
      108
    expect(trunks).toBe(320)
    expect(twigs).toBe(884)
    expect(trunks + twigs).toBe(1204)
  })
})

// ============================================================================
// スキーマ検証
// ============================================================================

describe('Twigs Schema: 各エントリの構造検証', () => {
  test('全 Zodiac エントリが TwigEntrySchema を通過', () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const entry of ZODIAC_VOCABULARY[sign]) {
        const result = TwigEntrySchema.safeParse(entry)
        expect(result.success, `${entry.term}: ${JSON.stringify(result.error?.issues)}`).toBe(true)
      }
    }
  })

  test('全 Animal エントリが AnimalTwigEntrySchema を通過', () => {
    for (let id = 1; id <= 60; id++) {
      for (const entry of ANIMAL_VOCABULARY[id]) {
        const result = AnimalTwigEntrySchema.safeParse(entry)
        expect(result.success, `ID ${id} ${entry.term}: ${JSON.stringify(result.error?.issues)}`).toBe(true)
      }
    }
  })

  test('全 MBTI エントリが TwigEntrySchema を通過', () => {
    for (const type of MBTI_TYPES) {
      for (const entry of MBTI_VOCABULARY[type]) {
        const result = TwigEntrySchema.safeParse(entry)
        expect(result.success, `${type} ${entry.term}: ${JSON.stringify(result.error?.issues)}`).toBe(true)
      }
    }
  })

  test('全 Rokusei エントリが TwigEntrySchema を通過', () => {
    for (const type of ROKUSEI_TYPES) {
      for (const entry of ROKUSEI_VOCABULARY[type]) {
        const result = TwigEntrySchema.safeParse(entry)
        expect(result.success, `${type} ${entry.term}: ${JSON.stringify(result.error?.issues)}`).toBe(true)
      }
    }
  })

  test('全 term が 20 文字以内 (VocabEntrySchema 強制)', () => {
    const allTerms = collectAllTwigTerms()
    for (const { term, system, group } of allTerms) {
      expect(term.length, `${system}/${group} の "${term}" が 20 文字超過`).toBeLessThanOrEqual(20)
      expect(term.length).toBeGreaterThan(0)
    }
  })

  test('全 entry が共通 VocabEntrySchema (term/source/semanticTag) を満たす', () => {
    const allEntries = collectAllTwigEntries()
    for (const entry of allEntries) {
      expect(VocabEntrySchema.safeParse(entry).success).toBe(true)
    }
  })
})

// ============================================================================
// Drift Test: Animal 60 公式呼称と animal-characters.ts の完全一致を強制
// 設計根拠: 議論ログ_動物60公式呼称統一.md 5原則「Self-Healing Drift Test」
// ============================================================================

describe('Animal Drift Test: 公式 60 体との完全一致', () => {
  test('全 60 ID で officialName / baseAnimal が animal-characters.ts と完全一致', () => {
    for (let id = 1; id <= 60; id++) {
      const official = ANIMAL_60_CHARACTERS[id]
      const entries = ANIMAL_VOCABULARY[id]
      expect(official, `ANIMAL_60_CHARACTERS[${id}] missing`).toBeDefined()
      expect(entries, `ANIMAL_VOCABULARY[${id}] missing`).toBeDefined()
      for (const entry of entries) {
        expect(entry.officialId, `ID ${id} entry.officialId mismatch`).toBe(id)
        expect(entry.officialName, `ID ${id} entry.officialName != "${official.character}"`).toBe(official.character)
        expect(entry.baseAnimal, `ID ${id} entry.baseAnimal != "${official.baseAnimal}"`).toBe(official.baseAnimal)
      }
    }
  })

  test('twigs/animal.ts が公式 60 体すべてをカバー (欠番なし)', () => {
    const animalKeys = Object.keys(ANIMAL_VOCABULARY)
      .map((k) => Number(k))
      .sort((a, b) => a - b)
    expect(animalKeys).toEqual(Array.from({ length: 60 }, (_, i) => i + 1))
  })
})

// ============================================================================
// 禁止語彙チェック (COCOSiL 言語設計ルール)
// ============================================================================

describe('Twigs 禁止語彙チェック: 全 884 語に禁止語が含まれない', () => {
  test('全 Twigs term に禁止語 (占い/鑑定/運勢/占星術/当たる/霊感/霊視) を含まない', () => {
    const allTerms = collectAllTwigTerms()
    for (const { term, system, group } of allTerms) {
      for (const banned of BANNED_WORDS) {
        expect(
          term.includes(banned),
          `${system}/${group} の "${term}" に禁止語 "${banned}" が含まれる`,
        ).toBe(false)
      }
    }
  })
})

// ============================================================================
// 層間/体系間の完全一致重複ゼロ
// ============================================================================

describe('Twigs 重複検出: Trunks (Layer 1/2/3) との完全一致重複ゼロ', () => {
  test('Twigs と Layer 1+2+3 間で完全一致 term が 0 件', () => {
    const trunkTerms = new Set<string>([
      ...LAYER1_ELEMENTS.flatMap((e) => LAYER1_VOCABULARY[e].map((v) => v.term)),
      ...LAYER2_STYLES.flatMap((s) => LAYER2_VOCABULARY[s].map((v) => v.term)),
      ...LAYER3_PHASES.flatMap((p) => LAYER3_VOCABULARY[p].map((v) => v.term)),
    ])
    const twigTerms = collectAllTwigTerms().map((x) => x.term)
    const duplicates = twigTerms.filter((t) => trunkTerms.has(t))
    expect(duplicates).toEqual([])
  })
})

describe('Twigs 重複検出: 体系間 (Q5a/Q5b/Q5c/Q5d) の完全一致重複ゼロ', () => {
  test('全 884 語のうち、完全一致重複が 0 件 (体系ラベル付きで検出)', () => {
    const seen = new Map<string, string>()
    const duplicates: string[] = []
    for (const { term, system, group } of collectAllTwigTerms()) {
      const existing = seen.get(term)
      if (existing) {
        duplicates.push(`"${term}" : ${existing} <-> ${system}/${group}`)
      } else {
        seen.set(term, `${system}/${group}`)
      }
    }
    expect(duplicates).toEqual([])
  })
})

// ============================================================================
// ヘルパー
// ============================================================================

interface LabelledTerm {
  term: string
  system: string
  group: string
}

function collectAllTwigTerms(): LabelledTerm[] {
  const out: LabelledTerm[] = []
  for (const sign of ZODIAC_SIGNS) {
    for (const e of ZODIAC_VOCABULARY[sign]) {
      out.push({ term: e.term, system: 'zodiac', group: sign })
    }
  }
  for (let id = 1; id <= 60; id++) {
    for (const e of ANIMAL_VOCABULARY[id]) {
      out.push({ term: e.term, system: 'animal', group: String(id) })
    }
  }
  for (const type of MBTI_TYPES) {
    for (const e of MBTI_VOCABULARY[type]) {
      out.push({ term: e.term, system: 'mbti', group: type })
    }
  }
  for (const type of ROKUSEI_TYPES) {
    for (const e of ROKUSEI_VOCABULARY[type]) {
      out.push({ term: e.term, system: 'rokusei', group: type })
    }
  }
  return out
}

function collectAllTwigEntries() {
  const out: Array<{ term: string; source: string; semanticTag: string }> = []
  for (const sign of ZODIAC_SIGNS) out.push(...ZODIAC_VOCABULARY[sign])
  for (let id = 1; id <= 60; id++) out.push(...ANIMAL_VOCABULARY[id])
  for (const type of MBTI_TYPES) out.push(...MBTI_VOCABULARY[type])
  for (const type of ROKUSEI_TYPES) out.push(...ROKUSEI_VOCABULARY[type])
  return out
}
