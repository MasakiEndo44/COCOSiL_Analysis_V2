# HARNESS_DECISIONS.md — COCOSiL V2 ハーネス設計判断記録

リスク分類・設計判断の根拠を記録する文書。月次レビュー（`harness-health-improver`）の参照元。

| 項目 | 値 |
|---|---|
| 最終更新 | 2026-05-04 |
| 対応バージョン | Phase 2 + Phase 3 + Phase 4-pre（TDDベストプラクティス適用版） |
| 関連ドキュメント | `AGENTS.md` §7, `.claude/skills/cocosil-domain/SKILL.md`, `docs/discussions/20260502_議論ログ_ハーネス導入.md`, `docs/discussions/20260504_議論ログ_アトミック確認ループ設計.md`, `docs/discussions/20260504_議論ログ_TDDベストプラクティス適用.md` |

---

## 1. リスクレベル判定：R2+

### 判定根拠

| 要素 | 状態 | リスク評価への寄与 |
|---|---|---|
| **Supabase（ユーザーDB＋診断履歴）** | あり（`supabase/config.toml` 設置済み） | R2 → R2+ に押し上げ |
| **Clerk（認証・JWT）** | あり（`@clerk/nextjs` 7.3.0 導入済み） | R2 → R2+ に押し上げ |
| **AI診断コンテンツ**（4体系ナレッジ・プロンプト） | 計画中（`lib/prompts/`, `lib/data/` 未作成） | R2+ 維持 |
| **課金機能** | なし | R3 への昇格を回避 |
| **本番ユーザー影響範囲** | MVP段階・SNS小規模告知50〜100人想定 | R3 ほどではない |

**結論：** 「単純なR2では甘い、R3ほどではない」中間ゾーン → **R2+**。
現時点で AIエージェントが最も誤って触りやすいのは Supabase migration と Clerk JWT 設定。

### R3 へ昇格するトリガー

以下のいずれかが発生した時点で本ファイルを R3 に書き換える：
- 課金機能（Stripe等）の実装
- 本番ユーザー数が 1000 人を超える
- 個人情報（フルネーム・住所等）を Supabase に保存する仕様変更
- B2B 契約による SLA コミットメント

---

## 2. 3層保護モデルの採用根拠

議論ログ Turn 3 で松田氏が提示した「壊れたときの影響範囲」による分類を採用。

```
Layer 1 ── インフラ層（壊れると全ユーザー影響・修復不能）
  → Supabase DB schema / RLS policy
  → Clerk JWT設定 / redirect URL
  → .env系すべて

Layer 2 ── コンテンツ層（壊れると信頼が失われる・修復に時間）
  → 4体系ナレッジ（MBTI/星座/動物性格診断/六星占術）
  → AIプロンプトテンプレート
  → ユーザーの診断履歴

Layer 3 ── 開発層（壊れても Git revert で修復可能）
  → UIコンポーネント・APIルート・一般ロジック
```

### 各層の保護手段の選択

| 層 | 保護手段 | 選択理由 |
|---|---|---|
| Layer 1 | hook で実コマンドレベルでブロック | 「Gitでrevertできない＝AIに委ねられない」（Reversibility-First原則） |
| Layer 2 | AGENTS.md §7 で明示・PR レビュー必須 | hook で全パターン捕捉は不可能。意味設計担当（えんまさ）の人間判断に委ねる |
| Layer 3 | AI委任OK | MVP速度を守るため過剰なフェンスを置かない |

---

## 3. 「Minimum Fence, Maximum Speed」の判断軌跡

議論ログ Turn 4 で確立した原則：「最小限のフェンスで最大限に守る」。
以下は「ブロックしないと判断したケース」とその根拠。

| 操作 | 判断 | 根拠 |
|---|---|---|
| `rm -rf node_modules` | **通す** | 依存の再インストールは通常作業。広すぎる `rm` ブロックは開発を止める |
| `pnpm install` / `pnpm add` | **通す** | パッケージ管理の通常作業 |
| `git push` (force なし) | **通す** | feature ブランチへの通常 push は安全 |
| `next dev` / `next build` | **通す** | ビルドは可逆操作 |
| `cat src/components/foo.tsx` | **通す** | コード読み取りは漏洩リスクが低い |
| `supabase gen types` | **通す（destination限定）** | `pnpm db:types` 経由なら安全。出力先が `lib/types/` 以外の場合のみブロック |

### ブロック対象の最終リスト（12パターン）

`prevent-destructive-command.js` 内の `DESTRUCTIVE_PATTERNS` 配列が信頼源。
変更時は必ず本ファイルも同期更新すること。

カテゴリ別内訳：
- Supabase インフラ系: 3パターン（db reset / db push / migration repair）
- SQL 破壊系: 4パターン（DROP TABLE / TRUNCATE / RLS無効化 / 全権限ポリシー）
- .env 系読み取り: 2パターン（プロジェクト直下 / supabase/）
- Git 破壊系: 2パターン（force push / hard reset）
- rm 危険形: 1パターン（引数なし）

---

## 4. v1.3 体制への翻訳

議論ログは古い「2人体制（えんまさ=フロント・ヒラメ=バック）」前提で書かれているが、
要件定義 v1.3 は **3人体制（えんまさ=意味設計・まあみ=見た目設計・ヒラメ=構造設計）**。
本ハーネスはすべて v1.3 体制に整合させる。

| 議論ログの記述 | v1.3 への翻訳 |
|---|---|
| 「えんまさ（フロント）が `src/components/` に書き込む」 | まあみが `components/` に書き込む。えんまさは UI 実装には介入しない |
| 「ヒラメ（バック）が Supabase 触る」 | ヒラメ（構造設計）が `supabase/`・`app/api/` を触る |
| Layer 2 の「コンテンツ承認者」 | えんまさ（意味設計担当）が承認 |

---

## 5. スキップした 1shot プロンプト要素と理由

| 要素 | スキップ理由 |
|---|---|
| `.cursor/rules/project.mdc` 等 4 ファイル | Cursor 未使用（`.cursorrules` も `.cursor/` も不在） |
| `AGENTS.md` 新規作成 | 既存維持。§7 を追記するのみ |
| `CLAUDE.md` 新規作成 | 既存（`@AGENTS.md` のみ）維持 |
| `.github/workflows/agent-verify.yml` | 既存 `ci.yml`（typecheck + lint）が同等機能を提供 |
| PostToolUse formatter / Stop verify summary | MVP速度優先・「Minimum Fence」原則 |

---

## 6. Bootstrapping Governance — Admin bypassの設計的位置づけ

議論ログ `20260502_議論ログ_PRレビュー問題.md` の Turn 4〜5 に基づく判断。

### 問題の構造（Self-Blocking Anti-Pattern）

初期セットアップPR（setup/v2-init → main）において、以下の構造的問題が発生した：

```
.github/     @MasakiEndo44  ← えんまさだけ（CODEOWNERSに記載）
  ↓
えんまさがPR作成者 → 自分のPRを自分で承認できない（GitHubルール）
  ↓
まあみ・ヒラメはまだコラボレーター未招待 → 誰もマージできない
```

これは「審判が自分の試合を裁けない」問題であり、**Bootstrapping Paradox** と呼ぶ。

### 採用した設計判断

**Bootstrapping Governance の3原則：**

① **Transparent Bypass（透明なバイパス）**
Admin bypassは「こっそりルールを外す」のではなく、Ruleset Bypass Listに明示的に設定する。
GitHubのAudit Logで追跡可能にすることで「緊急例外」を「設計上の正当な経路」に変える。

② **Honest CODEOWNERS（現実に正直な所有者定義）**
招待されていないメンバーをCODEOWNERSに記載しない。
チームの現状を反映した設計を保ち、コラボレーター招待後に全員記載に更新する。

③ **Bootstrap PR ≠ Feature PR（初期ガバナンスPRの別扱い）**
ルール自体を作るPRと、ルールに従うPRは本質的に異なる。
初期段階はAdmin権限者がBootstrap PRをbypassマージし、以降の全PRから正規フローを適用する。

### 具体的な対処記録

| フェーズ | アクション | 状態 |
|---|---|---|
| Bootstrap期（今） | Ruleset Bypass ListにえんまさをAdmin追加 | → 実施予定 |
| Bootstrap期（今） | PR #2 を Admin bypass でマージ | → 実施予定 |
| コラボレーター招待後 | @shuichiro-16 / @maami415 を Collaborators に招待 | G4残作業 |
| コラボレーター招待後 | CODEOWNERSの `.github/` 等を全員記載に更新 | G4残作業 |
| 初の正規フロー | 更新PRをヒラメかまあみにレビューしてもらう | 未着手 |

### スキップした選択肢とその理由

| 選択肢 | 却下理由 |
|---|---|
| ヒラメ/まあみを先に招待→承認待ち | 招待受諾まで時間がかかる。今日マージ不可 |
| Code Owners required を一時オフ | 手動戻し忘れリスク。「こっそり外す」は透明性ゼロ |
| 直接main push | force push扱いでRulesetがブロック。不可 |

---

## 6b. アトミック確認ループ設計（2026-05-04）

### 背景と問題

機能要素（API）を実装してビルドがパスしたら即次へ移行するサイクルが続き、本番での動作検証時に手戻りが発生していた。`pnpm typecheck` / `pnpm lint` は静的解析のみで、Clerk JWT + Supabase RLS の通貫・レスポンス構造の仕様整合・UXシーケンスの維持は一切検証できない。

### 採用した設計3原則

```
① Define Before Build（作る前に「完了の定義」を宣言する）
  /start-task 実行時に、実装する機能が抱えるリスクパターン（下記）を宣言する。
  これにより確認スコープが機能ごとに明確になる。

② Human Gate, Machine Floor（機械は床、人間は門）
  型チェック・lint・build = 機械が自動実行する最低限の床。
  「仕様通りか」の判断 = えんまさが人間として下すマージ条件の門。
  自動化の代替として人間ループを設計し、明示的に分離する。

③ Smallest Loop First（最小のループを先に回す）
  E2E・Vitest 導入より先に「Vercel プレビュー URL + PR チェックリスト」を整備する。
  3日かかる自動化より、今日から動ける人間ループが優先。
```

### 壊れ方3パターン（完了の定義の評価軸）

| パターン | 症状例 | 主な検証手段 |
|---|---|---|
| ① ロジック破綻 | 同一入力で異なる診断結果 | Vitest unit test（F2実装開始前に導入） |
| ② 状態不整合 | 書き込んだのに読めない（RLS + JWT の組み合わせ） | プレビュー URL + 手動ログ確認 |
| ③ UX断絶 | API は動くが UI が仕様と違う（レスポンス構造ズレ） | えんまさによるプレビュー URL 手動確認 |

### 採用アプローチ（優先順位）

| フェーズ | アプローチ | 導入コスト | 対象パターン |
|---|---|---|---|
| **今週（G9解消）** | Vercel プレビューデプロイ + PR チェックリスト | 低（0.5日） | ②③ |
| **F2実装前（G1解消）** | Vitest + `lib/diagnostics/` unit test | 中（2日） | ① |
| **Sprint 3以降** | Playwright E2E + Supabase branch ステージング | 高（1週間） | ①②③ |

### スキップした選択肢とその理由

| 選択肢 | 却下理由 |
|---|---|
| Playwright E2E を最初から導入 | Over Engineering。3人MVPチームで維持コストが高い |
| Vitest を最初に導入 | G1 は `lib/diagnostics/` 実装開始が先。現時点では対象ファイルが存在しない |
| ステージング環境を先に整備 | Supabase branch 機能はフリープランでは制限あり。Sprint 3 以降に延期 |

### 参照ドキュメント

- 議論ログ（詳細）: `docs/discussions/20260504_議論ログ_アトミック確認ループ設計.md`
- Gap 管理: `docs/harness/HARNESS_HEALTH.md` §G9

---

## 6c. TDDベストプラクティス適用方針（2026-05-04）

> 参照: `docs/discussions/20260504_議論ログ_TDDベストプラクティス適用.md`
> 参照レポート: エンタープライズAIエージェントTDDベストプラクティス（Stripe/Shopify/Vercel/GitHub事例 2022–2025）

### COCOSiL V2向け設計3原則

```
① Deterministic First, Eval Later（決定論的を先に、Evalは後から）
  プロンプト文字列・計算ロジック・型バリデーションを先にVitest化する。
  LLM出力の意味的品質評価（Eval）は lib/prompts/ が安定してから導入する。
  「今日テストできないものは今日テストしない」——Over Engineeringを防ぐ唯一の盾。

② Design-Center as Rubric（設計中枢をEvalルーブリックとして使う）
  Q1〜Q5の5問チェックはすでにEvalの採点軸として完成している。
  Phase 2で promptfoo を導入するとき、このルーブリックをそのまま
  promptfooconfig.yml に転記するだけで、COCOSiL固有のEvalが完成する。

③ Prompt as Code（プロンプトをコードと同格に扱う）
  lib/prompts/ の変更は必ずVitest文字列テストをセットで書く。
  「禁止語彙なし・必須フェーズキーワードあり」の2条件を最低限として。
  プロンプトの変更がCI（GitHub Actions）で検知されない状態を終わらせる。
```

### テスト分類学（COCOSiL V2版）

| レイヤー | 対象 | ツール | タイミング |
|---|---|---|---|
| 単体テスト | `lib/diagnostics/` 計算ロジック・`lib/prompts/` 文字列 | Vitest | G1解消時・F3実装時 |
| コンポーネントテスト | F3共感チャット3フェーズのフロー | Vitest + LLMモック | F3実装時 |
| 統合テスト | Gamma APIフォールバック・Clerk+RLS通貫 | Vercelプレビュー + 手動 | G9解消で整備済み |
| 評価（Eval） | 設計中枢5問・禁止語彙・三毒増幅 | promptfoo | Sprint 3以降 |
| E2E | ユーザーフロー全体 | Playwright | Sprint 3以降 |

### ロードマップ（Gap対応順）

```
🔴 G1解消時（F2実装前）:
  - Vitest 導入（pnpm add -D vitest）
  - lib/diagnostics/__tests__/ 作成（MBTI境界値・六星占術計算）
  - ci.yml に test ジョブ追加

🟡 F3実装時:
  - lib/prompts/__tests__/ 作成
    → expect(prompt).not.toContain("占い")  // 禁止語彙テスト
    → expect(prompt).toContain("共感")       // 必須キーワードテスト
  - PRチェックリストに「プロンプト変更 → テスト追加必須」を追記

🟢 Sprint 3以降:
  - promptfoo 導入（設計中枢5問をEvalルーブリックとして設定）
  - Gamma APIフォールバックテスト（レート制限・障害時）
  - Supabase branch + ステージング環境
```

### Over Engineeringとして除外したパターン

| パターン | 除外理由 |
|---|---|
| Pact（契約テスト） | 3人チームにはメンテナンスコストが高すぎる |
| TestContainers | Supabase branch機能で代替可。Sprint 3以降に検討 |
| シミュレーション環境（Shopify型） | F2/F3の実装が安定してから検討 |
| DeepEval（GitHub型） | promptfooで十分。DeepEvalはエンタープライズ向け |

---

## 7. 月次レビュー時の確認項目

`harness-health-improver` 実行時に以下を確認：

1. `HARNESS_HEALTH.md` の Gap が解消されているか
2. ブロックパターンの誤検知（false positive）報告がないか
3. ブロックすべきだったが通った（false negative）パターンがないか
4. R2+ → R3 の昇格トリガーに該当する変更がないか
5. v1.3 → v1.4 など要件定義書の更新と整合しているか
6. Autogenesis Constitution の定義がドリフトしていないか（§8 参照）

---

## 8. Autogenesis Constitution 設計判断（2026-05-04）

### 背景と問題

COCOSiL V2は現在「静的な性格分析Webアプリ」として初期実装段階にあるが、プロダクト哲学（無明の解消）を本当に実現するには、ユーザーの成長に追随してシステム自体が進化する「デジタル生命体」への転換が必要。現状は：

- プロンプト2ファイルにハードコード → 「記憶なき対話（アムネジア問題）」
- 行動ログ未収集 → 観察の不在
- 自己進化能力ゼロ → ユーザーが100回訪れても101回目も初日と同じ対話

### 採用した設計判断

**Autogenesis Constitution の3原則（AGENTS.md §7 に反映）：**

```
① Constitution First, Evolution Second
   Policy（三毒禁止）・UXシーケンス・言語設計ルール・評価指標定義は
   Autogenesisが絶対に触れない不変の法（Constitution）とする。
   ConstitutionなきEvolutionは自己破壊。

② Measure Depth, Not Delight
   最適化指標は「ユーザーが喜んでいるか」ではなく
   「ユーザーが再言語化したか・矛盾を受け入れたか」。
   心地よさの最大化は三毒増幅のバイパス路。

③ Audit Gate before Commit
   AIが生成した改善案は draft → sandbox eval → えんまさ review の
   3ゲートを通ってからのみ active になる。
   Gate速度よりGate品質を優先する。
```

### Constitution vs Mutable の分類根拠

| 分類 | 対象 | 根拠 |
|---|---|---|
| **Constitution（絶対不変）** | Policy・UXシーケンス・言語設計・評価指標定義 | 変わるとプロダクトのDNAが腐敗する |
| **Constitution（sandbox必須）** | Schema変更（migration）| Reversibility-First原則（Layer 1と同等扱い） |
| **Constitution（えんまさ承認必須）** | Sub-Agent Pattern | AIエージェントのコンテンツ層判断 = Layer 2扱い |
| **Mutable（進化対象）** | Prompt・Memory Strategy・Retrieval Policy・Output・Eval閾値 | 変化がユーザーの自己理解を深める方向にのみ許容 |

### Evaluate層の三毒ガード（AND条件）

```
✅ 内省スコア向上（再言語化率・矛盾受容率・行動記録の具体度スコア）
✅ Anti-Sycophancy判定（LLM-judge）通過
✅ UXシーケンス遵守確認
→ 全通過 → Approve候補へ
→ 1つでも失敗 → Reflect（前ステップに差し戻し）
```

**重要逆説**：「ユーザーが満足しすぎている」状態（心地よい錯覚）は内省スコアが低い傾向がある。主観満足度は評価指標に使わない。

### 移行3段階とPhaseゲート

| Phase | 内容 | 移行ゲート |
|---|---|---|
| **Phase A**（観察基盤） | PostHog + `events_telemetry` テーブル | ユーザー50人以上の行動ログ蓄積 |
| **Phase B**（メモリ基盤） | pgvector + `user_insights_memory` + RAG注入 | ユーザー100人超・内省スコア計算可能 |
| **Phase C**（Autogenesisループ） | `prompt_versions` + 週次Cron + 3ゲート版管理 | Phase B完了後 |

### スキップした選択肢とその理由

| 選択肢 | 却下理由 |
|---|---|
| エンゲージメント最大化（滞在時間・クリック数）を指標にする | 三毒（貪：依存）を増幅するバイパス路になる |
| ユーザー主観評価を指標にする | Sycophancy（迎合）が高評価を生み、内省と逆相関する |
| AIが自律的にプロンプトをcommitする | 三毒ガードをAIが破る経路が生まれる |
| 全Resource Substrateを進化対象にする | Constitutionが腐敗し設計中枢が無効化される |

### 参照ドキュメント

- 議論ログ（詳細）: `docs/discussions/20260504_議論ログ_デジタル生命体移行企画.md`
- AGENTS.md §7 Autogenesis Constitution（ルール定義の正）
- HARNESS_HEALTH.md §G10（Phase A Gap管理）
