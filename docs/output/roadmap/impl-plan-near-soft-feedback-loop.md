---
doc_id: impl-plan.near-soft-feedback-loop
title: NEARフェーズ ソフトフィードバックループ 実装計画
doc_type: impl-plan
status: planned
author: ヒラメ
created_at: 2026-05-03
branch: feature/near-soft-feedback-loop
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#411
related_discussion: docs/discussions/20260504_議論ログ_デジタル生命体移行企画.md
---

# NEARフェーズ ソフトフィードバックループ 実装計画

> **ステータス**: 計画策定済み・実装待ち
> **実装フェーズ**: NEAR（Q3〜Q4 2026）
> **担当**: ヒラメ（バックエンド/APIエンジニア）

> **Autogenesisとの関係**: このプランは Autogenesis Phase B/C の「明示的フィードバック」入力レイヤー。
> `chat_sessions.mbti_resonance` 等の体系別腑落ちスコアは Autogenesis の Evaluate 層への補助シグナルとして使用される。
> 暗黙的行動ログ（`events_telemetry`）は別途 Phase A で実装。両者は競合しない。

---

## 概要

ユーザーのフィードバックスコア（4体系別「腑落ち度」1〜5）をもとに体系別ウェイトをEWMAで動的調整し、次回チャットのシステムプロンプトに注入するパーソナライズ機能。

**設計3原則（要件定義書 §4.11 より）**:
1. **Explicit First, Implicit Later** — NEARフェーズはresonanceスコアのみ。暗黙的シグナルはFUTURE
2. **Bounded Evolution** — ウェイト下限0.15・上限0.55をDBConstraintでコード化
3. **Perceive Before Personalize** — 変化知覚設計をアルゴリズムより先に実装

---

## 作成・変更ファイル一覧

```
supabase/migrations/
  ├── 20260503000001_base_schema.sql          # profiles + chat_sessions（新規）
  └── 20260503000002_personality_weights.sql  # user_personality_weights（新規）

lib/weights/
  ├── types.ts           # WeightRecord / ResonanceScore 型（新規）
  ├── ewma.ts            # EWMAアルゴリズム Pure function（新規）
  └── prompt-inject.ts   # システムプロンプト文字列生成（新規）

app/api/chat/
  └── feedback/
      └── route.ts       # POST /api/chat/feedback（新規）

lib/types/database.ts    # pnpm db:types で再生成（更新）
```

---

## Step 1 — DBマイグレーション

### `supabase/migrations/20260503000001_base_schema.sql`

```sql
-- profiles: Clerk user_id を軸にした基本プロフィール
CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  birth_date    DATE,
  mbti_type     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON profiles
  FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');

-- chat_sessions: resonanceカラムをDay1から持つ（NEARフェーズ前はNULLで蓄積）
CREATE TABLE chat_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               TEXT NOT NULL,  -- Clerk user_id
  session_summary       TEXT,
  emotional_state       VARCHAR(50),
  key_themes            TEXT[],
  -- 満足度（MVPから表示）
  feedback_score        SMALLINT CHECK (feedback_score BETWEEN 1 AND 5),
  -- 体系別腑落ちスコア（NEARフェーズで活性化・MVP段階はNULL）
  mbti_resonance        SMALLINT CHECK (mbti_resonance    BETWEEN 1 AND 5),
  zodiac_resonance      SMALLINT CHECK (zodiac_resonance  BETWEEN 1 AND 5),
  animal_resonance      SMALLINT CHECK (animal_resonance  BETWEEN 1 AND 5),
  rokusei_resonance     SMALLINT CHECK (rokusei_resonance BETWEEN 1 AND 5),
  -- 暗黙的シグナル用（NEARフェーズは蓄積のみ・FUTUREで活用）
  chat_duration_seconds INT,
  topic_query_counts    JSONB,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions" ON chat_sessions
  FOR ALL USING (user_id = auth.jwt() ->> 'sub');
```

### `supabase/migrations/20260503000002_personality_weights.sql`

```sql
-- user_personality_weights: Bounded Evolutionの制約をDBレベルで強制
CREATE TABLE user_personality_weights (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT NOT NULL UNIQUE,  -- Clerk user_id
  mbti_weight    DECIMAL(4,3) DEFAULT 0.250 NOT NULL,
  zodiac_weight  DECIMAL(4,3) DEFAULT 0.250 NOT NULL,
  animal_weight  DECIMAL(4,3) DEFAULT 0.250 NOT NULL,
  rokusei_weight DECIMAL(4,3) DEFAULT 0.250 NOT NULL,
  session_count  INT DEFAULT 0 NOT NULL,
  last_updated   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT weights_sum CHECK (
    mbti_weight + zodiac_weight + animal_weight + rokusei_weight
    BETWEEN 0.990 AND 1.010
  ),
  CONSTRAINT weight_range CHECK (
    mbti_weight   BETWEEN 0.15 AND 0.55 AND
    zodiac_weight BETWEEN 0.15 AND 0.55 AND
    animal_weight BETWEEN 0.15 AND 0.55 AND
    rokusei_weight BETWEEN 0.15 AND 0.55
  )
);

ALTER TABLE user_personality_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weights" ON user_personality_weights
  FOR ALL USING (user_id = auth.jwt() ->> 'sub');
```

> ⚠️ **適用方法**: AGENTS.md Layer 1制約により `supabase db push` はhookでブロックされる。
> Supabase Dashboard の SQL Editor から手動実行すること。

---

## Step 2 — 型定義 `lib/weights/types.ts`

```typescript
export type WeightRecord = {
  mbti_weight:    number  // 0.15 〜 0.55
  zodiac_weight:  number
  animal_weight:  number
  rokusei_weight: number
}

export type ResonanceScore = {
  mbti:    number  // 1 〜 5
  zodiac:  number
  animal:  number
  rokusei: number
}

export const DEFAULT_WEIGHTS: WeightRecord = {
  mbti_weight:    0.25,
  zodiac_weight:  0.25,
  animal_weight:  0.25,
  rokusei_weight: 0.25,
}

export const WEIGHT_CONFIG = {
  ALPHA:      0.25,   // 月次チューニング対象（えんまさが調整）
  MIN_WEIGHT: 0.15,
  MAX_WEIGHT: 0.55,
} as const
```

---

## Step 3 — EWMAアルゴリズム `lib/weights/ewma.ts`

```typescript
import { WeightRecord, ResonanceScore, WEIGHT_CONFIG } from './types'

// Pure function — Supabase依存なし・単体テスト容易
export function updateWeights(
  prev: WeightRecord,
  newScore: ResonanceScore,
): WeightRecord {
  const { ALPHA, MIN_WEIGHT, MAX_WEIGHT } = WEIGHT_CONFIG

  const raw: WeightRecord = {
    mbti_weight:    ALPHA * (newScore.mbti    / 5) + (1 - ALPHA) * prev.mbti_weight,
    zodiac_weight:  ALPHA * (newScore.zodiac  / 5) + (1 - ALPHA) * prev.zodiac_weight,
    animal_weight:  ALPHA * (newScore.animal  / 5) + (1 - ALPHA) * prev.animal_weight,
    rokusei_weight: ALPHA * (newScore.rokusei / 5) + (1 - ALPHA) * prev.rokusei_weight,
  }

  return normalizeWeights(clipWeights(raw, MIN_WEIGHT, MAX_WEIGHT))
}

function clipWeights(w: WeightRecord, min: number, max: number): WeightRecord {
  return {
    mbti_weight:    Math.min(Math.max(w.mbti_weight,    min), max),
    zodiac_weight:  Math.min(Math.max(w.zodiac_weight,  min), max),
    animal_weight:  Math.min(Math.max(w.animal_weight,  min), max),
    rokusei_weight: Math.min(Math.max(w.rokusei_weight, min), max),
  }
}

function normalizeWeights(w: WeightRecord): WeightRecord {
  const total = w.mbti_weight + w.zodiac_weight + w.animal_weight + w.rokusei_weight
  return {
    mbti_weight:    Math.round(w.mbti_weight    / total * 1000) / 1000,
    zodiac_weight:  Math.round(w.zodiac_weight  / total * 1000) / 1000,
    animal_weight:  Math.round(w.animal_weight  / total * 1000) / 1000,
    rokusei_weight: Math.round(w.rokusei_weight / total * 1000) / 1000,
  }
}

// 直近3セッションの単純平均 resonanceを計算（これがEWMAへの入力）
export function averageResonanceScores(scores: ResonanceScore[]): ResonanceScore {
  const n = scores.length
  if (n === 0) return { mbti: 3, zodiac: 3, animal: 3, rokusei: 3 }

  return {
    mbti:    Math.round(scores.reduce((s, r) => s + r.mbti,    0) / n),
    zodiac:  Math.round(scores.reduce((s, r) => s + r.zodiac,  0) / n),
    animal:  Math.round(scores.reduce((s, r) => s + r.animal,  0) / n),
    rokusei: Math.round(scores.reduce((s, r) => s + r.rokusei, 0) / n),
  }
}
```

---

## Step 4 — プロンプト注入ヘルパー `lib/weights/prompt-inject.ts`

```typescript
import { WeightRecord, DEFAULT_WEIGHTS } from './types'

export function formatWeightsForPrompt(weights: WeightRecord = DEFAULT_WEIGHTS): string {
  const toPercent = (v: number) => Math.round(v * 100)

  const sorted = [
    { name: 'MBTI分析',     pct: toPercent(weights.mbti_weight)    },
    { name: '星座分析',     pct: toPercent(weights.zodiac_weight)  },
    { name: '動物性格診断', pct: toPercent(weights.animal_weight)  },
    { name: '六星占術',     pct: toPercent(weights.rokusei_weight) },
  ].sort((a, b) => b.pct - a.pct)

  return [
    '体系別パーソナライズ度（ユーザー学習値）:',
    ...sorted.map(({ name, pct }) => `- ${name}: ${pct}%`),
    '→ ウェイトの高い体系を中心に分析を展開すること。',
    '  ただし全体系を最低1回は言及し、4体系統合の視点を維持すること。',
  ].join('\n')
}
```

---

## Step 5 — フィードバックAPI `app/api/chat/feedback/route.ts`

### インターフェース

```
POST /api/chat/feedback
Authorization: Clerk JWT（必須）

Request:
{
  session_id:        string (UUID)
  mbti_resonance:    number (1〜5)
  zodiac_resonance:  number (1〜5)
  animal_resonance:  number (1〜5)
  rokusei_resonance: number (1〜5)
}

Response 200:
{
  success: true
  weights: WeightRecord
}

Response 400: Zodバリデーションエラー
Response 401: 未認証
Response 500: DB エラー
```

### 処理フロー

```
1. Clerk auth → userId 取得（未認証は401）
2. Zod v4 バリデーション（不正入力は400）
3. chat_sessions に resonanceスコアを UPDATE
4. 同ユーザーの直近3セッション（resonance有り）を SELECT
5. averageResonanceScores() → updateWeights() で新ウェイト計算
6. user_personality_weights を UPSERT
7. 新ウェイトを返す
```

---

## Step 6 — 型生成

```bash
# マイグレーション手動適用後に実行
pnpm db:types
```

`chat_sessions`・`user_personality_weights` の型が `lib/types/database.ts` に自動追加される。

---

## 依存関係グラフ

```
[Migration 001: base_schema]
        ↓
[Migration 002: personality_weights]
        ↓
[pnpm db:types → database.ts 再生成]
        ↓
[lib/weights/types.ts]
        ↓
[lib/weights/ewma.ts]          [lib/weights/prompt-inject.ts]
        ↓                               ↓
[app/api/chat/feedback/route.ts]   (チャットAPI統合・別PR)
```

---

## 未解決事項（実装開始前に確認）

| # | 事項 | 内容 | 確認先 |
|---|------|------|--------|
| 1 | `utils/supabase/server.ts` | SSR用Supabaseクライアントが未存在。`server.ts` を作成するか別PRに切り出すか | ヒラメ判断 |
| 2 | `pnpm db:types` 接続設定 | `SUPABASE_ACCESS_TOKEN` が `~/.zshrc` に設定済みか | `.env.example` |
| 3 | マイグレーション適用方法 | Layer 1制約でCLIブロックあり。Supabase Dashboard SQL Editorでの手動適用を想定 | AGENTS.md §7 |
| 4 | `pg_cron` 利用可否 | Supabase無料枠でpg_cronが使えるか（ガバナンスアラート用） | Supabase Dashboard Extensions |
| 5 | ガバナンスアラート（Slack通知） | pg_cron + Slack Webhook の設定は別PRで実装予定 | — |

---

## 品質チェックゲート

実装完了時に必ず通すこと:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # ESLint
```
