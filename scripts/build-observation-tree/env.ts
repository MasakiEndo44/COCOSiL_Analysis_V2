// scripts/build-observation-tree は Next.js コンテキスト外で動く CLI のため、
// lib/env.ts の getServerEnv() ではなく、ここで Zod 検証する。
// AI Gateway 経由でモデルを呼ぶため AI_GATEWAY_API_KEY 必須。
import { z } from 'zod/v4'

const scriptEnvSchema = z.object({
  AI_GATEWAY_API_KEY: z.string().min(1, 'AI_GATEWAY_API_KEY が未設定'),
})

export type ScriptEnv = z.infer<typeof scriptEnvSchema>

export function loadScriptEnv(): ScriptEnv {
  const result = scriptEnvSchema.safeParse({
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
  })
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(
      `[env] 必須環境変数が未設定です:\n${issues}\n\n` +
        `修正手順:\n` +
        `  1. https://vercel.com/dashboard で AI Gateway を有効化\n` +
        `  2. .env.local に AI_GATEWAY_API_KEY=xxx を追記（もしくは vercel env pull）\n` +
        `  3. シェルで export AI_GATEWAY_API_KEY=xxx して再実行\n`,
    )
  }
  return result.data
}
