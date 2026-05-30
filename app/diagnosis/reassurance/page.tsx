"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEYS } from "@/lib/sessionKeys";

function FluidOrb() {
  return (
    <div style={{ width: 240, height: 240, overflow: "hidden", borderRadius: "50%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          width: 560, height: 560,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(44px)",
        }}
      >
        {/* 紫コア — 中央メイン */}
        <div style={{
          position: "absolute", width: 230, height: 230,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,92,252,1) 0%, rgba(124,92,252,0) 58%)",
          animation: "mb1 5s ease-in-out infinite",
        }} />
        {/* ローズピンク — 右上 */}
        <div style={{
          position: "absolute", width: 200, height: 200,
          top: "10%", left: "52%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,113,133,0.85) 0%, rgba(251,113,133,0) 58%)",
          animation: "mb2 6.5s ease-in-out infinite",
        }} />
        {/* スカイブルー — 右下 */}
        <div style={{
          position: "absolute", width: 195, height: 195,
          top: "52%", left: "55%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(96,165,250,0.90) 0%, rgba(96,165,250,0) 58%)",
          animation: "mb3 7s ease-in-out infinite",
        }} />
        {/* ピンク紫 — 左下 */}
        <div style={{
          position: "absolute", width: 210, height: 210,
          top: "50%", left: "10%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,121,249,0.88) 0%, rgba(232,121,249,0) 58%)",
          animation: "mb4 5.5s ease-in-out infinite",
        }} />
        {/* ラベンダー — 左上 */}
        <div style={{
          position: "absolute", width: 185, height: 185,
          top: "8%", left: "12%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,181,253,0.95) 0%, rgba(196,181,253,0) 58%)",
          animation: "mb5 8s ease-in-out infinite",
        }} />
        {/* ミント — 中央下 */}
        <div style={{
          position: "absolute", width: 160, height: 160,
          top: "62%", left: "34%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(110,231,183,0.70) 0%, rgba(110,231,183,0) 58%)",
          animation: "mb6 9s ease-in-out infinite",
        }} />
        {/* コーラル — 中央上 */}
        <div style={{
          position: "absolute", width: 150, height: 150,
          top: "5%", left: "35%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(253,186,116,0.65) 0%, rgba(253,186,116,0) 58%)",
          animation: "mb7 7.5s ease-in-out infinite",
        }} />
        {/* インディゴ深み — 中央右 */}
        <div style={{
          position: "absolute", width: 170, height: 170,
          top: "30%", left: "58%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,70,229,0.80) 0%, rgba(79,70,229,0) 58%)",
          animation: "mb8 6s ease-in-out infinite",
        }} />

        <style>{`
          @keyframes mb1 {
            0%,100% { transform: translate(-50%,-50%) scale(1) rotate(0deg); }
            30%      { transform: translate(-43%,-58%) scale(1.15) rotate(9deg); }
            65%      { transform: translate(-57%,-42%) scale(0.90) rotate(-7deg); }
          }
          @keyframes mb2 {
            0%,100% { transform: translate(0,0) scale(1); }
            35%      { transform: translate(-36px, 42px) scale(1.18); }
            70%      { transform: translate(20px,-32px) scale(0.86); }
          }
          @keyframes mb3 {
            0%,100% { transform: translate(0,0) scale(1); }
            40%      { transform: translate(-30px,-44px) scale(1.14); }
            72%      { transform: translate(26px, 30px) scale(0.88); }
          }
          @keyframes mb4 {
            0%,100% { transform: translate(0,0) scale(1); }
            28%      { transform: translate(40px,-38px) scale(1.16); }
            63%      { transform: translate(-18px, 36px) scale(0.91); }
          }
          @keyframes mb5 {
            0%,100% { transform: translate(0,0) scale(1); }
            45%      { transform: translate(34px, 40px) scale(1.12); }
            78%      { transform: translate(-14px,-22px) scale(0.93); }
          }
          @keyframes mb6 {
            0%,100% { transform: translate(0,0) scale(1); }
            38%      { transform: translate(-28px,-34px) scale(1.20); }
            68%      { transform: translate(22px, 18px) scale(0.85); }
          }
          @keyframes mb7 {
            0%,100% { transform: translate(0,0) scale(1); }
            42%      { transform: translate(18px, 38px) scale(1.16); }
            74%      { transform: translate(-24px,-16px) scale(0.90); }
          }
          @keyframes mb8 {
            0%,100% { transform: translate(0,0) scale(1); }
            33%      { transform: translate(-38px, 26px) scale(1.13); }
            66%      { transform: translate(16px,-36px) scale(0.87); }
          }
        `}</style>
      </div>
      {/* ノイズグラデーション（2層） — グラデーションのバンディングを消し有機的な質感を与える */}
      {/* 層1：粒状スプリンクル（高密度・高コントラスト） */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='2.4' intercept='-0.7'/%3E%3CfeFuncG type='linear' slope='2.4' intercept='-0.7'/%3E%3CfeFuncB type='linear' slope='2.4' intercept='-0.7'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />
      {/* 層2：粗い有機ムラ（大きなうねりで奥行きを出す） */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.015' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E\")",
          backgroundSize: "100% 100%",
          mixBlendMode: "soft-light",
          opacity: 0.14,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

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
