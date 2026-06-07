---
doc_id: task.f3.report-prompt
title: TSK-PROMPT-001 F3 統合レポートプロンプト
doc_type: task
status: review
author: えんまさ
created_at: 2026-05-07
github_issue: "#36"
branch: feature/36-f3-profilecore-report-wiring
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#43-統合レポートf3-v2の核心
related_impl_plan: ""
---

# TSK-PROMPT-001：F3 統合レポートプロンプト

> **ステータス**: review
> **担当**: えんまさ
> **Issue**: [#36](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/36)
> **ブランチ**: `feature/36-f3-profilecore-report-wiring`

---

## 概要

F3統合レポートの中核となるAIプロンプト設計。4体系（MBTI・星座・動物60アニマル・六星占術）を統合し、UXシーケンス「共感→安心→分析→行動」の順序を保持したリッチレポートコンテンツを生成する。F3.2「安心」フェーズのサブテキスト（承認・脱判定化・招待の3要素・100字以内）も本タスクで設計する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| F3フィーチャー要件 | [F3_integrated-report_features.md](../F3/F3_integrated-report_features.md) | §1（F3.1）/ §2（F3.2 安心サブテキスト）/ §5・§6（F3.5 D3） |
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.3 |
| 設計中枢 | [COCOSiL設計中枢.md](../../input/concepts/COCOSiL設計中枢.md) | Why → How → So What・5問試験紙 |
| 言語設計 | [language-design-v1.md](../../input/concepts/language-design-v1.md) | 全体 |
| Constitution | [lib/constitution/banned-words.ts](../../../lib/constitution/banned-words.ts) | 禁止語の正 |
| Constitution | [lib/constitution/ux-sequence.ts](../../../lib/constitution/ux-sequence.ts) | UXシーケンスの正 |

---

## 作成・変更ファイル一覧

```
lib/prompts/report/
  ├── system-prompt.ts                # 4体系統合システムプロンプト
  ├── reassurance-subtext.ts          # F3.2 サブテキスト生成プロンプト
  ├── regenerate-prompt.ts            # 再生成プロンプト（差分強調）
  ├── few-shot-examples.ts            # Few-Shot 事例（共感→安心→分析→行動）
  └── __tests__/
      ├── banned-words.test.ts        # 禁止語ユニットテスト
      ├── ux-sequence.test.ts         # UXシーケンス順序テスト
      └── reassurance-subtext.test.ts # 100字以内・3要素検証

docs/output/prompts/F3/
  ├── samples-before.md               # AI応答サンプル（before）3件
  └── samples-after.md                # AI応答サンプル（after）3件
```

---

## 実装ステップ

1. システムプロンプト（`system-prompt.ts`）を4体系統合・共感→安心→分析→行動の順序で設計
2. F3.2 サブテキストプロンプト（`reassurance-subtext.ts`）を承認・脱判定化・招待の3要素・100字以内で設計
3. 再生成プロンプト（`regenerate-prompt.ts`）を設計：前回以降のF4チャット・F3.3しっくりきたマーカー・F5記録の蓄積データ（D3 蓄積データ反映型）をコンテキストに織り込み、「今の自分」視点で前回との差分を強調
4. Few-Shot事例（`few-shot-examples.ts`）を3〜5件用意（多様な4体系組合せ）
5. ユニットテスト追加：
   - 禁止語チェック（占い・鑑定・運勢・当たる・霊感・霊視を含まない）
   - UXシーケンス順序チェック（共感→安心→分析→行動）
   - F3.2 サブテキスト100字以内・3要素含有
6. AI応答サンプル3件を生成して `docs/output/prompts/F3/samples-{before,after}.md` に保存
7. 設計中枢5問のリトマス試験紙を通過確認（Q1〜Q3 Must / Q4〜Q5 Should）

---

## 完了定義

- [ ] `lib/prompts/report/` 配下にプロンプトファイル配置
- [x] `pnpm typecheck` 通過
- [x] `pnpm lint` 通過
- [x] 禁止語ユニットテスト通過（`expect(prompt).not.toContain("占い")` 等）— integrated-report 用8件追加（計25件緑）
- [ ] UXシーケンス順序テスト通過
- [x] F3.2 サブテキストが100字以内・承認/脱判定化/招待の3要素を含む（テスト化）— 既存 `lib/prompts/reassurance.ts` でカバー済み
- [x] AI応答サンプル3件をPRに添付（after・新規のため before なし）
- [ ] 設計中枢5問のMust（Q1〜Q3）すべて◯
- [ ] Gate 2（えんまさ）承認完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
| 2026-05-21 | えんまさ | F3要件精緻化に伴い参照を追加。再生成プロンプトに D3「蓄積データ反映型」を明記（task-issue-generator メンテ） |
| 2026-05-29 | えんまさ | F3.1統合レポートシステムプロンプトの叩き台を `lib/prompts/integrated-report.ts` に実装（TSK計画の `lib/prompts/report/` 分割ではなく、まず単一ファイルの叩き台として着手）。キャッチフレーズ（20字程度・止観の「観＝命名」）セクション追加、呼称トーン=「○○さん」付け確定（D8）、②詳細説明文の注入受け皿（`SystemProfile.description`・未整備時はラベルのみフォールバック）を設計。禁止語ユニットテスト8件追加（計25件緑）。サンプル3件を `docs/output/F3/TSK-PROMPT-001_sample-outputs.md` に保存。F3.2サブテキストは既存 `reassurance.ts` でカバー済みのため範囲外、再生成プロンプト（D3）はPhase 3スコープのため未着手。**Gate 2承認・設計中枢5問の正式確認・UXシーケンステスト・②実APIサンプル差し替えは残**。status: planned → in-progress |
