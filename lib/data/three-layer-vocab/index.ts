// 3 段階モデル語彙コーパス (Mutable Data)
//
// 設計原則: Constitution (Immutable) は lib/constitution/three-layer-model.ts、
// 語彙コーパス (Q3a/Q3b/Q3c 由来) は本ディレクトリで Mutable として管理する。
//
// 合計 320 語: Layer 1 = 4×20 = 80 / Layer 2 = 8×20 = 160 / Layer 3 = 4×20 = 80

export * from './types'
export { LAYER1_VOCABULARY } from './layer1'
export { LAYER2_VOCABULARY } from './layer2'
export { LAYER3_VOCABULARY } from './layer3'
