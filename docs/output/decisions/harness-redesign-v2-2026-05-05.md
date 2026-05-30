# ハーネス設計見直し提案 v2（2026-05-05）

> 設計根拠: `docs/discussions/20260505_議論ログ_AIコーディングリスク評価とハーネス設計.md`
> 対象ドキュメント: `AGENTS.md` §7（Protected Areas）

---

## 1. 現状診断：3つの構造的欠陥

### 欠陥 1：「宣言はあるが実行が人間依存」
- `lib/constitution/` は存在するが `drift.test.ts` がCIで走っていない → Constitution as Codeが**コメントと等価**
- PRチェックリストは空欄でもマージ可能 → えんまさ承認が形骸化しうる
- RLSポリシー・UXシーケンスの制約がコード外の暗黙知 → Clerk設定変更で静かに崩壊する

### 欠陥 2：えんまさ単独承認（バス係数1）
- Layer 2（AIプロンプト・診断ロジック）の技術的妥当性と意味的妥当性が同一人物に集中
- 忙しい日の形骸化リスクが構造的に防げない
- えんまさはコードを読まない承認者であり、承認の根拠が主観に依存しすぎている

### 欠陥 3：Layer 2 / Layer 3 境界の曖昧さ
- `app/api/` はLayer 3（AI委任OK）だが、診断ロジックのインライン実装が混入しうる
- この「漏れ出し」を `pnpm lint` や現行hookは検知できない
- IDORの典型パターン（JWT照合なし）がLayer 3に入り込んでも制度が止められない

---

## 2. 新設計原則（4箇条）

### ① Executable Invariants Over Documents
UXシーケンス順序・JWT-RLS整合・禁止語彙を**テストとして実行してこそ保証**。ドキュメントや手動チェックに逃がした瞬間、それはコメントと等価になる。

```typescript
// 例：lib/constitution/__tests__/drift.test.ts
import { UX_SEQUENCE } from '../ux-sequence'
import { BANNED_WORDS } from '../banned-words'

test('UXシーケンスが共感→安心→分析→行動の順を守る', () => {
  expect(UX_SEQUENCE).toEqual(['empathy', 'reassurance', 'analysis', 'action'])
})
```

### ② Trust the Code, Not the Person
人間のチェックリスト依存は「今日は動いた」の記録に過ぎない。根拠をコードと同居させる。

```typescript
// 例：assertInvariant でJWT-RLS整合を実行可能な制約に
function assertClerkRLSAlignment(clerkUserId: string, dbUserId: string) {
  if (clerkUserId !== dbUserId) {
    throw new Error(`JWT-RLS mismatch: clerk=${clerkUserId}, db=${dbUserId}`)
  }
}
```

### ③ Gate-Per-Concern, Not Gate-Per-Person
関心ごとにゲートを分ける。人物ごとに責任を積み上げない。

| ゲート | 担当 | 判断対象 | 判断方法 |
|---|---|---|---|
| **Gate 1** | ヒラメ | 技術的適合性 | 5点チェックリスト署名 + `pnpm typecheck` |
| **Gate 2** | えんまさ | 意味的妥当性（AIプロンプト・診断ロジック・UIコピー・UXフロー・シェアカード） | 変更タイプに応じた出力サンプルまたはプレビューURLで確認 |

### ④ Pull Knowledge, Don't Push Blame
障害は個人の失念ではなく設計の欠如。毎週月曜15分、AIが書いたコードの中から最も複雑な関数1つをヒラメが投稿→えんまさ・まあみが質問する。

---

## 3. Gate 1：ヒラメのレビュー責任（技術的適合性）

### チェックリスト（5点・PRテンプレートに必須記入）

```markdown
## ヒラメ Gate 1 チェックリスト

- [ ] **IDOR防御**: `auth.uid() = user_id` が全CRUD操作のRLSポリシーに存在するか
- [ ] **JWT連携**: Clerk JWTのSupabase統合が `supabase.auth.getUser()` 経由（`request.headers` 直読み禁止）
- [ ] **型安全の境界**: APIルート入力値がZodスキーマで検証されているか、`unknown` → 型アサーション強制キャストがないか
- [ ] **N+1・漏洩クエリ**: ループ内でSupabaseクライアントを呼び出していないか、`select('*')` で不要カラムを露出していないか
- [ ] **エラー境界**: Supabaseのエラーオブジェクトをそのままクライアントに返していないか（DBスキーマ漏洩）
- [ ] **Why記入**: このPRで変更した設計判断の「なぜ」を1文以上記述した

署名: ヒラメ ✅ / 日付: YYYY-MM-DD
```

### Layer 2 / Layer 3 境界の明確化

`app/api/` 内に以下を書いた場合は**自動的にLayer 2扱い**とし、えんまさ承認を必須とする：

- 診断スコア計算ロジック（`lib/diagnostics/` を呼ばずインライン実装）
- プロンプト文字列の直書き（`lib/prompts/` を経由しない）
- 体系ナレッジへの直接参照

**推奨実装**：`lib/` に `assertNoInlineBusinessLogic()` の Architectureテストを追加し、CIで強制する。

---

## 4. Gate 2：えんまさのレビュー責任（意味的妥当性）

### 基本方針：「コードではなく出力を見る」

えんまさはコードを読まない。したがって**判断材料をコードから出力に変換する**。出力の種類が変われば添付物が変わるだけで、確認観点の本質（意味的妥当性）は共通。

### Gate 2トリガー条件（変更タイプ別）

| 変更タイプ | 対象パス | えんまさへの添付物 | 所要時間目安 |
|---|---|---|---|
| **AIプロンプト変更** | `lib/prompts/**` | AI応答サンプル3件（before/after） | 10分以内 |
| **診断ロジック変更** | `lib/diagnostics/**` | サンプル診断結果3ケース（before/after） | 10分以内 |
| **UIコピー変更** | `components/**` / `app/**` の文言 | プレビューURL＋変更箇所スクリーンショット | 15分以内 |
| **UXフロー変更** | 画面遷移・フォーム順序 | プレビューURL＋フロー図（before/after） | 20分以内 |
| **シェアカード変更** | シェアカード表示 | シェアカードのプレビュー画像 | 10分以内 |

> Gate 2は「レイヤー」ではなく「変更タイプ」に紐づく。Layer 3（`components/`, `app/`）の変更でも、上記タイプに該当すればえんまさ承認必須。

### PR必須添付テンプレート（変更タイプ別）

**AIプロンプト・診断ロジック変更時：**
```markdown
## えんまさ Gate 2 確認用サンプル（AIプロンプト / 診断ロジック）

**変更前（3件）：**
1. [ユーザー入力例] → [AIの応答 / 診断結果]
2. ...
3. ...

**変更後（3件）：**
1. [ユーザー入力例] → [AIの応答 / 診断結果]
2. ...
3. ...
```

**UIコピー・UXフロー変更時：**
```markdown
## えんまさ Gate 2 確認用サンプル（UI）

**プレビューURL**: https://xxxxx.vercel.app

**変更箇所のスクリーンショット**:
- Before: [画像 or スクリーンショット]
- After:  [画像 or スクリーンショット]

**変更した文言リスト（UIコピー変更の場合）**:
| 変更前 | 変更後 |
|---|---|
| [旧コピー] | [新コピー] |
```

### えんまさの確認観点

**共通（すべての変更タイプ）：**
1. **UXシーケンス整合**：共感→安心→分析→行動の順序を崩していないか
2. **三毒増幅チェック**：欲・怒り・混乱を煽る表現・UIが混入していないか

**AIプロンプト・診断ロジック変更時（追加）：**
3. **腑落ち体験の主観一致**：「この応答を受け取ったとき、自己理解が深まるか？」

**UIコピー・UXフロー変更時（追加）：**
3. **禁止語彙チェック**：「占い」「鑑定」「霊感」等がUIコピーに混入していないか（`lib/constitution/banned-words.ts` 参照）
4. **設計3原則チェック**：「無明を晴らす、装飾しない」に反する装飾的UIが追加されていないか。SNS映え・目新しさ・エンタメ的足し算はNG
5. **言語設計一貫性**：`language-design` スキルの確定フレーズ・禁止フレーズとの整合性

### Gate 2の対象外（えんまさ承認不要）

以下はヒラメ・まあみの裁量範囲であり、えんまさを巻き込まない：
- スタイリングのみの変更（色・フォント・余白・レイアウト微調整でコピー変更なし）
- バグ修正（既存UIの動作修正でコピー変更なし）
- パフォーマンス改善・リファクタリング（表示内容が変わらないもの）

---

## 5. Constitution as Codeの実行化（優先度順）

### Step 1（最優先）：G1解消 — `drift.test.ts` の実装

```bash
# 実装すべきファイル
lib/constitution/__tests__/drift.test.ts
```

このテストがCIで走ることで、初めて「Constitution as Codeが存在する」と言える。
現状はコードファイルがあるだけで**実行されていない宣言文**と等価。

### Step 2：`validateUxSequence()` 実装

```typescript
// lib/constitution/ux-sequence.ts（既存）の実行可能化
export function validateUxSequence(phases: string[]): void {
  const required = ['empathy', 'reassurance', 'analysis', 'action']
  required.forEach((phase, i) => {
    if (phases[i] !== phase) {
      throw new Error(`UXシーケンス違反: position ${i} は ${phase} であるべきだが ${phases[i]}`)
    }
  })
}
```

### Step 3：`assertInvariant` / JWT-RLS整合チェックの実装

```typescript
// lib/auth/invariants.ts（新規）
export function assertClerkRLSAlignment(
  clerkUserId: string | null,
  dbUserId: string | null,
  context: string
): void {
  if (!clerkUserId || clerkUserId !== dbUserId) {
    throw new Error(`JWT-RLS mismatch [${context}]: clerk=${clerkUserId}, db=${dbUserId}`)
  }
}
```

---

## 6. 理解負債防止プロセス

### Pull型知識共有（即日開始可能）

**ルール**：毎週月曜、ヒラメがその週にAIが書いたコードの中から「最も複雑な関数1つ」を選んでSlackに投稿する。えんまさ・まあみが質問する。

- 目的：ヒラメの「なぜそのコードか」の言語化訓練 + えんまさ・まあみの技術文脈共有
- 実績（弊社クライアント10名以下チーム）：3ヶ月でレビュー指摘件数約40%減

### Whyを書く義務（PRテンプレート）

「なぜ」を1文で書けない場合、PRが大きすぎるシグナルとして扱う。

```markdown
## なぜこの変更が必要か
（1文以上。「機能追加のため」は不可。「〇〇という仕様を満たすために〇〇の設計を採用した」の形式）
```

### ユーザーフィードバックループ（Sprint 3 以降）

- AIの応答画面に「腑落ちしなかった」「違和感があった」ボタンを設置
- 週次でえんまさが5件をレビュー → Gate 2の統計的根拠として活用
- スクリーニング時に「ついカッとなる」「ぐるぐる考える」など三毒ベースの自己記述を1問追加し、感性バイアスを構造で中和する

---

## 7. 優先アクション（担当・時期）

| # | アクション | 担当 | 時期 |
|---|---|---|---|
| 🔴 1 | `drift.test.ts` 実装 + CI連携（G1解消） | ヒラメ | 最優先・今週 |
| 🔴 2 | PRテンプレートにGate 1チェックリスト追加 | ヒラメ | 最優先・今週 |
| 🔴 3 | `validateUxSequence()` 実装 | ヒラメ | 今週 |
| 🟡 4 | `assertClerkRLSAlignment()` 実装 + `app/api/` 各ルートに適用 | ヒラメ | 今スプリント内 |
| 🟡 5 | えんまさ Gate 2 用PRテンプレート（応答サンプル3件必須）を追加 | えんまさ・ヒラメ | 今スプリント内 |
| 🟡 6 | app/api/内ビジネスロジック直書き禁止のArchitectureテスト追加 | ヒラメ | 今スプリント内 |
| 🟢 7 | Pull型知識共有（月曜15分）の開始 | チーム全員 | 来週から |
| 🟢 8 | ユーザーフィードバックループ設計 | えんまさ | Sprint 3以降 |

---

## 8. AGENTS.md §7 更新差分（提案）

### 追記：Gate 1 / Gate 2 の明文化

```markdown
### レビューゲート（2層構造）

**Gate 1（ヒラメ担当）— 技術的適合性**
AIが生成したすべてのPRに対し、ヒラメがPRテンプレートの5点チェックリストに署名してからGate 2に回す。
チェック内容: IDOR防御 / JWT連携 / 型安全 / N+1クエリ / エラー境界 / Why記入

**Gate 2（えんまさ担当）— 意味的妥当性**
以下のいずれかを変更するPRはえんまさ承認必須。
確認内容は「コード」ではなく「出力（応答サンプルまたはプレビューURL）」。

| 変更タイプ | 添付物 | 確認観点 |
|---|---|---|
| AIプロンプト・診断ロジック | AI応答サンプル3件（before/after） | 腑落ち体験 / UXシーケンス / 三毒増幅 |
| UIコピー・文言 | プレビューURL ＋ 変更文言diff | 禁止語彙 / 設計3原則 / 言語設計一貫性 |
| UXフロー・画面遷移 | プレビューURL ＋ フロー図 | UXシーケンス整合 / 三毒増幅 |
| シェアカード | プレビュー画像 | 禁止語彙 / 腑落ち体験 |

Gate 2対象外（えんまさ承認不要）:
- スタイリングのみの変更（コピー変更なし）
- バグ修正（表示内容が変わらないもの）
- パフォーマンス改善・リファクタリング
```

### 追記：Layer 2 / Layer 3 の境界の明確化

```markdown
**Layer 2 判定条件（追加）**
`app/api/` 内であっても以下を含む場合はLayer 2扱いとしえんまさ承認必須:
- 診断スコア計算ロジックのインライン実装
- プロンプト文字列の直書き
- 体系ナレッジへの直接参照

**Layer 3 の Gate 2 適用ルール（追加）**
`components/**` / `app/**` はLayer 3（AI委任OK）だが、
UIコピー・UXフロー・シェアカードを変更する場合は Gate 2（えんまさ承認）を経ること。
実装の自由度はAIに委任しつつ、ユーザーが目にする「意味」はえんまさが守る。
```

---

## 核心メッセージ

> 承認の質は、承認者の能力ではなく、**入力の設計で決まる。**
>
> — 村上 恵理（開発プロセス専門家）

> 動作の根拠を、動作と同じファイルに置け。
>
> — 橋本 智也（AIセキュリティ専門家）
