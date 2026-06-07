"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEYS } from "@/lib/sessionKeys";
import { KnowMarker } from "@/components/report/KnowMarker";
import { SatisfactionSurvey } from "@/components/report/SatisfactionSurvey";
import {
  OBSERVATION_AXES,
  type ObservationAxisId,
} from "@/lib/constitution/observation-axes";
import { gradientBtnStyle } from "@/lib/ui";
import type {
  GenerateReportResponse,
  ReportContent,
} from "@/lib/reports/schemas";

// 5観察軸のモバイル短縮ラベル（テーブル左カラムの折り返し崩壊を防ぐ）
const AXIS_SHORT_LABEL: Record<ObservationAxisId, string> = {
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

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1.5px solid #ede9f8",
  borderRadius: 16,
  padding: "16px 18px",
};

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

    // MBTI A/T 軸（未設定時は中立 T）。ProfileCore の入力一意化に使う。
    const identityRaw = sessionStorage.getItem(SESSION_KEYS.MBTI_IDENTITY);
    const identity = identityRaw === "A" ? "A" : "T";

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
        identity,
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

  return (
    <div className="bg-aurora flex flex-col min-h-dvh" style={{ color: "#1e1a3c" }}>
      <main className="content-col flex-1 flex flex-col px-5 pt-10 pb-6 gap-7">
        {/* キャッチフレーズ（命名・決定論） */}
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

        {/* 共感の素材: 4つの視点（4体系テーブル） */}
        <section>
          <SectionHeading>4つの視点</SectionHeading>
          <RowTable rows={lightRows} />
        </section>

        {/* 安心①: あなたの強み（強み先） */}
        {content.strengths.length > 0 && (
          <section>
            <SectionHeading>あなたの強み</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {content.strengths.map((s, i) => (
                <div key={i} style={cardStyle}>
                  <p
                    style={{
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: "#7c5cfc",
                      margin: "0 0 6px",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.label}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "#1e1a3c", margin: 0 }}>
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 安心②: 気をつけたい癖（弱み後置・出口付き） */}
        <section>
          <SectionHeading>気をつけたい癖</SectionHeading>
          <div style={cardStyle}>
            <p style={{ fontSize: 14.5, fontWeight: 800, color: "#1e1a3c", margin: "0 0 12px", lineHeight: 1.6 }}>
              {content.weakness.trait}
            </p>
            <div
              style={{
                background: "rgba(124,92,252,0.06)",
                border: "1px solid rgba(124,92,252,0.18)",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <p style={{ fontSize: 11.5, fontWeight: 700, color: "#7c5cfc", margin: "0 0 4px", letterSpacing: "0.04em" }}>
                ちょっとした出口
              </p>
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#1e1a3c", margin: 0 }}>
                {content.weakness.exit}
              </p>
            </div>
          </div>
        </section>

        {/* 観の山場: 統合像（識・AC-1） */}
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

        {/* 分析①: あなたが知らない強み（ジョハリ盲点） */}
        {content.johari.length > 0 && (
          <section>
            <SectionHeading>あなたが知らない強み</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {content.johari.map((j) => (
                <div key={j.sourceAxis} style={cardStyle}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: "#7c5cfc", margin: "0 0 4px" }}>
                    {OBSERVATION_AXES[j.sourceAxis].label_ja}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "#1e1a3c", margin: 0 }}>
                    {j.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 分析②: 傾向の位置（設計上の理論分布） */}
        {content.distribution.length > 0 && (
          <section>
            <SectionHeading>傾向の位置</SectionHeading>
            <RowTable
              rows={content.distribution.map((d) => ({
                key: d.axis,
                label: AXIS_SHORT_LABEL[d.axis] ?? OBSERVATION_AXES[d.axis].label_ja,
                text: d.comment,
              }))}
            />
            <p style={{ fontSize: 11, color: "#a39fc0", margin: "8px 4px 0", lineHeight: 1.6 }}>
              ※ COCOSiLの設計上の理論分布での位置です（一般の人口分布ではありません）。
            </p>
          </section>
        )}

        {/* 行動の入口: 大切な人との関係（AC-2） */}
        {content.relational_hint && (
          <section>
            <SectionHeading>大切な人との関係</SectionHeading>
            <div style={cardStyle}>
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

        {/* 行動: おわりに（背景に溶け込むベタ打ち） */}
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
