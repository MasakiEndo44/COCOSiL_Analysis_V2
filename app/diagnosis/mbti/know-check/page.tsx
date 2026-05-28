"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepDots } from "@/components/StepDots";
import { PrivacyNote } from "@/components/PrivacyNote";
import { getMaxReached, markStepReached } from "@/lib/stepProgress";
import { fi } from "@/lib/ui";

export default function MbtiKnowCheckPage() {
  const router = useRouter();
  const [maxReached, setMaxReached] = useState(0);
  const [visible, setVisible] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    markStepReached(3);
    setMaxReached(getMaxReached());
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="bg-aurora flex flex-col min-h-dvh" style={{ color: "#1e1a3c" }}>
      <div className="content-col flex flex-col flex-1 px-5 pt-12 pb-10">
        <StepDots current={3} maxReached={maxReached} />

        <div className="mb-10">
          <h1 className="text-3xl font-black leading-snug mb-3" style={fi(visible)}>
            自分のMBTIを<br />知っていますか？
          </h1>
          <p className="text-sm text-[#7b7b9d] leading-relaxed" style={fi(visible, 0.08)}>
            MBTIとは、人の思考・感情・行動の傾向を<br />
            4つの軸で分類する性格診断のフレームワークです。<br />
            世界中で広く使われており、<br />
            自分がどのように物事を捉え、<br />
            判断し、行動するかを知る手がかりになります。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {[
            {
              label: "知っている",
              sub: "MBTIの選択に進む",
              delay: 0.18,
              href: "/diagnosis/mbti/select",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#7c5cfc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: "知らない・自信がない",
              sub: "簡単な質問で自動判定する",
              delay: 0.26,
              href: "/diagnosis/mbti/intro",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#7c5cfc" strokeWidth="1.8"/>
                  <path d="M12 7v5l3 3" stroke="#7c5cfc" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ),
            },
          ].map(({ label, sub, delay, href, icon }) => (
            <div key={label} style={fi(visible, delay)}>
            <button
              type="button"
              onClick={() => router.push(href)}
              className="btn-card-press flex items-center gap-4 rounded-2xl px-5 py-5 text-left w-full"
              style={{
                background: "#fff",
                border: "1.5px solid #ede9f8",
                boxShadow: "0 1px 4px rgba(124,92,252,0.06)",
                cursor: "pointer",
              }}
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-full"
                style={{ width: 52, height: 52, background: "rgba(124,92,252,0.1)" }}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-[#1e1a3c]">{label}</div>
                <div className="text-sm text-[#7b7b9d] mt-0.5">{sub}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M9 18l6-6-6-6" stroke="#b0aec8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            </div>
          ))}
        </div>

        <div className="mt-8" style={fi(visible, 0.35)}>
          <PrivacyNote />
        </div>
      </div>
    </div>
  );
}
