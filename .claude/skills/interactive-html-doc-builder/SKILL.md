---
name: interactive-html-doc-builder
description: >
  情報源（要件定義書・議論ログ・既存ナレッジ）から、外部依存ゼロで単体動作する
  インタラクティブHTML説明ドキュメント（タブ・アコーディオン・図表）を生成するスキル。
  情報源の抽出 → セクション構成設計 → 基底テンプレート展開 → コンポーネント実装 →
  ブラウザ動作確認、の一連フローを再現する。正解実装は docs/output/help/（TSK-DOCS-002）。
  Use when: "HTMLドキュメントを作って" "help ページを作成" "インタラクティブHTML"
  "メンバー説明用ドキュメント" "オンボーディング資料をHTMLで" "タブ付きの説明ページ"
  "要件定義書をHTMLにまとめて" "docs/output/help/ に追加" "実装マニュアルをHTMLで"
  設計原則: Cite, Don't Invent（引用で構成・新規の意味的判断を足さない）/ 外部依存ゼロ
  設計根拠: docs/output/tasks/TSK-DOCS-003-html-doc-builder-skill.md
---

# interactive-html-doc-builder Skill

> 情報源から引用して構成する。新しい技術選定・新概念をこのドキュメントで「発明」しない（Cite, Don't Invent）。

---

## §1 PURPOSE

要件定義書・議論ログ・既存ナレッジを **構造化されたインタラクティブHTML** に変換する。
開発メンバーのオンボーディング・俯瞰用ハンドブックを、1コマンドで再現可能にする。

生成物の必須性質:

- **外部依存ゼロ** — CDN・npm・サーバー不要。`open xxx.html` だけで動く。Tailwind 等のフレームワークを使わない。
- **単体配布可能** — `html` + `styles-base.css` + `scripts-interactive.js` の3点セット（SVG図は HTML 内に inline）。
- **引用主義** — 本文はすべて出典付き。新規の意味的判断（新技術選定・新概念）を足さない。足したくなったら元ドキュメントを先に更新する。

---

## §2 WHEN TO USE / WHEN NOT

| 使う | 使わない |
|---|---|
| 開発者向け俯瞰ドキュメント・実装マニュアルをHTML化 | 単発の Markdown メモで足りる場合 |
| 複数観点をタブで切り替える説明ページ | React/Next.js アプリ内の UI 実装（`components/**` の領域） |
| 要件定義書・議論ログの内容を構造化して見せる | 新しい技術選定・新概念の提案（先に議論ログ・要件定義書を更新する） |
| `docs/output/help/` 配下への追加・更新 | エンドユーザー向けプロダクト画面（言語設計・UXシーケンスの制約が別途かかる） |

---

## §3 リファレンス実装（正解例）

このスキルは TSK-DOCS-002 の成果物を「正解実装」として再現する。新規生成前に必ず参照する。

| 種別 | パス |
|---|---|
| メインHTML（3観点タブ構成） | [docs/output/help/index.html](../../../docs/output/help/index.html) |
| 実装マニュアル型の応用例 | [docs/output/help/f3-implementation-guide.html](../../../docs/output/help/f3-implementation-guide.html) |
| 基底スタイル（このスキルの assets と同一） | [docs/output/help/styles.css](../../../docs/output/help/styles.css) |
| 基底インタラクション（同上） | [docs/output/help/scripts.js](../../../docs/output/help/scripts.js) |
| 運用ポリシー・ファイル構成 | [docs/output/help/README.md](../../../docs/output/help/README.md) |
| タスク定義 | [docs/output/tasks/TSK-DOCS-003-html-doc-builder-skill.md](../../../docs/output/tasks/TSK-DOCS-003-html-doc-builder-skill.md) |

`assets/styles-base.css` と `assets/scripts-interactive.js` は上記 `styles.css` / `scripts.js` の移植版。
新しいドキュメントを作るときは assets の2ファイルを成果物ディレクトリに併置すれば、見た目と挙動が正解例と揃う。

---

## §4 生成フロー（5ステップ）

### Step 1 — 情報源の抽出（Read Before Write）

対象テーマに関連する一次情報を Read で収集し、**引用候補リスト**を作る。

- 要件定義書（`docs/output/requirements/cocosil_v2_detailed_requirements_specification.md` 等）の該当 §
- 議論ログ（`docs/discussions/*.md`）
- ゴール定義（`docs/output/goals/*.md`）・設計中枢（`docs/input/concepts/COCOSiL設計中枢.md`）

各引用候補は **「本文 + 出典（ファイル §/Turn）」** の対で記録する。出典を辿れない情報は載せない。

### Step 2 — セクション構成の設計

抽出した情報を **観点（タブ）→ セクション（h2）→ 小見出し（h3）** の3階層に整理する。

- タブは「読者が知りたい切り口」で分ける（例: 技術スタック / アルゴリズム / ワークフロー、または 全体像 / 実装 / 品質ゲート）。
- 1タブ = 1 panel。タブ数は 2〜4 が読みやすい（多すぎると俯瞰性が落ちる）。
- 各セクションに「どのコンポーネントで見せるか」を割り当てる（§5 参照）。

### Step 3 — 基底テンプレートの展開

`assets/html-template.html` をコピーして成果物にする。

1. `{{...}}` プレースホルダを実内容に置換。
2. タブ数 / panel 数を観点数に合わせて増減（`tab-btn[data-target]` と `panel[id]` を 1:1 で対応させる — JS のタブ制御がこの対応に依存する）。
3. `assets/styles-base.css` → 成果物の `styles-base.css`、`assets/scripts-interactive.js` → 成果物の `scripts-interactive.js` を併置（または既存 `docs/output/help/styles.css` を共有する場合は `<link>`/`<script>` の参照先を合わせる）。
4. テンプレート末尾の「コンポーネントギャラリー」パネル（`id="gallery"`）は成果物では削除する。

### Step 4 — コンポーネント実装

§5 の早見表に従い、各セクションに callout / quote / accordion / table / code / diagram を配置。

- **引用は必ず `blockquote.quote` + `.quote-source`** で出典を明示。
- **図解は inline SVG**（外部画像を読み込まない）。複雑な相関図はアコーディオン内に畳む。
- 落とし穴・注意は `callout-warn`、確定経緯は `callout-info`、完了条件は `callout-success`。

### Step 5 — 動作確認

```bash
open <成果物>.html      # macOS。タブ切替・アコーディオン開閉・ハッシュ遷移を目視確認
```

確認項目:
- [ ] タブクリックで panel が切り替わる / 矢印キーでタブ移動できる
- [ ] `#perspective-2` のような URL ハッシュで該当タブが開く
- [ ] アコーディオンが開閉し chevron が回転する
- [ ] 相対リンク（要件定義書・議論ログ）が生きている
- [ ] 横幅 720px 以下でタブが縦積みになる（レスポンシブ）

---

## §5 コンポーネント早見表

| コンポーネント | クラス | 用途 |
|---|---|---|
| ページヘッダー | `.page-header` + `.badge` | タイトル・対象読者・バージョン |
| タブ | `.tabs` > `.tab-btn[data-target]` | 観点切替（JS が `data-target` ↔ `panel#id` を対応付け） |
| パネル | `.panel#id` > `section` | 1観点ぶんの本文 |
| コールアウト | `.callout` / `.callout-info` / `.callout-success` / `.callout-warn` | 補足・経緯・完了条件・警告 |
| 引用 | `.quote` + `.quote-source` | 出典付き引用（**必須**） |
| テーブル | `.table-wrap` > `table` | 比較・一覧（横スクロール対応） |
| コード | `pre > code` | コードブロック（ダーク背景） |
| アコーディオン | `.accordion` > `.accordion-header` + `.accordion-body` | 深堀り・FAQ・選定理由 |
| 図解 | `.diagram` > inline `<svg>` + `.diagram-caption` | アーキ図・フロー図（外部依存ゼロ） |
| フッター | `.page-footer` | 関連ドキュメントへの導線 |

カラートークンは `styles-base.css` の `:root` 変数（`--color-brand: #5b21b6` 等）に集約。SVG 内の色も同パレットに揃える。

---

## §6 内容ポリシー（厳守）

1. **引用主義（Cite, Don't Invent）**: 本文は一次情報からの引用で構成。出典を `.quote-source` または図キャプションに明記。
2. **禁止語**: ユーザーに見える文言を書く場合は `language-design` スキル / `lib/constitution/banned-words.ts` に従う（「占い」「鑑定」「霊感」等は使わない）。内部ドキュメントでも代替表現（性格分析・パーソナリティ診断）を優先。
3. **外部依存ゼロ**: CDN・Web フォント・外部画像・JS フレームワークを読み込まない。フォントはシステムフォントスタック（`--font-sans`）。
4. **意味的判断を足さない**: 新技術選定・新概念はこのドキュメントで決めない。必要なら先に議論ログ・要件定義書を更新し、本ドキュメントは追従する位置づけ。

---

## §7 出力先・命名規約

| 区分 | 出力先 |
|---|---|
| 本番ドキュメント | `docs/output/help/<slug>.html`（+ 併置 `styles-base.css` / `scripts-interactive.js`、または既存共有CSS/JSを参照） |
| 試作・テスト | `docs/output/help/sandbox/<slug>.html` |

- `<slug>` は kebab-case（例: `onboarding`, `f3-implementation-guide`）。
- 新規ドキュメント追加時は `docs/output/help/README.md` の「ファイル構成」「収録内容」表に1行追記する。

---

## §8 完了チェックリスト

- [ ] 全本文に出典がある（`.quote-source` / 図キャプション / 表の引用元列）
- [ ] 外部依存ゼロ（CDN・Webフォント・外部画像なし）で `open` だけで動く
- [ ] タブ・アコーディオン・ハッシュ遷移・レスポンシブが動作（§4 Step 5）
- [ ] 相対リンクが生きている
- [ ] ギャラリーパネル（`id="gallery"`）を削除済み
- [ ] `README.md` のファイル一覧を更新（本番ドキュメントの場合）
- [ ] 禁止語チェック済み（`language-design` 整合）
