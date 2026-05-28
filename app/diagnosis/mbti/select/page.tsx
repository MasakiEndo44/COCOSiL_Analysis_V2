"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StepDots } from "@/components/StepDots";
import { PrivacyNote } from "@/components/PrivacyNote";
import { getMaxReached, markStepReached } from "@/lib/stepProgress";
import { SESSION_KEYS } from "@/lib/sessionKeys";
import { fi, gradientBtnStyle } from "@/lib/ui";

const GROUPS = [
  {
    label: "分析家グループ",
    color: "#7c5cfc",
    bg: "rgba(124,92,252,0.07)",
    dot: "#7c5cfc",
    types: [
      { code: "INTJ", name: "建築家" },
      { code: "INTP", name: "論理学者" },
      { code: "ENTJ", name: "指揮官" },
      { code: "ENTP", name: "討論者" },
    ],
  },
  {
    label: "外交官グループ",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.07)",
    dot: "#22c55e",
    types: [
      { code: "INFJ", name: "提唱者" },
      { code: "INFP", name: "仲介者" },
      { code: "ENFJ", name: "主人公" },
      { code: "ENFP", name: "運動家" },
    ],
  },
  {
    label: "番人グループ",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.07)",
    dot: "#3b82f6",
    types: [
      { code: "ISTJ", name: "管理者" },
      { code: "ISFJ", name: "擁護者" },
      { code: "ESTJ", name: "幹部" },
      { code: "ESFJ", name: "領事" },
    ],
  },
  {
    label: "探検家グループ",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.07)",
    dot: "#f59e0b",
    types: [
      { code: "ISTP", name: "巨匠" },
      { code: "ISFP", name: "冒険家" },
      { code: "ESTP", name: "起業家" },
      { code: "ESFP", name: "エンターテイナー" },
    ],
  },
];

export default function MbtiSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [maxReached, setMaxReached] = useState(0);
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    markStepReached(4);
    setMaxReached(getMaxReached());
    const saved = sessionStorage.getItem(SESSION_KEYS.MBTI_SELECTED);
    if (saved) setSelected(saved);
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleSelect(code: string) {
    setSelected(code);
    sessionStorage.setItem(SESSION_KEYS.MBTI_SELECTED, code);
    setTimeout(() => {
      buttonRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }

  function handleConfirm() {
    if (!selected) return;
    sessionStorage.setItem(SESSION_KEYS.MBTI_TYPE, selected);
    router.push("/diagnosis/reassurance");
  }

  return (
    <div className="bg-aurora flex flex-col min-h-dvh" style={{ color: "#1e1a3c" }}>
      <div className="content-col flex flex-col flex-1 pb-10">
        <div className="px-5 pt-12">
          <StepDots current={4} maxReached={maxReached} />
          <p className="text-xs font-semibold tracking-widest text-[#a78bfa] mb-4" style={fi(visible)}>MBTI選択</p>
          <h1 className="text-3xl font-black leading-snug mb-3" style={fi(visible, 0.07)}>あなたのMBTIを<br />選んでください</h1>
          <p className="text-sm text-[#7b7b9d] leading-relaxed mb-6" style={fi(visible, 0.13)}>
            16タイプの中から、当てはまるものを1つ選んでください。<br />
            わからない場合は、下のボタンから簡易診断に進めます。
          </p>
        </div>

        <div className="px-5 flex flex-col gap-6">
          {GROUPS.map((group, gi) => (
            <div
              key={group.label}
              className="rounded-2xl p-4"
              style={{ background: group.bg, ...fi(visible, 0.18 + gi * 0.08) }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: group.dot }} />
                <span className="text-sm font-bold" style={{ color: group.color }}>{group.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.types.map((t) => {
                  const isSelected = selected === t.code;
                  return (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => handleSelect(t.code)}
                      className="flex flex-col items-center justify-center rounded-xl py-4 transition-all duration-150"
                      style={{
                        background: "#fff",
                        border: isSelected ? `2px solid ${group.color}` : "1.5px solid #ede9f8",
                        position: "relative",
                      }}
                    >
                      {isSelected && (
                        <div
                          className="absolute top-2 right-2 flex items-center justify-center rounded-full"
                          style={{ width: 20, height: 20, background: group.color }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      <span className="text-base font-black" style={{ color: group.color }}>{t.code}</span>
                      <span className="text-xs text-[#7b7b9d] mt-0.5">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div ref={buttonRef} className="px-5 mt-8 flex flex-col gap-3" style={fi(visible, 0.5)}>
          <div className="flex items-center gap-1.5 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#b0aec8" strokeWidth="1.5"/>
              <path d="M12 8v4m0 4h.01" stroke="#b0aec8" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span className="text-xs text-[#b0aec8]">選んだ内容はあとから変更できます</span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="btn-press w-full h-14 rounded-full text-base font-bold text-white transition-opacity duration-200"
            style={{
              ...gradientBtnStyle,
              boxShadow: selected ? gradientBtnStyle.boxShadow : "none",
              opacity: selected ? 1 : 0.35,
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            このMBTIに決定し 統合レポートを確認する
          </button>

          <button
            type="button"
            onClick={() => router.push("/diagnosis/mbti/intro")}
            className="btn-press w-full h-14 rounded-full text-base font-bold"
            style={{ background: "transparent", border: "1.5px solid #7c5cfc", color: "#7c5cfc", cursor: "pointer" }}
          >
            やっぱり簡易診断を受ける
          </button>

          <div className="flex justify-center">
            <PrivacyNote />
          </div>
        </div>
      </div>
    </div>
  );
}
