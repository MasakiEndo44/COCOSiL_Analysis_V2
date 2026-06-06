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
export { computeAxisScores, getAxisBounds } from './affinity-score'
export { harvest } from './harvest'
export {
  PROFILE_CORE_VERSION,
  ProfileCoreSchema,
  AxisScoresSchema,
  ProfileWeightsSchema,
  IdentitySchema,
  Type32Schema,
  CharacterLabelSchema,
  StrengthsSchema,
  WeaknessSchema,
  JohariBlindspotSchema,
  DistributionEntrySchema,
  type ProfileCore,
  type Identity,
  type Type32,
} from './profile-core'
