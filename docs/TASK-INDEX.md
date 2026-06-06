---
doc_id: canonical.cocosil.task-index
title: COCOSiL V2 TASK-INDEX — 機能別タスク管理
doc_type: task-index
product: cocosil
layer: canonical
status: active
updated_at: 2026-05-21
---

# COCOSiL V2 TASK-INDEX

> **目的**: 機能別・担当者別の作業状況を一覧管理し、「今の自分のタスクに必要な文書」に5秒でたどり着けるようにする。  
> **更新タイミング**: PR作成前（`/finish-task` のStep 1.5 で確認）。フェーズが変わったら必ずこの表を更新する。

---

## TSK ID 命名規則

```
TSK-[分類]-[番号3桁]
```

| 分類 | 対象領域 | 例 |
|------|---------|-----|
| `DB` | DBスキーマ・マイグレーション | TSK-DB-001 |
| `UI` | フロントエンド・コンポーネント | TSK-UI-001 |
| `API` | APIルート・バックエンドロジック | TSK-API-001 |
| `PROMPT` | AIプロンプト・言語設計 | TSK-PROMPT-001 |
| `DOCS` | ドキュメント・ハーネス設計 | TSK-DOCS-001 |
| `CHORE` | 設定・依存関係・CI | TSK-CHORE-001 |

---

## 機能別タスク一覧

### F1 — オンボーディング・登録

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-UI-002** | F1 ウェルカム対話UIコンポーネント | まあみ | 🔵 設計中 | [#32](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/32) | [TSK-UI-002-f1-welcome-ui.md](output/tasks/TSK-UI-002-f1-welcome-ui.md) | [F1要件書](output/F1/F1_onboarding_features.md) ／ [§4.1](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-API-001** | F1 オンボーディングAPI | ヒラメ | 🔵 設計中 | [#33](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/33) | [TSK-API-001-f1-onboarding-api.md](output/tasks/TSK-API-001-f1-onboarding-api.md) | [F1要件書](output/F1/F1_onboarding_features.md) ／ [§4.1](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F2 — 性格分析・自動診断

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-UI-001** | F2 フロントUI改良＆UIコンポーネント定義 | まあみ | 🟡 実装中 | [#28](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/28) | [TSK-UI-001-f2-ui-component-design.md](output/tasks/TSK-UI-001-f2-ui-component-design.md) | [§4.2](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-DB-001** | DB構造整理（profiles/chat_sessions/weights） | ヒラメ | 🔴 レビュー中 | [#27](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/27) | [TSK-DB-001-db-schema-cleanup.md](output/tasks/TSK-DB-001-db-schema-cleanup.md) | [§4.1〜4.2](output/requirements/cocosil_v2_detailed_requirements_specification.md) + [impl-plan](output/roadmap/impl-plan-near-soft-feedback-loop.md) |
| **TSK-API-007** | F2 六星占術 霊合星人ロジック実装 | ヒラメ | 🔵 設計中 | [#54](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/54) | [TSK-API-007-f2-six-star-reigosei.md](output/tasks/TSK-API-007-f2-six-star-reigosei.md) | [§4.2.1c](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F3 — 統合レポート

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-UI-003** | F3 統合レポートUI | まあみ | 🔵 設計中 | [#34](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/34) | [TSK-UI-003-f3-report-ui.md](output/tasks/TSK-UI-003-f3-report-ui.md) | [§4.3](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-API-002** | F3 Vercel OGレポート生成API | ヒラメ | 🔵 設計中 | [#35](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/35) | [TSK-API-002-f3-report-api.md](output/tasks/TSK-API-002-f3-report-api.md) | [§4.3](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-PROMPT-001** | F3 統合レポートプロンプト | えんまさ | 🔵 設計中 | [#36](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/36) | [TSK-PROMPT-001-f3-report-prompt.md](output/tasks/TSK-PROMPT-001-f3-report-prompt.md) | [§4.3](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-API-008** | F3 レポート付随API（しっくりきたマーカー・満足度アンケート） | ヒラメ | 🔵 設計中 | [#56](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/56) | [TSK-API-008-f3-report-records-api.md](output/tasks/TSK-API-008-f3-report-records-api.md) | [F3要件](output/F3/F3_integrated-report_features.md) §3-4 |
| **TSK-API-009** | F3.5 レポート再生成API（蓄積データ反映・課金ゲート） | ヒラメ | 🔵 設計中 | [#57](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/57) | [TSK-API-009-f3-report-regenerate-api.md](output/tasks/TSK-API-009-f3-report-regenerate-api.md) | [F3要件](output/F3/F3_integrated-report_features.md) §5-6 |
| **TSK-DB-002** | F3 MBTI A/T(Identity)軸の導入（入力ベクトル一意化） | ヒラメ | 🔵 設計中 | [#75](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/75) | [TSK-DB-002-f3-mbti-identity-axis.md](output/tasks/TSK-DB-002-f3-mbti-identity-axis.md) | [揺らぎ改善](output/goals/f3-report-determinism-and-self-anchor.md) ／ [§4.2](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-API-010** | F3 ProfileCore 決定論スコア核（揺らぎ抑制） | ヒラメ | 🔵 設計中 | [#74](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/74) | [TSK-API-010-f3-profile-core.md](output/tasks/TSK-API-010-f3-profile-core.md) | [揺らぎ改善](output/goals/f3-report-determinism-and-self-anchor.md) ／ [§4.3](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

> **F3 揺らぎ抑制（2026-06-02 FB起点）**: 上記 TSK-DB-002 / TSK-API-010 が新規核。Phase 2/3/4 は既存 #36(TSK-PROMPT-001) / #35(TSK-API-002) / #34(TSK-UI-003) に「揺らぎ抑制要件」を追記済み。全体設計: [実装計画](output/goals/f3-report-determinism-implementation-plan.md)

---

### F4 — 共感AIチャット

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-UI-004** | F4 チャットUIコンポーネント | まあみ | 🔵 設計中 | [#37](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/37) | [TSK-UI-004-f4-chat-ui.md](output/tasks/TSK-UI-004-f4-chat-ui.md) | [§4.4](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-API-003** | F4 チャットAPIルート | ヒラメ | 🔵 設計中 | [#38](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/38) | [TSK-API-003-f4-chat-api.md](output/tasks/TSK-API-003-f4-chat-api.md) | [§4.4](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-PROMPT-002** | F4 5フェーズ共感プロンプト | えんまさ | 🔵 設計中 | [#39](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/39) | [TSK-PROMPT-002-f4-chat-prompt.md](output/tasks/TSK-PROMPT-002-f4-chat-prompt.md) | [§4.4](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F5 — アクション記録

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-UI-005** | F5 アクション記録UI | まあみ | 🔵 設計中 | [#40](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/40) | [TSK-UI-005-f5-action-ui.md](output/tasks/TSK-UI-005-f5-action-ui.md) | [§4.5](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-API-004** | F5 アクション記録API | ヒラメ | 🔵 設計中 | [#41](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/41) | [TSK-API-004-f5-action-api.md](output/tasks/TSK-API-004-f5-action-api.md) | [§4.5](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F6 — SNSシェアカード

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-UI-006** | F6 シェアカード生成UI | まあみ | 🔵 設計中 | [#42](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/42) | [TSK-UI-006-f6-share-card-ui.md](output/tasks/TSK-UI-006-f6-share-card-ui.md) | [§4.6](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F7 — 課金・サブスクリプション（Stripe）

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-API-005** | F7 Stripe統合API | ヒラメ | 🔵 設計中 | [#43](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/43) | [TSK-API-005-f7-stripe-api.md](output/tasks/TSK-API-005-f7-stripe-api.md) | [§4.7](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-UI-007** | F7 課金UIコンポーネント | まあみ | 🔵 設計中 | [#44](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/44) | [TSK-UI-007-f7-billing-ui.md](output/tasks/TSK-UI-007-f7-billing-ui.md) | [§4.7](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F8 — データオーナーシップ・プライバシー

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-API-006** | F8 データエクスポート/削除API | ヒラメ | 🔵 設計中 | [#45](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/45) | [TSK-API-006-f8-data-export-delete-api.md](output/tasks/TSK-API-006-f8-data-export-delete-api.md) | [§4.8](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F9 — 管理・運用基盤

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F9 管理ダッシュボード | 未定 | 未着手 | — | — | [§4.9](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F10 — 言語ガバナンス

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F10 言語ガバナンスCI整備 | 未定 | 未着手 | — | — | [§4.10](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### ハーネス・ドキュメント

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-DOCS-001** | 開発体制強化（TASK管理・ハーネス修正） | えんまさ | 🔴 レビュー中 | — | [TSK-DOCS-001-dev-harness-task-management.md](output/tasks/TSK-DOCS-001-dev-harness-task-management.md) | [AGENTS.md §7〜9](../AGENTS.md) |

---

## フェーズ凡例

| アイコン | フェーズ | 意味 |
|---------|---------|------|
| — | 未着手 | Issue未作成・実装着手前 |
| 🔵 | 設計中 | Issue作成済み・設計検討中 |
| 🟡 | 実装中 | ブランチ作成済み・実装進行中 |
| 🔴 | レビュー中 | PR作成済み・レビュー待ち |
| ✅ | 完了 | main マージ済み |

---

> **TASK-INDEXの更新方法**:  
> 1. `/start-task` → Issue作成後に Issue # 列を更新  
> 2. ブランチ作成後に「未着手 → 実装中」  
> 3. PR作成後に「実装中 → レビュー中」  
> 4. マージ後に「レビュー中 → 完了」  
> `/finish-task` の Step 1.5 がこの更新を毎回促す。
