---
doc_id: help.cocosil-v2.member-onboarding
title: COCOSiL V2 開発メンバー向けインタラクティブHTML説明ドキュメント
doc_type: help
status: active
audience: 開発メンバー（ヒラメ・まあみ）
created_at: 2026-05-27
related_task: docs/output/tasks/TSK-DOCS-002-html-docs-for-members.md
---

# `docs/output/help/` — 開発メンバー向け説明ドキュメント

## 目的

COCOSiL V2 の開発メンバー（ヒラメ・まあみ）が「自分が今何を作っているか」を3観点で俯瞰できるインタラクティブHTMLドキュメント。
新規参画者のオンボーディング時間を短縮し、要件定義書・議論ログ・既存ナレッジへの導線を1ページに集約する。

## 開き方

```bash
open docs/output/help/index.html
```

ブラウザで `index.html` を開くだけで動作する（外部依存ゼロ・サーバー不要）。

## 収録内容

3観点のタブ構造で構成:

| タブ | 観点 | 主な引用元 |
|---|---|---|
| **観点1** | AI SDK の技術スタック | 要件定義書 §6.3 / §7.1 / 議論ログ_AIチャット技術スタック選定.md |
| **観点2** | 4体系の統合メソッド | 要件定義書 §4.2 / F3.1観察軸ツリー設計 / 設計中枢 §2.2-2.3 |
| **観点3** | 診断レポート生成までのワークフロー | 要件定義書 §3.3 / §4.1〜4.3 / §6.4 |

## 内容ポリシー

本ドキュメントは **要件定義書・議論ログ・既存ナレッジからの引用のみ**で構成されており、新規の意味的判断を含まない（TSK-DOCS-002 / Gate 2 対象外）。
新しい技術選定・新概念の追加は本ドキュメントでは行わない。元ドキュメントが更新された際に追従する位置づけ。

## ファイル構成

```
docs/output/help/
  ├── README.md      # このファイル
  ├── index.html     # メインのインタラクティブHTML
  ├── styles.css     # スタイリング
  └── scripts.js     # タブ切替・アコーディオン制御
```

図表（SVG）は HTML 内に inline で埋め込んでおり、外部 `assets/` ディレクトリは作成していない。これにより `index.html` 単体で完結する。

## 関連ドキュメント

- 要件定義書: [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md)
- F3.1 観察軸ツリー設計: [f3-keyword-tree-integration.md](../goals/f3-keyword-tree-integration.md)
- 設計中枢: [COCOSiL設計中枢.md](../../input/concepts/COCOSiL設計中枢.md)
- AIチャット技術スタック議論: [議論ログ_AIチャット技術スタック選定.md](../../discussions/議論ログ_AIチャット技術スタック選定.md)
- イメージ生成アーキ議論: [議論ログ_imager2アーキ選定.md](../../discussions/議論ログ_imager2アーキ選定.md)
