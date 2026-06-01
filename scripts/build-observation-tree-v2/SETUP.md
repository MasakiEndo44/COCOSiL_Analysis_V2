# F3.1 観察軸ツリーパイプライン v2 — セットアップと実走手順

> パイプライン本体: [pipeline.ts](pipeline.ts)
> 設計根拠: [docs/output/F3/observation-tree-pipeline.md](../../docs/output/F3/observation-tree-pipeline.md)
> v1 との差分は AGENTS.md / 本リポジトリの差分コミット履歴を参照。

---

## 1. v1 との差分 (要約)

| 項目 | v1 | v2 |
|---|---|---|
| 認証 | VERCEL_OIDC_TOKEN / AI_GATEWAY_API_KEY | 同上 + `DRY_RUN=1` でモック経路 |
| Step 数 | 4 (extract / validate / critique) | 5 (load / extract / schema / critique / human) |
| Critique | LLM のみ | 決定論 (禁止語 + twigs ホワイトリスト) → LLM の 2 段 |
| 語彙コーパス | 未参照 | twigs 884 語をプロンプトに正解集合として注入 |
| 階層別 α | プロンプト外 | Constitution から取得して注入 |
| Layer 3 modulator | プロンプト外 | Constitution から取得して注入 |
| Mock 経路 | なし | `DRY_RUN=1` で twigs から実在語ベースの ObservationTreeData を生成 |

---

## 2. 初回セットアップ

v1 と同じ手順で OK。`scripts/build-observation-tree/SETUP.md` を参照のうえ、
`vercel link` / `vercel env pull .env.local` で `.env.local` に `VERCEL_OIDC_TOKEN`
を入れる。

---

## 3. 実走

### 3.1 dry-run (オフライン検証)

```bash
DRY_RUN=1 pnpm build:observation-tree-v2 --system zodiac --axis embodied_pattern
```

出力:
- `outputs/zodiac-embodied_pattern.json`
- `logs/zodiac-embodied_pattern-<ISO>.log`

LLM を呼ばずに twigs から構成した正当な ObservationTreeData が schema/critique を
通貫することを確認する。CI でもこの経路で実行可能。

### 3.2 本走 (LLM 経由)

```bash
pnpm build:observation-tree-v2 --system zodiac --axis embodied_pattern
```

`inputs/zodiac-embodied_pattern.md` に Deep Research の本文 (5000-10000 字) を
配置してから実行する。本走時は AI Gateway の課金が発生する。

---

## 4. CLI 引数

```
--system   zodiac | animal | mbti | rokusei
--axis     embodied_pattern | emotional_response | cognitive_style | motivation_drive | relational_mode
```

軸 ID は `lib/constitution/observation-axes.ts` の OBSERVATION_AXIS_IDS と一致。

---

## 5. 入力ファイル命名規則

`inputs/{system}-{axis}.md`

例:
- `inputs/zodiac-embodied_pattern.md`
- `inputs/animal-cognitive_style.md`
- `inputs/mbti-motivation_drive.md`
- `inputs/rokusei-relational_mode.md`

体系 × 軸 = 4 × 5 = 20 ファイル分の Deep Research が本走の前提。
DR スナップショット原本 (Q1-Q5) は `inputs/q1-*.md` ... `inputs/q5-*.md` として参照用に格納されている。
