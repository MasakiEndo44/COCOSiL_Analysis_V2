"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEYS } from "@/lib/sessionKeys";
import { KnowMarker } from "@/components/report/KnowMarker";
import { SatisfactionSurvey } from "@/components/report/SatisfactionSurvey";
import { buildFallbackSections } from "@/lib/reports/markdown-fallback";
import { gradientBtnStyle } from "@/lib/ui";
import type { GenerateReportResponse, ReportContent } from "@/lib/reports/schemas";

const SECTION_LABELS: Record<string, string> = {
  catchphrase: "あなたという人",
  opening: "はじめに",
  four_lights: "4つの視点",
  integration: "統合像",
  relational_hint: "大切な人との関係",
  closing: "おわりに",
};

interface ReportState {
  reportId?: string;
  reportUrl?: string;
  content?: ReportContent;
  fallback: boolean;
}

function LoadingOrb() {
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7c5cfc, #a78bfa)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [state, setState] = useState<ReportState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const birthDate = sessionStorage.getItem(SESSION_KEYS.BIRTH_DATE);
    const mbtiType = sessionStorage.getItem(SESSION_KEYS.MBTI_TYPE);
    const autoCalcRaw = sessionStorage.getItem(SESSION_KEYS.AUTO_CALC_RESULT);

    if (!birthDate || !mbtiType || !autoCalcRaw) {
      router.replace("/onboarding/birthdate");
      return;
    }

    let autoCalc: { zodiacSign: string; animalType: string; animalCharacter: string; sixStar: string };
    try {
      autoCalc = JSON.parse(autoCalcRaw);
    } catch {
      router.replace("/onboarding/birthdate");
      return;
    }

    fetch("/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate,
        mbtiType,
        animalCharacter: autoCalc.animalCharacter,
        animalType: autoCalc.animalType,
        zodiacSign: autoCalc.zodiacSign,
        sixStar: autoCalc.sixStar,
      }),
    })
      .then((r) => r.json())
      .then((data: GenerateReportResponse) => {
        if (!data.success || !data.content) {
          setError(data.error ?? "レポートの生成に失敗しました。もう一度試してみてください。");
          return;
        }
        setState({
          reportId: data.reportId,
          reportUrl: data.reportUrl,
          content: data.content,
          fallback: data.fallback ?? false,
        });
      })
      .catch(() => {
        setError("ネットワークエラーが発生しました。もう一度試してみてください。");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div
        className="bg-aurora flex flex-col min-h-dvh items-center justify-center gap-8"
        style={{ color: "#1e1a3c" }}
      >
        <LoadingOrb />
        <p style={{ fontSize: 16, color: "#7b7b9d" }}>レポートを生成しています…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-aurora flex flex-col min-h-dvh items-center justify-center px-6 gap-6"
        style={{ color: "#1e1a3c" }}
      >
        <p style={{ textAlign: "center", fontSize: 15 }}>{error}</p>
        <button
          type="button"
          onClick={() => { setError(null); setLoading(true); calledRef.current = false; }}
          className="btn-press w-full h-14 rounded-full text-base font-bold text-white"
          style={{ ...gradientBtnStyle, maxWidth: 340 }}
        >
          もう一度試す
        </button>
      </div>
    );
  }

  if (!state?.content) return null;

  const { reportId, reportUrl, content, fallback } = state;
  const sections = buildFallbackSections(content);

  return (
    <div
      className="bg-aurora flex flex-col min-h-dvh"
      style={{ color: "#1e1a3c" }}
    >
      <main className="content-col flex-1 flex flex-col px-5 pt-10 pb-6 gap-6">
        {/* キャッチフレーズ */}
        {content.catchphrase && (
          <div style={{ textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                fontSize: 18,
                fontWeight: 800,
                color: "#7c5cfc",
                padding: "10px 20px",
                background: "rgba(124,92,252,0.08)",
                borderRadius: 32,
              }}
            >
              {content.catchphrase}
            </span>
          </div>
        )}

        {/* OG画像（あれば優先表示） */}
        {reportUrl && !fallback && (
          <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(124,92,252,0.12)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reportUrl}
              alt="統合レポート"
              width={1024}
              height={1792}
              style={{ width: "100%", height: "auto", display: imgLoaded ? "block" : "none" }}
              onLoad={() => setImgLoaded(true)}
            />
            {!imgLoaded && (
              <div style={{ background: "#f5f0ff", height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LoadingOrb />
              </div>
            )}
          </div>
        )}

        {/* フォールバック: セクション別テキスト表示 */}
        {(fallback || !reportUrl) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sections.map((section) => (
              <div
                key={section.id}
                style={{
                  background: section.id === "integration" ? "rgba(124,92,252,0.05)" : "#fff",
                  border: "1.5px solid #ede9f8",
                  borderRadius: 16,
                  padding: "20px 20px 16px",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#7c5cfc",
                    letterSpacing: "0.08em",
                    margin: "0 0 8px",
                  }}
                >
                  {SECTION_LABELS[section.id] ?? section.label}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "#1e1a3c",
                    margin: "0 0 12px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {section.text}
                </p>
                {reportId && (
                  <KnowMarker
                    reportId={reportId}
                    sectionId={section.id}
                    sectionText={section.text.slice(0, 200)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 満足度アンケート (F3.4) */}
        {reportId && (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #ede9f8",
              borderRadius: 16,
              padding: "24px 20px",
            }}
          >
            <SatisfactionSurvey reportId={reportId} />
          </div>
        )}

        {/* 次へ導線 */}
        <div style={{ paddingBottom: 16 }}>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="btn-press w-full h-14 rounded-full text-base font-bold text-white"
            style={gradientBtnStyle}
          >
            ホームへ
          </button>
        </div>
      </main>
    </div>
  );
}
