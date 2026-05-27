---
doc_id: canonical.cocosil.features.f3-1.pipeline-run-log.2026-05-27
title: F3.1 観察軸ツリーパイプライン 初回実走ログ (zodiac × embodied_pattern, Haiku 4.5)
doc_type: spec
product: cocosil
feature_group: F3 統合レポート
features: [F3.1]
layer: canonical
status: draft
proposed_by: hirame
proposed_at: 2026-05-27
as_of: 2026-05-27
audience: [enmasa, hirame]
one_line_thesis: パイプライン全段が初回 attempt で PASS。vector 一致率 11/12 (91.7%)。aries が positive → negative に転倒した1件は Haiku 同型 Critique バイアスが原因。
related_constitution:
  - lib/constitution/observation-axes.ts
  - lib/constitution/observation-tree-schema.ts
related_inputs:
  - scripts/build-observation-tree/inputs/zodiac-embodied_pattern.md
related_outputs:
  - scripts/build-observation-tree/outputs/zodiac-embodied_pattern.json
  - scripts/build-observation-tree/logs/zodiac-embodied_pattern-2026-05-27T03-51-05-002Z.log
related_goldens:
  - scripts/build-observation-tree/golden-samples/aries-embodied_pattern.json
---

# F3.1 観察軸ツリーパイプライン 初回実走ログ

## 1. 実行条件

| 項目 | 値 |
|---|---|
| 実行日時 | 2026-05-27 03:51:05 UTC |
| 実行者 | えんまさ（手動） |
| コマンド | `EXTRACT_MODEL=anthropic/claude-haiku-4-5 CRITIQUE_MODEL=anthropic/claude-haiku-4-5 pnpm build:observation-tree --system zodiac --axis embodied_pattern` |
| 認証 | VERCEL_OIDC_TOKEN（`vercel env pull` 経由） |
| 入力 | `inputs/zodiac-embodied_pattern.md`（ゴールデンサンプル逆展開ダミー本文・12カテゴリ） |
| Step 2 / 4 モデル | `anthropic/claude-haiku-4-5`（Free tier 制約により Sonnet 4.6 から差替） |

## 2. パイプライン実走指標

| 段階 | 結果 | 所要時間 | リトライ |
|---|---|---|---|
| Step 2: 本文 → JSON 抽出 | ✅ ok | 27.4 s | 0 |
| Step 3: Zod 検証 | ✅ ok | 2 ms | 0 |
| Step 4: Critique LLM | ✅ ok (PASS) | 4.6 s | 0 |
| **全体** | **✅ success** | **32.0 s** | **0** |

合計トークン消費（概算）: 約 25K（Haiku 4.5 単価で約 $0.005）。

## 3. Schema 制約充足

| 制約 | 充足 | 値 |
|---|---|---|
| カテゴリ数 12（全星座） | ✅ | 12 |
| vector 3値全出現 | ✅ | positive 3 / negative 4 / neutral 5 |
| confidence 0.3-1.0 | ✅ | 全カテゴリ範囲内 |
| confidence σ ≥ 0.10 | ✅ | σ = 0.132 |
| features 5-10語 | ✅（下限） | 全カテゴリ 5 語に硬直化 |
| features 各 ≤ 20文字 | ✅ | 全特徴語充足 |
| 禁止語混入なし | ✅ | 「占い・鑑定・運勢」等不検出 |
| primary_sources 最低 2件 + 書籍/学術 ≥ 1件 | ✅ | 全カテゴリ 2 件、すべて type: book |
| 軸純度違反なし（心理語混入） | ✅ | features に「自己管理・共感力」等不検出 |
| 日本語破綻なし | ✅ | 英日混在 0 件 |

**結論**: Schema 機械検証は完全通過。Step 3/4 が機能している証拠。

## 4. ゴールデンサンプルとの diff

### 4.1 vector 一致率: 11/12 (91.7%)

| カテゴリ | golden | output | 一致 |
|---|---|---|---|
| **aries** | **positive** | **negative** | **❌** |
| taurus | neutral | neutral | ✅ |
| gemini | positive | positive | ✅ |
| cancer | negative | negative | ✅ |
| leo | positive | positive | ✅ |
| virgo | negative | negative | ✅ |
| libra | neutral | neutral | ✅ |
| scorpio | neutral | neutral | ✅ |
| sagittarius | positive | positive | ✅ |
| capricorn | neutral | neutral | ✅ |
| aquarius | neutral | neutral | ✅ |
| pisces | negative | negative | ✅ |

### 4.2 confidence 差分

| カテゴリ | golden | output | diff | 段階移動 |
|---|---|---|---|---|
| aries | 0.92 | 0.92 | 0 | なし |
| taurus | 0.88 | 0.81 | -0.07 | 中核→強く言及 上端 |
| gemini | 0.72 | 0.68 | -0.04 | 標準内 |
| cancer | 0.78 | 0.82 | +0.04 | 標準→強く言及 |
| leo | 0.90 | 0.94 | +0.04 | 中核内 |
| virgo | 0.82 | 0.81 | -0.01 | 強く言及 内 |
| libra | 0.55 | 0.64 | +0.09 | 標準内 |
| scorpio | 0.68 | 0.64 | -0.04 | 標準内 |
| sagittarius | 0.85 | 0.81 | -0.04 | 強く言及 内 |
| capricorn | 0.80 | 0.81 | +0.01 | 強く言及 内 |
| aquarius | 0.48 | 0.48 | 0 | 部分的 内 |
| pisces | 0.62 | 0.64 | +0.02 | 標準内 |

最大差分 ±0.09、5段階ルーブリックの段階移動はわずか 2 件（taurus / cancer の段階境界跨ぎ）。**confidence 判定は良好**。

### 4.3 features 数の硬直化（議論計画§3.1 欠陥④の再発兆候）

| カテゴリ | golden 語数 | output 語数 |
|---|---|---|
| 12カテゴリ全て | 6-7 語 | **5 語** |

Haiku は「5-10語」の指示に対して全カテゴリで下限の 5 語に揃えた。本文には 6-7 個の特徴記述があるにもかかわらず、抽出時に「5 語に統一」のテンプレート化が発生。これは Step 2 プロンプト改訂で抑制可能（後述）。

### 4.4 features 内容の質的比較（aries 例）

| 観点 | golden | output |
|---|---|---|
| 抽出語数 | 7 | 5 |
| 採用語 | 高熱量の胆汁質 / 瞬発的な動作 / 短期集中のテンポ / 発火点の低い気質 / 頭部への血流集中 / 急性の発熱反応 / 回復の速い体力 | 瞬発的な運動エネルギー / 頭部への血流集中 / 短期集中型テンポ / 胆汁質の熱乾 / **急性炎症傾向** |
| 落とした語 | （golden が拾った）「発火点の低い気質」「回復の速い体力」 | — |
| 加えた語 | — | 「急性炎症傾向」（脆弱性記述から派生） |

Haiku は「脆弱性」セクションの記述（「急性炎症」）を features に取り込み、結果として vector を negative に転倒させた可能性。

## 5. Critique バイアス分析（重要発見）

### 5.1 aries 転倒の根本原因仮説

入力 Markdown の aries セクションは構造的に以下を含む:

```
気質・性向: 高熱量・瞬発力・短期集中（positive 中核）
脆弱性: 過剰な熱量は持続性欠如・頭痛・急性炎症（negative 副次）
```

ゴールデンサンプルは「気質・性向セクションを features に主採用 → vector=positive、脆弱性は副次として記述するが features には1-2語のみ」という設計判断。

Haiku 4.5 は「features に脆弱性記述が含まれている → 全体として negative」とベクトル判定。判定基準の解釈で **「中核 vs 副次」の重み付け** ができていない。

### 5.2 Critique LLM（同 Haiku）の見逃し

`prompts/critique.md` は「negative ベクトルの **見落とし** を最優先で疑え」と書かれているが、aries は **negative への見落とし** ではなく **positive への見落とし**（=過剰な negative 判定）。Critique プロンプトはこの逆方向のバイアスを想定していない。

さらに Critique LLM が **同モデル Haiku 4.5** のため、同型バイアス（脆弱性記述があれば negative と判定する傾向）を共有し、見逃しが発生した。

### 5.3 改善提案（Sprint 内）

| 優先 | 改善 | 担当 | 影響 |
|---|---|---|---|
| 🔴 | `prompts/critique.md` に「**positive ベクトルの過小評価（脆弱性記述に引きずられて negative 過判定）も同等に疑え**」を追記 | ヒラメ | Critique 双方向バイアス対策 |
| 🔴 | `prompts/extract.md` に「気質・性向セクションが中核、脆弱性は副次。中核が positive で脆弱性が記述されていても vector は positive のまま」を明示 | ヒラメ | Step 2 抽出判定の安定化 |
| 🟡 | features 5-10語の指示に「**本文に書かれた特徴の数に応じて柔軟に。下限の 5 で固定せず 6-8 を標準とせよ**」を追加 | ヒラメ | テンプレート化抑制 |
| 🟡 | Critique は **Sonnet 4.6 にハイブリッド構成**（Extract=Haiku, Critique=Sonnet）。同型バイアスを構造的に解消 | ヒラメ | Top-up 必要（数ドル） |
| 🟢 | aries 1件のみ再生成で本セル確定、または bulk 再実行で全12再生成 | えんまさ判断 | Step 5 通過判定の方針依存 |

## 6. Step 5 (人間サンプリング) への引き継ぎ

### 6.1 通過候補（11/12 カテゴリ）

aries 以外は vector 整合・confidence 妥当・features 軸境界遵守・引用源充足。**えんまさ Gate 2 主観確認後そのまま `lib/data/observation-tree/zodiac/embodied_pattern.json` 昇格可能**。

### 6.2 要判断項目（aries 1件）

- **Option A**: aries の vector を golden 通り `positive` に手動修正してから commit
  - 利点: 即 commit 可、コスト 0
  - 欠点: パイプラインの出力をそのまま信用しない先例になる
- **Option B**: aries を含めて output のまま commit
  - 利点: パイプライン出力を尊重
  - 欠点: 伝統解釈との乖離、Gate 2 判定で問題
- **Option C**: §5.3 のプロンプト改善後に全12 再実行
  - 利点: 構造的な品質改善・他セルへの恩恵あり
  - 欠点: 追加コスト $0.005、改善後の vector 一致率は未知

### 6.3 採用方針（えんまさ確定）

**Option C → A の順番**。

1. §5.3 の 🔴 2件のプロンプト改善を本 commit に同梱（コスト 0）→ **本 PR で実施**
2. えんまさが再実行（コスト $0.005）して vector 一致率を再計測
3. 12/12 一致なら output そのまま commit
4. 11/12 に留まれば Option A（手動修正 commit）+ rationale.md に「Haiku 限界」を記録

## 7. ゴールデンサンプル設計への示唆

本実走で「ゴールデンサンプルとの vector 91.7% 一致」を達成した事実は、**ゴールデンサンプル自体が良いベンチマーク** として機能した証拠。Gate 2 でえんまさが承認すれば、ゴールデンサンプル → `lib/data/observation-tree/zodiac/embodied_pattern.json` 昇格 → 残り 19 セルも同じ品質保証フレームで進める基盤になる。

## 8. 次のアクション

1. **ヒラメ**: §5.3 🔴 2件のプロンプト改善実装 → commit ← **本 commit で実施**
2. **えんまさ**: 再実行 → vector 一致率再計測 → Step 5 判定
3. **両者**: rationale.md に「Haiku 4.5 で本セル通過、Sonnet ハイブリッドは将来課題」を記録
4. **次セル**: zodiac × emotional_response の Step 1 Markdown 用意 → 同パイプライン実行

---

*本書は PR #62 Follow-up として、F3.1 パイプライン初回実走の検証ログ。再現性のため commit する。*
