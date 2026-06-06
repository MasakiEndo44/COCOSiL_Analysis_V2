---
task: F3 レポート揺らぎ抑制 — 実装計画（Score Once, Narrate Freely.）
created: 2026-06-06
status: draft
related_goals:
  - docs/output/goals/f3-report-determinism-and-self-anchor.md（要件・受け入れ基準）
  - docs/output/goals/f3-keyword-tree-integration.md（Tree of 4, Harvest 1. — 統合アルゴリズム）
related_discussions:
  - docs/discussions/20260604_議論ログ_F3レポート揺らぎ改善.md
gate: Gate 1（全Phase）＋ Gate 2（Phase 1.2/1.3/1.6・Phase 2・Phase 4 文言/フロー）
---

# F3 レポート揺らぎ抑制 — 実装計画

## 0. 現状把握（コード調査の結論）

| 要素 | 状態 | 含意 |
|---|---|---|
| `lib/diagnostics/integration/harvest.ts` | ✅ 決定論的に5軸スコア+meta+trunks+分布を生成する純関数が**既に存在** | ProfileCoreの土台はほぼ完成している |
| `harvest()` の呼び出し | ❌ **app/lib のどこからも呼ばれていない**（コメント参照のみ） | レポート生成パイプラインに未接続 |
| `lib/prompts/integrated-report.ts` | ⚠️ 4体系の生ラベル（zodiac/animal/sixStar/mbti）を直接LLMに渡し、**5軸観察と統合をLLMに丸投げ** | **これが揺らぎの直接原因**。決定論スコアがあるのに使っていない |
| A/T軸（Assertive/Turbulent） | ❌ 完全に未実装。MBTIは16型のみ（`mbti_results.mbti_type` CHECK が16型を強制） | 入力ベクトルが非一意。新設＋migration要 |
| 重み付け | ⚠️ `axis-affinity-matrix.ts` で4体系を等価合算（per-axis正規化） | MBTI寄り再調整は「体系別寄与重み」の導入で実現 |
| レポートAPI route | ❌ `app/api` に diagnosis 系のみ。統合レポート生成routeは未作成 | Phase 3 で新設 |

> **結論**: 「Score Once, Narrate Freely」の本丸は新規スコア計算の発明ではなく、**既存 `harvest()` を `ProfileCore` に昇格し、プロンプトに注入してLLMを翻訳者へ格下げする配線**である。揺らぎの8割はこの配線で消える。残りはA/T軸（入力一意化）と temperature=0/seed固定。

---

## 1. クリティカルパスと依存関係

```
Phase 0 ProfileCore型契約 ──→ Phase 1 決定論スコア核 ──→ Phase 2 LLM翻訳層 ──→ Phase 3 API ──→ Phase 4 UI ──→ Phase 5 Eval
   (API-First: 型をmainに            (lib/diagnostics/)      (lib/prompts/)      (app/api/)      (app/+components/)
    マージするまでフロント着手不可)        ▲ A/T migration（人間が手動適用）
```

**API-First 厳守**（AGENTS.md §1）: Phase 0 の ProfileCore 型定義を確定し main にマージするまで、Phase 4（フロント）の実装を開始しない。フロントはモック ProfileCore で並行開発可。

---

## Phase 0 — ProfileCore 型契約の確定 🔴最優先・ブロッカー

**担当**: ヒラメ ／ **Gate 1**

- [ ] `lib/diagnostics/integration/profile-core.ts` 新規。`ProfileCoreSchema`（`zod/v4`）＋ `ProfileCore` 型を定義:
  ```
  ProfileCore {
    axisScores: Record<ObservationAxisId, number>  // harvest 由来
    type32: string            // 例 "INTJ-A"（mbti16 × identity）
    identity: 'A' | 'T'
    characterLabel: string    // 形容詞＋名詞（Phase 1.3 で決定論導出）
    strengths: [string, string]          // 強み2（軸スコアから決定論抽出）
    weakness: { trait: string; exit: string }  // 弱み1＋行動の出口
    johariBlindspots: string[]           // 自覚しにくい強み（出自=axisScores）
    distribution: { axis: ObservationAxisId; percentile: number; origin: '同タイプ内傾向' | '設計上の理論分布' }[]
    weights: { keirsey: number; animalStyle: number; zodiacElement: number; rokuseiPolarity: number; phase?: number }
    seed: string              // 入力ハッシュ。語り口の決定論選択キー
    version: number           // ProfileCore schema version（Append-Only Self）
  }
  ```
- [ ] `lib/diagnostics/integration/index.ts` から re-export
- [ ] 検証: `pnpm typecheck`

> この型が他Phase全ての契約。確定後 main マージ → 以降のPhaseが並行可能になる。

---

## Phase 1 — 決定論スコア核の完成（`lib/diagnostics/`）

**担当**: ヒラメ（実装）／えんまさ（1.2/1.3/1.6 内容承認）／ **Gate 1 ＋ Gate 2**

### 1.1 A/T軸の導入 🔴 Must（揺らぎ撲滅の前提）
- [ ] `UserDiagnosticInput` に `identity?: 'A' | 'T'` を追加（`types.ts`）
- [ ] `app/diagnosis/mbti/types.ts` に Identity 軸を追加（`MbtiAxis` 拡張 or 別系統）＋ `MbtiScores`/`MbtiPCI` に identity 追加
- [ ] 簡易診断に A/T 判別設問を数問追加（`app/diagnosis/mbti/` の質問データ＋スコアリング）。**設問文言は Gate 2**
- [ ] `buildType32(mbti, identity)` → `"INTJ-A"` 形式
- [ ] **migration**: `supabase/migrations/20260606xxxxxx_add_mbti_identity.sql`
  - `mbti_results` に `identity TEXT CHECK (identity IN ('A','T'))`（nullable）追加。**`mbti_type` の16型CHECKは壊さず別カラムで持つ**
  - ⚠️ `supabase/migrations/**` は Layer 1 保護。ファイル追加はAIが行い、**適用（push）は人間が手動実行**
- [ ] `pnpm db:types` で型再生成（人間がDB適用後）

### 1.2 重み係数の明示・MBTI寄り再調整 🔴 Must — **Gate 2（診断結果サンプル3ケース before/after）**
- [ ] `affinity-score.ts` / `axis-affinity-matrix.ts` に体系別寄与重み（`SYSTEM_WEIGHTS`）を導入。KEIRSEY（MBTI）寄与を相対的に引き上げる
- [ ] 採用した重みを `ProfileCore.weights` に明示記録
- [ ] 既存 `harvest.test.ts` / `affinity-score.test.ts` の期待値更新

### 1.3 characterLabel（キャラ名）の決定論導出 🔴 Must — **Gate 2（文言）**
- [ ] `buildCharacterLabel(axisScores, type32): string`（形容詞＋名詞）。`lib/data/` に語彙テーブル新設 or `three-layer-vocab` 活用
- [ ] 同一 axisScores → 必ず同一ラベル（純関数・テーブル引き）。**LLM不使用**
- [ ] 禁止語0%（`banned-words.ts` 照合）

### 1.4 johariBlindspots の導出 🔴 Must
- [ ] `deriveBlindspots(axisScores): string[]` — 「自覚しにくい強み」を軸スコアから決定論抽出。LLM推定・印象推定は使わない（Dispel担保）
- [ ] 各要素に出自（どの軸由来か）をメタ保持

### 1.5 distribution（同タイプ内傾向/理論分布）🟡 Should
- [ ] `buildDistribution(axisScores)` — 各軸の理論分布パーセンタイル。`origin` を `'同タイプ内傾向' | '設計上の理論分布'` で明示（**「一般分布」と詐称しない**）
- [ ] 理論分布の定義は要確認（実データ蓄積前のため理論値の置き方を決める→ヒラメ×えんまさ）

### 1.6 strengths(2) / weakness(1＋出口) 🔴 Must — **Gate 2（内容）**
- [ ] `deriveStrengthsWeakness(axisScores)` — 強み2は上位軸、弱み1は下位軸 or 過剰軸から。比率 強み2:弱み1
- [ ] weakness は必ず `{ trait（状況依存表現）, exit（行動の出口）}`。人格否定表現を構造的に排除（瞋ガード）

### 1.7 buildProfileCore（統合ビルダー）🔴 Must
- [ ] `buildProfileCore(input): ProfileCore` — `harvest()` をラップし 1.1〜1.6 を合成、`seed`（入力ハッシュ）と `version`（定数）を stamp
- [ ] **Append-Only Self**: `PROFILE_CORE_VERSION` 定数を導入。Core schema を変えたら version を上げ、旧versionは凍結（過去レポート再現用）
- [ ] **Vitest（再現性 AC-1）**: 同一入力で `buildProfileCore` を N 回 → 完全一致を assert

---

## Phase 2 — LLM翻訳層（`lib/prompts/`）🔴 **Gate 2 必須**

**担当**: ヒラメ（実装）／えんまさ（承認・AI応答サンプル3件 before/after）

### 2.1 integrated-report プロンプト改修 🔴 Must
- [ ] `buildIntegratedReportUserPrompt` を **ProfileCore注入型**に変更。生ラベルでなく確定スコア・キャラ名・強み2・弱み1・ジョハリ・分布を渡す
- [ ] system prompt に「**あなたは数値の翻訳者。与えられたスコア/ラベルを言葉にするだけ。再計算・新規判定をしない**」を明記
- [ ] セクション構造を UXシーケンスに固定: catchphrase=キャラ名／opening=共感／strengths（強み2先）→weakness（弱み1後置・出口付き）=安心／johari＋distribution=分析／closing＋「次は何を知りたい？」=行動
- [ ] 呼び出し側で **temperature=0／seed固定**

### 2.2 語り口の有限集合・決定論選択 🟡 Should
- [ ] tone variant を N 種定義し、`ProfileCore.seed` のハッシュから決定論選択（temperatureに揺らぎを委ねない＝Variation Without Randomness）

### 2.3 用語平易化マップ＋ヘルプ文言 🟡 Should — **Gate 2**
- [ ] 「体→身体気質エネルギー」「動機→原動力/やる気の源」等のマップを `lib/prompts/` or `lib/data/` に整備（UI のヘルプ(?) で参照）

### 2.4 Prompt as Code テスト 🔴 Must
- [ ] `lib/prompts/__tests__/` に禁止語0・「共感」必須キーワード・三毒表現0・出自詐称0 を追加
- [ ] promptfoo（Negative eval）: 「一般分布」「平均」等の出自不明断定が出ないこと

---

## Phase 3 — 統合レポートAPI＋永続化（`app/api/`）🔴 **Gate 1**

**担当**: ヒラメ

- [ ] `app/api/report/route.ts`（仮）新設: input → `buildProfileCore` → LLM翻訳(temp0) → JSON返却
- [ ] Zod で入力検証、Clerk `auth()` を route 内で直呼び、RLS整合（`user_id = auth.uid()`）
- [ ] エラー境界: Supabase/OpenAI エラーオブジェクトを生でクライアントへ返さない
- [ ] （任意）`profile_cores` テーブル migration: ProfileCore を version stamp 付きで append-only 保存。再生成時に旧 version を再現（**migration は人間が手動適用**）
- [ ] Gate 1 チェックリスト5点（IDOR/JWT/型/N+1/エラー境界）

---

## Phase 4 — UI（`app/`・`components/`）🟡 まあみ・**Gate 2（文言/フロー）**

**前提**: Phase 0 の型が main マージ済み（API-First）

- [ ] A/T 判別設問の UI（数問追加。「正確になるなら答えたい」＝負荷許容）
- [ ] レポート表示: キャラ名（共感）→強み2（安心）→弱み1（出口付き）→ジョハリ＋分布グラフ（分析）→「次は何を知りたい？」分岐（行動）
- [ ] 分布グラフは数字羅列でなく「みんなより刺激好き多め」型の一言コメント付き 🟢
- [ ] 他者視点表現は「決めつけ」でなく「こう見られがちかも」
- [ ] 用語ヘルプ(?)ツールチップ
- [ ] 課金境界: 核（キャラ名・強み2弱み1・基本ジョハリ）は無料固定／完全版＝深掘り・行動提案。**腑落ち前の課金導線を出さない**
- [ ] Gate 2: プレビューURL＋文言diff＋フロー図

---

## Phase 5 — Eval / 検証

- [ ] **Vitest（再現性）**: ProfileCore・レポート核要素の同一入力一致率100%（AC-1/AC-2）
- [ ] **promptfoo（Negative）**: 禁止語0・出自詐称0・三毒0・人格否定0
- [ ] **えんまさ Gate 2**: 「占いでなく観察された」主観一致／弱みトーン「甘じょっぱく・ほろ苦い」／UXシーケンス順序
- [ ] **機能完了の定義**: 型チェック（機械）＋ビルド（機械）＋えんまさ動作確認（プレビューURL）の3条件

---

## リスクと対応

| リスク | 対応 |
|---|---|
| 重み再調整で診断結果が変わり、既存レポートと矛盾（不変性の罠） | 本番データ未蓄積の今のうちに version=1 を確定。以降は Append-Only（旧versionで過去再現） |
| migration が hook でブロック（Layer 1） | ファイル追加はAI、`db push`/適用は人間が手動実行。PR に適用手順を明記 |
| temperature=0 で語り口が単調化＝共感が死ぬ | 2.2 の有限集合・決定論選択で多様性を担保（randomness に頼らない） |
| Gate 2 の往復で停滞 | Phase 1.3/1.6・Phase 2 は早めに before/after サンプル3件を用意しえんまさへ先出し |
| characterLabel 語彙の網羅性（32型×軸分布） | 初期は粗い語彙テーブルで開始し、Eval で破綻ケースを収集して拡充 |

## 着手順（推奨スプリント割り）

1. **Sprint A（ブロッカー解消）**: Phase 0（型）→ Phase 1.1（A/T＋migration）→ Phase 1.7（buildProfileCore骨格）＋ 1.4
2. **Sprint B（核の中身・Gate 2）**: Phase 1.2 / 1.3 / 1.6（before/afterサンプル → えんまさ承認）→ 1.5
3. **Sprint C（翻訳・配線）**: Phase 2 → Phase 3
4. **Sprint D（UI・検証）**: Phase 4 → Phase 5
