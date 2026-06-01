#!/usr/bin/env tsx
// F3.1 観察軸ツリーパイプライン v2
// Step 1 (load) → Step 2 (extract) → Step 3 (schema) → Step 4 (critique) → Step 5 (human)
//
// 各 LLM 呼び出しは Vercel AI Gateway 経由 (provider/model 文字列指定)。
// DRY_RUN=1 で LLM を呼ばずモック生成 → schema/critique 通貫検証。

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  OBSERVATION_AXIS_IDS,
  isObservationAxisId,
} from '@/lib/constitution/observation-axes'
import {
  SYSTEM_IDS,
  type SystemId,
} from '@/lib/constitution/observation-tree-schema'
import { loadScriptEnv, isDryRun } from './env'
import { loadContext } from './steps/step1-load'
import { extractObservationTree, type Step2Output } from './steps/step2-extract'
import {
  validateObservationTree,
  formatRetryHints,
} from './steps/step3-schema'
import { critiqueObservationTree, type Step4Output } from './steps/step4-critique'
import { writeForHumanReview } from './steps/step5-human'

const MAX_RETRIES = 3
const ROOT = path.resolve(__dirname)
const INPUTS_DIR = path.join(ROOT, 'inputs')
const OUTPUTS_DIR = path.join(ROOT, 'outputs')
const LOGS_DIR = path.join(ROOT, 'logs')

type CliArgs = { help: boolean; system?: SystemId; axis?: string }

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { help: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') args.help = true
    else if (a === '--system') args.system = argv[++i] as SystemId
    else if (a === '--axis') args.axis = argv[++i]
  }
  return args
}

function printHelp(): void {
  const systemList = SYSTEM_IDS.join(' | ')
  const axisList = OBSERVATION_AXIS_IDS.join(' | ')
  process.stdout.write(`
build-observation-tree-v2 — F3.1 観察軸ツリーパイプライン v2

Usage:
  pnpm build:observation-tree-v2 --system <id> --axis <id>

Required:
  --system <id>   ${systemList}
  --axis <id>     ${axisList}

Input:
  scripts/build-observation-tree-v2/inputs/{system}-{axis}.md

Output:
  scripts/build-observation-tree-v2/outputs/{system}-{axis}.json
  scripts/build-observation-tree-v2/logs/{system}-{axis}-{ISO}.log

Env:
  VERCEL_OIDC_TOKEN   推奨 (vercel env pull で取得、12 時間期限)
  AI_GATEWAY_API_KEY  代替 (永続)
  DRY_RUN=1           LLM を呼ばず twigs ベースのモックで dry-run
  EXTRACT_MODEL       Step 2 モデル上書き (default: anthropic/claude-haiku-4-5)
  CRITIQUE_MODEL      Step 4 モデル上書き (default: anthropic/claude-haiku-4-5)

Pipeline:
  Step 1: Constitution + twigs + 入力 MD の読み込み
  Step 2: LLM 抽出 (generateObject + Vercel AI Gateway)
  Step 3: Zod schema 検証 (observation-tree-schema.ts)
  Step 4: 決定論 critique (禁止語 + twigs ホワイトリスト) → LLM critique
  Step 5: 人間レビュー用 JSON 書き出し
  Retry:  最大 ${MAX_RETRIES} 回 (Step 3/4 違反時に retry_hints を Step 2 に再注入)
`)
}

interface LogEntry {
  attempt: number
  step: 'step1' | 'step2' | 'step3' | 'step4' | 'step5'
  status: 'ok' | 'fail'
  durationMs: number
  detail?: unknown
}

class PipelineLogger {
  private entries: LogEntry[] = []
  private startedAt = new Date()
  constructor(private system: SystemId, private axis: string) {}

  record(e: LogEntry): void {
    this.entries.push(e)
  }

  async flush(success: boolean): Promise<string> {
    await fs.mkdir(LOGS_DIR, { recursive: true })
    const iso = this.startedAt.toISOString().replace(/[:.]/g, '-')
    const filePath = path.join(
      LOGS_DIR,
      `${this.system}-${this.axis}-${iso}.log`,
    )
    await fs.writeFile(
      filePath,
      JSON.stringify(
        {
          system: this.system,
          axis: this.axis,
          startedAt: this.startedAt.toISOString(),
          endedAt: new Date().toISOString(),
          success,
          dryRun: isDryRun(),
          entries: this.entries,
        },
        null,
        2,
      ),
      'utf-8',
    )
    return filePath
  }
}

async function runPipeline(system: SystemId, axis: string): Promise<void> {
  if (!isObservationAxisId(axis)) {
    throw new Error(`[Step 0] axis "${axis}" は OBSERVATION_AXIS_IDS に存在しない`)
  }

  const logger = new PipelineLogger(system, axis)

  // Step 1
  const step1Start = Date.now()
  const context = await loadContext({ system, axis, inputsDir: INPUTS_DIR })
  logger.record({
    attempt: 0,
    step: 'step1',
    status: 'ok',
    durationMs: Date.now() - step1Start,
    detail: { markdownChars: context.markdownInput.length },
  })

  let retryHints: string | undefined
  let lastError: string | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    process.stderr.write(
      `\n[attempt ${attempt}/${MAX_RETRIES}] system=${system} axis=${axis}${isDryRun() ? ' (DRY_RUN)' : ''}\n`,
    )

    // Step 2
    const step2Start = Date.now()
    let step2: Step2Output
    try {
      step2 = await extractObservationTree({
        system,
        axis,
        context,
        retryHints,
      })
      logger.record({
        attempt,
        step: 'step2',
        status: 'ok',
        durationMs: Date.now() - step2Start,
        detail: { categoriesCount: step2.data.categories.length },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logger.record({
        attempt,
        step: 'step2',
        status: 'fail',
        durationMs: Date.now() - step2Start,
        detail: { error: msg },
      })
      lastError = `Step 2 失敗: ${msg}`
      retryHints = formatRetryHints({ step4Hints: lastError })
      continue
    }

    // Step 3
    const step3Start = Date.now()
    const step3 = validateObservationTree(step2.data)
    if (!step3.ok) {
      logger.record({
        attempt,
        step: 'step3',
        status: 'fail',
        durationMs: Date.now() - step3Start,
        detail: { errors: step3.errors },
      })
      lastError = `Step 3 Zod 検証失敗 (${step3.errors.length} 件)`
      retryHints = formatRetryHints({ step3Errors: step3.errors })
      continue
    }
    logger.record({
      attempt,
      step: 'step3',
      status: 'ok',
      durationMs: Date.now() - step3Start,
    })

    // Step 4
    const step4Start = Date.now()
    let step4: Step4Output
    try {
      step4 = await critiqueObservationTree({
        system,
        axis,
        context,
        generatedJson: step3.data,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logger.record({
        attempt,
        step: 'step4',
        status: 'fail',
        durationMs: Date.now() - step4Start,
        detail: { error: msg },
      })
      lastError = `Step 4 Critique API 失敗: ${msg}`
      retryHints = formatRetryHints({ step4Hints: lastError })
      continue
    }

    if (step4.result.result === 'FAIL') {
      logger.record({
        attempt,
        step: 'step4',
        status: 'fail',
        durationMs: Date.now() - step4Start,
        detail: {
          violationsCount: step4.result.violations.length,
          violations: step4.result.violations,
          deterministicCount: step4.deterministicViolations.length,
        },
      })
      lastError = `Step 4 Critique FAIL (${step4.result.violations.length} violations)`
      retryHints = formatRetryHints({
        step4Violations: step4.result.violations,
        step4Hints: step4.result.retry_hints,
      })
      continue
    }
    logger.record({
      attempt,
      step: 'step4',
      status: 'ok',
      durationMs: Date.now() - step4Start,
    })

    // Step 5
    const step5Start = Date.now()
    const step5 = await writeForHumanReview({
      data: step3.data,
      system,
      axis,
      outputsDir: OUTPUTS_DIR,
    })
    logger.record({
      attempt,
      step: 'step5',
      status: 'ok',
      durationMs: Date.now() - step5Start,
      detail: { summary: step5.summary, outputPath: step5.outputPath },
    })

    const logPath = await logger.flush(true)
    process.stdout.write(
      `\n[OK] パイプライン PASS at attempt ${attempt}.\n` +
        `  output: ${step5.outputPath}\n` +
        `  log:    ${logPath}\n` +
        `  summary: ${step5.summary}\n\n`,
    )
    return
  }

  const logPath = await logger.flush(false)
  throw new Error(
    `[FAIL] 最大リトライ ${MAX_RETRIES} 回到達。最終エラー: ${lastError ?? '(不明)'}\nlog: ${logPath}`,
  )
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  if (args.help || (!args.system && !args.axis)) {
    printHelp()
    return
  }
  if (!args.system || !SYSTEM_IDS.includes(args.system)) {
    process.stderr.write(
      `[CLI] --system は ${SYSTEM_IDS.join(' | ')} のいずれかが必要 (現値: ${args.system ?? '未指定'})\n`,
    )
    process.exit(2)
  }
  if (!args.axis || !isObservationAxisId(args.axis)) {
    process.stderr.write(
      `[CLI] --axis は ${OBSERVATION_AXIS_IDS.join(' | ')} のいずれかが必要 (現値: ${args.axis ?? '未指定'})\n`,
    )
    process.exit(2)
  }

  loadScriptEnv()

  try {
    await runPipeline(args.system, args.axis)
  } catch (err) {
    process.stderr.write(`\n${err instanceof Error ? err.message : String(err)}\n`)
    process.exit(1)
  }
}

main()
