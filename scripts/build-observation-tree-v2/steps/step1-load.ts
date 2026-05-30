// Step 1: Constitution + 語彙コーパス (twigs 884 語) + 入力 Markdown の読み込み
//
// v1 との差分:
//   - twigs (Q5a/b/c/d) を SystemId 単位で取得し、LLM プロンプトに「正解語彙集合」として
//     埋め込む準備をする (ハルシネーション抑制)
//   - 階層別 α と Layer 3 modulator は文字列化して prompt に注入できる形で返す

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  HYBRID_DISTANCE_ALPHA,
  LAYER3_TO_LAYER1_MODULATION,
  type Layer3Phase,
} from '@/lib/constitution/three-layer-model'
import {
  OBSERVATION_AXES,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import { BANNED_WORDS } from '@/lib/constitution/banned-words'
import type { SystemId } from '@/lib/constitution/observation-tree-schema'
import {
  ZODIAC_VOCABULARY,
  ANIMAL_VOCABULARY,
  MBTI_VOCABULARY,
  ROKUSEI_VOCABULARY,
  ZODIAC_SIGNS,
  MBTI_TYPES,
  ROKUSEI_TYPES,
} from '@/lib/data/three-layer-vocab/twigs'

export interface LoadedContext {
  markdownInput: string
  axisDefinition: string
  observationKeywords: readonly string[]
  twigVocabBlock: string // LLM プロンプトに埋め込む正解語彙集合 (整形済み)
  twigTermSet: Set<string> // 厳密ホワイトリスト判定用
  alphaBlock: string // 階層別 α の説明文 (Constitution 由来)
  phaseModulatorBlock: string // Layer 3 ±0.3 変調表
  bannedWordsBlock: string // 禁止語リスト (プロンプト埋込)
}

export interface Step1Input {
  system: SystemId
  axis: ObservationAxisId
  inputsDir: string
}

export async function loadContext(input: Step1Input): Promise<LoadedContext> {
  const inputPath = path.join(input.inputsDir, `${input.system}-${input.axis}.md`)
  let markdownInput: string
  try {
    markdownInput = await fs.readFile(inputPath, 'utf-8')
  } catch {
    throw new Error(
      `[Step 1] 入力 Markdown が見つかりません: ${inputPath}\n` +
        `Deep Research 出力を ${inputPath} に配置してから再実行してください。`,
    )
  }

  const axis = OBSERVATION_AXES[input.axis]
  const twigTerms = extractTwigTerms(input.system)
  const twigVocabBlock = formatTwigBlock(input.system, twigTerms)
  const alphaBlock = formatAlphaBlock()
  const phaseModulatorBlock = formatPhaseModulatorBlock()
  const bannedWordsBlock = formatBannedBlock()

  return {
    markdownInput,
    axisDefinition: axis.definition,
    observationKeywords: axis.observation_keywords,
    twigVocabBlock,
    twigTermSet: new Set(twigTerms.flatMap((g) => g.terms)),
    alphaBlock,
    phaseModulatorBlock,
    bannedWordsBlock,
  }
}

// ============================================================================
// twigs から system 単位の正解語彙集合を抽出
// ============================================================================

interface TwigGroup {
  groupLabel: string
  terms: string[]
}

function extractTwigTerms(system: SystemId): TwigGroup[] {
  switch (system) {
    case 'zodiac':
      return ZODIAC_SIGNS.map((sign) => ({
        groupLabel: sign,
        terms: ZODIAC_VOCABULARY[sign].map((e) => e.term),
      }))
    case 'animal': {
      const out: TwigGroup[] = []
      for (let id = 1; id <= 60; id++) {
        const entries = ANIMAL_VOCABULARY[id]
        if (!entries || entries.length === 0) continue
        out.push({
          groupLabel: `${id}: ${entries[0].officialName}`,
          terms: entries.map((e) => e.term),
        })
      }
      return out
    }
    case 'mbti':
      return MBTI_TYPES.map((type) => ({
        groupLabel: type,
        terms: MBTI_VOCABULARY[type].map((e) => e.term),
      }))
    case 'rokusei':
      return ROKUSEI_TYPES.map((type) => ({
        groupLabel: type,
        terms: ROKUSEI_VOCABULARY[type].map((e) => e.term),
      }))
  }
}

function formatTwigBlock(system: SystemId, groups: TwigGroup[]): string {
  const lines: string[] = []
  lines.push(`## 正解語彙集合 (${system} の twigs ${groups.length} グループ)`)
  lines.push('')
  lines.push(
    '> LLM はこの集合からのみ feature を採用すること。集合外の語を出した場合は Critique で reject される。',
  )
  lines.push('')
  for (const g of groups) {
    lines.push(`- **${g.groupLabel}**: ${g.terms.join(' / ')}`)
  }
  return lines.join('\n')
}

function formatAlphaBlock(): string {
  return [
    '## 階層別 α (Constitution-as-Code)',
    '',
    `- Layer 1→2 (Rule 重視, 内奥): α = ${HYBRID_DISTANCE_ALPHA.layer1ToLayer2}`,
    `- Layer 2→3 (Embedding 重視, 表層): α = ${HYBRID_DISTANCE_ALPHA.layer2ToLayer3}`,
    '',
    '内奥 (Layer 1) に近づくほど理論規則の拘束力が強い。表層 (Layer 3) に近づくほど',
    '文脈の支配力が強い。features を選ぶ際にも、軸定義 (Rule) と本文の文脈 (Embedding)',
    'の両方をこの比重で重みづける。',
  ].join('\n')
}

function formatPhaseModulatorBlock(): string {
  const rows: string[] = []
  rows.push('| phase | fire | earth | air | water |')
  rows.push('|---|---:|---:|---:|---:|')
  for (const phase of ['spring', 'summer', 'autumn', 'winter'] as Layer3Phase[]) {
    const m = LAYER3_TO_LAYER1_MODULATION[phase]
    rows.push(`| ${phase} | ${m.fire} | ${m.earth} | ${m.air} | ${m.water} |`)
  }
  return [
    '## Layer 3 フェーズ変調 (±0.3, Constitution-as-Code)',
    '',
    ...rows,
    '',
    '対角構造: 春=Air +0.3 / 夏=Fire +0.3 / 秋=Earth +0.3 / 冬=Water +0.3。',
    '時期によって優位元素が変化する。features に時期依存性を含めるなら',
    'この符号と整合させること。',
  ].join('\n')
}

function formatBannedBlock(): string {
  return [
    '## 禁止語彙 (lib/constitution/banned-words.ts より動的取得)',
    '',
    BANNED_WORDS.map((w) => `\`${w}\``).join(' / '),
    '',
    'features には部分一致を含めてこれらの語を 1 字も入れない。',
  ].join('\n')
}
