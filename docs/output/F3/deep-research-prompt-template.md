---
doc_id: canonical.cocosil.features.f3-1.deep-research-template
title: F3.1 観察軸ツリーデータ収集 — Step 1 Deep Research 本文プロンプト雛形
doc_type: spec
product: cocosil
feature_group: F3 統合レポート
features: [F3.1]
layer: canonical
status: draft
proposed_by: hirame
proposed_at: 2026-05-27
as_of: 2026-05-27
audience: [enmasa]
revision_basis: docs/output/F3/observation-tree-pipeline.md §6
one_line_thesis: F3.1 観察軸5軸×4体系=20セルの **Step 1 本文レポート** を Deep Research で生成する共通プロンプト雛形。JSON 抽出は Step 2 以降のパイプラインに分離する。
related_constitution:
  - lib/constitution/observation-axes.ts
  - lib/constitution/observation-tree-schema.ts
  - lib/constitution/banned-words.ts
related_discussions:
  - docs/discussions/議論ログ_F3-1観察軸5軸確定.md
  - docs/discussions/議論ログ_F3-1キーワードツリー4体系統合アルゴリズム.md
related_goals:
  - docs/output/goals/f3-keyword-tree-integration.md
related_inputs:
  - docs/output/F3/observation-tree-pipeline.md
---

# F3.1 観察軸ツリーデータ収集 — Step 1 Deep Research 本文プロンプト雛形

> **使い方**: 本書の §4 共通テンプレートを Deep Research ツール（Perplexity Pro / Gemini Deep Research / GPT Deep Research 等）に貼り付け、`{{plchldr}}` 部分を §6 のチェック表から1セルずつ置換して実行する。出力は **Markdown 本文**（学術引用・伝統的解釈・脆弱性記述を含む長文）とし、`scripts/build-observation-tree/inputs/{system}-{axis}.md` に保存する。JSON 化以降は Step 2（Claude API + generateObject）が担う。

---

## 1. 目的

F3.1 レポート生成エンジンの中間表現「Tree of 4, Harvest 1.」を成立させるため、**4体系（zodiac / animal / rokusei / mbti）× 5観察軸 = 20セル分** のキーワードツリーデータを構築する。本テンプレートはその第1段（Step 1: 本文レポート生成）専用。

各セルの本文には **その体系の全カテゴリ（12星座等）× 当該観察軸の特徴記述** が以下を含む形で書かれている必要がある：

- 各カテゴリの気質・性向の説明（伝統文献に基づく）
- 該当する伝統概念（四体液説 / 五行 / 五大運命星 / 認知機能型 等、体系により異なる）
- **そのカテゴリが伝統的に示す脆弱性・短所・典型的不調**（後段の negative ベクトル抽出に必須）
- 引用源（書籍 / 学術記事 / 信頼性ある web を優先順位順）

## 2. 担当と運用

- **データ生成**: えんまさ（Deep Research ツールで本雛形を実行）
- **レビュー**: えんまさ（§8 のレビュー観点で Markdown 本文をチェック）
- **JSON 抽出 / 検証 / Critique**: パイプライン（Step 2-4、自動）
- **最終 commit**: `lib/data/observation-tree/{system}/{axis}.json`（Step 5 通過後、Layer 2 Gate 2 対象）

---

## 3. 出力 Markdown フォーマット（Step 1 専用）

> **重要**: 旧テンプレートは JSON を直接出力させていたが、Stage-Gated Generation パイプライン（`observation-tree-pipeline.md` §3）で **本文生成と JSON 抽出を分離した**。Step 1 は **Markdown 本文のみ** を出力する。JSON は Step 2 が Claude API + `generateObject()` で抽出する。

### 3.1 トップレベル構造

```markdown
# {{system_name_ja}} × {{axis_label_ja}} — 観察軸データ調査本文

## メタ情報

- 体系: {{system_name_ja}}（{{system_id}}）
- 観察軸: {{axis_label_ja}}（{{axis_id}}）
- 軸の定義: {{axis_definition}}
- 識別キーフレーズ: {{observation_keywords}}
- カテゴリ総数: {{categories_count}}
- 調査実施日: YYYY-MM-DD

## 軸の境界（厳守）

- 含めるもの: 「{{axis_label_ja}}」の観点に絞った特徴
- 他軸に逃がすもの: 後述の §「軸境界 NG 例」参照

## 各カテゴリの記述

### {{category_label_ja_1}}（category_id: {{category_id_1}}）

#### 気質・性向の説明
（伝統文献に基づく中心的な気質記述。150-300字。本軸の観点に絞ること）

#### 該当する伝統概念
（四体液・五行・五大運命星・認知機能型など、本体系の伝統で対応する概念。100-200字）

#### 脆弱性・短所・典型的不調
（**ポジティブバイアスを排し、伝統が示す弱み・脆弱性・典型的不調を必ず記述する**。これは批判ではなく自己理解の側面。150-300字）

#### 引用源（最低2件、うち1件以上は書籍または学術記事）
1. 〔書籍〕著者名『書籍名』出版社, 出版年, 該当ページ
2. 〔学術〕著者名 (年). 論文タイトル. ジャーナル名, 巻号, ページ. DOI
3. 〔web〕（補足のみ可。書籍/学術1件は必須）URL: ...

#### 確信度の所感
（後段で 0.30-1.00 にマッピングする所感を一段書く。§5 ルーブリックに従う）

---

### {{category_label_ja_2}}（category_id: {{category_id_2}}）
... 同じ構造を全カテゴリ分繰り返す ...
```

### 3.2 本文に必ず含めるべき情報

| 情報種別 | 後段で抽出される JSON フィールド | 落とすと起きる障害 |
|---|---|---|
| 気質・性向の説明 | `features`（positive / neutral 側） | 本文-JSON 情報落差 |
| 該当する伝統概念 | `axis_definition_used` の補強・確信度判定材料 | 確信度の根拠不足 |
| **脆弱性・短所・典型的不調** | `features`（negative 側）+ `vector: negative` | **negative ベクトル不出現** |
| 引用源（書籍/学術 ≥1） | `primary_sources`（type: book / academic / web） | `primary_sources` 空配列で Schema reject |
| 確信度の所感 | `confidence`（0.30-1.00） | 確信度飽和（σ < 0.10） |

---

## 4. 共通プロンプトテンプレート

以下を Deep Research ツールに貼り付け、`{{plchldr}}` を §6 から置換して実行する。

````markdown
# Deep Research タスク: COCOSiL 観察軸データ Step 1 本文調査

## 対象
- 体系: {{system_name_ja}}（{{system_id}}）
- 観察軸: {{axis_label_ja}}（{{axis_id}}）

## 軸の定義（このプロンプト実行中、絶対に変更しないこと）
{{axis_definition}}

## 軸の識別キーフレーズ（参考。本文の語彙はこれに限らない）
{{observation_keywords}}

## あなたの仕事

「{{system_name_ja}}」の **{{categories_count}} 個全てのカテゴリ**（{{categories_list_ja}}）について、「{{axis_label_ja}}」の観点で **Markdown 本文の調査レポート** を執筆する。

このレポートは後段で別 LLM パイプラインが構造化 JSON に抽出する。よって以下を厳守する：
- **本文を JSON に圧縮しない**。学術引用・脆弱性記述・伝統概念の解説を本文中に丁寧に展開する
- 各カテゴリは §「出力フォーマット」の構造を必ず満たす
- 引用源を必ず明記する（書籍/学術記事最低1件）

## 必須遵守事項（違反した本文は採用しない）

### A. 体系の独立性

- {{system_name_ja}} **以外の体系**（MBTI / 星座 / 動物 / 六星）の用語・概念を **混入させない**。記述は {{system_name_ja}} の伝統に固有のものだけ。

### B. 軸の境界（重要 — NG 例リスト参照）

「{{axis_label_ja}}」の観点に **絞った特徴**だけ記述する。下記の NG 例は他軸に属するので、本文に書いてはならない：

{{axis_boundary_ng_examples}}

他の4軸（{{other_axes_label_ja}}）の特徴は別プロンプト実行時に収集する。

### C. ステレオタイプ汚染の防止

- 俗説・大衆向け記事のテンプレ文言（例:「{{stereotype_example_for_system}}」のような決めつけ）を **そのまま引用しない**。一次文献・伝統的解釈を典拠とする。
- **引用源は各カテゴリ最低2件、うち1件以上は書籍 or 学術記事**。URL のみの web ソースは補助としてのみ使用可。
- 引用は「〔書籍〕著者『書名』出版社, 年, ページ」「〔学術〕著者 (年). タイトル. ジャーナル, 巻号. DOI」の形式で明示する。

### D. COCOSiL 言語設計ルール

- 本文中に以下の禁止語彙を含めない：**占い / 占い師 / 鑑定 / 運勢 / 占星術 / 当たる / 当たった / 霊感 / 霊視**
  - 体系名としての言及（例: 西洋ホロスコープ体系の古典伝統）は不可避な場合のみ最小限。`features` に抽出される位置（気質説明・脆弱性記述）には絶対に書かない
- ジェンダーステレオタイプ（「○○な女性」「男らしい」「主婦向け」等）を含めない。
- 「腑落ち」「悟り」等の宗教的内輪語も使わない（言語設計 v1）。

### E. ベクトル方向（後段で抽出される判定）

本文中で記述する性質は、後段で以下3値に分類される：
- `positive`: 当該軸で「強く・活発・前向きに発露」する特徴
- `negative`: 当該軸で「弱く・抑制的・脆弱性・典型的不調」を示す特徴
- `neutral`: 軸上の方向性を判定できない、もしくは両義的（流派により評価が分かれる）

#### negative の正直な記述（最重要）

伝統的体系（西洋ホロスコープ体系・四体液説・MBTI 各タイプ・六星占術等）は必ず「強み」と並んで **「弱み・脆弱性・短所・典型的不調」を記述している**。LLM のポジティブバイアスでこれが脱落すると、後段で `vector: negative` を持つカテゴリが消滅し、Schema 検証で reject される。

以下を厳守すること：

- 各カテゴリで **「脆弱性・短所・典型的不調」セクションを必ず書く**。空欄・「特になし」は不可
- 古典・主要文献で言及される弱み・脆弱性記述を躊躇なく拾う。**これは批判ではなく、伝統が示す自己理解の重要側面**
- 全カテゴリを positive で埋めるのは伝統解釈への不誠実な要約とみなされる。後段で reject される
- neutral は両義的・流派により評価が分かれる特徴に使う

### F. 確信度の所感（5段階ルーブリック）

各カテゴリ末尾の「確信度の所感」は以下のルーブリックで判定し、後段で 0.30-1.00 にマッピングされる。**観測者の主観や特定流派バイアスを排除し、「その体系の伝統」を主語にすること**。

| 段階 | confidence 帯 | 判定基準（その体系の伝統を主語に） |
|---|---|---|
| **中核必須** | 0.90 - 1.00 | 古典文献・複数流派が一致して、このカテゴリを定義する際に必須として挙げる中核特徴 |
| **強く言及** | 0.75 - 0.89 | 主要文献の過半が言及するが、流派により強調度が異なる |
| **標準** | 0.55 - 0.74 | 中堅文献で言及される、または1-2の主要流派が強調する |
| **部分的** | 0.40 - 0.54 | 限定的流派・特定の解釈系統でのみ言及される |
| **少数派解釈** | 0.30 - 0.39 | 一部解釈のみ。採用は慎重に判断 |
| **採用しない** | < 0.30 | 本文に書かない |

判定の例: 「四体液説の伝統で牡羊座は『火・熱』の典型として古典から現代に至るまで一致して挙げられる → 中核必須（0.90-1.00）」

## 出力フォーマット（Markdown 本文）

§3.1 の構造に従う。要点を再掲：

```markdown
# {{system_name_ja}} × {{axis_label_ja}} — 観察軸データ調査本文

## メタ情報
（体系・軸・定義・キーフレーズ・カテゴリ総数・調査日）

## 軸の境界（厳守）
（含めるもの / 他軸に逃がすもの）

## 各カテゴリの記述

### カテゴリ名（category_id: snake_case_id）

#### 気質・性向の説明
（150-300字。本軸の観点に絞る）

#### 該当する伝統概念
（100-200字。四体液・五行・五大運命星等）

#### 脆弱性・短所・典型的不調
（150-300字。**必ず書く**。空欄不可）

#### 引用源
1. 〔書籍〕...
2. 〔学術〕...
3. 〔web〕...

#### 確信度の所感
（5段階ルーブリックのどの段階に該当するか、根拠と共に一段）

---
```

これを全カテゴリ分繰り返す。

**JSON を出力しないこと**。本文の Markdown のみを出力する。JSON 化は後段の Step 2 が担う。
````

---

## 5. プレースホルダ一覧

| プレースホルダ | 入る値の例 |
|---|---|
| `{{system_name_ja}}` | 12星座 / 60動物 / 六星 / MBTI |
| `{{system_id}}` | `zodiac` / `animal` / `rokusei` / `mbti` |
| `{{axis_label_ja}}` | 身体・気質パターン 等 |
| `{{axis_id}}` | `embodied_pattern` 等 |
| `{{axis_definition}}` | `lib/constitution/observation-axes.ts` の `definition` をコピー |
| `{{observation_keywords}}` | 同上 `observation_keywords` |
| `{{categories_count}}` | 12 / 60 / 12 / 16 |
| `{{categories_list_ja}}` | 「牡羊座, 牡牛座, …」など全カテゴリ列挙 |
| `{{other_axes_label_ja}}` | 当該軸以外の4軸の日本語表示名 |
| `{{stereotype_example_for_system}}` | 体系固有の典型的俗説（蟹座なら「家庭的だから尽くす女性」等） |
| `{{axis_boundary_ng_examples}}` | §5.1 の NG 例リストから当該軸の項目をコピー |

### 5.1 軸境界 NG 例リスト（プロンプトに埋め込む）

`lib/constitution/observation-axes.ts` の各軸 `definition` / `observation_keywords` に基づき、他軸へ混入しがちな具体例を列挙する。プロンプト埋め込み時はこのまま転記する。

#### embodied_pattern（身体・気質パターン）に書いてはいけない例

- ❌「精緻な自己管理ができる」→ ✅ cognitive_style（判断癖・処理特性）へ
- ❌「他者への共感力が高い」→ ✅ relational_mode（対人モード・共感）へ
- ❌「目標達成への執着が強い」→ ✅ motivation_drive（駆動方向・意志）へ
- ❌「内的な葛藤の深さ」→ ✅ emotional_response（情動表出・内的情動）へ
- ❌「人間関係の境界線を引くのが上手」→ ✅ relational_mode（境界・親密圏）へ

#### emotional_response（感情反応パターン）に書いてはいけない例

- ❌「体力の持久度が高い」→ ✅ embodied_pattern（体質・気力）へ
- ❌「論理的に状況を分析する」→ ✅ cognitive_style（思考・判断）へ
- ❌「達成欲が強く挑戦的」→ ✅ motivation_drive（駆動・意志）へ
- ❌「他者との距離の取り方が独特」→ ✅ relational_mode（距離感）へ

#### cognitive_style（認知スタイル）に書いてはいけない例

- ❌「行動テンポが速い／遅い」→ ✅ embodied_pattern（テンポ）へ
- ❌「喜怒哀楽が激しい」→ ✅ emotional_response（情動表出）へ
- ❌「何によって駆動されるか」→ ✅ motivation_drive（駆動源）へ
- ❌「初対面での距離感」→ ✅ relational_mode（公的圏）へ
- ❌「ストレス耐性が高い／低い」→ ✅ embodied_pattern または emotional_response へ

#### motivation_drive（動機エネルギー）に書いてはいけない例

- ❌「直観的に判断する／分析的に判断する」→ ✅ cognitive_style（処理特性）へ
- ❌「親密圏でだけ素を見せる」→ ✅ relational_mode（親密圏）へ
- ❌「情動が表に出やすい／出にくい」→ ✅ emotional_response（情動表出）へ
- ❌「身体的な活動量が多い」→ ✅ embodied_pattern（エネルギー水準）へ

#### relational_mode（対人モード）に書いてはいけない例

- ❌「概念を抽象化して扱う」→ ✅ cognitive_style（処理特性）へ
- ❌「持久力で押し切る」→ ✅ embodied_pattern（気力）へ
- ❌「成し遂げたい目標が明確」→ ✅ motivation_drive（目標）へ
- ❌「感受性が鋭く刺激に反応する」→ ✅ emotional_response（感受性）へ

---

## 6. 20セル取り組みチェック表

`scripts/build-observation-tree/inputs/{system}-{axis}.md` として Step 1 本文を保存し、Step 5 通過後に `lib/data/observation-tree/{system}/{axis}.json` として commit する20セル。

| # | system | axis | カテゴリ数 | 状態 | commit |
|---|---|---|---|---|---|
| 1 | zodiac | embodied_pattern | 12 | ⬜ 未着手 | - |
| 2 | zodiac | emotional_response | 12 | ⬜ 未着手 | - |
| 3 | zodiac | cognitive_style | 12 | ⬜ 未着手 | - |
| 4 | zodiac | motivation_drive | 12 | ⬜ 未着手 | - |
| 5 | zodiac | relational_mode | 12 | ⬜ 未着手 | - |
| 6 | animal | embodied_pattern | 60 | ⬜ 未着手 | - |
| 7 | animal | emotional_response | 60 | ⬜ 未着手 | - |
| 8 | animal | cognitive_style | 60 | ⬜ 未着手 | - |
| 9 | animal | motivation_drive | 60 | ⬜ 未着手 | - |
| 10 | animal | relational_mode | 60 | ⬜ 未着手 | - |
| 11 | rokusei | embodied_pattern | 12 | ⬜ 未着手 | - |
| 12 | rokusei | emotional_response | 12 | ⬜ 未着手 | - |
| 13 | rokusei | cognitive_style | 12 | ⬜ 未着手 | - |
| 14 | rokusei | motivation_drive | 12 | ⬜ 未着手 | - |
| 15 | rokusei | relational_mode | 12 | ⬜ 未着手 | - |
| 16 | mbti | embodied_pattern | 16 | ⬜ 未着手 | - |
| 17 | mbti | emotional_response | 16 | ⬜ 未着手 | - |
| 18 | mbti | cognitive_style | 16 | ⬜ 未着手 | - |
| 19 | mbti | motivation_drive | 16 | ⬜ 未着手 | - |
| 20 | mbti | relational_mode | 16 | ⬜ 未着手 | - |

> **合計**: 20ファイル / 5×12 + 5×60 + 5×12 + 5×16 = **500 カテゴリ単位** のキーワードセット

---

## 7. サンプル実行プロンプト（セル #1: zodiac × embodied_pattern）

以下はそのままコピペで Deep Research に貼れる完全形のサンプル（改訂版）。

````markdown
# Deep Research タスク: COCOSiL 観察軸データ Step 1 本文調査

## 対象
- 体系: 12星座（zodiac）
- 観察軸: 身体・気質パターン（embodied_pattern）

## 軸の定義（このプロンプト実行中、絶対に変更しないこと）
体質・気質・行動テンポ・エネルギー水準など、身体性に根ざした個人特性

## 軸の識別キーフレーズ（参考。本文の語彙はこれに限らない）
気質, 体質, テンポ, エネルギー, 気力

## あなたの仕事

「12星座」の **12個全てのカテゴリ**（牡羊座, 牡牛座, 双子座, 蟹座, 獅子座, 乙女座, 天秤座, 蠍座, 射手座, 山羊座, 水瓶座, 魚座）について、「身体・気質パターン」の観点で **Markdown 本文の調査レポート** を執筆する。

このレポートは後段で別 LLM パイプラインが構造化 JSON に抽出する。よって以下を厳守する：
- **本文を JSON に圧縮しない**。四体液説などの伝統概念・脆弱性記述・引用を本文中に丁寧に展開する
- 各カテゴリは §「出力フォーマット」の構造を必ず満たす
- 引用源を必ず明記する（書籍/学術記事最低1件）

## 必須遵守事項（違反した本文は採用しない）

### A. 体系の独立性

- 12星座 **以外の体系**（MBTI / 動物 / 六星）の用語・概念を **混入させない**。記述は西洋ホロスコープ体系の古典伝統（古典・近代を含む）に固有のものだけ。

### B. 軸の境界（重要 — NG 例リスト）

「身体・気質パターン」の観点に **絞った特徴**だけ記述する。下記の NG 例は他軸に属するので、本文に書いてはならない：

- ❌「精緻な自己管理ができる」→ ✅ cognitive_style（判断癖・処理特性）へ
- ❌「他者への共感力が高い」→ ✅ relational_mode（対人モード・共感）へ
- ❌「目標達成への執着が強い」→ ✅ motivation_drive（駆動方向・意志）へ
- ❌「内的な葛藤の深さ」→ ✅ emotional_response（情動表出・内的情動）へ
- ❌「人間関係の境界線を引くのが上手」→ ✅ relational_mode（境界・親密圏）へ

他の4軸（感情反応パターン / 認知スタイル / 動機エネルギー / 対人モード）の特徴は別プロンプト実行時に収集する。

### C. ステレオタイプ汚染の防止

- 俗説・大衆向け記事のテンプレ文言（例:「蟹座は家庭的だから尽くす女性」のような決めつけ）を **そのまま引用しない**。古典文献（プトレマイオス『テトラビブロス』、ウィリアム・リリー著の17世紀ホロスコープ古典等）・近現代の体系的解釈書を典拠とする。
- **引用源は各カテゴリ最低2件、うち1件以上は書籍 or 学術記事**。URL のみの web ソースは補助としてのみ使用可。
- 引用は「〔書籍〕著者『書名』出版社, 年, ページ」「〔学術〕著者 (年). タイトル. ジャーナル, 巻号. DOI」の形式で明示する。

### D. COCOSiL 言語設計ルール

- 本文中に以下の禁止語彙を含めない：**占い / 占い師 / 鑑定 / 運勢 / 占星術 / 当たる / 当たった / 霊感 / 霊視**
  - 「西洋ホロスコープ体系の伝統」「古代のホロスコープ古典書」など体系名としての言及は不可避な箇所のみ最小限。気質説明・脆弱性記述の本文には書かない
- ジェンダーステレオタイプ（「○○な女性」「男らしい」「主婦向け」等）を含めない。
- 「腑落ち」「悟り」等の宗教的内輪語も使わない。

### E. ベクトル方向（後段で抽出される判定）

本文中で記述する性質は、後段で以下3値に分類される：
- `positive`: 当該軸で「強く・活発・前向きに発露」する特徴
- `negative`: 当該軸で「弱く・抑制的・脆弱性・典型的不調」を示す特徴
- `neutral`: 軸上の方向性を判定できない、もしくは両義的（流派により評価が分かれる）

#### negative の正直な記述（最重要）

四体液説では各エレメントが過剰になったときの不調を必ず記述している（火の過剰=熱性疾患・短気、土の過剰=憂鬱・停滞、風の過剰=散漫・不安、水の過剰=浮腫・受動性）。LLM のポジティブバイアスでこれが脱落すると、後段で `vector: negative` を持つカテゴリが消滅し、Schema 検証で reject される。

以下を厳守すること：

- 各カテゴリで **「脆弱性・短所・典型的不調」セクションを必ず書く**。空欄・「特になし」は不可
- 古典・主要文献で言及される弱み・脆弱性記述を躊躇なく拾う。**これは批判ではなく、伝統が示す自己理解の重要側面**
- 全カテゴリを positive で埋めるのは伝統解釈への不誠実な要約とみなされる
- neutral は両義的・流派により評価が分かれる特徴に使う

### F. 確信度の所感（5段階ルーブリック）

各カテゴリ末尾の「確信度の所感」は以下のルーブリックで判定する。**観測者の主観や特定流派バイアスを排除し、「西洋ホロスコープ体系の古典伝統」を主語にすること**。

| 段階 | confidence 帯 | 判定基準 |
|---|---|---|
| **中核必須** | 0.90 - 1.00 | 古典文献・複数流派が一致してこのカテゴリを定義する際に必須として挙げる中核特徴 |
| **強く言及** | 0.75 - 0.89 | 主要文献の過半が言及するが、流派により強調度が異なる |
| **標準** | 0.55 - 0.74 | 中堅文献で言及される、または1-2の主要流派が強調する |
| **部分的** | 0.40 - 0.54 | 限定的流派・特定の解釈系統でのみ言及される |
| **少数派解釈** | 0.30 - 0.39 | 一部解釈のみ。採用は慎重に判断 |
| **採用しない** | < 0.30 | 本文に書かない |

## 出力フォーマット（Markdown 本文）

```markdown
# 12星座 × 身体・気質パターン — 観察軸データ調査本文

## メタ情報
- 体系: 12星座（zodiac）
- 観察軸: 身体・気質パターン（embodied_pattern）
- 軸の定義: 体質・気質・行動テンポ・エネルギー水準など、身体性に根ざした個人特性
- 識別キーフレーズ: 気質, 体質, テンポ, エネルギー, 気力
- カテゴリ総数: 12
- 調査実施日: YYYY-MM-DD

## 軸の境界（厳守）
- 含めるもの: 体質・気質・行動テンポ・エネルギー水準など身体性に根ざした特性
- 他軸に逃がすもの: 認知判断 → cognitive_style、感情反応 → emotional_response、対人距離 → relational_mode、動機方向 → motivation_drive

## 各カテゴリの記述

### 牡羊座（category_id: aries）

#### 気質・性向の説明
（150-300字: 四体液説における「火・熱・乾」の典型としての牡羊座の体質・行動テンポ・エネルギー水準を、本軸の観点で記述する）

#### 該当する伝統概念
（100-200字: 黄道12宮の起点としての位置、火のエレメント・活動宮（cardinal）の組み合わせ、伝統的支配星である火星との対応など）

#### 脆弱性・短所・典型的不調
（150-300字: 火の過剰による熱性疾患の傾向、短気・衝動性、息切れ・持久力欠如、頭部の脆弱性など、古典文献に記載される弱みを記述する）

#### 引用源
1. 〔書籍〕プトレマイオス『テトラビブロス』訳, 出版社, 年, 該当ページ
2. 〔書籍〕ウィリアム・リリー著 17世紀ホロスコープ古典 訳, 出版社, 年, 該当ページ（書名は実書誌に置換）
3. 〔web〕（補足のみ）URL: ...

#### 確信度の所感
火・活動宮・火星支配の組み合わせは古典から現代に至るまで一致して挙げられる中核特徴 → **中核必須（0.90-1.00）**

---

### 牡牛座（category_id: taurus）
... 同じ構造で残り11カテゴリを記述 ...
```

**JSON を出力しないこと**。Markdown 本文のみを出力する。JSON 化は後段の Step 2 が担う。
````

---

## 8. レビュー観点（えんまさが Deep Research 出力 Markdown を受け取った後）

本セクションは **Step 1 出力 Markdown 本文のレビュー** 専用。JSON のレビューは Step 3-4 のパイプラインが自動実行する。

| # | チェック項目 | NG時の対応 |
|---|---|---|
| 1 | カテゴリ件数が正しい（zodiac=12 / animal=60 / rokusei=12 / mbti=16） | 不足分を追加プロンプトで補完 |
| 2 | 各カテゴリに「気質・性向の説明」「該当する伝統概念」「脆弱性・短所・典型的不調」「引用源」「確信度の所感」の5セクションが揃っている | 欠落セクションを追記要求 |
| 3 | **「脆弱性・短所・典型的不調」が空欄・「特になし」のカテゴリがない**（negative 不出現の最大要因） | 該当カテゴリを再生成。古典文献での弱み記述を要求 |
| 4 | 引用源が各カテゴリ最低2件、うち1件以上は書籍/学術 | URL のみの場合は文献を追加調査 |
| 5 | 禁止語彙が本文中の気質説明・脆弱性記述に混入していない | 該当語を削除して再生成 |
| 6 | 体系の独立性（他体系の用語混入なし） | 該当箇所を削除 |
| 7 | 軸境界の遵守（§5.1 NG 例リストの混入なし） | 該当記述を当該軸へ逃がす指示で再生成 |
| 8 | ジェンダーステレオタイプ・俗説テンプレ句の混入なし | 該当記述を中立的表現に置換 |
| 9 | 日本語の自然さ（「弛緩 of サイクル」等の崩れ無し） | 該当箇所を再生成 |
| 10 | 確信度の所感が5段階ルーブリックに沿って書かれている（全カテゴリが「中核必須」だけになっていないか） | ルーブリック再提示して再生成 |

レビュー通過後、Markdown ファイルを `scripts/build-observation-tree/inputs/{system}-{axis}.md` に保存（gitignore せず履歴保持）。

---

## 9. 次のステップ（Step 2 以降はパイプライン自動化）

Step 1 通過後は、`docs/output/F3/observation-tree-pipeline.md` §3 の5段パイプラインが以降を担当する：

- **Step 2**: 本文 → JSON 抽出（Claude API + `generateObject()`、`source_method: "deep-research-pipeline"`）
- **Step 3**: Zod スキーマ検証（`lib/constitution/observation-tree-schema.ts`）
- **Step 4**: Critique LLM（軸純度・本文-JSON 落差・negative 見落としの意味検証）
- **Step 5**: えんまさサンプリング → `lib/data/observation-tree/{system}/{axis}.json` commit（Layer 2 Gate 2）

実行コマンド（Phase 3 で実装予定）：

```bash
pnpm build:observation-tree --system zodiac --axis embodied_pattern
```

---

*本書は Goal `docs/output/goals/f3-keyword-tree-integration.md` および `docs/output/F3/observation-tree-pipeline.md` §6 に基づく Step 1 専用テンプレート。旧 JSON 直接出力版は 2026-05-27 に本改訂で置換された。*
