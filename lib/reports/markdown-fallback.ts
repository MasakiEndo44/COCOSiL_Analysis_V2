// Vercel OG 生成失敗時の Markdown+CSS 静的フォールバック
// ユーザーに生成失敗を悟らせない（見た目の差を最小化）

import type { ReportContent } from '@/lib/reports/types'

const SECTION_TYPE_LABELS: Record<string, string> = {
  overview:     '全体像',
  integration:  '4体系の統合',
  relationship: '関係のヒント',
  strength:     '強み',
  shadow:       '見えにくい側面',
  growth:       '成長',
}

export function buildMarkdownFallback(content: ReportContent): string {
  const sectionsMarkdown = content.sections
    .map((section) => {
      const label = SECTION_TYPE_LABELS[section.type] ?? section.type
      return `## ${section.title}\n\n_${label}_\n\n${section.content}`
    })
    .join('\n\n---\n\n')

  return `# ${content.headline}\n\n> 4体系統合 パーソナリティレポート\n\n${sectionsMarkdown}\n\n---\n\n_このレポートはあなたの今いる場所を示す地図です — COCOSiL_`
}

export function buildHtmlFallback(content: ReportContent): string {
  const sectionsHtml = content.sections
    .map((section) => {
      const label = SECTION_TYPE_LABELS[section.type] ?? section.type
      const escapedContent = section.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>')
      return `
        <div class="section section--${section.type}">
          <div class="section-header">
            <span class="section-badge">${label}</span>
            <h2 class="section-title">${section.title}</h2>
          </div>
          <p class="section-content">${escapedContent}</p>
        </div>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>パーソナリティレポート — COCOSiL</title>
  <style>
    :root {
      --bg: #0d1520;
      --surface: #1e2a3a;
      --border: #1e3048;
      --text-primary: #e8f0f8;
      --text-secondary: #a8bccf;
      --text-muted: #4a6880;
      --accent: #5a9fd4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text-primary); font-family: "Hiragino Sans", "Yu Gothic", sans-serif; }
    .container { max-width: 680px; margin: 0 auto; padding: 40px 24px 80px; }
    .header { padding-bottom: 24px; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
    .brand { color: var(--accent); font-size: 13px; letter-spacing: 0.12em; font-weight: 600; margin-bottom: 16px; }
    .headline { font-size: 26px; font-weight: 800; line-height: 1.4; }
    .subtitle { color: var(--text-muted); font-size: 12px; margin-top: 8px; }
    .section { background: var(--surface); border-radius: 12px; padding: 24px 28px; margin-bottom: 16px; border-left: 4px solid var(--border); }
    .section--integration { background: #1a2e2a; border-left-color: #2d6a5a; }
    .section--relationship { background: #2a1e2e; border-left-color: #6a3b7a; }
    .section--strength { background: #1e2a1e; border-left-color: #3b6a3b; }
    .section--shadow { background: #2a2418; border-left-color: #7a6030; }
    .section--growth { background: #1e2030; border-left-color: #3b4a7a; }
    .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .section-badge { background: rgba(255,255,255,0.08); border-radius: 6px; padding: 3px 9px; font-size: 11px; font-weight: 600; color: var(--text-secondary); }
    .section-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
    .section-content { color: var(--text-secondary); font-size: 14px; line-height: 1.75; }
    .footer { border-top: 1px solid var(--border); padding-top: 20px; margin-top: 32px; text-align: center; color: var(--text-muted); font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">COCOSiL</div>
      <h1 class="headline">${content.headline}</h1>
      <p class="subtitle">4体系統合 パーソナリティレポート</p>
    </div>
    ${sectionsHtml}
    <div class="footer">このレポートはあなたの今いる場所を示す地図です</div>
  </div>
</body>
</html>`
}
