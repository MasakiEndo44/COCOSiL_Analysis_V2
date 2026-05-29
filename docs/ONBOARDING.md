---
doc_id: canonical.cocosil.onboarding
title: COCOSiL V2 へようこそ — 最初に読む
doc_type: onboarding
product: cocosil
layer: canonical
status: draft
proposed_by: endo
proposed_at: 2026-05-03
audience: [hirame, maami, ai-agent]
---

# COCOSiL V2 へようこそ

> **自分を知って、ラクになる。**  
> 対人関係で繰り返し消耗する人たちに、「なぜそうなるか」をAIで届けるプロダクトです。  
> ここに書いてあることを読めば、今日から動けます。

---

## あなたへのナビ（最初にここを読む）

**ヒラメ（バックエンド）**  
→ あなたの主戦場は `app/api/**` と `supabase/`。最初にやること: `pnpm db:types` で型を生成してから `/start-task #<Issue番号>` でブランチを切る。  
→ 今の担当タスク一覧: [docs/TASK-INDEX.md](TASK-INDEX.md) の「ヒラメ」列を確認。

**まあみ（フロントエンド）**  
→ あなたの主戦場は `app/**`・`components/**`。最初にやること: `pnpm install` → `pnpm dev` で開発サーバーを起動し、`http://localhost:3000` を確認する。  
→ UIを作るときは [docs/harness/DESIGN_FLOW.md](harness/DESIGN_FLOW.md) に従う。**まあみがやること: 案の選定と目視確認だけ。** それ以外はAIパートナーが実行する。  
→ 今の担当タスク一覧: [docs/TASK-INDEX.md](TASK-INDEX.md) の「まあみ」列を確認。

**AIエージェント（パートナーAI）**  
→ 下の「⛔ これだけは守る」を最初に読む。迷ったら `/cocosil-work` を呼ぶ。タスク着手は必ず `/start-task`、完了は `/finish-task`。

**Cursor利用者**  
→ `.cursor/rules/` に主要ルールが注入済み（`alwaysApply: true`）。スキルはチャットで「〇〇スキルを使って」と呼ぶ。コマンドは「着手する」「完了する」等のトリガーワードで等価動作する（詳細: `.cursor/rules/03-workflow.mdc`）。

---

## 設計中枢（Layer 0）— すべての判断の最上位基準

> 全文: [docs/input/concepts/COCOSiL設計中枢.md](input/concepts/COCOSiL設計中枢.md)  
> 議論ログ: [docs/discussions/20260503_議論ログ_設計中枢.md](discussions/20260503_議論ログ_設計中枢.md)

COCOSiLのすべての機能・コピー・プロンプトの判断は、次の**Why → How → So What**の三段論法に基づく:

| 層 | 根拠 | プロダクトへの適用 |
|---|---|---|
| **Why** | 無明（仏陀）/ 自知者明（老子） | 対人関係の消耗の根源は「自己への無知」 |
| **How** | 三毒・五蘊・パンチャ構造（4+1=5）・止観 | 4体系統合はパンチャ構造の論理的必然。「共感→安心→分析→行動」は止観の往還運動 |
| **So What** | ハーバード成人発達研究（80年） | 自己理解は終点でなく「良い人間関係」への入口 |

### 設計3原則

| 原則 | 意味 |
|---|---|
| **① Dispel, Don't Decorate.** | 「自己理解の解像度を上げるか？」だけで判断する。SNS映え・目新しさは入れない |
| **② From Reaction to Reflection.** | 三毒（欲・怒り・混乱）を増幅する設計を絶対に入れない |
| **③ Self-Knowing for Better-Relating.** | 自己理解は終点でなく、良い人間関係への入口。これがすべての機能の最終評価軸 |

### 5問のリトマス試験紙（新機能・コピー・プロンプト判断時）

| # | 問い | レベル |
|---|---|---|
| Q1 | 無明を晴らすか？（自己理解の解像度を上げるか） | 🔴 Must |
| Q2 | 三毒を増幅していないか？ | 🔴 Must |
| Q3 | 共感→安心→分析→行動の順序を守れているか？ | 🔴 Must |
| Q4 | 大我への移行を支援するか？（小我の強化でないか） | 🟡 Should |
| Q5 | 良い人間関係に寄与するか？（ハーバード基準） | 🟡 Should |

**Must（Q1〜Q3）は1つでも × なら不採用**。Should は × でも戦略的意味の明文化があれば許容。

> **ゲートは自動化されている**: `/start-task` を実行すると、タスク着手前にこの5問が自動で実行される。開発者が意識しなくても、承認ゲートとして機能する。

### 実運用のアンチパターン（設計中枢が死ぬパターン）

| パターン | 症状 | 防止策 |
|---|---|---|
| **記念碑化** | 「あの文書良かったよね」と言われるが判断時に参照されない | 3原則を口語で使う（「これDispel?」「三毒増幅してない?」） |
| **単一解釈者化** | えんまさしか5問に答えられない | えんまさ・ヒラメが独立判定して差分を議論する |
| **チェックボックス化** | 「通した」事実が目的化し、実際の判断に影響しない | 「割れること」を正常作動と見なす。毎月1回は判断が割れる機会を作る |

---

## ⛔ これだけは守る

これに違反するとCIが落ちるか、データが壊れるか、信頼が壊れます。

| ルール | 理由 |
|---|---|
| **`pnpm` のみ使う**（`npm install` / `yarn add` 禁止） | lockファイルが競合してCI/CDが壊れるため |
| **`src/` ディレクトリは存在しない**（`@/*` はルート直下）| パスエイリアスがルートにマップされており、`src/` を作ると全importが壊れる |
| **環境変数は `@/lib/env` 経由でのみ読む**（`process.env.XXX` 直接禁止） | バリデーション漏れによる実行時エラーを防ぐため |
| **ブランチは `/start-task <タスク名>` で作る**（`git checkout -b` 禁止） | 担当ガード確認・命名規則チェックを自動化するため |
| **`.env*` / `supabase/migrations/**` には触れない** | 本番DBとシークレットへの直接影響があるため。hookがブロックする |
| **UIコピーに「占い・鑑定・運勢・霊感」を使わない** | COCOSiLはスピリチュアルサービスではなく「根拠のある性格分析」のため |
| **UXシーケンスを変えない**: 共感 → 安心 → 分析 → 行動 | この順序が壊れると7日以内再訪率30%のPMF仮説が成立しなくなる |

---

## プロジェクト地図

```
cocosil_analysis_v2/
├── app/              ← ページ・APIルート（Layer 3: まあみ・ヒラメ）
│   ├── (auth)/       ← 認証後ページ（まあみ）
│   ├── (public)/     ← 未認証ページ（まあみ）
│   └── api/          ← APIルート（ヒラメ）
├── components/       ← UIコンポーネント（Layer 3: まあみ）
├── lib/
│   ├── env.ts        ← 環境変数の唯一の入口
│   ├── prompts/      ← AIプロンプト（Layer 2: えんまさ承認必須）
│   ├── data/         ← 4体系ナレッジ（Layer 2: えんまさ承認必須）
│   └── diagnostics/  ← 診断ロジック（Layer 2: えんまさ承認必須）
├── supabase/
│   └── migrations/   ← DBマイグレーション（Layer 1: 人間のみ実行）
├── docs/             ← ドキュメント一式
│   ├── ONBOARDING.md ← 今ここ
│   ├── input/        ← 人間→AIへのインプット素材
│   ├── output/       ← AI生成成果物（要件定義書など）
│   └── discussions/  ← 議論ログ
├── AGENTS.md         ← AI・人間向けの詳細ルール集（必ず読む）
└── .claude/
    └── commands/     ← /start-task, /finish-task, /cocosil-work
```

**担当ガード早見表**

| Layer | エリア | 変更できる人 |
|---|---|---|
| Layer 1（保護） | `supabase/migrations/**`, `.env*`, `clerkMiddleware` | 人間のみ（hookがブロック） |
| Layer 2（承認必須） | `lib/prompts/**`, `lib/data/**`, `lib/diagnostics/**` | えんまさ承認後に実装 |
| Layer 3（AI委任OK） | `app/**`, `components/**`, `app/api/**` | ヒラメ・まあみ・AI |

---

## 最初の30分でやること

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 環境変数の設定（SupabaseのURL・Anon Key・ClerkキーをえんまさからもらってSlackで受け取る）
cp .env.example .env.local
# .env.local に値を記入

# 3. 開発サーバー起動
pnpm dev
# → http://localhost:3000 で確認

# 4. 自分の担当タスクを確認
# → docs/TASK-INDEX.md を開いて自分の名前の行を探す
# → 「🟡実装中」行のTSKファイルを開いて「参照ドキュメント」セクションを確認

# 5. タスクを始めるとき（Issue番号が分かっている場合）
/start-task #27
# → 設計中枢チェック → Issue/TSK紐づけ確認 → ブランチ提案 → 作業開始

# タスクの説明から始める場合
/start-task DB構造の整理
# → 同上（途中でIssue番号の確認が入る）
```

---

## 困ったときの地図

| 困りごと | 使うスキル / 場所 |
|---|---|
| **自分の今のタスクに必要な文書を探したい** | [`docs/TASK-INDEX.md`](TASK-INDEX.md) — 機能×フェーズ×TSKファイルのマトリクス |
| **F\<N\>の要件を確認したい** | [`docs/output/requirements/cocosil_v2_detailed_requirements_specification.md`](output/requirements/cocosil_v2_detailed_requirements_specification.md) §4.\<N\> |
| **TSKファイルの書き方が分からない** | [`docs/output/tasks/_TEMPLATE.md`](output/tasks/_TEMPLATE.md) |
| タスクを始めたい | `/start-task #<Issue番号> または <タスク説明>`（設計中枢チェック + Issue/TSK紐づけが自動実行） |
| 実装中に「これCOCOSiLらしいか？」迷った | `/cocosil-work`（設計3原則・担当ガード・UXシーケンスを再確認） |
| UIコピー・AIプロンプトを書く前 | `/language-design`（禁止語チェック） |
| タスク完了・PRを出したい | `/finish-task`（TSKファイル鮮度チェックが自動実行） |
| 複数視点でブレストしたい | `/expert-misaki-discussion` |
| 認証・DB・APIルート変更の前 | `/security-sensitive-change-review` |
| プロダクト哲学の詳細を確認したい | [`AGENTS.md`](../AGENTS.md) セクション 0〜2 |
| 担当ガード・保護ファイルの詳細 | [`AGENTS.md`](../AGENTS.md) セクション 7 |

---

> 詳細ルールはすべて [`AGENTS.md`](../AGENTS.md) にあります。  
> このドキュメントは「今日動き出すための地図」です。ルールの根拠・例外・背景は AGENTS.md を読んでください。
