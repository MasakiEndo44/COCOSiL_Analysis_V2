---
doc_id: task.docs.html-docs-for-members
title: TSK-DOCS-002 開発メンバー向けインタラクティブHTML説明ドキュメント
doc_type: task
status: review
author: えんまさ
created_at: 2026-05-27
github_issue: "#63"
branch: "feature/63-html-docs-for-members"
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#6-3-vercel-ai-sdk--openai共感aiチャットレポート生成
related_impl_plan: ""
---

# TSK-DOCS-002：開発メンバー向けインタラクティブHTML説明ドキュメント

> **ステータス**: review
> **担当**: えんまさ
> **Issue**: [#63](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/63)
> **ブランチ**: `feature/63-html-docs-for-members`

---

## 概要

開発メンバー（ヒラメ・まあみ）向けに、COCOSiL V2 の技術スタック・4体系統合アルゴリズム・診断レポート生成ワークフローをインタラクティブに俯瞰できるHTMLドキュメントを `docs/output/help/` 配下に作成する。
内容は要件定義書・議論ログ・既存ナレッジからの引用に限定し、新規の意味的判断は含めない（Gate 2 対象外）。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §3.3 / §4.1〜4.3 / §6.3 / §6.4 / §7.1 |
| F3.1観察軸設計 | [f3-keyword-tree-integration.md](../goals/f3-keyword-tree-integration.md) | 全体 |
| 議論ログ | [議論ログ_AIチャット技術スタック選定.md](../../discussions/議論ログ_AIチャット技術スタック選定.md) | 全体 |
| 議論ログ | [議論ログ_imager2アーキ選定.md](../../discussions/議論ログ_imager2アーキ選定.md) | 全体 |
| 設計中枢 | [COCOSiL設計中枢.md](../../input/concepts/COCOSiL設計中枢.md) | パンチャ構造 §2 |

---

## 作成・変更ファイル一覧

```
docs/output/help/
  ├── index.html              # メインのインタラクティブHTML（タブ切替で3観点を表示）
  ├── styles.css              # スタイリング
  ├── scripts.js              # タブ切替・アコーディオン制御
  ├── assets/                 # 図表・スクリーンショット
  │   ├── ai-sdk-stack.svg
  │   ├── 4system-integration.svg
  │   └── report-workflow.svg
  └── README.md               # このフォルダの目的と開き方
```

---

## 実装ステップ

1. `docs/output/help/` ディレクトリを作成し、`README.md` で目的と開き方を記述
2. 3観点（AI SDK / 4体系統合 / レポート生成ワークフロー）のセクション構成を決め `index.html` の雛形を作成
3. **観点1: AI SDK セクション** — §6.3 / §7.1 / 議論ログ から引用し、`streamText()` + Edge Runtime の処理フロー図を作成
4. **観点2: 4体系統合** — §4.2 / F3.1 観察軸ツリー / 設計中枢 から引用し、パンチャ構造（4+1=5）の図解を追加
5. **観点3: レポート生成ワークフロー** — §3.3 / §4.1〜4.3 を時系列フローで可視化（F1→F2→F3 一気通貫）
6. インタラクティブ要素（タブ切替・アコーディオン）を `scripts.js` に実装
7. ローカル（`open docs/output/help/index.html`）で全セクションの動作確認

---

## 完了定義

- [ ] `pnpm typecheck` 通過（コード変更なしのため自動的に通過）
- [ ] `pnpm lint` 通過
- [ ] `docs/output/help/index.html` が単体で開ける（外部依存ゼロ or CDN のみ）
- [ ] 3観点すべてのセクションが揃い、各セクション内の引用が要件定義書のセクション番号と一致
- [ ] インタラクティブ要素（タブ切替・アコーディオン）が動作する
- [ ] 要件定義書・議論ログへの相対リンクがすべて生きている
- [ ] Gate 1（ヒラメ）: 不要（コード変更なし）
- [ ] Gate 2（えんまさ）: 不要（スタイリング・構造のみ。内容は既存ドキュメントからの引用に限定）

---

## 派生タスク

- **TSK-DOCS-003**: 本タスクの作成フローを `.claude/skills/interactive-html-doc-builder/` としてスキル化（本タスク完了後着手）

---

## 実装状況（更新ログ）

> このセクションを**実装進行中に更新**する。
> 手動実装・AI実装問わず、PR作成前に最新状態に保つこと（`/finish-task` が確認する）。

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-27 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
| 2026-05-27 | えんまさ | 実装完了。`docs/output/help/` 配下に README.md / index.html / styles.css / scripts.js を作成（4ファイル・合計約1,344行）。3観点（AI SDK 技術スタック・4体系統合メソッド・診断レポート生成ワークフロー）をタブ構造で収録。Inline SVG 図解3枚（AI SDK 階層 / パンチャ構造4+1=5 / F1→F2→F3 フロー）。アコーディオン展開、URLハッシュ連携、レスポンシブ対応。引用元7ファイルの実在確認済み。Status: planned → review |
