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
  test('5軸ちょうどが定義されている（4軸・6軸への変更は議論ログ_F3-1観察軸5軸確定 §Turn 2 で却下済み）', () => {
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
