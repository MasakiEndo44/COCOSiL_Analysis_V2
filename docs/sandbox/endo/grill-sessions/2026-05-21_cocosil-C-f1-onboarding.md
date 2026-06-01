---
doc_id: grill.cocosil.cfe.f1-onboarding
doc_type: grill_session
product: [cocosil]
layer: sandbox
status: completed
as_of: 2026-05-21
owners: [endo]
grill_target:
  product: cocosil
  layers: [C, F, E]
  current_layer: C
  writeout_paths:
    C: docs/output/F1/F1_onboarding_features.md
    F: docs/output/F1/F1_onboarding_features.md
    E: docs/output/F1/F1_onboarding_features.md
---

# Grill Session: cocosil / C-F-E（F1 オンボーディング・登録）

---

## State

- turns: 18
- progress_stalled_turns: 0
- last_saved: 2026-05-21T00:19:00Z
- next_action: "完了。全18問グリル済み・書き出し済み。spec-sync TODO（D4 §4.1 / C1 goal-grill）が残課題"
- mode: NEW
- web_gate_suppressed_layers: []
- web_gate_refusal_count: {}

---

## Layer Progress

- C: { answered: 3/3, ready_to_writeout: true, writeout_done: true, items: [C-1, C-2, C-3] }
- F: { answered: 9/9, ready_to_writeout: true, writeout_done: true, items: [F-1..F-9] }
- E: { answered: 6/6, ready_to_writeout: true, writeout_done: true, items: [E-1..E-6] }

---

## Open Questions

<!-- 計18問。20260521_議論ログ_F1要件グリル計画.md で取捨選択・進行計画を確定 -->

### C 層（Capability・3問）
- [C-1] F1が満たすべきCapabilityを3つに分解すると？
- [C-2] F1全体の画面遷移シーケンスは？（LP→認証→生年月日→F1.3の順序と各画面境界）
- [C-3] Capability間の前後関係とF1.3への橋渡し（どのCapability完了でF1.3が起動するか）

### F 層（Feature・9問）
- [F-1] F1.1 認証方式の確定（メール+パスワード / SNS / 両方）
- [F-2] F1.1 SNS認証プロバイダの選定（Google / Apple / なし）
- [F-3] F1.1 認証画面の統合方式（Clerk Hosted Page / Embedded Component）
- [F-4] F1.2 生年月日の入力UI方式（3連select / ネイティブdate input / 単一テキスト）
- [F-5] F1.2 生年月日の入力タイミング（認証前 / 認証直後 / 別ステップ）
- [F-6] F1.2 プライバシー説明文の提示方法（インライン / モーダル / ツールチップ）
- [F-7] F1.2 年範囲の下限・上限とデフォルト値の有無
- [F-8] F1.4 哲学提示の表示位置と200字枠（LPのどこ・どの形式）
- [F-9] F1.4 初回のみ表示の判定方式（Cookie / DBフラグ / Clerk metadata）

### E 層（EARS受け入れ基準・6問）
- [E-1] 生年月日バリデーション：未来日付（EARS）
- [E-2] 生年月日バリデーション：1900年以前・下限超過（EARS）
- [E-3] 生年月日バリデーション：無効日付（2/29等）（EARS）
- [E-4] 認証失敗時の挙動（EARS）
- [E-5] 30秒の計測起点（lp_viewed / signup_completed）
- [E-6] F1完走の正常系受け入れ基準（LP→認証→生年月日→F1.3起動）

---

## QA Log

<!-- 1問1ターン。回答をここに追記する。ラベル: [U] [I: 根拠] [A] [X] [W: source] -->

### C-1: F1のCapability動詞列挙（3分割）
- Q: F1が「できるべきこと」をシステム能力として動詞で3つ列挙
- recommended: CAP-F1-1 認証・アカウント生成 / CAP-F1-2 生年月日の取得・永続化 / CAP-F1-3 哲学提示・F1.3への動機づけ
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:01:00Z

### C-2: Capability発動順序とF1の境界
- Q: 3Capabilityの発動順序とF1の開始/終了境界
- recommended: 発動順＝CAP-F1-3(動機づけ)→CAP-F1-1(認証)→CAP-F1-2(生年月日)。境界＝開始:LP到達 / 終了:生年月日永続化完了によるF1.3起動直前。認証と生年月日の細粒度順序はF-5へ。
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:02:00Z

### C-3: 依存前提とGraceful Degradation
- Q: 各Capabilityの外部依存と失敗時のF1の振る舞い
- recommended: CAP-F1-1→Clerk依存・認証失敗は言語設計トーンで再試行・ハードゲート / CAP-F1-2→Supabase依存・永続化失敗は一時保持リトライ・ハードゲート / CAP-F1-3→外部依存なし・描画失敗してもF1ブロックせず・F1.4は任意要件のため唯一スキップ可
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:03:00Z

### F-1: F1.1 認証方式の確定
- Q: メール+パスワード / SNS / 両方
- recommended: 両方提供。30秒以内目標のため認証画面でSNSを上段(主)・メール+パスワードを下段(副)に配置。パスワードポリシーはClerkデフォルト委譲
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:04:00Z

### F-2: F1.1 SNS認証プロバイダの選定
- Q: Google / Apple / LINE / なし
- recommended: MVPはGoogleのみ。Apple（Webアプリのため必須ではない・追加運用コスト）とLINE（友だち連携の懸念）はPhase 2以降
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:05:00Z

### F-3: F1.1 認証画面の統合方式
- Q: Clerk Hosted Page / Embedded Component
- recommended: Embedded Components型。<SignUp/>/<SignIn/>をCOCOSiL自ドメインのページに埋め込む。Hosted Page不採用（文脈断絶＝離脱要因④）。appearanceで#5B21B6統一。フルカスタムはMVP過剰、appearance具体実装はS層委譲
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:06:00Z

### F-4: F1.2 生年月日の入力UI方式
- Q: 3連select / ネイティブdate / 数値テキスト入力
- recommended: 年・月・日の3つの数値テキスト入力（inputmode=numeric＋自動フォーカス送り）。3連プルダウン不採用（離脱要因①）。ネイティブピッカーも非推奨（旧年の年送りが遅い）。本人が暗記している数字＝タイプが最速
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:07:00Z

### F-5: F1.2 生年月日の入力タイミング
- Q: 認証前 / 認証直後 / 別ステップ
- recommended: 認証直後の必須ステップ（専用画面）。認証前不採用（ファネル順）・後回し不採用（D4必須）。永続化成功までF1.3へ進ませない。再訪時はprofilesに生年月日があれば自動スキップ
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:08:00Z

### F-6: F1.2 プライバシー説明文の提示方法
- Q: インライン / モーダル / ツールチップ
- recommended: インライン常時表示（フィールド直下）。モーダル・ツールチップ不採用（タップしないと見えず不信ユーザーが離脱）。必須内容＝なぜ必要か（4体系の自動計算）＋利用範囲の安心材料。本文コピーはlanguage-design別タスク
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:09:00Z

### F-7: F1.2 年範囲・デフォルト値
- Q: 有効範囲の下限・上限とデフォルト値の有無
- recommended: 下限1900年1月1日（検証フロア）／上限今日（未来不可）／年齢下限ゲートは要件未定義のためMVPでは設けない／デフォルト値なし・空欄スタート・プレースホルダで桁数提示。境界の厳密化はE-1/E-2で
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:10:00Z

### F-8: F1.4 哲学提示の表示位置と200字枠
- Q: LPのどこに・どんな構成で出すか
- recommended: LPファーストビュー(hero)に配置。ヘッドライン「自分を知って、ラクになる。」＋哲学補足200字以内＋サインアップCTA(Thumb Zone)。CAP-F1-3はLP到達直後発動が必要のためスクロール後不可。本文コピーはlanguage-design別タスク
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:11:00Z

### F-9: F1.4 初回のみ表示の判定方式
- Q: Cookie / 専用DBフラグ / 認証状態
- recommended: Clerk認証状態のみで判定。未認証→常にLP表示／認証済み→アプリホームへリダイレクト(哲学スキップ)。Cookie不採用(消去・別端末で破綻)・専用DBフラグ不採用(認証状態で代替可・0.5GB制約)
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:12:00Z

### E-1: 生年月日バリデーション（未来日付）
- Q: 未来日付入力時の受け入れ基準（EARS）
- recommended: IF 入力された生年月日が当日より未来, システムはフォーム送信前にインラインエラーを表示し送信をブロックする。Zodで送信前判定。当日は有効
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:13:00Z

### E-2: 生年月日バリデーション（下限超過）
- Q: 下限を下回る日付の受け入れ基準（EARS）
- recommended: IF 入力された生年月日が1900年1月1日より前, システムはフォーム送信前にインラインエラーを表示し送信をブロックする。1900-01-01は有効・1899-12-31以前が無効
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:14:00Z

### E-3: 生年月日バリデーション（無効日付）
- Q: 暦上存在しない日付（2/29等）の受け入れ基準（EARS）
- recommended: IF 入力された年月日の組み合わせが暦上存在しない（平年2/29・2/30・4/31・13月・32日等）, システムはフォーム送信前にインラインエラーを表示し送信をブロックする。うるう年判定を含む実在チェック。E-1/E-2/E-3は単一Zodスキーマに統合
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:15:00Z

### E-4: 認証失敗時の挙動
- Q: 認証失敗時の受け入れ基準（EARS）
- recommended: IF Clerk認証が失敗（資格情報誤り・SNSキャンセル・サービス障害を含む）, システムは言語設計準拠トーンのエラーを表示し再試行を促す。後続ステップ（生年月日・F1.3）へ進めない。3条件を1本のIFに集約
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:16:00Z

### E-5: 30秒の計測起点
- Q: 「30秒以内」の計測区間（計測仕様）
- recommended: 起点=signup_started（LPサインアップCTAタップ・新設イベント）／終点=birth_date_submitted（生年月日永続化完了）。lp_viewed起点・signup_completed起点・welcome_chat_replied終点はいずれも不採用。goal-grill側ファネル記述の spec-sync が必要（Conflict C1）
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:17:00Z

### E-6: F1完走の正常系受け入れ基準
- Q: F1完走の正常系受け入れ基準（EARS）
- recommended: U=全フォーム入力値をZodで検証／While=生年月日未取得の間はF1.3以降へ進ませない／When=認証完了かつ有効な生年月日送信時にprofilesへ永続化しF1.3起動。E-1〜E-4と合わせEARS5パターン充足
- answer: 推奨採用
- label: [A]
- at: 2026-05-21T00:18:00Z

---

## Decisions (Resolved)

- D1: グリル対象スコープ＝F1.1認証・F1.2生年月日・F1.4哲学提示の3サブ要件。F1.3ウェルカム対話はプロンプト本文が議論ログで確定済みのため対象外（Q-INIT, 2026-05-21）
- D2: 対象層＝C→F→E。V/O/E上位は goal-grill（docs/output/goals/f1-onboarding-registration.md）で確定済み（Q-INIT, 2026-05-21）
- D3: 書き出し先＝新規 docs/output/F1/F1_onboarding_features.md の単一ファイル。§4.1詳細要件と goal-grill は参照素材（Q-INIT, 2026-05-21）
- D4: 生年月日はスキップ不可・必須に確定。§4.1例外系「SNS認証後スキップ→4体系計算を未設定として保持」を廃止。→ 要 spec-sync（§4.1例外系の改訂）（Q-INIT, 2026-05-21）
- D5: 生年月日の有効下限を「1900年1月1日（含む）」として厳密化。E-2 が goal-grill E-1-c の概略表現「1900年以前」を精緻化したもの（E-2, 2026-05-21）

---

## Conflicts

- C1: 「30秒以内」の計測区間。goal-grill（f1-onboarding-registration.md）のO説明は「signup_completed 〜 welcome_chat_replied」と記述するが、F1.3が本グリルの対象外であり welcome_chat_replied 終点はF1スコープ外。解決: F1グリルは計測区間を signup_started → birth_date_submitted と確定（E-5）。spec-sync 実施済み（2026-05-21・goal-grill L40/L42/L94 更新）。at: 2026-05-21

---

## Writeouts

- C+F+E（全18問）-> docs/output/F1/F1_onboarding_features.md（新規作成 / written at 2026-05-21）

---

## Web Searches

<!-- grill 中に実行した Web 検索のログ -->

---

## Notes

- グリル進行計画（20260521_議論ログ_F1要件グリル計画.md 由来）:
  - 設計3原則: ① Bind, Don't Reinvent.（既出は[A]/[I]で引用・再質問しない）② Grill Where Decisions Are Dense.（未決×高影響に集中）③ Stop at Feature, Leave Spec to Tasks.（S層に降りない）
  - 取捨選択の軸: 決定の自由度（既出⇔未決）× ユーザー摩擦影響度（低⇔高）の4象限
  - 🔴必須グリル: 生年月日UI方式・認証画面統合方式・画面遷移シーケンス・プライバシー提示
  - 🟡推奨グリル: SNSプロバイダ・哲学提示の表示制御・再訪時挙動・30秒計測起点
  - 🟢省略: パスワードポリシー（Clerkデフォルト委譲）・哲学コピー本文（language-design別タスク）・認証失敗エラーコピー本文（§4.1既出）
  - EARS対象: 生年月日バリデーション3本＋認証失敗1本のみ。哲学・SNSはUbiquitous記法1行
  - S層は対象外。実装詳細は TSK-UI-002 / TSK-API-001 に委譲
- 参照素材: docs/output/goals/f1-onboarding-registration.md / §4.1（cocosil_v2_detailed_requirements_specification.md）/ 20260503_議論ログ_F1.3ウェルカム対話プロンプト設計.md
- spec-sync 実施済み（2026-05-21）: D4 → §4.1 例外系を「スキップ不可・必須」に改訂 ／ C1 → goal-grill のファネル・測定方法を更新
