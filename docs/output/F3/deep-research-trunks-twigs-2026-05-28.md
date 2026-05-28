---
doc_id: canonical.cocosil.features.f3-1.deep-research-trunks-twigs
title: F3.1 4体系統合「幹と枝」モデル — Deep Research プロンプト v2
doc_type: spec
product: cocosil
feature_group: F3 統合レポート
features: [F3.1]
layer: canonical
status: draft
proposed_by: hirame
proposed_at: 2026-05-28
as_of: 2026-05-28
audience: [enmasa]
one_line_thesis: 4体系それぞれの伝統的「大分類（幹）」を学術的に確定し、Jung 心理学的対応の現代検証と意味的距離マトリクスのための語彙コーパスを Deep Research で収集する。
related_discussions:
  - docs/discussions/議論ログ_4体系統合メソッド幹と枝モデル.md
related_constitution:
  - docs/input/concepts/COCOSiL設計中枢.md §2.3
  - lib/constitution/observation-axes.ts
related_inputs:
  - docs/output/F3/observation-tree-pipeline.md（旧版）
  - docs/output/F3/deep-research-prompt-template.md（旧版）
---

# F3.1 4体系統合「幹と枝」モデル — Deep Research プロンプト v2

> **使い方**: 本書の §3〜§7 を Deep Research ツール（Perplexity Pro / Gemini Deep Research / GPT Deep Research 等）にそのまま貼り付けて実行する。出力は **Markdown 本文**（学術引用・伝統的解釈を含む長文）とし、`scripts/build-observation-tree-v2/inputs/trunks-survey.md` 等に保存する。

## 1. 背景（このプロンプトを生んだ意思決定）

現行 F3.1 設計（観察軸5軸 × 4体系 = 20セルマトリクス）は **Procrustean Mapping**（軸先行射影）問題を持つ。例えば水瓶座の伝統的特徴語約47語のうち身体・気質に分類されるのは9語のみで、残り 38 語を「embodied_pattern」セルが捨てている。

議論ログ `議論ログ_4体系統合メソッド幹と枝モデル.md`（2026-05-28）により、以下が合意された：

- **マクロのパンチャ哲学（4体系 = 4視点 + 1 統合 = 識）は維持**
- **ミクロの実装を「幹と枝」モデルに変更**：各体系を Trunks（伝統的大分類）+ Twigs（特徴語）に階層化し、Trunks 同士の意味的距離で結合する
- **観察軸5軸は降格**：消去せず「枝のクラスタリング分類タグ」として再利用
- **距離関数は Hybrid**：`α × RuleDistance + (1-α) × EmbeddingDistance`、α = 0.5
- **対応は確率分布**：体系間の幹マッピングは 1:1 でなく N:M

本 Deep Research は新モデル実装に必要な学術エビデンスを収集する。

## 2. 担当と運用

- **データ生成**: えんまさ（Deep Research ツールで §3〜§7 を実行）
- **レビュー**: えんまさ + 必要に応じて象徴体系専門家へ相談
- **commit 先**: `docs/output/F3/observation-tree-pipeline-v2.md`（新版設計書）に反映、`lib/constitution/system-trunks.ts`（新設定数）に翻訳

## 3. Deep Research タスク全体像（5サブクエリ）

以下 5 つのサブクエリを順に実行する。各サブクエリは独立した Deep Research セッションとして実行することを推奨する（コンテキスト爆発防止）。

| # | サブクエリ | 出力先（推奨） |
|---|---|---|
| **Q1** | 各体系の Trunks（伝統的大分類）の文献レベル確定 | `inputs/q1-trunks-by-system.md` |
| **Q2** | Jung『心理学的類型』(1921) における体系間象徴対応の現代検証 | `inputs/q2-jung-correspondence-modern.md` |
| **Q3** | 4 体系の Trunks 特徴語彙コーパス（embedding 用） | `inputs/q3-trunks-vocabulary-corpus.md` |
| **Q4** | Trunks 間 N:M 確率対応の既存研究 | `inputs/q4-probabilistic-mapping-research.md` |
| **Q5** | 観察軸5軸（embodied/emotional/cognitive/motivation/relational）を「枝の分類タグ」として運用する先行事例 | `inputs/q5-axes-as-tags-precedents.md` |

---

## 4. Q1: 各体系の Trunks（伝統的大分類）の文献レベル確定

### 4.1 タスク

4 体系（12 星座 / MBTI / 動物 60 キャラ / 六星占術）それぞれについて、**伝統文献で「大分類」として機能している階層構造**を学術的に同定する。各体系の Trunks 候補を 2〜3 案出し、それぞれの出典・採用根拠・縮約方法（4 への揃え方）を Markdown 本文で論じる。

### 4.2 必須出力構造

```markdown
# Q1 Trunks Survey — 4体系の伝統的大分類

## 1. 12星座（zodiac）

### 1.1 候補 A: 4エレメント（火・土・風・水）
- 出典: Ptolemy *Tetrabiblos* I.11 (c. 2nd century CE), Lilly *Christian Astrology* (1647) Ch. III
- 各エレメントの代表星座と中核特性（150-300字）
- 採用根拠: 古典占星医学・気質論との結合度
- 縮約方法: 既に 4。そのまま使える

### 1.2 候補 B: 4エレメント × 3クオリティ = 12 cardinal/fixed/mutable
- 出典: 同上 + 中世占星術の活動宮/固定宮/柔軟宮論
- 4 への縮約方法: クオリティを「修飾子」として落とすか、エレメントを保持

### 1.3 候補 C: その他（惑星支配・季節区分など）
（あれば提示）

### 1.4 推奨採用
（候補 A/B/C のどれを採るかと理由）

## 2. MBTI

### 2.1 候補 A: Keirsey 4 気質（NF/NT/SP/SJ）
- 出典: Keirsey *Please Understand Me II* (1998), Bates & Keirsey 1978
- 4 気質の中核特性（各 150-300字）
- 採用根拠: 心理学的類型論との接続、商業心理測定の標準

### 2.2 候補 B: Jung 認知機能ペア（Ni-Se / Ne-Si / Ti-Fe / Te-Fi）
- 出典: Jung *Psychological Types* (1921), Beebe *Energies and Patterns* (2017)
- 採用根拠: 元祖タイポロジー、Jung 直系
- 4 への縮約: ペアで 4

### 2.3 推奨採用

## 3. 動物 60 キャラ

### 3.1 候補 A: 3 大思考（人思考/城思考/大物思考）
- 出典: 細木数子・能見正比古以降の派生資料
- 各思考の中核特性
- 4 への拡張方法（例: + 全体志向）

### 3.2 候補 B: 12 動物グループ
### 3.3 候補 C: 十二支由来の五行分類
### 3.4 推奨採用

## 4. 六星占術

### 4.1 候補 A: 五行（木火土金水）
- 出典: 細木数子『六星占術』源流の四柱推命・陰陽五行思想
- 4 への縮約方法（水を金/木に統合 etc.）

### 4.2 候補 B: 6 星人（土星人/金星人/火星人/天王星人/木星人/水星人）
- 採用根拠と 4 への縮約方法

### 4.3 推奨採用

## 5. 4 体系の Trunks 採用提案まとめ
- 12 星座 = [採用]
- MBTI = [採用]
- 動物 60 = [採用]
- 六星占術 = [採用]
- 各体系の Trunks 数の揃え方（全て 4 / 各体系の自然な数）
```

### 4.3 必須遵守

- 各候補に **最低 2 件の学術引用**（書籍 or 査読論文、ページ番号付き）
- 「最近のネット記事」は二次資料として扱い、一次資料を優先
- COCOSiL 禁止語彙（占い / 占い師 / 鑑定 / 運勢 / 占星術 / 当たる / 当たった / 霊感 / 霊視）は本文中に含めない（体系名としての「西洋占星術」「六星占術」は不可避な場合のみ最小限）

---

## 5. Q2: Jung『心理学的類型』(1921) における体系間象徴対応の現代検証

### 5.1 タスク

Jung が『心理学的類型』及び『元型と集合的無意識』で示唆した **4 体系間の象徴的対応関係** を学術的に整理し、**現代心理学・NLP 研究での検証状況** を網羅する。特に「Water ↔ SP（Artisans）の弱い相関（cosine = 0.42）」をどう説明・修正するかに焦点を当てる。

### 5.2 必須出力構造

```markdown
# Q2 Jung Correspondence — Modern Verification

## 1. Jung の象徴対応表（原典再構成）
- Fire ↔ Intuition (N)
- Air ↔ Thinking (T) ?
- Water ↔ Feeling (F)
- Earth ↔ Sensation (S)
（実際の Jung の言説と各研究者の解釈の差異を明示）

## 2. Keirsey による拡張対応（4気質と4元素）
- Fire ↔ NT (Rationals) — 出典と論拠
- Air ↔ NF (Idealists)
- Water ↔ SP (Artisans)
- Earth ↔ SJ (Guardians)

## 3. 現代検証研究のレビュー
### 3.1 NLP/embedding 系
- 西園寺 et al. "Semantic Alignment of Astrological Lexicons via BERT Embeddings"
- McLaughlin (2020) 等の関連研究
- cosine similarity 実測値の傾向

### 3.2 心理測定系
- MBTI-占星術相関の実証研究（あれば）
- Big Five と占星術エレメントの対応研究

## 4. Water ↔ SP 問題の再検討
- なぜ弱い相関か（仮説）
  - 仮説1: SP（感覚機能優位）は「水」より「土+火」のハイブリッド
  - 仮説2: Water は「Feeling」と対応する方が自然（NF ではなく SF/NF 双方？）
- 修正案 A: Water ↔ NF（Idealists）+ Earth ↔ SJ + Fire ↔ NT + Air ↔ SP
- 修正案 B: 1:1 を諦め、確率分布として扱う
- 推奨修正

## 5. 4 体系（占星術・MBTI・動物・六星）×4 行列の理論的対応
| 元素 | MBTI気質 | 動物大思考 | 六星五行 |
|---|---|---|---|
| Fire | NT | ? | 火 |
| Air | NF (NT?) | ? | 木 (? 風はない) |
| Water | SP (NF?) | ? | 水 |
| Earth | SJ | ? | 土 |
（動物大思考と六星五行の対応列を埋める）

## 6. 推奨対応行列（確定版）
（議論を踏まえ、本研究の現時点での推奨対応を明示）
```

### 5.3 必須遵守

- Jung の原典（Collected Works 第6巻 *Psychological Types*）を **直接参照**
- Keirsey, Beebe, Liz Greene の現代解釈を比較
- BERT/NLP 研究は arXiv 等から検索

---

## 6. Q3: 4 体系の Trunks 特徴語彙コーパス（embedding 用）

### 6.1 タスク

Q1 で確定した各体系の Trunks（各体系 4 個 × 4 体系 = **16 Trunks**）について、それぞれ **特徴語 15-25 語の語彙コーパス** を学術文献から抽出する。これは Embedding 計算（cosine similarity）の元データになる。

### 6.2 必須出力構造

```markdown
# Q3 Trunks Vocabulary Corpus

## 1. 12星座（zodiac）の 4 Trunks

### 1.1 Fire（牡羊・獅子・射手）
**特徴語コーパス（15-25語）**:
- 熱量 / 瞬発力 / 短期集中 / 発火点 / 急性反応 / 拡散的動作 / 大筋群 / 高い基礎代謝 / 屋外耐性 / 心臓系拍動 / ...
**出典**: Ptolemy *Tetrabiblos*, Lilly *Christian Astrology*, Hand *Horoscope Symbols*

### 1.2 Earth（牡牛・乙女・山羊）
**特徴語コーパス**: ...
**出典**: ...

### 1.3 Air（双子・天秤・水瓶）
### 1.4 Water（蟹・蠍・魚）

## 2. MBTI の 4 Trunks

### 2.1 NT (Rationals)
**特徴語コーパス**: 戦略的思考 / 体系構築 / 概念抽象化 / 効率追求 / 論理整合 / ...
**出典**: Keirsey *Please Understand Me II*, Tieger *Do What You Are*

### 2.2 NF (Idealists) / 2.3 SP (Artisans) / 2.4 SJ (Guardians)

## 3. 動物 60 の 4 Trunks
（Q1 で採用した Trunks に従う）

## 4. 六星占術の 4 Trunks
（Q1 で採用した Trunks に従う）

## 5. 語彙の重複・矛盾分析
- 体系間で同一語彙が現れる箇所（例: Fire / NT / 火 全てに「論理」が現れるか？）
- これは embedding cosine sim の高さに直結する
```

### 6.3 必須遵守

- 各 Trunk **最低 15 語、最大 25 語**
- 語彙は **20文字以内の名詞句または形容句**
- ジェンダーステレオタイプ・宗教用語・スピリチュアル用語の混入禁止
- 出典は各 Trunk 最低 2 件の書籍/学術記事

---

## 7. Q4: Trunks 間 N:M 確率対応の既存研究

### 7.1 タスク

Trunks 同士の対応を **確率分布**（1:1 ではなく重み付き多対多）として扱う先行研究を網羅する。これは距離関数の Rule-based 行列を組む際の基礎データになる。

### 7.2 必須出力構造

```markdown
# Q4 Probabilistic Mapping Research

## 1. ontology alignment 系 NLP 研究
- 体系間の概念対応を確率分布として扱う手法
- Wikidata / DBpedia の ontology alignment 事例
- 知識グラフ統合における soft alignment

## 2. 心理測定における多対多対応
- Big Five × MBTI の重複説明力研究
- HEXACO × MBTI 等

## 3. 占星術 × 心理学類型の多対多対応
- Liz Greene『The Astrology of Fate』の象徴重ね合わせ手法
- Jungian astrology の元型 × 惑星の N:M 対応

## 4. 距離関数 α パラメータの先行知見
- Rule + Embedding の重み付き和を採る既存手法
- α = 0.5 の妥当性検証

## 5. 推奨される N:M 対応行列のテンプレート
（4 体系 × 各 4 Trunks = 16 ノード間の確率対応行列の初版）
```

---

## 8. Q5: 観察軸5軸を「枝の分類タグ」として運用する先行事例

### 8.1 タスク

現行の観察軸5軸（embodied_pattern / emotional_response / cognitive_style / motivation_drive / relational_mode）を **枝の分類タグ**（=Trunks ではなく Twigs を分類するメタデータ）として運用する設計の妥当性と、類似先行事例を網羅する。

### 8.2 必須出力構造

```markdown
# Q5 Axes-as-Tags Precedents

## 1. ontology 設計における tag vs hierarchy
- Folksonomy / Tag clouds vs Taxonomy
- 多軸タグ（faceted classification）の事例

## 2. 性格心理学における分類軸の階層化
- Big Five を Trunks に、その下に situation-specific traits を Twigs に置く設計

## 3. パンチャ構造（5蘊）の「枝の分類タグ」運用例
- 仏教・ヒンドゥー哲学における五蘊の運用法
- 色受想行識をミクロな分類タグとして使う実装例

## 4. 推奨設計
- 5 軸を枝の分類タグとして使う際の具体実装案
- 枝が複数軸に跨る場合の扱い（multi-tag 許容 vs 主軸選択）
```

---

## 9. 全 5 サブクエリ共通の必須遵守事項

### A. COCOSiL 言語設計ルール（最重要）

- 本文中の以下の語彙の使用を禁止：**占い / 占い師 / 鑑定 / 運勢 / 占星術 / 当たる / 当たった / 霊感 / 霊視**
  - 体系名として不可避な場合（「西洋占星術の伝統」等）は最小限に
- 「腑落ち」「悟り」等の宗教的内輪語も避ける
- ジェンダーステレオタイプ（「○○な女性」「男らしい」等）含めない

### B. 引用源の真正性

- **架空の書名・著者・出版年は禁止**
- 各セクション最低 2 件の **書籍 or 査読論文** 引用必須
- URL のみの web ソースは補助としてのみ可（一次資料優先）
- 引用形式: 「〔書籍〕著者『書名』出版社, 年, ページ」「〔学術〕著者 (年). タイトル. ジャーナル, 巻号, ページ. DOI」

### C. 出力形式

- 各サブクエリ 1 つの Markdown ファイルとして出力
- ファイル冒頭にメタ情報（クエリID / 実施日 / 主要参照文献リスト）
- セクションは必須出力構造のとおり

### D. negative 記述の正直さ

- 「対応が弱い」「現代検証で否定された」等のネガティブ知見も **正直に記述**
- Jung 対応の Water ↔ SP 問題のように、伝統解釈が現代で批判されている箇所は明示
- COCOSiL は「根拠のある性格分析プロダクト」であり、伝統への盲従ではなく検証可能な統合を目指す

---

## 10. 期待される全体的成果物

5 サブクエリ完了時に手元に揃うべきデータ：

1. **16 Trunks の確定リスト**（Q1）
2. **Trunks 間理論的対応行列**（Q2 推奨対応 + Q4 確率分布）
3. **各 Trunk の特徴語コーパス 15-25 語 × 16**（Q3）
4. **観察軸5軸の Twigs タグ運用設計案**（Q5）

これらは新パイプライン v2 の Step 1 入力データとなり、`scripts/build-observation-tree-v2/` で 16 Trunks × 4 trunks-per-system = 16 Trunks のキーワードツリー構築 + 距離行列計算 + 統合に進む。

## 11. 次のステップ（本 Deep Research 完了後）

1. **設計書の改訂**: `docs/output/F3/observation-tree-pipeline.md` v2 を作成。Trunks/Twigs モデル、観察軸の降格、距離関数を反映
2. **Constitution-as-Code 更新**: `lib/constitution/system-trunks.ts`（新設）に 16 Trunks の定数を翻訳
3. **新パイプライン実装**: `scripts/build-observation-tree-v2/` 配下に Trunks 確定 + 距離行列 + 統合の 3 段階パイプライン
4. **既存実装の処遇**: `scripts/build-observation-tree/` は v1 として保持、PR #62 は「歴史的成果（軸先行マトリクス試作）」として merge

---

## 12. クエリ実行コマンドテンプレート

### Q1 を実行する場合（コピペ用）

````
# Deep Research タスク: COCOSiL 4 体系の Trunks（伝統的大分類）確定

下記の指示に従い、Markdown 本文の調査レポートを執筆してください。

## 対象 4 体系
1. 12星座（zodiac）
2. MBTI
3. 動物 60 キャラ
4. 六星占術

## 各体系について調査する内容
- 伝統文献で「大分類」として機能している階層構造（候補 2-3 案）
- 各候補の出典・採用根拠・縮約方法（4 への揃え方）

## 出力構造
[§4.2 の出力構造をここに展開]

## 必須遵守
[§9 全項目をここに展開]
````

Q2〜Q5 も同じパターンで §5.2 / §6.2 / §7.2 / §8.2 を展開して実行する。

---

*本書は議論ログ `docs/discussions/議論ログ_4体系統合メソッド幹と枝モデル.md`（2026-05-28）の成果物。Deep Research で 5 サブクエリを順に実行し、新パイプライン v2 設計の学術基盤を構築する。*
