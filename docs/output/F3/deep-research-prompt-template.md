---
doc_id: canonical.cocosil.features.f3-1.deep-research-template
title: F3.1 4体系キーワードツリーデータ収集 — Deep Research プロンプト雛形
doc_type: spec
product: cocosil
feature_group: F3 統合レポート
features: [F3.1]
layer: canonical
status: draft
proposed_by: hirame
proposed_at: 2026-05-26
as_of: 2026-05-26
audience: [enmasa]
one_line_thesis: F3.1 観察軸5軸×4体系=20セルのキーワードデータを Deep Research で収集するための共通プロンプト雛形と、20セルの取り組みチェック表。
related_constitution:
  - lib/constitution/observation-axes.ts
  - lib/constitution/banned-words.ts
related_discussions:
  - docs/discussions/20260527_議論ログ_F3-1観察軸5軸確定.md
  - docs/discussions/20260527_議論ログ_F3-1キーワードツリー4体系統合アルゴリズム.md
related_goals:
  - docs/output/goals/f3-keyword-tree-integration.md
---

# F3.1 4体系キーワードツリーデータ収集 — Deep Research プロンプト雛形

> **使い方**: 本書の §4 共通テンプレートを Deep Research ツール（Perplexity Pro / Gemini Deep Research / GPT Deep Research 等）に貼り付け、`{{plchldr}}` 部分を §6 のチェック表から1セルずつ置換して実行する。出力 JSON は `lib/data/observation-tree/{system}/{axis}.json` に保存する。

## 1. 目的

F3.1 レポート生成エンジンの中間表現「Tree of 4, Harvest 1.」を成立させるため、**4体系（zodiac / animal / rokusei / mbti）× 5観察軸 = 20セル分** のキーワードツリーデータを収集する。各セルには **その体系の全カテゴリ（12星座等）× 当該観察軸での特徴語5-10語＋ベクトル方向＋確信度** が含まれる。

## 2. 担当と運用

- **データ生成**: えんまさ（Deep Research ツールで本雛形を実行）
- **レビュー**: えんまさ（汚染チェック・必要時に象徴体系専門家へ相談）
- **commit**: `lib/data/observation-tree/` 配下に追加（Layer 2 Gate 2 対象）

## 3. 出力 JSON フォーマット（TypeScript 型に流し込める形）

```json
{
  "system": "zodiac",
  "axis": "embodied_pattern",
  "generated_at": "2026-05-26",
  "source_method": "deep-research",
  "categories": [
    {
      "category_id": "aries",
      "category_label_ja": "牡羊座",
      "features": ["熱量が高い", "瞬発力", "短期集中", "回復が早い", "発火点が低い"],
      "vector": "positive",
      "confidence": 0.85,
      "primary_sources": [
        "https://example.com/article-1",
        "書籍タイトル, 著者, 出版年, ページ"
      ]
    }
    // ... 全カテゴリ分（12 or 60 or 12 or 16）
  ],
  "axis_definition_used": "体質・気質・行動テンポ・エネルギー水準など、身体性に根ざした個人特性",
  "observation_keywords_used": ["気質", "体質", "テンポ", "エネルギー", "気力"]
}
```

| フィールド | 必須 | 説明 |
|---|---|---|
| `system` | ✅ | `zodiac` / `animal` / `rokusei` / `mbti` のいずれか |
| `axis` | ✅ | 5軸のID（`embodied_pattern` 等） |
| `categories[].features` | ✅ | **5-10語**。当該軸の特徴を表す短い名詞句・形容句 |
| `categories[].vector` | ✅ | `positive` / `negative` / `neutral`（軸上の方向性）|
| `categories[].confidence` | ✅ | 0-1。その体系の伝統で「強く言われる特徴か」 |
| `categories[].primary_sources` | ✅ | **最低2件**。URL or 書籍参照（ステレオタイプ防止） |

## 4. 共通プロンプトテンプレート

以下を Deep Research ツールに貼り付け、`{{plchldr}}` を §6 から置換して実行する。

````markdown
# Deep Research タスク: COCOSiL観察軸キーワード収集

## 対象
- 体系: {{system_name_ja}}（{{system_id}}）
- 観察軸: {{axis_label_ja}}（{{axis_id}}）

## 軸の定義（このプロンプト実行中、絶対に変更しないこと）
{{axis_definition}}

## 軸の識別キーフレーズ（参考。出力語彙はこれに限らない）
{{observation_keywords}}

## あなたの仕事
「{{system_name_ja}}」の **{{categories_count}} 個全てのカテゴリ**（{{categories_list_ja}}）について、「{{axis_label_ja}}」の観点で **特徴語5-10語＋ベクトル＋確信度＋引用ソース** を JSON 形式で出力する。

## 必須遵守事項（違反した出力は採用しない）

### A. 体系の独立性
- {{system_name_ja}} **以外の体系**（MBTI/星座/動物/六星）の用語・概念を **混入させない**。特徴語は {{system_name_ja}} の伝統に固有のものだけ抽出する。

### B. 軸の境界
- 「{{axis_label_ja}}」の観点に **絞った特徴**だけ抽出する。他の4軸（{{other_axes_label_ja}}）の特徴は別のプロンプト実行時に収集するので、ここには含めない。

### C. ステレオタイプ汚染の防止
- 俗説・ネット占い記事のテンプレ文言（例:「{{stereotype_example_for_system}}」のような決めつけ）を **そのまま引用しない**。文献・伝統的解釈を典拠とする。
- **`primary_sources` は各カテゴリ最低2件**。少なくとも1件は書籍 or 学術記事を含めること（URLだけは不可）。

### D. COCOSiL 言語設計ルール
- 以下の禁止語彙を `features` に含めない：**占い / 占い師 / 鑑定 / 運勢 / 占星術 / 当たる / 当たった / 霊感 / 霊視**
- 特徴語は名詞句・形容句で **20文字以内**。説明文ではない。
- ジェンダーステレオタイプ（「○○な女性」「男らしい」等）を含めない。

### E. ベクトルと確信度の判定基準
- `vector`:
  - `positive` = 当該軸で「強く・活発・前向きに発露」する特徴
  - `negative` = 当該軸で「弱く・抑制的・後退方向」の特徴
  - `neutral` = 軸上の方向性を判定できない、もしくは両義的
- `confidence`: その体系の伝統で言及される頻度・強度
  - 0.8-1.0: 当該体系の中核的・必須的特徴
  - 0.5-0.7: よく言及されるが主要ではない
  - 0.3-0.5: 一部の解釈で言及される
  - 0.3未満: 出力しない（除外）

## 出力形式
上記§3の JSON フォーマットに完全準拠。フォーマット違反・コメント混入は採用しない。
````

## 5. プレースホルダ一覧

| プレースホルダ | 入る値の例 |
|---|---|
| `{{system_name_ja}}` | 12星座 / 60動物占い / 六星占術 / MBTI |
| `{{system_id}}` | `zodiac` / `animal` / `rokusei` / `mbti` |
| `{{axis_label_ja}}` | 身体・気質パターン 等 |
| `{{axis_id}}` | `embodied_pattern` 等 |
| `{{axis_definition}}` | `lib/constitution/observation-axes.ts` の `definition` をコピー |
| `{{observation_keywords}}` | 同上 `observation_keywords` |
| `{{categories_count}}` | 12 / 60 / 12 / 16 |
| `{{categories_list_ja}}` | 「牡羊座, 牡牛座, …」など全カテゴリ列挙 |
| `{{other_axes_label_ja}}` | 当該軸以外の4軸の日本語表示名 |
| `{{stereotype_example_for_system}}` | 体系固有の典型的俗説（蟹座なら「家庭的だから尽くす女性」等） |

## 6. 20セル取り組みチェック表

`lib/data/observation-tree/{system}/{axis}.json` として commit すべき20ファイル。

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

## 7. サンプル実行プロンプト（セル #1: zodiac × embodied_pattern）

以下はそのままコピペで Deep Research に貼れる完全形のサンプル。

````markdown
# Deep Research タスク: COCOSiL観察軸キーワード収集

## 対象
- 体系: 12星座（zodiac）
- 観察軸: 身体・気質パターン（embodied_pattern）

## 軸の定義（このプロンプト実行中、絶対に変更しないこと）
体質・気質・行動テンポ・エネルギー水準など、身体性に根ざした個人特性

## 軸の識別キーフレーズ（参考。出力語彙はこれに限らない）
気質, 体質, テンポ, エネルギー, 気力

## あなたの仕事
「12星座」の **12個全てのカテゴリ**（牡羊座, 牡牛座, 双子座, 蟹座, 獅子座, 乙女座, 天秤座, 蠍座, 射手座, 山羊座, 水瓶座, 魚座）について、「身体・気質パターン」の観点で **特徴語5-10語＋ベクトル＋確信度＋引用ソース** を JSON 形式で出力する。

## 必須遵守事項（違反した出力は採用しない）

### A. 体系の独立性
- 12星座 **以外の体系**（MBTI/動物占い/六星占術）の用語・概念を **混入させない**。特徴語は西洋占星術の伝統に固有のものだけ抽出する。

### B. 軸の境界
- 「身体・気質パターン」の観点に **絞った特徴**だけ抽出する。他の4軸（感情反応パターン / 認知スタイル / 動機エネルギー / 対人モード）の特徴は別のプロンプト実行時に収集するので、ここには含めない。

### C. ステレオタイプ汚染の防止
- 俗説・ネット占い記事のテンプレ文言（例:「蟹座は家庭的だから尽くす女性」のような決めつけ）を **そのまま引用しない**。文献・伝統的解釈を典拠とする。
- **`primary_sources` は各カテゴリ最低2件**。少なくとも1件は書籍 or 学術記事を含めること（URLだけは不可）。

### D. COCOSiL 言語設計ルール
- 以下の禁止語彙を `features` に含めない：**占い / 占い師 / 鑑定 / 運勢 / 占星術 / 当たる / 当たった / 霊感 / 霊視**
- 特徴語は名詞句・形容句で **20文字以内**。説明文ではない。
- ジェンダーステレオタイプ（「○○な女性」「男らしい」等）を含めない。

### E. ベクトルと確信度の判定基準
- `vector`: `positive` / `negative` / `neutral`
- `confidence`: 0.3-1.0（0.3未満は除外）

## 出力形式
```json
{
  "system": "zodiac",
  "axis": "embodied_pattern",
  "generated_at": "YYYY-MM-DD",
  "source_method": "deep-research",
  "categories": [
    {
      "category_id": "aries",
      "category_label_ja": "牡羊座",
      "features": ["特徴語1", "特徴語2", "..."],
      "vector": "positive",
      "confidence": 0.85,
      "primary_sources": ["...", "..."]
    }
    // 残り11カテゴリ
  ],
  "axis_definition_used": "体質・気質・行動テンポ・エネルギー水準など、身体性に根ざした個人特性",
  "observation_keywords_used": ["気質", "体質", "テンポ", "エネルギー", "気力"]
}
```

JSON のみを出力。コメント・解説・前後の地の文は不要。
````

## 8. レビュー観点（えんまさが Deep Research 出力を受け取った後）

| # | チェック項目 | NG時の対応 |
|---|---|---|
| 1 | `categories` の件数が正しい（zodiac=12 / animal=60 / rokusei=12 / mbti=16） | 不足カテゴリを追加プロンプトで補完 |
| 2 | 各 `features` が5-10語の範囲内 | 多すぎ→主要なものに絞る / 少なすぎ→再実行 |
| 3 | 禁止語彙の混入なし（自動: `pnpm vitest run` 関連テスト追加予定） | 該当語を削除して再生成 |
| 4 | `primary_sources` が各カテゴリ最低2件、うち1件は書籍/学術 | URL のみの場合は文献を追加調査 |
| 5 | 体系の独立性（他体系の用語混入なし） | 該当 feature を削除 |
| 6 | ステレオタイプ典型句の混入なし（「家庭的な女性」等） | 該当 feature を中立的表現に置換 |
| 7 | `vector` 判定が定義（軸上の方向性）と整合 | 再判定 |

## 9. 次のステップ

- 本雛形 commit 後、えんまさが §6 のチェック表に従って20セルを順次実行
- 出力された JSON は `lib/data/observation-tree/{system}/{axis}.json` として commit（Layer 2 Gate 2）
- 全20セル揃った時点で、ヒラメが `lib/diagnostics/integration/` のツリー構築ロジック実装に着手（Phase 1 W2 想定）

---

*本書は Goal `docs/output/goals/f3-keyword-tree-integration.md` の「次のアクション 2」の成果物。*
