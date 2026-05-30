---
doc_id: discussion.ai-chat-tech-stack-selection
title: 議論ログ：AIチャット技術スタック選定
created_at: 2026-05-05
topic: AIチャット機能の技術スタック選定（OpenAI AgentBuilder仮置き → 最適解への移行）
outcome: Vercel AI SDK + OpenAI Chat Completions API に確定。Dify採用見送り。
---

# 議論ログ：AIチャット技術スタック選定

## 議論の背景

COCOSiL V2の詳細要件定義書（§6.3）では「OpenAI（Agent Builder含む）」と仮置きされていた。
実際にチャットAPIを実装する前に、以下の問いを議論によって解決する。

- Difyによるチャットボット構築は最適か？
- OpenAI Agents SDK / Assistants APIは使うべきか？
- Vercel AI SDKとの組み合わせはどうか？

## 現状確認（議論前の状態）

- `lib/types/chat-phase.ts`：5フェーズ型定義（listing/empathy/exploring/insight/action）実装済み
- `lib/prompts/chat-phase1.ts`, `chat-phase2.ts`：プロンプト実装済み（Protected Areas Layer 2）
- `app/api/chat/` ：未実装（チャットAPIルートなし）
- Supabase：`chat_sessions` / `chat_messages` テーブル設計済み

## 登場人物

- 🧑‍💼 **森田 健一**（AIシステムアーキテクト）：LLMシステム設計歴7年。managed AI platformからfull-stack自前実装まで幅広く経験。スタートアップのAI基盤設計が専門。
- 👩‍💻 **川口 奈緒**（Next.js / Vercelスペシャリスト）：App Router黎明期からのコントリビューター。Vercel AI SDKのPR作成経験あり。Edge Runtimeとストリーミング実装が得意。
- 💅 **みさき（ギャル）**：IT素人だけど感性が鋭い。実際のCOCOSiLユーザー候補。自己理解系サービスのヘビーユーザー。

---

## Turn 1｜現状診断——「仮置き」の何が問題か

**森田：** まず現状から整理させてください。「OpenAI Agent Builder」という仮置きには、大きく2つの解釈があります。①Assistants API（Threads/Runs/File管理を持つステートフルなサービス）、②単なるChat Completions API呼び出しのラッパーとしての「エージェント的な実装」。COCOSiL V2の `lib/types/chat-phase.ts` を見ると、5フェーズ（listening → empathy → exploring → insight → action）を自前の型で管理しており、フェーズ遷移のロジックもアプリ側が持つ設計です。これはAssistants APIの「Thread」管理と競合します。実際、私がこれまで見てきた7つのスタートアップ事例のうち、Assistants APIを採用して途中で自前実装に戻ったケースが4件ありました。

**根本問題の診断**：「OpenAI Agent Builder」という言葉が、「セッション状態はどこが管理するか」という設計上の最重要問題を曖昧にしたまま仮置きされている。これが今回の技術選定の核心です。COCOSiLは「5フェーズの状態遷移 × ユーザーの診断データコンテキスト注入 × 禁止語チェック × UXシーケンス強制」という4つの制約を同時に満たす必要があり、どのレイヤーが何を担うかを決めないと、実装フェーズで必ず壊れます。

**川口：** 森田さんの診断に同意します。私の観点では、Next.js App Routerとの統合の摩擦も無視できません。Vercel AI SDKの `useChat` / `streamText` は、Edge Runtimeで動くストリーミングを3行で書けます。でも「フェーズ遷移のロジックをどこに置くか」を決めないと、クライアントとサーバーの状態が二重管理になる。私が去年Vercel社内で調べたデータでは、`useChat` を使いながらサーバー側でも独自セッションを持つ実装パターンが、パフォーマンスの問題を最も多く引き起こすと出ていました。抽象的に言うと「**ステート管理の所有権問題**」——これが現状の仮置きが隠している本質的なリスクです。

**みさき：** え待って、「フェーズ遷移」って何ですか？要するに私がチャットしてるときに、AIが「今は共感してる」とか「今は分析してる」とか、内部でモード切り替えてるってこと？

**川口：** その理解、正確です！みさきさんには見えないんですけど、裏側でAIのキャラクターというか役割が段階的に変わっていて、最初は「ただ聴く」、次に「安心させる」、そして「分析する」って順番で進むんです。

**みさき：** あー、それって「AIが途中でキャラ変する」みたいな感じ？それがアプリ側で管理されてないと、なんか会話が急にズレたりするんですね。マジそれ怖い～。

---

## Turn 2｜選択肢の発散——3つのアーキテクチャ軸

**川口：** 整理のため、評価軸を3つ立てます。**①制御性**（プロンプトとフェーズ遷移ロジックをどこまで自分たちが握れるか）、**②実装コスト**（3名体制・60日ロードマップに対してどれだけ重いか）、**③COCOSiL固有制約との適合度**（禁止語・UXシーケンス強制・Protected Areas Layer 2）。

この軸で主要候補を配置すると：

| 技術 | 制御性 | 実装コスト | COCOSiL適合度 | 総評 |
|---|---|---|---|---|
| **Vercel AI SDK + OpenAI直接** | ◎ 最高 | 〇 中程度 | ◎ 高い | **本命** |
| **Dify（クラウド）** | △ 低い | ◎ 最低 | △ 問題あり | 要注意 |
| **Dify（セルフホスト）** | 〇 中程度 | × 最重い | △ 問題あり | NG |
| **OpenAI Assistants API** | △ 制限多い | 〇 中程度 | × 不適合 | NG |
| **LangChain/LangGraph** | 〇 高い | × 重い | 〇 適合可 | 過剰 |
| **OpenAI Chat Completions直接** | ◎ 最高 | 〇 中程度 | ◎ 高い | 本命の基盤 |

**森田：** 川口さんの軸に、**④長期運用コスト**を追加させてください。Difyクラウドは初期が楽ですが、COCOSiLのような「プロンプトが事業競争力そのもの（Protected Areas Layer 2）」のプロダクトで、ワークフロー定義とプロンプトをDifyのGUI管理に乗せると、`lib/prompts/` のGit管理・型チェック・禁止語自動検査（F10.3）が全部壊れます。私がD社（月次5万MAUのAIプロダクト）でDify採用を中止させた理由が正にこれでした——「プロンプトの変更履歴がGitではなくDifyのDBに入ってしまい、法令対応でどのバージョンが出荷されたか証明できなくなった」という実害が出たんです。

**みさき：** Dify、聞いたことある！なんか「コードなしでAIチャット作れる」みたいな宣伝してたやつ？それってCOCOSiLには向いてないってこと？

**森田：** そうです。「コードなしで作れる」という強みが、COCOSiLにとって弱みになるんです。COCOSiLのプロンプトはえんまささんが意味設計して、型チェックもCIも通す「コードとして管理されたプロンプト（Prompt as Code）」なので、GUIで管理するDifyと方向性が真逆なんです。

---

## Turn 3｜COCOSiL固有要件との照合——何が本当に必要か

**みさき：** ちょっと待ってください、Vercel AI SDKって何ですか？OpenAIと違うんですか？「めっちゃ普通に同じじゃない？」って思っちゃったんですけど。

**森田：** 良い質問です！OpenAIはAIモデルを提供している会社で、Vercel AI SDKはそのモデルを「Next.jsアプリでめちゃくちゃ使いやすく呼び出すためのツール」です。ストリーミング（AIの回答が少しずつ表示される体験）とかフロント-バック間の状態管理を3行で書けるようにするやつです。COCOSiLは今Next.js 16で作ってるので、相性が抜群なんです。

**川口：** COCOSiL固有の要件を、実装の具体性まで落としてみます。

🔴 **必須要件と対応方式**:

| COCOSiL要件 | 実装上の課題 | Vercel AI SDK + OpenAI で解決できるか |
|---|---|---|
| 5フェーズ遷移 | `chat_sessions.phase` をDBに持ちながら、APIリクエストごとに正しいシステムプロンプトを選択する | ✅ API Route内で `lib/prompts/` から動的に選択 |
| 診断コンテキスト注入 | 4体系診断結果をシステムプロンプトに埋め込む | ✅ Server Actionでプロファイル取得→注入 |
| 初回応答3秒以内 | Edge Runtime + ストリーミングが必須 | ✅ `streamText()` + Edge Runtime |
| 禁止語ガード（F10.3） | 出力に「占い」等が混入した場合の対処 | ✅ 出力後フィルタリングをmiddlewareで実装可 |
| UXシーケンス強制 | フェーズを逆行させない | ✅ `lib/constitution/ux-sequence.ts` と照合するバリデーター |
| チャット履歴永続化 | Supabase `chat_messages` テーブル | ✅ Server Actionでinsert |

**森田：** 実装優先度を付けると：

🔴 **Phase 1で必須（Day 1〜21）**:
- Vercel AI SDK `streamText` + OpenAI `gpt-4o`
- フェーズ遷移ロジック（`lib/chat/phase-manager.ts` として新設）
- Supabaseへのメッセージ永続化

🟡 **Phase 2以降**:
- 過去対話のRAG注入（コンテキスト圧縮含む）
- 出力後の禁止語フィルター（今はプロンプトで防止）

🟢 **Sprint 3以降（評価基盤）**:
- promptfooによるプロンプト評価（Eval）

---

## Turn 4｜Dify「AIコネクタ」提案の深堀り——えんまさの直感はどこを見ているか

**森田：** えんまさが「Difyが最適」と考えているのは、おそらく①マルチLLM切り替えの柔軟性、②ワークフロー可視化（誰でも理解できる）、③RAGパイプラインの簡便さ——の3点だと推測します。この直感自体は正しい。問題は、COCOSiL V2の制約とDifyの設計哲学が、根本的に衝突する点があることです。

**COCOSiL ↔ Dify の衝突マトリクス**:

| COCOSiLの設計 | Difyの挙動 | 衝突度 |
|---|---|---|
| `lib/prompts/` はGit管理 + 型チェック | DifyのプロンプトはGUI管理 + DB保存 | 🔴 重大 |
| Protected Areas Layer 2（えんまさ承認必須） | Dify GUI操作に承認フローなし | 🔴 重大 |
| F10.3 禁止語自動検査（CIで実行） | DifyのCI統合は設定が複雑 | 🟡 中程度 |
| `lib/constitution/` の型チェック | Difyは型安全ではない | 🟡 中程度 |
| Clerk + Supabase RLSによる認証 | DifyはUser管理を自前で持つ | 🟡 中程度 |

**一方でDifyが本当に強い場面**：プロンプトをコードとして管理せず、ビジネス担当者がGUIで反復実験したい場合。これはCOCOSiLの「えんまさが意味設計 → ヒラメがコード化 → CIが検証」という分業体制と相性が悪い。えんまさが「直感的に操作したい」という需要があるなら、代替として **PromptLayerやLangSmith** などの「プロンプト管理UIだけを持つツール」の方がフィット感は高い。

**川口：** 「AIコネクタ」という言葉について補足します。これはおそらく「LLMのモデルを簡単に切り替えられるアブストラクション層」のことを指していると思います。Vercel AI SDKには `@ai-sdk/openai` / `@ai-sdk/anthropic` / `@ai-sdk/google` 等のプロバイダーが統一インターフェースで使えます。つまり「AIコネクタ」機能は Vercel AI SDK が既にネイティブで提供しているんです。

```typescript
// Vercel AI SDK: モデル切り替えが1行
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

const model = process.env.AI_PROVIDER === 'anthropic'
  ? anthropic('claude-opus-4-5')
  : openai('gpt-4o')

const result = await streamText({ model, messages, system: prompt })
```

Difyに払うコストで得られる「マルチLLM切り替え」は、Vercel AI SDKで0円・5行で実現できます。Difyを使う必然性が、COCOSiL V2においては存在しないというのが私の結論です。

**みさき：** つまりDifyを使わなくても「えんまさが違うAIに切り替えたい！」ってなったときも対応できるってこと？それめっちゃ現実的〜。てかDifyって月いくらくらいかかるんですか？

**川口：** Difyクラウドのプロフェッショナルプランで月$59〜。メッセージ数課金もあります。Vercel AI SDKはオープンソースで0円、払うのはOpenAIのAPI料金だけです。

---

## Turn 5｜設計原則の集約と明日からの具体アクション

**森田：** 5ターンの議論を集約します。COCOSiL V2 AIチャット基盤の設計原則を3つに整理します。

---

**【COCOSiL V2 チャット技術基盤 3原則】**

**① Prompt as Code, Always.**
プロンプトは `lib/prompts/` でTypeScriptとして管理し、型チェック・CIを必ず通す。GUIで管理するツール（Dify等）は、Protected Areas Layer 2とCIガバナンスを壊すため採用しない。

**② Stream-First, State-in-DB.**
ユーザー体験の核（初回応答3秒以内）はVercel AI SDKの `streamText` + Edge Runtimeで担保。セッション状態は全てSupabaseの `chat_sessions.phase` に永続化。クライアント側にフェーズ状態を持たせない。

**③ Switch-Anytime via Unified Connector.**
LLMプロバイダーの切り替えはVercel AI SDKの統一インターフェースで1行で対応。Difyのような外部プラットフォームへの依存は持たず、モデル競争の恩恵を自前のアーキテクチャで享受する。

---

**川口：** では明日からの具体アクションを5項目で。

1. **`pnpm add ai @ai-sdk/openai`** — Vercel AI SDKをプロジェクトに追加（30分）
2. **`app/api/chat/route.ts` を新設** — `streamText()` + Edge Runtime + `lib/prompts/chat-phase1.ts` 注入の最小実装（2〜3時間）
3. **`lib/chat/phase-manager.ts` を新設** — フェーズ遷移ロジック（listening → empathy → … → action）をSupabase `chat_sessions` と連動させる純粋関数（4時間）
4. **型定義確認** — `chat_sessions` テーブルの `phase` カラムが `ChatPhase` 型と一致しているかSupabase型定義（`pnpm db:types`）で検証
5. **要件定義書の更新** — §6.3の「OpenAI（Agent Builder含む）」を「Vercel AI SDK + OpenAI Chat Completions API」に修正し、本議論ログへの参照を追記

**みさき：** なんか最初「Difyとかいっぱい選択肢あってどれかな〜」って思ってたけど、COCOSiLって「プロンプトがコードで管理されてる」ってとこが他のAIサービスと全然違うんですね！えんまさが直感的に操作できる別のツール（PromptLayerとか）と組み合わせれば、Difyに頼らなくてもめっちゃええんじゃないですか？Vercel AI SDKで切り替えもできるし、コスト削減もできるし、ガバナンスも保てるし——全部取りでマジ神じゃないですか。

---

## ✅ 議論まとめ

| 項目 | 方針 |
|---|---|
| **AIチャット基盤** | **Vercel AI SDK (`ai`) + OpenAI Chat Completions API** に確定 |
| **Dify採用** | **見送り**。`lib/prompts/` のGit管理・型安全・CIガバナンスと根本的に衝突するため |
| **OpenAI Assistants API** | **不採用**。5フェーズのフェーズ管理がアプリ側にあり、ThreadsモデルとDB設計が競合 |
| **マルチLLM切り替え** | Vercel AI SDKの統一コネクター（`@ai-sdk/openai` / `@ai-sdk/anthropic`等）で実現 |
| **フェーズ状態管理** | Supabase `chat_sessions.phase` に永続化（クライアント非保持） |
| **ストリーミング** | `streamText()` + Edge Runtime（初回応答3秒以内の非機能要件を満たす） |
| **えんまさの操作性** | PromptLayerやLangSmith等の「プロンプト管理UI」を別途評価（Difyの代替） |
| **コスト** | Vercel AI SDK: 無料。LLM費用のみ（Difyクラウド $59+/月を節約） |

## 次のアクション（担当）

- [ ] `pnpm add ai @ai-sdk/openai` — **ヒラメ**
- [ ] `app/api/chat/route.ts` 最小実装 — **ヒラメ**
- [ ] `lib/chat/phase-manager.ts` 新設 — **ヒラメ**
- [ ] 要件定義書 §6.3 更新 — **ヒラメ**（本ログへの参照追加）
- [ ] PromptLayer / LangSmith の評価 — **えんまさ**（プロンプト反復実験のUI需要がある場合）
