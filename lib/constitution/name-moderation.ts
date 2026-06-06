// COCOSiL Constitution: ユーザーネームモデレーション (D8)
// 設計根拠: 詳細要件定義書 §4.1 D8 / §6.4 profiles.display_name
// 自由入力ユーザーネームのモデレーション。差別語・長すぎる名前・攻撃的絵文字を遮断。
// 検知時はフォールバック「あなた」に置換してレポート生成を継続する。

export const NAME_MAX_LENGTH = 20
export const NAME_DISPLAY_MAX_LENGTH = 16
export const NAME_FALLBACK = 'あなた'

const BANNED_NAME_PATTERNS = [
  /ばか/i,
  /死ね/i,
  /死んで/i,
  /殺/,
  /くず/i,
  /うんこ/i,
  /バカ/,
  /アホ/,
]

const EMOJI_ATTACK_PATTERN = /(\p{Emoji_Presentation}|\p{Extended_Pictographic}){4,}/u

export interface ModerationResult {
  safe: boolean
  sanitized: string
  reason?: string
}

export function moderateDisplayName(rawName: string | null | undefined): ModerationResult {
  if (!rawName || rawName.trim() === '') {
    return { safe: true, sanitized: NAME_FALLBACK }
  }

  const trimmed = rawName.trim()

  for (const pattern of BANNED_NAME_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { safe: false, sanitized: NAME_FALLBACK, reason: 'banned_word' }
    }
  }

  if (EMOJI_ATTACK_PATTERN.test(trimmed)) {
    return { safe: false, sanitized: NAME_FALLBACK, reason: 'emoji_attack' }
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    const clipped = trimmed.slice(0, NAME_DISPLAY_MAX_LENGTH) + '…'
    return { safe: true, sanitized: clipped }
  }

  return { safe: true, sanitized: trimmed }
}

export function clampNameForOg(name: string): string {
  if (name.length > NAME_MAX_LENGTH) {
    return name.slice(0, NAME_DISPLAY_MAX_LENGTH) + '…'
  }
  return name
}
