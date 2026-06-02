"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEYS } from "@/lib/sessionKeys";
import { KnowMarker } from "@/components/report/KnowMarker";
import { SatisfactionSurvey } from "@/components/report/SatisfactionSurvey";
import { OBSERVATION_AXES } from "@/lib/constitution/observation-axes";
import { gradientBtnStyle } from "@/lib/ui";
import type {
  GenerateReportResponse,
  ReportContent,
  AxisManifestation,
} from "@/lib/reports/schemas";

// 5観察軸のモバイル短縮ラベル（テーブル左カラムの折り返し崩壊を防ぐ）
const AXIS_SHORT_LABEL: Record<AxisManifestation["axisKey"], string> = {
  embodied_pattern: "からだ",
  emotional_response: "感じ方",
  cognitive_style: "考え方",
  motivation_drive: "動機",
  relational_mode: "人との距離",
};

interface ReportState {
  reportId?: string;
  content?: ReportContent;
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

/** 2カラムの行テーブル。左ラベルは固定幅、右は可変（モバイル縦長で崩れない）。 */
function RowTable({ rows }: { rows: { key: string; label: string; text: string }[] }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #ede9f8",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {rows.map((row, i) => (
        <div
          key={row.key}
          style={{
            display: "flex",
            gap: 12,
            padding: "14px 16px",
            borderTop: i === 0 ? "none" : "1px solid #f1ecfa",
          }}
        >
          <div
            style={{
              flex: "0 0 76px",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#7c5cfc",
              lineHeight: 1.5,
              paddingTop: 2,
            }}
          >
            {row.label}
          </div>
          <div style={{ flex: 1, fontSize: 14, lineHeight: 1.7, color: "#1e1a3c" }}>
            {row.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#7c5cfc",
        letterSpacing: "0.08em",
        margin: "0 0 8px 4px",
      }}
    >
      {children}
    </p>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [state, setState] = useState<ReportState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
        setState({ reportId: data.reportId, content: data.content });
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

  const { reportId, content } = state;

  const lightRows = content.four_lights.map((light) => ({
    key: light.system,
    label: light.label,
    text: light.reading,
  }));

  const axisRows = content.integration.map((axis) => ({
    key: axis.axisKey,
    label: AXIS_SHORT_LABEL[axis.axisKey] ?? OBSERVATION_AXES[axis.axisKey].label_ja,
    text: axis.manifestation,
  }));

  return (
    <div className="bg-aurora flex flex-col min-h-dvh" style={{ color: "#1e1a3c" }}>
      <main className="content-col flex-1 flex flex-col px-5 pt-10 pb-6 gap-7">
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

        {/* 4つの視点（4体系テーブル） */}
        <section>
          <SectionHeading>4つの視点</SectionHeading>
          <RowTable rows={lightRows} />
        </section>

        {/* 統合力（5観察軸テーブル） */}
        <section>
          <SectionHeading>統合力</SectionHeading>
          <RowTable rows={axisRows} />
        </section>

        {/* 統合像（識・文章・観の山場） */}
        <section>
          <SectionHeading>あなたという人</SectionHeading>
          <div
            style={{
              background: "rgba(124,92,252,0.05)",
              border: "1.5px solid #e6def8",
              borderRadius: 16,
              padding: "20px 20px 16px",
            }}
          >
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.85,
                color: "#1e1a3c",
                margin: "0 0 12px",
                whiteSpace: "pre-wrap",
              }}
            >
              {content.core}
            </p>
            {reportId && (
              <KnowMarker
                reportId={reportId}
                sectionId="core"
                sectionText={content.core.slice(0, 200)}
              />
            )}
          </div>
        </section>

        {/* 大切な人との関係 */}
        {content.relational_hint && (
          <section>
            <SectionHeading>大切な人との関係</SectionHeading>
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #ede9f8",
                borderRadius: 16,
                padding: "20px 20px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "#1e1a3c",
                  margin: "0 0 12px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {content.relational_hint}
              </p>
              {reportId && (
                <KnowMarker
                  reportId={reportId}
                  sectionId="relational_hint"
                  sectionText={content.relational_hint.slice(0, 200)}
                />
              )}
            </div>
          </section>
        )}

        {/* おわりに（背景に溶け込むベタ打ち） */}
        {content.closing && (
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.8,
              color: "#8a85a6",
              margin: "0 4px",
              whiteSpace: "pre-wrap",
            }}
          >
            {content.closing}
          </p>
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
