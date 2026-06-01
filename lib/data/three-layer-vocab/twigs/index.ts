// F3.1 葉ノード (Twigs) 4 体系語彙コーパス (Mutable Data)
//
// 設計原則: Constitution (Immutable) は lib/constitution/three-layer-model.ts、
// 葉ノード語彙コーパス (Q5a/b/c/d 由来) は本ディレクトリで Mutable として管理する。
//
// 合計 884 語:
//   - Q5a Zodiac:  12 × 10 = 120
//   - Q5b Animal:  60 × 8  = 480
//   - Q5c MBTI:    16 × 11 = 176
//   - Q5d Rokusei: 12 × 9  = 108

export * from './types'
export { ZODIAC_VOCABULARY } from './zodiac'
export { ANIMAL_VOCABULARY } from './animal'
export { MBTI_VOCABULARY } from './mbti'
export { ROKUSEI_VOCABULARY } from './rokusei'
