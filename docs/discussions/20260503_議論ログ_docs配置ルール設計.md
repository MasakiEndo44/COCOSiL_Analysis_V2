# 議論ログ：docs/README.md 設計（ドキュメント配置ルール）

## 登場人物

- 🧑‍🏗️ **高橋 誠**（情報アーキテクト）：コンテンツ管理・ドキュメント構造設計歴10年。「ファイル置き場のルールが曖昧なプロジェクトは必ず崩壊する」という持論を持つ。
- 👩‍💻 **鈴木 彩**（LLMエージェント向けドキュメントエンジニア）：Claude Code等のAIコーディングエージェント向けコンテキスト設計歴3年。「AIが迷わずナビゲートできるドキュメント構造」の設計が専門。
- 💅 **みさき**（ギャル）：えんまさから「docs見て」と言われたとき迷子になった経験がある、COCOSiLの周辺メンバー兼実際のユーザー。

---

## Turn 1｜現状診断：2つの分類軸が混在している

**高橋：** 現状のdocs/の構造を観察すると、2つの異なる分類軸が整理されないまま混在しています：
- **軸A：流れの方向（input vs output）** → input/とoutput/の分離
- **軸B：ドキュメントの性格（ハーネス・議論・成果物）** → harness/・discussions/

これが「新しいファイルを追加するたびに置き場所を迷う」という症状を引き起こしています。

**鈴木：** discussions/の位置が根本的に曖昧です。議論ログはinputでもoutputでもない——「人間とAIが協力したプロセスの記録」です。この曖昧さが output/expert_logs/ という「逃げ場」を生み出している。

**診断：** 「3つ目の軸（process）が設計されていない」問題。input/outputの2軸モデルに、processというカテゴリが収まりきっていない。

**みさき：** え待って、つまり今のdocs/って「インプット」「アウトプット」と「途中の作業記録」が全部ごっちゃになってる、ってことですか？昔Googleドライブで「参考資料」「作ったもの」「メモ」が全部フォルダ内に混在してて発狂したやつですね〜それ。

---

## Turn 2｜分類軸の整理：3次元で全ディレクトリを仕分ける

**高橋：** ドキュメント管理の3軸：

| 軸 | 選択肢 |
|---|---|
| **フロー方向** | input / output / process |
| **更新頻度** | static / dynamic |
| **主な読者** | human / agent / both |

全ディレクトリの仕分け：

| ディレクトリ | フロー | 読者 | 問題 |
|---|---|---|---|
| input/concepts/ | input | both | — |
| input/requirements_input/ | input | both | — |
| input/setup/ | input | agent | — |
| input/skills_ref/ | input? | **human** | 「参照素材」に近い。AIへの直接渡し不可 |
| harness/ | **独立** | agent | inputでもoutputでもない |
| discussions/ | **process** | human | processカテゴリとして独立すべき |
| output/F1/ | output | both | — |
| output/expert_logs/ | **process** | human | discussions/と重複 |
| output/goals/ | output | both | — |
| output/requirements/ | output | both | — |

修正必要箇所：
- 🔴 discussions/ と output/expert_logs/ の重複 → 統合
- 🔴 harness/ → ルート直下に維持して「特別カテゴリ」を維持
- 🟡 input/skills_ref/ → 「AIに直接渡さない」注記が必要

**みさき：** harness/って確かに「AIへの命令書」みたいなものですよね。inputでもoutputでもなくて「法律」みたいな感じ？ルート直下にあるの、そういう意味だったんだ〜。

---

## Turn 3｜議論ログの統合：discussions/ 一本化

**高橋：** discussions/ と output/expert_logs/ の統合先について、統合一択です。理由：
1. 2箇所あると毎回判断コストが発生
2. 検索コストが2倍になる
3. 現状（8件 vs 1件）が迷いが生じていた証拠

推奨：**output/expert_logs/ を廃止 → discussions/（ルート直下）に統一**

**鈴木：** output/discussions/ に統合するのは正しくありません。議論ログをoutput/に入れると「AIが生成した成果物」と混在します。議論ログは「人間とAIの対話プロセスの記録」であり、「AIが出力した文書」ではない。AIエージェントが参照するときの文脈判断に影響します。

**結論：discussions/はルート直下に維持して、expert_logs/ を廃止・統合が正解。**

**みさき：** expert_logs って名前、マジで最初「誰の専門家ログ？」ってなりましたよ〜。discussions/ の方が「話し合いの記録ね」ってすぐわかりますよね。

**高橋：** みさきさんが迷ったのは命名失敗の証拠。「新規メンバーが1秒で意味を理解できる名前か」はドキュメント設計の合格基準。expert_logs は不合格、discussions は合格。

---

## Turn 4｜README.mdの読者と「判断フロー」の粒度

**鈴木：** docs/README.mdには2種類の設計思想があります：
- **Type A：人間ナビゲーション型** — 新メンバー向けインデックス
- **Type B：AI文脈注入型** — AIエージェントがdocs/構造の意図を理解できる説明書

COCOSiLはAIエージェントを日常活用するスタートアップなので、**両方の役割を1ファイルに持たせる**推奨。節を分けて共存させる。

**高橋：** 「判断フロー」の粒度は慎重に。フローが複雑すぎると逆効果。今のCOCOSiLのdocs/規模（10数ファイル）なら2問ツリーで十分：

```
Q1：人間がAIに渡す素材・インプット？ → input/
Q2：AI（またはAI支援）で生成した成果物？ → output/
それ以外 →
  議論・思考プロセスの記録 → discussions/
  AIハーネス設定 → harness/
```

**鈴木：** input/skills_ref/ への注記も必要。「参照専用・AIに直接渡さない」という1行がないと、AIエージェントがこのディレクトリを参照素材として読み込んでしまう可能性があります。

**みさき：** 「2問で決まる」のめっちゃわかりやすい〜！「AIに渡すか、AIが作ったか」って言われたら一瞬でわかりますね。

---

## Turn 5｜設計原則の確立と docs/README.md の最終構造

**設計3原則：**

**① 3-Category Structure（input / output / process）**
input・output・discussions（process）の3カテゴリを明示。harness/は「AIへの命令書」という特殊カテゴリとして別途説明。

**② Decision-First Writing（判断フローを冒頭に）**
「どこに置けばいいか」に2問以内で答えられる判断ツリーを冒頭に置く。

**③ Dual Audience Design（人間とAIの両方に読める）**
新メンバーが10秒で構造を理解できること、かつAIエージェントが「このdocs/はなぜこの構造か」を読み取れること。

**みさき：** なんか最初「2軸がごっちゃ」ってところから始まって、最終的に「3カテゴリ＋harness独立」のシンプルな構造になったの、めっちゃスッキリした〜！「2問で決まる」を先頭に置くの絶対これが正解ですよね。えんまさが「docs見て」って言ったとき、もうこれさえ読めば迷子にならないと思う〜！

---

## ✅ 議論まとめ

| 項目 | 方針 |
|---|---|
| **カテゴリ構造** | input / output / discussions（process）/ harness の4カテゴリ |
| **discussions/** | ルート直下に維持。output/expert_logs/ を廃止して統合 |
| **harness/** | inputでもoutputでもない独立カテゴリとして維持 |
| **input/skills_ref/** | 「参照専用・AIに直接渡さない」をREADMEで明記 |
| **判断フロー** | 2問ツリーを冒頭に配置 |
| **README読者** | 人間・AIエージェント両方。節を分けて共存 |
| **3原則** | 3-Category Structure / Decision-First Writing / Dual Audience Design |
