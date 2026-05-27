# F3.1 観察軸ツリーパイプライン — セットアップと実走手順

> パイプライン本体の設計: [docs/output/F3/observation-tree-pipeline.md](../../docs/output/F3/observation-tree-pipeline.md)
> 初回検証用ダミー入力: [inputs/zodiac-embodied_pattern.md](inputs/zodiac-embodied_pattern.md)
> ゴールデンサンプル（diff ベンチマーク）: [golden-samples/aries-embodied_pattern.json](golden-samples/aries-embodied_pattern.json)

---

## 1. 初回セットアップ

### 1.1 前提

- Vercel アカウント（COCOSiL_Analysis_V2 プロジェクトへのアクセス権限）
- 本リポジトリのローカルクローン + `pnpm install` 完了
- Node.js 24 LTS（プロジェクトデフォルト）

### 1.2 Vercel AI Gateway 有効化

Vercel AI Gateway は本パイプラインの Step 2 / Step 4 で Claude Sonnet 4.6 を呼び出すための統一エンドポイント。`@ai-sdk/anthropic` を入れずに `'anthropic/claude-sonnet-4-6'` のプロバイダ文字列でモデル指定できる。

1. https://vercel.com/dashboard でログイン
2. `COCOSiL_Analysis_V2` プロジェクトを開く
3. サイドバー **AI Gateway** → **Enable AI Gateway**
4. **API Keys** タブで新規 API key を発行（名前は `cocosil-pipeline-local` 等）
5. 生成された key（`vck_...` 形式）をコピー

### 1.3 ローカル環境変数設定

`.env.local` に追記（`.gitignore` 済み・コミット禁止）：

```bash
# Vercel AI Gateway — F3.1 観察軸ツリーパイプライン用
AI_GATEWAY_API_KEY=vck_xxxxxxxxxxxxxxxxxxxxxxxx
```

CLI は Node.js プロセスとして起動するため `.env.local` を自動読み込みしない。シェルで `export` するか、`dotenv-cli` 経由で実行する：

```bash
# 方式 A: シェルで export（推奨）
export AI_GATEWAY_API_KEY=vck_xxxxxxxxxxxxxxxxxxxxxxxx

# 方式 B: その場限り
AI_GATEWAY_API_KEY=vck_xxx pnpm build:observation-tree --system zodiac --axis embodied_pattern
```

### 1.4 設定確認

```bash
echo "${AI_GATEWAY_API_KEY:?AI_GATEWAY_API_KEY 未設定}"
# → vck_xxxx... が表示されれば OK
```

---

## 2. 初回実走（zodiac × embodied_pattern）

### 2.1 入力ファイル

初回検証用には `inputs/zodiac-embodied_pattern.md`（ダミー本文、12カテゴリ全揃い）を使う。ゴールデンサンプルを逆展開した人工本文で、Step 2 が ObservationTreeDataSchema 通過の JSON を返せるかの最小コスト検証用。

Deep Research による本物の Step 1 本文が用意できた時点で同ファイルを上書きする。

### 2.2 実行コマンド

```bash
pnpm build:observation-tree --system zodiac --axis embodied_pattern
```

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
| 1 | `AI_GATEWAY_API_KEY` 未設定 | 1.3 で設定 |
| 1 | inputs/ ファイルなし | 2.1 を確認 |
| 2 | `--system` / `--axis` 不正 | `--help` で値一覧確認 |
| 1 | Step 2 失敗（API 通信・Zod 違反）× 3回 | `logs/` でリトライ履歴と `retry_hints` を確認 |
| 1 | Step 4 FAIL × 3回 | `logs/` の violations を確認、プロンプト or 入力本文を見直し |

---

## 3. 実走後の検証手順

### 3.1 ゴールデンサンプルとの diff

```bash
diff <(jq -S . outputs/zodiac-embodied_pattern.json) \
     <(jq -S . golden-samples/aries-embodied_pattern.json)
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
2. `pnpm build:observation-tree --system <s> --axis <a>` で各セルを実行
3. Step 5（人間サンプリング）を経て `lib/data/observation-tree/{system}/{axis}.json` に commit（Layer 2 Gate 2 対象）

進捗管理: [docs/output/F3/deep-research-prompt-template.md](../../docs/output/F3/deep-research-prompt-template.md) §6 の20セルチェック表。

---

## 5. トラブルシュート

### 5.1 `Error: Cannot find package 'ai'`

```bash
pnpm install
```

### 5.2 `Error: API key not found`

`.env.local` ではなくシェル環境変数を読むので、`export AI_GATEWAY_API_KEY=...` を実行してから `pnpm build:observation-tree`。

### 5.3 Zod 違反でリトライが3回失敗

`logs/{system}-{axis}-{ISO}.log` を確認し、最後の `retry_hints` で示された違反を踏まえて：
- 入力 Markdown 本文の該当カテゴリの記述を充足する
- もしくは `prompts/extract.md` の指示を強化する

### 5.4 Critique LLM が同じバイアスを持つ疑い

`prompts/critique.md` 内の「negative の見落としを最優先で疑え」指示が機能していない場合、AI Gateway で別モデル（Gemini / GPT）にフォールバックを検討。`steps/step4-critique.ts` の `EXTRACT_MODEL` 定数を変更する。

---

*本書は PR #62 の Follow-ups として作成。AI Gateway 設定はえんまさが手動で実施する作業。設定完了後、ヒラメが §3 検証手順を実行する。*
