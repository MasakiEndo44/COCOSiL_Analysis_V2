// Vercel OG (Satori) 用 React コンポーネント
// Satori 制約: flexbox のみ・CSS Grid 不可・外部フォント fetch 必要
// 1024 × 1792 縦長レイアウト

import type { ReportContent, ReportSection, SectionType } from '@/lib/reports/types'

const SECTION_TYPE_COLORS: Record<SectionType, { bg: string; border: string; badge: string }> = {
  overview:     { bg: '#1e2a3a', border: '#3b5a8a', badge: '#3b5a8a' },
  integration:  { bg: '#1a2e2a', border: '#2d6a5a', badge: '#2d6a5a' },
  relationship: { bg: '#2a1e2e', border: '#6a3b7a', badge: '#6a3b7a' },
  strength:     { bg: '#1e2a1e', border: '#3b6a3b', badge: '#3b6a3b' },
  shadow:       { bg: '#2a2418', border: '#7a6030', badge: '#7a6030' },
  growth:       { bg: '#1e2030', border: '#3b4a7a', badge: '#3b4a7a' },
}

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  overview:     '全体像',
  integration:  '4体系の統合',
  relationship: '関係のヒント',
  strength:     '強み',
  shadow:       '見えにくい側面',
  growth:       '成長',
}

function SectionCard({ section }: { section: ReportSection }) {
  const colors = SECTION_TYPE_COLORS[section.type] ?? SECTION_TYPE_COLORS.overview

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '28px 32px',
        marginBottom: '16px',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            backgroundColor: colors.badge,
            borderRadius: '6px',
            padding: '4px 10px',
          }}
        >
          <span style={{ color: '#e0e8f0', fontSize: '13px', fontWeight: 600 }}>
            {SECTION_TYPE_LABELS[section.type]}
          </span>
        </div>
        <span style={{ color: '#c8d8e8', fontSize: '18px', fontWeight: 700 }}>
          {section.title}
        </span>
      </div>
      <span
        style={{
          color: '#a8bccf',
          fontSize: '15px',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
        }}
      >
        {section.content}
      </span>
    </div>
  )
}

interface ReportOGImageProps {
  content: ReportContent
}

export function ReportOGImage({ content }: ReportOGImageProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '1024px',
        height: '1792px',
        backgroundColor: '#0d1520',
        fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif',
        padding: '40px 48px',
        gap: '0px',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          paddingBottom: '28px',
          borderBottom: '1px solid #1e3048',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#5a9fd4',
            }}
          />
          <span style={{ color: '#5a9fd4', fontSize: '16px', letterSpacing: '0.12em', fontWeight: 600 }}>
            COCOSiL
          </span>
        </div>
        <span
          style={{
            color: '#e8f0f8',
            fontSize: '30px',
            fontWeight: 800,
            lineHeight: 1.3,
            maxWidth: '900px',
          }}
        >
          {content.headline}
        </span>
        <span style={{ color: '#4a6880', fontSize: '13px', marginTop: '10px' }}>
          4体系統合 パーソナリティレポート
        </span>
      </div>

      {/* セクション一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {content.sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      {/* フッター */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #1e3048',
          marginTop: 'auto',
        }}
      >
        <span style={{ color: '#2a4060', fontSize: '12px' }}>
          このレポートはあなたの今いる場所を示す地図です
        </span>
        <span style={{ color: '#2a4060', fontSize: '12px' }}>COCOSiL</span>
      </div>
    </div>
  )
}
