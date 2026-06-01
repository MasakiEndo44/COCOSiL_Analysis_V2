<!-- BEGIN:nextjs-agent-rules -->
# このNext.jsは知っているNext.jsではない

このバージョンには破壊的変更が含まれており、API・規約・ファイル構造がトレーニングデータと異なる場合がある。コードを書く前に `node_modules/next/dist/docs/` の関連ガイドを必ず読むこと。非推奨警告に従うこと。
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:cursor-compat -->
> **Cursor利用者へ**: このファイルはCursor IDEでも自動読み込みされます。
> `.cursor/rules/` に重要ルールのエッセンスが凝縮されています（`alwaysApply: true`）。
> ルールが矛盾する場合は **このAGENTS.mdを正** として `.cursor/rules/` を更新してください。
<!-- END:cursor-compat -->

# COCOSiL V2 エージェント向けガイドライン

## 0. プロダクト哲学（なぜこのプロダクトを作るか）

> 🧭 **設計中枢（Layer 0）**: すべての機能・コピー・プロンプト判断の最上位基準。
> 全文: `docs/input/concepts/COCOSiL設計中枢.md`

COCOSiLは「現代の無明（むみょう）」を解消するために存在する。現代人は職場・恋愛・家族との関係で繰り返し消耗するが、その根因は「自分も相手も、なぜそうなるかを知らない」ことにある。東洋哲学が2500年追求した「自己認識による解放」をAIで民主化する。

### 設計中枢の三段論法（Why → How → So What）

| 層 | 哲学的素材 | プロダクトへの適用 |
|---|---|---|
| **Why** | 無明（仏陀）/ 自知者明（老子） | 対人関係の消耗は「自己への無知」が根源 |
| **How** | 三毒・五蘊・パンチャ構造（4+1=5）・止観 | 4体系統合は機能の足し算でなくパンチャ構造の論理的必然 |
| **So What** | ハーバード成人発達研究（80年） | 自己理解は終点でなく「良い人間関係」への入口 |

### 設計3原則（すべての判断の最上位基準）

> **① Dispel, Don't Decorate. — 無明を晴らす、装飾しない。**
> 機能・コピー・プロンプトは「自己理解の解像度を上げるか？」だけで判断する。SNS映え・目新しさ・エンタメ的足し算は入れない。

> **② From Reaction to Reflection. — 反応から、観察へ。**
> 三毒（貪・瞋・痴）を増幅する設計は絶対に入れない。体験は「反応してしまう自分（小我）」から「観てから選ぶ自分（大我）」への移行を支援する。

> **③ Self-Knowing for Better-Relating. — 自己を知るのは、関わるため。**
> 自己理解は終点ではない。良い人間関係への入口である。ハーバード研究の発見がすべての機能の最終評価軸。

### 5問のリトマス試験紙（新機能・コピー・プロンプト判断時に必ず通す）

| # | 問い | レベル |
|---|---|---|
| Q1 | 無明を晴らすか？（自己理解の解像度を上げるか） | 🔴 Must |
| Q2 | 三毒を増幅していないか？（欲・怒り・混乱を煽っていないか） | 🔴 Must |
| Q3 | 共感→安心→分析→行動の順序を守れているか？ | 🔴 Must |
| Q4 | 小我の強化ではなく、大我への移行を支援するか？ | 🟡 Should |
| Q5 | 良い人間関係に寄与するか？（ハーバード基準） | 🟡 Should |

**判定ルール**: Must（Q1〜Q3）は1つでも × なら採用しない。Should（Q4〜Q5）は × でも戦略的意味を明文化すれば許容。

### 用語運用の鉄則

- **チーム内議論**: 仏教用語で厚く（「無明」「三毒」）。「気づきの不足」と言ってはいけない——重みが消えると判断が劣化する。
- **対外発信**: 現代語に翻訳（「イライラ／モヤモヤ」「つい〇〇しちゃう私」）。逆はやらない。
- 翻訳テーブル全文: `docs/input/concepts/COCOSiL設計中枢.md` §6

### 非交渉のUXシーケンス

```
共感 → 安心 → 分析 → 行動
```

この順序は絶対に変えない。仏教の止観構造（止=反応を止める → 観=パターンを命名する）に根ざしており、順序を崩すと「腑落ち体験」が消えてPMF仮説が成立しなくなる。

### PMF成功基準

- 7日以内再訪率 **30%以上**
- この基準を割るような実装判断（共感スキップ・診断結果の即時表示など）はえんまさの承認なしに行ってはならない。

## 1. API-First 設計 & 型安全な契約

- **厳格ルール:** APIリクエスト/レスポンスの型定義をTypeScriptで完成させmainブランチにマージするまで、フロントエンド実装を開始してはならない。
- **コントラクト駆動開発:** 型定義が確定するまで、フロントエンドは合意済みの型に基づいたモックデータで開発を進める。実装の手戻りを防ぐため。
- **Server Actions不使用（厳格ルール）:** Next.js Server Actions（`"use server"` ディレクティブを使った関数）はビジネスロジックに使用しない。バックエンドの全処理（診断計算・DB書き込み・認証チェック）は `app/api/**` の API Route Handler で実装する。Clerk の `auth()` も API Route ハンドラ内で直接呼ぶ（Server Action経由不要）。

## 2. レイヤードアーキテクチャ（役割分担）

- **バックエンド/インフラ層:** Supabaseセットアップ・DBスキーマ設計・RLS設定・API型定義・コアロジックを担当。データ構造とセキュリティを保証する。
- **フロントエンド/要件層:** 詳細要件・UI/UX実装・Next.js App Router Server Componentsを活用した効率的なフロントエンド開発を担当。

## 3. 技術スタック & SOP

- **スタック:** Next.js 16（App Router必須）, Supabase, Clerk（認証）, OpenAI（F3 共感AIチャット）, Vercel OG / gpt-image-2（F3 統合レポート生成）, Vercel, Tailwind CSS 4, TypeScript 5。
- **Vercel OG / gpt-image-2注意：** F3（統合レポート）の主要依存。フェーズ1〜2は `@vercel/og`（Satori）で文字崩れゼロ・即時生成。フェーズ3以降でgpt-image-2（OpenAI）を背景/アイコン専用として追加。Gamma APIからの移行確定（2026-05-07）。設計根拠: `docs/discussions/20260507_議論ログ_imager2アーキ選定.md`
- **実行環境:** Unixベース環境（Mac または WSL2）のみ。
- **環境変数:** `.env.local` で管理。リポジトリには絶対にコミットしない。アプリケーションコード内では `@/lib/env` 経由でのみ読む。`process.env` の直接参照禁止。

## 4. リソース制約 & データベース戦略

- **ストレージ上限:** Supabaseは無料枠（最大0.5GB）。テキストデータ（チャット履歴等）はインデックスを最小化し、上限超過を防ぐための積極的な**削除/アーカイブ戦略**を初日から実装すること。
- **プロジェクト数制限:** 古い・未使用のSupabaseプロジェクトは一時停止し、V2のリソースを確保する。

## 5. 開発環境 — 絶対に守るルール

- **パッケージマネージャ:** `pnpm` のみ使用。`npm install` / `yarn add` は禁止。常に `pnpm add` / `pnpm install` を使う。
- **`src/` ディレクトリは存在しない:** パスエイリアス `@/*` は `./*`（プロジェクトルート）にマップされる。ファイルは `app/`・`lib/`・`public/` 直下に置く。`src/app/` や `src/lib/` は存在しない。
- **環境変数の読み方:** `@/lib/env` の `env`（クライアント用）または `getServerEnv()`（サーバー用）を使う。アプリケーションコードで `process.env.XXX` を直接読まない。
- **Supabase型定義:** `pnpm db:types` で生成する（リモートプロジェクト接続）。手書き禁止。
- **DBスキーマ変更:** テーブル追加・カラム変更・RLS変更など DB スキーマの更新が必要な場合は、必ず `supabase/migrations/` に差分マイグレーションファイル（例: `20260601000000_add_xxx.sql`）を追加する。`supabase/migrations/**` は Layer 1 保護対象のため、`supabase migration repair` や `supabase db reset` は人間が手動実行する（hookでブロック）。
- **Zodのimport:** `zod/v4` サブパスを使う: `import { z } from 'zod/v4'`。
- **Supabase MCP:** `.mcp.json` でプロジェクト共有設定済み。使用にはシェル環境変数 `SUPABASE_ACCESS_TOKEN` が必要（`~/.zshrc` に `export SUPABASE_ACCESS_TOKEN=sbp_...` を追記）。トークンは https://supabase.com/dashboard/account/tokens から取得。

## 6. ドメイン言語 — 禁止表現

ユーザーが目にする文言（UIコピー・AIプロンプト・エラーメッセージ・シェアカード）を書く前に、`language-design` スキルを必ず読み込む。

- **禁止語:** 占い、鑑定、運勢、占い師、当たる、霊感、霊視
  - 禁止の理由：COCOSiLはスピリチュアルサービスではなく「根拠のある性格分析プロダクト」。混入するとターゲット層（25-35歳若手社会人）の信頼を失い、SNS拡散もしない。
- **代替表現:** 性格分析、パーソナリティ診断、統合レポート、傾向、特徴
- **例外:** コード内の変数名・DBカラム名では正式名称（動物占い、六星占術）の使用可。
- UIコピー・AIプロンプトを書く前に `language-design` スキルを必ず読み込む。

## 7. Protected Areas（AIエージェント操作境界）

リスクレベル **R2+**（Supabase + Clerk + AI診断データ・課金なし）。判定根拠は `docs/harness/HARNESS_DECISIONS.md` 参照。
詳細は `cocosil-domain` skill / `cocosil-work` command と整合。

### Layer 1：インフラ層（hookで自動ブロック・人間が手動でのみ実行）

`.claude/hooks/prevent-destructive-command.js` が以下のBashコマンドを実行時にブロックする：
- `supabase db reset` / `supabase db push` / `supabase migration repair`
- SQL: `DROP TABLE` / `TRUNCATE` / RLS無効化 / `CREATE POLICY ... FOR ALL`
- `.env` / `.env.local` / `.env.production` / `supabase/.env` の `cat`等読み取り
- `git push --force` / `git reset --hard`

ファイルパスとしての保護対象：
- `supabase/migrations/**`、`supabase/seed.sql`
- `.env*` すべて（`.env.example` 含む）
- `proxy.ts` 内の `clerkMiddleware` 設定
- `lib/clerk/**`（将来予定地）

### Layer 2：コンテンツ層（変更前に意味設計担当 = えんまさ承認必須）

- `lib/prompts/**` — AIプロンプトテンプレート（チャット3フェーズ・統合レポート・シェアカード）
- `lib/data/**` — 4体系ナレッジ（MBTI / 星座 / 動物性格診断 / 六星占術）
- `lib/diagnostics/**` — 診断計算ロジック（実装はヒラメ、内容承認はえんまさ）
  - F3.1 4体系統合アルゴリズム設計（Tree of 4, Harvest 1.）: [docs/output/goals/f3-keyword-tree-integration.md](docs/output/goals/f3-keyword-tree-integration.md)

### Layer 3：開発層（AI委任OK）

- `app/(auth)/**` / `app/(public)/**` — ページ・レイアウト（まあみ担当）
- `components/**` — UIコンポーネント（まあみ担当）
- `app/api/**` — API ルート（ヒラメ担当・PR レビュー前提）

> **Gate 2 適用注意**：Layer 3ファイルでも、UIコピー・文言・UXフロー・シェアカードを変更する場合はえんまさ承認（Gate 2）が必要。詳細は下記「レビューゲート」を参照。

### レビューゲート（Gate 1 / Gate 2）

AIが生成したすべてのPRは、以下の2層ゲートを通過してからマージする。

**Gate 1（ヒラメ担当）— 技術的適合性：全PR必須**

| チェック項目 | 観点 |
|---|---|
| IDOR防御 | `user_id = auth.uid()` が全CRUD操作のRLSポリシーに存在するか |
| JWT連携 | Clerk JWTが `supabase.auth.getUser()` 経由（`request.headers` 直読み禁止） |
| 型安全の境界 | APIルート入力値がZodスキーマで検証されているか |
| N+1・漏洩クエリ | ループ内Supabase呼び出しなし / `select('*')` で不要カラム露出なし |
| エラー境界 | Supabaseエラーオブジェクトをそのままクライアントに返していないか |

**Gate 2（えんまさ担当）— 意味的妥当性：以下の変更タイプを含むPRに適用**

| 変更タイプ | 対象パス | えんまさへの添付物 |
|---|---|---|
| AIプロンプト変更 | `lib/prompts/**` | AI応答サンプル3件（before/after） |
| 診断ロジック変更 | `lib/diagnostics/**` | 診断結果サンプル3ケース（before/after） |
| UIコピー・文言変更 | `components/**` / `app/**` のテキスト | プレビューURL＋変更文言diff |
| UXフロー・画面遷移変更 | ページ順序・フォーム順序 | プレビューURL＋フロー図 |
| シェアカード変更 | シェアカード表示 | プレビュー画像 |

Gate 2 **対象外**（えんまさ承認不要）: スタイリングのみ変更 / バグ修正（表示内容変更なし）/ パフォーマンス改善・リファクタリング

### 検証コマンド

- `pnpm typecheck` — `tsc --noEmit`（型整合性チェック）
- `pnpm lint` — ESLint
- `pnpm build` — Next.js build（GitHub Secrets登録後にCI追加予定）
- テストコマンドは未整備（`docs/harness/HARNESS_HEALTH.md` §G1 として記録）

### テスト分類学（COCOSiL V2版）

> 設計根拠: `docs/harness/HARNESS_DECISIONS.md` §6c / `docs/discussions/20260504_議論ログ_TDDベストプラクティス適用.md`

| レイヤー | 対象 | ツール | タイミング |
|---|---|---|---|
| **単体テスト** | `lib/diagnostics/` 計算・`lib/prompts/` 文字列 | Vitest | G1解消時（F2前）・F3実装時 |
| **コンポーネントテスト** | F3共感チャット3フェーズのフロー | Vitest + LLMモック | F3実装時 |
| **統合テスト** | Vercel OGフォールバック・Clerk+RLS通貫 | Vercelプレビュー + 手動 | G9解消済み |
| **評価（Eval）** | 設計中枢5問・禁止語彙・三毒増幅 | promptfoo | Sprint 3以降 |
| **E2E** | ユーザーフロー全体 | Playwright | Sprint 3以降 |

**`lib/prompts/` 変更時の必須テスト（Prompt as Code）：**

```typescript
// lib/prompts/__tests__/chat-phase1.test.ts（F3実装時に追加）
expect(prompt).not.toContain("占い")   // 禁止語彙チェック
expect(prompt).not.toContain("霊感")
expect(prompt).toContain("共感")       // 共感フェーズ必須キーワード
```

### 機能完了の定義（アトミック確認ループ）

> 設計根拠: `docs/harness/HARNESS_DECISIONS.md` §6b / `docs/discussions/20260504_議論ログ_アトミック確認ループ設計.md`

**機能完了 = 型チェック通過（機械）＋ ビルド成功（機械）＋ 動作確認済み（えんまさ）**

この3条件が揃うまで main マージ不可。「ビルドが通ったから完了」は禁止。

#### 壊れ方3パターン（/start-task 時に該当を宣言する）

| パターン | 症状 | 確認手段 |
|---|---|---|
| ① ロジック破綻 | 同一入力で異なる診断結果 | Vitest unit test（G1解消後） |
| ② 状態不整合 | 書き込んだのに読めない（RLS + JWT） | プレビューURL + 手動ログ確認 |
| ③ UX断絶 | APIは動くがUIが仕様と違う | えんまさによるプレビューURL手動確認 |

#### PRチェックリスト（PR作成時に必ず記入）

**Gate 1（ヒラメ）— 全PR必須：**
- [ ] IDOR防御・JWT連携・型安全・N+1・エラー境界の5点確認済み（詳細は `.github/pull_request_template.md`）
- [ ] レスポンス構造が型定義と一致

**Gate 2（えんまさ）— 意味的変更を含む場合：**
- [ ] AIプロンプト / 診断ロジック変更 → AI応答サンプル3件添付済み
- [ ] UIコピー / UXフロー変更 → プレビューURL＋変更文言diff添付済み
- [ ] Gate 2対象外（スタイリング・バグ修正のみ）→ その旨を明記

**共通：**
- [ ] `pnpm typecheck` 通過
- [ ] `pnpm build` 通過（またはプレビューデプロイ成功）

### Autogenesis Constitution（自己進化の操作境界）

> 設計根拠: `docs/harness/HARNESS_DECISIONS.md` §8 / `docs/discussions/20260504_議論ログ_デジタル生命体移行企画.md`

COCOSiL V2はPhase A→B→Cの段階的移行により「デジタル生命体（Audit-Gated Self-Evolving System）」を目指す。
AIエージェントはAutogenesisの操作境界を厳守する。

#### 絶対不変（Constitution — Autogenesisが触れてはいけない）

| 対象 | 理由 |
|---|---|
| Policy：三毒増幅禁止 | これが変わるとCOCOSiLではなくなる |
| UXシーケンス順序（共感→安心→分析→行動） | 止観の往還構造 = プロダクトのDNA |
| 言語設計ルール（「占い」禁止など） | ブランドアイデンティティ |
| 評価指標の定義（「自己理解の深化」） | 最適化目標が変わると破滅 |
| Autogenesis Evaluate層の三毒ガード条件 | ガードが変わると三毒を増幅するプロンプトが生まれる |

#### 積極進化対象（Mutable — Autogenesisが改善してよい）

| 対象 | 具体例 |
|---|---|
| `lib/prompts/**` 内のプロンプト内容 | 共感フェーズのトーン・深さ・切り込み方 |
| Memory Strategy | ユーザーの気づきをどう要約・保存するか |
| Retrieval Policy | 過去気づきのRAG注入ロジック |
| Output（レポートセクション構成） | 腑落ちを生むセクション順序 |
| Eval閾値 | 内省スコアの測定方法の改善 |

**Schema変更（migration）はAutogenesisでも必ずsandbox eval通過後のみ実行。**  
**Sub-Agent Pattern変更はえんまさ承認必須（Layer 2扱い）。**

#### Constitution as Code（単一の真実）

> 設計根拠: `docs/output/decisions/harness-redesign-proposal-2026-05-05.md` 原則① / `docs/discussions/20260505_議論ログ_設計整合性ハーネス再設計.md`

Autogenesis Constitution（絶対不変リスト・Mutableリスト）と言語設計（禁止語彙）の **正は `lib/constitution/`** とする。本文書（AGENTS.md）・`docs/input/concepts/COCOSiL設計中枢.md`・`docs/input/concepts/language-design-v1.md`・`.claude/skills/cocosil-domain/SKILL.md` は解説（コメンタリー）として位置づけ、ドリフト時はコードを正とする。

| 対象 | コード（正） |
|---|---|
| 禁止語彙の正リスト | `lib/constitution/banned-words.ts` |
| UXシーケンス順序 | `lib/constitution/ux-sequence.ts` |
| Policy / 評価指標定義（不変） | `lib/constitution/immutables.ts` |
| Mutable Path / Strategy（進化対象） | `lib/constitution/mutables.ts` |
| F3.1 観察軸5軸 + メタ層（識） | `lib/constitution/observation-axes.ts` |
| F3.1 観察軸ツリーデータ Schema | `lib/constitution/observation-tree-schema.ts` |

ドリフトは `lib/constitution/__tests__/drift.test.ts`（CIで実行）が文書とコードを照合して検知する。

#### えんまさのApprove基準（2点のみ）

Autogenesisが生成した改善案は以下の3ゲートを通過後にのみcommitする：

1. **sandbox eval**：内省スコア +5%以上 AND Anti-Sycophancy pass
2. **えんまさ review**：腑落ち体験の主観一致 AND UXシーケンス確認
3. **version commit**：上記2ゲート両通過後のみ。`prompt_versions.status: draft → active`

## 8. ブランチ管理規則

**ブランチは必ず `/start-task <タスク説明>` で作成する。** 手動で `git checkout -b` するのではなく、コマンドに任せることで命名規則・事前チェック・担当ガード確認が自動化される。

### 命名規則

| プレフィックス | 用途 | 担当者例 |
|---|---|---|
| `feature/<slug>` | 新機能開発 | ヒラメ・まあみ |
| `fix/<slug>` | バグ修正 | 全員 |
| `docs/<slug>` | ドキュメント・仕様書 | えんまさ |
| `chore/<slug>` | 設定・依存関係・CI変更 | 全員 |
| `refactor/<slug>` | リファクタリング | 全員 |

- `<slug>` は kebab-case（例：`feature/42-mbti-result-page`）
- 日本語・スペース禁止（エンコード問題回避）
- Issue番号プレフィックスは任意（`feature/42-xxx`）
- `/start-task` がタスク説明から prefix と slug を推論して提案する（手入力不要）

### 自動化ルール（3原則）

- **Merge Once, Delete Immediately**：PR マージ後ブランチは自動削除（GitHub Settings「Automatically delete head branches」ON）
- **Name First, Automate Second**：命名規則はここで宣言し、違反はPRコメントで警告のみ（マージブロックなし）
- **Long-term Branches are Explicit**：長期育成ブランチは `.github/PROTECTED_BRANCHES.txt` に明示的に列挙する

### 今やらないこと

- 古いブランチの定期自動削除（6ヶ月後に墓地が問題になったら再検討）
- Issue連動ブランチ自動作成（Issueの使い方が固まってから）

---

## 9. スキル使い分けガイド

### ワークフローコマンド（タスクの入口・実装中・出口）

| タイミング | コマンド | やること |
|------------|----------|----------|
| **タスク着手時（最初に必ず）** | `/start-task <タスク説明>` | pre-flightチェック + ブランチ作成 + 担当ガード確認 |
| **実装中（迷ったとき・変更前に）** | `/cocosil-work` | 担当ガード・品質基準・UXシーケンス確認 |
| **実装完了時（PRを出す前に）** | `/finish-task [PRタイトル]` | typecheck/lint + commit + push/PR作成 |

### いつ何を使うか

| 場面 | スキル | 備考 |
|------|--------|------|
| UIコピー・AIプロンプト・エラーメッセージを書く前 | `/language-design` | **必須**。禁止語チェック・トーン・確定フレーズを確認 |
| COCOSiLのドメイン判断（UXシーケンス・担当境界・4体系）が必要 | `/cocosil-domain` | 実装前の「COCOSiLらしいか」確認にも使う |
| 議論・ブレスト・複数視点での検討 | `/expert-misaki-discussion` | 「議論して」「ブレストして」「複数視点で」が目安 |
| 実装前のゴール確認（単一機能・タスク） | `/goal-grill` | Vision / Outcome / Eval の 3 層。成果物: `docs/output/goals/<slug>.md` |
| プロダクト要件を Vision→EngSpec まで段階的に深掘り | `/requirements-grill` | V→O→C→F→E→S の 6 層。`docs/requirements/<product>/` に書き出し、`docs/sandbox/<member>/grill-sessions/` で resume 可。goal-grill より広範、requirements-doc-creator より対話的 |
| 全機能のシステム要件定義・PRD | `/requirements-doc-creator` | Stage 1 → レビュー → Stage 2 の 2 段階。goal-grill より重厚 |
| 認証・DB migration・API route 変更時 | `/security-sensitive-change-review` | **必須**。RLS・Clerk・env var の変更を含む |
| TASK-INDEXのタスクに対してIssueとTSKファイルを生成 | `/task-issue-generator` | 要件定義書を読んでから生成。単独呼び出し or `/start-task` Step 2.6 から自動呼び出し |
| スキル自体の出力がイマイチだった・改善したい | `/skill-improver` | スキル使用後の不満・改善要望に使う |
| 新しい skill を作る / 既存 skill を改善・eval する | `/skill-creator` | Anthropic 公式 fork。雛形生成・description 最適化・benchmark 計測 |
| skill を中央 hub に publish / install / update | `/skill-shipper` | 中央 hub: `cocosil-standard-skills`。設定: `.claude/skill-shipper-config.yaml` |

### トリガーワード早見

- `「着手する」「ブランチ切る」「始める」` → `/start-task <タスク説明>`
- `「完了」「PR出す」「コミットする」` → `/finish-task`
- `「議論して」「ブレストして」「複数視点で」` → `/expert-misaki-discussion`
- `「要件定義」「仕様書」「Requirements」` → `/requirements-doc-creator`
- `「要件をグリる」「Vision/Outcome/Capability から詰める」「6 層に分解」` → `/requirements-grill`
- `「目標を詰めたい」「ゴールが曖昧」「受け入れ基準がない」` → `/goal-grill`
- `「Issue生成」「TSKを作って」「チケット起票」「--all」` → `/task-issue-generator`
- `「このスキルを改善したい」「出力が期待と違った」` → `/skill-improver`
- `「新しい skill を作る」「skill を benchmark」「skill description 最適化」` → `/skill-creator`
- `「skill を publish / install / update」「中央 hub に上げる」「skill version」` → `/skill-shipper`
