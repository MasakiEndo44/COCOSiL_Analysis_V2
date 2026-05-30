import type { CSSProperties } from "react";

/** フェードイン+スライドアップ用インラインスタイルを返す */
export function fi(visible: boolean, delay = 0): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`,
  };
}

/** グラデーション紫ボタンの共通スタイル */
export const gradientBtnStyle: CSSProperties = {
  background: "linear-gradient(135deg, #7c5cfc, #a78bfa)",
  boxShadow: "0 4px 20px rgba(124,92,252,0.4)",
  cursor: "pointer",
};
