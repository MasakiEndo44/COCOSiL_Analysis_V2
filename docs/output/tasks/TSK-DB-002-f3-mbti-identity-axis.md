---
doc_id: task.f3.mbti-identity-axis
title: TSK-DB-002 F3 MBTI A/T(Identity)軸の導入
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-06-06
github_issue: "#75"
branch: "TBD — /start-task で作成"
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#4.2
related_impl_plan: docs/output/goals/f3-report-determinism-implementation-plan.md
---

# TSK-DB-002：F3 MBTI A/T(Identity)軸の導入（入力ベクトル一意化）

> **ステータス**: planned
> **担当**: ヒラメ
> **Issue**: [#75](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/75)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

レポート揺らぎの最深部要因「入力ベクトルが一意に定まらない」を解消するため、MBTI に A/T 軸（Assertive 自己主張型 / Turbulent 慎重型）を追加し 16型→32型へ解像度を上げる。サポーター/リーダーの分岐を一意化し、ProfileCore の `type32` を確定させる前提条件。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 実装計画 | [f3-report-determinism-implementation-plan.md](../goals/f3-report-determinism-implementation-plan.md) | Phase 1.1 |
| 要件ゴール | [f3-report-determinism-and-self-anchor.md](../goals/f3-report-determinism-and-self-anchor.md) | AC-3 |
| 設計議論 | [20260604_議論ログ_F3レポート揺らぎ改善.md](../../discussions/20260604_議論ログ_F3レポート揺らぎ改善.md) | — |
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.2 |

---

## 作成・変更ファイル一覧

```
supabase/migrations/
  └── 2026MMDDHHMMSS_add_mbti_identity.sql  # Layer 1: mbti_results.identity 追加（適用は人間）

lib/diagnostics/integration/
  └── types.ts               # UserDiagnosticInput.identity / buildType32

app/diagnosis/mbti/
  ├── types.ts               # MbtiScores/MbtiPCI に identity 追加
  └── (質問データ・スコアリング)  # A/T判別設問の追加(文言=Gate 2)
```

---

## 実装ステップ

1. `lib/diagnostics/integration/types.ts`: `UserDiagnosticInput.identity?: 'A'|'T'` 追加、`buildType32(mbti, identity)` → `"INTJ-A"`
2. `app/diagnosis/mbti/types.ts`: Identity 軸を `MbtiScores`/`MbtiPCI` に追加
3. **【Gate 2】** 簡易診断に A/T 判別設問を数問追加（設問文言・スコアリングロジック）
4. **【Layer 1】** migration 追加: `mbti_results.identity TEXT CHECK (identity IN ('A','T'))` nullable（16型CHECKは壊さず別カラム）
5. **migration 適用は人間が手動実行**（Layer 1 hook ブロック）→ `pnpm db:types` で型再生成

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] migration ファイル追加（適用は人間）→ `pnpm db:types` 反映
- [ ] A/T 設問が最終 type32 に反映される（手動確認）
- [ ] Gate 1（ヒラメ）確認完了
- [ ] Gate 2（えんまさ）: A/T設問文言 承認完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-06-06 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
