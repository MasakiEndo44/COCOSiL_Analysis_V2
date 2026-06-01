---
name: task-issue-generator
description: >
  TASK-INDEXに記載されたタスクに対して GitHub Issue と TSKファイルを自動生成するスキル。
  必ず要件定義書（cocosil_v2_detailed_requirements_specification.md）を読んでから生成する。
  /start-task Step 2.6 から呼び出されるほか、単独で起動することもできる。
  Use when: "Issue生成" "TSKを作って" "チケット起票" "タスクドキュメントを作って"
  "TSK-**のIssueを作って" "未着手タスクを全部起票" "--all"
  設計原則: Context-Complete Generation / Read Before Write / Atomic Update
  設計根拠: docs/discussions/20260507_議論ログ_タスクIssue自動生成スキル設計.md
---

# task-issue-generator Skill

> 要件定義書を読んでから生成する。読まずに書かない（Read Before Write）。

---

## §1 PURPOSE

TASK-INDEXに掲載されたタスクに対して、**コンテキストが完全なチケット**を生成する。

- GitHub Issue（`gh issue create`）
- TSKファイル（`docs/output/tasks/TSK-***.md`）
- TASK-INDEX更新（IssueリンクとTSKファイルパス）

この3つを**1回の実行でアトミックに**完結させる。

生成の根拠は必ず要件定義書（`§4.x`）から引用する。テンプレートだけ埋める生成は行わない。

---

## §2 入力フォーマット

| 入力形式 | 説明 | 例 |
|---|---|---|
| TSK ID | 特定タスクを個別生成 | `TSK-UI-002` |
| タスク名（部分一致） | TASK-INDEXから該当タスクを検索 | `F1 ウェルカム対話UI` |
| `--all` | TASK-INDEXの「未着手（—）」タスクを全件生成 | `--all` |
| /start-task 連携 | Step 2.6 から自動的に呼ばれる（Issue番号なしの場合） | — |

---

## §3 実行手順

### Step 0: 入力解析

引数を解析して対象タスクを特定する。

- TSK ID形式（`TSK-[分類]-[番号]`）→ そのタスクのみ処理
- タスク名の部分一致 → TASK-INDEXから検索して候補を提示
- `--all` → TASK-INDEXの「フェーズ」欄が「—」（未着手）のタスク全件をリストアップして確認を求める

複数タスクが対象になる場合は一覧を表示してユーザーに確認してから処理する。

---

### Step 1: 必須ファイルの読み込み（Read Before Write — 省略不可）

以下の順序で必ず読み込む。この順序を崩さない。

```
① docs/TASK-INDEX.md
   → 対象タスクの TSK ID・タスク名・担当者・参照要件セクション番号を取得

② docs/output/requirements/cocosil_v2_detailed_requirements_specification.md
   → TASK-INDEXで確認した § 番号のセクション全文を Read
   → 機能概要・ユーザーストーリー・受け入れ基準・制約を抜粋

③ AGENTS.md § 7（Protected Areas）
   → 対象タスクの担当ガード（Layer / 担当者 / Gate 1・Gate 2 要否）を確認

④ docs/output/tasks/_TEMPLATE.md
   → TSKファイルのテンプレート構造を確認（フロントマターと必須セクション）

⑤ docs/output/tasks/ 配下の既存 TSKファイル（同 TSK ID がある場合）
   → 重複生成を防ぐ。存在する場合はユーザーに確認してから上書き or スキップ
```

---

### Step 2: Draft の生成（チャット内に表示して確認を求める）

読み込んだ内容を元に以下を生成してチャットに表示する。

**Issue の Draft（表示形式）:**

```
タイトル: TSK-[分類]-[番号]: <タスク名>

本文:
## 概要
<要件定義書から引用した機能概要 1〜3文>

## 参照要件
- 詳細要件定義書 § <N>: [リンク]
- 引用: "<要件定義書から直接引用した受け入れ基準または機能説明>"

## 担当
- Layer: <Layer 1 / 2 / 3>
- 担当者: <えんまさ / まあみ / ヒラメ>

## Gate チェック
- Gate 1（ヒラメ）: <必須 / 不要>
- Gate 2（えんまさ）: <必須 / 不要>  ← UIコピー/プロンプト/診断ロジック変更を含む場合

## 完了定義
- [ ] pnpm typecheck 通過
- [ ] pnpm build 通過
- [ ] <機能固有の動作確認項目（要件書から導出）>
- [ ] えんまさ動作確認完了（Gate 2 対象の場合）

ラベル: enhancement
```

**TSKファイルの Draft（フルプレビューをチャットに表示）**

確認を求めるフォーマット:

```
📋 生成内容プレビュー: TSK-[分類]-[番号]

[Issue Draft と TSK Draft を表示]

この内容で生成しますか？
  y — このまま生成
  n — キャンセル
  <修正点> — 修正してから生成
```

---

### Step 3: GitHub Issue 作成

ユーザーが承認したら `gh issue create` を実行する。

```bash
gh issue create \
  --title "TSK-[分類]-[番号]: <タスク名>" \
  --body "$(cat <<'BODY'
<Step 2 で生成した本文>
BODY
)" \
  --label "enhancement" \
  --repo COCOSiL-inc/COCOSiL_Analysis_V2
```

作成後、発行された Issue 番号（例: `#29`）を記録する。

---

### Step 4: TSKファイルの生成

`docs/output/tasks/` に TSKファイルを Write する。

**ファイル名規則:** `TSK-[分類]-[番号3桁]-<slug>.md`
- slug は TASK-INDEXのタスク名から kebab-case で生成（例: `f1-welcome-ui`）

**必須セクション（_TEMPLATE.md のフロントマターと構造を継承）:**

```markdown
---
doc_id: task.<feature>.<slug>
title: TSK-[分類]-[番号] <タスク名>
doc_type: task
status: planned
author: <担当者>
created_at: <今日の日付>
github_issue: "#<発行されたIssue番号>"
branch: "<TBD — /start-task で作成>"
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#<セクション番号>
---

# TSK-[分類]-[番号]：<タスク名>

> **ステータス**: planned
> **担当**: <担当者>
> **Issue**: [#<番号>](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/<番号>)

---

## 概要

<要件定義書から引用した機能概要>

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md] | § <N> |

---

## 作成・変更ファイル一覧

<要件定義書と担当ガードから推定した変更予定ファイル>

---

## 実装ステップ

<要件定義書の受け入れ基準から導出した実装ステップ案>

---

## 完了定義

- [ ] pnpm typecheck 通過
- [ ] pnpm lint 通過
- [ ] <機能固有の動作確認項目>
- [ ] Gate 1（ヒラメ）確認完了（バックエンド変更がある場合）
- [ ] Gate 2（えんまさ）確認完了（UIコピー/プロンプト変更がある場合）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| <今日の日付> | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
```

---

### Step 5: TASK-INDEX の更新（アトミック — Step 4 と同一セッションで実行）

`docs/TASK-INDEX.md` の該当タスク行を更新する。

**更新前（例）:**

```markdown
| — | F1 ウェルカム対話UIコンポーネント | まあみ | 未着手 | — | — | [§4.1](...) |
```

**更新後（例）:**

```markdown
| **TSK-UI-002** | F1 ウェルカム対話UIコンポーネント | まあみ | 🔵 設計中 | [#29](...) | [TSK-UI-002-f1-welcome-ui.md](output/tasks/TSK-UI-002-f1-welcome-ui.md) | [§4.1](...) |
```

更新内容:
- TSK ID を記入（太字）
- フェーズを「—」→「🔵 設計中」に変更
- Issue 番号（リンク付き）を記入
- TSKファイルパス（リンク付き）を記入

---

### Step 6: 完了レポートの表示

```
✅ 生成完了: TSK-[分類]-[番号]

  📝 Issue:      #<番号> — <タイトル>
  📄 TSKファイル: docs/output/tasks/TSK-***.md
  📋 TASK-INDEX: 更新済み（🔵 設計中）

担当者: <担当者>
Gate: <Gate 1 / Gate 2 の必要性>
次のステップ: /start-task TSK-[分類]-[番号] で実装着手
```

---

## §4 --all モード（一括生成）

`--all` が指定された場合、以下の手順で実行する。

1. TASK-INDEXから「フェーズ = —（未着手）」のタスクを全件抽出してリスト表示
2. ユーザーに「全件生成しますか？（y/全件 or 生成したいTSK IDをカンマ区切りで）」を確認
3. 確認後、各タスクについて Step 1〜6 を順に実行
4. 全件完了後にサマリーを表示

**一括生成時の注意:**
- 1件ごとにStep 2（プレビュー確認）を挟む（デフォルト）
- `--skip-confirm` フラグが指定された場合のみ確認をスキップ

---

## §5 設計原則（Read Before Write を絶対に守る理由）

| 原則 | 内容 | なぜ重要か |
|---|---|---|
| **Context-Complete Generation** | 要件書引用なしの部分的生成は行わない | 「何をするか不明なチケット」を生み、担当者が毎回要件書を再読するコストが残る |
| **Read Before Write** | 必ず3ファイルを読んでから生成する | 読み飛ばすと要件とチケットが乖離し、解釈ズレがバグの種になる |
| **Atomic Update** | Issue + TSKファイル + TASK-INDEX の3つを同一セッションで完結させる | 片方だけ更新して終わると TASK-INDEX が空欄のまま残り、管理不能になる |

---

## §6 関連スキル・ドキュメント

| 関連 | 内容 |
|---|---|
| `/start-task` Step 2.6 | TSKファイルが存在しない場合にこのスキルを呼び出す |
| `/spec-sync` | 要件定義書とドキュメント群の整合性チェック |
| `docs/TASK-INDEX.md` | 全タスクのマスター管理ファイル |
| `docs/output/tasks/_TEMPLATE.md` | TSKファイルのテンプレート |
| `docs/output/requirements/cocosil_v2_detailed_requirements_specification.md` | 参照元の要件定義書 |
| `docs/discussions/20260507_議論ログ_タスクIssue自動生成スキル設計.md` | このスキルの設計根拠 |
