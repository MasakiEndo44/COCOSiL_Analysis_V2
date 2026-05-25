-- F3: user_reports テーブル + user-reports Storage バケット + RLS
-- user_id は nullable（diagnoses / mbti_results と同様の MVP 匿名フロー）
-- Clerk JWT 統合後に user_id IS NOT NULL 制約を追加予定

CREATE TABLE IF NOT EXISTS user_reports (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT,
  diagnosis_id      UUID        REFERENCES diagnoses(id) ON DELETE SET NULL,
  mbti_result_id    UUID        REFERENCES mbti_results(id) ON DELETE SET NULL,
  content           JSONB       NOT NULL,
  storage_url       TEXT,
  generation_status TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (generation_status IN ('pending', 'completed', 'failed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON user_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports (created_at DESC);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow report inserts" ON user_reports
  FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can read own reports" ON user_reports
  FOR SELECT
  USING (user_id IS NULL OR user_id = (auth.jwt() ->> 'sub'));

-- Storage バケット（サーバーサイド専用・非公開・5 MB 上限）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'user-reports',
    'user-reports',
    false,
    5242880,
    ARRAY['image/png']
  )
  ON CONFLICT (id) DO NOTHING;

-- ユーザーは自分のフォルダのファイルのみ参照可能
CREATE POLICY "users can read own report images" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'user-reports'
    AND (storage.foldername(name))[1] = COALESCE(auth.jwt() ->> 'sub', 'anonymous')
  );
