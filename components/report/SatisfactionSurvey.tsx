"use client";

import { useState } from "react";

interface SatisfactionSurveyProps {
  reportId: string;
  userId?: string;
  onComplete?: () => void;
}

const SCORE_LABELS = ["", "う〜ん", "まあまあ", "ふつう", "よかった", "ぴったり"];

export function SatisfactionSurvey({ reportId, userId, onComplete }: SatisfactionSurveyProps) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const submit = async (selectedScore: number) => {
    setScore(selectedScore);
    try {
      await fetch("/api/reports/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, score: selectedScore, comment, userId }),
      });
    } catch {
      // 失敗してもユーザー体験を中断しない
    }
    setSubmitted(true);
    onComplete?.();
  };

  const sendComment = async () => {
    if (!score) return;
    try {
      await fetch("/api/reports/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, score, comment, userId }),
      });
    } catch {
      // non-fatal
    }
    setSubmitted(true);
    onComplete?.();
  };

  if (skipped || submitted) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "24px 0",
          color: "#9b8fbd",
          fontSize: 14,
        }}
      >
        {submitted && "読んでくれてありがとうございます。"}
      </div>
    );
  }

  if (score !== null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 14, color: "#1e1a3c", margin: 0 }}>
          ひとこと感想（任意）
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="気づいたことを書いてみてください"
          rows={3}
          style={{
            width: "100%",
            border: "1.5px solid #ede9f8",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 14,
            color: "#1e1a3c",
            background: "#fff",
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={sendComment}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 24,
              background: "linear-gradient(135deg, #7c5cfc, #a78bfa)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
            }}
          >
            送る
          </button>
          <button
            type="button"
            onClick={() => { setSubmitted(true); onComplete?.(); }}
            style={{
              padding: "0 20px",
              height: 48,
              borderRadius: 24,
              border: "1.5px solid #ddd6fe",
              background: "transparent",
              color: "#9b8fbd",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            スキップ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#1e1a3c", margin: 0 }}>
        このレポート、どうでしたか？
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            aria-label={SCORE_LABELS[s]}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: "1.5px solid #ddd6fe",
              background: "#fff",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.1s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {["😕", "😐", "🙂", "😊", "🤩"][s - 1]}
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setSkipped(true)}
          style={{
            background: "none",
            border: "none",
            color: "#9b8fbd",
            fontSize: 13,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          スキップ
        </button>
      </div>
    </div>
  );
}
