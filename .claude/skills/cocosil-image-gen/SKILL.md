---
name: cocosil-image-gen
description: |
  COCOSiL V2 用の画像生成ラッパースキル。アイコン・HTML/レポート挿入画像・
  インフォグラフィック・ヒーロー画像・OG画像の背景・F3 共感AIチャット用ビジュアルなど、
  ユーザーに見える視覚素材を作るときに必ず使う。
  内部で mcp-image (`mcp__mcp-image__generate_image`, gpt-image-2) を呼び、
  以下を自動適用する:
    - 用途カテゴリ別の aspectRatio / imageSize / quality
    - `./images/<category>/<slug>-YYYYMMDD.png` の命名・出力先
    - 占い・霊感・スピリチュアル系の視覚要素を除外するブランドガード
    - 言語設計（lib/constitution/banned-words.ts）と整合した英語プロンプト
  以下のトリガーで必ず起動する:
    - 「アイコン作って」「アイコンを生成」「icon が欲しい」「favicon」
    - 「インフォグラフィック」「図解」「概念図」「関係図」「相関図」
    - 「レポートに挿入する画像」「セクション画像」「サムネ」「カバー画像」
    - 「ヒーロー画像」「ヒーローバナー」「LP のメインビジュアル」
    - 「OG画像の背景」「OG用カスタム背景」「シェアカード用の絵」
    - 「F3 共感チャットの背景」「チャットの世界観画像」
    - 「画像生成」「ビジュアル作って」「絵を作って」「イメージを起こして」
  ユーザーが「画像」「ビジュアル」「絵」「アイコン」と少しでも口にしたら、
  このスキルを最初に起動するか必ず検討する。
  逆にユーザーが要求しているのが純粋な SVG アイコン（lucide-react で済むもの）や
  Vercel OG / Satori でテキスト合成すれば十分なケースでは起動しなくてよい。
allowed-tools: Read, Write, Bash, mcp__mcp-image__generate_image
---

# COCOSiL Image Gen Skill

## なぜこのスキルが必要か

COCOSiL は「占いではなく、根拠のある性格分析プロダクト」。生成画像に
水晶玉・タロット・ホロスコープ・霊的シンボル・占い師風の人物像・神秘的グローが
混入すると、ターゲット層（25-35歳若手社会人）の信頼を失い、SNS でも拡散されない。
言語設計（[lib/constitution/banned-words.ts](lib/constitution/banned-words.ts)）が文言を縛るのと同じく、
**ビジュアルにも同じ縛り**を効かせる必要がある。

また F3 統合レポート用に複数枚の画像を生成・差し替えるため、命名・寸法・出力先が
バラつくとテンプレ側で壊れる。このスキルは「ブランドガード」と「命名・寸法の固定化」を
両立させるためのラッパー。

> プロダクト哲学・UXシーケンスを含む全体像が必要なら `cocosil-domain` skill を、
> 画像と一緒に文言を作る場合は `language-design` skill を併せて参照する。

## 0. 起動したら最初にやる 3 点

1. **用途カテゴリを宣言**（icon / insert / infographic / infographic-slide / hero / og-bg / chat-bg）
2. **禁止視覚要素**（§3）に該当しないか確認、該当しそうなら代替トーンを提案
3. **出力先ディレクトリの存在確認**（`./images/<category>/` を `mkdir -p`）

カテゴリが曖昧なら、ユーザーに 1 問だけ確認してから進む。決め打ちで進めると
寸法・命名が後から齟齬を起こす。

## 1. 用途カテゴリ別デフォルト

| カテゴリ | aspectRatio | imageSize | quality | 想定用途 |
|---|---|---|---|---|
| `icon` | `1:1` | `1K` | `balanced` | UI 内アイコン（256-512px 想定、透過は後処理） |
| `insert` | `4:3` | `2K` | `balanced` | レポート・ブログ本文に挿す挿絵 |
| `infographic` | `4:3` or `3:4` | `2K` | `quality` | 4 体系の関係図など概念図（editorial-neutral 系の内部資料向け） |
| `infographic-slide` | `16:9` | `2K` | `quality` | 顧客・パートナー・社内プレゼン向け説明スライド（cocosil-brand 系。プリズム柱・パステルグラデを含むブランド世界観） |
| `hero` | `16:9` | `2K` | `quality` | LP・ヒーローバナー |
| `og-bg` | `16:9` | `2K` | `quality` | OG画像の背景。テキストは `@vercel/og` で後合成する前提 |
| `chat-bg` | `9:16` | `2K` | `balanced` | F3 共感チャット用の縦長背景 |

迷ったら `balanced` + `2K`。最終納品候補で `quality` に上げる。`fast` は素早い案出しのみ。
これは gpt-image-2 の Active CPU コストと、生成時間（quality は数十秒）の
トレードオフから来ている。

## 2. mcp-image 呼び出しの引数マッピング

`mcp__mcp-image__generate_image` を呼ぶときの引数:

| 引数 | このスキルでの使い方 |
|---|---|
| `prompt` | §4 のテンプレートで組み立てた**英語**プロンプト |
| `fileName` | `<slug>-YYYYMMDD.png` のみ渡す（`IMAGE_OUTPUT_DIR` 配下に保存される） |
| `aspectRatio` | §1 の表に従う |
| `imageSize` | §1 の表に従う |
| `quality` | §1 の表に従う |
| `purpose` | 用途を英語短文で。例: `"app icon"`, `"report inline illustration"`, `"infographic for 4-system integration"`, `"hero banner for landing page"`, `"social card background"` |
| `useWorldKnowledge` | 歴史的人物・実在ランドマーク等を描く必要があるときのみ true |
| `useGoogleSearch` | 通常 false。時事性のある事実を描く場合のみ true |
| `inputImagePath` | 既存画像のバリエーション・スタイル変換時に絶対パスで渡す |
| `blendImages` | 複数被写体を合成する場合 true |
| `maintainCharacterConsistency` | 同一キャラを複数生成する場合 true |

mcp-image は内部で Subject-Context-Style プロンプト最適化を行うが、
それは「ディテールを盛る」最適化なので、ブランドガード（§3）は**こちらから明示的に
[Avoid] 節を入れない限り効かない**。必ず §4 のテンプレートを通す。

## 3. ブランドガード — 禁止視覚要素

ブランドガードは「一律禁止（道具立て）」と「文脈依存（ライティング・色）」の
2 階層に分ける。一律禁止が緩いと占い的世界観が混入する。文脈依存を過剰に
禁止するとブランド要素（パステルグラデ・プリズム光）まで消えて
editorial 図解しか作れなくなる（過去に実発生）。

### 3.A 一律禁止（道具立て・人物像レベル）

すべてのプロンプトの [Avoid] 節に**全列挙する**。例外なし。

**占い・霊感系シンボル**
- crystal balls（水晶玉そのもの・球体形状の中心ビジュアル）
- tarot cards（タロットカード現物）
- horoscope wheels, zodiac wheels, astrology charts（ホロスコープ・占星術図）
- zodiac constellation illustrations（黄道帯星座イラスト）
- pentagrams, hexagrams, occult sigils（五芒星・六芒星・呪術記号）
- candles in ritual settings, ritual smoke（儀式的な蝋燭・煙）
- crystal pendants, runes, ouija boards（クリスタルペンダント・ルーン・ウィジャ盤）

**占い師ステレオタイプ**
- fortune teller character, mystic robe figure（占い師風人物、ローブ姿）
- hands hovering over crystal ball（水晶玉に手をかざすポーズ）
- veiled women with cards（カードを持つベール姿の女性）

**動物・星座のステレオタイプ図像**
- animal mascot illustrations（動物性格診断カラム等に絵が混入する）
- zodiac animal pictograms（星座カラムにイラストが混入する）

### 3.B 文脈依存（ライティング・色レベル）

以下は「占い的文脈で出すと NG」「ブランド要素として明示すれば OK」。
プロンプト側では [Avoid] 節に近い禁止語を残したまま、[Style] 節末尾の
**`NOTE: ... is intentional brand element, not mystical decoration`** 注釈で
例外宣言する（§4.2 参照）。これがないとモデルが Avoid を強解釈して
ブランド要素まで消す。

| 要素 | 占い的に使う = NG | ブランドとして使う = OK |
|---|---|---|
| パステルグラデ（紫・ピンク・シアン） | 神秘的背景全面に拡散 | プリズム柱・hero 背景の指定箇所のみ |
| プリズム光・ホログラフィック | 占い師道具のオーラ | データ結晶化・情報統合の比喩 |
| コーナーグロー | god ray / divine light shaft | editorial 光演出として控えめに |
| 紫・ピンクライティング | mystical lighting | brand accent |

### 3.C 推奨ビジュアル（[Style] 節で積極指定する）

**editorial-neutral 系**（icon / insert / 内部資料 infographic）
- minimal flat illustration / clean editorial illustration
- neutral palette: off-white, deep navy, warm beige, muted terracotta accents
- soft natural light, indoor still life, abstract geometric shapes
- modern, grounded, calm, thoughtful

**cocosil-brand 系**（顧客向け infographic-slide / hero / og-bg / chat-bg）
- crystalline data-visualization sensibility
- pure white base + pastel iridescent gradients in focal elements
- deep navy text on white cards, pale-purple thin strokes, gradient arrows
- subtle corner prism light, calm and confident brand tone

詳細サブテンプレは §4.3 参照。

## 4. プロンプト設計テンプレート

英語で組み立てる（mcp-image の自動最適化は英語前提）。日本語で渡しても動くが、
構造化最適化の品質が落ちる。

### 4.1 基本テンプレ（5 節構造）

```
[Subject]            <主題を 1 文。誰／何が中心か、どんなアクションか。
                      形状が重要なら "vertical octagonal prism with flat top"
                      のように幾何を明示する（"prism" 単独だと結晶クラスタ風に
                      なる）>
[Context]            <文脈・背景・配置・モチーフ。COCOSiL の用途を一言>
[Content Accuracy]   <実在のラベル・固有名詞・カテゴリ名を使う場合は必ず
                      正確な文字列をここに列挙する。"representative keywords"
                      "example labels" と書くとモデルが勝手に発明する>
[Style]              <スタイル節。§4.3 のサブテンプレから選ぶ。
                      末尾に §4.2 の NOTE 注釈を必要に応じて付ける>
[Avoid]              <ブランドガード。§3.A は必ず全列挙。
                      §3.B は文脈に応じて [Style] の NOTE と組み合わせる>
```

`[Content Accuracy]` 節は文字ラベル付き図（infographic / infographic-slide /
insert / 比較表）では必須。アイコンや純粋ビジュアル（hero / chat-bg）では省略可。

### 4.2 「intentional brand element」注釈原則

`[Style]` 節でブランド要素（パステルグラデ・プリズム光・コーナーグロー等）を
指定するとき、`[Avoid]` 節に "no mystical glow / no pink-purple lighting" 等の
近い表現があると、モデルが Avoid を強解釈してブランド要素まで消す。

このとき `[Style]` 節の末尾に必ず以下のような注釈を入れる:

```
NOTE: <ブランド要素> are intentional COCOSiL brand elements representing
<意味> — they are NOT mystical or spiritual decoration.
```

例:
- `NOTE: the pastel gradients and prism light are intentional COCOSiL brand`
  `elements representing data crystallization — they are NOT mystical decoration.`
- `NOTE: the soft corner glow is an intentional editorial highlight — it is`
  `NOT a god-ray or divine-light shaft.`

これがないと §3.B（文脈依存禁止）の保持が機能しない。
infographic-slide テスト（2026-05-28）で実証。

### 4.3 スタイルサブテンプレ（2 系統）

色は **要素役割で限定する**（"terracotta は X ノードのみ" "pastel gradient は
中央プリズムのみ" など）。これがないとモデルが色を散漫に使う。

**A. `editorial-neutral` — icon / insert / 内部資料 infographic 用**

```
[Style] minimal flat editorial illustration, neutral palette
(off-white #FAF8F3 background, deep navy #1B2A4E for text and primary lines,
warm beige #E8DCC4 for filled nodes, muted terracotta #C97B5A accent reserved
ONLY for the designated focal element), crisp thin lines with consistent
stroke weight (1-2px equivalent), ample whitespace, modern and grounded,
calm and thoughtful, editorial illustration sensibility.
Palette is strict — additional accent colors only allowed when explicitly
listed here.
```

**B. `cocosil-brand` — infographic-slide / hero / og-bg / chat-bg 用**

```
[Style] modern editorial brand illustration with crystalline
data-visualization sensibility, palette: pure white #FFFFFF base background,
soft pastel iridescent gradients (pale purple #C7B3E8, pale cyan #B3D8E8,
pale pink #E8C7D8) reserved ONLY for designated focal elements
(central prism / hero accent), deep navy #1B2A4E reserved exclusively for
text labels, thin pale-purple #D8C8E8 strokes on card outlines
(1-1.5px equivalent), gradient arrow connectors flowing deep navy fading
into pale purple, subtle prism light reflections ONLY in the four corners
of the canvas (never overlapping content), clean rounded card nodes
(approximately 12px border-radius). All text in clean sans-serif typeface.
Calm, confident, brand-forward.
NOTE: the pastel gradients and prism light are intentional COCOSiL brand
elements representing data crystallization and insight synthesis — they are
NOT mystical or spiritual decoration.
```

### 4.4 タイトル・タグラインは画像内に焼かない

画像本体はビジュアル要素のみに集中させ、タイトル・タグライン・キャプション等の
読ませる文字は [@vercel/og](https://vercel.com/docs/og-image-generation) (Satori)
で後合成する。理由:

- gpt-image-2 は日本語タイポを高い確率で崩す
- 文字を画像に焼くと差し替え・多言語化のたびに再生成が必要
- ブランド一貫性は Satori のフォント・サイズ規定で保証したほうが安定

`[Context]` 節に「reserve top X% and bottom Y% as empty whitespace for separate
text overlay」と書くのは部分的に効くが、完全には守られない。本体画像は
**「diagram only / illustration only」** と割り切るのが筋。図中の必須ラベル
（ノード名等の短い英単語）のみ画像内に焼き、長文・日本語コピー・タイトルは
Satori 側で重ねる。

### 4.5 例: 「気づき」を表すアイコン（icon / editorial-neutral）

```
[Subject] A single softly-glowing lightbulb made of warm beige and deep navy
line work, with a small leaf rendered in the same warm beige line work
sprouting from the bulb's tip.

[Context] App icon symbolizing a quiet moment of self-understanding for a
personality analysis product. Centered composition with generous padding,
designed to read at 256x256 px and scale down to 32-64 px (keep the design
simple enough to survive 32px rendering).

[Style] (§4.3 A `editorial-neutral` サブテンプレを展開)

[Avoid] (§3.A 一律禁止リストを全列挙)
```

### 4.6 例: F3 パイプライン説明スライド（infographic-slide / cocosil-brand）

```
[Subject] A three-zone diagram on a horizontal slide. Left: a vertical stack
of four rounded white cards labeled with the four personality frameworks.
Center: a tall faceted vertical prism column (NOT a sphere, NOT a pointed
crystal cluster) with flat top and flat bottom — geometry like an industrial
glass column, glowing with pastel iridescent gradients inside. Right: two
rounded white cards for the outputs. Gradient arrows flow from left cards
into the prism (four converging arrows), and from the prism out to right
cards (two diverging arrows).

[Context] Brand-aligned infographic slide for explaining COCOSiL's F3
word-tree pipeline and 4-system integration logic to team members and
prospective partners. Used in a presentation deck. Diagram body only —
title and tagline will be overlaid separately via @vercel/og.

[Content Accuracy]
- Left cards (exact English labels, two lines each):
  Card 1: "Western Psychology / MBTI"
  Card 2: "Innate Traits / Zodiac"
  Card 3: "Behavioral Pattern / Animal Type (60 animals)"
  Card 4: "Life Cycle & Eastern Philosophy / Six Star"
- Center prism label: "Integration Engine — Observation Tree to Tree of 4"
- Right cards: "Empathic Chat (Evidence-Based)",
                "Integrated Self-Analysis Report"

[Style] (§4.3 B `cocosil-brand` サブテンプレを展開)

[Avoid] (§3.A 一律禁止リストを全列挙) + no actual crystal-ball sphere shapes
— the central element must be a faceted multi-sided vertical prism column
with flat top and flat bottom, like an industrial glass cylinder, not a
natural quartz crystal cluster.
```

## 5. 命名規則と出力先

- ルート: `./images/`（プロジェクトルートからの相対パス。`IMAGE_OUTPUT_DIR` と一致）
- カテゴリ別サブディレクトリ:
  - `./images/icons/`
  - `./images/inserts/`
  - `./images/infographics/`
  - `./images/infographic-slides/`
  - `./images/heroes/`
  - `./images/og-bg/`
  - `./images/chat-bg/`
- ファイル名: `<slug>-YYYYMMDD.png`
  - `slug` は kebab-case、英数のみ（例: `insight-bulb`, `four-system-integration`）
  - 日付は UTC ベース、`date -u +%Y%m%d` で取得
  - 同日複数生成は `<slug>-YYYYMMDD-<NN>.png`（NN は 02 から。初回は無印）

mcp-image の `fileName` には `<slug>-YYYYMMDD.png` のみ渡し（mcp-image 自体は
サブディレクトリ指定機能を持たないため）、生成後に専用スクリプトで
所定の category ディレクトリへ移動する:

```bash
./scripts/finalize-image.sh <category> <slug>-YYYYMMDD.png
```

スクリプトは `./images/` 直下の生成ファイルを `./images/<category>/` に
`mkdir -p` で移動する。生成と移動を 2 ステップに分けて手動 `mv` していると
カテゴリ違いの場所に置き忘れる事故が起きるため、mcp-image 呼び出し直後に
必ず実行する。

## 6. ワークフロー

1. ユーザーの依頼を `<用途カテゴリ>` × `<主題>` × `<補足ニュアンス>` に分解する
2. カテゴリが曖昧なら 1 問だけ確認する
3. §1 表から aspectRatio / imageSize / quality / purpose を決める
4. §4 テンプレートで英語プロンプトを組み立てる（5 節 = Subject / Context /
   Content Accuracy / Style / Avoid）。[Style] にブランド要素を含めるなら
   §4.2 の NOTE 注釈を末尾に必ず付ける。[Avoid] には §3.A を全列挙
5. `mcp__mcp-image__generate_image` を呼ぶ
6. 生成直後に `./scripts/finalize-image.sh <category> <slug>-YYYYMMDD.png` で
   category ディレクトリへ移動（mkdir -p + mv が 1 コマンドで完結）
7. 出力パスをユーザーに返し、Read tool で開いて確認するよう促す
8. NG なら何が NG かを聞き、[Style] / [Content Accuracy] / [Avoid] を
   調整して再生成
   - 同じカテゴリで 3 回試して改善が無ければ、参考画像（`inputImagePath`）の用意か
     カテゴリ変更を提案する。延々と同じ修正を続けない。

## 7. 禁止語チェック（プロンプト文字列）

`prompt` 文字列が以下を含んでいたら止めて置換を提案する:

| 含めない（英語） | 置換例 |
|---|---|
| `fortune telling`, `fortune teller` | （削除） |
| `tarot`, `horoscope`, `astrology`, `zodiac` | `personality analysis`, `self-understanding` |
| `psychic`, `occult`, `mystical`, `spiritual`, `divination` | `thoughtful`, `reflective`, `introspective` |
| `crystal ball` | （削除） |
| `accurate prediction`, `this will come true` | `personality insight`, `self-discovery` |

日本語入力でユーザーが「占い風にして」「神秘的に」「水晶っぽく」と言った場合、
生成前にトーンの再提案を行う。COCOSiL のブランド毀損リスクを伝え、
代替案（落ち着いた editorial illustration トーン等）を 1〜2 つ示す。

## 8. public/ への配置判断

このスキルは `./images/` までしか書き込まない。Next.js から配信する場合は
えんまさ承認後にユーザーが手動で `./public/images/<category>/` にコピーする。
理由: 著作権・差し戻し・命名衝突を一段噛ませるため、自動配置はしない。

## 9. アンチパターン

- mcp-image を呼ぶ前に用途カテゴリを決めない（命名・寸法がバラつく）
- 英語プロンプトに [Avoid] 節を入れ忘れる（占い系視覚要素が混入する確率が上がる）
- 同名ファイルを上書きする（YYYYMMDD と NN サフィックスで衝突回避）
- 「いい感じに」のままユーザーに渡す（用途・寸法・カテゴリを必ず宣言する）
- public/ に直接書き込む（差し戻し前提なので一段噛ます）
- ユーザーの「占い風」「神秘的」リクエストを無条件に受け入れる（ブランド毀損）
- 日本語プロンプトをそのまま mcp-image に渡す（最適化品質が落ちる）
- [Style] でブランド要素（パステルグラデ・プリズム光・コーナーグロー）を
  指定したのに §4.2 の `NOTE: ... is intentional, not mystical` 注釈を入れない
  （[Avoid] 節が Style を巻き込んでブランド要素まで消える）
- [Content Accuracy] 節なしで「representative keywords」「example labels」と
  書く（モデルが固有名詞を勝手に発明し、メンバー説明資料として使えない図になる）
- タイトル・タグライン・長文コピーを画像内に焼かせる（gpt-image-2 の日本語タイポは
  崩れる。読ませる文字は @vercel/og で後合成する）
- 形状指定で「prism」「crystal」とだけ書く（モデルが結晶クラスタや球体に流れる。
  "vertical octagonal prism with flat top, like an industrial glass column" の
  ように幾何を明示する）

## 10. 動作チェック（このスキルが効いているか）

以下が成立していれば OK:

- 「気づきを表すアイコンを作って」→ `icon` / `1:1` / `1K` / `balanced` /
  editorial-neutral サブテンプレ /
  `./images/icons/insight-XXX-YYYYMMDD.png` で出力
- 「4 体系の関係を内部資料用に図にして」→ `infographic` / `4:3` or `3:4` /
  `2K` / `quality` / editorial-neutral サブテンプレ /
  `./images/infographics/...-YYYYMMDD.png`
- 「F3 パイプラインをメンバー向けスライドにして」「ブランド世界観の
  説明スライド作って」→ `infographic-slide` / `16:9` / `2K` / `quality` /
  cocosil-brand サブテンプレ（中央プリズム柱 + パステルグラデ） /
  `./images/infographic-slides/...-YYYYMMDD.png`
- 「占いっぽいヒーロー画像作って」→ ブランドガード §3.A で一旦止まり、
  cocosil-brand トーン（パステルグラデ + プリズム + 角丸カード）への
  代替案が提示される
- 生成プロンプトに必ず [Avoid] 節（§3.A 全列挙）が含まれている
- 生成プロンプトに [Style] でブランド要素を入れる場合、末尾に
  `NOTE: ... is intentional COCOSiL brand element, not mystical decoration`
  注釈が含まれている
- 文字ラベル付き図の場合、[Content Accuracy] 節に正確なラベル文字列が
  列挙されている（「representative keywords」と書いていない）
