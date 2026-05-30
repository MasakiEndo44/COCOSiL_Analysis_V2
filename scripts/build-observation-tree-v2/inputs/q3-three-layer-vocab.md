---
query_id: Q3
title: 3 段階モデル (Layer 1/2/3) 語彙コーパス収集 (320 語)
executed_at: 2026-05-26
executor: えんまさ
related_prompt: docs/output/F3/deep-research-trunks-twigs-2026-05-28.md §6-8
status: completed (lib/data/three-layer-vocab/ に commit 済み)
---

# Q3 Three-Layer Vocabulary — 既に完了

> Q3a / Q3b / Q3c の出力は `lib/data/three-layer-vocab/layer1.ts`,
> `layer2.ts`, `layer3.ts` (合計 320 語) として commit 済み (commit 6b9f173)。
> 本ファイルは履歴整合のためのスタブ。

## 既存材料

- docs/input/deep-research/4元素×ユング機能 コア語彙生成.md (Q3a)
- docs/input/deep-research/Layer 2 振る舞いスタイル語彙コーパス生成.md (Q3b)
- docs/input/deep-research/Layer 3 時期変調コーパス生成.md (Q3c)
- lib/data/three-layer-vocab/__tests__/vocab.test.ts (重複・禁止語検証)

## 次の論点 (将来 Deep Research)

- Layer 2 → Layer 1 の確率分布 (LAYER2_TO_LAYER1) の経験的妥当性を心理測定相関で再検証
- 階層別 α (0.7 / 0.3) の値域を人間アノテーション ground truth で更新
