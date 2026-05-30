"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AutoCalcResponse } from "@/app/api/diagnosis/auto-calc/route";
import { StepDots } from "@/components/StepDots";
import { PrivacyNote } from "@/components/PrivacyNote";
import { getMaxReached, markStepReached } from "@/lib/stepProgress";
import { SESSION_KEYS } from "@/lib/sessionKeys";

// ── データ生成 ──────────────────────────────────────────
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1929 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

// ── ドラムロール列 ──────────────────────────────────────
const ITEM_H = 52;
const VISIBLE = 5;
const FRICTION = 0.95;
const MIN_VEL = 0.5; // これ以下の速度になったら慣性スクロールを止める
const CLICK_THRESHOLD = 2; // この距離(px)以下の移動はクリック扱い

interface DrumColumnProps {
  items: number[];
  initialIndex: number;
  onSettle: (val: number) => void;
}

function DrumColumn({ items, initialIndex, onSettle }: DrumColumnProps) {
  const offsetRef = useRef(initialIndex * ITEM_H);
  const [centeredIdx, setCenteredIdx] = useState(initialIndex);

  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const startY = useRef(0);      // PointerDown時のY座標
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velRef = useRef(0);
  const rafId = useRef<number | null>(null);

  const totalItems = items.length;
  const pad = Math.floor(VISIBLE / 2);

  const applyOffset = useCallback((offset: number) => {
    const clamped = Math.max(0, Math.min(offset, (totalItems - 1) * ITEM_H));
    offsetRef.current = clamped;
    if (listRef.current) {
      listRef.current.style.transform = `translateY(${-clamped + pad * ITEM_H}px)`;
    }
    const idx = Math.max(0, Math.min(Math.round(clamped / ITEM_H), totalItems - 1));
    setCenteredIdx(idx);
  }, [totalItems, pad]);

  useLayoutEffect(() => {
    if (listRef.current) {
      const offset = initialIndex * ITEM_H;
      offsetRef.current = offset;
      listRef.current.style.transform = `translateY(${-offset + pad * ITEM_H}px)`;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyOffset(Math.min(offsetRef.current, (totalItems - 1) * ITEM_H));
  }, [totalItems, applyOffset]);

  const snapToNearest = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const target = Math.max(0, Math.min(
      Math.round(offsetRef.current / ITEM_H) * ITEM_H,
      (totalItems - 1) * ITEM_H
    ));
    const ease = () => {
      const diff = target - offsetRef.current;
      if (Math.abs(diff) < 0.5) {
        applyOffset(target);
        onSettle(items[Math.max(0, Math.min(Math.round(target / ITEM_H), totalItems - 1))]);
        return;
      }
      applyOffset(offsetRef.current + diff * 0.18);
      rafId.current = requestAnimationFrame(ease);
    };
    rafId.current = requestAnimationFrame(ease);
  }, [totalItems, applyOffset, onSettle, items]);

  const snapToIndex = useCallback((idx: number) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const target = Math.max(0, Math.min(idx * ITEM_H, (totalItems - 1) * ITEM_H));
    const ease = () => {
      const diff = target - offsetRef.current;
      if (Math.abs(diff) < 0.5) {
        applyOffset(target);
        onSettle(items[idx]);
        return;
      }
      applyOffset(offsetRef.current + diff * 0.18);
      rafId.current = requestAnimationFrame(ease);
    };
    rafId.current = requestAnimationFrame(ease);
  }, [totalItems, applyOffset, onSettle, items]);

  const runInertia = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const tick = () => {
      velRef.current *= FRICTION;
      if (Math.abs(velRef.current) < MIN_VEL) {
        snapToNearest();
        return;
      }
      applyOffset(offsetRef.current + velRef.current);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
  }, [applyOffset, snapToNearest]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    isDragging.current = true;
    startY.current = e.clientY;
    lastY.current = e.clientY;
    lastTime.current = e.timeStamp;
    velRef.current = 0;
    wrapRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dy = lastY.current - e.clientY;
    const dt = e.timeStamp - lastTime.current;
    if (dt > 0) velRef.current = dy / dt;
    applyOffset(offsetRef.current + dy);
    lastY.current = e.clientY;
    lastTime.current = e.timeStamp;
  }, [applyOffset]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const totalMove = Math.abs(e.clientY - startY.current);

    if (totalMove < CLICK_THRESHOLD) {
      // クリック：タップ/クリックした位置からインデックスを計算
      const wrapEl = wrapRef.current;
      if (wrapEl) {
        const rect = wrapEl.getBoundingClientRect();
        const relY = e.clientY - rect.top;
        const clickedIdx = Math.floor(relY / ITEM_H) + Math.round(offsetRef.current / ITEM_H) - pad;
        const clampedIdx = Math.max(0, Math.min(clickedIdx, totalItems - 1));
        snapToIndex(clampedIdx);
      }
    } else {
      // ドラッグ：慣性スクロール
      velRef.current = velRef.current * (1000 / 60);
      if (Math.abs(velRef.current) > MIN_VEL) {
        runInertia();
      } else {
        snapToNearest();
      }
    }
  }, [totalItems, pad, snapToIndex, runInertia, snapToNearest]);

  // ホイール：native listenerで登録（ReactのonwheelはpassiveでpreventDefaultが効かない）
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (rafId.current) cancelAnimationFrame(rafId.current);
      applyOffset(offsetRef.current + e.deltaY * 0.6);
      snapToNearest();
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [applyOffset, snapToNearest]);

  const containerH = ITEM_H * VISIBLE;

  return (
    <div
      ref={wrapRef}
      className="relative flex-1 overflow-hidden select-none"
      style={{ height: containerH, touchAction: "none", cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* 選択枠 */}
      <div
        className="pointer-events-none absolute inset-x-1 rounded-xl z-10"
        style={{
          top: pad * ITEM_H,
          height: ITEM_H,
          border: "1.5px solid #7c5cfc",
          background: "rgba(124,92,252,0.06)",
        }}
      />
      {/* 上フェード */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{
          height: pad * ITEM_H,
          background: "linear-gradient(to bottom, rgba(255,255,255,0.92), rgba(255,255,255,0))",
        }}
      />
      {/* 下フェード */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: pad * ITEM_H,
          background: "linear-gradient(to top, rgba(255,255,255,0.92), rgba(255,255,255,0))",
        }}
      />

      {/* アイテムリスト */}
      <div ref={listRef} className="absolute inset-x-0 top-0" style={{ willChange: "transform" }}>
        {items.map((val, idx) => (
          <div
            key={val}
            className="flex items-center justify-center"
            style={{
              height: ITEM_H,
              fontSize: idx === centeredIdx ? "1.25rem" : "1rem",
              fontWeight: idx === centeredIdx ? 700 : 400,
              color: idx === centeredIdx ? "#1e1a3c" : "#b0aec8",
              transition: "font-size 0.12s ease, color 0.12s ease, font-weight 0.12s ease",
              cursor: idx !== centeredIdx ? "pointer" : "default",
            }}
          >
            {val}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── メインページ ────────────────────────────────────────
export default function BirthdatePage() {
  const router = useRouter();

  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [drumKey, setDrumKey] = useState(0); // ドラムロール再マウント用
  const [maxReached, setMaxReached] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    markStepReached(1);
    setMaxReached(getMaxReached());
    const saved = sessionStorage.getItem(SESSION_KEYS.ONBOARDING_BIRTHDATE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const y = Number(parsed.year) || 2000;
        const m = Number(parsed.month) || 1;
        const d = Number(parsed.day) || 1;
        setYear(y);
        setMonth(m);
        setDay(d);
        setDrumKey((k) => k + 1);
      } catch {
        console.warn("[birthdate] sessionStorage の日付データが破損していたため初期値を使用します");
        sessionStorage.removeItem(SESSION_KEYS.ONBOARDING_BIRTHDATE);
      }
    }
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEYS.ONBOARDING_BIRTHDATE, JSON.stringify({ year, month, day }));
  }, [year, month, day]);

  const maxDay = Math.max(1, daysInMonth(year, month));
  const effectiveDay = Math.min(day, maxDay);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  function handleMonthSettle(m: number) {
    setMonth(m);
    const max = daysInMonth(year, m);
    if (day > max) setDay(max);
  }

  function handleYearSettle(y: number) {
    setYear(y);
    const max = daysInMonth(y, month);
    if (day > max) setDay(max);
  }

  async function handleNext() {
    setLoading(true);
    setError(null);
    const birth_date = `${year}-${String(month).padStart(2, "0")}-${String(effectiveDay).padStart(2, "0")}`;
    try {
      const res = await fetch("/api/diagnosis/auto-calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birth_date }),
      });
      const data: AutoCalcResponse = await res.json();
      if (!data.success || !data.result) {
        setError(data.error ?? "診断の取得に失敗しました");
        return;
      }
      sessionStorage.setItem(SESSION_KEYS.AUTO_CALC_RESULT, JSON.stringify(data.result));
      sessionStorage.setItem(SESSION_KEYS.BIRTH_DATE, birth_date);
      router.push("/onboarding/auto-calc-result");
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  const yearInitIdx = YEARS.indexOf(year);
  const monthInitIdx = MONTHS.indexOf(month);
  const dayInitIdx = days.indexOf(effectiveDay);

  const fi = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`,
  });

  return (
    <div className="bg-aurora flex flex-col min-h-dvh" style={{ color: "#1e1a3c" }}>
      <main className="content-col flex-1 flex flex-col px-5 pt-12">
        <StepDots current={1} maxReached={maxReached} />
        <h1 className="text-3xl font-black text-[#1e1a3c] leading-snug mb-3" style={fi()}>
          生年月日を<br />教えてください
        </h1>
        <p className="text-sm text-[#7b7b9d] leading-relaxed mb-10" style={fi(0.08)}>
          12星座・60アニマル診断・六星占術を<br className="hidden sm:block" />
          自動で算出するために使います。
        </p>

        <div className="flex gap-3 mb-2 px-1" style={fi(0.15)}>
          {["年", "月", "日"].map((label) => (
            <div key={label} className="flex-1 text-center text-sm font-semibold text-[#7b7b9d]">
              {label}
            </div>
          ))}
        </div>

        <div
          className="flex gap-3 rounded-2xl px-2 py-2"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #e8e4f8", ...fi(0.2) }}
        >
          <DrumColumn
            key={`year-${drumKey}`}
            items={YEARS}
            initialIndex={yearInitIdx >= 0 ? yearInitIdx : 0}
            onSettle={handleYearSettle}
          />
          <DrumColumn
            key={`month-${drumKey}`}
            items={MONTHS}
            initialIndex={monthInitIdx >= 0 ? monthInitIdx : 0}
            onSettle={handleMonthSettle}
          />
          <DrumColumn
            key={`day-${year}-${month}-${drumKey}`}
            items={days}
            initialIndex={dayInitIdx >= 0 ? dayInitIdx : 0}
            onSettle={setDay}
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="mt-5 mb-1" style={fi(0.28)}>
          <PrivacyNote />
        </div>
        <p className="mt-3 text-center text-sm text-[#9998bb]" style={fi(0.32)}>
          入力後、3つの診断が自動で完了します
        </p>
      </main>

      <div className="content-col px-5 pb-10 pt-4" style={fi(0.38)}>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="btn-press w-full h-14 rounded-full text-base font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #7c5cfc, #a78bfa)",
            boxShadow: "0 4px 20px rgba(124,92,252,0.4)",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "診断中..." : "診断結果を確認する"}
        </button>
      </div>
    </div>
  );
}
