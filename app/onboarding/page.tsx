"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepDots } from "@/components/StepDots";
import { PrivacyNote } from "@/components/PrivacyNote";
import { getMaxReached, markStepReached } from "@/lib/stepProgress";
import { SESSION_KEYS } from "@/lib/sessionKeys";
import { fi, gradientBtnStyle } from "@/lib/ui";

const MOODS = [
  {
    id: "moody",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={40} height={40}>
        <circle cx="20" cy="20" r="19" stroke="#a78bfa" strokeWidth="1.5" />
        <path d="M10 20 Q14 12 20 16 Q26 20 30 12" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M12 26 Q16 22 20 24 Q24 26 28 22" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M16 14 Q18 10 20 13 Q22 10 24 14" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    label: "少しモヤモヤしている",
  },
  {
    id: "curious",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={40} height={40}>
        <circle cx="20" cy="20" r="19" stroke="#a78bfa" strokeWidth="1.5" />
        <circle cx="20" cy="16" r="5" stroke="#a78bfa" strokeWidth="1.5" />
        <path d="M11 32c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M22 23.5 Q24 26 22 28" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="22.5" cy="29.5" r="1" fill="#a78bfa"/>
      </svg>
    ),
    label: "自分をもっと知りたい",
  },
  {
    id: "talk",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width={40} height={40}>
        <circle cx="20" cy="20" r="19" stroke="#a78bfa" strokeWidth="1.5" />
        <path d="M12 14h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H22l-4 4v-4h-6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <circle cx="16" cy="20" r="1.2" fill="#a78bfa"/>
        <circle cx="20" cy="20" r="1.2" fill="#a78bfa"/>
        <circle cx="24" cy="20" r="1.2" fill="#a78bfa"/>
      </svg>
    ),
    label: "なんとなく話してみたい",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [maxReached, setMaxReached] = useState(0);
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 復元時のstateセットでスクロールが走らないよう、ユーザー操作かどうかを区別する
  const userActed = useRef(false);

  const canProceed = selected !== null || memo.trim().length > 0;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    markStepReached(0);
    setMaxReached(getMaxReached());
    const savedSelected = sessionStorage.getItem(SESSION_KEYS.ONBOARDING_SELECTED);
    const savedMemo = sessionStorage.getItem(SESSION_KEYS.ONBOARDING_MEMO);
    if (savedSelected) setSelected(savedSelected);
    if (savedMemo) setMemo(savedMemo);
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (selected !== null) sessionStorage.setItem(SESSION_KEYS.ONBOARDING_SELECTED, selected);
    else sessionStorage.removeItem(SESSION_KEYS.ONBOARDING_SELECTED);
  }, [selected]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEYS.ONBOARDING_MEMO, memo);
  }, [memo]);

  useEffect(() => {
    if (!userActed.current) return;
    if (selected !== null && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!isVisible) {
        buttonRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selected]);

  function handleCardClick(id: string) {
    userActed.current = true;
    setSelected((prev) => (prev === id ? null : id));
  }

  return (
    <div className="bg-aurora flex flex-col min-h-dvh" style={{ color: "#1e1a3c" }}>
      <div className="content-col flex flex-col flex-1 px-5 pt-12 pb-10">
        <StepDots current={0} maxReached={maxReached} />

        <h1
          className="text-3xl font-black text-[#1e1a3c] leading-snug mb-2"
          style={fi(visible)}
        >
          こんにちは。<br />今日は、どんな気持ちで<br />来ましたか？
        </h1>
        <p className="text-sm text-[#7b7b9d] mb-10" style={fi(visible, 0.08)}>
          近いものをひとつ選ぶか、自由に書いてみてください。
        </p>

        {/* 気持ちカード */}
        <div className="flex flex-col gap-3 mb-5">
          {MOODS.map((mood, i) => {
            const isSelected = selected === mood.id;
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => handleCardClick(mood.id)}
                className="btn-press flex items-center gap-4 rounded-2xl px-5 py-5 text-left w-full"
                style={{
                  background: isSelected ? "rgba(124,92,252,0.07)" : "#fff",
                  border: isSelected ? "2px solid #7c5cfc" : "1.5px solid #ede9f8",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(124,92,252,0.06)",
                  ...fi(visible, 0.15 + i * 0.08),
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{ width: 52, height: 52, background: "rgba(167,139,250,0.12)" }}
                >
                  {mood.icon}
                </div>
                <span className="text-base font-bold text-[#1e1a3c]">{mood.label}</span>
              </button>
            );
          })}
        </div>

        {/* 区切り */}
        <div
          className="flex items-center gap-3 mb-5"
          style={fi(visible, 0.38)}
        >
          <div className="flex-1 h-px" style={{ background: "#ede9f8" }} />
          <span className="text-xs text-[#b0aec8]">または</span>
          <div className="flex-1 h-px" style={{ background: "#ede9f8" }} />
        </div>

        {/* 自由記述 */}
        <div className="mb-5" style={fi(visible, 0.44)}>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onFocus={() => setSelected(null)}
            placeholder="今の気持ちを自由に書いてみてください。"
            rows={4}
            className="w-full rounded-2xl px-4 py-3 text-sm text-[#1e1a3c] resize-none outline-none"
            style={{
              background: "#fff",
              border: "1.5px solid #ede9f8",
              boxShadow: "0 1px 4px rgba(124,92,252,0.06)",
            }}
          />
        </div>

        {/* プライバシー注記 */}
        <div className="mb-6" style={fi(visible, 0.5)}>
          <PrivacyNote />
        </div>

        {/* 次へボタン */}
        <div className="mt-auto" style={fi(visible, 0.55)}>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => router.push("/onboarding/birthdate")}
            disabled={!canProceed}
            className="btn-press w-full h-14 rounded-full text-base font-bold text-white transition-opacity duration-200"
            style={{
              ...gradientBtnStyle,
              boxShadow: canProceed ? gradientBtnStyle.boxShadow : "none",
              opacity: canProceed ? 1 : 0.35,
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}
