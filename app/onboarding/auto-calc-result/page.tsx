"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEYS } from "@/lib/sessionKeys";
import { StepDots } from "@/components/StepDots";
import { getMaxReached, markStepReached } from "@/lib/stepProgress";
import { gradientBtnStyle } from "@/lib/ui";
import type { AutoCalcResponse } from "@/app/api/diagnosis/auto-calc/route";
import { ZODIAC_EMOJI, ZODIAC_DESCRIPTIONS } from "@/app/_data/zodiac-descriptions";
import { ANIMAL_EMOJI, ANIMAL_DESCRIPTIONS } from "@/app/_data/animal-descriptions";
import { SIX_STAR_DESCRIPTIONS } from "@/app/_data/six-star-descriptions";

type AutoCalcResult = NonNullable<AutoCalcResponse["result"]>;

function formatSixStar(sixStar: string): string {
  return sixStar.replace("+", "（＋）").replace("-", "（−）");
}

function getAnimalEmoji(animalType: string): string {
  for (const [key, emoji] of Object.entries(ANIMAL_EMOJI)) {
    if (animalType.includes(key)) return emoji;
  }
  return "🦋";
}

function getSixStarDescription(sixStar: string): string {
  return SIX_STAR_DESCRIPTIONS[sixStar] ?? SIX_STAR_DESCRIPTIONS[sixStar.split("（")[0]] ?? "自分らしさを大切にするタイプです";
}

function getAnimalDescription(animalCharacter: string): string {
  return ANIMAL_DESCRIPTIONS[animalCharacter] ?? ANIMAL_DESCRIPTIONS.default;
}

// 星座SVGアイコン（シンプルな円＋星）
function ZodiacIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#a78bfa" strokeWidth="1.5" fill="rgba(167,139,250,0.08)"/>
      <circle cx="24" cy="24" r="3" fill="#a78bfa"/>
      <circle cx="24" cy="10" r="2" fill="#c4b5fd"/>
      <circle cx="24" cy="38" r="2" fill="#c4b5fd"/>
      <circle cx="10" cy="24" r="2" fill="#c4b5fd"/>
      <circle cx="38" cy="24" r="2" fill="#c4b5fd"/>
      <circle cx="14" cy="14" r="1.5" fill="#ddd6fe"/>
      <circle cx="34" cy="14" r="1.5" fill="#ddd6fe"/>
      <circle cx="14" cy="34" r="1.5" fill="#ddd6fe"/>
      <circle cx="34" cy="34" r="1.5" fill="#ddd6fe"/>
    </svg>
  );
}

// 動物SVGアイコン（足跡）
function AnimalIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#a78bfa" strokeWidth="1.5" fill="rgba(167,139,250,0.08)"/>
      <ellipse cx="24" cy="28" rx="8" ry="6" fill="#c4b5fd"/>
      <ellipse cx="16" cy="20" rx="3.5" ry="4.5" fill="#c4b5fd"/>
      <ellipse cx="32" cy="20" rx="3.5" ry="4.5" fill="#c4b5fd"/>
      <ellipse cx="20" cy="15" rx="2.5" ry="3" fill="#ddd6fe"/>
      <ellipse cx="28" cy="15" rx="2.5" ry="3" fill="#ddd6fe"/>
    </svg>
  );
}

// 六星SVGアイコン（中心の自己＋正六角形に並ぶ6つの星）
function SixStarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#a78bfa" strokeWidth="1.5" fill="rgba(167,139,250,0.08)"/>
      <g stroke="#ddd6fe" strokeWidth="0.75">
        <line x1="24" y1="24" x2="24" y2="9" />
        <line x1="24" y1="24" x2="37" y2="16.5" />
        <line x1="24" y1="24" x2="37" y2="31.5" />
        <line x1="24" y1="24" x2="24" y2="39" />
        <line x1="24" y1="24" x2="11" y2="31.5" />
        <line x1="24" y1="24" x2="11" y2="16.5" />
      </g>
      <circle cx="24" cy="9" r="2.5" fill="#7c5cfc" />
      <circle cx="37" cy="16.5" r="2.5" fill="#c4b5fd" />
      <circle cx="37" cy="31.5" r="2.5" fill="#c4b5fd" />
      <circle cx="24" cy="39" r="2.5" fill="#c4b5fd" />
      <circle cx="11" cy="31.5" r="2.5" fill="#c4b5fd" />
      <circle cx="11" cy="16.5" r="2.5" fill="#c4b5fd" />
      <circle cx="24" cy="24" r="5.5" fill="#a78bfa" />
    </svg>
  );
}

export default function AutoCalcResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AutoCalcResult | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [maxReached, setMaxReached] = useState(0);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    markStepReached(2);
    setMaxReached(getMaxReached());
    const stored = sessionStorage.getItem(SESSION_KEYS.AUTO_CALC_RESULT);
    const bd = sessionStorage.getItem(SESSION_KEYS.BIRTH_DATE);
    if (!stored) {
      router.replace("/onboarding/birthdate");
      return;
    }
    try {
      setResult(JSON.parse(stored));
      setBirthDate(bd);
      setTimeout(() => setVisible(true), 80);
    } catch {
      router.replace("/onboarding/birthdate");
    }
  }, [router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!result) return null;

  // 生年月日を「YYYY年MM月DD日」形式に整形
  const formattedBirthDate = birthDate
    ? (() => {
        const [y, m, d] = birthDate.split("-");
        return `${y}年${Number(m)}月${Number(d)}日`;
      })()
    : null;

  const cards = [
    {
      label: "12星座",
      icon: <ZodiacIcon />,
      emoji: ZODIAC_EMOJI[result.zodiacSign] ?? "⭐",
      name: result.zodiacSign,
      description: ZODIAC_DESCRIPTIONS[result.zodiacSign] ?? "独自の魅力を持つタイプです",
    },
    {
      label: "60アニマル診断",
      icon: <AnimalIcon />,
      emoji: getAnimalEmoji(result.animalType),
      name: result.animalCharacter,
      sub: result.animalType,
      description: getAnimalDescription(result.animalCharacter),
    },
    {
      label: "六星占術",
      icon: <SixStarIcon />,
      emoji: "🌠",
      name: formatSixStar(result.sixStar),
      description: getSixStarDescription(result.sixStar),
    },
  ];

  return (
    <div
      className="bg-aurora flex flex-col min-h-dvh"
      style={{ color: "#1e1a3c" }}
    >
      <main className="content-col flex-1 flex flex-col px-5 pt-12 pb-4">
        <StepDots current={2} maxReached={maxReached} />

        {/* ヘッダー */}
        <h1
          className="text-3xl font-black leading-snug mb-2"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          3つの診断結果が<br />出そろいました
        </h1>

        {/* 生年月日 */}
        {formattedBirthDate && (
          <p
            className="text-sm mb-6"
            style={{
              color: "#7b7b9d",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.4s ease 0.1s",
            }}
          >
            {formattedBirthDate}生まれのあなたの診断結果
          </p>
        )}

        {/* 診断カード */}
        <div className="flex flex-col gap-3">
          {cards.map((card, i) => (
            <div
              key={card.label}
              className="btn-press flex items-center gap-4 rounded-2xl px-5 py-5"
              style={{
                background: "#fff",
                border: "1.5px solid #ede9f8",
                boxShadow: "0 1px 6px rgba(124,92,252,0.07)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.45s ease ${0.15 + i * 0.1}s, transform 0.45s ease ${0.15 + i * 0.1}s`,
              }}
            >
              {/* アイコン */}
              <div className="shrink-0">
                {card.icon}
              </div>
              {/* テキスト */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: "#7c5cfc", letterSpacing: "0.04em" }}
                >
                  {card.label}
                </p>
                <p className="text-2xl font-black text-[#1e1a3c] leading-tight">
                  {card.name}
                </p>
                <p className="text-xs text-[#7b7b9d] mt-1 leading-relaxed">
                  {card.description.split("。").filter(Boolean).map((s, i, arr) => (
                    <span key={i}>
                      {s}。
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* CTAボタン */}
      <div
        className="content-col px-5 pb-10 pt-2"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease 0.55s",
        }}
      >
        <p className="text-sm text-center text-[#9998bb] mb-4">
          続いて、MBTIについてお聞きします
        </p>
        <button
          type="button"
          onClick={() => router.push("/diagnosis/mbti/know-check")}
          className="btn-press w-full h-14 rounded-full text-base font-bold text-white"
          style={gradientBtnStyle}
        >
          MBTIについて答える
        </button>
      </div>
    </div>
  );
}
