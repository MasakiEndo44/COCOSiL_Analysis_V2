import { MBTI_QUESTIONS } from "./questions";
import type {
  MbtiAnswer,
  MbtiAxis,
  MbtiPCI,
  MbtiResult,
  MbtiScores,
} from "./types";

/**
 * 回答配列から MBTI タイプを算出する。
 *
 * スコアリング:
 *   - positive 項目 → そのまま加算
 *   - reverse  項目 → 6 - value で反転して加算
 *   - 各軸合計: 3–15 (中央値 = 9)
 *
 * タイプ判定:
 *   合計 > 9 → 第一極 (E / S / T / J)
 *   合計 < 9 → 第二極 (I / N / F / P)
 *   合計 = 9 → デフォルト I / N / F / P
 *
 * PCI (Preference Clarity Index):
 *   |合計 - 9| / 6 * 100  (0–100%)
 */
export function calculateMbtiResult(answers: MbtiAnswer[]): MbtiResult {
  const scores = calculateScores(answers);
  const mbtiType = deriveType(scores);
  const pci = calculatePCI(scores);

  return { mbtiType, scores, pci };
}

// ---- internal helpers ----

function calculateScores(answers: MbtiAnswer[]): MbtiScores {
  const axisScores: MbtiScores = { EI: 0, SN: 0, TF: 0, JP: 0 };

  for (const answer of answers) {
    const question = MBTI_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const normalised =
      question.direction === "reverse" ? 6 - answer.value : answer.value;

    axisScores[question.axis] += normalised;
  }

  return axisScores;
}

function deriveType(scores: MbtiScores): string {
  const MID = 9; // 中央値

  const e_i = scores.EI > MID ? "E" : "I"; // tie → I
  const s_n = scores.SN > MID ? "S" : "N"; // tie → N
  const t_f = scores.TF > MID ? "T" : "F"; // tie → F
  const j_p = scores.JP > MID ? "J" : "P"; // tie → P

  return `${e_i}${s_n}${t_f}${j_p}`;
}

function calculatePCI(scores: MbtiScores): MbtiPCI {
  const MID = 9;
  const MAX_DEVIATION = 6; // 15 - 9 or 9 - 3

  const pci = (axis: MbtiAxis) =>
    Math.round((Math.abs(scores[axis] - MID) / MAX_DEVIATION) * 100);

  return {
    EI: pci("EI"),
    SN: pci("SN"),
    TF: pci("TF"),
    JP: pci("JP"),
  };
}

/**
 * 直接選択されたタイプ文字列のバリデーション
 */
export function isValidMbtiType(type: string): boolean {
  return /^[EI][SN][TF][JP]$/.test(type.toUpperCase());
}
