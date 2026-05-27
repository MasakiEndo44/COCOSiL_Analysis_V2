#!/usr/bin/env tsx
// パイプライン本体: Step 2 → Step 3 → Step 4 のオーケストレーション。
// Critique FAIL または Schema FAIL の場合、retry_hints を Step 2 に注入して最大3回リトライ。

import fs from 'node:fs/promises'
import path from 'node:path'
import { OBSERVATION_AXIS_IDS, isObservationAxisId } from '@/lib/constitution/observation-axes'
import { SYSTEM_IDS, type SystemId } from '@/lib/constitution/observation-tree-schema'
import { loadScriptEnv } from './env'
import { extractObservationTree, type Step2Output } from './steps/step2-extract'
import { validateObservationTree, formatRetryHints } from './steps/step3-validate'
import { critiqueObservationTree, type Step4Output } from './steps/step4-critique'

const MAX_RETRIES = 3
const ROOT = path.resolve(__dirname)
const INPUTS_DIR = path.join(ROOT, 'inputs')
const OUTPUTS_DIR = path.join(ROOT, 'outputs')
const LOGS_DIR = path.join(ROOT, 'logs')

type CliArgs = {
  help: boolean
  system?: SystemId
  axis?: string
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { help: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') {
      args.help = true
    } else if (a === '--system') {
      args.system = argv[++i] as SystemId
    } else if (a === '--axis') {
      args.axis = argv[++i]
    }
  }
  return args
}

function printHelp(): void {
  const systemList = SYSTEM_IDS.join(' | ')
  const axisList = OBSERVATION_AXIS_IDS.join(' | ')
  process.stdout.write(`
build-observation-tree — F3.1 観察軸ツリーデータ構築パイプライン

Usage:
  pnpm build:observation-tree --system <id> --axis <id>

Required:
  --system <id>   ${systemList}
  --axis <id>     ${axisList}

Input:
  scripts/build-observation-tree/inputs/{system}-{axis}.md  (Step 1 出力)

Output:
  scripts/build-observation-tree/outputs/{system}-{axis}.json  (Step 4 通過後)
  scripts/build-observation-tree/logs/{system}-{axis}-{ISO}.log  (各段実行ログ)

Env:
  VERCEL_OIDC_TOKEN   Vercel OIDC token (vercel env pull で取得・12時間期限)
  AI_GATEWAY_API_KEY  Vercel AI Gateway API key (代替・永続)
                      → どちらか一方必須
  EXTRACT_MODEL       Step 2 抽出モデル上書き (default: anthropic/claude-sonnet-4-6)
                      Free tier は anthropic/claude-haiku-4-5 を推奨
  CRITIQUE_MODEL      Step 4 批評モデル上書き (default: anthropic/claude-sonnet-4-6)
                      Free tier は anthropic/claude-haiku-4-5 を推奨

Pipeline:
  Step 2: 本文 Markdown → JSON 抽出 (Claude Sonnet 4.6 via AI Gateway)
  Step 3: Zod schema 検証 (lib/constitution/observation-tree-schema.ts)
  Step 4: Critique LLM 敵対的批評 (別 API コール)
  Retry:  最大 ${MAX_RETRIES} 回、retry_hints を Step 2 に注入

Reference: docs/output/F3/observation-tree-pipeline.md
`)
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
}

type LogEntry = {
  attempt: number
  step: 'step2' | 'step3' | 'step4'
  status: 'ok' | 'fail'
  durationMs: number
  detail?: unknown
}

class PipelineLogger {
  private entries: LogEntry[] = []
  private startedAt = new Date()
  constructor(
    private system: SystemId,
    private axis: string,
  ) {}

  record(entry: LogEntry): void {
    this.entries.push(entry)
  }

  async flush(success: boolean): Promise<string> {
    await ensureDir(LOGS_DIR)
    const iso = this.startedAt.toISOString().replace(/[:.]/g, '-')
    const filePath = path.join(LOGS_DIR, `${this.system}-${this.axis}-${iso}.log`)
    const body = {
      system: this.system,
      axis: this.axis,
      startedAt: this.startedAt.toISOString(),
      endedAt: new Date().toISOString(),
      success,
      entries: this.entries,
    }
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8')
    return filePath
  }
}

async function runPipeline(system: SystemId, axis: string): Promise<void> {
  const logger = new PipelineLogger(system, axis)
  const inputPath = path.join(INPUTS_DIR, `${system}-${axis}.md`)

  let markdownInput: string
  try {
    markdownInput = await fs.readFile(inputPath, 'utf-8')
  } catch {
    throw new Error(
      `[Step 1 入力] ${inputPath} が見つかりません。Deep Research の Markdown 本文を配置してください。`,
    )
  }

  let retryHints: string | undefined
  let lastError: string | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    process.stderr.write(`\n[attempt ${attempt}/${MAX_RETRIES}] system=${system} axis=${axis}\n`)

    // Step 2
    const step2Start = Date.now()
    let step2: Step2Output
    try {
      step2 = await extractObservationTree({
        system,
        axis: axis as never,
        markdownInput,
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

    // Step 3 (二重防御)
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
        axis: axis as never,
        markdownInput,
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

    await ensureDir(OUTPUTS_DIR)
    const outputPath = path.join(OUTPUTS_DIR, `${system}-${axis}.json`)
    await fs.writeFile(outputPath, JSON.stringify(step3.data, null, 2) + '\n', 'utf-8')

    const logPath = await logger.flush(true)
    process.stdout.write(
      `\n[OK] Step 4 PASS at attempt ${attempt}.\n` +
        `  output: ${outputPath}\n` +
        `  log:    ${logPath}\n\n` +
        `次は Step 5 (人間サンプリング) → lib/data/observation-tree/${system}/${axis}.json への commit。\n`,
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

  // CLI 引数の検証が通った後に env 検証。--help のみの実行で API key を要求しないため。
  loadScriptEnv()

  try {
    await runPipeline(args.system, args.axis)
  } catch (err) {
    process.stderr.write(`\n${err instanceof Error ? err.message : String(err)}\n`)
    process.exit(1)
  }
}

main()
