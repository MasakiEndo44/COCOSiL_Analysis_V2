import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { BANNED_WORDS } from '@/lib/constitution/banned-words'
import { UX_SEQUENCE, PHASE_LABELS_JP } from '@/lib/constitution/ux-sequence'
import {
  OBSERVATION_AXES,
  OBSERVATION_AXIS_IDS,
  META_LAYER,
} from '@/lib/constitution/observation-axes'
import {
  ObservationTreeDataSchema,
  CategorySchema,
  CritiqueResultSchema,
} from '@/lib/constitution/observation-tree-schema'
import { ChatPhase, CHAT_PHASE_TO_UX_PHASE } from '@/lib/types/chat-phase'

const repoRoot = path.resolve(__dirname, '../../..')

function readDoc(relPath: string): string {
  return readFileSync(path.join(repoRoot, relPath), 'utf-8')
}

describe('Constitution Drift: 文書とコードの整合性検知', () => {
  test('language-design-v1.md に列挙された禁止語が banned-words.ts に全て存在', () => {
    const doc = readDoc('docs/input/concepts/language-design-v1.md')
    // 文書側の §1 テーブルに必ず登場する禁止語のサブセット
    const expectedFromDoc = ['占い', '占い師', '鑑定', '運勢', '占星術', '当たる', '霊感', '霊視']
    const codeWords = BANNED_WORDS as readonly string[]
    for (const word of expectedFromDoc) {
      expect(doc, `language-design-v1.md に "${word}" が見つからない`).toContain(word)
      expect(codeWords, `banned-words.ts に "${word}" が含まれていない`).toContain(word)
    }
  })

  test('AGENTS.md §6 の禁止語テーブルに列挙された語も banned-words.ts に含まれる', () => {
    const doc = readDoc('AGENTS.md')
    const codeWords = BANNED_WORDS as readonly string[]
    // AGENTS.md §6 で明記される最小セット
    const expectedFromAgents = ['占い', '鑑定', '運勢', '霊感', '霊視']
    for (const word of expectedFromAgents) {
      expect(doc, `AGENTS.md に "${word}" が見つからない`).toContain(word)
      expect(codeWords, `banned-words.ts に "${word}" が含まれていない`).toContain(word)
    }
  })

  test('cocosil-domain skill の禁止語も banned-words.ts に含まれる', () => {
    const doc = readDoc('.claude/skills/cocosil-domain/SKILL.md')
    const codeWords = BANNED_WORDS as readonly string[]
    const expectedFromSkill = ['占い', '占い師', '鑑定', '運勢', '占星術', '当たる']
    for (const word of expectedFromSkill) {
      expect(doc, `cocosil-domain SKILL.md に "${word}" が見つからない`).toContain(word)
      expect(codeWords, `banned-words.ts に "${word}" が含まれていない`).toContain(word)
    }
  })

  test('UXシーケンスの日本語ラベルが AGENTS.md に明記されている', () => {
    const doc = readDoc('AGENTS.md')
    expect(doc).toContain('共感→安心→分析→行動')
    for (const phase of UX_SEQUENCE) {
      const jp = PHASE_LABELS_JP[phase]
      expect(doc, `AGENTS.md に "${jp}" が見つからない`).toContain(jp)
    }
  })

  test('ChatPhase が全て有効な UxPhase にマップされている', () => {
    for (const phase of Object.values(ChatPhase)) {
      const uxPhase = CHAT_PHASE_TO_UX_PHASE[phase]
      expect(UX_SEQUENCE as readonly string[], `ChatPhase '${phase}' のマップ先 '${uxPhase}' が UX_SEQUENCE に存在しない`).toContain(uxPhase)
    }
  })
})

describe('Observation Axes: F3.1 Tree of 4, Harvest 1. の5軸内部整合性', () => {
  test('5軸ちょうどが定義されている（4軸・6軸への変更は20260527_議論ログ_F3-1観察軸5軸確定 §Turn 2 で却下済み）', () => {
    expect(OBSERVATION_AXIS_IDS).toHaveLength(5)
  })

  test('全軸が必須フィールドを持つ', () => {
    for (const id of OBSERVATION_AXIS_IDS) {
      const axis = OBSERVATION_AXES[id]
      expect(axis.id, `${id}: id が空`).toBeTruthy()
      expect(axis.label_ja, `${id}: label_ja が空`).toBeTruthy()
      expect(axis.pancha_origin, `${id}: pancha_origin が空`).toBeTruthy()
      expect(axis.definition, `${id}: definition が空`).toBeTruthy()
      expect(axis.observation_keywords, `${id}: observation_keywords が配列でない`).toBeInstanceOf(Array)
      expect(axis.layer_priority, `${id}: layer_priority が配列でない`).toBeInstanceOf(Array)
    }
  })

  test('axis.id がオブジェクトキーと一致する（リネーム時の不整合検知）', () => {
    for (const id of OBSERVATION_AXIS_IDS) {
      expect(OBSERVATION_AXES[id].id, `key '${id}' と axis.id が不一致`).toBe(id)
    }
  })

  test('observation_keywords は3-5語（設計原則② Minimal Signature, Rich Expression.）', () => {
    for (const id of OBSERVATION_AXIS_IDS) {
      const keywords = OBSERVATION_AXES[id].observation_keywords
      expect(keywords.length, `${id}: observation_keywords が ${keywords.length} 語（3-5語に限定）`).toBeGreaterThanOrEqual(3)
      expect(keywords.length, `${id}: observation_keywords が ${keywords.length} 語（3-5語に限定）`).toBeLessThanOrEqual(5)
    }
  })

  test('layer_priority は2階層以上（粒度混在解決のため）', () => {
    for (const id of OBSERVATION_AXIS_IDS) {
      const layers = OBSERVATION_AXES[id].layer_priority
      expect(layers.length, `${id}: layer_priority が ${layers.length} 階層（2階層以上必須）`).toBeGreaterThanOrEqual(2)
    }
  })

  test('META_LAYER の id が軸 ID と衝突しない（設計原則① 識はメタ層）', () => {
    expect(OBSERVATION_AXIS_IDS as readonly string[]).not.toContain(META_LAYER.id)
  })

  test('META_LAYER に「軸として扱ってはいけない」旨の note が存在', () => {
    expect(META_LAYER.note).toContain('軸')
  })
})

describe('Observation Axes Drift: コードと文書の整合性検知', () => {
  test('AGENTS.md §7 Constitution as Code 表に observation-axes.ts が記載されている', () => {
    const doc = readDoc('AGENTS.md')
    expect(doc, 'AGENTS.md に observation-axes.ts への参照がない').toContain('lib/constitution/observation-axes.ts')
  })

  test('設計中枢ドキュメント §2.3.1 に5軸の英語識別子が全て記載されている', () => {
    const doc = readDoc('docs/input/concepts/COCOSiL設計中枢.md')
    for (const id of OBSERVATION_AXIS_IDS) {
      expect(doc, `設計中枢ドキュメントに "${id}" の記載がない`).toContain(id)
    }
    expect(doc, '設計中枢ドキュメントに META_LAYER の記載がない').toContain(META_LAYER.id)
  })

  test('設計中枢ドキュメントに設計3原則フレーズ "Pancha to Five Axes." が記載されている', () => {
    const doc = readDoc('docs/input/concepts/COCOSiL設計中枢.md')
    expect(doc).toContain('Pancha to Five Axes.')
  })
})

describe('Observation Tree Schema: パイプライン Step 3 用 Zod スキーマの動作検証', () => {
  const VALID_SOURCES = [
    { citation: 'プトレマイオス『テトラビブロス』第3巻', type: 'book' as const },
    { citation: 'Lilly W., Christian Astrology (1647)', type: 'book' as const },
  ]

  const makeCategory = (overrides: Partial<Record<string, unknown>> = {}) => ({
    category_id: 'aries',
    category_label_ja: '牡羊座',
    features: ['瞬発的な運動エネルギー', '急進的な行動テンポ', '熱狂的な胆汁質', '頭部への血流集中', '急性な発熱反応'],
    vector: 'positive' as const,
    confidence: 0.85,
    primary_sources: VALID_SOURCES,
    ...overrides,
  })

  test('完全な観察軸データは Schema を通過する', () => {
    const data = {
      system: 'zodiac' as const,
      axis: 'embodied_pattern' as const,
      generated_at: '2026-05-27',
      source_method: 'deep-research-pipeline' as const,
      axis_definition_used: '体質・気質・行動テンポ・エネルギー水準など、身体性に根ざした個人特性',
      observation_keywords_used: ['気質', '体質', 'テンポ', 'エネルギー', '気力'],
      categories: [
        makeCategory({ category_id: 'a1', vector: 'positive', confidence: 0.95 }),
        makeCategory({ category_id: 'a2', vector: 'negative', confidence: 0.55 }),
        makeCategory({ category_id: 'a3', vector: 'neutral', confidence: 0.75 }),
      ],
    }
    expect(ObservationTreeDataSchema.safeParse(data).success).toBe(true)
  })

  test('primary_sources が空配列の場合は reject される (議論計画 §3.1 欠陥③対策)', () => {
    const cat = makeCategory({ primary_sources: [] })
    expect(CategorySchema.safeParse(cat).success).toBe(false)
  })

  test('primary_sources が web 1件のみだと reject される（書籍/学術1件以上必須）', () => {
    const cat = makeCategory({
      primary_sources: [
        { citation: 'https://example.com', type: 'web' as const },
        { citation: 'https://another.com', type: 'web' as const },
      ],
    })
    expect(CategorySchema.safeParse(cat).success).toBe(false)
  })

  test('features に禁止語彙が混入すると reject される', () => {
    const cat = makeCategory({ features: ['気質', '体質', 'テンポ', '占いの影響', 'エネルギー'] })
    expect(CategorySchema.safeParse(cat).success).toBe(false)
  })

  test('features が4語以下だと reject される', () => {
    const cat = makeCategory({ features: ['気質', '体質', 'テンポ', 'エネルギー'] })
    expect(CategorySchema.safeParse(cat).success).toBe(false)
  })

  test('vector が positive/neutral のみだと体系レベルで reject される（議論計画 §3.1 欠陥②対策）', () => {
    const data = {
      system: 'zodiac' as const,
      axis: 'embodied_pattern' as const,
      generated_at: '2026-05-27',
      source_method: 'deep-research-pipeline' as const,
      axis_definition_used: 'test',
      observation_keywords_used: ['a', 'b', 'c'],
      categories: [
        makeCategory({ category_id: 'a1', vector: 'positive', confidence: 0.95 }),
        makeCategory({ category_id: 'a2', vector: 'neutral', confidence: 0.55 }),
        makeCategory({ category_id: 'a3', vector: 'positive', confidence: 0.75 }),
      ],
    }
    expect(ObservationTreeDataSchema.safeParse(data).success).toBe(false)
  })

  test('confidence が 0.90-0.95 に飽和すると体系レベルで reject される（議論計画 §3.1 欠陥①対策）', () => {
    const data = {
      system: 'zodiac' as const,
      axis: 'embodied_pattern' as const,
      generated_at: '2026-05-27',
      source_method: 'deep-research-pipeline' as const,
      axis_definition_used: 'test',
      observation_keywords_used: ['a', 'b', 'c'],
      categories: [
        makeCategory({ category_id: 'a1', vector: 'positive', confidence: 0.92 }),
        makeCategory({ category_id: 'a2', vector: 'negative', confidence: 0.93 }),
        makeCategory({ category_id: 'a3', vector: 'neutral', confidence: 0.91 }),
        makeCategory({ category_id: 'a4', vector: 'positive', confidence: 0.94 }),
      ],
    }
    expect(ObservationTreeDataSchema.safeParse(data).success).toBe(false)
  })

  test('CritiqueResultSchema が PASS/FAIL と違反種別を型強制する', () => {
    const ok = CritiqueResultSchema.safeParse({
      result: 'FAIL',
      violations: [
        { category: '牡羊座', type: 'axis_purity', detail: '「精緻な自己管理」は認知軸' },
      ],
      retry_hints: '心理語を除去し身体性の語に置換せよ',
    })
    expect(ok.success).toBe(true)
  })
})
