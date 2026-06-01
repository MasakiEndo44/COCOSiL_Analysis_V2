"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEYS } from "@/lib/sessionKeys";
import { FluidOrb } from "@/components/FluidOrb";

export default function ReassurancePage() {
  const router = useRouter();
  const [showOrb, setShowOrb] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEYS.MBTI_TYPE)) {
      router.replace("/diagnosis/mbti/know-check");
      return;
    }
    const t1 = setTimeout(() => setShowOrb(true), 60);
    const t2 = setTimeout(() => setShowMessage(true), 800);
    const t3 = setTimeout(() => setShowButton(true), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [router]);

  const fadeIn = (show: boolean, delay = 0) => ({
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });

  return (
    <div
      className="bg-aurora flex flex-col min-h-dvh"
      style={{ color: "#1e1a3c" }}
    >
      <div className="content-col flex flex-col flex-1 items-center justify-center px-6 gap-8">
        {/* 上部テキスト */}
        <div
          className="flex flex-col items-center text-center"
          style={fadeIn(showOrb)}
        >
          <p
            className="text-2xl font-black leading-snug"
            style={{ letterSpacing: "-0.01em" }}
          >
            あなたの結果が描けました。<br />
            読む前に、ひとつだけ。
          </p>
        </div>

        {/* 流体マーブルオーブ */}
        <div className="flex items-center justify-center" style={fadeIn(showOrb)}>
          <FluidOrb />
        </div>

        {/* 下部：メッセージ＋ボタン */}
        <div className="w-full flex flex-col items-center gap-6">
          {/* メッセージ: オーブの後にフェードイン */}
          <div
            className="w-full text-center px-2"
            style={{ maxWidth: 340, ...fadeIn(showMessage) }}
          >
            <p
              className="text-2xl font-black leading-snug"
              style={{ color: "#1e1a3c", letterSpacing: "-0.02em" }}
            >
              これは評価ではありません。
            </p>
            <p
              className="text-2xl font-black leading-snug mt-2"
              style={{ color: "#1e1a3c", letterSpacing: "-0.02em" }}
            >
              あなた自身を理解する<br />ための地図です。
            </p>
          </div>

          {/* ボタン: さらに間をおいてフェードイン */}
          <div
            className="w-full flex justify-center"
            style={fadeIn(showButton)}
          >
            <button
              type="button"
              onClick={() => router.push("/diagnosis/result")}
              className="btn-press w-full h-14 rounded-full text-base font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #7c5cfc, #a78bfa)",
                boxShadow: "0 4px 24px rgba(124,92,252,0.4)",
                cursor: "pointer",
                maxWidth: 400,
              }}
            >
              統合レポートを読んでみる
            </button>
          </div>
        </div>
      </div>{/* /content-col */}
    </div>
  );
}
