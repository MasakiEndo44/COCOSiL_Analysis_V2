// COCOSiL Constitution: Anatta-Aware Output 構文ガード
// 設計根拠: 詳細要件定義書 §4.1B / Stage 1 F3.1.14 / D13
// 仏教「無我（anattā）」原則に基づき、性格を固定的実体として断定する構文を排除する。
// このファイルが単一の真実。要件書・プロンプトはシンボル参照のみ。

export const BANNED_OUTPUT_PATTERNS = [
  /あなたは(.{1,30})です/,
  /あなたは(.{1,30})タイプです/,
  /あなたは(.{1,30})である/,
  /必ず(.{1,30})する/,
  /絶対に(.{1,30})/,
] as const

export type BannedOutputPattern = (typeof BANNED_OUTPUT_PATTERNS)[number]

export function findBannedOutputPatterns(text: string): RegExp[] {
  return BANNED_OUTPUT_PATTERNS.filter((pattern) => pattern.test(text))
}

export function containsBannedOutputPattern(text: string): boolean {
  return findBannedOutputPatterns(text).length > 0
}
