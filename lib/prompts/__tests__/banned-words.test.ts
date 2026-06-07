import { describe, expect, test } from 'vitest'
import { findBannedWords } from '@/lib/constitution/banned-words'
import { WELCOME_SYSTEM_PROMPT } from '@/lib/prompts/onboarding'
import {
  CONTRADICTION_PROMPT_WITH,
  CONTRADICTION_PROMPT_WITHOUT,
  buildWithContradictionInsight,
  buildWithoutContradictionInsight,
} from '@/lib/prompts/contradiction-handling'
import {
  REASSURANCE_MAIN_TEXT,
  REASSURANCE_SUB_TEXT,
  REASSURANCE_RETURN_TEXT,
  REASSURANCE_CTA_LABEL,
  REASSURANCE_CTA_LABEL_RETURN,
} from '@/lib/prompts/reassurance'
import { CHAT_PHASE1_SYSTEM_PROMPT } from '@/lib/prompts/chat-phase1'
import { CHAT_PHASE2_SYSTEM_PROMPT, buildChatPhase2Prompt } from '@/lib/prompts/chat-phase2'
import {
  resolveIntegratedReportSystemPrompt,
  buildIntegratedReportUserPrompt,
  type IntegratedReportInput,
} from '@/lib/prompts/integrated-report'
import { buildProfileCore } from '@/lib/diagnostics/integration'

describe('lib/prompts: 禁止語彙の不混入（Constitution as Code）', () => {
  test('onboarding: WELCOME_SYSTEM_PROMPT に禁止語彙が含まれない', () => {
    expect(findBannedWords(WELCOME_SYSTEM_PROMPT)).toEqual([])
  })

  test('contradiction-handling: CONTRADICTION_PROMPT_WITH に禁止語彙が含まれない', () => {
    expect(findBannedWords(CONTRADICTION_PROMPT_WITH)).toEqual([])
  })

  test('contradiction-handling: CONTRADICTION_PROMPT_WITHOUT に禁止語彙が含まれない', () => {
    expect(findBannedWords(CONTRADICTION_PROMPT_WITHOUT)).toEqual([])
  })

  test('contradiction-handling: ビルド済みプロンプト（テーマ展開後）にも禁止語彙が含まれない', () => {
    const sample1 = buildWithoutContradictionInsight(['内向性', '繊細さ', '思慮深さ'])
    const sample2 = buildWithContradictionInsight('外向的なエネルギー', '内向的な深さ')
    expect(findBannedWords(sample1)).toEqual([])
    expect(findBannedWords(sample2)).toEqual([])
  })
})

describe('lib/prompts: 必須キーワード（共感フェーズの語感）', () => {
  test('onboarding: 共感フェーズに対応する語が含まれる', () => {
    const empathyKeywords = ['気持ち', '聞かせて', '受け取', '感じ']
    expect(empathyKeywords.some((k) => WELCOME_SYSTEM_PROMPT.includes(k))).toBe(true)
  })
})

describe('lib/prompts: reassurance — 禁止語彙チェック（F3.2 安心フェーズ）', () => {
  test('REASSURANCE_MAIN_TEXT に禁止語彙が含まれない', () => {
    expect(findBannedWords(REASSURANCE_MAIN_TEXT)).toEqual([])
  })

  test('REASSURANCE_SUB_TEXT に禁止語彙が含まれない', () => {
    expect(findBannedWords(REASSURANCE_SUB_TEXT)).toEqual([])
  })

  test('REASSURANCE_RETURN_TEXT に禁止語彙が含まれない', () => {
    expect(findBannedWords(REASSURANCE_RETURN_TEXT)).toEqual([])
  })

  test('REASSURANCE_CTA_LABEL に禁止語彙が含まれない', () => {
    expect(findBannedWords(REASSURANCE_CTA_LABEL)).toEqual([])
    expect(findBannedWords(REASSURANCE_CTA_LABEL_RETURN)).toEqual([])
  })

  test('REASSURANCE_SUB_TEXT に「地図」比喩が含まれる（脱判定化の核心）', () => {
    expect(REASSURANCE_SUB_TEXT).toContain('地図')
  })

  test('REASSURANCE_SUB_TEXT に招待ワードが含まれる', () => {
    expect(REASSURANCE_SUB_TEXT).toContain('一緒に')
  })
})

describe('lib/prompts: chat-phase1 — 禁止語彙チェック（F4 Phase 1 傾聴）', () => {
  test('CHAT_PHASE1_SYSTEM_PROMPT に禁止語彙が含まれない', () => {
    expect(findBannedWords(CHAT_PHASE1_SYSTEM_PROMPT)).toEqual([])
  })

  test('CHAT_PHASE1_SYSTEM_PROMPT に傾聴フェーズの必須キーワードが含まれる', () => {
    const listeningKeywords = ['聴く', '受け取', '感情']
    expect(listeningKeywords.some((k) => CHAT_PHASE1_SYSTEM_PROMPT.includes(k))).toBe(true)
  })

  test('CHAT_PHASE1_SYSTEM_PROMPT にタイプ分類禁止の明示がある', () => {
    expect(CHAT_PHASE1_SYSTEM_PROMPT).toContain('タイプ分類')
  })
})

describe('lib/prompts: chat-phase2 — 禁止語彙チェック（F4 Phase 2 共感）', () => {
  test('CHAT_PHASE2_SYSTEM_PROMPT に禁止語彙が含まれない', () => {
    expect(findBannedWords(CHAT_PHASE2_SYSTEM_PROMPT)).toEqual([])
  })

  test('buildChatPhase2Prompt: 展開後のプロンプトにも禁止語彙が含まれない', () => {
    const built = buildChatPhase2Prompt('MBTI: INFJ / 星座: 乙女座 / 動物: コアラ / 六星: 土星人')
    expect(findBannedWords(built)).toEqual([])
  })

  test('buildChatPhase2Prompt: {diagnosisContext} が実際のデータに置換される', () => {
    const context = 'MBTI: ENFP / 星座: 牡羊座'
    const built = buildChatPhase2Prompt(context)
    expect(built).toContain(context)
    expect(built).not.toContain('{diagnosisContext}')
  })

  test('CHAT_PHASE2_SYSTEM_PROMPT に共感フェーズの必須キーワードが含まれる', () => {
    const empathyKeywords = ['感情', '言語化', '共感']
    expect(empathyKeywords.some((k) => CHAT_PHASE2_SYSTEM_PROMPT.includes(k))).toBe(true)
  })
})

describe('lib/prompts: integrated-report — Phase 2 ProfileCore 翻訳層', () => {
  // 実際の決定論スコア核を注入してプロンプトを検証する（モックでなく本物の契約で確認）。
  const coreA = buildProfileCore({ birthDate: new Date(1995, 0, 15), mbti: 'INFJ' }, 'T')
  const coreB = buildProfileCore({ birthDate: new Date(1990, 6, 7), mbti: 'INTJ' }, 'A')

  const withDescription: IntegratedReportInput = {
    displayName: 'みさき',
    profileCore: coreA,
    zodiac: { label: '蟹座', description: '身近な人の感情を細やかに受け取る守りの温かさ' },
    animal: { label: '母性豊かな子守熊', description: '包容力とマイペースな回復力' },
    sixStar: { label: '土星人＋', description: '時間をかけて積み上げる堅実さ' },
    mbti: { label: 'INFJ', description: '内側で深く意味を探す静かな芯' },
  }
  const labelOnly: IntegratedReportInput = {
    displayName: null,
    profileCore: coreB,
    zodiac: { label: '水瓶座' },
    animal: { label: 'クリエイティブな狼' },
    sixStar: { label: '木星人−' },
    mbti: { label: 'INTJ' },
  }

  test('resolveIntegratedReportSystemPrompt（さん付け）に禁止語彙が含まれない', () => {
    expect(findBannedWords(resolveIntegratedReportSystemPrompt(true))).toEqual([])
  })

  test('resolveIntegratedReportSystemPrompt（フォールバック）に禁止語彙が含まれない', () => {
    expect(findBannedWords(resolveIntegratedReportSystemPrompt(false))).toEqual([])
  })

  test('システムプロンプトに文字数プレースホルダが残らない', () => {
    expect(resolveIntegratedReportSystemPrompt(true)).not.toContain('{{')
  })

  test('さん付け分岐は「さん」呼称を指示し、フォールバック分岐は「あなたさん」を禁止する', () => {
    expect(resolveIntegratedReportSystemPrompt(true)).toContain('さん')
    expect(resolveIntegratedReportSystemPrompt(false)).toContain('あなたさん')
  })

  test('AC-2（対人着地）の核キーワードがプロンプトに含まれる', () => {
    const prompt = resolveIntegratedReportSystemPrompt(true)
    expect(prompt).toContain('大切な人との関係')
    expect(prompt).toContain('地図')
  })

  test('翻訳者フレーミング: 再計算・発明を禁じる指示が明記される', () => {
    const prompt = resolveIntegratedReportSystemPrompt(true)
    expect(prompt).toContain('翻訳')
    expect(prompt).toContain('計算し直さない')
    expect(prompt).toContain('発明しない')
  })

  test('出自の正直さ: 設計上の理論分布を明示し詐称を禁じる指示がある', () => {
    const prompt = resolveIntegratedReportSystemPrompt(true)
    expect(prompt).toContain('設計上の理論分布')
    expect(prompt).toContain('詐称')
  })

  test('catchphrase と weakness は LLM 出力に含めない（決定論で確定するため）', () => {
    expect(resolveIntegratedReportSystemPrompt(true)).toContain('catchphrase と weakness は出力しない')
  })

  test('言葉の解像度: 分析用語の日常語化と体言止め・冗長排除の指示がある（Gate 2）', () => {
    const prompt = resolveIntegratedReportSystemPrompt(true)
    expect(prompt).toContain('体の動き方') // 日常語マップを本文に明示
    expect(prompt).toContain('本文に書かない') // 分析用語をそのまま使わせない
    expect(prompt).toContain('体言止め') // strengths / johari を体言止めに
    expect(prompt).toContain('繰り返さない') // 冗長な前置きの排除
  })

  test('buildIntegratedReportUserPrompt: ProfileCore 注入でも禁止語彙が含まれない', () => {
    expect(findBannedWords(buildIntegratedReportUserPrompt(withDescription))).toEqual([])
    expect(findBannedWords(buildIntegratedReportUserPrompt(labelOnly))).toEqual([])
  })

  test('buildIntegratedReportUserPrompt: 確定スコア核（キャラ像・強み・癖）を列挙注入する', () => {
    const built = buildIntegratedReportUserPrompt(withDescription)
    expect(built).toContain('呼び名: みさき')
    expect(built).toContain('母性豊かな子守熊 — 包容力')
    expect(built).toContain(coreA.characterLabel)
    expect(built).toContain(coreA.strengths[0])
    expect(built).toContain(coreA.weakness.trait) // 癖は参考情報として注入（exit は固定表示なので渡さない）
    expect(built).toContain('設計上の理論分布')
  })

  test('buildIntegratedReportUserPrompt: 軸は日常語で注入し分析用語を渡さない（Gate 2）', () => {
    const built = buildIntegratedReportUserPrompt(withDescription)
    expect(built).not.toContain('認知スタイル')
    expect(built).not.toContain('対人モード')
    expect(built).toContain('人との関わり方') // PLAIN_AXIS の日常語
  })

  test('buildIntegratedReportUserPrompt: 説明文なしはラベルのみ・呼び名「あなた」', () => {
    const built = buildIntegratedReportUserPrompt(labelOnly)
    expect(built).toContain('呼び名: あなた')
    expect(built).toContain('動物タイプ（60type）: クリエイティブな狼')
    expect(built).not.toContain('クリエイティブな狼 — ')
  })
})
