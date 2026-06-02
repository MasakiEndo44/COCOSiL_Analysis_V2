import { z } from 'zod/v4';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Clerk キーは .env.local に設定してから認証機能が有効になる
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  // PostHog クライアントサイドキー（posthog-js 用）
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string().min(1).optional(),
});

// SKIP_ENV_VALIDATION=1 のとき（CI ビルド等）はモジュールロード時の parse をスキップする。
// ビルド時に API ルートは実行されないため、空オブジェクトを返しても安全。
// 実際の値検証は リクエスト受付時に getServerEnv() で行われる。
export const env = process.env.SKIP_ENV_VALIDATION
  ? ({} as z.infer<typeof clientEnvSchema>)
  : clientEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
    });

const serverEnvSchema = z.object({
  // Clerk シークレットキー（認証機能を使用するサーバーコードでのみ呼び出す）
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  // PostHog（Phase A テレメトリ — 未設定時はイベント送信をスキップ）
  POSTHOG_API_KEY: z.string().min(1).optional(),
  POSTHOG_HOST: z.url().optional(),
});

export function getServerEnv() {
  return {
    ...env,
    ...serverEnvSchema.parse(process.env),
  } as const;
}
