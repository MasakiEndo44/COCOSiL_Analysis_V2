import { describe, expect, test } from 'vitest'
import {
  animalToStyle,
  zodiacToElement,
  rokuseiToPolarity,
  mbtiToKeirsey,
  resolveFourSystemTrunks,
} from '@/lib/diagnostics/integration/trunks'
import type { MbtiType } from '@/lib/data/three-layer-vocab/twigs'

describe('mbtiToKeirsey: 16 タイプ → 4 群', () => {
  test('NT (Rational)', () => {
    expect(mbtiToKeirsey('INTJ')).toBe('nt')
    expect(mbtiToKeirsey('INTP')).toBe('nt')
    expect(mbtiToKeirsey('ENTJ')).toBe('nt')
    expect(mbtiToKeirsey('ENTP')).toBe('nt')
  })

  test('NF (Idealist)', () => {
    expect(mbtiToKeirsey('INFJ')).toBe('nf')
    expect(mbtiToKeirsey('INFP')).toBe('nf')
    expect(mbtiToKeirsey('ENFJ')).toBe('nf')
    expect(mbtiToKeirsey('ENFP')).toBe('nf')
  })

  test('SJ (Guardian)', () => {
    expect(mbtiToKeirsey('ISTJ')).toBe('sj')
    expect(mbtiToKeirsey('ISFJ')).toBe('sj')
    expect(mbtiToKeirsey('ESTJ')).toBe('sj')
    expect(mbtiToKeirsey('ESFJ')).toBe('sj')
  })

  test('SP (Artisan)', () => {
    expect(mbtiToKeirsey('ISTP')).toBe('sp')
    expect(mbtiToKeirsey('ISFP')).toBe('sp')
    expect(mbtiToKeirsey('ESTP')).toBe('sp')
    expect(mbtiToKeirsey('ESFP')).toBe('sp')
  })
})

describe('zodiacToElement: 12 サイン → 4 元素', () => {
  test('fire (牡羊/獅子/射手)', () => {
    expect(zodiacToElement('牡羊座')).toBe('fire')
    expect(zodiacToElement('獅子座')).toBe('fire')
    expect(zodiacToElement('射手座')).toBe('fire')
  })

  test('earth (牡牛/乙女/山羊)', () => {
    expect(zodiacToElement('牡牛座')).toBe('earth')
    expect(zodiacToElement('乙女座')).toBe('earth')
    expect(zodiacToElement('山羊座')).toBe('earth')
  })

  test('air (双子/天秤/水瓶)', () => {
    expect(zodiacToElement('双子座')).toBe('air')
    expect(zodiacToElement('天秤座')).toBe('air')
    expect(zodiacToElement('水瓶座')).toBe('air')
  })

  test('water (蟹/蠍/魚)', () => {
    expect(zodiacToElement('蟹座')).toBe('water')
    expect(zodiacToElement('蠍座')).toBe('water')
    expect(zodiacToElement('魚座')).toBe('water')
  })

  test('未知サインは throw', () => {
    expect(() => zodiacToElement('火星座')).toThrow()
  })
})

describe('animalToStyle: 基本動物 12 種 → 4 モード', () => {
  test('sun (チーター/ペガサス/ライオン/ゾウ)', () => {
    expect(animalToStyle('チーター')).toBe('sun')
    expect(animalToStyle('ペガサス')).toBe('sun')
    expect(animalToStyle('ライオン')).toBe('sun')
    expect(animalToStyle('ゾウ')).toBe('sun')
  })

  test('newMoon (たぬき/こじか)', () => {
    expect(animalToStyle('たぬき')).toBe('newMoon')
    expect(animalToStyle('こじか')).toBe('newMoon')
  })

  test('earthMode (コアラ/虎/狼/猿)', () => {
    expect(animalToStyle('コアラ')).toBe('earthMode')
    expect(animalToStyle('虎')).toBe('earthMode')
    expect(animalToStyle('狼')).toBe('earthMode')
    expect(animalToStyle('猿')).toBe('earthMode')
  })

  test('fullMoon (黒ひょう/ひつじ)', () => {
    expect(animalToStyle('黒ひょう')).toBe('fullMoon')
    expect(animalToStyle('ひつじ')).toBe('fullMoon')
  })
})

describe('rokuseiToPolarity: 六星人タイプ → +/-', () => {
  test('+ サフィックス', () => {
    expect(rokuseiToPolarity('土星人+')).toBe('+')
    expect(rokuseiToPolarity('金星人+')).toBe('+')
    expect(rokuseiToPolarity('水星人+')).toBe('+')
  })

  test('- サフィックス', () => {
    expect(rokuseiToPolarity('土星人-')).toBe('-')
    expect(rokuseiToPolarity('木星人-')).toBe('-')
  })

  test('極性なしは throw', () => {
    expect(() => rokuseiToPolarity('土星人')).toThrow()
  })
})

describe('resolveFourSystemTrunks: 生年月日 + MBTI 境界ケース', () => {
  // 5 ケース、生年月日の様々な境界 (うるう年 / 年始 / 月末 / 偶奇年 / 古い年)
  const cases: Array<{
    label: string
    input: { birthDate: Date; mbti: MbtiType }
    expectedZodiacElement: string
    expectedPolarity: '+' | '-'
    expectedKeirsey: string
  }> = [
    {
      label: '1985-01-01 (奇数年 / 山羊座)',
      input: { birthDate: new Date(1985, 0, 1), mbti: 'INTJ' },
      expectedZodiacElement: 'earth',
      expectedPolarity: '-',
      expectedKeirsey: 'nt',
    },
    {
      label: '2000-02-29 (うるう年 / 魚座)',
      input: { birthDate: new Date(2000, 1, 29), mbti: 'ENFP' },
      expectedZodiacElement: 'water',
      expectedPolarity: '+',
      expectedKeirsey: 'nf',
    },
    {
      label: '1998-08-15 (偶数年 / 獅子座)',
      input: { birthDate: new Date(1998, 7, 15), mbti: 'ESTJ' },
      expectedZodiacElement: 'fire',
      expectedPolarity: '+',
      expectedKeirsey: 'sj',
    },
    {
      label: '1993-06-21 (奇数年 / 双子座と蟹座の境)',
      input: { birthDate: new Date(1993, 5, 21), mbti: 'ISFP' },
      expectedZodiacElement: 'air',
      expectedPolarity: '-',
      expectedKeirsey: 'sp',
    },
    {
      label: '1976-12-31 (年末 / 山羊座)',
      input: { birthDate: new Date(1976, 11, 31), mbti: 'INFJ' },
      expectedZodiacElement: 'earth',
      expectedPolarity: '+',
      expectedKeirsey: 'nf',
    },
  ]

  test.each(cases)('$label', ({ input, expectedZodiacElement, expectedPolarity, expectedKeirsey }) => {
    const trunks = resolveFourSystemTrunks(input)
    expect(trunks.zodiacElement).toBe(expectedZodiacElement)
    expect(trunks.rokuseiPolarity).toBe(expectedPolarity)
    expect(trunks.keirsey).toBe(expectedKeirsey)
    expect(['sun', 'newMoon', 'earthMode', 'fullMoon']).toContain(trunks.animalStyle)
  })
})
