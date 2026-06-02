import { ImageResponse } from 'next/og'
import type { ReportContent } from './schemas'
import { clampNameForOg } from '@/lib/constitution/name-moderation'

// SNSシェア専用カード（正方形）。フルレポートは画面内HTMLが主役で、
// この画像は catchphrase ＋ 統合像(core)の核だけを伝えるシェアカードに降格。
const WIDTH = 1080
const HEIGHT = 1080

/** core の冒頭を1〜2文だけ抜き、カードに収まる長さに丸める。 */
function pickCoreExcerpt(core: string, maxLen = 120): string {
  const text = core.trim()
  if (text.length <= maxLen) return text
  const head = text.slice(0, maxLen)
  const lastBreak = Math.max(head.lastIndexOf('。'), head.lastIndexOf('、'))
  return (lastBreak > 40 ? head.slice(0, lastBreak + 1) : head) + '…'
}

export async function buildOgImageResponse(
  content: ReportContent,
  rawDisplayName: string | null,
  birthday: string,
): Promise<ArrayBuffer> {
  const displayName = clampNameForOg(rawDisplayName ?? 'あなた')
  const excerpt = pickCoreExcerpt(content.core)

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          background: 'linear-gradient(160deg, #f5f0ff 0%, #fff 50%, #f0f4ff 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '88px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 22, color: '#9b8fbd', letterSpacing: '0.14em' }}>
          COCOSiL 統合レポート
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 48,
            fontWeight: 900,
            color: '#1e1a3c',
            textAlign: 'center',
            lineHeight: 1.25,
            marginTop: 28,
          }}
        >
          {displayName === 'あなた' ? 'あなたの地図' : `${displayName}さんの地図`}
        </div>

        {content.catchphrase && (
          <div
            style={{
              display: 'flex',
              fontSize: 34,
              fontWeight: 700,
              color: '#7c5cfc',
              textAlign: 'center',
              padding: '18px 36px',
              background: 'rgba(124,92,252,0.08)',
              borderRadius: 48,
              marginTop: 36,
            }}
          >
            {content.catchphrase}
          </div>
        )}

        {excerpt && (
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              lineHeight: 1.8,
              color: '#3a3560',
              textAlign: 'center',
              marginTop: 44,
              maxWidth: 820,
            }}
          >
            {excerpt}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginTop: 'auto',
            paddingTop: 48,
          }}
        >
          {birthday && (
            <div style={{ display: 'flex', fontSize: 20, color: '#9b8fbd' }}>
              {birthday}生まれ
            </div>
          )}
          <div style={{ display: 'flex', fontSize: 20, color: '#c4b5fd' }}>cocosil.jp</div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  )

  return imageResponse.arrayBuffer()
}
