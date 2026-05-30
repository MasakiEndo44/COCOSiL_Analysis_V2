# 議論ログ：COCOSiL .github 機能定義

## 登場人物
- 🧑‍💻 三宅（GitHub Actions / DevOps専門家）：CI/CDアーキテクト歴9年。スタートアップのゼロからのパイプライン設計を30社以上支援。
- 👩‍🎓 橘（Developer Experience / Claude Code専門家）：DXエンジニア7年目。Claude Code Hooks設計と開発ガバナンスが専門。
- 💅 みさき（ギャル）：実際のCOCOSiL開発ユーザー（まあみ的立場）。実ユーザー視点で議論に参加。

## Turn 1｜現状診断 — 少人数AI開発チームのCI/CDが崩壊するパターン

**三宅：** COCOSiLは2名体制（えんまさ＝言語・AIプロンプト設計、ヒラメ＝APIファースト実装）＋UIオーナーのまあみさん。Claude Codeは「実装の速度」が格段に上がるが、「検証の速度」は上がらない。

CI崩壊の典型3パターン：
1. 「後でCI整える」方式：MVP後も整わず、本番デプロイのたびに手動テスト地獄
2. 「とりあえずVercel Preview」方式：ビルドは通るがTypeError/ESLintエラーが本番に滲み出る
3. 「Claude Codeがやってくれるはず」方式：HooksはローカルのAdvisory、CIがなければ破れ窓が広がる

**橘：** AI開発固有のCI汚染リスクが存在する：
- 誤ったimport追加（存在しないパスを自信満々にimport）
- スナップショットの自動上書き（`--update-snapshot` を勝手に実行）
- `.env` 類似ファイルへの書き込み（別名ファイルはHooksをすり抜ける）
- 共感チャットのプロンプト文字列変更が型チェックを通過する「意味論的回帰バグ」

**抽象診断：** 少人数AI開発チームのCI設計の本質は「AIが実装速度を上げるほど、品質検証のボトルネックが相対的に大きくなる」逆説。GitHub Actionsはその安全網。

## Turn 2｜選択肢の発散 — .github に入れるべき機能のフレームワーク

**橘：** 3軸分類：
| 軸 | 目的 | 具体物 |
|---|---|---|
| Gate（ゲート） | マージ条件の強制 | GitHub Actions workflow（CI）、Branch Protection Rules |
| Accelerate（加速） | 繰り返し作業の自動化 | Dependabot、PR auto-labeler、release drafter |
| Communicate（伝達） | チームの暗黙知を明示化 | PRテンプレート、Issueテンプレート、CODEOWNERS |

🔴 必須（Day 1）：ci.yml / branch-protection / pull_request_template.md
🟡 推奨（Week 1）：deploy-preview.yml / dependabot.yml / CODEOWNERS
🟢 任意（Month 1〜）：release.yml / ai-safety.yml / stale.yml

**三宅：** COCOSiL固有の追加ゲート：
- マイグレーション検証：`supabase db diff` で意図しないスキーマ変更を検出
- 環境変数の存在チェック（コードへのハードコード禁止）
- RLSポリシー未設定テーブル検出（全公開事故防止）
- プロンプトスナップショットテスト（共感チャットのシステムプロンプト変更の検知）

## Turn 3｜要件確定 — COCOSiLが本当に必要なものの優先度

**三宅：** CI実行時間最適化：
| ステップ | ナイーブ実装 | 最適化後 |
|---|---|---|
| pnpm install | 45-90秒 | 8-12秒（pnpmキャッシュ） |
| typecheck | 60-90秒 | 15-25秒（incremental） |
| lint | 30-60秒 | 8-15秒（ESLint cache） |
| test | 60-180秒 | 30-60秒（vitest --changed） |
| build | 90-180秒 | 60-90秒（Turborepo cache） |
| 合計 | 5-10分 | **2-3分** |

最速化のキー：① pnpm + actions/cache@v4 ② --changed フラグ ③ jobs並列実行

**橘：** COCOSiL AI開発固有の必須要件：
| 要件 | Claude Code固有度 |
|---|---|
| プロンプトスナップショット保護 | ★★★ |
| Supabase RLS lint | ★★★ |
| Claude_TOOL_INPUTログのPIIスキャン | ★★★ |
| pnpm audit 脆弱性チェック | ★★ |
| マイグレーション差分チェック | ★★ |
| ビルドサイズ計測 | ★ |

## Turn 4｜技術深掘り — Claude Code HooksとGitHub Actionsの二重防衛

**橘：** 二層防衛の設計：
```
[ローカル：Claude Code Hooks]
PreToolUse   → .env書き込みブロック、危険コマンドブロック
PostToolUse  → prettier/eslint --fix
Stop         → pnpm test 実行確認

         ↓ git push

[リモート：GitHub Actions]
PR作成時    → typecheck / lint / test / build
PRマージ時  → RLS lint / プロンプトスナップショット比較
main push時 → Vercel本番デプロイ / Supabase マイグレーション適用
```

3ファイル構成：
```
.github/workflows/
├── ci.yml       # PR時：型/lint/test/build（2-3分目標）
├── security.yml # PR時：RLS lint / PII scan / audit
└── deploy.yml   # main push時：Vercel + Supabase migration
```

**三宅：** CODEOWNERS設計（役割分担完全対応）：
```
packages/chat/src/prompts/  @enma          # プロンプト→えんまさ必須
packages/diagnosis/src/     @hirame @enma  # 診断ロジック→ヒラメ+えんまさ
apps/api/                   @hirame        # API→ヒラメ必須
apps/web/                   @maami         # UI→まあみ必須
.github/                    @enma @hirame @maami  # 全員必須
```

Branch Protection設定：
- CI status checks必須（typecheck/lint/test/security）
- require_code_owner_reviews: true
- main直接push禁止

## Turn 5｜設計原則の統合と実装アクション

```
【COCOSiL .github設計3原則】

① Dual Guard（二重防衛）
  Claude Code Hooks はローカルの即時修正層。
  GitHub Actionsはチームの合意確認層。

② AI-Aware Gate（AI意識型ゲート）
  プロンプトスナップショット・RLS未設定検出・PII混入スキャンなど、
  AIエージェントが起こしやすいミスに特化したゲートを組み込む。

③ Role-Locked Review（役割固定レビュー）
  CODEOWNERSでドメイン知識の境界を明示し、
  「誰がどのPRを必ずレビューするか」をコードで宣言する。
```

## ✅ 議論まとめ

| 項目 | 方針 |
|---|---|
| 基本構成 | `ci.yml` / `security.yml` / `deploy.yml` の3ワークフロー分割 |
| 速度目標 | CI完了2-3分（並列jobs + pnpmキャッシュ + --changedフラグ） |
| AI固有ゲート | RLS lint / プロンプトスナップショット / PII scan を `security.yml` に独立配置 |
| レビューガバナンス | CODEOWNERS でドメイン境界を宣言、CODEOWNERSレビューをBranch Protectionで必須化 |
| Claude Code連携 | Hooksはアドバイザリ、GitHub Actionsは決定的。役割を混同しない |
| 緊急度 | Branch Protection + `ci.yml` は Day 1 必須。Security系は Week 1 |
