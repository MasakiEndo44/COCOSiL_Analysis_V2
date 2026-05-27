#!/usr/bin/env node
// AI Gateway 疎通 smoke test
// 実行: pnpm ai-gateway:smoke
//
// 目的:
//   - VERCEL_OIDC_TOKEN または AI_GATEWAY_API_KEY が AI SDK で正しく解決されるか
//   - anthropic/claude-haiku-4-5 への呼び出しが応答を返すか
//   - F3.1 パイプライン本走前のコスト最小（≒ <1 cent）の動作確認
//
// 期待出力:
//   [start] AI Gateway smoke test (auth: VERCEL_OIDC_TOKEN, model: anthropic/claude-haiku-4-5)
//   接続テスト成功
//   [ok] 8 chars in 1234ms (finishReason=stop)
//
// 失敗時:
//   - AI_LoadAPIKeyError → 認証情報未設定 (env.ts のメッセージに従う)
//   - AI_NoSuchModelError → モデル名タイポ
//   - GatewayInternalServerError → AI Gateway 側の一時障害。FALLBACK_MODEL で再試行
//   - 401/403 → OIDC token 期限切れ (12時間)、vercel env pull で再取得

import { generateText } from 'ai'

const PRIMARY_MODEL = process.env.SMOKE_MODEL ?? 'anthropic/claude-haiku-4-5'
const FALLBACK_MODELS = [
  'anthropic/claude-sonnet-4-5',
  'openai/gpt-4.1-mini',
]

const hasOidc = Boolean(process.env.VERCEL_OIDC_TOKEN)
const hasApiKey = Boolean(process.env.AI_GATEWAY_API_KEY)

if (!hasOidc && !hasApiKey) {
  console.error(
    '[fail] VERCEL_OIDC_TOKEN も AI_GATEWAY_API_KEY も未設定です。\n' +
      '  vercel env pull .env.local を実行してください。',
  )
  process.exit(1)
}

const authLabel = hasOidc ? 'VERCEL_OIDC_TOKEN' : 'AI_GATEWAY_API_KEY'

async function tryModel(modelId) {
  process.stderr.write(`[try] model=${modelId}\n`)
  const t0 = Date.now()
  try {
    const result = await generateText({
      model: modelId,
      prompt: '日本語で「接続テスト成功」とだけ返答してください。それ以外の文字は不要です。',
    })
    const elapsed = Date.now() - t0
    process.stdout.write(result.text)
    process.stdout.write('\n')
    process.stderr.write(
      `[ok] ${result.text.length} chars in ${elapsed}ms ` +
        `(finishReason=${result.finishReason}, model=${modelId})\n`,
    )
    return { ok: true, model: modelId }
  } catch (e) {
    const elapsed = Date.now() - t0
    process.stderr.write(
      `[fail] model=${modelId} after ${elapsed}ms\n` +
        `  name: ${e?.name ?? 'UnknownError'}\n` +
        `  message: ${e?.message ?? String(e)}\n`,
    )
    if (e?.type) process.stderr.write(`  type: ${e.type}\n`)
    if (e?.statusCode) process.stderr.write(`  statusCode: ${e.statusCode}\n`)
    if (e?.cause) {
      const cause = e.cause
      process.stderr.write(
        `  cause: ${cause?.name ?? ''} ${cause?.message ?? String(cause)}\n`,
      )
    }
    return { ok: false, error: e }
  }
}

console.error(
  `[start] AI Gateway smoke test (auth: ${authLabel}, model: ${PRIMARY_MODEL})\n`,
)

const primary = await tryModel(PRIMARY_MODEL)
if (primary.ok) {
  process.exit(0)
}

console.error('\n[fallback] primary model failed, trying fallbacks ...\n')

for (const m of FALLBACK_MODELS) {
  const r = await tryModel(m)
  if (r.ok) {
    process.stderr.write(
      `\n[hint] primary model "${PRIMARY_MODEL}" unavailable but "${m}" works.\n` +
        `       SMOKE_MODEL=${m} pnpm ai-gateway:smoke で次回から ${m} を使えます。\n`,
    )
    process.exit(0)
  }
}

process.stderr.write(
  '\n[fail] すべてのモデルで失敗しました。AI Gateway の状態または認証を確認してください。\n',
)
process.exit(1)
