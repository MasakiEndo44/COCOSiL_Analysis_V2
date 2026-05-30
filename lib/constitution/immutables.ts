// COCOSiL Constitution: 絶対不変リスト（Autogenesis が触れてはいけないもの）
// 根拠: AGENTS.md §7 Autogenesis Constitution / docs/discussions/20260504_議論ログ_デジタル生命体移行企画.md

export const POLICY_IMMUTABLES = {
  forbidden: [
    '三毒増幅（貪・瞋・痴の煽り）',
    '主観満足度の最大化',
    'Sycophancy（迎合）の最適化',
  ],
  required: [
    '共感→安心→分析→行動 順序の遵守',
    '禁止語彙の不混入',
    'Anti-Sycophancy判定の通過',
  ],
} as const

// 評価指標の定義（測るもの）。閾値や測定方法は Mutable だが「何を測るか」は不変。
export const REFLECTION_METRICS = [
  'rephrasing_rate',           // 再言語化率：ユーザーが問題を別の言葉で言い直した回数
  'contradiction_acceptance',   // 矛盾受容率：矛盾指摘後の「そうかも」応答率
  'action_specificity_score',   // 行動記録の具体度：抽象→具体への変化度（1〜5）
] as const

export const PMF_METRICS = ['session_return_7d_rate'] as const
export const PMF_THRESHOLD = 0.30 // 7日以内再訪率 30%（PMF成功基準）

// PMF と Reflection の同時測定が必須（20260505_議論ログ_設計整合性ハーネス再設計 法則4）
// 7日再訪率↑ AND 内省スコア↓ = Sycophancy疑惑
export const SYCOPHANCY_ALERT = {
  description: 'PMF再訪率が高いのに内省スコアが低い場合、Sycophancyの疑い',
  detection: 'session_return_7d_rate > PMF_THRESHOLD AND rephrasing_rate < median',
} as const

export type ReflectionMetric = (typeof REFLECTION_METRICS)[number]
export type PmfMetric = (typeof PMF_METRICS)[number]
