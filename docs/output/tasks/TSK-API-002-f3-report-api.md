---
doc_id: task.f3.report-api
title: TSK-API-002 F3 Vercel OGレポート生成API
doc_type: task
status: review
author: ヒラメ
created_at: 2026-05-07
github_issue: "#35"
branch: feature/36-f3-profilecore-report-wiring
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#43-統合レポートf3-v2の核心
related_impl_plan: ""
---

# TSK-API-002：F3 Vercel OGレポート生成API

> **ステータス**: review
> **担当**: ヒラメ
> **Issue**: [#35](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/35)
> **ブランチ**: `feature/36-f3-profilecore-report-wiring`

---

## 概要

F3統合レポートのバックエンドAPI。Gamma API（月額約2万円）からの移行を確定（2026-05-07）し、Vercel OG (Satori) で文字崩れゼロ・即時生成のリッチレポート画像を返す。LLM（OpenAI）によるコンテンツ生成 → Reactコンポーネントベースの画像化 → Supabase Storage永続化までを担当する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| F3フィーチャー要件 | [F3_integrated-report_features.md](../F3/F3_integrated-report_features.md) | §1（F3.1 レポート生成エンジン） |
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.3 / §6.4 |
| 議論ログ | [20260507_議論ログ_imager2アーキ選定.md](../../discussions/20260507_議論ログ_imager2アーキ選定.md) | 全体 |
| 関連プロンプト | [TSK-PROMPT-001](TSK-PROMPT-001-f3-report-prompt.md) | レポート本文プロンプト |

---

## 作成・変更ファイル一覧

```
app/api/reports/
  └── generate/route.ts                # POST /api/reports/generate

lib/reports/
  ├── og-image.tsx                     # Vercel OG (Satori) Reactコンポーネント
  ├── markdown-fallback.ts             # Markdown+CSS 静的フォールバック
  ├── llm.ts                           # OpenAI レポート生成（30秒タイムアウト）
  ├── storage.ts                       # Supabase Storage user-reports 操作
  └── schemas.ts                       # Zod 入力検証

supabase/migrations/
  └── (RLS policy: storage.objects user-reports バケット)
```

---

## 実装ステップ

1. Zod スキーマで入力（4体系データ・user_id）を検証
2. Clerk JWT 検証 → `supabase.auth.getUser()` でユーザー特定
3. OpenAI（30秒タイムアウト）でレポート本文生成。失敗時は Markdown+CSS 静的フォールバック
4. Reactコンポーネント（`og-image.tsx`）に生成済みコンテンツを流し込み、`@vercel/og` で1024×1792 PNG生成
5. Supabase Storage `user-reports` バケットに `${user_id}/${uuid}.png` で保存
6. RLS policy で `user_id = auth.uid()` を Storage objects に適用
7. 本タスクは**初回生成のみ**を担当。再生成（30日ゲート・課金ゲート・蓄積データ反映）は TSK-API-009 に分離
8. Vercel OG 生成失敗時の Markdown+CSS フォールバック動作確認

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] POST `/api/reports/generate` が4体系データを受領しPNGを返す
- [ ] PNG出力サイズが1024×1792
- [ ] Supabase Storage `user-reports` バケットに保存・URL返却
- [ ] OpenAIタイムアウト30秒超過時にフレンドリーエラー＋リトライ導線
- [ ] Vercel OG生成失敗時にMarkdown+CSSフォールバック
- [ ] 再生成スコープは TSK-API-009 に委譲（本タスクは初回生成のみ）
- [ ] Gate 1（ヒラメ）レビュー完了：IDOR・JWT・型安全・エラー境界

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
| 2026-05-21 | えんまさ | F3要件精緻化に伴い参照を追加。再生成スコープを TSK-API-009 へ分離（task-issue-generator メンテ） |
