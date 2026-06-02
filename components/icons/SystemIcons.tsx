/**
 * 4体系の線画アイコン — onboarding と同一画法（1.5px / 単色 #a78bfa / viewBox 0 0 40 40）。
 * 占いの記号語彙（星・干支・天体）を避け、各体系が"観ているもの"を抽象化する。
 */
import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 40 40",
  width: 40,
  height: 40,
  fill: "none",
  stroke: "#a78bfa",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/** MBTI = 角丸正方形を4象限に割る格子（性格の次元。人型・星を回避） */
export function MbtiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="8" y="8" width="24" height="24" rx="4" />
      <line x1="20" y1="8" x2="20" y2="32" />
      <line x1="8" y1="20" x2="32" y2="20" />
    </svg>
  );
}

/** 12星座 = 傾いた楕円軌道＋移動点＋中心点（天球の運行。星マークを回避） */
export function ZodiacIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="20" cy="20" rx="15" ry="8.5" transform="rotate(-22 20 20)" />
      <circle cx="29" cy="12.5" r="2.6" fill="#a78bfa" stroke="none" />
      <circle cx="20" cy="20" r="1.4" fill="#a78bfa" stroke="none" />
    </svg>
  );
}

/** 60種動物分類 = 足あと（抽象パッド：楕円＋指3つ。特定の動物を描かない） */
export function AnimalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="20" cy="25" rx="6.5" ry="5.5" />
      <circle cx="13.5" cy="16" r="2.4" />
      <circle cx="20" cy="13.5" r="2.4" />
      <circle cx="26.5" cy="16" r="2.4" />
    </svg>
  );
}

/** 六星占術 = 円環＋60°間隔の6本のtick＋中心点（6分割の周期構造。六芒星・干支を回避） */
export function SixStarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="20" cy="20" r="14" />
      <g>
        <line x1="20" y1="4.5" x2="20" y2="9.5" />
        <line x1="20" y1="4.5" x2="20" y2="9.5" transform="rotate(60 20 20)" />
        <line x1="20" y1="4.5" x2="20" y2="9.5" transform="rotate(120 20 20)" />
        <line x1="20" y1="4.5" x2="20" y2="9.5" transform="rotate(180 20 20)" />
        <line x1="20" y1="4.5" x2="20" y2="9.5" transform="rotate(240 20 20)" />
        <line x1="20" y1="4.5" x2="20" y2="9.5" transform="rotate(300 20 20)" />
      </g>
      <circle cx="20" cy="20" r="1.4" fill="#a78bfa" stroke="none" />
    </svg>
  );
}
