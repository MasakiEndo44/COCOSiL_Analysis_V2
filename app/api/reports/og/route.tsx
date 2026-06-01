import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import type { ReportContent } from '@/lib/reports/schemas'
import { clampNameForOg } from '@/lib/constitution/name-moderation'

export const runtime = 'edge'

const WIDTH = 1024
const HEIGHT = 1792

function Section({
  label,
  text,
  accent = false,
}: {
  label: string
  text: string
  accent?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '24px 32px',
        background: accent ? 'rgba(124,92,252,0.06)' : 'transparent',
        borderRadius: 16,
        marginBottom: 4,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 13,
          fontWeight: 700,
          color: '#7c5cfc',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 18,
          lineHeight: 1.7,
          color: '#1e1a3c',
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </div>
    </div>
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const rawName = searchParams.get('name') ?? 'あなた'
  const displayName = clampNameForOg(rawName)
  const catchphrase = searchParams.get('catchphrase') ?? ''
  const opening = searchParams.get('opening') ?? ''
  const four_lights = searchParams.get('four_lights') ?? ''
  const integration = searchParams.get('integration') ?? ''
  const relational_hint = searchParams.get('relational_hint') ?? ''
  const closing = searchParams.get('closing') ?? ''
  const birthday = searchParams.get('birthday') ?? ''

  const content: ReportContent = {
    catchphrase,
    opening,
    four_lights,
    integration,
    relational_hint,
    closing,
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          background: 'linear-gradient(160deg, #f5f0ff 0%, #fff 50%, #f0f4ff 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '52px 48px 32px',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', fontSize: 13, color: '#9b8fbd', letterSpacing: '0.12em' }}>
            COCOSiL 統合レポート
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 38,
              fontWeight: 900,
              color: '#1e1a3c',
              textAlign: 'center',
              lineHeight: 1.25,
            }}
          >
            {displayName === 'あなた' ? 'あなたの地図' : `${displayName}さんの地図`}
          </div>
          {content.catchphrase && (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 700,
                color: '#7c5cfc',
                textAlign: 'center',
                padding: '12px 24px',
                background: 'rgba(124,92,252,0.08)',
                borderRadius: 40,
              }}
            >
              {content.catchphrase}
            </div>
          )}
        </div>

        {/* 区切り線 */}
        <div
          style={{
            display: 'flex',
            height: 1,
            background: 'linear-gradient(90deg, transparent, #c4b5fd, transparent)',
            margin: '0 48px',
          }}
        />

        {/* セクション群 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '24px 24px',
            gap: 4,
            overflow: 'hidden',
          }}
        >
          {content.opening && (
            <Section label="はじめに" text={content.opening} />
          )}
          {content.four_lights && (
            <Section label="4つの視点" text={content.four_lights} />
          )}
          {content.integration && (
            <Section label="統合像" text={content.integration} accent />
          )}
          {content.relational_hint && (
            <Section label="大切な人との関係" text={content.relational_hint} />
          )}
          {content.closing && (
            <Section label="おわりに" text={content.closing} />
          )}
        </div>

        {/* フッター */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 48px',
            borderTop: '1px solid rgba(196,181,253,0.3)',
          }}
        >
          {birthday && (
            <div style={{ display: 'flex', fontSize: 12, color: '#9b8fbd' }}>
              {birthday}生まれ
            </div>
          )}
          <div style={{ display: 'flex', fontSize: 12, color: '#c4b5fd' }}>cocosil.jp</div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  )
}
