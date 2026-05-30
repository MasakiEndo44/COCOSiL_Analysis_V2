// F3.1 統合レポート — コンテンツ生成システムプロンプト（TSK-PROMPT-001 叩き台 / えんまさ未承認 draft）
//
// 【このプロンプトの役割】
// F2で収集した4体系診断結果（星座・60type動物・六星・MBTI）をOpenAIに渡し、
// パンチャ構造（色受想行＝5軸 → 識＝統合像）の論理で「1つの立体的な自己像」を生成する。
// 出力は Vercel OG（Satori）の React コンポーネントに流し込むため JSON 構造で返す。
//
// 設計中枢の遵守（AGENTS.md §0）:
//   ① Dispel, Don't Decorate — 自己理解の解像度を上げる記述だけ。SNS映え・装飾の足し算をしない。
//   ② From Reaction to Reflection — 三毒（貪・瞋・痴）を煽らない。焦り・優劣・自己否定を生む表現を禁止。
//   ③ Self-Knowing for Better-Relating — 必ず「大切な人との関係ヒント」で対人へ着地させる（AC-2）。
//
// AC（受け入れ基準）:
//   AC-1: 4体系すべてを横断する統合考察セクションを1つ以上含む。4ラベルの羅列のみは不合格。
//   AC-2: 対人関係に言及するセクションを1つ以上含む。
//   AC-3: 否定形（残件・「0件です」等）を出さない。
//
// パンチャ構造の扱い（lib/constitution/observation-axes.ts と整合）:
//   - 5軸（身体気質 / 感情反応 / 認知スタイル / 動機エネルギー / 対人モード）で4体系を観察する。
//   - 識（self_integration）は「軸」ではない。5軸の観察が織り成すメタ層 = 統合考察そのもの。
//     → プロンプトで識を6番目の軸として扱ってはいけない（議論ログ_F3-1観察軸5軸確定 Turn4 R2）。
//   - 4体系は「同じ自分を別の角度から照らす4つのライト」。矛盾は欠陥ではなく多面性として描く。
//
// 言語設計（lib/constitution/banned-words.ts が唯一の正・禁止語0%）:
//   - 禁止語: 占い / 鑑定 / 運勢 / 占い師 / 当たる / 霊感 / 霊視 / 占術
//   - 断定より傾向: 「あなたは〜です」ではなく「〜な傾向があります」「〜を大切にしていそうです」
//   - 肯定ファースト: 弱み・課題に触れる前に必ず強み・価値を先に示す。
//
// 呼称トーン（D8 / えんまさ確定 2026-05-29）:
//   - 「○○さん」付け。落ち着いた敬意・信頼できる相談相手トーン（25-35歳社会人ターゲット）。
//   - display_name 未入力時のフォールバックは「あなた」。この場合は「さん」を付けない
//     （「あなたさん」を禁止）。注入側 buildIntegratedReportUserPrompt が hasName を渡して制御する。
//
// 年齢・生年月日（D9）:
//   - 年齢は本文に一切出さない（「30歳のあなたへ」等は三毒増幅リスク）。
//   - 生年月日は4体系の計算根拠としてフッターに控えめ表示。本文では扱わない（OG/フッター側の責務）。
//
// 60type動物（D10）:
//   - ユーザー向け表記は 60type の character ラベル（例「リーダーとなるゾウ」）を優先。
//   - 12type（baseAnimal）は内部参照のみ。本文に baseAnimal 単体を出さない。

/** レポートのセクション識別子（F3.3 マーカーがセクション単位で参照する） */
export const REPORT_SECTION_IDS = [
  'catchphrase', // 一言の命名（20字程度）: OG見出し・レポートタイトル。止観の「観＝パターンの命名」。integrationの核を凝縮
  'opening', // 導入: 地図メタファーの継承・読む構えづくり
  'four_lights', // 4体系の手短な読み取り（観察の入口・羅列防止のため「4つのライト」として束ねる）
  'integration', // 統合考察: 5軸を貫く「あなたの核」= 識（AC-1 必須）
  'relational_hint', // 大切な人との関係ヒント（AC-2 必須）
  'closing', // 結び: 地図として使う招待・F4チャットへの橋渡し
] as const

export type ReportSectionId = (typeof REPORT_SECTION_IDS)[number]

// セクションごとの目安文字数（Vercel OG 1024×1792 の縦長レイアウト崩壊を防ぐ上限）
export const REPORT_SECTION_CHAR_LIMITS: Record<ReportSectionId, number> = {
  catchphrase: 24, // 「20字程度」の運用上限。OG見出しのレイアウト崩壊を防ぐ
  opening: 120,
  four_lights: 360,
  integration: 400,
  relational_hint: 280,
  closing: 140,
}

export const INTEGRATED_REPORT_SYSTEM_PROMPT = `\
あなたはCOCOSiLの分析パートナーです。心理学と4つの性格分析の知見にもとづいて、
ひとりの人の「立体的な自己像」を、温かく・根拠をもって言葉にします。

【あなたの仕事】
4つの分析結果（星座・動物タイプ・六星・MBTI）を、別々のラベルとして並べるのではなく、
「同じひとりの人を、4方向から照らす4つのライト」として統合し、
その人の核にある一貫したパターンを1枚の地図として描いてください。

【観察の5つの視点】
次の5つの視点で4体系を横断的に観察し、共通して浮かぶ核を見つけてください。
  1. 身体・気質パターン（テンポ・エネルギーの出方）
  2. 感情反応パターン（何にどう心が動くか）
  3. 認知スタイル（物事のとらえ方・決め方）
  4. 動機エネルギー（何に駆動されるか）
  5. 対人モード（人との距離の取り方）
※「統合像」はこの5視点が織り成す結果であり、6番目の視点ではありません。

【守るべきトーン】
- 断定しない。「〜です」ではなく「〜な傾向があります」「〜を大切にしていそうです」と書く。
- 肯定を先に。強みや価値を示してから、課題や注意点にそっと触れる。
- 評価しない。優劣・正解/不正解・「直すべき」という枠組みを持ち込まない。
- 年齢には一切触れない。
- スピリチュアルな決め言葉（未来予測・的中・霊的な見立てを思わせる表現）は使わない。COCOSiLは根拠のある性格分析であり、運命を言い当てるものではない。
- 4つのライトが食い違って見えるときは、欠陥ではなく「多面性」として描く。

【呼びかけ】
{{address_instruction}}

【出力形式】
先に統合考察（integration）の核を見定めてから、それを一言に凝縮した catchphrase を作ってください。
必ず次のJSON構造のみを返してください（前後に説明文を付けない）:
{
  "catchphrase": "この方を一言で表す命名（{{char_catchphrase}}字程度）。レポートの見出しに使う。優劣評価や決めつけではなく、4体系の観察から浮かんだパターンの『名づけ』として。未来予測や的中を思わせる言い回しは避ける。呼び名は入れない。",
  "opening": "導入（{{char_opening}}字以内）。地図メタファーを継承し、これから読む構えをつくる。",
  "four_lights": "4体系それぞれの短い読み取り（{{char_four_lights}}字以内）。各体系1〜2文。動物は60typeのcharacterラベルで呼ぶ。これは観察の入口であり、ここで完結させない。",
  "integration": "統合考察（{{char_integration}}字以内）。5つの視点を貫いて浮かぶ『あなたの核』を1つの像として描く。4体系すべてに言及しながら、ラベルの羅列にしない（AC-1）。",
  "relational_hint": "大切な人との関係ヒント（{{char_relational_hint}}字以内）。自己理解を対人関係にどう活かせるか、具体的な関わり方の手がかりを示す（AC-2）。",
  "closing": "結び（{{char_closing}}字以内）。この地図は自分を決めるものではなく今いる場所を知るためのもの、と伝え、続きを一緒に話す招待で締める。"
}` as const

/**
 * 1体系分のプロファイル。
 * label = ユーザー向けラベル（動物は60type character・例「リーダーとなるゾウ」）。
 * description = ②TSK-DATA-XXX の詳細説明文。未整備時は undefined のままでよく、
 *               その場合プロンプトはラベルのみで動作する（D10 フォールバック）。
 */
export interface SystemProfile {
  label: string
  description?: string
}

export interface IntegratedReportInput {
  /** F1で入力されたユーザーネーム。未入力時は null（プロンプト側で「あなた」にフォールバック） */
  displayName: string | null
  zodiac: SystemProfile // 例「蟹座」
  animal: SystemProfile // 60type character ラベル（baseAnimal単体はユーザー向けに出さない）
  sixStar: SystemProfile // 例「土星人＋」
  mbti: SystemProfile // 例「INFJ」
}

function formatSystem(profile: SystemProfile): string {
  return profile.description
    ? `${profile.label} — ${profile.description}`
    : profile.label
}

/**
 * システムプロンプトの呼称・文字数プレースホルダを解決して返す。
 * display_name 未入力時は「あなた」（さん無し）に切り替える（D8）。
 */
export function resolveIntegratedReportSystemPrompt(hasName: boolean): string {
  const addressInstruction = hasName
    ? 'ユーザーメッセージの「呼び名」に「さん」を付けて本文で呼ぶ（見出し・導入・統合考察で自然に使う）。媚びず、信頼できる相談相手のトーンで。'
    : 'ユーザーの呼び名は未設定のため、本文では二人称「あなた」で統一する。「あなたさん」とは絶対に書かない。'

  return INTEGRATED_REPORT_SYSTEM_PROMPT.replace(
    '{{address_instruction}}',
    addressInstruction,
  )
    .replace('{{char_catchphrase}}', String(REPORT_SECTION_CHAR_LIMITS.catchphrase))
    .replace('{{char_opening}}', String(REPORT_SECTION_CHAR_LIMITS.opening))
    .replace('{{char_four_lights}}', String(REPORT_SECTION_CHAR_LIMITS.four_lights))
    .replace('{{char_integration}}', String(REPORT_SECTION_CHAR_LIMITS.integration))
    .replace(
      '{{char_relational_hint}}',
      String(REPORT_SECTION_CHAR_LIMITS.relational_hint),
    )
    .replace('{{char_closing}}', String(REPORT_SECTION_CHAR_LIMITS.closing))
}

/**
 * 4体系データを流し込むユーザーメッセージを生成する。
 * display_name はモデレーション済みの値を渡す前提（lib/constitution/ のモデレーションを通過後）。
 */
export function buildIntegratedReportUserPrompt(input: IntegratedReportInput): string {
  const name = input.displayName?.trim() || 'あなた'

  return `\
以下はこの方の4体系の分析結果です。各項目に説明があれば参考にし、これを統合して地図を描いてください。
説明が無い項目は、ラベルが示すタイプの一般的な特徴をふまえて補ってください。

呼び名: ${name}
星座: ${formatSystem(input.zodiac)}
動物タイプ（60type）: ${formatSystem(input.animal)}
六星: ${formatSystem(input.sixStar)}
MBTI: ${formatSystem(input.mbti)}`
}
