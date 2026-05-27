---
doc_id: canonical.cocosil.features.f3-1.observation-tree-pipeline
title: F3.1 観察軸ツリーデータ構築パイプライン（Stage-Gated Generation）
doc_type: spec
product: cocosil
feature_group: F3 統合レポート
features: [F3.1]
layer: canonical
status: draft
proposed_by: enmasa, hirame
proposed_at: 2026-05-27
as_of: 2026-05-27
audience: [enmasa, hirame]
one_line_thesis: LLM 単段生成では構造化データを信用しない。本文生成 → JSON 抽出 → Schema 検証 → Critique → 人間サンプリングの5段パイプラインで観察軸ツリーを構築する。
related_constitution:
  - lib/constitution/observation-axes.ts
  - lib/constitution/observation-tree-schema.ts（本書と同時新設）
  - lib/constitution/banned-words.ts
related_discussions:
  - docs/discussions/議論ログ_F3-1観察軸5軸確定.md
  - docs/discussions/議論ログ_F3-1キーワードツリー4体系統合アルゴリズム.md
related_goals:
  - docs/output/goals/f3-keyword-tree-integration.md
related_inputs:
  - docs/output/F3/deep-research-prompt-template.md（Step 1 で使用、本書の確定で改訂対象）
trigger: Gemini Deep Research（2026-05-27実行）出力に7欠陥が判明し、えんまさが調査計画.mdで原因診断したことに対する技術設計
---

# F3.1 観察軸ツリーデータ構築パイプライン

> **本書の位置づけ**: F3.1「Tree of 4, Harvest 1.」の入力データ（4体系×5軸=20セル、500カテゴリ単位の特徴語）を **品質保証付きで構築する** パイプラインの技術設計。Gemini Deep Research（2026-05-27 実行）の出力に判明した7つの欠陥を、単段生成ではなく多段パイプラインで構造的に解決する。

---

## 1. 問題定義 — なぜ単段生成では破綻するか

### 1.1 観測された7欠陥（Gemini Deep Research 出力、2026-05-27）

| # | 欠陥 | 影響 | 根本原因 |
|---|---|---|---|
| ① | confidence 飽和（0.90-0.95、σ=0.018） | 中 | 判定ルーブリックなし |
| ② | vector が positive/neutral のみ、**negative=0** | 高 | LLM ポジティブバイアス |
| ③ | **primary_sources が全カテゴリ空配列** | 致命 | Schema 検証なし |
| ④ | features がテンプレ化（全カテゴリ6個） | 低 | 単段生成の硬直 |
| ⑤ | 軸の純度違反（心理語の embodied への混入） | 中 | 軸境界の定義不足 |
| ⑥ | 日本語破綻（「弛緩 of サイクル」等） | 中 | 出力後検証なし |
| ⑦ | **本文-JSON 情報落差**（本文の医学的詳細が JSON に反映されない） | 致命 | 生成プロセスの分断 |

### 1.2 本質的診断

> **「Deep Research のリサーチ力不足ではなく、単段生成＋検証なしの構造的問題」**

①〜⑦ はプロンプト改善だけでは消えない（特に ②negative バイアス と ⑦本文-JSON 落差）。**生成と検証を分離した多段パイプライン** が原則的解決。

---

## 2. 設計原則

### えんまさ提案3原則（採用）

**① Stage-Gated Generation** — 5段に分解し、各段でゲートを置く
**② Adversarial Self-Critique** — 生成 LLM と批評 LLM を別呼び出しに分離
**③ Schema-First, Content-Second** — Zod スキーマを先に固める

### cocosil_v2 追加2原則

**④ Constitution Drives Generation** — 軸の definition / observation_keywords は `lib/constitution/observation-axes.ts` が単一の真実。プロンプトはこれを動的に注入する（コピペ運用しない）

**⑤ Empty Sources = Pipeline Fail** — `primary_sources` 空配列は Schema レベルで reject。CI でも検出（Hardcoded Build Fail）

---

## 3. 5段階パイプライン

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 1: 本文レポート生成（Markdown）                            │
│  ─ 実行者: えんまさ（Deep Research ツール）                       │
│  ─ プロンプト: docs/output/F3/deep-research-prompt-template.md    │
│    （Step 1 用に改訂: JSON 出力削除、Markdown 本文のみ出力）      │
│  ─ 出力: Markdown 本文（学術引用・伝統的解釈・脆弱性記述を含む） │
│  ─ 保存先: scripts/build-observation-tree/inputs/                 │
│            {system}-{axis}.md                                     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 2: 本文 → JSON 抽出（Claude API + tool_use）                │
│  ─ 実行者: パイプライン（自動）                                   │
│  ─ 入力: Step 1 の Markdown 本文                                  │
│  ─ プロンプト: scripts/build-observation-tree/prompts/extract.md  │
│  ─ AI SDK v6 + Vercel AI Gateway で Claude Sonnet 4.6 を呼び出し  │
│  ─ generateObject() で Zod スキーマを強制                        │
│  ─ 出力: 構造化 JSON（型安全保証済）                              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 3: Schema 検証（決定論的・Zod 4）                           │
│  ─ 実行者: パイプライン（自動）                                   │
│  ─ チェック項目（lib/constitution/observation-tree-schema.ts）：  │
│    • features: 5-10語、各≤20文字、禁止語彙不混入                 │
│    • primary_sources: 最低2件、うち type=book|academic 1件以上    │
│    • vector: enum 3値                                              │
│    • confidence: 0.3-1.0                                           │
│    • 体系レベル: vector 多様性（3値全出現）/ confidence σ ≥ 0.10  │
│  ─ NG 時: Step 2 にリトライ（最大3回、エラー詳細を添えて）        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 4: Critique LLM（敵対的自己点検）                           │
│  ─ 実行者: パイプライン（自動）                                   │
│  ─ 別 API コール・別プロンプトで Claude Sonnet 4.6 を呼び出し      │
│  ─ プロンプト: scripts/build-observation-tree/prompts/critique.md │
│  ─ チェック観点（Step 3 では拾えない意味的検証）：                │
│    • 軸純度（他軸キーワード混入の意味判定）                       │
│    • 本文-JSON 情報落差（本文の脆弱性記述が反映されているか）     │
│    • ステレオタイプ典型句の混入                                   │
│    • ジェンダー語の混入                                            │
│    • 日本語破綻                                                    │
│    • negative ベクトルの見落とし（明示的に疑え）                  │
│  ─ 出力: { result: PASS|FAIL, violations: [], retry_hints: "" }   │
│  ─ NG 時: Step 2 にリトライ（retry_hints をプロンプトに注入）     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 5: 人間サンプリング（最終ゲート）                           │
│  ─ 実行者: えんまさ                                                │
│  ─ サンプル: 各セルの 25%（zodiac/rokusei=3カテゴリ、              │
│              mbti=4カテゴリ、animal=15カテゴリ）                   │
│  ─ チェックリスト（docs/output/F3/observation-tree-               │
│                   sampling-checklist.md、別途作成予定）            │
│  ─ 合格: lib/data/observation-tree/{system}/{axis}.json に commit │
│         （Layer 2 Gate 2 対象）                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. ディレクトリ構成

```
lib/
├─ constitution/
│  ├─ observation-axes.ts          [既存] 軸の定義（単一の真実）
│  └─ observation-tree-schema.ts   [新設] Zod スキーマ（Step 3 で使用）
├─ data/
│  └─ observation-tree/             [新設] Step 5 通過後の最終データ
│     ├─ zodiac/
│     │  ├─ embodied_pattern.json
│     │  ├─ emotional_response.json
│     │  └─ ...
│     ├─ animal/ ...
│     ├─ rokusei/ ...
│     └─ mbti/ ...
└─ ...

scripts/
└─ build-observation-tree/          [新設] パイプライン本体
   ├─ pipeline.ts                   オーケストレーション（CLI: pnpm build:observation-tree）
   ├─ steps/
   │  ├─ step2-extract.ts           本文→JSON 抽出（AI SDK v6 + Vercel AI Gateway）
   │  ├─ step3-validate.ts          Zod スキーマ検証
   │  └─ step4-critique.ts          Critique LLM
   ├─ prompts/
   │  ├─ extract.md                 Step 2 のプロンプトテンプレート
   │  └─ critique.md                Step 4 のプロンプトテンプレート
   ├─ inputs/                       Step 1 の Deep Research 本文（gitignore）
   │  ├─ zodiac-embodied_pattern.md
   │  └─ ...
   ├─ outputs/                      Step 4 通過後・Step 5 未通過の中間出力
   │  └─ ...
   ├─ logs/                         パイプライン実行ログ・リトライ履歴
   └─ golden-samples/               Phase 2 のゴールデンサンプル
      └─ aries-embodied_pattern.json

docs/output/F3/
├─ deep-research-prompt-template.md         [既存・改訂] Step 1 用
├─ observation-tree-pipeline.md             [本書]
├─ observation-tree-quality-metrics.md      [新設予定] KPI 定義
└─ observation-tree-sampling-checklist.md   [新設予定] Step 5 用
```

---

## 5. Zod スキーマ設計

`lib/constitution/observation-tree-schema.ts` の主要型（本書 commit と同時に新設、別ファイル）：

```typescript
import { z } from 'zod/v4'
import { OBSERVATION_AXIS_IDS } from './observation-axes'
import { BANNED_WORDS } from './banned-words'

const PrimarySourceSchema = z.object({
  citation: z.string().min(10),
  type: z.enum(['book', 'academic', 'web']),
  url: z.string().url().optional(),
})

const VectorSchema = z.enum(['positive', 'negative', 'neutral'])

const FeatureSchema = z
  .string()
  .max(20)
  .refine(
    (s) => !BANNED_WORDS.some((w) => s.includes(w)),
    { message: '禁止語彙の混入' },
  )

const CategorySchema = z.object({
  category_id: z.string().regex(/^[a-z_]+$/),
  category_label_ja: z.string().min(1),
  features: z.array(FeatureSchema).min(5).max(10),
  vector: VectorSchema,
  confidence: z.number().min(0.3).max(1.0),
  primary_sources: z
    .array(PrimarySourceSchema)
    .min(2)
    .refine(
      (sources) => sources.some((s) => s.type === 'book' || s.type === 'academic'),
      { message: '書籍または学術記事を最低1件含める必要がある' },
    ),
})

export const ObservationTreeDataSchema = z
  .object({
    system: z.enum(['zodiac', 'animal', 'rokusei', 'mbti']),
    axis: z.enum(OBSERVATION_AXIS_IDS as readonly [string, ...string[]]),
    generated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    source_method: z.literal('deep-research-pipeline'),
    categories: z.array(CategorySchema).min(1),
    axis_definition_used: z.string(),
    observation_keywords_used: z.array(z.string()),
  })
  // 体系レベル検証: vector 多様性（3値全出現）
  .refine(
    (data) => {
      const vectors = new Set(data.categories.map((c) => c.vector))
      return vectors.has('positive') && vectors.has('negative') && vectors.has('neutral')
    },
    { message: '体系内で positive/negative/neutral の3vectorが全て出現する必要がある（議論計画§3.1欠陥②対策）' },
  )
  // 体系レベル検証: confidence 分散 ≥ 0.10
  .refine(
    (data) => {
      const values = data.categories.map((c) => c.confidence)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
      return Math.sqrt(variance) >= 0.1
    },
    { message: 'confidence 標準偏差が 0.10 未満（飽和状態、議論計画§3.1欠陥①対策）' },
  )

export type ObservationTreeData = z.infer<typeof ObservationTreeDataSchema>
```

---

## 6. プロンプト改訂方針

### Step 1: `docs/output/F3/deep-research-prompt-template.md` の改訂（本書 commit 後の別タスク）

| 改訂点 | 改訂前（現状） | 改訂後 |
|---|---|---|
| 出力形式 | JSON 直接出力 | **Markdown 本文のみ**（学術引用・脆弱性記述を含む長文） |
| 用途 | データ生成 | **本文生成**（後段で JSON 抽出） |
| confidence ルーブリック | あり（簡易） | **詳細5段階ルーブリック追加**（議論計画§3.2） |
| negative ベクトル誘発 | なし | **「正直に negative を付けよ」明示**、伝統医学の脆弱性記述に対応 |
| 軸境界 NG 例 | 抽象的記述のみ | **具体 NG 例リスト**（「精緻な自己管理→認知軸」等） |
| 出力フォーマット指定 | JSON Schema | **Markdown 構造指定**（各カテゴリ：気質説明 / 体液 / 脆弱性 / 引用源） |

### Step 2: `scripts/build-observation-tree/prompts/extract.md`（新設）

役割: Step 1 の Markdown 本文を受け取り、Zod スキーマに準拠した JSON を抽出する。

- `system` メッセージで Markdown 全文をコンテキスト注入
- `tool_use` で `submit_observation_tree` ツールを定義、`input_schema` に Zod スキーマを変換した JSON Schema を渡す
- AI SDK v6 の `generateObject()` を使えば、Vercel AI Gateway 経由でモデル切替可能 + 構造化出力を型安全に取得

### Step 4: `scripts/build-observation-tree/prompts/critique.md`（新設）

役割: Step 3 通過後の JSON を意味レベルで点検し、PASS/FAIL を返す。

主要観点：
- **negative ベクトルの見落としを最優先で疑え**（議論計画§5の Critique バイアス対策）
- 本文と JSON の差分（本文に書かれた脆弱性が JSON に反映されているか）
- 軸境界違反（embodied に「精緻な自己管理」が混入していないか）
- ジェンダー語 / ステレオタイプ典型句 / 日本語破綻

出力フォーマット（Zod で型強制）：
```typescript
const CritiqueResultSchema = z.object({
  result: z.enum(['PASS', 'FAIL']),
  violations: z.array(z.object({
    category: z.string(),
    type: z.enum(['vector_diversity', 'sources', 'axis_purity', 'stereotype', 'broken_japanese', 'info_loss_from_source']),
    detail: z.string(),
  })),
  retry_hints: z.string(),
})
```

---

## 7. 品質指標（KPI）

| メトリクス | 現状（2026-05-27 Gemini出力） | Step 5 通過の合格ライン |
|---|---|---|
| vector 多様性スコア（3値出現率） | 67%（2/3） | **100%** |
| confidence 標準偏差 | 0.018 | **≥ 0.10** |
| primary_sources 充足率 | 0% | **100%（書籍/学術1件以上）** |
| 軸純度違反数（12カテゴリ中） | 5-8件 | **≤ 1件** |
| 出力崩れ数（12カテゴリ中） | 3件 | **0件** |
| 本文-JSON 情報落差（脆弱性反映率） | 0% | **≥ 80%** |

詳細は `docs/output/F3/observation-tree-quality-metrics.md`（別途作成予定）で機械検証ルールとして実装。

---

## 8. リスクと対策（cocosil_v2 文脈で調整）

| リスク | 確率 | 影響 | 対策 |
|---|---|---|---|
| Critique LLM も同バイアスを持ち negative を見逃す | 中 | negative 不出現 | Critique プロンプトに「**negative の見落としを最優先で疑え**」を明記。AI Gateway で別モデル（Gemini/GPT）にフォールバック可能化 |
| Step 1 を Deep Research（Gemini等）で固定したい | 高 | Step 1〜2 連携負荷 | Step 1 は手動実行・Markdown 受け取り。パイプラインは Step 2 以降を担当（議論計画§5 リスク表と整合） |
| AI SDK v6 + Vercel AI Gateway 未設定 | 中 | Step 2/4 走らない | 初回実行前に `vercel env pull` + Gateway 設定確認（`vercel:bootstrap` skill） |
| Deep Research 出力の commit 漏れ | 中 | 再現性低下 | `scripts/build-observation-tree/inputs/` を gitignore せず commit（履歴保持） |
| API コスト見積もり超過 | 低 | 予算 | Step 2/4 は Sonnet 4.6（安価）、Step 5 サンプリング後のみ最終 commit。再生成は Critique FAIL 時のみ |
| ゴールデンサンプル作成負荷 | 中 | Phase 2 遅延 | 1セル（牡羊座×embodied）のみ手作業、他は同パターンを LLM に伝える |

---

## 9. 実装ロードマップ（5フェーズ）

| Phase | 内容 | 担当 | 期間目安 | 成果物 |
|---|---|---|---|---|
| **P1** | 現状診断の定量化（既存 Gemini 出力を KPI に変換） | えんまさ | 1日 | `品質ダッシュボード.md` |
| **P2** | ゴールデンサンプル手作業作成（牡羊座×embodied） | えんまさ | 2日 | `golden-samples/aries-embodied_pattern.json` + `rationale.md` |
| **P3** | パイプライン実装（Step 2/3/4 の TypeScript 実装） | ヒラメ | 4日 | `scripts/build-observation-tree/` 一式 + Vitest |
| **P4** | 全 20 セル再生成（Step 1〜4 を実走、リトライ含む） | えんまさ Step 1 + パイプライン自動 | 3日 | `outputs/` 配下 20 ファイル |
| **P5** | サンプリング検証 → `lib/data/observation-tree/` commit | えんまさ | 2日 | Layer 2 Gate 2 commit 20 ファイル |

---

## 10. 関連ドキュメント・コミット計画

### このパイプライン設計と同時 commit するもの

- ✅ `docs/output/F3/observation-tree-pipeline.md`（本書）
- ✅ `lib/constitution/observation-tree-schema.ts`（Zod スキーマ実装、本書§5）
- ✅ `lib/constitution/__tests__/drift.test.ts` に Zod スキーマ検証テスト追加
- ✅ `lib/constitution/index.ts` に再エクスポート追加

### 後続タスク（別 commit）

- ⬜ `docs/output/F3/deep-research-prompt-template.md` を Step 1 用に改訂（本書§6）
- ⬜ `docs/output/F3/observation-tree-quality-metrics.md` 新設（KPI 機械検証ルール）
- ⬜ `docs/output/F3/observation-tree-sampling-checklist.md` 新設（Step 5 チェックリスト）
- ⬜ `scripts/build-observation-tree/` パイプライン本体実装（Phase 3 タスク）
- ⬜ `package.json` に `build:observation-tree` スクリプト追加
- ⬜ Goal `docs/output/goals/f3-keyword-tree-integration.md` の Eval セクション更新（KPI を反映）

---

## 11. 次の一手

🔴 **今日中（本書 commit と同時）**
- `lib/constitution/observation-tree-schema.ts` を Zod で実装
- drift test に整合性テスト追加
- 本書を含む4ファイルを1コミット

🟡 **今週末まで（えんまさ）**
- Step 1 用 `deep-research-prompt-template.md` の改訂（本書§6 の方針）
- P1 品質ダッシュボード（既存 Gemini 出力の KPI 数値化）
- P2 ゴールデンサンプル作成

🟢 **来週以降（ヒラメ）**
- P3 パイプライン実装（`scripts/build-observation-tree/`）
- P4-5 はえんまさと並走

---

*本書は議論計画.md（えんまさ作成、2026-05-27）の cocosil_v2 文脈への翻訳・拡張。Stage-Gated Generation 3原則 + cocosil_v2 追加2原則の計5原則で観察軸ツリーデータ構築を品質保証する。*
