---
query_id: Q5
title: 4 体系葉ノード語彙コーパス (884 語)
executed_at: 2026-05-28
executor: えんまさ
related_prompt: docs/output/F3/deep-research-trunks-twigs-2026-05-28.md §10-13
status: completed (lib/data/three-layer-vocab/twigs/ に commit 済み)
---

# Q5 Twigs by System — 既に完了

> Q5a / Q5b / Q5c / Q5d の出力は `lib/data/three-layer-vocab/twigs/` に commit 済み:
>
> - Q5a Zodiac:  12 × 10 = 120 語  (zodiac.ts)
> - Q5b Animal:  60 × 8  = 480 語  (animal.ts, drift test 済み)
> - Q5c MBTI:    16 × 11 = 176 語  (mbti.ts)
> - Q5d Rokusei: 12 × 9  = 108 語  (rokusei.ts)
>
> 合計 884 語。Trunks 320 語と合わせて 1,204 語。

## 既存材料

- docs/input/deep-research/12星座葉ノード語彙コーパス生成.md (Q5a)
- docs/input/deep-research/動物キャラ分類語彙コーパス生成.md (Q5b-1)
- docs/input/deep-research/動物語彙コーパス後半30体作成.md (Q5b-2)
- docs/input/deep-research/動物キャラクター分類語彙コーパス補完.md (Q5b-3)
- docs/input/deep-research/Q5c_16MBTI葉ノード語彙コーパス生成.md
- docs/input/deep-research/Q5d_12六星人葉ノード語彙コーパス生成.md
- docs/output/F3/animal-60-name-mapping.md
- commit 700e614 (DR スナップショット) / commit 5b84c47 (twigs 884 語)

## 次の論点 (パイプライン本走時)

- 各体系 × 各観察軸 (4 × 5 = 20 通り) の Deep Research 本走を実行し、
  scripts/build-observation-tree-v2/inputs/{system}-{axis}.md に配置する
- 例: zodiac-embodied_pattern.md, animal-cognitive_style.md など
