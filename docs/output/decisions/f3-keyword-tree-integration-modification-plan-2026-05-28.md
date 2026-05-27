---
doc_id: canonical.cocosil.features.f3-1.modification-plan.2026-05-28
title: F3.1 ワードツリー構築 改修計画 — Procrustean Mapping → 「幹と枝」モデル移行
doc_type: spec
product: cocosil
feature_group: F3 統合レポート
features: [F3.1]
layer: canonical
status: proposal
proposed_by: hirame
proposed_at: 2026-05-28
as_of: 2026-05-28
audience: [enmasa, hirame]
one_line_thesis: 4体系×5軸=20セル格子の Procrustean Mapping 問題を「幹と枝」モデル（Embedding + 階層クラスタリング）への移行で構造的に解消。設計中枢の哲学への忠実度も向上。
related_research:
  - えんまさ Deep Research 2026-05-28（パーソナリティ統合の「幹と枝」モデル妥当性検証）
related_discussions:
  - docs/discussions/議論ログ_ワードツリー構築改修.md
related_constitution:
  - lib/constitution/observation-axes.ts
  - lib/constitution/observation-tree-schema.ts（PR #62 で導入、本改修で廃止予定）
related_prs:
  - "#61 F3.1 観察軸5軸 Constitution + Tree of 4 パイプライン設計"
  - "#62 F3.1 観察軸ツリー構築パイプライン実装"
---

# F3.1 ワードツリー構築 改修計画

> 本書は、えんまさ実施の Deep Research（2026-05-28）の結論と、ヒラメ主導の議論（[議論ログ](../../discussions/議論ログ_ワードツリー構築改修.md)）を踏まえた **F3.1 設計の根本改修計画書**。現状の「4 体系 × 5 軸 = 20 セル」格子設計（PR #61 / #62）から「幹と枝」モデル（Embedding + 階層クラスタリング）への移行可否、影響範囲、5 フェーズ実装計画を提示する。

---

## 1. 改修の動機（Why）

### 1.1 観測された構造的問題

PR #62 で実装した F3.1 パイプラインの初回実走（zodiac × embodied_pattern, 2026-05-27）で、ゴールデンサンプルとの vector 一致率は 11/12 (91.7%) だが、**aries が positive → negative に転倒** した 1 件は単なる LLM バイアスでは説明できない構造的問題が示唆された。

調査の結果、根本原因は **Procrustean Mapping 問題**（プロクルステース的強制マッピング）と診断された:

- 各体系のカテゴリ（牡羊座、INTP、ペガサス、土星人 等）は本来、複数の観察軸に分散した特徴量を持つ
- 現状の「1 体系 = 1 軸（zodiac × embodied_pattern）」セル設計は、各カテゴリの中核を 1 軸に強制押込
- 結果、副次的側面しか拾えず、aries のような誤判定が構造的に発生
- プロンプト改善では絶対に解消不可能

### 1.2 Deep Research による学術的裏付け

えんまさ実施の Deep Research（2026-05-28）が以下を明らかにした:

| 知見 | 出典 |
|---|---|
| 出生月・星座と Big Five・一般知能の統計相関はゼロ | Hartmann, Reuter, Nyborg (2006), N=4,000+ / 11,000+ |
| 性格分類体系の統合は Embedding ベース hierarchical clustering が最も意味保持力・動的表現力ともに高い | Deep Research §2.5 比較表 |
| Rosch のプロトタイプ理論 + Buss & Craik (1983) の Act Frequency Approach が「幹と枝」モデルの学術的基盤を提供 | Deep Research §3 |
| 計算実装は EMD（Wasserstein 距離）+ 凝集型階層クラスタリング（AGNES）で実現可能、Next.js + TypeScript で完結 | Deep Research §4 / §6 |
| 期待効果: LLM トークン消費 -55% / TTFT 15s → 5s 未満 | Deep Research §7.4 |

### 1.3 哲学的整合性の問題

仏教の「五取蘊（pañcupādānakkhandhā）」観点から、性格を「固定的実体」として捉えること自体が苦しみの根源とされる。COCOSiL の設計中枢「無明を晴らす」（Dispel, Don't Decorate）と、現状設計（自己同一化を助長する固定的ラベリング）は **構造的に矛盾している**。

「幹と枝」モデルは、状況依存的・確率的・動的な性格表現を実装するため、**技術改修と哲学的整合性向上を同時に達成する**。

---

## 2. 設計原則（3 原則）

```
① Profiles over Cells. — セルではなくプロファイル。
   4体系×5軸=20セルの格子を廃止し、各カテゴリに 5軸プロファイルベクトルを持たせる。
   各カテゴリは複数軸に分散した特徴量を保持する。

② Geometric Fusion, LLM Narration. — 幾何で統合、LLM で語る。
   統合は EMD + 階層クラスタリングという決定論的計算で。LLM は最終ナラティブ生成のみ。
   セマンティック・ドリフトの構造的解消 + コスト削減 + TTFT 短縮を同時達成。

③ Anatta-Aware Output. — 無我を意識した出力。
   「あなたはこういう人です」と固定的に断定する表現を全プロンプトから排除。
   階層的「幹（複数体系合意の中核）」と「枝（特定体系固有の彩り）」として、
   状況依存的・確率的・動的な性格表現に。relational_mode はメタ層に格上げ。
```

---

## 3. As-Is / To-Be 設計比較

| 観点 | 現状（As-Is: 2D 格子モデル） | 改修後（To-Be: 「幹と枝」階層ツリーモデル） |
|---|---|---|
| **データ構造** | `system (4) × axis (5) = 20 セル` の格子 | カテゴリ単位（100件）の 5軸プロファイル |
| **中間表現** | 各セルに features 配列 | `axisProfile` (各軸: strength 0-1 + features) を持つ独立レコード |
| **統合アルゴリズム** | 軸ごとに 4 体系のセルを LLM で単純マージ | EMD ベース距離 + 凝集型階層クラスタリング（決定論的） |
| **距離計算** | なし | コサイン類似度 + EMD / Wasserstein 距離 |
| **階層構造の表現** | フラット（全項目を同列に出力） | Dendrogram（幹 = 中核 / 枝 = 辺縁） |
| **relational_mode** | 5軸対等の1次元 | 他4軸の相互作用結果として顕現するメタ層（4軸 + 1メタ層） |
| **ナラティブ生成** | フラットな性格記述 | 「幹（中核の私）」と「枝（多彩な私の表情）」の階層表現 |
| **LLM 役割** | 全工程で生成 | ナラティブ生成のみ（決定論部分から分離） |
| **API トークン** | セル単位 LLM 呼出（高） | カテゴリ抽出 + ナラティブ生成のみ（-55% 推定） |

---

## 4. 5 フェーズ実装計画（合計約 23 営業日）

### Phase A: データ層再構築（Sprint 1 前半・5 営業日）

| # | 作業項目 | 成果物 | 担当 |
|---|---|---|---|
| A1 | `lib/data/categories/` ディレクトリ新設 | `lib/data/categories/{system}-{category}.json` × 100 ファイル | ヒラメ |
| A2 | `lib/constitution/category-profile-schema.ts` 新設 | Zod スキーマ（`CategoryProfileSchema`）+ drift test | ヒラメ |
| A3 | 4 体系 × 全カテゴリ（zodiac 12 + mbti 16 + animal 60 + rokusei 12 = 100）の軸プロファイル JSON 起草 | 各カテゴリの初期 axisProfile（strength + features）| ヒラメ初稿 + えんまさ Gate 2 |
| A4 | PR #62 `lib/data/observation-tree/` の廃止判断 | 廃止 ADR（`docs/output/decisions/...md`）| ヒラメ |
| A5 | `lib/constitution/index.ts` の再エクスポート更新 | 新スキーマの公開 | ヒラメ |

**Phase A 完了条件**:
- 100 カテゴリ分の JSON が `CategoryProfileSchema` を通過
- drift test pass

### Phase B: 計算エンジン実装（Sprint 1 後半・5 営業日）

| # | 作業項目 | 成果物 | 担当 |
|---|---|---|---|
| B1 | `lib/diagnostics/integration/distance.ts` | Euclidean / Cosine 距離関数 | ヒラメ |
| B2 | `lib/diagnostics/integration/fusion-engine.ts` | 凝集型階層クラスタリング（AGNES、Ward 法）+ Dendrogram 構築 | ヒラメ |
| B3 | `lib/diagnostics/integration/trunk-branch.ts` | threshold ベースの幹/枝抽出（`evaluateTrunkAndBranch`）| ヒラメ |
| B4 | Vitest で INTP × 水瓶座、ESFJ × 蟹座、ENTJ × 山羊座 等のサンプル組検証 | 10 ペアの距離行列テスト | ヒラメ |
| B5 | `lib/diagnostics/integration/index.ts` で公開 API 統合 | 統一エントリポイント | ヒラメ |

**Phase B 完了条件**:
- 純 TypeScript で決定論的に動作
- 同じ入力で同じ出力（snapshot test）
- 10 ペアの距離が「直感的に近い/遠い」と整合

### Phase C: PR #62 パイプライン改修（Sprint 2 前半・5 営業日）

| # | 作業項目 | 成果物 | 担当 |
|---|---|---|---|
| C1 | `scripts/build-observation-tree/` → `scripts/build-category-profiles/` 改名 | 新ディレクトリ構造 | ヒラメ |
| C2 | Step 2 抽出プロンプト（`prompts/extract.md`）を「カテゴリ × 5 軸 strength + features」抽出に書き換え | 新プロンプト | ヒラメ |
| C3 | Step 3 Schema を `CategoryProfileSchema` に差し替え | `step3-validate.ts` 改修 | ヒラメ |
| C4 | Step 4 Critique プロンプト（`prompts/critique.md`）を新スキーマ前提に書き換え | 新プロンプト | ヒラメ |
| C5 | `pipeline.ts` の CLI 引数を `--system zodiac --category aquarius` 単位に再設計 | 新 CLI | ヒラメ |
| C6 | 既存 Vitest（`pipeline.test.ts` 等）の更新 | テスト通過 | ヒラメ |
| C7 | SETUP.md 更新（新 CLI 起動方法・トラブルシュート） | ドキュメント | ヒラメ |

**Phase C 完了条件**:
- `pnpm build:category-profiles --system zodiac --category aquarius` が動作
- 既存パイプラインの 5 段ゲート（Step 1〜5）を踏襲
- pnpm typecheck / lint / test pass

### Phase D: ナラティブ層改修（Sprint 2 後半・5 営業日）

| # | 作業項目 | 成果物 | 担当 |
|---|---|---|---|
| D1 | F3 統合レポート生成プロンプト（`lib/prompts/...`）を「幹と枝」入力前提に再設計 | 新プロンプト | ヒラメ + えんまさ Gate 2 |
| D2 | 「無我を意識した出力」テンプレート構文確定（「〇〇な傾向」「特に〇〇な状況で」） | 言語設計ガイド更新 | えんまさ |
| D3 | LLM 温度パラメータの調整（0.3-0.5 範囲、A/B テスト） | 設定確定 | ヒラメ |
| D4 | プレビューデプロイで主観テスト（えんまさ + みさきさん + ヒラメ） | レポート 3 件 | 全員 |
| D5 | `lib/constitution/banned-output-patterns.ts` 新設（「あなたは〇〇です」等の固定構文を検出する正規表現） | 構文ガード + テスト | ヒラメ |

**Phase D 完了条件**:
- 主観テストでえんまさ・みさきさんから「腑落ち感」評価 4/5 以上
- 固定断定構文の検出率 100%

### Phase E: ゴールデンサンプル + 較正（Sprint 3・3 営業日）

| # | 作業項目 | 成果物 | 担当 |
|---|---|---|---|
| E1 | ヒラメ + えんまさ + みさきさんで「近い/遠い」直感投票 10 ペア | 投票結果データ | 全員 |
| E2 | distance threshold θ の経験的決定（バーナム効果回避との両立） | 較正値 + ADR | ヒラメ |
| E3 | EMD ライブラリ評価（`@stdlib/stats-incr-mvariance` 等の Node.js 互換性）| 評価レポート | ヒラメ |
| E4 | Sprint 1〜3 の総合振り返り + Sprint 4 計画 | レトロスペクティブ | 全員 |

**Phase E 完了条件**:
- θ 較正値が文書化されコードに反映
- 10 ペアの 8/10 以上が直感投票と機械判定で一致

---

## 5. 影響範囲

### 5.1 廃止・変更されるもの

| 対象 | 扱い | 理由 |
|---|---|---|
| `lib/data/observation-tree/` | **廃止**（実装は未着手） | データ構造を `lib/data/categories/` に置換 |
| `scripts/build-observation-tree/` | **改名**（→ `scripts/build-category-profiles/`） | パイプライン本体は流用、データスキーマ変更 |
| `scripts/build-observation-tree/golden-samples/aries-embodied_pattern.json` | **形式変換**（新スキーマへ移行） | データはレガシーフォーマットだが内容は活用 |
| `lib/constitution/observation-tree-schema.ts` | **置換**（→ `category-profile-schema.ts`） | Schema 再設計 |
| `docs/output/F3/deep-research-prompt-template.md` | **改訂**（カテゴリ単位プロンプトへ） | Step 1 の単位が「セル」→「カテゴリ」に変更 |

### 5.2 維持されるもの

| 対象 | 理由 |
|---|---|
| `lib/constitution/observation-axes.ts` | 5 軸定義は維持（relational_mode の意味のみメタ層に再解釈） |
| `lib/constitution/banned-words.ts` | 言語設計の禁止語彙は不変 |
| PR #62 パイプラインの Stage-Gated Generation 5 段構造 | アーキテクチャは流用 |
| `scripts/build-observation-tree/{env.ts, smoke/, SETUP.md}` | AI Gateway 認証・OIDC ルートは不変 |
| Vercel AI Gateway 経由 Haiku 4.5 / Sonnet 4.6 構成 | モデル選択肢は維持 |

### 5.3 設計中枢（Layer 0）への影響

| 対象 | 影響 |
|---|---|
| 5 問のリトマス試験紙 | Q1 / Q2 への忠実度 ↑（無明の解消・三毒の不増幅） |
| パンチャ構造（4+1=5） | より精緻化（relational_mode の「メタ層」位置付けが識と構造同型に） |
| 非交渉のUXシーケンス | 影響なし |

---

## 6. リスクと緩和策

| リスク | 影響度 | 緩和策 |
|---|---|---|
| セマンティック・ドリフト（LLM 抽出の不安定性） | 高 | 法則①「決定論/非決定論の分離」: 静的データは人間 commit、計算は決定論、LLM は最終ナラティブのみ |
| バーナム効果（中和化された平坦な記述） | 中 | 法則②「ゴールデンサンプル経験的較正」: 10 ペアの直感投票で θ 決定 |
| 五取蘊の固定化助長 | 中 | 法則③「Anatta-Aware Output」: 断定構文を全プロンプト + システムで排除、`banned-output-patterns.ts` で機械検証 |
| 100 カテゴリ分の初期データ作成負荷 | 中 | フェーズ A で集中投入。1 カテゴリ約 30 分の見積もり = 50 時間 ≒ 6 営業日（Phase A 5 日に概ね収まる） |
| 既存 PR #62 の作業が無駄になる | 低 | パイプライン構造とインフラ（AI Gateway / smoke test）は流用。データスキーマとプロンプトのみ書き換え |
| Embedding ライブラリの Node.js 互換性 | 低 | フェーズ E で評価。互換性なければ Sentence-BERT REST API 経由（Vercel Edge Function）|
| double 投資（PR #62 マージ済みなら revert 困難） | 中 | PR #62 は **マージしない判断** を推奨。PR #62 をクローズし、本計画の Phase A〜C で新 PR を切る |

---

## 7. 受け入れ基準（Phase 全体完了時）

- [ ] 100 カテゴリ分の `lib/data/categories/*.json` が CategoryProfileSchema 通過
- [ ] `lib/diagnostics/integration/` の 3 モジュールが pnpm typecheck / lint / test pass
- [ ] `pnpm build:category-profiles --system zodiac --category aquarius` で 1 カテゴリ生成成功
- [ ] F3 統合レポートのプレビューデプロイで主観テスト 4/5 以上
- [ ] 10 ペア直感投票で 8/10 以上が機械判定と一致
- [ ] LLM トークン消費の実測値が現状比 -40% 以上
- [ ] 固定断定構文の検出率 100%（`banned-output-patterns.ts`）
- [ ] 設計中枢 5 問リトマス試験紙 Q1〜Q5 でえんまさ承認

---

## 8. PR #62 の扱い（重要判断）

### 8.1 推奨方針: **PR #62 をクローズし、本計画で再起動**

理由:
- PR #62 のデータスキーマ（`ObservationTreeDataSchema`）は本計画で全面廃止対象
- パイプライン構造とインフラ（AI Gateway 認証・smoke test・SETUP.md）は本計画でも流用可能
- 中途半端にマージすると、新スキーマ移行時の DB マイグレーション負荷が増大
- PR #62 のコミット履歴は本計画の Phase C 着手時に `git cherry-pick` で必要部分のみ取り込み可能

### 8.2 PR #62 から残すべき資産

| 資産 | 移行先 |
|---|---|
| `scripts/build-observation-tree/env.ts` | `scripts/build-category-profiles/env.ts`（そのまま） |
| `scripts/build-observation-tree/smoke/ai-gateway-smoke.mjs` | `scripts/build-category-profiles/smoke/`（そのまま） |
| `scripts/build-observation-tree/SETUP.md` | 改修して `scripts/build-category-profiles/SETUP.md` |
| `scripts/build-observation-tree/pipeline.ts` | 改修して新 CLI（カテゴリ単位） |
| `lib/constitution/observation-axes.ts` | 維持（軸定義は不変） |
| `docs/output/F3/observation-tree-pipeline-run-log-2026-05-27.md` | 歴史的記録として保持（理由: Procrustean Mapping 問題の実証ログ） |

---

## 9. 次のアクション

### 9.1 即座（本書 commit と同時）

- [ ] 本計画書をえんまさレビュー（Gate 2: 意味的妥当性 + 設計中枢チェック）
- [ ] PR #62 の扱いを確定（クローズ / 部分マージ / 全マージ → 再改修）

### 9.2 承認後（Sprint 1 開始）

- [ ] Phase A 着手（`lib/data/categories/` 新設、CategoryProfileSchema 起草）
- [ ] PR #62 クローズ判断の場合、`docs/output/decisions/pr-62-closure.md` を起票
- [ ] AI Gateway 認証情報の継続利用確認（VERCEL_OIDC_TOKEN は再 pull 必要）

### 9.3 Sprint 1〜3 を通じた継続作業

- ゴールデンサンプル投票データの収集（みさきさん含む）
- 設計中枢ドキュメントへの「Profiles over Cells.」「Geometric Fusion, LLM Narration.」「Anatta-Aware Output.」の3原則追加検討
- Cocosil-domain skill の更新（新データ構造の運用ガイドライン）

---

*本計画書は議論ログ（`docs/discussions/議論ログ_ワードツリー構築改修.md`）の構造化アウトプット。Gate 2 承認後に Sprint 1 着手。*
