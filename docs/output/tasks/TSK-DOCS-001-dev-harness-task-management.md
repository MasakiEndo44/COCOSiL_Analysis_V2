---
doc_id: task.docs.dev-harness-task-management
title: TSK-DOCS-001 開発体制強化 — TASK管理・ハーネス修正
doc_type: task
status: review
author: えんまさ
created_at: 2026-05-07
github_issue: ""
branch: chore/dev-harness-task-management
related_requirements: ""
related_impl_plan: ""
---

# TSK-DOCS-001：開発体制強化 — TASK管理・ハーネス修正

> **ステータス**: 🟡 実装中  
> **担当**: えんまさ + AI  
> **Issue**: —（ハーネス整備のためIssue不要）  
> **ブランチ**: `chore/dev-harness-task-management`

---

## 概要

ヒラメ・まあみがスムーズに開発を進められるよう、docs構造・TASK管理・ハーネスコマンドを整備する。「読まれる地図」= TASK-INDEX.md の導入と、/start-task・/finish-taskへのIssue/TASK連携追加が中心。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 議論ログ | [20260507_議論ログ_開発体制強化設計.md](../../discussions/20260507_議論ログ_開発体制強化設計.md) | Turn 5 設計原則 |
| ハーネス | [AGENTS.md](../../../AGENTS.md) | §7〜9 |

---

## 作成・変更ファイル一覧

```
docs/
  ├── TASK-INDEX.md                          # 新規: 機能×フェーズ マトリクス
  ├── ONBOARDING.md                          # 変更: TASK-INDEX導線追加
  ├── output/tasks/
  │   ├── _TEMPLATE.md                       # 新規: TSKテンプレート
  │   ├── TSK-DB-001-db-schema-cleanup.md    # 新規
  │   ├── TSK-UI-001-f2-ui-component-design.md  # 新規
  │   └── TSK-DOCS-001-dev-harness-task-management.md  # このファイル
  └── discussions/
      └── 20260507_議論ログ_開発体制強化設計.md          # 新規

.claude/commands/
  ├── start-task.md                          # 変更: Step 2.6追加
  └── finish-task.md                         # 変更: Step 1.5追加

.github/
  └── pull_request_template.md              # 変更: F1-F10正規化 + TASK確認
```

---

## 実装ステップ

1. ✅ 議論ログ保存（`docs/discussions/20260507_議論ログ_開発体制強化設計.md`）
2. ✅ TSKテンプレート作成（`docs/output/tasks/_TEMPLATE.md`）
3. ✅ TASK-INDEX.md作成
4. ✅ GH Issue #27（DB整理）・#28（F2 UI）作成
5. ✅ 初期TSKファイル3件作成
6. PR template改修（F1-F10正規化 + TASK更新確認セクション）
7. `start-task.md` 改修（Step 2.6 追加）
8. `finish-task.md` 改修（Step 1.5 + PR body拡張）
9. `ONBOARDING.md` 改修（TASK-INDEX導線 + 困ったときの地図拡充）
10. `pnpm typecheck` / `pnpm lint` 確認

---

## 完了定義

- [ ] TASK-INDEX.mdでF1-F10のナビが可能
- [ ] `start-task.md` Step 2.6 動作確認（Issue番号 → TSKファイル確認フロー）
- [ ] `finish-task.md` Step 1.5 動作確認（TSKファイル鮮度チェック）
- [ ] PR template F1-F10正規化済み + TASK更新確認セクション追加済み
- [ ] ONBOARDING.mdが200行以内

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ（AI） | 初版作成 |
| 2026-05-07 | えんまさ（AI） | 全Step完了（Step 1〜10）。PR作成前のレビュー待ち。 |
