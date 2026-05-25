import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { getServerEnv } from '@/lib/env'
import { ReportContentSchema } from '@/lib/reports/schemas'
import { buildReportSystemPrompt, buildReportUserPrompt } from '@/lib/prompts/report/system-prompt'
import type { DiagnosisContext, ReportContent } from '@/lib/reports/types'

const MAX_RETRIES = 3
const TIMEOUT_MS = 30_000

export class LlmTimeoutError extends Error {
  readonly retryable = true
  constructor() {
    super('レポートの生成に時間がかかっています。しばらくしてからお試しください。')
    this.name = 'LlmTimeoutError'
  }
}

export class LlmUnavailableError extends Error {
  readonly retryable = true
  constructor(cause?: unknown) {
    super('レポートの生成に失敗しました。しばらくしてからお試しください。')
    this.name = 'LlmUnavailableError'
    this.cause = cause
  }
}

export async function generateReportContent(ctx: DiagnosisContext): Promise<ReportContent> {
  const env = getServerEnv()

  if (!env.OPENAI_API_KEY) {
    throw new LlmUnavailableError('OPENAI_API_KEY is not configured')
  }

  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY })
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { object } = await generateObject({
        model: openai('gpt-4o'),
        schema: ReportContentSchema,
        system: buildReportSystemPrompt(),
        prompt: buildReportUserPrompt(ctx),
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      })
      return object as ReportContent
    } catch (err) {
      lastError = err
      const isTimeout =
        err instanceof Error &&
        (err.name === 'TimeoutError' || err.name === 'AbortError' || err.message.includes('timeout'))

      if (isTimeout) {
        throw new LlmTimeoutError()
      }

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt))
      }
    }
  }

  throw new LlmUnavailableError(lastError)
}
