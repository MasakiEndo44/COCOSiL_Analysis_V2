---
doc_id: output.cocosil.harness.coherence-report-2026-05-05
title: COCOSiL V2 設計整合性レポート（2026-05-05）
doc_type: decision
product: cocosil
layer: design
status: final
proposed_by: endo
proposed_at: 2026-05-05
as_of: 2026-05-05
---

# COCOSiL V2 設計整合性レポート

**作成日**: 2026-05-05
**作成根拠**: `docs/discussions/20260505_議論ログ_設計整合性ハーネス再設計.md`
**ハーネス設計提案**: `docs/output/decisions/harness-redesign-proposal-2026-05-05.md`

---

## 1. 検査対象（4階層 × 設計思想）

| 階層 | 設計思想 | 単一の真実（現状） |
|---|---|---|
| **Layer 0**（哲学） | プロダクト哲学 = 設計中枢（Why → How → So What） | `docs/input/concepts/COCOSiL設計中枢.md`（425行） |
| **Layer 1**（自己進化境界） | Autogenesis Constitution（不変 / 進化対象 / sandbox必須） | `AGENTS.md` §7 Autogenesis Constitution（文書のみ） |
| **Layer 2**（最小機能要素） | F1〜F7 機能要件・APIファースト・3人体制 | `docs/input/requirements_input/mvp-requirements-v1-3.md` |
| **Layer 3**（実装ハーネス） | hook / lint / PR template / start-task / TDD / Constitution / アトミック確認ループ | `AGENTS.md` §7 / `docs/harness/HARNESS_DECISIONS.md` |

## 2. 整合性問題の根本診断

整合性問題は2つの構造的特徴に集約される。

### 診断① Constitution as Comment

設計思想の **1万行以上の文書** を読み込んだが、思想を実装に強制する **機械可読定義は12パターン**（`prevent-destructive-command.js` の `DESTRUCTIVE_PATTERNS` 配列）のみ。Autogenesis Constitution の「絶対不変リスト」「Mutableリスト」「Evaluate層の三毒ガード AND条件」「Phase移行ゲート」はすべてMarkdownテキストで定義されており、コードからの参照経路がない。

帰結：
- Phase C（週次Autogenesisループ）が立ち上がったとき、AIが生成したプロンプトの「Constitution違反」判定は人間がMarkdownを読んで行うしかない
- 思想がドリフトしても機械的検知ができない
- ハーネスが「思想を強制する装置」ではなく「思想を文章で説得する装置」に留まっている

### 診断② Vocabulary's Death by Document Inflation

設計中枢運用落とし穴議論ログの **第一原則「Documents Die, Vocabulary Lives」** と現状運用の **大乖離**。

データ：
- `docs/discussions/` の議論ログは **26本**（本レポート生成時点）
- `docs/harness/` のガバナンス文書 **2本（HARNESS_DECISIONS / HARNESS_HEALTH）**
- `docs/input/concepts/` の哲学文書 **8本**
- 設計判断の正は文書、文書を読むのは人間、人間の負荷を文書で減らそうとして文書を増やす——**自己原則の逆走**

副次的帰結：**Bus Factor = 1**。設計中枢の解釈権・Layer 2 承認権・Autogenesis Approve判断・アトミック確認ループの動作確認・言語設計の更新権限が、すべてえんまさ1人に集中。

---

## 3. 整合性ギャップ一覧（C1〜C8）

| # | ギャップ | 軸1 距離 | 軸2 独立性 | 軸3 閉ループ | 致命度 |
|---|---|---|---|---|---|
| **C1** | Autogenesis Constitution「絶対不変リスト」が文書のみ。コードから参照不能 | 🔴 大 | — | — | 🟡 High |
| **C2** | PR template の設計中枢チェック5問を実装者単独で記入する形式 | — | 🔴 ゼロ | — | 🔴 Critical |
| **C3** | `/start-task` の5問判定 と PR template の5問判定の関係が未定義（重複か独立判定か） | 🟡 中 | 🔴 ゼロ | — | 🟢 Medium |
| **C4** | 禁止語彙チェック（言語設計v1）が機械化されていない。F1/F2のプロンプトが既に存在しているが回帰検出経路ゼロ | 🔴 大 | — | 🔴 不在 | 🔴 Critical |
| **C5** | Phase A 観察基盤のmigrationとtelemetry実装はあるが、APIルートからのイベント送信箇所が未挿入＝データが流れない | — | — | 🔴 不在 | 🟡 High |
| **C6** | PMF基準「7日再訪率30%」と Autogenesis評価指標「再言語化率・矛盾受容率」の関係が未定義。Sycophancy が両指標を逆走させるリスク | 🟡 中 | — | 🔴 不在 | 🟢 Medium |
| **C7** | 「えんまさ動作確認」がアトミック確認ループの第3条件＝全PRのマージにえんまさ必須。Bus Factor=1構造化 | — | 🔴 ゼロ | — | 🟢 Medium |
| **C8** | 設計中枢運用落とし穴ログの「割れ体験を作る」というアクションの実装メカニズム不在。割れた事例を集計・通知する仕組みなし | — | 🔴 ゼロ | 🔴 不在 | 🟢 Medium |

### 致命度の根拠

| 致命度 | 該当ギャップ | 理由 |
|---|---|---|
| 🔴 Critical | C2, C4 | 設計中枢の **Q1〜Q3 Must条件**（無明 / 三毒 / UXシーケンス）を直接守るための機構。緩いと他のすべてのハーネスが上滑りする |
| 🟡 High | C1, C5 | 実装に近接しているが運用ループが回っていない。Autogenesis Phase B/C 移行時に必須となる |
| 🟢 Medium | C3, C6, C7, C8 | C2/C4 解消後に時系列で吸収可能。または既存制約（チーム規模）下では延期可 |

---

## 4. 各ギャップの詳細根拠

### C1: Constitution as Comment

**証拠**：
- `AGENTS.md` §7 Autogenesis Constitution が文章のみで「絶対不変リスト」を定義
- `lib/` ディレクトリに `constitution/` サブディレクトリは存在しない
- `lib/prompts/` の既存プロンプト（`onboarding.ts` / `contradiction-handling.ts`）は禁止語彙リストを参照していない（手書き）

**影響**：
- Autogenesis Phase C で AIが生成した改善案が Constitution に違反していないか機械判定できない
- 20260504_議論ログ_デジタル生命体移行企画 Turn 5 で吉田氏が示した「3ゲート（sandbox eval / えんまさreview / version commit）」のうち、sandbox evalの自動判定ロジックが定義不能

### C2: PR Template の自己審査構造

**証拠**：
- `.github/pull_request_template.md` 行22-31 の Q1〜Q5 表は単一カラム形式
- 記入者は実装者のみ。レビュアー記入欄なし
- `/start-task` `start-task.md` Step 2.5 でも判定者は AIエージェント = 実装着手者
- `/cocosil-work` も実装者主体のチェック

**研究的根拠**（20260503_20260503_議論ログ_設計中枢運用落とし穴 Turn 3 引用）：
- 自己審査による「本来否定されるべき提案」の通過率：**71%**（確証バイアス研究の累積メタ分析）
- 設計中枢の Q1〜Q3 Must条件を「実装者が自己判定」しても、約7割は通過してしまう

**影響**：
- 設計中枢のリトマス試験紙が「差分を見える化する装置」ではなく「実装者の自己納得装置」に転落
- 20260503_20260503_議論ログ_設計中枢運用落とし穴 で確立された原則「Disagreement is a Feature」が構造的に発動できない

### C3: /start-task と PR template の判定関係未定義

**証拠**：
- `start-task.md` Step 2.5 で5問判定が実行され、Must × ならブロック
- `pull_request_template.md` でも同じ5問の記入欄
- 両者の関係（一方の引き継ぎか、独立判定か）が `AGENTS.md` / `HARNESS_DECISIONS.md` に明記されていない
- 現状 PR template には「`/start-task` 時の判定を引き継ぐ」とコメントがあるが、引き継ぎ方法は未定義

**影響**：
- 同じ5問を2回判定する重複コスト発生（実装者は2回同じことを書く）
- C2と相互悪化：両者を独立判定にすれば C2 は緩和されるが、現状は一致が前提

### C4: 禁止語彙の機械化未実装

**証拠**：
- `lib/prompts/__tests__/` ディレクトリは存在しない
- `lib/prompts/onboarding.ts` / `contradiction-handling.ts` は実装済み（F1向け）だが、禁止語彙チェックの単体テストが存在しない
- `language-design-v1.md` で禁止語彙10種が列挙されているが、機械的に参照される経路がない
- `HARNESS_HEALTH.md` G10 で「F3実装時に着手」と延期されているが、F1/F2 のプロンプト既存

**影響**：
- F1/F2 のプロンプト変更で禁止語彙が混入してもPRレビューまで気づけない
- ブランドアイデンティティ（「占い」回避）の毀損リスク
- TDDベストプラクティス議論で確立された **Prompt as Code 原則** が空文化

### C5: Phase A 観察基盤の閉ループ未完成

**証拠**：
- `supabase/migrations/20260504000001_events_telemetry.sql` 作成済み（ただしmigration適用は手動指示）
- `lib/telemetry/events.ts` 5種イベント関数実装済み
- しかし `app/api/diagnosis/mbti/route.ts` を含む既存APIルートで `track*` 関数は呼ばれていない（grep未確認だが議論ログ的に未挿入）
- PostHog ダッシュボードの定義・運用ルール未策定
- `HARNESS_HEALTH.md` G10 で未解消マーク

**影響**：
- 20260504_議論ログ_デジタル生命体移行企画 Turn 1 で吉田氏が指摘した「**観察の不在 = データは死んだ資産**」と同型の症状が、Phase A 実装後も再生産
- Phase A→B 移行ゲート「ユーザー50人以上の行動ログ蓄積」が満たせない

### C6: PMF基準と内省指標の関係未定義

**証拠**：
- `AGENTS.md` 「PMF成功基準: 7日以内再訪率 30%以上」
- `AGENTS.md` 「Autogenesis評価指標：再言語化率・矛盾受容率・行動記録の具体度」
- 両指標を同時に見る経路（ダッシュボード・自動アラート）の定義は存在しない

**Sycophancy リスクの構造**（20260504_議論ログ_デジタル生命体移行企画 Turn 3 引用）：
- ユーザーが「癒される」（貪：心地よい錯覚）→ 再訪率↑ AND 内省スコア↓
- ユーザーが「腑落ちして少し不快」（痴の解消）→ 再訪率↓ AND 内省スコア↑
- 「再訪率最大化」だけで Autogenesis を回すと、**Sycophancy最大化**に最適化されるリスク

### C7: 全PR えんまさ動作確認 = Bus Factor=1 構造化

**証拠**：
- `pull_request_template.md` 行39「プレビューURLで動作確認済み（担当：えんまさ）」が全PRで必須項目
- アトミック確認ループ議論 Turn 4 で確立された「機能完了 = 型チェック + ビルド + えんまさ動作確認」
- えんまさは同時にコンテンツ層承認・Autogenesis Approve・言語設計更新も担当

**影響**：
- 20260503_20260503_議論ログ_設計中枢運用落とし穴 Turn 1 で三島氏（架空）が指摘した Bus Factor=1 を、ハーネスが構造的に強化
- えんまさが体調・休暇でブロックされた瞬間、全PR/全Phase進行が停止

### C8: 「割れ体験」のメカニズム不在

**証拠**：
- 20260503_20260503_議論ログ_設計中枢運用落とし穴 Turn 5 のアクション4「初の『割れ体験』を作る」が手作業前提
- GitHub Actions / Slack通知など、「判定が割れた事例を集計・通知する」仕組み未実装
- C2（自己審査構造）と連結：そもそも判定が1人なので割れる契機がない

**影響**：
- 設計中枢運用落とし穴の最終原則「Disagreement is a Feature」が運用化できない
- リトマス試験紙が「形式的チェックボックス化（P3）」に陥る経路が開いたまま

---

## 5. 矛盾の連鎖図

```
C1 (Constitution as Comment)
  ↓ 機械判定不能
C4 (禁止語彙未機械化) ← C1 の最初の症状
  ↓ 検知不能 → 人間が見るしかない
C2 (PR template 自己審査)
  ↓ レビュアーが機能しない → 全部えんまさが見るしかない
C7 (えんまさ動作確認必須) ← Bus Factor=1
  ↓ えんまさ過負荷 → ドリフト検知も滞る
C8 (割れ体験メカニズム不在) ← Disagreement is a Feature が空文化
  ↓ 設計中枢の運用が形骸化
C3 (/start-task と PR の関係未定義) ← 両方とも自己判定で意味薄れ
  ↓
[根本診断②] Document Inflation で文書増殖が続く
  ↓
[根本診断①] Constitution as Comment が固着

並行系統:
C5 (Phase A データ流れない) → Autogenesis 起動不能 → C6 (PMF/内省指標 統合不在) を解消する観察データなし
```

**読み方**：C1 が一次原因として全体を駆動している。C2/C4 がCriticalなのは、両者を解消することで上記連鎖の **2箇所**（C1経由 / C7経由）を同時に断ち切れるため。

---

## 6. 改善方向（要約）

### 設計原則3つ（議論ログから抽出）

1. **Constitution as Code, Not as Comment.**
2. **Independent Judgment by Default.**
3. **Living Loop, Not Living Document.**

### 隠れた法則（Sycophancyガード）

4. **PMF metric and Reflection metric must be measured together.**

### 今週の最優先3アクション

| # | 内容 | 解消するC |
|---|---|---|
| Action 1 | `lib/constitution/` 新規作成（半日） | C1, C4 の前提 |
| Action 2 | PR template の判定欄を 2列分離（30分） | C2, C8 |
| Action 3 | `lib/prompts/__tests__/` 即時導入（半日） | C4 |

### 来週〜2週間（中規模）

| # | 内容 | 解消するC |
|---|---|---|
| Action 4 | `app/api/chat/` に `trackChatPhaseTransition` 挿入 + PostHog 二軸ダッシュボード | C5, C6 |
| Action 5 | `.github/workflows/drift-check.yml`（週次ドリフト検知） | C8 |

### Sprint 3 以降（重厚）

| # | 内容 | 解消するC |
|---|---|---|
| Action 6 | `promptfoo` 導入 + 設計中枢5問 Eval ルーブリック化 | C4 拡張 |
| Action 7 | Phase A→B 移行ゲート自動判定 | Autogenesis 一般 |
| Action 8 | Phase C Bootstrap protocol 設計 | 再帰的Bootstrap Paradox |

詳細実装は `docs/output/decisions/harness-redesign-proposal-2026-05-05.md` を参照。

---

## 7. レポート所有とドリフト検知

- **次回レビュー**: 2026-06-02（月次）
- **担当**: えんまさ（意味設計・最終承認）
- **更新トリガー**: C2/C4 が解消した時点で本レポートを更新し、新しい Critical を引き上げる
- **ドリフト検知**: `HARNESS_HEALTH.md` の Gap 一覧と本レポートの整合性ギャップ番号を相互参照すること

---

*以上 — coherence-report-2026-05-05.md*
