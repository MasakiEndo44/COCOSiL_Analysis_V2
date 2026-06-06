// buildProfileCore: 全部品を束ねて単一の確定スコア核 ProfileCore を生成する（Phase 1.7）。
//
// 設計根拠:
//   - docs/output/goals/f3-report-determinism-and-self-anchor.md
//   - docs/output/goals/f3-report-determinism-implementation-plan.md（Phase 1.7）
//
// 設計原則:
//   - Score Once, Narrate Freely — ここで数値・ラベルを一度だけ確定する。LLM は後段で語るのみ。
//   - 決定論: 同一 (input, identity) → 同一 ProfileCore。harvest 等の純関数のみを合成する。
//   - 出力は ProfileCoreSchema で検証して返す（契約ドリフトの早期検知）。

import { harvest } from './harvest'
import { buildDistribution } from './build-distribution'
import { deriveBlindspots } from './derive-blindspots'
import { buildCharacterLabel } from './build-character-label'
import { deriveStrengthsWeakness } from './derive-strengths-weakness'
import { SYSTEM_WEIGHTS } from './affinity-score'
import {
  PROFILE_CORE_VERSION,
  ProfileCoreSchema,
  type ProfileCore,
  type Identity,
} from './profile-core'
import type { UserDiagnosticInput } from './types'

/** 16 MBTI 型 + Identity → 32 型コード（例: "INFJ-T"）。 */
export function buildType32(mbti: string, identity: Identity): string {
  return `${mbti}-${identity}`
}

/** 入力から決定論的に導く seed（語り口の有限集合選択キー）。 */
function buildSeed(input: UserDiagnosticInput, identity: Identity): string {
  const date = input.birthDate.toISOString().slice(0, 10)
  return [date, input.mbti, identity, input.phase ?? '-'].join('|')
}

export function buildProfileCore(
  input: UserDiagnosticInput,
  identity: Identity,
): ProfileCore {
  const { axisScores } = harvest(input)
  const { strengths, weakness } = deriveStrengthsWeakness(axisScores)

  const core: ProfileCore = {
    axisScores,
    type32: buildType32(input.mbti, identity),
    identity,
    characterLabel: buildCharacterLabel(axisScores, identity),
    strengths,
    weakness,
    johariBlindspots: deriveBlindspots(axisScores),
    distribution: buildDistribution(axisScores),
    weights: {
      keirsey: SYSTEM_WEIGHTS.keirsey,
      animalStyle: SYSTEM_WEIGHTS.animalStyle,
      zodiacElement: SYSTEM_WEIGHTS.zodiacElement,
      rokuseiPolarity: SYSTEM_WEIGHTS.rokuseiPolarity,
      ...(input.phase ? { phase: SYSTEM_WEIGHTS.phase } : {}),
    },
    seed: buildSeed(input, identity),
    version: PROFILE_CORE_VERSION,
  }

  // 契約検証（ドリフト検知）。正常時はそのまま core を返す。
  return ProfileCoreSchema.parse(core)
}
