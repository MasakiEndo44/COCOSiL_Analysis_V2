---
query_id: Q4
title: N:M 確率対応モデル + 階層別 α の学術的正当化
executed_at: 2026-05-27
executor: えんまさ
related_prompt: docs/output/F3/deep-research-trunks-twigs-2026-05-28.md §9
status: completed (lib/constitution/three-layer-model.ts に commit 済み)
---

# Q4 N:M Probability Mapping — 既に完了

> Q4 の出力は `lib/constitution/three-layer-model.ts` の以下に commit 済み:
>
> - `LAYER2_TO_LAYER1`: 8 Layer 2 スタイル × 4 元素の確率分布
> - `HYBRID_DISTANCE_ALPHA`: 層別 α (0.7 / 0.3)
> - `LAYER3_TO_LAYER1_MODULATION`: Layer 3 → Layer 1 ±0.3 変調
> - `LAYER3_TO_LAYER2_MODULATION`: Layer 3 → Layer 2 ±0.3 変調

## 既存材料

- docs/input/deep-research/N_M確率対応モデルの既存研究網羅.md
- commit f821408 / 9fa85a6

## 次の論点 (将来 Deep Research)

- KL Eval 閾値 (現状 0.15) の人間アノテーション ground truth 収集
- Embedding 距離の重み (Hybrid Distance 0.5 stub の脱却) 設計
