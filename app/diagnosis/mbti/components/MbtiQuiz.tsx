"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import posthog from "posthog-js";
import { MBTI_QUESTIONS } from "../questions";
import type { LikertValue, MbtiAnswer, MbtiResult } from "../types";
import { MbtiResultView } from "./MbtiResult";

type Phase = "quiz" | "result";

// 5択ボタンが flex:1 で均等配置。各中心位置: 10%, 30%, 50%, 70%, 90%
// ③(中央=50%)を起点にラインが左右に伸びる
const LINE_START = 10;   // 左端(①中心)の%
const LINE_WIDTH = 80;   // ①〜⑤全体の幅%
const CENTER = 50;       // ③中心の%

// ③を起点に左右の色付きラインを計算
function calcColoredLine(value: number | undefined): { left: number; width: number; isLeft: boolean } | null {
  if (value === undefined) return null;
  if (value === 3) return null; // ③は中立 = ラインなし
  // 各値の中心位置: 1→10%, 2→30%, 3→50%, 4→70%, 5→90%
  const pos = LINE_START + ((value - 1) / 4) * LINE_WIDTH;
  if (value < 3) {
    // 左方向: pos から center まで
    return { left: pos, width: CENTER - pos, isLeft: true };
  } else {
    // 右方向: center から pos まで
    return { left: CENTER, width: pos - CENTER, isLeft: false };
  }
}

const PC_BREAKPOINT = 640; // px — これ以上はサイドボタン、未満はフローティング

export function MbtiQuiz() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<MbtiAnswer[]>([]);
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const isTransitioning = useRef(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  // 最大到達インデックス（回答して自動進行した最も先の問）— render中に参照するので state で管理
  const [maxReachedIndex, setMaxReachedIndex] = useState(0);
  // 画面幅に応じてフローティング/サイドボタンを出し分け（CSS !importantとの競合を避けJSで制御）
  const [isPC, setIsPC] = useState(false);

  useEffect(() => {
    const check = () => setIsPC(window.innerWidth >= PC_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const totalQuestions = MBTI_QUESTIONS.length;
  const currentQuestion = MBTI_QUESTIONS[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const coloredLine = calcColoredLine(currentAnswer?.value);

  const handleAnswer = useCallback(
    (value: LikertValue) => {
      if (isTransitioning.current || !currentQuestion) return;
      setAnswers((prev) => {
        const updated = prev.filter((a) => a.questionId !== currentQuestion.id);
        updated.push({ questionId: currentQuestion.id, value });
        return updated;
      });
      if (currentIndex < totalQuestions - 1) {
        isTransitioning.current = true;
        setTimeout(() => {
          setSlideDirection("next");
          setCurrentIndex((i) => {
            const next = i + 1;
            setMaxReachedIndex((prev) => Math.max(prev, next));
            return next;
          });
          isTransitioning.current = false;
        }, 300);
      }
    },
    [currentIndex, currentQuestion, totalQuestions],
  );

  const handlePrev = useCallback(() => {
    setSlideDirection("prev");
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setSlideDirection("next");
    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1));
  }, [totalQuestions]);

  const handleSubmit = useCallback(async () => {
    if (answers.length < totalQuestions) return;
    setIsSubmitting(true);
    posthog.capture("mbti_quiz_completed", { total_questions: totalQuestions });
    try {
      const distinctId = posthog.get_distinct_id();
      const res = await fetch("/api/diagnosis/mbti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-POSTHOG-DISTINCT-ID": distinctId ?? "",
        },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        if (data.result.id) localStorage.setItem("cocosil_mbti_result_id", data.result.id);
        setResult(data.result);
        setPhase("result");
      }
    } catch (err) {
      console.error("診断エラー:", err);
      posthog.captureException(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, totalQuestions]);

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = answers.length === totalQuestions;

  // 最終問に全回答完了したら「診断する」ボタンへスクロール
  useEffect(() => {
    if (isLastQuestion && allAnswered && submitRef.current) {
      submitRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered]);

  if (phase === "result" && result) return <MbtiResultView result={result} />;

  return (
    <div style={{ width: "100%", maxWidth: 520, margin: "0 auto", padding: "0 1.25rem 6rem" }}>

      {/* プログレス */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.06em" }}>
            QUESTION {currentIndex + 1} / {totalQuestions}
          </span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.06em", fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif" }}>MBTI診断</span>
        </div>
        <div style={{ height: 5, background: "#ede9f8", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #7c5cfc, #a78bfa)",
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* 質問 */}
      <div
        key={currentQuestion.id}
        className={slideDirection === "next" ? "slide-in-right" : "slide-in-left"}
        style={{ marginBottom: "2.5rem" }}
      >
        <h2 style={{ fontSize: "1.45rem", fontWeight: 800, lineHeight: 1.45, color: "#1e1a3c", marginBottom: "0.75rem" }}>
          {currentQuestion.text}
        </h2>
        <p style={{ fontSize: "0.83rem", color: "#7b7b9d", lineHeight: 1.6 }}>
          いまの自分にいちばん近いところを選んでください。<br />直感で大丈夫です。
        </p>
      </div>

      {/* リッカート */}
      <div style={{ marginBottom: "2.5rem" }}>
        {/* 上ラベル行 */}
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "#b0aec8", marginBottom: "1.25rem" }}>
          <span>← 全くそう思わない</span>
          <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textAlign: "center", lineHeight: 1.3 }}>どちらとも<br />いえない</span>
          <span>強くそう思う →</span>
        </div>

        {/* 丸サイズ固定（選択時も非選択時も同じ領域を確保してラインがズレない）
            CIRCLE_SIZE=36, PADDING_TOP=8 → ラインtop = 8 + 18 = 26px */}
        <div style={{ position: "relative", display: "flex" }}>
          {/* ベースライン */}
          <div style={{
            position: "absolute",
            left: `${LINE_START}%`,
            width: `${LINE_WIDTH}%`,
            height: 2,
            background: "#ede9f8",
            top: 26,
            zIndex: 0,
          }} />

          {/* 選択済みカラーライン（③起点） */}
          {coloredLine && (
            <div style={{
              position: "absolute",
              left: `${coloredLine.left}%`,
              width: `${coloredLine.width}%`,
              height: 2,
              background: coloredLine.isLeft
                ? "linear-gradient(90deg, #a78bfa, #7c5cfc)"
                : "linear-gradient(90deg, #7c5cfc, #a78bfa)",
              top: 26,
              zIndex: 1,
              transition: "left 0.2s ease, width 0.2s ease",
            }} />
          )}

          {[1, 2, 3, 4, 5].map((val) => {
            const isSelected = currentAnswer?.value === (val as LikertValue);
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleAnswer(val as LikertValue)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 0 0.5rem",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {/* 丸：常に36pxの領域を確保しつつ、選択時は拡大して見せる */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute",
                    width: isSelected ? 48 : 36,
                    height: isSelected ? 48 : 36,
                    borderRadius: "50%",
                    background: isSelected ? "linear-gradient(135deg, #7c5cfc, #a78bfa)" : "#fff",
                    border: isSelected ? "none" : "2px solid #ddd8f0",
                    boxShadow: isSelected ? "0 0 0 6px rgba(124,92,252,0.12)" : "none",
                    transition: "all 0.15s ease",
                  }} />
                </div>
                <span style={{
                  fontSize: "0.75rem",
                  color: isSelected ? "#7c5cfc" : "#c4b5fd",
                  fontWeight: isSelected ? 700 : 400,
                  transition: "color 0.15s",
                }}>
                  {val}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 診断するボタン（最終問 + 全回答済み） */}
      {isLastQuestion && allAnswered && (
        <button
          ref={submitRef}
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 999,
            background: "linear-gradient(135deg, #7c5cfc, #a78bfa)",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 700,
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            boxShadow: "0 4px 20px rgba(124,92,252,0.4)",
            opacity: isSubmitting ? 0.7 : 1,
            marginBottom: "1rem",
          }}
        >
          {isSubmitting ? "診断中..." : "診断する"}
        </button>
      )}

      {/* フッター注記 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "0.5rem" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#b0aec8" strokeWidth="1.5"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#b0aec8" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: "0.75rem", color: "#b0aec8" }}>入力内容は、あなたを理解するためだけに使われます</span>
      </div>

      {/* ナビボタン: isPC で完全排他 — CSS !important との競合を避けJS制御 */}
      {(() => {
        const canGoPrev = currentIndex > 0;
        const canGoNext = currentIndex < totalQuestions - 1 && currentIndex < maxReachedIndex;

        if (isPC) {
          // PC: 画面左右中央に固定表示
          const pcBtnStyle = (enabled: boolean, side: "left" | "right"): React.CSSProperties => ({
            position: "fixed",
            top: "50%",
            [side === "left" ? "left" : "right"]: "calc(50% - 320px)",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            background: "rgba(255,255,255,0.9)",
            border: "1.5px solid #ede9f8",
            borderRadius: "50%",
            color: enabled ? "#a78bfa" : "#d4cef0",
            cursor: enabled ? "pointer" : "not-allowed",
            boxShadow: enabled ? "0 4px 16px rgba(124,92,252,0.15)" : "none",
            zIndex: 50,
          });
          return (
            <>
              <button
                type="button"
                onClick={canGoPrev ? handlePrev : undefined}
                disabled={!canGoPrev}
                className={canGoPrev ? "mbti-nav-btn" : undefined}
                style={pcBtnStyle(canGoPrev, "left")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={canGoNext ? handleNext : undefined}
                disabled={!canGoNext}
                className={canGoNext ? "mbti-nav-btn" : undefined}
                style={pcBtnStyle(canGoNext, "right")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          );
        }

        // スマホ: 画面下部中央にフローティング
        const btnStyle = (enabled: boolean): React.CSSProperties => ({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          background: "#fff",
          border: "1.5px solid #ede9f8",
          borderRadius: "50%",
          color: enabled ? "#a78bfa" : "#d4cef0",
          cursor: enabled ? "pointer" : "not-allowed",
          boxShadow: enabled ? "0 4px 16px rgba(124,92,252,0.15)" : "none",
        });
        return (
          <div style={{
            position: "fixed",
            bottom: "1.75rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 50,
          }}>
            <button type="button" onClick={canGoPrev ? handlePrev : undefined} disabled={!canGoPrev} style={btnStyle(canGoPrev)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button type="button" onClick={canGoNext ? handleNext : undefined} disabled={!canGoNext} style={btnStyle(canGoNext)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        );
      })()}
    </div>
  );
}
