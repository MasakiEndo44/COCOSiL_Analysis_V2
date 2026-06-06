---
doc_id: task.f3.profile-core
title: TSK-API-010 F3 ProfileCore 決定論スコア核
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-06-06
github_issue: "#74"
branch: "TBD — /start-task で作成"
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#4.3
related_impl_plan: docs/output/goals/f3-report-determinism-implementation-plan.md
---

# TSK-API-010：F3 ProfileCore 決定論スコア核（Score Once, Narrate Freely）

> **ステータス**: planned
> **担当**: ヒラメ（実装）／ えんまさ（Gate 2 内容承認）
> **Issue**: [#74](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/74)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F3 レポートの揺らぎを根絶するため、既存の決定論的純関数 `harvest()` を単一の確定スコア核 `ProfileCore`（Source of Truth）に昇格する。LLM は数値を再計算せず「語る翻訳者」に格下げし、揺らぎを数値層で殺す。**本丸は新規計算ではなく「harvest()→ProfileCore昇格→プロンプト注入」の配線**（harvest() は実装済みだが現在未接続）。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件ゴール | [f3-report-determinism-and-self-anchor.md](../goals/f3-report-determinism-and-self-anchor.md) | AC-1〜10 |
| 実装計画 | [f3-report-determinism-implementation-plan.md](../goals/f3-report-determinism-implementation-plan.md) | Phase 0・1 |
| 設計議論 | [20260604_議論ログ_F3レポート揺らぎ改善.md](../../discussions/20260604_議論ログ_F3レポート揺らぎ改善.md) | — |
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.3 |

---

## 作成・変更ファイル一覧

```
lib/diagnostics/integration/
  ├── profile-core.ts        # 新規: ProfileCoreSchema(zod/v4) + buildProfileCore
  ├── affinity-score.ts      # 体系別寄与重み(SYSTEM_WEIGHTS)導入・MBTI寄り再調整
  ├── index.ts               # re-export 追加
  └── __tests__/             # 再現性テスト(同一入力で完全一致)

lib/constitution/
  └── axis-affinity-matrix.ts # 体系別寄与重みの定義箇所(要調整時)

lib/data/
  └── character-label-vocab.ts # 新規: キャラ名(形容詞＋名詞)語彙テーブル
```

---

## 実装ステップ

1. **【Phase 0】** `profile-core.ts` に `ProfileCoreSchema` + `ProfileCore` 型を定義（axisScores/type32/identity/characterLabel/strengths[2]/weakness{trait,exit}/johariBlindspots/distribution/weights/seed/version）→ main マージで他タスクの契約確定
2. **【Gate 2 / 1.2】** 体系別寄与重み `SYSTEM_WEIGHTS` を導入し MBTI寄りに再調整、`weights` に明示記録（診断結果サンプル3ケース before/after）
3. **【Gate 2 / 1.3】** `buildCharacterLabel(axisScores, type32)` — 形容詞＋名詞を語彙テーブルから決定論導出（LLM不使用・禁止語0%）
4. **【1.4】** `deriveBlindspots(axisScores)` — 自覚しにくい強みを軸スコアから決定論抽出・出自メタ保持
5. **【1.5】** `buildDistribution(axisScores)` — 「同タイプ内傾向/設計上の理論分布」と出自明示（「一般分布」詐称禁止）
6. **【Gate 2 / 1.6】** `deriveStrengthsWeakness(axisScores)` — 強み2:弱み1、weakness は `{trait(状況依存), exit(行動の出口)}`（瞋ガード）
7. **【1.7】** `buildProfileCore(input)` — harvest をラップ・seed(入力ハッシュ)/version stamp・`PROFILE_CORE_VERSION` 定数で Append-Only
8. Vitest: 同一入力で ProfileCore 完全一致を assert（再現性 AC-1）

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] 同一入力で ProfileCore 確定フィールド一致率100%（Vitest）
- [ ] Gate 1（ヒラメ）確認完了
- [ ] Gate 2（えんまさ）: 診断結果サンプル3ケース(before/after)承認完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-06-06 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
