-- F3: MBTI Identity 軸 (A/T) の追加 — 16型→32型へ解像度を上げ、入力ベクトルを一意化する。
-- 設計根拠: docs/output/goals/f3-report-determinism-and-self-anchor.md (AC-3) / TSK-DB-002 (#75)
--
-- 16型 CHECK (mbti_type) は壊さず、Identity を別カラムで持つ。既存行のため nullable。
-- ⚠️ このファイルの適用 (db push) は人間が手動実行する (Layer 1 / hook ブロック対象)。

ALTER TABLE mbti_results
  ADD COLUMN IF NOT EXISTS identity TEXT
  CONSTRAINT mbti_results_identity_check CHECK (identity IN ('A', 'T'));
