// DRY_RUN モード用のモック ObservationTreeData ビルダー
//
// CI やオフライン環境で AI Gateway を呼べないときに、
// Zod schema が通る正当な ObservationTreeData をテンプレ的に組み立てる。
// 生成内容は twigs から実在語を引用するため、ホワイトリスト判定も通過する。

import type {
  ObservationTreeData,
  SystemId,
} from '@/lib/constitution/observation-tree-schema'
import {
  OBSERVATION_AXES,
  type ObservationAxisId,
} from '@/lib/constitution/observation-axes'
import {
  ZODIAC_VOCABULARY,
  ANIMAL_VOCABULARY,
  MBTI_VOCABULARY,
  ROKUSEI_VOCABULARY,
  ZODIAC_SIGNS,
  MBTI_TYPES,
  ROKUSEI_TYPES,
} from '@/lib/data/three-layer-vocab/twigs'

export function buildMockTree(
  system: SystemId,
  axis: ObservationAxisId,
): ObservationTreeData {
  const today = new Date().toISOString().slice(0, 10)
  const axisInfo = OBSERVATION_AXES[axis]
  return {
    system,
    axis,
    generated_at: today,
    source_method: 'deep-research-pipeline',
    axis_definition_used: axisInfo.definition,
    observation_keywords_used: [...axisInfo.observation_keywords].slice(0, 5),
    categories: buildMockCategories(system),
  }
}

function buildMockCategories(system: SystemId): ObservationTreeData['categories'] {
  // 3 vector 出現 + confidence std ≥ 0.1 を満たす最小サンプル (3 件)
  // features は実 twigs から引用しホワイトリストを通過する
  const samples = pickThreeSamples(system)
  return [
    {
      category_id: samples[0].id,
      category_label_ja: samples[0].label,
      features: samples[0].features,
      vector: 'positive',
      confidence: 0.85,
      primary_sources: defaultSources(),
    },
    {
      category_id: samples[1].id,
      category_label_ja: samples[1].label,
      features: samples[1].features,
      vector: 'negative',
      confidence: 0.55,
      primary_sources: defaultSources(),
    },
    {
      category_id: samples[2].id,
      category_label_ja: samples[2].label,
      features: samples[2].features,
      vector: 'neutral',
      confidence: 0.7,
      primary_sources: defaultSources(),
    },
  ]
}

function defaultSources(): ObservationTreeData['categories'][number]['primary_sources'] {
  return [
    {
      citation: 'Jung, C. G. (1921). Psychological Types. Princeton University Press.',
      type: 'book',
    },
    {
      citation: 'Keirsey, D. (1998). Please Understand Me II. Prometheus Nemesis.',
      type: 'book',
    },
  ]
}

interface MockSample {
  id: string
  label: string
  features: string[]
}

function pickThreeSamples(system: SystemId): [MockSample, MockSample, MockSample] {
  switch (system) {
    case 'zodiac': {
      const signs = ZODIAC_SIGNS.slice(0, 3)
      return signs.map((s) => ({
        id: s,
        label: s,
        features: ZODIAC_VOCABULARY[s].slice(0, 6).map((e) => e.term),
      })) as [MockSample, MockSample, MockSample]
    }
    case 'animal': {
      return [1, 2, 3].map((id) => ({
        id: `animal_${id}`,
        label: ANIMAL_VOCABULARY[id][0].officialName,
        features: ANIMAL_VOCABULARY[id].slice(0, 6).map((e) => e.term),
      })) as [MockSample, MockSample, MockSample]
    }
    case 'mbti': {
      const types = MBTI_TYPES.slice(0, 3)
      return types.map((t) => ({
        id: t.toLowerCase(),
        label: t,
        features: MBTI_VOCABULARY[t].slice(0, 6).map((e) => e.term),
      })) as [MockSample, MockSample, MockSample]
    }
    case 'rokusei': {
      const types = ROKUSEI_TYPES.slice(0, 3)
      return types.map((t) => ({
        id: t.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        label: t,
        features: ROKUSEI_VOCABULARY[t].slice(0, 6).map((e) => e.term),
      })) as [MockSample, MockSample, MockSample]
    }
  }
}
