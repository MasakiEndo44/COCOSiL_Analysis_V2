# 議論ログ：COCOSiL プラグイン最適構成

## 登場人物
- 🧑‍🔬 藤本（Claude Code エコシステム専門家）：DX/DevTools研究者・歴8年。Plugin設計とMCPトークンコスト計算が専門。
- 👨‍💼 城戸（スタートアップCTO / プロダクト戦略）：シード〜シリーズAのスタートアップを10社支援。少人数AI開発チームのプラグイン投資ROIを専門に。
- 💅 みさき（ギャル）：Claude Codeを使って開発するまあみ的立場の実ユーザー。「全部入れたい」vs「何を使えばいいか分からない」の葛藤を持つ。

## Turn 1｜現状診断 — 「全部入れ症候群」の本質

スモールスタートアップが陥る3失敗パターン：
1. MCP過積載型：5サーバー×約1万トークン = 5万トークンの定常コスト
2. コマンド衝突型：feature-devとsuperpowersの競合
3. ドメイン無視型：一般構成をそのままコピー

**抽象診断：** 「汎用ツールが提供できるもの（ワークフロー・品質ゲート・git自動化）」と「チーム固有ドメインにしか存在しないもの（共感設計・占術ナレッジ・言語設計）」の境界を引くことが設計の出発点。

## Turn 2｜選択肢の発散 — 3軸分類

評価軸A（トークンコスト）：MCPサーバー型（常時1万/個）> フック型（イベント時のみ）> スキル型（メタデータのみ常時）
評価軸B（役割カバー）：汎用（外部プラグイン） vs COCOSiL固有（自前SKILL.md）
評価軸C（チーム適合）：えんまさ/ヒラメ/まあみ 三者のロール別使用頻度

初期構成案：コア4（superpowers/feature-dev/security-guidance/commit-commands）+ MCP2（supabase/vercel）+ 用途別3（frontend-design/code-review/context7）

## Turn 3｜COCOSiL固有要件の確定

マーケットプレイスが絶対に提供できない自前SKILL.md 6個：
1. cocosil-mbti（128アーキタイプの診断ロジック）
2. empathetic-chat（共感チャット＋安全設計）
3. language-design（「占い」禁止ワード言語置換ルール）← 言語設計文書v1.0から生成
4. supabase-rls（RLS設計パターン）
5. clerk-auth（認証実装パターン）
6. openai-streaming（SSEストリーミング）

「プラグインはチームのドメイン知識の代替にはならない」が核心原則。

## Turn 4｜技術深掘り — feature-dev vs superpowers の決着 と MCP最小化の定量根拠

**feature-dev vs superpowers：**
- feature-dev：7フェーズ（Discovery→Questions→Design→Implementation→Review）。ドメイン複雑機能に最適
- superpowers：TDD red-green-refactor強制。型明確なバックエンド実装に最適
- 結論：feature-devを主幹（ドメイン知識確認を強制）、superpowersをTDD補助

**MCP 1個制限の定量根拠：**
- supabase MCP：約8,000〜12,000トークン定常コスト
- vercel MCP：約4,000〜6,000トークン → CLIで代替可能なので見送り
- github MCP：約10,000トークン → `gh` CLIで代替可能なので見送り
- 採用基準：「CLIで代替できるか？」→ できる→CLI、できない→MCP

## Turn 5｜最終構成と3原則

**COCOSiL プラグイン選定3原則：**
① Domain-First：固有ナレッジは自前SKILL.mdで担う
② MCP Minimum：supabase 1個のみ。CLIで代替できるMCPは入れない
③ Workflow Clarity：feature-dev（複雑機能）とsuperpowers（TDD）を役割分担

**最終構成：外部7個 + 自前6個 = 合計13個**

## ✅ 議論まとめ

| 項目 | 方針 |
|---|---|
| 外部プラグイン数 | 7個 |
| 自前SKILL.md数 | 6個 |
| MCP採用方針 | supabase 1個のみ |
| 主幹ワークフロー | feature-dev（ドメイン複雑機能）+ superpowers（バックエンドTDD） |
| 見送り | vercel MCP / github MCP / codex / coderabbit |
