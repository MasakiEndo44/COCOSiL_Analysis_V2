# F3.1 観察軸ツリーパイプライン — セットアップと実走手順

> パイプライン本体の設計: [docs/output/F3/observation-tree-pipeline.md](../../docs/output/F3/observation-tree-pipeline.md)
> 初回検証用ダミー入力: [inputs/zodiac-embodied_pattern.md](inputs/zodiac-embodied_pattern.md)
> ゴールデンサンプル（diff ベンチマーク）: [golden-samples/aries-embodied_pattern.json](golden-samples/aries-embodied_pattern.json)

---

## 1. 初回セットアップ — 推奨フロー（OIDC token 経由）

> Vercel AI SDK v6 は `VERCEL_OIDC_TOKEN` が環境変数にあれば AI Gateway への認証を自動で行う。
> ローカル開発・Preview・Production で同じ仕組みで動き、永続 API key を発行する必要がない。
> Token は **12時間で期限切れ** になるため、定期的に `vercel env pull` で再取得する。

### 1.1 Vercel CLI インストールとログイン

```bash
# グローバル install（sudo を避けるなら npm prefix を ~/.npm-global に設定）
npm i -g vercel

# ブラウザで認証
vercel login
```

### 1.2 プロジェクトと紐付け

```bash
# このリポジトリのルートで実行
vercel link
# → "Set up <repo>?" には Y
# → "Which scope?" にチームを選択
# → "Found project <name>. Link to it?" で COCOSiL_Analysis_V2 を選択
```

`.vercel/project.json` が生成される（`.gitignore` 済み）。

### 1.3 環境変数を pull

```bash
vercel env pull .env.local
```

これで `.env.local` に以下が書き込まれる（既存値はマージ）:

- `VERCEL_OIDC_TOKEN=eyJ...`（12時間期限）
- その他 Vercel プロジェクトに登録済みの env

### 1.4 疎通確認（smoke test）

```bash
pnpm ai-gateway:smoke
```

期待出力:

```
[start] AI Gateway smoke test  (auth: VERCEL_OIDC_TOKEN)
接続テスト成功
[ok] 8 chars received in 1234ms
```

モデル: `anthropic/claude-haiku-4-5`（Sonnet より約 10倍安価、コスト < 1 cent / 回）。

### 1.5 12時間ごとの token 再取得

```bash
vercel env pull .env.local
```

`[Bad Request]` や `401/403` が出たら token 期限切れのサイン。再 pull すれば直る。

---

## 1A. 代替フロー — 永続 API key（CI など）

OIDC が使えない環境（CI runner で `vercel link` できない等）では永続 API key を使う。

1. https://vercel.com/dashboard → COCOSiL_Analysis_V2 プロジェクト
2. **AI Gateway** タブ → **API Keys** → 新規 key 発行（名前: `cocosil-pipeline-ci` 等）
3. `vck_...` 形式の key をコピー
4. 環境変数に設定:
   ```bash
   export AI_GATEWAY_API_KEY=vck_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. 疎通確認:
   ```bash
   pnpm ai-gateway:smoke
   # → [start] AI Gateway smoke test  (auth: AI_GATEWAY_API_KEY)
   ```

`env.ts` は `VERCEL_OIDC_TOKEN` と `AI_GATEWAY_API_KEY` のどちらか一方があれば動く（OIDC 優先）。

---

## 2. 初回パイプライン実走（zodiac × embodied_pattern）

### 2.1 入力ファイル

初回検証用には `inputs/zodiac-embodied_pattern.md`（ダミー本文、12カテゴリ全揃い）を使う。ゴールデンサンプルを逆展開した人工本文で、Step 2 が ObservationTreeDataSchema 通過の JSON を返せるかの最小コスト検証用。

Deep Research による本物の Step 1 本文が用意できた時点で同ファイルを上書きする。

### 2.2 実行コマンド

```bash
# OIDC ルート / API key ルート 共通 (package.json scripts が --env-file-if-exists で自動読込)
pnpm build:observation-tree --system zodiac --axis embodied_pattern
```

> package.json の `build:observation-tree` は `tsx --env-file-if-exists=.env.local` 経由で
> 起動するため、`.env.local` があれば自動で読み込み、なければシェル export 済みの env を使う。
> どちらのルートでも 1 コマンドで動く。

### 2.3 期待挙動

| 段階 | 期待 |
|---|---|
| Step 2 | `inputs/zodiac-embodied_pattern.md` を読み込み、AI Gateway 経由で Claude Sonnet 4.6 に `generateObject` を発行。12カテゴリ揃った JSON を返す |
| Step 3 | `ObservationTreeDataSchema.safeParse` 通過（vector 3値出現・confidence σ ≥ 0.10・primary_sources 充足） |
| Step 4 | Critique LLM が PASS を返す（軸純度違反・negative 見落とし・本文-JSON 情報落差なし） |
| 成果物 | `outputs/zodiac-embodied_pattern.json` 書き込み、`logs/zodiac-embodied_pattern-{ISO}.log` 出力 |

### 2.4 コスト見積もり

| 項目 | 概算 |
|---|---|
| Step 2 入力 | 約 10K トークン（Markdown + プロンプト） |
| Step 2 出力 | 約 2K トークン（JSON 12カテゴリ） |
| Step 4 入力 | 約 12K トークン（Markdown + JSON + Critique プロンプト） |
| Step 4 出力 | 約 0.5K トークン（CritiqueResult） |
| **合計（1回・リトライなし）** | **約 25K トークン ≒ $0.04-0.06** |

リトライ最大3回想定の上限: 約 $0.20。

### 2.5 失敗パターン

| 終了コード | 原因 | 対処 |
|---|---|---|
| 1 | env 未設定 (`VERCEL_OIDC_TOKEN` / `AI_GATEWAY_API_KEY` どちらもなし) | §1.3 または §1A |
| 1 | `[Bad Request] 401/403` | OIDC token 12時間期限切れ。§1.5 |
| 1 | `inputs/` ファイルなし | §2.1 を確認 |
| 2 | `--system` / `--axis` 不正 | `pnpm build:observation-tree --help` で値一覧確認 |
| 1 | Step 2 失敗（API 通信・Zod 違反）× 3回 | `logs/` でリトライ履歴と `retry_hints` を確認 |
| 1 | Step 4 FAIL × 3回 | `logs/` の violations を確認、プロンプト or 入力本文を見直し |

---

## 3. 実走後の検証手順

### 3.1 ゴールデンサンプルとの diff

```bash
diff <(jq -S . scripts/build-observation-tree/outputs/zodiac-embodied_pattern.json) \
     <(jq -S . scripts/build-observation-tree/golden-samples/aries-embodied_pattern.json)
```

期待される差分:
- `generated_at` がパイプライン実行日に更新
- `features` / `confidence` / `vector` は **ダミー本文に書いた通り** に抽出されていることが理想
  - 大きく逸脱する場合は Step 2 のプロンプト改善余地あり

### 3.2 Critique バイアス分析（重要）

ゴールデンサンプルとの diff で、特に以下を確認する：

| 観点 | 確認内容 |
|---|---|
| negative 見落とし | 本文に「脆弱性」セクションを書いている cancer / virgo / pisces で `vector: negative` が出ているか |
| confidence 飽和 | 全カテゴリが 0.85-0.95 に集中していないか（σ ≥ 0.10） |
| primary_sources 充足 | 全カテゴリで書籍 ≥ 2 件 |
| 軸純度違反 | features に「精緻さ」「他者への共感」等の心理語が混入していないか |
| 日本語破綻 | features が「弛緩 of サイクル」のような英日混在になっていないか |

### 3.3 次セッションへの申し送り

実走結果を以下にまとめる:

- `docs/output/F3/observation-tree-pipeline-run-log-{YYYY-MM-DD}.md` (新設)
  - 実行コマンド・所要時間・API 課金実測値・リトライ履歴
  - ゴールデンサンプルとの主要差分
  - Critique バイアスの観察結果
  - プロンプト改訂が必要な箇所の列挙

---

## 4. 残り 19 セルへの展開

zodiac × embodied_pattern が安定動作したら、以下を順次実行：

1. えんまさが Deep Research で残りセルの Markdown 本文を `inputs/{system}-{axis}.md` に生成・配置
2. パイプラインを各セルで実行
3. Step 5（人間サンプリング）を経て `lib/data/observation-tree/{system}/{axis}.json` に commit（Layer 2 Gate 2 対象）

進捗管理: [docs/output/F3/deep-research-prompt-template.md](../../docs/output/F3/deep-research-prompt-template.md) §6 の20セルチェック表。

---

## 5. トラブルシュート

### 5.1 `Error: Cannot find package 'ai'`

```bash
pnpm install
```

### 5.2 `[fail] VERCEL_OIDC_TOKEN も AI_GATEWAY_API_KEY も未設定`

- OIDC ルート: `vercel env pull .env.local` してから `pnpm build:observation-tree ...` を実行（`--env-file-if-exists` が自動で `.env.local` を読込）
- API key ルート: `export AI_GATEWAY_API_KEY=vck_...` してから実行

### 5.3 `GatewayInternalServerError` + statusCode 403 + `AI Gateway requires a valid credit card on file`

**AI Gateway は Free credits 利用も含めてクレジットカード登録が必須**（2026-05-27 確認、Vercel 仕様）。エラーメッセージ通り以下のリンクからモーダル直開きで CC 登録する:

```
https://vercel.com/d?to=/[team]/~/ai?modal=add-credit-card
```

`[team]` はあなたの所属 Vercel チーム。登録後 5 分以内に `pnpm ai-gateway:smoke` で疎通復帰する。

### 5.4 `Free tier users do not have access to this model`（CC 登録済みなのに発生）

CC 登録は通っているが、**Free tier ユーザーは一部高性能モデル（Sonnet 4.6 / Opus 4.7 / GPT-4.1 等）にアクセス不可**。対応は次のいずれか:

**方式 A: モデルを Haiku 4.5 にダウングレード（無課金で即動作・推奨）**

```bash
EXTRACT_MODEL=anthropic/claude-haiku-4-5 \
CRITIQUE_MODEL=anthropic/claude-haiku-4-5 \
  pnpm build:observation-tree --system zodiac --axis embodied_pattern
```

`scripts/build-observation-tree/steps/{step2-extract,step4-critique}.ts` のモデル定数は env で上書き可能。Haiku 4.5 は Sonnet 4.6 比で約 10 分の 1 のコスト + 同等の指示追従性（構造化抽出タスクには十分）。

**方式 B: Top-up でクレジット購入（Sonnet 4.6 維持）**

```
https://vercel.com/d?to=/[team]/~/ai?modal=top-up
```

最小 $5 から購入可能。F3.1 全 20 セル本走で約 $1 の見積もり。品質を最大化する選択肢。

**ハイブリッド（推奨パターン）**: 抽出は Haiku で安く、批評は Sonnet で厳密に。

```bash
EXTRACT_MODEL=anthropic/claude-haiku-4-5 \
CRITIQUE_MODEL=anthropic/claude-sonnet-4-6 \
  pnpm build:observation-tree --system zodiac --axis embodied_pattern
```

### 5.4 `[Bad Request] 401 / 403`（CC 登録済みの場合）

OIDC token 期限切れ（12時間）。`vercel env pull .env.local` で再取得。

### 5.5 Zod 違反でリトライが3回失敗

`logs/{system}-{axis}-{ISO}.log` を確認し、最後の `retry_hints` で示された違反を踏まえて：
- 入力 Markdown 本文の該当カテゴリの記述を充足する
- もしくは `prompts/extract.md` の指示を強化する

### 5.6 Critique LLM が同じバイアスを持つ疑い

`prompts/critique.md` 内の「negative の見落としを最優先で疑え」指示が機能していない場合、AI Gateway で別モデル（Gemini / GPT）にフォールバックを検討。`steps/step4-critique.ts` の `EXTRACT_MODEL` 定数を変更する。

### 5.7 `vercel link` でプロジェクトが見つからない

- Vercel ダッシュで該当プロジェクトのチームスコープを確認
- `vercel switch <team>` でスコープ切り替え後に `vercel link` を再実行

---

*本書は PR #62 の Follow-up として作成。AI Gateway 設定はえんまさが手動で実施する作業。設定完了後、ヒラメが §3 検証手順を実行する。*
