// F3.1 4 体系統合アルゴリズム公開エントリ
//
// 設計根拠: docs/output/goals/f3-keyword-tree-integration.md

export * from './types'
export {
  resolveFourSystemTrunks,
  animalToStyle,
  zodiacToElement,
  rokuseiToPolarity,
  mbtiToKeirsey,
} from './trunks'
export { computeLayer1Distribution } from './probability'
export {
  computeAxisAffinity,
  getLayerAlpha,
  type AxisAffinity,
} from './hybrid-distance'
export { harvest } from './harvest'
