// scripts/build-observation-tree-v2 は Next.js コンテキスト外で動く CLI のため、
// lib/env.ts の getServerEnv() ではなく、ここで Zod 検証する。
//
// AI Gateway 認証は次の 2 系統のいずれかを受け入れる:
//   ① VERCEL_OIDC_TOKEN — vercel env pull で取得。12 時間期限、推奨
//   ② AI_GATEWAY_API_KEY — Vercel ダッシュで発行する永続 key
// AI SDK v6 はどちらかが env に立っていれば自動で認証ヘッダを組み立てる。
//
// v2 では DRY_RUN=1 でモック LLM 経路に切り替えて CI/オフライン検証ができる。

import { z } from 'zod/v4'

const scriptEnvSchema = z
  .object({
    AI_GATEWAY_API_KEY: z.string().min(1).optional(),
    VERCEL_OIDC_TOKEN: z.string().min(1).optional(),
    DRY_RUN: z.string().optional(),
  })
  .refine(
    (env) =>
      Boolean(env.DRY_RUN) ||
      Boolean(env.AI_GATEWAY_API_KEY ?? env.VERCEL_OIDC_TOKEN),
    {
      message:
        'AI_GATEWAY_API_KEY または VERCEL_OIDC_TOKEN が必要 (DRY_RUN=1 で迂回可)',
      path: ['AI_GATEWAY_API_KEY'],
    },
  )

export type ScriptEnv = z.infer<typeof scriptEnvSchema>

export function loadScriptEnv(): ScriptEnv {
  const result = scriptEnvSchema.safeParse({
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN,
    DRY_RUN: process.env.DRY_RUN,
  })
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.message}`).join('\n')
    throw new Error(
      `[env] AI Gateway 認証情報が未設定です:\n${issues}\n\n` +
        `修正手順 (いずれか):\n` +
        `  方式 A (OIDC, 推奨):\n` +
        `    1. npm i -g vercel && vercel login\n` +
        `    2. vercel link  (COCOSiL_Analysis_V2 を選択)\n` +
        `    3. vercel env pull .env.local\n` +
        `    4. node --env-file=.env.local 経由、もしくは export VERCEL_OIDC_TOKEN=...\n` +
        `  方式 B (永続 API key):\n` +
        `    1. https://vercel.com/dashboard で AI Gateway 有効化 → API key 発行\n` +
        `    2. export AI_GATEWAY_API_KEY=vck_...\n` +
        `  方式 C (オフライン検証):\n` +
        `    1. DRY_RUN=1 pnpm build:observation-tree-v2 --system ...\n`,
    )
  }
  return result.data
}

export function isDryRun(): boolean {
  return process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'
}
