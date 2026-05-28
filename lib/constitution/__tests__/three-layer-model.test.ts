import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  LAYER1_ELEMENTS,
  JUNG_FUNCTIONS,
  LAYER1_TO_JUNG,
  LAYER1_TO_HUMOR,
  LAYER2_STYLES,
  LAYER2_TO_LAYER1,
  LAYER3_PHASES,
  LAYER3_TO_HUMOR,
  LAYER3_TO_LAYER1_MODULATION,
  LAYER3_TO_LAYER2_MODULATION,
  HYBRID_DISTANCE_ALPHA,
  Layer2ProbabilityVectorSchema,
  ModulationCoefficientSchema,
  computeHybridDistance,
  getLayer1Distribution,
  applyPhaseModulationToLayer1,
} from '@/lib/constitution/three-layer-model'

const repoRoot = path.resolve(__dirname, '../../..')

function readDoc(relPath: string): string {
  return readFileSync(path.join(repoRoot, relPath), 'utf-8')
}

describe('Three-Layer Model: 3 段階モデルの構造整合性', () => {
  test('Layer 1 は 4 元素ちょうど (Q1 §1, Q2 §1 で確定)', () => {
    expect(LAYER1_ELEMENTS).toHaveLength(4)
    expect(LAYER1_ELEMENTS).toEqual(['fire', 'earth', 'air', 'water'])
  })

  test('Layer 1 ↔ Jung 4 機能の 1:1 対応 (Q2 §5.2 で 5/5 確定)', () => {
    expect(LAYER1_TO_JUNG.fire).toBe('intuition')
    expect(LAYER1_TO_JUNG.earth).toBe('sensation')
    expect(LAYER1_TO_JUNG.air).toBe('thinking')
    expect(LAYER1_TO_JUNG.water).toBe('feeling')
    const mapped = new Set(Object.values(LAYER1_TO_JUNG))
    for (const fn of JUNG_FUNCTIONS) {
      expect(mapped.has(fn)).toBe(true)
    }
  })

  test('Layer 1 ↔ 古典 4 体液の対応 (Hippocrates / Avicenna)', () => {
    expect(LAYER1_TO_HUMOR.fire).toBe('choleric')
    expect(LAYER1_TO_HUMOR.earth).toBe('melancholic')
    expect(LAYER1_TO_HUMOR.air).toBe('sanguine')
    expect(LAYER1_TO_HUMOR.water).toBe('phlegmatic')
  })

  test('Layer 2 は 8 カテゴリちょうど (Keirsey 4 + 動物 4)', () => {
    expect(LAYER2_STYLES).toHaveLength(8)
    for (const id of ['sp', 'sj', 'nf', 'nt', 'sun', 'earthMode', 'fullMoon', 'newMoon']) {
      expect(LAYER2_STYLES as readonly string[]).toContain(id)
    }
  })

  test('Layer 3 は 4 フェーズちょうど (春夏秋冬)', () => {
    expect(LAYER3_PHASES).toHaveLength(4)
    expect(LAYER3_PHASES).toEqual(['spring', 'summer', 'autumn', 'winter'])
  })

  test('Layer 3 ↔ 季節体液の対応 (春=多血/夏=胆汁/秋=黒胆汁/冬=粘液)', () => {
    expect(LAYER3_TO_HUMOR.spring).toBe('sanguine')
    expect(LAYER3_TO_HUMOR.summer).toBe('choleric')
    expect(LAYER3_TO_HUMOR.autumn).toBe('melancholic')
    expect(LAYER3_TO_HUMOR.winter).toBe('phlegmatic')
  })
})

describe('Layer 2 → Layer 1 N:M 確率分布 (Q4 §5.1 確定)', () => {
  test('全 8 カテゴリの確率分布が Σ=1.00 (保存則)', () => {
    for (const style of LAYER2_STYLES) {
      const dist = LAYER2_TO_LAYER1[style]
      const sum = dist.fire + dist.earth + dist.air + dist.water
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.001)
    }
  })

  test('Layer2ProbabilityVectorSchema が Σ=1.00 を強制する', () => {
    expect(
      Layer2ProbabilityVectorSchema.safeParse({
        fire: 0.45, earth: 0.40, air: 0.05, water: 0.10,
      }).success,
    ).toBe(true)

    expect(
      Layer2ProbabilityVectorSchema.safeParse({
        fire: 0.5, earth: 0.5, air: 0.5, water: 0.5,
      }).success,
    ).toBe(false)
  })

  test('Q4 §5.1 の主成分セル (各 Trunks の最大要素)', () => {
    expect(LAYER2_TO_LAYER1.sp.fire).toBe(0.45)
    expect(LAYER2_TO_LAYER1.sj.earth).toBe(0.85)
    expect(LAYER2_TO_LAYER1.nf.water).toBe(0.60)
    expect(LAYER2_TO_LAYER1.nt.air).toBe(0.85)
    expect(LAYER2_TO_LAYER1.sun.fire).toBe(0.55)
    expect(LAYER2_TO_LAYER1.earthMode.earth).toBe(0.65)
    expect(LAYER2_TO_LAYER1.fullMoon.air).toBe(0.45)
    expect(LAYER2_TO_LAYER1.newMoon.water).toBe(0.60)
  })
})

describe('Layer 3 変調行列 (Q3c §5.1, §5.2)', () => {
  test('Layer 1 への対角変調 (春=Air / 夏=Fire / 秋=Earth / 冬=Water に +0.3)', () => {
    expect(LAYER3_TO_LAYER1_MODULATION.spring.air).toBe(0.3)
    expect(LAYER3_TO_LAYER1_MODULATION.summer.fire).toBe(0.3)
    expect(LAYER3_TO_LAYER1_MODULATION.autumn.earth).toBe(0.3)
    expect(LAYER3_TO_LAYER1_MODULATION.winter.water).toBe(0.3)
  })

  test('全変調係数が ModulationCoefficientSchema (-0.3〜+0.3) 範囲内', () => {
    for (const phase of LAYER3_PHASES) {
      for (const elem of LAYER1_ELEMENTS) {
        const coef = LAYER3_TO_LAYER1_MODULATION[phase][elem]
        expect(ModulationCoefficientSchema.safeParse(coef).success).toBe(true)
      }
      for (const style of LAYER2_STYLES) {
        const coef = LAYER3_TO_LAYER2_MODULATION[phase][style]
        expect(ModulationCoefficientSchema.safeParse(coef).success).toBe(true)
      }
    }
  })

  test('Layer 2 変調の特徴セル (夏×太陽 / 冬×新月 / 秋×SJ / 秋×地球 = +0.3)', () => {
    expect(LAYER3_TO_LAYER2_MODULATION.summer.sun).toBe(0.3)
    expect(LAYER3_TO_LAYER2_MODULATION.winter.newMoon).toBe(0.3)
    expect(LAYER3_TO_LAYER2_MODULATION.autumn.sj).toBe(0.3)
    expect(LAYER3_TO_LAYER2_MODULATION.autumn.earthMode).toBe(0.3)
  })
})

describe('Hybrid Distance Function (Q4 §4.3 階層別 α)', () => {
  test('Layer 1 → Layer 2 では α=0.7 (Rule 重視)', () => {
    expect(HYBRID_DISTANCE_ALPHA.layer1ToLayer2).toBe(0.7)
  })

  test('Layer 2 → Layer 3 では α=0.3 (Embedding 重視)', () => {
    expect(HYBRID_DISTANCE_ALPHA.layer2ToLayer3).toBe(0.3)
  })

  test('computeHybridDistance: α=0.7 で Rule 重視の重み付け', () => {
    const result = computeHybridDistance(0.2, 0.8, 'layer1ToLayer2')
    expect(result.alpha).toBe(0.7)
    expect(result.hybridDistance).toBeCloseTo(0.7 * 0.2 + 0.3 * 0.8, 5)
  })

  test('computeHybridDistance: α=0.3 で Embedding 重視の重み付け', () => {
    const result = computeHybridDistance(0.2, 0.8, 'layer2ToLayer3')
    expect(result.alpha).toBe(0.3)
    expect(result.hybridDistance).toBeCloseTo(0.3 * 0.2 + 0.7 * 0.8, 5)
  })
})

describe('ヘルパー関数', () => {
  test('getLayer1Distribution: SP の主成分は Fire (0.45)', () => {
    const sp = getLayer1Distribution('sp')
    expect(sp.fire).toBe(0.45)
    expect(sp.earth).toBe(0.40)
  })

  test('applyPhaseModulationToLayer1: 再正規化後も Σ=1.00 を保持', () => {
    const sp = getLayer1Distribution('sp')
    const modulated = applyPhaseModulationToLayer1(sp, 'summer')
    const sum = modulated.fire + modulated.earth + modulated.air + modulated.water
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.001)
    // 夏は Fire +0.3 で SP の Fire 0.45 が増える方向
    expect(modulated.fire).toBeGreaterThan(sp.fire)
  })

  test('applyPhaseModulationToLayer1: 冬で Water 主成分の NF が水を強化', () => {
    const nf = getLayer1Distribution('nf')
    const modulated = applyPhaseModulationToLayer1(nf, 'winter')
    // 冬は Water +0.3 で NF の Water 0.60 が増える方向
    expect(modulated.water).toBeGreaterThan(nf.water)
  })
})

describe('Drift: コードと議論ログ / Deep Research 結果の整合性', () => {
  test('議論ログに 3 段階モデル (心の核 / 振る舞い / 時期の出方) の記述がある', () => {
    // 注: 議論ログは「えんまさ向けやさしい言葉版」で書かれており、Layer 1 / Layer 2 /
    // Layer 3 という英語ラベルは使わず、日本語の段階ラベルで記述される。
    const doc = readDoc('docs/discussions/議論ログ_4体系統合メソッド幹と枝モデル.md')
    expect(doc).toContain('心の核')
    expect(doc).toContain('振る舞い')
    expect(doc).toContain('時期の出方')
    expect(doc).toContain('3 段階')
  })

  test('Q4 結果に Hybrid Distance / Layer 1 / Layer 2 / α / McCrae & Costa の記述がある', () => {
    // 注: 数式は base64 image として埋め込まれており、α=0.7 / α=0.3 のテキストは
    // 直接残らない。代わりにキーワードの存在を検証する。
    const doc = readDoc('docs/input/deep-research/N_M確率対応モデルの既存研究網羅.md')
    expect(doc).toContain('Hybrid Distance')
    expect(doc).toContain('Layer 1')
    expect(doc).toContain('Layer 2')
    expect(doc).toContain('α')
    expect(doc).toContain('McCrae')
  })

  test('Q3c 結果に対角変調 (春Air / 夏Fire / 秋Earth / 冬Water) の記述がある', () => {
    const doc = readDoc('docs/input/deep-research/Layer 3 時期変調コーパス生成.md')
    expect(doc).toContain('春')
    expect(doc).toContain('Air')
    expect(doc).toContain('Fire')
    expect(doc).toContain('+0.3')
  })
})
