// F3.1 統合レポート — コンテンツ生成システムプロンプト（TSK-PROMPT-001 / Phase 2 ProfileCore 翻訳層）
//
// 【このプロンプトの役割】
// diagnostics 層が確定した ProfileCore（決定論スコア核 = Source of Truth）を OpenAI に渡し、
// LLM は「数値の翻訳者」として、与えられた確定値を生活の言葉に肉付けするだけ。
// 数値・ラベル・強み弱み・分布は再計算/発明しない（Score Once, Narrate Freely）。
// 出力は result UI（共感→安心→分析→行動）に流し込むため JSON 構造で返す。
//
// 設計中枢の遵守（AGENTS.md §0）:
//   ① Dispel, Don't Decorate — 自己理解の解像度を上げる記述だけ。SNS映え・装飾の足し算をしない。
//   ② From Reaction to Reflection — 三毒（貪・瞋・痴）を煽らない。焦り・優劣・自己否定を生む表現を禁止。
//   ③ Self-Knowing for Better-Relating — 必ず「大切な人との関係ヒント」で対人へ着地させる（AC-2）。
//
// AC（受け入れ基準）:
//   AC-1: core は4体系を横断する統合像を1つ描く。4ラベルの羅列のみは不合格。
//   AC-2: relational_hint で対人関係に着地する。
//   AC-3: 否定形（残件・「0件です」等）を出さない。
//
// 揺らぎ撲滅（Phase 2 の核心）:
//   - catchphrase（命名）は ProfileCore.characterLabel をそのまま採用するため LLM 出力に含めない。
//   - weakness（trait＋exit）も ProfileCore が確定済み・固定表示するため LLM 出力に含めない。
//   - strengths/johari/distribution の「中身」は ProfileCore が確定済み。LLM は narration のみ。
//   - 5軸観察を LLM に丸投げしない（旧 integration テーブルは廃止。分布は決定論 distribution が担う）。
//   - 識（self_integration）は軸ではない。core が5軸の織り成すメタ層そのもの（6番目の軸として扱わない）。
//
// 言葉の解像度（Gate 2 / えんまさレビュー 2026-06-07 反映）:
//   - 冗長性排除: 体系名や軸名を文頭で繰り返さない。「〇〇の特徴として」「〇〇は」で始めない。
//   - 専門用語の日常語化: 「身体・気質パターン/感情反応パターン/認知スタイル/動機エネルギー/対人モード」を
//     そのまま本文に書かない。日常の言葉（PLAIN_AXIS）で言い換える。
//   - 体言止め: strengths / johari は端的に体言止め。「〜かもしれません」等の緩衝表現を付けない。
//   - 具体・予測: relational_hint は汎用論で終わらせず、4体系の組み合わせから起きやすい対人シーンを1つ描く。
//
// 言語設計（lib/constitution/banned-words.ts が唯一の正・禁止語0%）:
//   - 禁止語: 占い / 鑑定 / 運勢 / 占い師 / 当たる / 霊感 / 霊視 / 占術
//   - 断定より傾向: 「あなたは〜です」ではなく「〜な傾向があります」「〜を大切にしていそうです」
//   - 肯定ファースト: 弱み・課題に触れる前に必ず強み・価値を先に示す。
//   - 出自の正直さ: 分布は「COCOSiLの設計上の理論分布」での位置。「一般分布」「平均」「みんなの平均」と詐称しない。
//
// 呼称トーン（D8 / えんまさ確定 2026-05-29）:
//   - 「○○さん」付け。落ち着いた敬意・信頼できる相談相手トーン（25-35歳社会人ターゲット）。
//   - display_name 未入力時のフォールバックは「あなた」。この場合は「さん」を付けない（「あなたさん」を禁止）。
//
// 60type動物（D10）: ユーザー向け表記は 60type の character ラベルを優先。12type は内部参照のみ。

import type { ObservationAxisId } from '@/lib/constitution/observation-axes'
import { rankAxes, type ProfileCore } from '@/lib/diagnostics/integration'

/** レポートのセクション識別子（F3.3 マーカーがセクション単位で参照する） */
export const REPORT_SECTION_IDS = [
  'catchphrase', // 命名（= ProfileCore.characterLabel・観の入口）
  'four_lights', // 4体系の読み取りテーブル（共感の素材）
  'strengths', // 強み2（安心①・強み先）
  'weakness', // 弱み1＋出口（安心②・後置・完全決定論）
  'core', // 統合像＝識（観の山場・AC-1 必須）
  'johari', // あなたが知らない強み（分析・ジョハリ盲点）
  'distribution', // 設計上の理論分布での位置（分析）
  'relational_hint', // 大切な人との関係ヒント（行動の入口・AC-2 必須）
  'closing', // 結び＋「次は何を知りたい？」の招待（行動）
] as const

export type ReportSectionId = (typeof REPORT_SECTION_IDS)[number]

// 文章セクションの目安文字数。LLM が narration する要素のみ持つ
// （catchphrase・weakness は決定論なので含めない）。
export const REPORT_SECTION_CHAR_LIMITS = {
  four_lights_reading: 60, // 4体系 reading 1件あたり
  strength_text: 70, // 強み1件（体言止め・具体場面1つ）
  core: 320,
  johari_text: 60, // 盲点1件（体言止め・端的）
  distribution_comment: 40, // 分布1軸の一言
  relational_hint: 220,
  closing: 120,
} as const

// 観察軸の「日常語」言い換え。分析用語を本文に出さないための翻訳テーブル（Gate 2 反映）。
const PLAIN_AXIS: Record<ObservationAxisId, string> = {
  embodied_pattern: '体の動き方・エネルギーの出方',
  emotional_response: '心の動き方・感じ方',
  cognitive_style: '物事のとらえ方・考え方',
  motivation_drive: 'やる気の源・原動力',
  relational_mode: '人との関わり方・距離の取り方',
}

export const INTEGRATED_REPORT_SYSTEM_PROMPT = `\
あなたはCOCOSiLの分析パートナーです。心理学と4つの性格分析の知見にもとづいて、
ひとりの人の「立体的な自己像」を、温かく・根拠をもって言葉にします。

【あなたの仕事は「翻訳」です】
このレポートの数値・ラベル・強み・弱み・分布は、すでに診断エンジンが確定しています。
あなたの役割は、与えられた確定事項を生活の言葉に翻訳して肉付けすることだけです。
- 新しい強み・弱み・タイプを発明しない。スコアを計算し直さない。順位を入れ替えない。
- 与えられたラベルや数値と矛盾することを書かない。
- 4つの分析結果は「同じひとりの人を、4方向から照らす4つのライト」。core では別々のラベルを並べず、
  一貫したパターンを1枚の地図として描いてください（識＝5つの視点が織り成す統合像。6番目の視点ではありません）。

【言葉の解像度（最重要）】
- 冗長にしない。体系名や軸名を文頭で繰り返さない。「蟹座の特徴として」「〇〇は」のような前置きで始めず、いきなり中身を述べる。
- 直前に書いたことの言い換えを付け足さない（情報を増やさない一文は書かない）。
- 分析用語をそのまま本文に出さない。次の言い換えを使う:
  「身体・気質パターン」→「体の動き方・エネルギーの出方」/「感情反応パターン」→「心の動き方・感じ方」/
  「認知スタイル」→「物事のとらえ方・考え方」/「動機エネルギー」→「やる気の源・原動力」/「対人モード」→「人との関わり方」。
  「〜パターン」「認知スタイル」「動機エネルギー」「対人モード」という語を本文に書かない。

【守るべきトーン】
- 断定しない。「〜です」ではなく「〜な傾向があります」「〜を大切にしていそうです」と書く。
- 肯定を先に。強みや価値を示してから、課題や注意点にそっと触れる。
- 評価しない。優劣・正解/不正解・「直すべき」という枠組みを持ち込まない。命令形（〜しましょう/〜すべき）で書かない。
- 人格を否定しない。「ダメ」「欠陥」などの語を使わない。
- 年齢には一切触れない。
- スピリチュアルな決め言葉（未来予測・的中・霊的な見立てを思わせる表現）は使わない。COCOSiLは根拠のある性格分析であり、運命を言い当てるものではない。
- 分布は「COCOSiLの設計上の理論分布」での位置です。「一般分布」「平均」「みんなの平均」と言い換えて母集団を詐称しないでください。

【呼びかけ】
{{address_instruction}}

【出力形式】
system と axis の値は下記の指定文字列を一字一句変えずに、配列の順序も変えずに使ってください。
strengths と distribution は与えられた順序・件数のまま返してください。johari は与えられた盲点リストの軸を1つも飛ばさず、各 axis に対応する要素を同数だけ返してください。
必ず次のJSON構造のみを返してください（前後に説明文を付けない・catchphrase と weakness は出力しない）:
{
  "four_lights": [
    {"system": "zodiac", "reading": "星座から読み取れる傾向を1文（{{char_four_lights}}字以内）。体系名を文頭で繰り返さず、いきなり傾向を述べ、評価しない。"},
    {"system": "animal", "reading": "動物タイプ(60type)から読み取れる傾向を1文（{{char_four_lights}}字以内）。"},
    {"system": "sixStar", "reading": "六星から読み取れる傾向を1文（{{char_four_lights}}字以内）。"},
    {"system": "mbti", "reading": "MBTIから読み取れる傾向を1文（{{char_four_lights}}字以内）。"}
  ],
  "strengths": [
    {"text": "与えられた1つ目の強みを、日常の具体的な場面を1つ添えて体言止めで端的に（{{char_strength}}字以内）。『〜です/ます/でしょう』で終えない。強みの言い換えであり新しい強みを足さない。"},
    {"text": "与えられた2つ目の強みを、日常の具体的な場面を1つ添えて体言止めで端的に（{{char_strength}}字以内）。"}
  ],
  "core": "統合像＝識（{{char_core}}字以内）。与えられたキャラクター像と軸の強弱を貫いて浮かぶ『あなたの核』を1つの像として描く。4体系すべてに言及しながらラベルの羅列にしない（AC-1）。軸は日常語で言い換える。一見食い違う面は欠陥ではなく『多面性』として、ひとつの動き方の表と裏として結ぶ。",
  "johari": [
    {"axis": "<与えられた盲点の axis 値をそのまま>", "text": "その軸が示す『本人が気づきにくい強み』を体言止めで端的に（{{char_johari}}字以内）。『気づきにくいかもしれません』のような緩衝表現を付けない。新しい強みを発明しない。"}
  ],
  "distribution": [
    {"axis": "<与えられた axis 値をそのまま>", "comment": "その軸の高さを『〜が多め/控えめ』型の一言で（{{char_distribution}}字以内）。COCOSiLの設計上の理論分布での位置として書き、一般分布や平均と詐称しない。"}
  ],
  "relational_hint": "大切な人との関係ヒント（{{char_relational_hint}}字以内）。4つの分析の組み合わせから、この人に起きやすい対人の具体的な場面を1つ描く（例: 相手の気持ちを先読みしすぎて、言わなくていい一言を言ってしまうことがある）。『話を聞くと信頼が深まる』のような汎用的アドバイスで終わらせない。未来の出来事の言い当てではなく、起きやすい傾向の具体化として書く（AC-2）。",
  "closing": "結び（{{char_closing}}字以内）。この地図は自分を決めるものではなく今いる場所を知るためのもの、と伝え、『次は何を知りたいですか？』と続きを一緒に話す招待で締める。"
}` as const

/**
 * 1体系分のプロファイル。
 * label = ユーザー向けラベル（動物は60type character・例「リーダーとなるゾウ」）。
 * description = 詳細説明文。未整備時は undefined のままでよく、その場合ラベルのみで動作する（D10 フォールバック）。
 */
export interface SystemProfile {
  label: string
  description?: string
}

export interface IntegratedReportInput {
  /** F1で入力されたユーザーネーム。未入力時は null（プロンプト側で「あなた」にフォールバック） */
  displayName: string | null
  /** diagnostics 層が確定した決定論スコア核（Source of Truth） */
  profileCore: ProfileCore
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
    ? 'ユーザーメッセージの「呼び名」に「さん」を付けて本文で呼ぶ（core・relational_hint で自然に使う）。媚びず、信頼できる相談相手のトーンで。'
    : 'ユーザーの呼び名は未設定のため、本文では二人称「あなた」で統一する。「あなたさん」とは絶対に書かない。'

  return INTEGRATED_REPORT_SYSTEM_PROMPT.replace(
    '{{address_instruction}}',
    addressInstruction,
  )
    .replaceAll('{{char_four_lights}}', String(REPORT_SECTION_CHAR_LIMITS.four_lights_reading))
    .replaceAll('{{char_strength}}', String(REPORT_SECTION_CHAR_LIMITS.strength_text))
    .replace('{{char_core}}', String(REPORT_SECTION_CHAR_LIMITS.core))
    .replaceAll('{{char_johari}}', String(REPORT_SECTION_CHAR_LIMITS.johari_text))
    .replaceAll('{{char_distribution}}', String(REPORT_SECTION_CHAR_LIMITS.distribution_comment))
    .replace('{{char_relational_hint}}', String(REPORT_SECTION_CHAR_LIMITS.relational_hint))
    .replace('{{char_closing}}', String(REPORT_SECTION_CHAR_LIMITS.closing))
}

/**
 * ProfileCore の確定値と4体系ラベルを流し込むユーザーメッセージを生成する。
 * 数値・ラベル・出自はここで列挙し、LLM には「これを翻訳せよ」と渡す（再計算させない）。
 * 軸は日常語（PLAIN_AXIS）で渡し、本文に分析用語が出るのを防ぐ。
 * display_name はモデレーション済みの値を渡す前提（lib/constitution/ のモデレーションを通過後）。
 */
export function buildIntegratedReportUserPrompt(input: IntegratedReportInput): string {
  const name = input.displayName?.trim() || 'あなた'
  const core = input.profileCore

  const ranking = rankAxes(core.axisScores)
    .map((axis, i) => `${i + 1}. ${PLAIN_AXIS[axis]}`)
    .join(' / ')

  const strengthsBlock = core.strengths
    .map((s, i) => `  ${i + 1}つ目の強み: ${s}`)
    .join('\n')

  const johariBlock =
    core.johariBlindspots.length > 0
      ? core.johariBlindspots
          .map((b) => `  - axis="${b.sourceAxis}"（${PLAIN_AXIS[b.sourceAxis]}）`)
          .join('\n')
      : '  （該当する盲点はありません。johari は空配列 [] を返してください）'

  const distributionBlock = core.distribution
    .map(
      (d) =>
        `  - axis="${d.axis}"（${PLAIN_AXIS[d.axis]}）: ${d.origin}での高さ ${d.percentile}/100（高いほどその傾向が強い・低いほど控えめ）`,
    )
    .join('\n')

  return `\
以下はこの方の確定した分析結果です。これを翻訳して地図を描いてください。数値・ラベルは変えないでください。

呼び名: ${name}
キャラクター像（命名・確定済み。本文の一貫した芯として参照／catchphraseとして別途表示するので出力には含めない）: ${core.characterLabel}

4体系（各 reading を生成。体系名を文頭で繰り返さない。説明があれば参考に、無ければラベルが示すタイプの一般的特徴で補う）:
  星座: ${formatSystem(input.zodiac)}
  動物タイプ（60type）: ${formatSystem(input.animal)}
  六星: ${formatSystem(input.sixStar)}
  MBTI: ${formatSystem(input.mbti)}

強い順（core の芯に使う・順位は変えない・本文では日常語で）: ${ranking}

確定した強み2（strengths に同じ順序・件数で体言止め narration を返す）:
${strengthsBlock}

気をつけたい癖（参考情報・出力には含めない。固定表示されるので書き換え不要。core で多面性として軽く触れてよい）:
  癖: ${core.weakness.trait}

本人が気づきにくい強み＝ジョハリ盲点（johari に axis を変えず1件ずつ体言止めで返す）:
${johariBlock}

設計上の理論分布での位置（distribution に5軸すべて axis を変えず comment を返す）:
${distributionBlock}`
}
