import Link from "next/link";
import type { Metadata } from "next";
import { MbtiIcon, ZodiacIcon, AnimalIcon, SixStarIcon } from "@/components/icons/SystemIcons";

export const metadata: Metadata = {
  title: "COCOSiL — 自分を知って、ラクになる。",
  description:
    "4つの性格分析とAIとの対話から、根拠のある“あなたのトリセツ”を。自分が分かると、人間関係も少しラクになる。",
};

const JOURNEY = [
  { label: "話す", note: "今の気持ちを、そのまま受けとめる" },
  { label: "ゆるむ", note: "ひとりで抱えていたものが、ほどける" },
  { label: "わかる", note: "4つの性格分析で、自分の傾向が見えてくる" },
  { label: "変わる", note: "関わり方が、少しずつ変わっていく" },
];

const SYSTEMS = [
  { Icon: MbtiIcon, label: "MBTI", note: "性格の4つの軸" },
  { Icon: ZodiacIcon, label: "12星座", note: "季節がはぐくむ気質" },
  { Icon: AnimalIcon, label: "60種動物分類", note: "関わり方のタイプ" },
  { Icon: SixStarIcon, label: "六星占術", note: "生まれ持つリズム" },
];

export default function Home() {
  return (
    <div className="bg-aurora flex flex-col min-h-dvh" style={{ color: "#1e1a3c" }}>
      <div className="content-col flex flex-col flex-1 px-6 pt-12 pb-10">

        {/* ロゴ */}
        <div className="flex items-center gap-2 self-center mb-10">
          <img src="/icon.png" alt="" className="w-8 h-8 rounded-lg" />
          <span className="text-sm font-bold tracking-widest" style={{ color: "#1e1a3c" }}>
            COCOSiL
          </span>
        </div>

        {/* ヒーロー */}
        <div className="flex flex-col items-center text-center">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "#a78bfa" }}
          >
            Know Yourself
          </p>
          <h1 className="text-4xl font-black leading-tight mb-5">
            自分を知って、<br />ラクになる。
          </h1>
          <p className="text-sm leading-7 mb-2" style={{ color: "#5c5878" }}>
            4つの性格分析とAIとの対話から、<br />
            根拠のある“あなたのトリセツ”を。
          </p>
          <p className="text-sm font-bold leading-7" style={{ color: "#1e1a3c" }}>
            自分が分かると、人間関係も少しラクになる。
          </p>
        </div>

        {/* ヒーロー画像（端を放射状フェードで bg-aurora に溶け込ませる） */}
        <div className="flex items-center justify-center my-10">
          <img
            src="/lp-hero.png"
            alt=""
            className="w-full max-w-[280px]"
            style={{
              WebkitMaskImage:
                "radial-gradient(circle at center, #000 60%, transparent 92%)",
              maskImage:
                "radial-gradient(circle at center, #000 60%, transparent 92%)",
            }}
          />
        </div>

        {/* 体験の流れ（共感→安心→分析→行動） */}
        <section className="mb-12">
          <p
            className="text-xs font-semibold tracking-[0.15em] mb-5"
            style={{ color: "#a78bfa" }}
          >
            ここで起きること
          </p>
          <ol className="flex flex-col">
            {JOURNEY.map((step, i) => (
              <li key={step.label} className="flex gap-4">
                {/* 番号バッジ＋コネクタ */}
                <div className="flex flex-col items-center">
                  <div
                    className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      width: 32,
                      height: 32,
                      background: "rgba(167,139,250,0.12)",
                      color: "#7c5cfc",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  {i < JOURNEY.length - 1 && (
                    <div className="flex-1 w-px my-1" style={{ background: "#ede9f8" }} />
                  )}
                </div>
                {/* テキスト */}
                <div className="pb-6">
                  <p className="text-base font-bold leading-tight">{step.label}</p>
                  <p className="text-sm mt-1" style={{ color: "#7b7b9d" }}>
                    {step.note}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 4体系 */}
        <section className="mb-12">
          <p
            className="text-xs font-semibold tracking-[0.15em] mb-5"
            style={{ color: "#a78bfa" }}
          >
            4つの視点であなたを分析
          </p>
          <div
            className="rounded-2xl p-5"
            style={{
              background: "#fff",
              border: "1.5px solid #ede9f8",
              boxShadow: "0 1px 4px rgba(124,92,252,0.06)",
            }}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {SYSTEMS.map(({ Icon, label, note }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 48, height: 48, background: "rgba(167,139,250,0.12)" }}
                  >
                    <Icon width={30} height={30} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight">{label}</p>
                    <p className="text-xs mt-0.5 leading-tight" style={{ color: "#7b7b9d" }}>
                      {note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-auto flex flex-col gap-4 items-center">
          <Link
            href="/onboarding"
            className="btn-press w-full flex items-center justify-center h-14 rounded-full font-bold text-base text-white"
            style={{
              background: "linear-gradient(135deg, #7c5cfc, #a78bfa)",
              boxShadow: "0 4px 20px rgba(124,92,252,0.4)",
            }}
          >
            Googleではじめる
          </Link>
          <button
            type="button"
            className="text-sm underline underline-offset-2"
            style={{ color: "#7b7b9d" }}
          >
            メールアドレスで登録
          </button>
        </div>
      </div>
    </div>
  );
}
