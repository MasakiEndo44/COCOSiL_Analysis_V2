"use client";

import { MBTI_TYPES, MBTI_TYPE_DESCRIPTIONS } from "../questions";

interface Props {
  onSelect: (type: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function MbtiTypeSelector({ onSelect, onBack, isSubmitting }: Props) {
  return (
    <div className="type-selector">
      <h2 className="selector-title">あなたのMBTIタイプは？</h2>
      <p className="selector-subtitle">
        16タイプから選択してください
      </p>

      <div className="type-grid">
        {MBTI_TYPES.map((type) => {
          const desc = MBTI_TYPE_DESCRIPTIONS[type];
          return (
            <button
              key={type}
              className="type-card"
              onClick={() => onSelect(type)}
              disabled={isSubmitting}
              type="button"
            >
              <span className="type-emoji">{desc?.emoji}</span>
              <span className="type-code">{type}</span>
              <span className="type-name">{desc?.name}</span>
            </button>
          );
        })}
      </div>

      <button
        className="back-btn"
        onClick={onBack}
        disabled={isSubmitting}
        type="button"
      >
        ← 診断に戻る
      </button>
    </div>
  );
}
