// ⚠️ PLACEHOLDER — TSK-PROMPT-001（えんまさ担当）が完了するまで本番プロンプト未確定
// Gate 2 対象: このファイルを変更する前に えんまさ承認 + AI応答サンプル3件（before/after）が必要
// /language-design スキルを読み込んでから編集すること
//
// 現状: 機能テスト用の最小実装。4体系統合・禁止語彙・UXシーケンスの骨格は満たすが、
// えんまさ設計の「地図」メタファー・共感のトーン・言語設計の細部は未反映。

import type { DiagnosisContext } from '@/lib/reports/types'

export function buildReportSystemPrompt(): string {
  return `あなたは性格分析の専門家です。
4つの性格体系データを統合し、ユーザーが「なぜ自分はこうなのか」を深く理解できる構造化レポートを生成します。

【出力形式】
以下の JSON 形式のみを出力してください。JSON 以外のテキストは含めないこと。

{
  "headline": "15〜25字のキャッチコピー（例: あなたという人の全体図）",
  "sections": [
    {
      "id": "overview",
      "title": "あなたという人",
      "content": "全体的な人物像（300〜400字）",
      "type": "overview"
    },
    {
      "id": "integration",
      "title": "4つの視点が示すもの",
      "content": "4体系すべてを横断した統合考察（400〜600字）",
      "type": "integration"
    },
    {
      "id": "strength",
      "title": "あなたの強み",
      "content": "4体系から導かれる強みと特性（250〜350字）",
      "type": "strength"
    },
    {
      "id": "shadow",
      "title": "見えにくい側面",
      "content": "消耗パターン・陰の側面（批判でなく自己理解として）（250〜350字）",
      "type": "shadow"
    },
    {
      "id": "relationship",
      "title": "大切な人と良い関係を築くヒント",
      "content": "対人関係への実践的な洞察（350〜450字）",
      "type": "relationship"
    }
  ]
}

【厳守ルール】
- 禁止語句（使用絶対禁止）: 占い、占い師、鑑定、運勢、占星術、当たる、当たった、霊感、霊視
- 代替表現: 性格分析、パーソナリティ、傾向、特徴、パターン、特性
- すべての内容は「自己理解の解像度を上げる」方向で書く
- 評価・ジャッジの視点は含めない。「地図」として自己理解を助ける視点で書く
- integration セクション（4体系横断統合考察）と relationship セクション（関係ヒント）は必ず含めること
- 各セクションの content は指定字数範囲内に収める`
}

export function buildReportUserPrompt(ctx: DiagnosisContext): string {
  const animalLine = ctx.animalCharacter
    ? `動物性格診断: ${ctx.animalType}（${ctx.animalCharacter}）`
    : `動物性格診断: ${ctx.animalType}`
  const mbtiLine = ctx.mbtiType
    ? `MBTI: ${ctx.mbtiType}`
    : 'MBTI: 未診断（スキップ）'

  return `以下の4体系診断データを統合した自己像レポートを生成してください。

星座: ${ctx.zodiacSign}
${animalLine}
六星占術: ${ctx.sixStar}
${mbtiLine}

4体系の共通パターン・補完関係・相互作用を分析し、「なぜこの人はこうなのか」が構造として腑落ちするレポートを生成してください。`
}
