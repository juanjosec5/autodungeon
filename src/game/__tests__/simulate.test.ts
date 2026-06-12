import { describe, it, expect } from 'vitest'
import type { ClassId, UpgradeId } from '../../types/index'
import { rollUpgradeChoices, autoPickUpgrade } from '../upgrades'
import {
  ZONE_PROGRESSION,
  type SimBuild,
  makeSimWeapon,
  makeSimArmor,
  maxedBuild,
  maxSustainableTier,
  simulateZoneSession,
  simulateFullRun,
  withSeededRandom,
} from '../simulate'

/**
 * Full-fidelity progression guardrails. Unlike balance.test.ts (closed-form
 * expected values, tier 0 only), these run the real combat resolution through
 * the headless simulator — upgrades, prestige, ascension, enchants, NG+ tiers
 * and all — so scaling regressions at high prestige fail here before players
 * hit them.
 */

const CLASSES: ClassId[] = ['warrior', 'rogue', 'mage', 'priest', 'undead', 'dragonkin']

const SESSION_MS = 15 * 60_000

/** A mid-progression player: at-zone level, epic at-tier gear, auto-picked upgrades */
function atLevelBuild(classId: ClassId, zoneIdx: number, level: number): SimBuild {
  const tier = ZONE_PROGRESSION[zoneIdx].tier
  const upgrades: Partial<Record<UpgradeId, number>> = {}
  for (let i = 1; i < level; i++) {
    const choices = rollUpgradeChoices(classId, upgrades)
    if (choices.length === 0) break
    const pick = autoPickUpgrade(classId, choices)
    upgrades[pick.id] = (upgrades[pick.id] ?? 0) + 1
  }
  return {
    classId,
    level,
    upgrades,
    vitalityStacks: 0,
    ascension: {},
    weapon: makeSimWeapon(tier, 'epic'),
    armor: makeSimArmor(tier, 'epic'),
  }
}

// Same at-zone levels the balance tests assume
const AT_LEVEL: { zoneIdx: number; level: number }[] = [
  { zoneIdx: 0, level: 4 },
  { zoneIdx: 1, level: 14 },
  { zoneIdx: 2, level: 27 },
  { zoneIdx: 3, level: 42 },
  { zoneIdx: 4, level: 57 },
  { zoneIdx: 5, level: 72 },
  { zoneIdx: 6, level: 87 },
  { zoneIdx: 7, level: 98 },
]

describe('tier 0 baseline (no prestige)', () => {
  it.each(CLASSES)('at-level epic %s farms every zone profitably', (classId) => {
    for (const { zoneIdx, level } of AT_LEVEL) {
      const { zone } = ZONE_PROGRESSION[zoneIdx]
      const result = withSeededRandom(7, () =>
        simulateZoneSession(atLevelBuild(classId, zoneIdx, level), { zone, tier: 0, durationMs: SESSION_MS }),
      )
      // Occasional deaths are normal attrition (mild penalty); dying more
      // than once per 10 kills means the zone is hostile at its own level.
      const ratio = result.deaths / Math.max(1, result.kills)
      expect(ratio, `${classId} deaths/kill in ${zone} (${result.deaths}/${result.kills})`).toBeLessThan(0.1)
      expect(result.killsPerMinute, `${classId} kills/min in ${zone}`).toBeGreaterThan(2)
    }
  })

  it.each(CLASSES)('maxed lvl-100 %s farms shadowrealm deathless at idle pace', (classId) => {
    const result = withSeededRandom(7, () =>
      simulateZoneSession(maxedBuild(classId, 4), { zone: 'shadowrealm', tier: 0, durationMs: SESSION_MS }),
    )
    expect(result.deaths).toBe(0)
    expect(result.killsPerMinute).toBeGreaterThan(5)
  })

  it('fresh mage run reaches the level cap without walling', () => {
    const run = simulateFullRun({ classId: 'mage', tier: 0, seed: 3 })
    const totalKills = run.zoneLog.reduce((a, z) => a + z.kills, 0)
    expect(run.completed).toBe(true)
    expect(run.wallZone).toBeNull()
    expect(run.totalDeaths / Math.max(1, totalKills)).toBeLessThan(0.1)
    // ~43h of farming today; the bound only catches pathological slowdowns
    expect(run.virtualHours).toBeLessThan(72)
  })
})

describe('NG+ prestige scaling', () => {
  // Regression guard for the prestige-18 wall: enemy ATK/HP used to compound
  // ×1.18 / ×1.25 per tier with no player-side counterpart, hard-walling
  // maxed characters around NG+17. NG+ Attunement (+10% player damage/HP per
  // tier) plus the softened ×1.10 / ×1.12 enemy growth keeps at-level zones
  // farmable while difficulty still creeps up each prestige.
  it('prestige-18 maxed mage survives shadowrealm normal minions', () => {
    const result = withSeededRandom(42, () =>
      simulateZoneSession(maxedBuild('mage', 4), { zone: 'shadowrealm', tier: 18, durationMs: SESSION_MS }),
    )
    expect(result.deaths).toBe(0)
  })

  it('a fresh NG+18 mage run reaches shadowrealm', () => {
    const run = simulateFullRun({
      classId: 'mage',
      tier: 18,
      vitalityStacks: 12,
      startingLevelStacks: 5,
      xpBoostStacks: 8,
      ascension: { 'arcane-surge': 5, 'blessed-regen': 5, 'death-pact': 5, 'dragon-scales': 5 },
      gearRarity: 'legendary',
      enchanted: true,
      seed: 3,
    })
    expect(run.finalLevel).toBeGreaterThanOrEqual(50)
  })

  // Regression floor: whatever retuning happens, a maxed character must keep
  // farming their at-level zone at least this deep into NG+.
  it.each(CLASSES)('maxed lvl-100 %s sustains shadowrealm to at least NG+25', (classId) => {
    const tier = maxSustainableTier(maxedBuild(classId, 4), 'shadowrealm', { maxTier: 26 })
    expect(tier).toBeGreaterThanOrEqual(25)
  })

  // Difficulty must still rise with prestige — NG+ shouldn't be a no-op
  it('NG+18 shadowrealm farming is meaningfully slower than NG+0', () => {
    const build = maxedBuild('mage', 4)
    const t0 = withSeededRandom(42, () =>
      simulateZoneSession(build, { zone: 'shadowrealm', tier: 0, durationMs: SESSION_MS }),
    )
    const t18 = withSeededRandom(42, () =>
      simulateZoneSession(build, { zone: 'shadowrealm', tier: 18, durationMs: SESSION_MS }),
    )
    expect(t18.killsPerMinute).toBeLessThan(t0.killsPerMinute * 0.75)
  })
})
