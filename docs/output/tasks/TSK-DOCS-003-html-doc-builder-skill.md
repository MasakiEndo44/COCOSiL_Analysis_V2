---
doc_id: task.docs.html-doc-builder-skill
title: TSK-DOCS-003 HTML作成フローのスキル化
doc_type: task
status: review
author: えんまさ
created_at: 2026-05-27
github_issue: "#64"
branch: "feature/64-html-doc-builder-skill"
related_requirements: ""
related_impl_plan: ""
depends_on: TSK-DOCS-002
---

# TSK-DOCS-003：HTML作成フローのスキル化

> **ステータス**: review
> **担当**: えんまさ
> **Issue**: [#64](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/64)
> **依存**: [TSK-DOCS-002](TSK-DOCS-002-html-docs-for-members.md) 完了後着手
> **ブランチ**: `feature/64-html-doc-builder-skill`

---

## 概要

TSK-DOCS-002 のHTML作成プロセスを `.claude/skills/interactive-html-doc-builder/` として再利用可能にする。
情報源（要件定義書・議論ログ等）→ セクション構成 → インタラクティブHTML生成 の一連の手順を1コマンドで実行できるようにする。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 親タスク | [TSK-DOCS-002](TSK-DOCS-002-html-docs-for-members.md) | 成果物が「正解例」になる |
| スキル雛形生成 | `/skill-creator`（Anthropic 公式 fork） | 雛形生成・description最適化 |

---

## 作成・変更ファイル一覧

```
.claude/skills/interactive-html-doc-builder/
  ├── SKILL.md                # スキル本体（trigger words・手順・テンプレート参照）
  └── assets/
      ├── html-template.html  # 基底HTMLテンプレート
      ├── styles-base.css     # 共通スタイル
      └── scripts-interactive.js  # タブ・アコーディオン制御
```

---

## 実装ステップ

1. `/skill-creator` を使ってスキル雛形（`.claude/skills/interactive-html-doc-builder/`）を生成
2. TSK-DOCS-002 の成果物を分析し、再現すべき手順を SKILL.md に明文化
3. trigger words を設定（「HTMLドキュメントを作って」「help ページを作成」「インタラクティブHTML」「メンバー説明用ドキュメント」等）
4. TSK-DOCS-002 で作った HTML/CSS/JS の基底テンプレートを `assets/` に切り出し
5. テスト: 小さな試作HTMLドキュメント（例: `docs/output/help/sandbox/test.html`）をスキル経由で生成できるかを確認

---

## 完了定義

- [x] `pnpm typecheck` 通過（エラー0）
- [x] `pnpm lint` 通過（エラー0／既存 app/page.tsx の警告2件のみ）
- [x] `.claude/skills/interactive-html-doc-builder/SKILL.md` が存在し、trigger words が明文化されている
- [x] `assets/` 配下に基底テンプレート（HTML/CSS/JS）が配置されている
- [x] スキルから試作HTMLが生成できることを確認（`docs/output/help/sandbox/test.html` を Playwright でタブ/アコーディオン/SVG動作検証）
- [x] Gate 1（ヒラメ）: 不要
- [x] Gate 2（えんまさ）: 不要（スキル機械化・意味的判断なし）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-27 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
| 2026-06-07 | えんまさ | スキル `interactive-html-doc-builder` を実装（SKILL.md + assets 3点）。TSK-DOCS-002 の CSS/JS を基底に移植、html-template とコンポーネントギャラリーを追加。試作 `sandbox/test.html` を Playwright で動作確認。status: planned → review |
