// 4 体系 Trunks 解決ロジック
//
// 生年月日 + MBTI → FourSystemTrunks への決定論的射影。
// 既存の純関数 (lib/diagnostics/{animal,zodiac,six-star}.ts) を組み合わせる。
//
// 体系別射影マップの根拠:
//   - baseAnimal → Layer2AnimalStyle: Q5b-1/2/3 内の人間関係 3 分類 × 4 モード派生
//     (議論ログ_4体系統合メソッド幹と枝モデル.md, Q1)
//   - サイン名 → Layer1Element: 古典 4 元素説 (Tetrabiblos Book I, Ch.18)
//   - 六星人タイプ → +/-: 細木数子の偶数年=陽 / 奇数年=陰 (lib/diagnostics/six-star.ts と整合)
//   - MBTI 4 文字 → Keirsey 4 群: Keirsey (1998) の NT/NF/SJ/SP 分類

import { calculate60Animal } from '@/lib/diagnostics/animal'
import { calculateZodiacSign } from '@/lib/diagnostics/zodiac'
import { calculateSixStar } from '@/lib/diagnostics/six-star'
import type {
  Layer1Element,
  Layer2AnimalStyle,
  Layer2KeirseyStyle,
} from '@/lib/constitution/three-layer-model'
import type {
  FourSystemTrunks,
  RokuseiPolarity,
  UserDiagnosticInput,
} from './types'

// ============================================================================
// baseAnimal → Layer2AnimalStyle (人間関係 3 分類 + α)
// ============================================================================

const BASE_ANIMAL_TO_STYLE: Record<string, Layer2AnimalStyle> = {
  チーター: 'sun',
  ペガサス: 'sun',
  ライオン: 'sun',
  ゾウ: 'sun',
  たぬき: 'newMoon',
  こじか: 'newMoon',
  コアラ: 'earthMode',
  虎: 'earthMode',
  狼: 'earthMode',
  猿: 'earthMode',
  黒ひょう: 'fullMoon',
  ひつじ: 'fullMoon',
}

export function animalToStyle(baseAnimal: string): Layer2AnimalStyle {
  const style = BASE_ANIMAL_TO_STYLE[baseAnimal]
  if (!style) {
    throw new Error(`未知の基本動物: ${baseAnimal}`)
  }
  return style
}

// ============================================================================
// 12 サイン → Layer1Element (4 元素説)
// ============================================================================

const ZODIAC_NAME_TO_ELEMENT: Record<string, Layer1Element> = {
  牡羊座: 'fire',
  獅子座: 'fire',
  射手座: 'fire',
  牡牛座: 'earth',
  乙女座: 'earth',
  山羊座: 'earth',
  双子座: 'air',
  天秤座: 'air',
  水瓶座: 'air',
  蟹座: 'water',
  蠍座: 'water',
  魚座: 'water',
}

export function zodiacToElement(zodiacName: string): Layer1Element {
  const element = ZODIAC_NAME_TO_ELEMENT[zodiacName]
  if (!element) {
    throw new Error(`未知の星座名: ${zodiacName}`)
  }
  return element
}

// ============================================================================
// 六星人タイプ (例: "土星人+") → RokuseiPolarity
// ============================================================================

export function rokuseiToPolarity(rokuseiType: string): RokuseiPolarity {
  if (rokuseiType.endsWith('+')) return '+'
  if (rokuseiType.endsWith('-')) return '-'
  throw new Error(`六星人タイプの極性が判定不能: ${rokuseiType}`)
}

// ============================================================================
// MBTI 4 文字 → Layer2KeirseyStyle (NT/NF/SJ/SP)
// ============================================================================

export function mbtiToKeirsey(mbti: string): Layer2KeirseyStyle {
  const n = mbti.includes('N')
  const t = mbti.includes('T')
  const j = mbti.includes('J')
  if (n && t) return 'nt' // Rational
  if (n && !t) return 'nf' // Idealist
  if (!n && j) return 'sj' // Guardian
  return 'sp' // Artisan (SP: !N && !J)
}

// ============================================================================
// 主関数: 4 体系 Trunks への一括解決
// ============================================================================

export function resolveFourSystemTrunks(
  input: UserDiagnosticInput,
): FourSystemTrunks {
  const year = input.birthDate.getFullYear()
  const month = input.birthDate.getMonth() + 1
  const day = input.birthDate.getDate()

  const animal = calculate60Animal(year, month, day)
  const zodiac = calculateZodiacSign(month, day)
  const rokusei = calculateSixStar(year, month, day)

  return {
    keirsey: mbtiToKeirsey(input.mbti),
    animalStyle: animalToStyle(animal.animalType),
    zodiacElement: zodiacToElement(zodiac),
    rokuseiPolarity: rokuseiToPolarity(rokusei),
    phase: input.phase,
  }
}
