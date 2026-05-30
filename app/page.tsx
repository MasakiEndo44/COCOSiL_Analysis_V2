import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COCOSiL — 自分を知って、ラクになる。",
  description:
    "4つの診断 × AI共感チャットで、あなただけの統合レポートを生成。",
};

export default function Home() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between px-6 pt-16 pb-12"
      style={{
        background: "linear-gradient(160deg, #c8b4f8 0%, #a78bfa 35%, #818cf8 65%, #93c5fd 100%)",
      }}
    >
      <main className="w-full max-w-sm flex flex-col items-center gap-0 text-center flex-1">

        {/* ロゴ */}
        <div className="flex flex-col items-center gap-1.5 mb-10">
          <img src="/icon.png" alt="COCOSiL" className="w-10 h-10 rounded-lg" />
          <span className="text-base font-bold text-white tracking-widest">COCOSiL</span>
        </div>

        {/* キャッチコピー */}
        <p className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-4">
          KNOW YOURSELF
        </p>
        <h1 className="text-4xl font-black text-white leading-tight mb-6">
          自分を知って、<br />ラクになる。
        </h1>
        <p className="text-sm text-white/80 leading-7 mb-12">
          4つの診断 × AI共感チャットで<br />
          あなただけの統合レポートを生成
        </p>

        {/* 診断カード */}
        <div
          className="w-full rounded-3xl p-6 mb-12"
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
        >
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: "👥", label: "MBTI" },
              { icon: "✨", label: "12星座" },
              { icon: "🐱", label: "60アニマル診断" },
              { icon: "⬡", label: "六星占術" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: "rgba(255,255,255,0.3)" }}
                >
                  {icon}
                </div>
                <span className="text-xs text-white/90 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* CTA */}
      <div className="w-full max-w-sm flex flex-col gap-4 items-center">
        <Link
          href="/onboarding"
          className="w-full flex items-center justify-center h-14 rounded-full font-semibold text-base bg-white transition-opacity hover:opacity-90"
          style={{ color: "#7c5cfc" }}
        >
          <span className="font-bold" style={{ color: "#7c5cfc" }}>Google</span>
          <span className="text-gray-700 font-semibold">ではじめる</span>
        </Link>
        <button className="text-sm text-white/80 underline underline-offset-2">
          メールアドレスで登録
        </button>
      </div>
    </div>
  );
}
