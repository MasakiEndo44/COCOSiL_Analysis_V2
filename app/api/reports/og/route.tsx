import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { clampNameForOg } from '@/lib/constitution/name-moderation'

export const runtime = 'edge'

// SNSシェア専用カード（正方形）。catchphrase ＋ 統合像(core)の核だけを伝える。
const WIDTH = 1080
const HEIGHT = 1080

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const rawName = searchParams.get('name') ?? 'あなた'
  const displayName = clampNameForOg(rawName)
  const catchphrase = searchParams.get('catchphrase') ?? ''
  const excerpt = searchParams.get('core') ?? ''
  const birthday = searchParams.get('birthday') ?? ''

  return new ImageResponse(
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

        {catchphrase && (
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
            {catchphrase}
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
}
