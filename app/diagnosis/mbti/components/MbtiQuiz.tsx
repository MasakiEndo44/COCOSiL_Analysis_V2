"use client";

import { useState, useCallback } from "react";
import { MBTI_QUESTIONS, LIKERT_LABELS } from "../questions";
import type { LikertValue, MbtiAnswer, MbtiResult } from "../types";
import { MbtiTypeSelector } from "./MbtiTypeSelector";
import { MbtiResultView } from "./MbtiResult";

type Phase = "quiz" | "skip" | "result";

export function MbtiQuiz() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<MbtiAnswer[]>([]);
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  const totalQuestions = MBTI_QUESTIONS.length;
  const currentQuestion = MBTI_QUESTIONS[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);
  const progress = ((currentIndex) / totalQuestions) * 100;

  // ---- 回答ハンドラ ----
  const handleAnswer = useCallback(
    (value: LikertValue) => {
      setAnswers((prev) => {
        const updated = prev.filter(
          (a) => a.questionId !== currentQuestion.id,
        );
        updated.push({ questionId: currentQuestion.id, value });
        return updated;
      });

      // 少し遅延してから次の質問へ (アニメーション用)
      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setSlideDirection("next");
          setCurrentIndex((i) => i + 1);
        }
      }, 300);
    },
    [currentIndex, currentQuestion, totalQuestions],
  );

  // ---- 前の質問へ ----
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSlideDirection("prev");
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // ---- 診断送信 ----
  const handleSubmit = useCallback(async () => {
    if (answers.length < totalQuestions) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/diagnosis/mbti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        if (data.result.id) {
          localStorage.setItem("cocosil_mbti_result_id", data.result.id);
        }
        setResult(data.result);
        setPhase("result");
      }
    } catch (err) {
      console.error("診断エラー:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, totalQuestions]);

  // ---- スキップ (直接選択) ----
  const handleDirectSelect = useCallback(async (type: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/diagnosis/mbti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directType: type }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        if (data.result.id) {
          localStorage.setItem("cocosil_mbti_result_id", data.result.id);
        }
        setResult(data.result);
        setPhase("result");
      }
    } catch (err) {
      console.error("診断エラー:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ---- 結果画面 ----
  if (phase === "result" && result) {
    return <MbtiResultView result={result} />;
  }

  // ---- スキップ画面 ----
  if (phase === "skip") {
    return (
      <MbtiTypeSelector
        onSelect={handleDirectSelect}
        onBack={() => setPhase("quiz")}
        isSubmitting={isSubmitting}
      />
    );
  }

  // ---- クイズ画面 ----
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = answers.length === totalQuestions;

  return (
    <div className="quiz-container">
      {/* プログレスバー */}
      <div className="progress-wrapper">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* 質問カード */}
      <div className="card-area">
        <div
          key={currentQuestion.id}
          className={`question-card ${slideDirection === "next" ? "slide-in-right" : "slide-in-left"}`}
        >
          <div className="question-number">Q{currentQuestion.id}</div>
          <p className="question-text">{currentQuestion.text}</p>

          {/* リッカート選択肢 */}
          <div className="likert-group">
            {LIKERT_LABELS.map((opt) => (
              <button
                key={opt.value}
                className={`likert-btn${currentAnswer?.value === opt.value ? " selected" : ""}`}
                onClick={() => handleAnswer(opt.value as LikertValue)}
                type="button"
              >
                <span className="likert-value">{opt.value}</span>
                <span className="likert-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="quiz-nav">
        <button
          className="nav-btn secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          type="button"
        >
          ← 前へ
        </button>

        {isLastQuestion && allAnswered ? (
          <button
            className="nav-btn primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? "診断中..." : "診断する ✨"}
          </button>
        ) : (
          <button
            className="nav-btn secondary"
            onClick={() => {
              setSlideDirection("next");
              setCurrentIndex((i) => Math.min(i + 1, totalQuestions - 1));
            }}
            disabled={!currentAnswer || isLastQuestion}
            type="button"
          >
            次へ →
          </button>
        )}
      </div>

      {/* スキップボタン */}
      <button
        className="skip-btn"
        onClick={() => setPhase("skip")}
        type="button"
      >
        既にMBTIタイプを知っている方はこちら
      </button>
    </div>
  );
}
