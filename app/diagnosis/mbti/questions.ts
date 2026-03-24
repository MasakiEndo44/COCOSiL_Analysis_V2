import type { MbtiQuestion } from "./types";

/**
 * 12 問の MBTI 簡易診断質問セット
 *
 * 各軸 3 問 (正向 2 問 + 逆転 1 問)
 * 5 段階リッカート尺度 (1: 全くそう思わない — 5: 強くそう思う)
 *
 * 参照: docs/F1/MBTI簡易診断のベストプラクティス調査.md
 */
export const MBTI_QUESTIONS: MbtiQuestion[] = [
  // ---- E/I (エネルギーの方向) ----
  {
    id: 1,
    text: "仕事やイベントが終わった後、友人や知人と集まって話すことで、疲れが取れて元気が湧いてくると感じることが多い。",
    axis: "EI",
    direction: "positive", // E 寄り
  },
  {
    id: 2,
    text: "グループでの議論に参加する際、自分の意見を述べる前に、まず周囲の意見をじっくり聞いて頭の中で整理したい。",
    axis: "EI",
    direction: "reverse", // I 寄り (逆転項目)
  },
  {
    id: 3,
    text: "新しい環境や初対面の人たちの集まりでも、自分から積極的に話しかけ、交流のきっかけを作るのが得意だ。",
    axis: "EI",
    direction: "positive", // E 寄り
  },

  // ---- S/N (情報の取り込み) ----
  {
    id: 4,
    text: "新しい仕事を学ぶとき、抽象的な概念や理論よりも、具体的な手順や過去の成功事例を示される方が理解しやすい。",
    axis: "SN",
    direction: "positive", // S 寄り
  },
  {
    id: 5,
    text: "現状を維持することよりも、「もしこうなったら？」という未来の可能性や、斬新なアイデアを構想することにワクワクする。",
    axis: "SN",
    direction: "reverse", // N 寄り (逆転項目)
  },
  {
    id: 6,
    text: "周囲からは、空想家というよりも、現実的で着実に物事を進める「地に足がついた人」だと思われている。",
    axis: "SN",
    direction: "positive", // S 寄り
  },

  // ---- T/F (判断の基準) ----
  {
    id: 7,
    text: "重要な判断を下す際、たとえ誰かの感情を害する可能性があっても、客観的なデータや論理的な正しさを優先すべきだと思う。",
    axis: "TF",
    direction: "positive", // T 寄り
  },
  {
    id: 8,
    text: "仕事の場であっても、チームの調和やメンバーの気持ちに配慮することが、効率を追求すること以上に大切だと感じる。",
    axis: "TF",
    direction: "reverse", // F 寄り (逆転項目)
  },
  {
    id: 9,
    text: "議論をするとき、相手の情熱や熱意に共感することよりも、その主張に一貫性と合理的な根拠があるかを重視する。",
    axis: "TF",
    direction: "positive", // T 寄り
  },

  // ---- J/P (外界への接し方) ----
  {
    id: 10,
    text: "週末や休暇を過ごすとき、あらかじめ大まかな予定やスケジュールが決まっている方が、安心して楽しむことができる。",
    axis: "JP",
    direction: "positive", // J 寄り
  },
  {
    id: 11,
    text: "締め切りギリギリまで選択肢を広げておきたいタイプで、状況に合わせてその場で臨機応変に行動することに楽しみを感じる。",
    axis: "JP",
    direction: "reverse", // P 寄り (逆転項目)
  },
  {
    id: 12,
    text: "やりかけの仕事や決まっていない案件があると落ち着かず、できるだけ早く決着をつけてスッキリさせたいと思う。",
    axis: "JP",
    direction: "positive", // J 寄り
  },
];

/** リッカート尺度のラベル */
export const LIKERT_LABELS = [
  { value: 1, label: "全くそう思わない" },
  { value: 2, label: "あまりそう思わない" },
  { value: 3, label: "どちらともいえない" },
  { value: 4, label: "そう思う" },
  { value: 5, label: "強くそう思う" },
] as const;

/** MBTI 16 タイプ一覧 (スキップ時の選択肢) */
export const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
] as const;

/** タイプ別の簡易説明 (スキップ時の選択画面用) */
export const MBTI_TYPE_DESCRIPTIONS: Record<string, { name: string; emoji: string }> = {
  ISTJ: { name: "管理者", emoji: "📋" },
  ISFJ: { name: "擁護者", emoji: "🛡️" },
  INFJ: { name: "提唱者", emoji: "🌟" },
  INTJ: { name: "建築家", emoji: "🧠" },
  ISTP: { name: "巨匠", emoji: "🔧" },
  ISFP: { name: "冒険家", emoji: "🎨" },
  INFP: { name: "仲介者", emoji: "💭" },
  INTP: { name: "論理学者", emoji: "🔬" },
  ESTP: { name: "起業家", emoji: "🚀" },
  ESFP: { name: "エンターテイナー", emoji: "🎭" },
  ENFP: { name: "運動家", emoji: "🌈" },
  ENTP: { name: "討論者", emoji: "⚡" },
  ESTJ: { name: "幹部", emoji: "👔" },
  ESFJ: { name: "領事", emoji: "🤝" },
  ENFJ: { name: "主人公", emoji: "✨" },
  ENTJ: { name: "指揮官", emoji: "👑" },
};
