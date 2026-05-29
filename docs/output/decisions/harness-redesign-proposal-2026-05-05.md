---
doc_id: output.cocosil.harness.redesign-proposal-2026-05-05
title: COCOSiL V2 整合性ハーネス再設計提案（2026-05-05）
doc_type: decision
product: cocosil
layer: design
status: approved
proposed_by: endo
proposed_at: 2026-05-05
approved_at: 2026-05-05
as_of: 2026-05-05
---

# COCOSiL V2 整合性ハーネス再設計提案

**作成日**: 2026-05-05
**根拠議論ログ**: `docs/discussions/20260505_議論ログ_設計整合性ハーネス再設計.md`
**整合性レポート**: `docs/output/decisions/coherence-report-2026-05-05.md`
**ステータス**: 承認済み（2026-05-05）— Week 1 Phase 1-2 プロンプト実装と合わせて承認

---

## 0. 提案の核心

> **設計思想を「文書」から「コード」に物理移行し、判定の独立性をデフォルトにし、観察→評価→改善のループを完結させる。**

3階層の設計思想（哲学 / Autogenesis Constitution / MVP最小機能要素）と実装ハーネスの間に存在する **8つの整合性ギャップ** のうち、**Critical な2件（C2 / C4）+ それを支える基盤（C1）** を今週中に解消する。残りは時系列で吸収。

---

## 1. ハーネス再設計の3原則

### 原則① Constitution as Code, Not as Comment.

> 思想を文書だけで定義すると、実装が思想を参照する経路が「人間が思い出す」しかなくなる。

**具体化**：
- `lib/constitution/` をシングルソース・オブ・トゥルースに昇格させる
- `AGENTS.md` §7、`docs/input/concepts/COCOSiL設計中枢.md`、`docs/input/concepts/language-design-v1.md`、`.claude/skills/cocosil-domain/SKILL.md` のすべてが「`lib/constitution/` を正とする」と明記
- ドリフト時はコードを正とする（文書はコメンタリー扱い）

### 原則② Independent Judgment by Default.

> 自己チェックは思考を強制するためのもの。「合格判定の根拠」にはならない（71%通過の研究）。

**具体化**：
- PR template の5問を「実装者判定列」と「レビュアー判定列」に物理分離
- 両者が一致しないPRをCIが警告（マージはブロックしない、警告のみ）
- `/start-task` 判定 = 「初期見立て」、PR template判定 = 「実装後の再判定」と役割を区別

### 原則③ Living Loop, Not Living Document.

> 観察 → 評価 → 改善が回らない実装は「死んでいる」と見なす。

**具体化**：
- Phase A の完了定義を「migration + telemetry実装」から「APIルートからの送信 + ダッシュボード監視 + 改善仮説接続」に厳格化
- 途中段階の実装は「Phase A 30%完了」のように分母を明示

### 隠れた法則④ PMF metric and Reflection metric must be measured together.

> 7日再訪率↑ AND 内省スコア↑ = 真のPMF。
> 7日再訪率↑ AND 内省スコア↓ = Sycophancy疑惑。

**具体化**：PostHog ダッシュボードで両指標の二軸プロットを定義し、Sycophancy疑惑エリアにアラート設定。

---

## 2. 機械化メカニズムの全体像

```
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 0：思想定義（Constitution as Code）                            │
│  lib/constitution/                                                   │
│    ├── ux-sequence.ts   — UXシーケンス順序の machine-readable 定義   │
│    ├── banned-words.ts  — 禁止語彙の正リスト                         │
│    ├── immutables.ts    — Constitution（Policy / 評価指標定義）      │
│    ├── mutables.ts      — 進化対象（Prompt / Memory / Output ...）   │
│    └── index.ts         — main export                                │
└─────────────────────────────────────────────────────────────────────┘
                            ↑ import
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 1：機械的検証（Reversibility-First）                          │
│  既存：.claude/hooks/prevent-destructive-command.js（12パターン）    │
│  新規：lib/prompts/__tests__/                                        │
│       禁止語彙（banned-words.ts）の不混入を Vitest で検証            │
│  新規：lib/diagnostics/__tests__/                                    │
│       同一入力 → 同一出力 の決定論的保証（G1解消）                   │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 2：独立判定（Independent Judgment）                           │
│  改修：.github/pull_request_template.md                              │
│       実装者判定列 / レビュアー判定列 / 差分列 に分離                │
│  新規：.github/workflows/disagreement-detector.yml                   │
│       両列の差分を自動計算 → 差分があれば PRコメントで警告           │
│  改修：.claude/commands/start-task.md                                │
│       「初期見立て」と明示。PR template判定とは役割分離              │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 3：閉ループ運用（Living Loop）                                │
│  改修：app/api/chat/**/route.ts（F3実装時）                          │
│       trackChatPhaseTransition の挿入                                │
│  新規：PostHog ダッシュボード「再訪率 vs 再言語化率」二軸プロット    │
│       Sycophancy疑惑エリア（再訪率↑/内省↓）にアラート               │
│  新規：.github/workflows/drift-check.yml                             │
│       週次：5問記入差分集計 / 禁止語彙差分 / PMF/内省相関を Slack へ│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 実装計画（フェーズ別）

### 🔴 Phase 1: 今週中（解消対象 C1, C2, C4）

#### Action 1: `lib/constitution/` 新規作成（半日）

**目的**：Constitution as Comment → Constitution as Code

**ファイル構成**：

```typescript
// lib/constitution/banned-words.ts
export const BANNED_WORDS = [
  '占い',
  '占い師',
  '鑑定',
  '運勢',
  '占星術',
  '当たる',
  '当たった',
  '霊感',
  '霊視',
] as const

export type BannedWord = typeof BANNED_WORDS[number]

export function findBannedWords(text: string): BannedWord[] {
  return BANNED_WORDS.filter((word) => text.includes(word))
}
```

```typescript
// lib/constitution/ux-sequence.ts
export const UX_SEQUENCE = ['empathy', 'safety', 'analysis', 'action'] as const
export type UxPhase = typeof UX_SEQUENCE[number]

export const PHASE_LABELS_JP: Record<UxPhase, string> = {
  empathy: '共感',
  safety: '安心',
  analysis: '分析',
  action: '行動',
}

export function isValidTransition(from: UxPhase | null, to: UxPhase): boolean {
  if (from === null) return to === 'empathy'
  const fromIdx = UX_SEQUENCE.indexOf(from)
  const toIdx = UX_SEQUENCE.indexOf(to)
  return toIdx === fromIdx || toIdx === fromIdx + 1
}
```

```typescript
// lib/constitution/immutables.ts
export const POLICY_IMMUTABLES = {
  forbidden: ['三毒増幅（貪・瞋・痴の煽り）', '主観満足度の最大化'],
  required: ['共感→安心→分析→行動 順序の遵守', '禁止語彙の不混入'],
} as const

export const REFLECTION_METRICS = [
  'rephrasing_rate',         // 再言語化率
  'contradiction_acceptance', // 矛盾受容率
  'action_specificity_score', // 行動記録の具体度
] as const

export const PMF_METRICS = ['session_return_7d_rate'] as const
export const PMF_THRESHOLD = 0.30 // 30%
```

```typescript
// lib/constitution/mutables.ts
export const MUTABLE_PATHS = [
  'lib/prompts/**',
  'lib/data/**',
] as const

export const MUTABLE_STRATEGIES = [
  'memory_strategy',
  'retrieval_policy',
  'output_structure',
  'eval_threshold',
] as const
```

```typescript
// lib/constitution/index.ts
export * from './banned-words'
export * from './ux-sequence'
export * from './immutables'
export * from './mutables'

export const CONSTITUTION_VERSION = '1.0.0'
export const CONSTITUTION_AS_OF = '2026-05-05'
```

**文書側の更新**：
- `AGENTS.md` §7 末尾に「**Constitution as Code**: `lib/constitution/` を単一の真実とする。本文書とコードがドリフトした場合はコードを正とする」と追記
- `language-design-v1.md` の禁止語テーブル冒頭に「正は `lib/constitution/banned-words.ts`」と注記
- `cocosil-domain skill` の禁止語テーブル冒頭にも同注記

#### Action 2: PR template 2列分離（30分）

**目的**：Independent Judgment by Default を構造化

**改修案**（`.github/pull_request_template.md` 行22-31を置換）：

```markdown
## 設計中枢チェック（独立判定）

> 実装者とレビュアーが**独立に**判定する。判定が割れたPRは Disagreement Detector が
> 自動でコメントを付け、議論を促す。割れること自体は欠陥ではなく、設計中枢が
> 機能している証拠（Disagreement is a Feature）。

| 問い | レベル | 実装者判定 | レビュアー判定 | 実装者根拠 |
|---|---|---|---|---|
| Q1 無明を晴らすか？ | 🔴 Must | <!-- ○/△/×/N/A --> | <!-- 空欄 --> | <!-- 1行 --> |
| Q2 三毒を増幅していないか？ | 🔴 Must | <!-- ○/△/×/N/A --> | <!-- 空欄 --> | <!-- 1行 --> |
| Q3 共感→安心→分析→行動 順序を守れるか？ | 🔴 Must | <!-- ○/△/×/N/A --> | <!-- 空欄 --> | <!-- 1行 --> |
| Q4 大我への移行を支援するか？ | 🟡 Should | <!-- ○/△/×/N/A --> | <!-- 空欄 --> | <!-- 1行 --> |
| Q5 良い人間関係に寄与するか？ | 🟡 Should | <!-- ○/△/×/N/A --> | <!-- 空欄 --> | <!-- 1行 --> |

> **レビュアーへの依頼**：実装者判定を**見ずに**自分で判定してから、実装者判定を
> 見て差分を議論してください（バイアス回避）。

<!-- Should が × の場合、戦略的意味をここに明文化: -->
```

**新規 GitHub Actions**（`.github/workflows/disagreement-detector.yml`）：

```yaml
name: Disagreement Detector
on:
  pull_request:
    types: [opened, synchronize, edited]
jobs:
  detect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            const body = context.payload.pull_request.body || ''
            // 実装者判定列・レビュアー判定列を抽出
            const rows = body.match(/\|\s*Q\d[^\n]+\|/g) || []
            const disagreements = rows.filter((row) => {
              const cols = row.split('|').map(c => c.trim())
              const impl = cols[3]
              const rev = cols[4]
              return rev && rev !== '' && impl !== rev && !rev.startsWith('<!--')
            })
            if (disagreements.length > 0) {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: `⚠️ **Disagreement detected** — 実装者とレビュアーの判定が ${disagreements.length} 件割れています。これは設計中枢が機能している証拠です。1〜2分で議論してください。\n\n${disagreements.join('\n')}`,
              })
            }
```

**`/start-task` 改修**：`start-task.md` Step 2.5 の判定を「**初期見立て**」と明示し、PR template の判定とは独立で再判定する旨を明記。

#### Action 3: `lib/prompts/__tests__/` 即時導入（半日）

**目的**：C4 解消（禁止語彙の機械化を G10 から先行）

```bash
pnpm add -D vitest
```

**設定** (`vitest.config.ts`)：

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  test: {
    environment: 'node',
    include: ['lib/**/__tests__/**/*.test.ts'],
  },
})
```

**`package.json` への追加**：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**最初のテスト**（`lib/prompts/__tests__/banned-words.test.ts`）：

```typescript
import { describe, expect, test } from 'vitest'
import { findBannedWords } from '@/lib/constitution/banned-words'
import { WELCOME_SYSTEM_PROMPT } from '@/lib/prompts/onboarding'
import {
  CONTRADICTION_PROMPT_WITH,
  CONTRADICTION_PROMPT_WITHOUT,
} from '@/lib/prompts/contradiction-handling'

describe('lib/prompts: 禁止語彙の不混入（Constitution as Code）', () => {
  test('onboarding: WELCOME_SYSTEM_PROMPT に禁止語彙が含まれない', () => {
    expect(findBannedWords(WELCOME_SYSTEM_PROMPT)).toEqual([])
  })

  test('contradiction-handling: CONTRADICTION_PROMPT_WITH に禁止語彙が含まれない', () => {
    expect(findBannedWords(CONTRADICTION_PROMPT_WITH)).toEqual([])
  })

  test('contradiction-handling: CONTRADICTION_PROMPT_WITHOUT に禁止語彙が含まれない', () => {
    expect(findBannedWords(CONTRADICTION_PROMPT_WITHOUT)).toEqual([])
  })
})

describe('lib/prompts: 必須キーワード（共感フェーズ）', () => {
  test('onboarding: 共感フェーズのキーワードが含まれる', () => {
    const text = WELCOME_SYSTEM_PROMPT
    const empathyKeywords = ['気持ち', '聞かせて', '受け取', '感じ']
    expect(empathyKeywords.some((k) => text.includes(k))).toBe(true)
  })
})
```

**CI 連携**（`.github/workflows/ci.yml` に追加）：

```yaml
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.13.1
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
```

これで **G1（テストコマンド未整備）** と **G10（プロンプト回帰テスト未整備）** が部分解消する。

---

### 🟡 Phase 2: 来週〜2週間（解消対象 C5, C6, C8）

#### Action 4: Phase A 観察ループの完結

**目的**：C5 解消（観察データを「死んだ資産」から「生きたループ」へ）

- F3実装時に `app/api/chat/**/route.ts` の各フェーズ遷移点で `trackChatPhaseTransition` を呼ぶ
  - `lib/constitution/ux-sequence.ts` の `isValidTransition` でガード
- PostHog ダッシュボード「Reflection Spectrum」を新規作成
  - X軸：7日再訪率（PMF指標）
  - Y軸：再言語化率（内省指標）
  - 右下象限（再訪率↑ / 内省↓）= **Sycophancy疑惑エリア** にアラート
- ダッシュボードURL を `HARNESS_HEALTH.md` に記録

#### Action 5: 週次ドリフト検知の自動化

**目的**：C8 解消（割れ体験の集計・通知）

`.github/workflows/drift-check.yml`（cron実行）：

```yaml
name: Weekly Drift Check
on:
  schedule:
    - cron: '0 0 * * MON'  # 毎週月曜 00:00 UTC
  workflow_dispatch:
jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - name: Run drift detection
        run: node .github/scripts/drift-check.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          POSTHOG_API_KEY: ${{ secrets.POSTHOG_API_KEY }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

`.github/scripts/drift-check.js` で実装する集計：
1. 過去1週のクローズドPRから5問判定の差分を集計（GitHub API）
2. `lib/prompts/` のdiff から禁止語彙混入候補を抽出
3. PostHog から PMF/内省指標の相関係数を取得
4. Slack に「今週のドリフト報告」を投稿

---

### 🟢 Phase 3: Sprint 3 以降（解消対象 C3, C7, 残る Eval系）

| # | 内容 | 解消するC |
|---|---|---|
| Action 6 | `promptfoo` 導入 + 設計中枢5問 Eval ルーブリック化 | C4 拡張（LLM判定の Two-tier化） |
| Action 7 | `/start-task` と PR template の判定関係を明文化（`AGENTS.md` §7 内） | C3 |
| Action 8 | C7 緩和：機械判定可能な部分を拡張し、えんまさレビューを「コア部分のみ」に縮減 | C7 |
| Action 9 | Phase A→B 移行ゲート（ユーザー50人到達時）の自動判定 | Autogenesis |
| Action 10 | Phase C Bootstrap protocol（再帰的Bootstrap Paradox対策） | Autogenesis |

---

## 4. ハーネスの「自己監視」仕様

このハーネス自身が設計中枢の3原則を体現するため、以下の自己テストを定期実行する。

### 自己テスト1: Constitution Code Drift Test

```typescript
// lib/constitution/__tests__/drift.test.ts
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { BANNED_WORDS } from '@/lib/constitution/banned-words'

describe('Constitution Drift: lib/constitution と文書の整合', () => {
  test('language-design-v1.md の禁止語が banned-words.ts に全て存在', () => {
    const md = readFileSync(
      path.resolve(__dirname, '../../../docs/input/concepts/language-design-v1.md'),
      'utf-8',
    )
    const expectedFromDoc = ['占い', '占い師', '鑑定', '運勢', '占星術', '当たる', '霊感', '霊視']
    for (const word of expectedFromDoc) {
      expect(md).toContain(word)  // 文書に存在
      expect(BANNED_WORDS as readonly string[]).toContain(word)  // コードにも存在
    }
  })
})
```

これにより、**文書とコードの整合性が機械的に検証される**。ドリフトが発生したらCIで即発覚する。

### 自己テスト2: Independent Judgment Test

`disagreement-detector.yml` 自体を `.github/scripts/__tests__/` で単体テストする（PR本文のパース処理）。

### 自己テスト3: Living Loop Health Check

週次の `drift-check.yml` が **連続2週間 0件報告** の場合、それは「設計中枢が形骸化している兆候」として Slack に警告投稿する（Disagreement is a Feature 原則の機械化）。

---

## 5. 受け入れ基準（Definition of Done）

各 Phase の完了条件を明記する。

### Phase 1 完了条件

- [ ] `lib/constitution/` の5ファイル（index / banned-words / ux-sequence / immutables / mutables）がコミット済み
- [ ] `AGENTS.md` §7 末尾に「Constitution as Code: `lib/constitution/` を正とする」追記
- [ ] `language-design-v1.md` の禁止語テーブル冒頭に同注記
- [ ] `cocosil-domain skill` の禁止語テーブル冒頭に同注記
- [ ] `.github/pull_request_template.md` の Q1〜Q5 が 4列表（問い / 実装者 / レビュアー / 根拠）に分離
- [ ] `.github/workflows/disagreement-detector.yml` が動作（テストPRで確認）
- [ ] `.claude/commands/start-task.md` Step 2.5 に「初期見立て」明記
- [ ] `pnpm add -D vitest` 完了
- [ ] `package.json` に `test` スクリプト追加
- [ ] `lib/prompts/__tests__/banned-words.test.ts` が CI で通過
- [ ] `.github/workflows/ci.yml` に `test` ジョブ追加
- [ ] `lib/constitution/__tests__/drift.test.ts`（自己監視テスト）が CI で通過
- [ ] `HARNESS_HEALTH.md` G1（テストコマンド未整備）と G10（プロンプト回帰テスト）の状態を「部分解消」に更新

### Phase 2 完了条件

- [ ] F3実装時に `trackChatPhaseTransition` が `app/api/chat/` の全フェーズ遷移点で呼ばれている
- [ ] PostHog ダッシュボード「Reflection Spectrum」が動作・URL記録
- [ ] Sycophancy疑惑エリアにアラート設定済み
- [ ] `.github/workflows/drift-check.yml` が初回実行成功（Slack投稿確認）
- [ ] `HARNESS_HEALTH.md` G10 Phase A の状態を更新

### Phase 3 完了条件

- [ ] `promptfoo` で設計中枢5問が LLM-as-a-Judge として動作
- [ ] PR template / `/start-task` / `/cocosil-work` の役割分担が `AGENTS.md` §7 で明文化
- [ ] えんまさレビューの守備範囲が機械判定対象を除外して縮減（C7緩和）
- [ ] `prompt_versions` テーブルと Phase C Bootstrap protocol が整備

---

## 6. リスクと対策

| リスク | 対策 |
|---|---|
| Constitution as Code 化により文書とコードが二重管理になりドリフトする | Action 1 の Drift Test を Phase 1 完了条件に含める。文書はコメンタリー扱いと明示 |
| Disagreement Detector が「形式的」になり実際の議論を生まない | 連続2週間 0件警告で「形骸化アラート」（自己テスト3） |
| えんまさが Phase 1 アクションでさらに過負荷になる | Action 1〜3 はヒラメが実装、えんまさはレビューのみ。ヒラメに着手させる前に本提案の承認だけ得る |
| F3未着手の段階で `lib/prompts/__tests__/` を入れると過剰投資にならないか | 既存プロンプト2本（onboarding / contradiction-handling）が対象。テストコストは半日。延期するメリットがない |
| Phase 2 の PostHog ダッシュボードが Phase A 50人到達まで意味をなさない | ダッシュボードは「先行整備」。データが流れ始めれば即可視化される。設計コストは低い |

---

## 7. 採用判断ゲート

このハーネス再設計提案は、以下のゲートを通過した場合のみ採用する：

1. **設計中枢 5問チェック**（提案自身に対するメタ適用）
   - Q1（無明を晴らすか）：✅ 設計思想と実装のドリフトという「自己への無知」を晴らす
   - Q2（三毒を増幅しないか）：✅ Document Inflation（痴：混乱）を制御する
   - Q3（順序を守れるか）：N/A（開発体制への影響であり、UXシーケンスへの直接影響なし）
   - Q4（大我への移行）：✅ 「反応的な実装」から「観察できる実装」へ
   - Q5（良い人間関係）：N/A（同上）
   - **判定**：Must 全て ○/N/A、Should ○ → 承認候補

2. **えんまさのレビュー**
   - 腑落ち体験の主観一致 — 「ハーネスがハーネスのユーザーになる」構造が COCOSiL らしいか
   - UXシーケンス確認 — N/A（開発体制への影響）

3. **着手前のチームへの説明**
   - ヒラメ（Phase 1 実装担当）が「Action 1〜3 を半日 + 30分 + 半日でやれる」と合意
   - まあみ（Phase 2 観察ダッシュボード関連）が PostHog ダッシュボードの監視を週次で確認できる

---

## 8. このハーネスが COCOSiL らしさ を体現する仕方

最後に、本提案がプロダクト哲学そのものを体現していることを言語化する。

| 設計中枢の原則 | このハーネスの該当 |
|---|---|
| **① Dispel, Don't Decorate**（無明を晴らす、装飾しない） | 文書を増やさず、コードに移行する。装飾的な「整合性チェック」を排し、機械判定で根本を晴らす |
| **② From Reaction to Reflection**（反応から観察へ） | 「えんまさが反応的に全PR動作確認する」C7 構造を、機械可読Constitutionによる観察モードに移行 |
| **③ Self-Knowing for Better-Relating**（自己を知るのは、関わるため） | ハーネスがハーネス自身を観察し（Drift Test / Disagreement Detector）、チーム3人の関係を消耗させない構造を作る |

つまり、**このハーネス再設計はCOCOSiL哲学の「開発体制への自己適用」**である。プロダクトがユーザーに届ける止観構造を、開発側でも回す。

---

*以上 — harness-redesign-proposal-2026-05-05.md*
