"use client";

import { useState, useCallback } from "react";

interface KnowMarkerProps {
  reportId: string;
  sectionId: string;
  sectionText?: string;
  userId?: string;
  initialMarked?: boolean;
}

export function KnowMarker({
  reportId,
  sectionId,
  sectionText,
  userId,
  initialMarked = false,
}: KnowMarkerProps) {
  const [marked, setMarked] = useState(initialMarked);
  const [pending, setPending] = useState(false);

  const toggle = useCallback(async () => {
    const next = !marked;
    setMarked(next);
    setPending(true);

    try {
      if (next) {
        await fetch("/api/reports/markers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, sectionId, sectionText, userId }),
        });
      } else {
        await fetch("/api/reports/markers", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, sectionId, userId }),
        });
      }
    } catch {
      setMarked(!next);
    } finally {
      setPending(false);
    }
  }, [marked, reportId, sectionId, sectionText, userId]);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={marked}
      aria-label={marked ? "マークを外す" : "しっくりきた"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 20,
        border: marked ? "1.5px solid #7c5cfc" : "1.5px solid #ddd6fe",
        background: marked ? "rgba(124,92,252,0.08)" : "transparent",
        color: marked ? "#7c5cfc" : "#9b8fbd",
        fontSize: 13,
        fontWeight: marked ? 700 : 500,
        cursor: pending ? "wait" : "pointer",
        transition: "all 0.1s ease",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
      }}
    >
      <span style={{ fontSize: 15 }}>{marked ? "✓" : "+"}</span>
      しっくりきた
    </button>
  );
}
