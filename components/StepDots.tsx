"use client";

import { useRouter } from "next/navigation";

const STEPS: { label: string; path: string }[] = [
  { label: "気持ち",     path: "/onboarding" },
  { label: "生年月日",   path: "/onboarding/birthdate" },
  { label: "診断結果",   path: "/onboarding/auto-calc-result" },
  { label: "MBTI確認",  path: "/diagnosis/mbti/know-check" },
  { label: "MBTI選択",  path: "/diagnosis/mbti/select" },
];

interface StepDotsProps {
  current: number; // 0-indexed
  maxReached: number; // ユーザーが実際に到達した最大ステップ
}

export function StepDots({ current, maxReached }: StepDotsProps) {
  const router = useRouter();

  const canGoBack = current > 0;
  // 次のステップが存在し、かつ過去に到達済みの場合のみ進める
  const canGoForward = current < STEPS.length - 1 && current < maxReached;

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {/* 戻るボタン */}
      <button
        type="button"
        aria-label="前のステップに戻る"
        disabled={!canGoBack}
        onClick={() => canGoBack && router.push(STEPS[current - 1].path)}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1.5px solid",
          borderColor: canGoBack ? "#a78bfa" : "#e0d9f8",
          background: "transparent",
          color: canGoBack ? "#7c5cfc" : "#c4b5fd",
          cursor: canGoBack ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: 0,
          transition: "all 0.2s ease",
          opacity: canGoBack ? 1 : 0.4,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ドット */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => {
          const isDone = i < current;
          const isCurrent = i === current;

          return (
            <div
              key={step.path}
              style={{
                width: isCurrent ? 24 : 8,
                height: 8,
                borderRadius: 999,
                background: isCurrent
                  ? "linear-gradient(90deg, #7c5cfc, #a78bfa)"
                  : isDone
                  ? "#c4b5fd"
                  : "#e0d9f8",
                transition: "all 0.25s ease",
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>

      {/* 進むボタン */}
      <button
        type="button"
        aria-label="次のステップへ進む"
        disabled={!canGoForward}
        onClick={() => canGoForward && router.push(STEPS[current + 1].path)}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1.5px solid",
          borderColor: canGoForward ? "#a78bfa" : "#e0d9f8",
          background: "transparent",
          color: canGoForward ? "#7c5cfc" : "#c4b5fd",
          cursor: canGoForward ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: 0,
          transition: "all 0.2s ease",
          opacity: canGoForward ? 1 : 0.4,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
