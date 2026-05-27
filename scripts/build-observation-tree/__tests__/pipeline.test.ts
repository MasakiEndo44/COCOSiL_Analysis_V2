import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// AI SDK の generateObject をモック。Step 2/4 の API 呼び出しを差し替える。
const generateObjectMock = vi.fn()
vi.mock('ai', () => ({
  generateObject: (...args: unknown[]) => generateObjectMock(...args),
}))

import { extractObservationTree } from '../steps/step2-extract'
import { critiqueObservationTree } from '../steps/step4-critique'

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

let tmpPromptDir: string

beforeEach(async () => {
  generateObjectMock.mockReset()
  tmpPromptDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cocosil-prompts-'))
  // テンプレートは置換ロジックの動作確認のため最小ダミーで OK
  await fs.writeFile(
    path.join(tmpPromptDir, 'extract.md'),
    'SYSTEM={{system_id}} AXIS={{axis_id}} HINTS={{retry_hints}} BODY={{markdown_input}}',
  )
  await fs.writeFile(
    path.join(tmpPromptDir, 'critique.md'),
    'SYSTEM={{system_id}} AXIS={{axis_id}} BODY={{markdown_input}} JSON={{json_input}}',
  )
})

afterEach(async () => {
  await fs.rm(tmpPromptDir, { recursive: true, force: true })
})

describe('Step 2: extractObservationTree', () => {
  test('テンプレート置換とモデル指定を含めて generateObject を呼ぶ', async () => {
    const tree = makeValidTree()
    generateObjectMock.mockResolvedValueOnce({ object: tree })

    const result = await extractObservationTree({
      system: 'zodiac',
      axis: 'embodied_pattern',
      markdownInput: '# 牡羊座本文',
      promptDir: tmpPromptDir,
    })

    expect(generateObjectMock).toHaveBeenCalledTimes(1)
    const callArg = generateObjectMock.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.model).toBe('anthropic/claude-sonnet-4-6')
    expect(callArg.schemaName).toBe('submit_observation_tree')
    expect(callArg.prompt).toContain('SYSTEM=zodiac')
    expect(callArg.prompt).toContain('AXIS=embodied_pattern')
    expect(callArg.prompt).toContain('# 牡羊座本文')
    expect(callArg.prompt).toContain('HINTS=（初回試行）')
    expect(result.data).toEqual(tree)
  })

  test('retryHints が指定された場合プロンプトに注入される', async () => {
    generateObjectMock.mockResolvedValueOnce({ object: makeValidTree() })

    await extractObservationTree({
      system: 'mbti',
      axis: 'cognitive_style',
      markdownInput: 'body',
      retryHints: '前回 negative 0件',
      promptDir: tmpPromptDir,
    })

    const callArg = generateObjectMock.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.prompt).toContain('HINTS=前回 negative 0件')
  })
})

describe('Step 4: critiqueObservationTree', () => {
  test('JSON 全文をプロンプトに埋め込み、PASS を返す', async () => {
    generateObjectMock.mockResolvedValueOnce({
      object: { result: 'PASS', violations: [], retry_hints: '' },
    })

    const out = await critiqueObservationTree({
      system: 'zodiac',
      axis: 'embodied_pattern',
      markdownInput: '本文',
      generatedJson: makeValidTree(),
      promptDir: tmpPromptDir,
    })

    expect(out.result.result).toBe('PASS')
    const callArg = generateObjectMock.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.model).toBe('anthropic/claude-sonnet-4-6')
    expect(callArg.schemaName).toBe('submit_critique_result')
    expect(callArg.prompt).toContain('JSON=')
    expect(callArg.prompt).toContain('"system": "zodiac"')
  })

  test('FAIL とviolationsを返せる', async () => {
    generateObjectMock.mockResolvedValueOnce({
      object: {
        result: 'FAIL',
        violations: [{ category: '牡羊座', type: 'axis_purity', detail: '精緻な自己管理' }],
        retry_hints: '心理語を除去せよ',
      },
    })

    const out = await critiqueObservationTree({
      system: 'zodiac',
      axis: 'embodied_pattern',
      markdownInput: '本文',
      generatedJson: makeValidTree(),
      promptDir: tmpPromptDir,
    })

    expect(out.result.result).toBe('FAIL')
    expect(out.result.violations).toHaveLength(1)
    expect(out.result.retry_hints).toContain('心理語')
  })
})
