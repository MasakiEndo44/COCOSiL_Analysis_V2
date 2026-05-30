"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import type { MbtiResult } from "../types";
import { MBTI_TYPE_DESCRIPTIONS, MBTI_AXES_DATA } from "@/app/_data/mbti-descriptions";

interface Props {
  result: MbtiResult;
}


export function MbtiResultView({ result }: Props) {
  const router = useRouter();
  const desc = MBTI_TYPE_DESCRIPTIONS[result.mbtiType];
  const [openAxes, setOpenAxes] = useState<Set<string>>(new Set());
  // false = ファーストビューパネル, true = 詳細パネルが前面
  const [revealed, setRevealed] = useState(false);

  // マウント時: スクロールロック + 親 paddingTop リセット
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.body.style.overflow = "hidden";
    const shell = document.querySelector<HTMLElement>(".mbti-page-shell");
    const prev = shell?.style.paddingTop ?? "";
    if (shell) shell.style.paddingTop = "0";
    return () => {
      document.body.style.overflow = "";
      if (shell) shell.style.paddingTop = prev;
    };
  }, []);

  // revealed になったらスクロールロック解除（詳細パネルが前面に出た後）
  useEffect(() => {
    if (revealed) {
      document.body.style.overflow = "";
      // スクロールバーを表示（CSS変数リセット）
      document.documentElement.style.removeProperty("--scrollbar-color");
    }
  }, [revealed]);

  useEffect(() => {
    posthog.capture("mbti_result_viewed", { mbti_type: result.mbtiType });
  }, [result.mbtiType]);

  const handleRetry = () => {
    posthog.capture("mbti_quiz_retried", { mbti_type: result.mbtiType });
    window.location.reload();
  };

  function toggleAxis(key: string) {
    setOpenAxes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function scrollToDetail() {
    // スクロールバーをアニメーション中は非表示
    document.documentElement.style.setProperty("--scrollbar-color", "transparent");
    // CSS トランジション（0.9s）で詳細パネルをスライドイン
    // トランジション完了後に revealed = true → スクロール解放
    setRevealed(true);
  }

  // キラキラパーティクル — ダイヤ型が拡大→消えるポップアニメ
  // size: ダイヤの最大サイズ(px), dur: アニメ周期(s), d: delay(s), c: 色index
  const sparkles = [
    { x: 8,  y: 14, size: 14, dur: 1.6, d: 0.0, c: 0 },
    { x: 82, y: 9,  size: 10, dur: 1.4, d: 0.4, c: 1 },
    { x: 20, y: 68, size: 12, dur: 1.8, d: 0.7, c: 2 },
    { x: 68, y: 62, size: 8,  dur: 1.5, d: 1.1, c: 0 },
    { x: 48, y: 8,  size: 16, dur: 1.7, d: 0.2, c: 1 },
    { x: 90, y: 42, size: 10, dur: 1.4, d: 0.9, c: 2 },
    { x: 6,  y: 52, size: 13, dur: 1.9, d: 0.5, c: 1 },
    { x: 58, y: 80, size: 9,  dur: 1.5, d: 1.3, c: 0 },
    { x: 35, y: 32, size: 11, dur: 1.6, d: 0.6, c: 2 },
    { x: 74, y: 25, size: 14, dur: 1.4, d: 0.8, c: 0 },
    { x: 18, y: 88, size: 9,  dur: 1.7, d: 0.1, c: 1 },
    { x: 91, y: 76, size: 12, dur: 1.5, d: 1.4, c: 2 },
    { x: 42, y: 55, size: 8,  dur: 1.8, d: 0.3, c: 0 },
    { x: 63, y: 18, size: 11, dur: 1.6, d: 1.0, c: 1 },
    { x: 30, y: 45, size: 15, dur: 1.4, d: 0.5, c: 2 },
  ];
  const sparkleColors = ["#7c5cfc", "#a78bfa", "#e879f9"];

  return (
    <>
      {/* ── ファーストビューパネル ── */}
      <div className={`mbti-panel-first${revealed ? " revealed" : ""}`}>
        {/* キラキラパーティクル — トランプのダイヤ型が拡大→急消え */}
        {sparkles.map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${s.x}%`, top: `${s.y}%`,
            animation: `mbti-sparkle ${s.dur}s ease-in-out ${s.d}s infinite`,
            pointerEvents: "none",
            opacity: 0,
          }}>
            {/* トランプのダイヤ形状: 縦長菱形 */}
            <svg
              width={s.size * 0.75}
              height={s.size}
              viewBox="0 0 12 16"
              fill={sparkleColors[s.c]}
              style={{ display: "block", filter: `drop-shadow(0 0 ${s.size * 0.3}px ${sparkleColors[s.c]}88)` }}
            >
              <path d="M6 0 L12 8 L6 16 L0 8 Z"/>
            </svg>
          </div>
        ))}

        {/* 完了バッジ */}
        <div className="mbti-fi-badge" style={{ marginBottom: "1.25rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(124,92,252,0.1)", border: "1.5px solid rgba(124,92,252,0.25)",
            borderRadius: 999, padding: "0.35rem 1rem",
            fontSize: "0.78rem", fontWeight: 700, color: "#7c5cfc", letterSpacing: "0.04em",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#7c5cfc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            診断完了
          </div>
        </div>

        {/* タイトル */}
        <h1 className="mbti-fi-title" style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1e1a3c", letterSpacing: "-0.01em", textAlign: "center", margin: 0 }}>
          お疲れさまでした
        </h1>
        <p className="mbti-fi-sub" style={{ fontSize: "0.85rem", color: "#7b7b9d", marginTop: "0.5rem", marginBottom: "3.5rem", textAlign: "center" }}>
          あなたのMBTI結果がまとまりました。
        </p>

        {/* 結果を見るボタン */}
        <button
          type="button"
          onClick={scrollToDetail}
          className="mbti-fi-btn"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem 1.5rem",
          }}
        >
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "#7c5cfc", letterSpacing: "-0.01em" }}>
            診断結果を見る
          </span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <svg className="mbti-scroll-ch1" width="28" height="15" viewBox="0 0 28 15" fill="none">
              <path d="M2 2l12 11L26 2" stroke="#7c5cfc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg className="mbti-scroll-ch2" width="28" height="15" viewBox="0 0 28 15" fill="none">
              <path d="M2 2l12 11L26 2" stroke="#7c5cfc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      </div>

      {/* ── 詳細パネル ── */}
      <div className={`mbti-panel-detail${revealed ? " revealed" : ""}`}>
        <div style={{ width: "100%", maxWidth: 520, margin: "0 auto", padding: "2rem 1.25rem 2.5rem" }}>

          {/* タイプカード */}
          <div style={{
            background: "linear-gradient(150deg, #7c5cfc 0%, #a78bfa 55%, #e879f9 100%)",
            borderRadius: 24,
            marginBottom: "1.25rem",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(124,92,252,0.35)",
          }}>
            {/* 背景装飾: 光の輪 */}
            <div style={{
              position: "absolute", top: -50, right: -50,
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -40, left: -20,
              width: 160, height: 160, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />

            <div style={{ padding: "1.75rem 1.75rem 1.5rem", position: "relative", zIndex: 1 }}>
              {/* ラベルテキスト */}
              <div style={{
                fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.8)",
                letterSpacing: "0.06em", marginBottom: "0.75rem",
              }}>
                あなたのMBTIタイプ
              </div>

              {/* タイプ文字 + 名前を横並び */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", marginBottom: "1rem" }}>
                <span style={{
                  fontSize: "5rem", fontWeight: 900, letterSpacing: "0.04em", lineHeight: 1,
                  color: "#fff",
                  textShadow: "0 2px 20px rgba(255,255,255,0.3)",
                }}>
                  {result.mbtiType}
                </span>
                <div style={{ paddingBottom: "0.5rem" }}>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                    {desc?.name ?? ""}
                  </div>
                </div>
              </div>

              {/* 区切り線 */}
              <div style={{
                height: 1,
                background: "rgba(255,255,255,0.25)",
                marginBottom: "1rem",
              }} />

              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: 0 }}>
                {desc?.description ?? "あなた独自の視点と強みを持つタイプです。"}
              </p>
            </div>
          </div>

          {/* 各軸セクション見出し */}
          <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <rect x="3" y="3" width="4" height="18" rx="2" fill="#7c5cfc"/>
                <rect x="10" y="8" width="4" height="13" rx="2" fill="#a78bfa"/>
                <rect x="17" y="5" width="4" height="16" rx="2" fill="#c4b5fd"/>
              </svg>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: "#1e1a3c" }}>あなたの傾向</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#b0aec8", paddingLeft: "2.25rem" }}>
              各項目をタップすると、くわしい説明が見られます。
            </p>
          </div>

          {/* 各軸カード（アコーディオン） */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
            {MBTI_AXES_DATA.map((axis) => {
              const score = result.scores[axis.key];
              // score: 3〜15 (3問×1〜5)、中央=9
              // バックエンド logic.ts と同じ判定:
              //   score > 9 → 左（E/S/T/J）  score ≤ 9 → 右（I/N/F/P）
              //
              // ドット index 0〜4（左端=0, 右端=4, 中央=2）:
              //   中央(score=9)でも "わずかに右" の dot[3] を使い、常にどちらかに寄せる。
              //   左(E/S/T/J): score 10-11→dot[1], 12-15→dot[0]
              //   右(I/N/F/P): score  9   →dot[3], 6-8→dot[3], 3-5→dot[4]
              //   ※ dot[2](中央)は表示しない → 必ずどちらかの側を示す
              //
              // PCI分布の実態（3問×1〜5）:
              //   score 9: PCI 0%(tie) → 右の1段目(dot[3])
              //   score 8or10: PCI 17% → 右/左の1段目(dot[3]/dot[1])
              //   score 7or11: PCI 33% → 右/左の1段目(dot[3]/dot[1])
              //   score 6or12: PCI 50% → 右/左の2段目(dot[4]/dot[0])
              //   score 3-5or13-15: PCI 67-100% → 右/左の2段目(dot[4]/dot[0])
              const isLeft = score > 9; // バックエンドと同じ判定（score=9はI/N/F/P=右）
              const dotIndex = (() => {
                if (isLeft) return score >= 12 ? 0 : 1; // 強い左 or 中程度左
                return score <= 6 ? 4 : 3;              // 強い右 or 中程度右(score9含む)
              })();

              // ドット位置(%) — 5個、中央=50%起点で左右対称
              const DOT_POSITIONS = [0, 25, 50, 75, 100] as const;
              const activePos = DOT_POSITIONS[dotIndex];
              const lineLeft = Math.min(50, activePos);
              const lineRight = Math.max(50, activePos);
              const isLeftSide = activePos < 50;

              const dominant = isLeft ? axis.left : axis.right;
              const resultNote = isLeft
                ? axis.resultNote[axis.left.letter as keyof typeof axis.resultNote]
                : axis.resultNote[axis.right.letter as keyof typeof axis.resultNote];
              const isOpen = openAxes.has(axis.key);

              return (
                <div key={axis.key} style={{
                  background: "#fff",
                  border: isOpen ? "1.5px solid rgba(124,92,252,0.3)" : "1.5px solid #ede9f8",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: isOpen ? "0 4px 16px rgba(124,92,252,0.1)" : "0 1px 4px rgba(124,92,252,0.05)",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}>
                  <button
                    type="button"
                    onClick={() => toggleAxis(axis.key)}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      cursor: "pointer", padding: "0.85rem 1rem",
                      display: "flex", flexDirection: "column", gap: "0.55rem", textAlign: "left",
                    }}
                  >
                    {/* 上段：診断完了バッジ同スタイルのラベル + chevron */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: "rgba(124,92,252,0.1)",
                        border: "1.5px solid rgba(124,92,252,0.25)",
                        borderRadius: 999,
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.75rem", fontWeight: 700, color: "#7c5cfc", letterSpacing: "0.04em",
                      }}>
                        {axis.question}
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        style={{ flexShrink: 0, transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        <path d="M6 9l6 6 6-6" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {/* 下段：左ラベル ── ドットバー ── 右ラベル */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {/* 左ラベル */}
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: isLeft ? 700 : 400,
                        color: isLeft ? "#7c5cfc" : "#c4b5fd",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        minWidth: "3.5rem",
                      }}>
                        {axis.left.letter} {axis.left.label}
                      </span>
                      {/* ドットバー */}
                      <div style={{ position: "relative", height: 32, flex: 1 }}>
                        {/* ベースライン */}
                        <div style={{
                          position: "absolute",
                          top: "50%", transform: "translateY(-50%)",
                          left: 0, right: 0,
                          height: 3, background: "#ede9f8", borderRadius: 999,
                        }} />
                        {/* グラデーションライン */}
                        <div style={{
                          position: "absolute",
                          top: "50%", transform: "translateY(-50%)",
                          left: `${lineLeft}%`,
                          width: `${lineRight - lineLeft}%`,
                          height: 3,
                          background: isLeftSide
                            ? "linear-gradient(90deg, #a78bfa, #7c5cfc)"
                            : "linear-gradient(90deg, #7c5cfc, #a78bfa)",
                          borderRadius: 999,
                        }} />
                        {/* 5つのドット: 中央50%対称配置 */}
                        {DOT_POSITIONS.map((pos, idx) => {
                          const isActive = idx === dotIndex;
                          const isFilled = isLeftSide
                            ? idx >= dotIndex && idx <= 2
                            : idx >= 2 && idx <= dotIndex;
                          return (
                            <div key={idx} style={{
                              position: "absolute",
                              top: "50%",
                              left: `${pos}%`,
                              transform: "translate(-50%, -50%)",
                              width: isActive ? 14 : 8,
                              height: isActive ? 14 : 8,
                              borderRadius: "50%",
                              background: isActive
                                ? "linear-gradient(135deg, #7c5cfc, #a78bfa)"
                                : isFilled ? "rgba(124,92,252,0.35)" : "#e8e4f8",
                              boxShadow: isActive ? "0 0 0 3px rgba(124,92,252,0.18)" : "none",
                              zIndex: 1,
                            }} />
                          );
                        })}
                      </div>
                      {/* 右ラベル */}
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: !isLeft ? 700 : 400,
                        color: !isLeft ? "#7c5cfc" : "#c4b5fd",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        minWidth: "3.5rem",
                        textAlign: "right",
                      }}>
                        {axis.right.letter} {axis.right.label}
                      </span>
                    </div>
                  </button>

                  {/* 展開コンテンツ */}
                  {isOpen && (
                    <div style={{ padding: "0 1rem 1rem" }}>
                      <div style={{ height: 1, background: "#f0ecff", marginBottom: "0.8rem" }} />
                      <div style={{
                        background: "rgba(124,92,252,0.05)",
                        border: "1px solid rgba(124,92,252,0.18)",
                        borderRadius: 12,
                        padding: "0.75rem 0.9rem",
                      }}>
                        <div style={{
                          fontSize: "0.72rem", fontWeight: 700, color: "#7c5cfc",
                          marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: 5,
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4" stroke="#7c5cfc" strokeWidth="2"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#7c5cfc" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          {dominant.letter}（{dominant.label}）寄り
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "#4a4470", lineHeight: 1.7, margin: 0 }}>
                          {resultNote}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 注記 */}
          <div style={{
            background: "rgba(124,92,252,0.06)",
            border: "1.5px solid rgba(124,92,252,0.15)",
            borderRadius: 16,
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(124,92,252,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 2,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#7c5cfc" strokeWidth="1.8"/>
                <path d="M12 8c-1.1 0-2 .7-2 1.7 0 .7.4 1.3 1 1.6V13a1 1 0 0 0 2 0v-1.7c.6-.3 1-1 1-1.6C14 8.7 13.1 8 12 8z" fill="#7c5cfc"/>
                <circle cx="12" cy="16" r="1" fill="#7c5cfc"/>
              </svg>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#7c5cfc", lineHeight: 1.7, margin: 0 }}>
              この結果は自己理解のための参考情報です。<br />
              すべてのタイプに優劣はなく、それぞれに強みがあります。
            </p>
          </div>

          {/* 4つの診断結果バナー */}
          <div style={{
            background: "linear-gradient(135deg, #faf8ff 0%, #f3f0ff 100%)",
            border: "1.5px solid rgba(124,92,252,0.2)",
            borderRadius: 20,
            padding: "1.1rem 1.25rem",
            marginBottom: "1rem",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* 背景グラデーション装飾 */}
            <div style={{
              position: "absolute", top: -20, right: -20,
              width: 100, height: 100, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,121,249,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "2rem", flexShrink: 0, lineHeight: 1 }}>🎉</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "0.95rem", fontWeight: 800, color: "#1e1a3c",
                  marginBottom: "0.2rem", letterSpacing: "-0.01em",
                }}>
                  4つの診断結果が出そろいました
                  <span style={{ fontSize: "0.9rem", marginLeft: "0.2rem" }}>✨</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#7b7b9d", lineHeight: 1.5 }}>
                  MBTI・12星座・60アニマル診断・六星占術をもとに、<br />
                  あなたらしさをまとめた統合レポートをご用意しました。
                </div>
              </div>
            </div>
          </div>

          {/* CTAボタン */}
          <button
            type="button"
            onClick={() => router.push("/diagnosis/reassurance")}
            className="btn-press"
            style={{
              width: "100%", height: 56, borderRadius: 999,
              background: "linear-gradient(135deg, #7c5cfc, #a78bfa)",
              color: "#fff", fontSize: "1rem", fontWeight: 700,
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(124,92,252,0.4)",
              marginBottom: "0.75rem",
            }}
          >
            統合レポートを見る
          </button>

          <button
            type="button"
            onClick={handleRetry}
            className="btn-press"
            style={{
              width: "100%", height: 56, borderRadius: 999,
              background: "transparent",
              border: "1.5px solid #ede9f8",
              color: "#7c5cfc", fontSize: "1rem", fontWeight: 700,
              cursor: "pointer",
            }}
          >
            もう一度診断する
          </button>
        </div>
      </div>
    </>
  );
}

