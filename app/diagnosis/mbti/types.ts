// ============================================================
// F1: MBTI簡易診断 — 型定義
// ============================================================

/** MBTI の 4 軸 */
export type MbtiAxis = "EI" | "SN" | "TF" | "JP";

/** リッカート尺度の回答値 (1–5) */
export type LikertValue = 1 | 2 | 3 | 4 | 5;

/** 質問の方向: positive = 第一極(E/S/T/J)寄り, reverse = 第二極(I/N/F/P)寄り */
export type QuestionDirection = "positive" | "reverse";

/** 質問データ */
export interface MbtiQuestion {
  id: number;
  /** 質問文 (日本語) */
  text: string;
  /** 対応する軸 */
  axis: MbtiAxis;
  /** スコアリング方向 */
  direction: QuestionDirection;
}

/** 1 問分の回答 */
export interface MbtiAnswer {
  questionId: number;
  value: LikertValue;
}

/** 各軸の合計スコア (3–15) */
export interface MbtiScores {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
}

/** 各軸の明瞭性指数 PCI (0–100) */
export interface MbtiPCI {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
}

/** 診断結果 */
export interface MbtiResult {
  /** DBのレコードID (UUID) */
  id?: string;
  /** 4 文字のタイプコード (例: "INFJ") */
  mbtiType: string;
  /** 各軸合計スコア */
  scores: MbtiScores;
  /** 各軸の明瞭性指数 */
  pci: MbtiPCI;
}

// ---- API コントラクト ----

/** 通常回答による診断リクエスト */
export interface DiagnosisQuizRequest {
  answers: MbtiAnswer[];
}

/** スキップ (自己申告) による診断リクエスト */
export interface DiagnosisDirectRequest {
  directType: string;
}

export type DiagnosisRequest = DiagnosisQuizRequest | DiagnosisDirectRequest;

/** 診断 API レスポンス */
export interface DiagnosisResponse {
  success: boolean;
  result?: MbtiResult;
  error?: string;
}
