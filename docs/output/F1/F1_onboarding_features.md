---
doc_id: requirements.cocosil.f1.onboarding-features
title: F1 オンボーディング・登録 — Capability / Feature / Eval 要件
doc_type: feature_requirements
product: cocosil
layer: output
status: draft
updated_at: 2026-05-21
grill_session: docs/sandbox/endo/grill-sessions/2026-05-21_cocosil-C-f1-onboarding.md
related:
  - docs/output/goals/f1-onboarding-registration.md
  - docs/output/requirements/cocosil_v2_detailed_requirements_specification.md
  - docs/discussions/20260503_議論ログ_F1.3ウェルカム対話プロンプト設計.md
  - docs/discussions/20260521_議論ログ_F1要件グリル計画.md
---

# F1 オンボーディング・登録 — Capability / Feature / Eval 要件

## 1. 概要

F1（オンボーディング・登録）の要件を **Capability → Feature → Eval** の3層で定義する。本書は requirements-grill（全18問・C→F→E）の成果物。

**スコープ**: F1.1（Clerk認証）・F1.2（生年月日入力）・F1.4（プロダクト哲学提示）の3サブ要件。

- **F1.3（ウェルカム対話）は対象外** — プロンプト本文は `docs/discussions/20260503_議論ログ_F1.3ウェルカム対話プロンプト設計.md` で確定済み。
- 上位の **Vision / Outcome は goal-grill**（`docs/output/goals/f1-onboarding-registration.md`）で確定済み。本書は参照素材として扱う。
- **S層（実装詳細）は対象外** — コンポーネント構成・ライブラリ選定は TSK-UI-002 / TSK-API-001 に委ねる。

**F1の目的**（goal-grill より）: LP到達ユーザーを30秒以内に認証＋生年月日入力まで導き、共感フェーズ（F1.3）の入口へ摩擦なく着地させる。

---

## 2. Capability 層

3つの Capability を実装非依存に定義する。

### CAP-F1-1 — 摩擦なく認証しアカウントを生成できる
- **外部依存**: Clerk
- **性質**: ハードゲート（認証成功まで後続へ進ませない）
- **紐づくOutcome**: 30秒以内完了率・F1完走率

### CAP-F1-2 — 4体系診断の計算に必要な生年月日を取得・永続化できる
- **外部依存**: Supabase（永続化先）
- **性質**: ハードゲート（永続化成功までF1.3へ進ませない）。生年月日は必須（D4）
- **紐づくOutcome**: F1→F2遷移率（F2が常に成立する素地）

### CAP-F1-3 — プロダクト哲学を提示し、F1.3共感対話への移行動機をつくれる
- **外部依存**: なし（静的コンテンツ）
- **性質**: ソフト（描画失敗してもF1全体をブロックしない。F1.4はシステム要件上「任意」のため唯一スキップ可）
- **紐づくOutcome**: F1完走率・初手離脱の防止

### 発動順序とF1の境界

```
F1開始：LP / シェアカードリンク到達
  → CAP-F1-3  LP上で哲学を提示し動機づける
  → CAP-F1-1  認証してアカウントを生成する
  → CAP-F1-2  生年月日を取得・永続化する
F1終了：生年月日の永続化完了 → F1.3 ウェルカム対話 起動
```

### Graceful Degradation

| Capability | 失敗時の振る舞い |
|---|---|
| CAP-F1-1 | エラーを言語設計トーンで表示し再試行を促す。ハードゲート＝認証成功まで先へ進ませない |
| CAP-F1-2 | 入力値を一時保持しリトライ。ハードゲート＝永続化成功までF1.3へ進ませない |
| CAP-F1-3 | 描画失敗してもF1全体をブロックしない。F1.4は任意要件のため唯一スキップ可 |

---

## 3. Feature 層

C→F→E グリルで確定した9つの Feature 決定。

### F1.1 認証

#### FEAT-F1.1-a 認証方式
両方を提供（メール+パスワード ＋ SNS認証）。30秒以内目標のため、認証画面で **SNSを上段（主）・メール+パスワードを下段（副）** に配置する。パスワードポリシーはClerkデフォルトに委譲。

#### FEAT-F1.1-b SNS認証プロバイダ
MVPは **Google のみ**。

| プロバイダ | MVP判定 | 理由 |
|---|---|---|
| Google | ✅ 採用 | 若手社会人のメール基盤として普遍的。Clerk標準連携で設定コスト最小 |
| Apple | ⏳ Phase 2 | COCOSiLはWebアプリでありネイティブiOSアプリではないため Apple Sign In は必須でない。Web対応は可能だが追加運用コストが発生 |
| LINE | ⏳ Phase 2 | 普及度は高いが、自己理解プロダクトの文脈で友だち連携・ビジネス/個人の境界感に懸念 |

#### FEAT-F1.1-c 認証画面の統合方式
**Embedded Components 型**。Clerkの `<SignUp />` / `<SignIn />` を COCOSiL 自ドメインのページ（例: `/sign-up`・`/sign-in`）に埋め込む。Hosted Page（外部ドメインへのリダイレクト）は不採用 — 文脈が断絶し「共感」フェーズの入口の空気が切れる。`appearance` でブランドカラー **#5B21B6** とトーンに統一し、LP→認証→生年月日 の視覚的連続性を保つ。`appearance` の具体実装・コンポーネント構成は S層（TSK-API-001 / TSK-UI-002）に委ねる。

### F1.2 生年月日

#### FEAT-F1.2-a 入力UI方式
年・月・日の **3つの数値テキスト入力**（`inputmode="numeric"` ＋ 自動フォーカス送り）。3連プルダウンは不採用（旧年へのスクロール摩擦）。ネイティブ日付ピッカーも非推奨（約30年前の生年月日は年送りナビゲーションが遅い）。生年月日は本人が暗記している数字でありタイプが最速。具体コンポーネント・ライブラリ選定は S層（TSK-UI-002）に委ねる。

#### FEAT-F1.2-b 入力タイミング
**認証直後の必須ステップ**（専用画面）。

```
Clerk認証成功 → 【生年月日入力ステップ】→ 永続化完了 → F1.3 起動
```

認証前・後回し（別ステップ）はいずれも不採用。永続化成功までF1.3へ進ませない（CAP-F1-2＝ハードゲート）。**再訪時**は `profiles` に生年月日が既に存在する場合、このステップを自動スキップする。

#### FEAT-F1.2-c プライバシー説明文の提示
**インライン常時表示**（生年月日入力フィールドの直下）。モーダル・ツールチップは不採用 — タップしないと見えず、不信を抱いたユーザーは離脱する。必須内容:

1. **なぜ必要か** — 星座・動物・六星の自動計算に使う（"診断のため"であり占い目的ではない）
2. **利用範囲の安心材料** — 外部公開しない 等

説明文の本文コピーは language-design スキルの別タスクとする。

#### FEAT-F1.2-d 有効範囲・デフォルト値

| 項目 | 確定 |
|---|---|
| 下限 | 1900年1月1日（含む）。1899年12月31日以前は無効 |
| 上限 | 当日。未来日付は無効 |
| 年齢下限ゲート | 現要件に未定義のため MVP では設けない |
| デフォルト値 | なし。全フィールド空欄スタート。プレースホルダで桁数提示（`YYYY` / `MM` / `DD`） |

### F1.4 哲学提示

#### FEAT-F1.4-a 表示位置と構成
**LPのファーストビュー（hero）** に配置。スクロールせずに見える位置。構成:

- ヘッドライン「自分を知って、ラクになる。」
- 哲学補足テキスト（200文字以内）
- サインアップCTA（Thumb Zone＝画面下部40%以内）

CAP-F1-3 は LP到達直後に発動する必要があるため、ファーストビュー必須。哲学補足テキストの本文コピーは language-design スキルの別タスクとする。

#### FEAT-F1.4-b 初回のみ表示の判定
**Clerk認証状態のみ**で判定する。

| アクセス主体 | 挙動 |
|---|---|
| 未認証 visitor | 常に LP（哲学提示込み）を表示 |
| 認証済みユーザーが LP（`/`）に来訪 | アプリホームへリダイレクトし、哲学提示をスキップ |

Cookie（消去・別端末で破綻）・専用DBフラグ（認証状態で代替可・Supabase 0.5GB制約）はいずれも不採用。

---

## 4. Eval 層 — EARS 受け入れ基準

### 常時要件（Ubiquitous）
- **EARS-U1**: システムは F1 の全フォーム入力値（メール／パスワード／生年月日）を Zod スキーマで検証する。

### 状態駆動要件（State-driven）
- **EARS-W1**: 生年月日が未取得である間、システムはユーザーを F1.3 以降のフェーズへ進ませない。

### イベント駆動要件（Event-driven）
- **EARS-N1（正常系完走）**: ユーザーが認証を完了し、かつ有効な生年月日を送信したとき、システムは生年月日を `profiles` に永続化し、F1.3 ウェルカム対話を起動する。

### 異常系要件（Unwanted behavior）
- **EARS-I1（未来日付）**: IF 入力された生年月日が当日より未来の日付である、システムはフォーム送信前にインラインエラーを表示し、送信をブロックする。
- **EARS-I2（下限超過）**: IF 入力された生年月日が1900年1月1日より前である、システムはフォーム送信前にインラインエラーを表示し、送信をブロックする。
- **EARS-I3（無効日付）**: IF 入力された年・月・日の組み合わせが暦上存在しない日付である（平年の2月29日、2月30日、4月31日、13月、32日 等）、システムはフォーム送信前にインラインエラーを表示し、送信をブロックする。
- **EARS-I4（認証失敗）**: IF Clerk認証が失敗する（資格情報の誤り・SNS認証のキャンセル・Clerkサービス障害を含む）、システムは言語設計準拠のトーンでエラーメッセージを表示し、ユーザーに再試行を促す。F1の後続ステップ（生年月日入力・F1.3）へは進めない。

> EARS-I1〜I3 は単一の生年月日 Zod スキーマに統合して検証する。

### 計測仕様
- **30秒以内の計測区間**: 起点 `signup_started`（LPのサインアップCTAタップ／新設イベント）〜 終点 `birth_date_submitted`（生年月日の永続化完了＝F1完了）。
- **検証手段**（goal-grill Eval より継承）: EARS-I1〜I3 は Vitest unit（`lib/diagnostics/__tests__/birth-date.test.ts`）、E2E完走は将来 Playwright。EARS-N1 はローンチ時点でえんまさのプレビューURL手動確認。

---

## 5. Decisions / Conflicts / spec-sync TODO

### Decisions
- **D1**: グリル対象スコープ＝F1.1・F1.2・F1.4の3サブ要件。F1.3は対象外。
- **D2**: 対象層＝C→F→E。V/O/E上位は goal-grill で確定済み。
- **D3**: 書き出し先＝本ファイル単一。§4.1・goal-grill は参照素材。
- **D4**: 生年月日はスキップ不可・必須に確定。§4.1例外系「SNS認証後スキップ→4体系計算を未設定として保持」を廃止。
- **D5**: 生年月日の有効下限を「1900年1月1日（含む）」として厳密化（goal-grill E-1-c の概略表現「1900年以前」を精緻化）。

### Conflicts
- **C1**: 「30秒以内」の計測区間。goal-grill のO説明「`signup_completed`〜`welcome_chat_replied`」は、F1.3が本書の対象外であり区間がF1スコープと不整合。**解決＝本書 §4 の計測仕様（`signup_started`〜`birth_date_submitted`）を正とする。**

### spec-sync 実施記録（2026-05-21 完了）
- ✅ `docs/output/requirements/cocosil_v2_detailed_requirements_specification.md` §4.1 例外系を **D4** に合わせ改訂（「SNS認証後スキップ」→「スキップ不可・必須」）。
- ✅ `docs/output/goals/f1-onboarding-registration.md` のファネルイベント・Outcome測定方法を **C1** に合わせ更新（`signup_started → birth_date_submitted`）。

---

## 6. Out of Scope / 参照

### Out of Scope
- F1.3 ウェルカム対話（プロンプト本文は議論ログで確定済み。フロント統合＝フェーズ遷移トリガー等は別タスク）
- S層実装詳細（コンポーネント構成・ライブラリ選定 → TSK-UI-002 / TSK-API-001）
- 哲学提示・プライバシー説明文の本文コピー（→ language-design スキル）
- パスワードポリシー（→ Clerkデフォルト）
- Apple / LINE SNS認証（→ Phase 2）
- 年齢下限ゲート（要件未定義のため）

### 参照
- グリルセッション: `docs/sandbox/endo/grill-sessions/2026-05-21_cocosil-C-f1-onboarding.md`
- 計画議論: `docs/discussions/20260521_議論ログ_F1要件グリル計画.md`
- goal-grill: `docs/output/goals/f1-onboarding-registration.md`
- 詳細要件 §4.1: `docs/output/requirements/cocosil_v2_detailed_requirements_specification.md`
- F1.3 プロンプト設計: `docs/discussions/20260503_議論ログ_F1.3ウェルカム対話プロンプト設計.md`
- 関連タスク: TSK-UI-002（F1ウェルカム対話UI）・TSK-API-001（F1オンボーディングAPI）
