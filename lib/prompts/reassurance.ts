// F3.2「安心」フェーズ — UIテキスト定数
//
// 設計原則（20260503_議論ログ_安心フェーズ体験設計.md Turn 5 より）:
//   ① Zero-Effort Reassurance — ユーザーに"安心するための努力"を求めない。
//                               受動的に体験できる形式（短文のみ）で安心を届ける。
//   ② Active → Receptive Handoff — F1.3（Active: ユーザーが語る）から
//                                   F3.2（Receptive: ユーザーが受け取る）へのモード転換。
//                                   AIはこのフェーズで質問しない。
//   ③ De-judging through Metaphor — 「結果 = 評価」の認知フレームを
//                                   「結果 = 地図」に変える。
//                                   「地図」は自分を決めるものではなく、
//                                   今いる場所を知るためのもの。
//
// AIサブテキストの3要素（西田氏の設計要件、Turn 4）:
//   承認（Acknowledge） — ここまで来てくれた行為そのものを認める
//   脱判定化（De-judging） — 「結果 = 地図」への認知シフト
//   招待（Invitation） — "開く"行為を強制でなく選択として演出

/** メインテキスト（60字以内）: 呼吸アニメーションの下に表示 */
export const REASSURANCE_MAIN_TEXT =
  'あなたの結果が揃いました。読む前に、ひとつだけ。' as const

/**
 * AIサブテキスト（承認・脱判定化・招待の3要素、100字以内）
 *
 * 承認:    「ここまで来てくれた」ニュアンス
 * 脱判定化: 結果は地図である（良い悪いの評価ではない）
 * 招待:    CTAへ自然につなぐ
 */
export const REASSURANCE_SUB_TEXT =
  'ここに書かれるのは、あなたを評価するものではありません。\nあなたが今いる場所を知るための、地図です。\n準備ができたら、一緒に読みましょう。' as const

/**
 * 再訪時サブテキスト（2回目以降）
 * 初回の「承認」→ 再訪の「継続歓迎」にトーンを変える
 */
export const REASSURANCE_RETURN_TEXT =
  'また来てくれましたね。\nあなたの地図に、新しい景色が加わります。\n準備ができたら、一緒に読みましょう。' as const

/** CTAボタンラベル */
export const REASSURANCE_CTA_LABEL = '読んでみる →' as const

/** CTAボタンラベル（再訪時） */
export const REASSURANCE_CTA_LABEL_RETURN = 'また読んでみる →' as const
