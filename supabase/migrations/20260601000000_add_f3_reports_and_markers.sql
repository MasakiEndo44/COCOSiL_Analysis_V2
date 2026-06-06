-- F3: reports / know_markers / profiles テーブル追加
-- F3.1 レポート生成エンジン + F3.3 しっくりきたマーカー + F3.4 満足度アンケート
-- ⚠️ Supabase Dashboard SQL Editor から手動実行すること
--    (supabase db push は AGENTS.md §7 Layer1 制約でブロックされる)

-- =====================================================================
-- 1. profiles テーブル（ユーザーネーム・生年月日）
-- =====================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT        NOT NULL UNIQUE,
  display_name TEXT        NOT NULL DEFAULT 'あなた',
  birthday     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own profile" ON profiles
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub') OR user_id IS NOT NULL);

CREATE POLICY "users can update own profile" ON profiles
  FOR UPDATE USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

-- =====================================================================
-- 2. reports テーブル（F3.1 レポート画像の永続化）
-- =====================================================================
CREATE TABLE IF NOT EXISTS reports (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT,
  storage_url    TEXT        NOT NULL,
  generated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  regen_count    INTEGER     NOT NULL DEFAULT 0,
  last_regen_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports (generated_at DESC);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own reports" ON reports
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "allow reports inserts" ON reports
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can update own reports" ON reports
  FOR UPDATE USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

-- =====================================================================
-- 3. know_markers テーブル（F3.3 しっくりきたマーカー）
-- =====================================================================
CREATE TABLE IF NOT EXISTS know_markers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT,
  report_id    UUID        REFERENCES reports(id) ON DELETE CASCADE,
  section_id   TEXT        NOT NULL,
  section_text TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_know_markers_user_id   ON know_markers (user_id);
CREATE INDEX IF NOT EXISTS idx_know_markers_report_id ON know_markers (report_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_know_markers_unique
  ON know_markers (user_id, report_id, section_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE know_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own markers" ON know_markers
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "allow markers inserts" ON know_markers
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can delete own markers" ON know_markers
  FOR DELETE USING (user_id = (auth.jwt() ->> 'sub') OR user_id IS NULL);

-- =====================================================================
-- 4. analytics_events に F3.4 アンケート用レコードを追加
--    （既存テーブルを再利用: event_name='report_survey', payload に score + comment）
-- =====================================================================
-- 既存テーブルに追記するだけなので追加のマイグレーション不要。
-- event_name = 'report_survey' として payload: { score: 1-5, comment: string, report_id: string }

-- =====================================================================
-- 5. Supabase Storage: user-reports バケット RLS
--    (バケット自体は Supabase Dashboard から手動作成すること)
--    以下の RLS は Storage objects テーブルに適用
-- =====================================================================
-- NOTE: Storage バケットの RLS は Dashboard > Storage > Policies から設定する。
-- バケット名: user-reports
-- INSERT: bucket_id = 'user-reports' AND (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
-- SELECT: bucket_id = 'user-reports' AND (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
