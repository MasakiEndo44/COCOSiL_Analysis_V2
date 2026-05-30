"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrivacyNote } from "@/components/PrivacyNote";
import { fi, gradientBtnStyle } from "@/lib/ui";

const STEPS = ["いくつかの質問に回答", "性格タイプを自動で分析", "結果と統合レポートを確認"];

export default function MbtiIntroPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-aurora flex flex-col min-h-dvh" style={{ color: "#1e1a3c" }}>
      <div className="content-col flex flex-col flex-1 px-5 pt-12 pb-10">
        <h1 className="text-3xl font-black leading-snug mb-4" style={fi(visible)}>
          これから<br />MBTI簡易診断を<br />始めます
        </h1>
        <p className="text-sm text-[#7b7b9d] leading-relaxed mb-8" style={fi(visible, 0.08)}>
          いくつかの質問に答えるだけで、あなたのMBTIを診断します。所要時間は約5〜7分です。
        </p>

        {/* 診断の流れ */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: "#fff", border: "1.5px solid #ede9f8", ...fi(visible, 0.16) }}
        >
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 flex items-center justify-center rounded-full"
              style={{ width: 48, height: 48, background: "rgba(124,92,252,0.1)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="8" y="2" width="8" height="4" rx="1" stroke="#7c5cfc" strokeWidth="1.8"/>
                <path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" stroke="#7c5cfc" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M9 12h6M9 16h4" stroke="#7c5cfc" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-base font-bold text-[#1e1a3c] mb-3">診断の流れ</div>
              <div className="flex flex-col gap-2.5">
                {STEPS.map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ width: 22, height: 22, background: "#7c5cfc" }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm text-[#1e1a3c]">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ヒント */}
        <div
          className="rounded-2xl px-5 py-4 mb-8 flex items-start gap-3"
          style={{ background: "rgba(124,92,252,0.06)", border: "1.5px solid rgba(124,92,252,0.15)", ...fi(visible, 0.24) }}
        >
          <div
            className="shrink-0 flex items-center justify-center rounded-full mt-0.5"
            style={{ width: 36, height: 36, background: "rgba(124,92,252,0.12)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#7c5cfc" strokeWidth="1.8"/>
              <path d="M12 8c-1.1 0-2 .7-2 1.7 0 .7.4 1.3 1 1.6V13a1 1 0 0 0 2 0v-1.7c.6-.3 1-1 1-1.6C14 8.7 13.1 8 12 8z" fill="#7c5cfc"/>
              <circle cx="12" cy="16" r="1" fill="#7c5cfc"/>
            </svg>
          </div>
          <p className="text-sm text-[#7c5cfc] leading-relaxed">
            正解・不正解はありません。直感で回答してください。<br />
            できるだけ「どちらともいえない」の選択を避けることで、より正確な診断結果が得られます。
          </p>
        </div>

        {/* CTAボタン */}
        <div className="mt-auto flex flex-col gap-4" style={fi(visible, 0.32)}>
          <button
            type="button"
            onClick={() => router.push("/diagnosis/mbti")}
            className="btn-press w-full h-14 rounded-full text-base font-bold text-white"
            style={gradientBtnStyle}
          >
            簡易診断を始める
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "#ede9f8" }} />
            <span className="text-xs text-[#b0aec8]">または</span>
            <div className="flex-1 h-px" style={{ background: "#ede9f8" }} />
          </div>

          <button
            type="button"
            onClick={() => router.push("/diagnosis/mbti/select")}
            className="btn-press w-full h-14 rounded-full text-base font-bold"
            style={{ background: "transparent", border: "1.5px solid #7c5cfc", color: "#7c5cfc", cursor: "pointer" }}
          >
            やっぱり自分でMBTIを選ぶ
          </button>

          <div className="flex items-center justify-center mt-2">
            <PrivacyNote />
          </div>
        </div>
      </div>
    </div>
  );
}
