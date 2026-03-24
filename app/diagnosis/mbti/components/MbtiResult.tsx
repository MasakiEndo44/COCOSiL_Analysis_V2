"use client";

import type { MbtiResult } from "../types";
import { MBTI_TYPE_DESCRIPTIONS } from "../questions";

interface Props {
  result: MbtiResult;
}

const AXIS_LABELS: Record<string, [string, string]> = {
  EI: ["E 外向", "I 内向"],
  SN: ["S 感覚", "N 直観"],
  TF: ["T 思考", "F 感情"],
  JP: ["J 判断", "P 知覚"],
};

export function MbtiResultView({ result }: Props) {
  const desc = MBTI_TYPE_DESCRIPTIONS[result.mbtiType];
  const axes = ["EI", "SN", "TF", "JP"] as const;

  return (
    <div className="result-container">
      {/* ヘッダー */}
      <div className="result-header">
        <span className="result-emoji">{desc?.emoji ?? "🔮"}</span>
        <h2 className="result-type">{result.mbtiType}</h2>
        <p className="result-name">{desc?.name}</p>
      </div>

      {/* 軸別スコア */}
      <div className="axes-section">
        <h3 className="axes-title">各指標の傾向</h3>
        {axes.map((axis) => {
          const score = result.scores[axis];
          const pci = result.pci[axis];
          const [labelA, labelB] = AXIS_LABELS[axis];
          // 0–100 の位置に変換 (score 3-15 → 0-100)
          const position = ((score - 3) / 12) * 100;

          return (
            <div key={axis} className="axis-row">
              <div className="axis-labels">
                <span className={score > 9 ? "axis-active" : ""}>{labelA}</span>
                <span className={score <= 9 ? "axis-active" : ""}>{labelB}</span>
              </div>
              <div className="axis-bar">
                <div
                  className="axis-indicator"
                  style={{ left: `${position}%` }}
                />
                <div className="axis-midline" />
              </div>
              <div className="axis-pci">
                明瞭度: {pci}%
              </div>
            </div>
          );
        })}
      </div>

      {/* 免責 */}
      <p className="disclaimer">
        ※ この診断はエンターテインメントおよび自己理解の補助を目的としたものであり、
        医学的・心理学的な診断を提供するものではありません。
        すべてのタイプに優劣はなく、各タイプが独自の価値と可能性を持っています。
      </p>

      {/* 次のステップ */}
      <div className="result-actions">
        <button
          className="action-btn primary"
          onClick={() => window.location.reload()}
          type="button"
        >
          もう一度診断する
        </button>
      </div>
    </div>
  );
}
