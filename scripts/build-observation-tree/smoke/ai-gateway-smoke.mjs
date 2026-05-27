#!/usr/bin/env node
// AI Gateway 疎通 smoke test
// 実行: node --env-file=.env.local scripts/build-observation-tree/smoke/ai-gateway-smoke.mjs
//      または:  pnpm ai-gateway:smoke
//
// 目的:
//   - VERCEL_OIDC_TOKEN または AI_GATEWAY_API_KEY が AI SDK で正しく解決されるか
//   - anthropic/claude-haiku-4-5 への streamText が応答を返すか
//   - F3.1 パイプライン本走前のコスト最小（≒ <1 cent）の動作確認
//
// 期待出力:
//   接続テスト成功
//   [ok] 〇 chars received
//
// 失敗時:
//   - "AI_LoadAPIKeyError" → 認証情報未設定。env.ts のメッセージに従う
//   - "AI_NoSuchModelError" → モデル名タイポ。anthropic/claude-haiku-4-5 を確認
//   - "AI_APICallError 401/403" → token 期限切れ。vercel env pull で再取得

import { streamText } from 'ai'

const hasOidc = Boolean(process.env.VERCEL_OIDC_TOKEN)
const hasApiKey = Boolean(process.env.AI_GATEWAY_API_KEY)

if (!hasOidc && !hasApiKey) {
  console.error(
    '[fail] VERCEL_OIDC_TOKEN も AI_GATEWAY_API_KEY も未設定です。\n' +
      '  vercel env pull .env.local を実行し、--env-file=.env.local 経由で再実行してください。',
  )
  process.exit(1)
}

console.error(
  `[start] AI Gateway smoke test  ` +
    `(auth: ${hasOidc ? 'VERCEL_OIDC_TOKEN' : 'AI_GATEWAY_API_KEY'})`,
)

const t0 = Date.now()
const result = streamText({
  model: 'anthropic/claude-haiku-4-5',
  prompt: '日本語で「接続テスト成功」とだけ返答してください。それ以外の文字は不要です。',
})

let totalChars = 0
for await (const chunk of result.textStream) {
  process.stdout.write(chunk)
  totalChars += chunk.length
}

const elapsed = Date.now() - t0
console.log()
console.error(`\n[ok] ${totalChars} chars received in ${elapsed}ms`)
