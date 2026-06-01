# HARNESS_HEALTH.md — COCOSiL V2 ハーネス健康診断

既知の Gap・未整備領域・運用上の懸念を記録する文書。
新たな Gap を発見したら追記し、解消したら ✅ マークと解消日を記録する。

| 項目 | 値 |
|---|---|
| 最終更新 | 2026-05-05 |
| 次回レビュー | 2026-06-02（月次） |

---

## ⚠️ 既知の Gap

### G10. Autogenesis Phase A — 行動テレメトリ基盤未整備
- **状態：** ❗ 未解消
- **詳細：** COCOSiL V2のデジタル生命体移行計画（`docs/discussions/20260504_議論ログ_デジタル生命体移行企画.md`）のPhase A着手に必要な行動テレメトリ基盤がゼロ。具体的に未整備のもの：
  - `events_telemetry` テーブル（Supabase migration未作成）
  - PostHogカスタムイベント5種（`chat_phase_transition` / `report_section_reread` / `insight_accept` / `action_specificity_score` / `session_return_7d`）の未実装
  - 内省スコア算出ロジック（再言語化率・矛盾受容率・行動記録の具体度）の未実装
- **影響：** Phase B（メモリ基盤）・Phase C（Autogenesisループ）への移行ゲートが「ユーザー50人以上の行動ログ蓄積」であり、本Gapが解消されるまで次のPhaseに進めない。
- **対応方針（優先順位順）：**
  1. 🔴 Supabase migration：`events_telemetry(user_id, event_name, payload JSONB, created_at)` テーブル追加
  2. 🔴 PostHog SDK導入 + 5種カスタムイベントを `app/api/chat/` の各フェーズ遷移点に実装
  3. 🟡 内省スコア算出の設計（セッション終了時にLLMが判定するか、ルールベースか）
- **Phase A→B移行ゲート：** ユーザー50人以上の行動ログが蓄積した時点（えんまさが確認）
- **設計根拠：** `docs/harness/HARNESS_DECISIONS.md` §8 / `AGENTS.md` §7 Autogenesis Constitution
- **担当：** ヒラメ（migration・API実装）・えんまさ（テレメトリ設計の意味判断）

### ~~G9. アトミック確認ループ未整備~~ ✅ 解消（2026-05-05）
- **解消内容：**
  1. ✅ `.github/workflows/preview.yml` 作成（PR → Vercel プレビュー URL 自動生成・Gate 2 確認リンク付きコメントを PR に自動投稿）
  2. ✅ `.github/pull_request_template.md` 作成・更新（Gate 1 ヒラメ署名 + Gate 2 えんまさ確認チェックリスト + before/after サンプル欄）
- **残作業：** Vitest 導入 + `lib/diagnostics/` の unit test（G1 残作業として追跡）
- **設計根拠：** `docs/discussions/20260504_議論ログ_アトミック確認ループ設計.md` / `docs/output/decisions/harness-redesign-v2-2026-05-05.md`

### ~~G8. まあみ claude_design フロー未定義~~ ✅ 解消（2026-05-03）
- **解消内容：** `docs/harness/DESIGN_FLOW.md` を新規作成。Gate 1（Coherence）→ Gate 2（Compatibility）→ Gate 3（Fidelity）の3段階ゲートを定義。`docs/input/setup/claude_design_prompt_template.md` でclaudie_designへのコンテキストインジェクションを標準化。
- **残作業：** `ONBOARDING.md` のまあみセクションに `DESIGN_FLOW.md` へのリンクを追加する。

### G1. テストコマンドが未整備
- **状態：** 🟡 部分解消（2026-05-05・整合性ハーネス再設計 Phase 1）
- **詳細：** Vitest 4.1.5 を導入済み。`package.json` の `test` / `test:watch` スクリプト追加・`vitest.config.ts` 設置・`.github/workflows/ci.yml` に `test` ジョブ追加完了。`lib/prompts/__tests__/` と `lib/constitution/__tests__/` の2スイートが CI で動作。
- **残作業：** `lib/diagnostics/__tests__/` の以下テストは F2 実装開始前に追加（決定論的ロジック保証）：
  - MBTI 境界値テスト
  - 星座算出テスト（カスプ日・1月19日/3月20日等の境界値） ← F2.1a 要件定義完了（2026-05-05）
  - 動物性格診断（60アニマル）算出テスト（命数境界値・閏年2/29）← F2.1b 要件定義完了（2026-05-05）
  - 六星占術算出テスト（12分類・陰陽切り替え境界値） ← F2.1c 要件定義完了（2026-05-05）
- **設計根拠：** `docs/harness/HARNESS_DECISIONS.md` §6c（Deterministic First原則）/ `docs/output/decisions/harness-redesign-proposal-2026-05-05.md` Action 3
- **担当：** ヒラメ（API/構造設計担当）

### G10. プロンプト回帰テストおよびEval未整備
- **状態：** 🟡 部分解消（2026-05-05・F3を待たず先行導入）
- **詳細：** Phase 1 として `lib/prompts/__tests__/banned-words.test.ts` を導入済み。既存プロンプト2本（`onboarding.ts` / `contradiction-handling.ts`）に対する禁止語彙テスト + 共感フェーズ必須キーワードテストが CI で動作。`lib/constitution/__tests__/drift.test.ts` で文書（AGENTS.md / language-design-v1.md / cocosil-domain SKILL.md）とコード（`lib/constitution/banned-words.ts`）の整合性も自動検証。
- **残作業：**
  - F3実装時に共感チャット 3フェーズプロンプトのテスト追加
  - **Phase 2（Sprint 3以降）：** promptfoo 導入（設計中枢5問をEvalルーブリック化）
- **設計根拠：** `docs/harness/HARNESS_DECISIONS.md` §6c（Prompt as Code原則 / Design-Center as Rubric原則）/ `docs/output/decisions/harness-redesign-proposal-2026-05-05.md` Action 3
- **担当：** ヒラメ（実装）・えんまさ（Evalルーブリック内容承認）

### G11. PR template 自己審査構造（C2）
- **状態：** ✅ 解消（2026-05-05）
- **解消内容：** `.github/pull_request_template.md` の設計中枢チェック5問を「実装者判定列 / レビュアー判定列」の独立判定形式に変更。`.github/workflows/disagreement-detector.yml` で両者の差分を自動検知し、PRに議論喚起コメントを投稿する。`.claude/commands/start-task.md` Step 2.5 を「初期見立て」と明示し、PR templateの判定とは役割を分離。
- **設計根拠：** `docs/output/decisions/harness-redesign-proposal-2026-05-05.md` 原則② / `docs/discussions/20260503_20260503_議論ログ_設計中枢運用落とし穴.md`（自己審査71%通過の研究）

### G12. Constitution as Comment（C1）
- **状態：** ✅ 解消（2026-05-05）
- **解消内容：** `lib/constitution/` を新設（`banned-words` / `ux-sequence` / `immutables` / `mutables` / `index`）。Autogenesis Constitution と言語設計の **正をコードに昇格**。`AGENTS.md` §7・`language-design-v1.md` §1・`cocosil-domain skill` のドメイン言語ルールに「正は `lib/constitution/`、ドリフト時はコードを正とする」と注記追加。`lib/constitution/__tests__/drift.test.ts` が文書とコードの整合性を CI で検証。
- **設計根拠：** `docs/output/decisions/harness-redesign-proposal-2026-05-05.md` 原則①

### ~~G2. `lib/prompts/` 未作成~~ ✅ 解消（2026-05-02）
- **解消内容：** `lib/prompts/` ディレクトリ作成済み。APIルート（`app/api/chat/`・`app/api/report/`）から `@/lib/prompts/` でエイリアス参照できる。

### ~~G3. `lib/data/` 未作成~~ ✅ 解消（2026-05-02）
- **解消内容：** `lib/data/` ディレクトリ作成済み。4体系ナレッジ（MBTI / 星座 / 動物性格診断 / 六星占術）を格納。APIルートから `@/lib/data/` で参照できる。
- **残作業：** 動物占い60アニマルの著作権確認（要件定義 v1.3 §8 リスク表参照）。

### ~~G4. CODEOWNERS が単独運用~~ ✅ 解消（2026-05-02）
- **解消内容：** ヒラメ（@shuichiro-16）・まあみ（@maami415）の GitHub アカウント確定。`.github/CODEOWNERS` を v1.3 体制（3人レイヤー別分業）に更新。
- **残作業：** 2人を GitHub リポジトリのコラボレーターとして招待する必要あり（GitHub Settings > Collaborators）。

### ~~G5. Clerk 環境変数未登録~~ ✅ 解消（2026-05-02）
- **解消内容：** `.env.local` に `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` と `CLERK_SECRET_KEY` を設定済み。
- **残作業：** GitHub Secrets への登録（CI で `build` ジョブを動かす場合に必要）→ G6 で追跡。

### ~~G6. GitHub Secrets 未登録~~ ✅ 解消（2026-05-02）
- **解消内容：** `SUPABASE_ACCESS_TOKEN` / `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` を GitHub Secrets に登録済み。`ci.yml` に `build` ジョブ追加・`deploy.yml` 作成が可能な状態。

### ~~G7. Branch Protection Rules 未設定~~ ✅ 解消（2026-05-02）
- **解消内容：** `main` ブランチに Ruleset を設定済み。PR 必須（Code Owners レビュー含む）・status checks（typecheck + lint）必須・force push ブロックを有効化。

---

## ✅ 解消済み Gap

（まだなし）

---

## 📋 ハーネス整備状況サマリー

| カテゴリ | 整備状況 |
|---|---|
| AIエージェント文脈注入（Layer A: AGENTS.md） | ✅ 完了（v1.3 体制反映済み） |
| AIエージェント文脈注入（Layer B: cocosil-domain skill） | ✅ 完了 |
| AIエージェント文脈注入（Layer C: cocosil-work command） | ✅ 完了 |
| 破壊的Bashコマンドのhookブロック | ✅ 完了（Phase 2） |
| Layer 1/2/3 Protected Areas（AGENTS.md §7） | ✅ 完了（Phase 2） |
| 検証コマンド（typecheck, lint） | ✅ 完了 |
| 検証コマンド（test） | 🟡 G1 部分解消（lib/diagnostics 残） |
| 検証コマンド（build, CI） | ✅ 完了（G5/G6 解消済み） |
| CI/CD Pipeline（typecheck + lint + test） | ✅ 完了（test ジョブ追加 2026-05-05） |
| CI/CD Pipeline（security, deploy） | 🟡 Phase 4 以降 |
| Branch Protection | ✅ 完了（G7 解消済み） |
| アトミック確認ループ（プレビュー + チェックリスト） | ✅ 完了（G9 解消 2026-05-05） |
| 単体テスト（lib/prompts/） | ✅ 完了（G10 部分解消・禁止語彙テスト） |
| 単体テスト（lib/diagnostics/） | ❗ G1 残作業（F2実装前） |
| Constitution as Code（lib/constitution/） | ✅ 完了（G12 解消 2026-05-05） |
| PR template 独立判定 + Disagreement Detector | ✅ 完了（G11 解消 2026-05-05） |
| Eval（設計中枢5問ルーブリック化） | 🟡 G10 Phase 2（Sprint 3以降） |
| 評価プロンプト（evals/） | ✅ 完了（Phase 3） |
| HARNESS_DECISIONS / HARNESS_HEALTH | ✅ 完了（Phase 3） |

---

## 🔍 設計上の判断（記録）

### Cursor 関連ファイルは生成しない
- 1shot プロンプトは `.cursor/rules/`、`.cursor/hooks/` を要求しているが、本プロジェクトは Cursor 未使用（`.cursorrules` も `.cursor/` ディレクトリも存在しない）
- Claude Code のみで開発するため、`.cursor/` 系は生成不要
- 将来 Cursor を使うメンバーが加わった場合は本ファイルに G として追記する

### `.github/workflows/agent-verify.yml` は作成しない
- 既存 `.github/workflows/ci.yml`（typecheck + lint）が同等機能を提供
- 1shot プロンプトの「CI placeholder」は ci.yml で充足済み

### PostToolUse formatter / Stop verify summary は導入しない
- MVP 速度優先（議論ログの「Minimum Fence, Maximum Speed」原則）
- 必要性が確認されたら追加（trigger: false positive 報告 or 品質低下検知）
