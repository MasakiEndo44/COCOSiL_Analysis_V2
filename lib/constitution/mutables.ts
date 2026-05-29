// COCOSiL Constitution: 進化対象（Autogenesis が改善してよいもの）
// 根拠: AGENTS.md §7 Autogenesis Constitution / docs/discussions/20260504_議論ログ_デジタル生命体移行企画.md

// Autogenesis が編集を許可されるパスのglobパターン
export const MUTABLE_PATHS = [
  'lib/prompts/**',
  'lib/data/**',
] as const

// Autogenesis が改善してよいストラテジー（実装の選択肢）
export const MUTABLE_STRATEGIES = [
  'memory_strategy',     // ユーザーの気づきの要約・保存方法
  'retrieval_policy',    // 過去の気づきをセッションに注入する方法
  'output_structure',    // レポートのセクション構成
  'eval_threshold',      // 内省スコアの閾値・測定方法
] as const

// Schema変更（migration）は Mutable だが sandbox eval 通過必須（Layer 1扱い）
// Sub-Agent Pattern は Mutable だが えんまさ承認必須（Layer 2扱い）
export const MUTABLE_WITH_GATE = {
  schema_change: 'sandbox eval 通過後のみ migration 適用可',
  sub_agent_pattern: 'えんまさ承認必須（Layer 2扱い）',
} as const

export type MutableStrategy = (typeof MUTABLE_STRATEGIES)[number]
