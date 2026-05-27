// COCOSiL Constitution as Code — 単一の真実（Single Source of Truth）
//
// 設計思想3階層（設計中枢 / Autogenesis Constitution / 言語設計）の機械可読定義。
// AGENTS.md / docs/input/concepts/COCOSiL設計中枢.md / docs/input/concepts/language-design-v1.md
// と整合し、ドリフト時は本コードを正とする（lib/constitution/__tests__/drift.test.ts で検証）。
//
// 設計原則:
//   ① Constitution as Code, Not as Comment
//   ② Independent Judgment by Default
//   ③ Living Loop, Not Living Document

export * from './banned-words'
export * from './ux-sequence'
export * from './immutables'
export * from './mutables'
export * from './observation-axes'
export * from './observation-tree-schema'

export const CONSTITUTION_VERSION = '1.0.0'
export const CONSTITUTION_AS_OF = '2026-05-05'
