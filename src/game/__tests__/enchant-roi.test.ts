import { describe, it, expect } from 'vitest'
import type { ClassId, RarityId } from '../../types/index'
import {
  type SimBuild,
  makeSimWeapon,
  makeSimArmor,
  measureEnchantROI,
  maxedUpgrades,
} from '../simulate'
import { ZONE_PROGRESSION } from '../simulate'

/**
 * Enchant return-on-investment guardrails. Enchanting must be strictly worth
 * it: every level a measurable (or at least never negative) kill-rate change,
 * meaningful cumulative gains, and payback times that fit idle pacing. If a
 * curve retune breaks the value of enchanting, these fail before players
 * notice.
 */

/** At-zone-level character in un-enchanted gear of the given rarity */
function roiBuild(classId: ClassId, zoneIdx: number, level: number, rarity: RarityId): SimBuild {
  const tier = ZONE_PROGRESSION[zoneIdx].tier
  return {
    classId,
    level,
    upgrades: maxedUpgrades(classId),
    vitalityStacks: 0,
    ascension: {},
    weapon: makeSimWeapon(tier, rarity),
    armor: makeSimArmor(tier, rarity),
  }
}

describe('enchant ROI (shadowrealm, at-level epic, 12 levels)', () => {
  const classes: ClassId[] = ['warrior', 'mage']

  it.each(classes)('%s: kill rate never degrades and grows ≥10% by level 6', (classId) => {
    const rows = measureEnchantROI(roiBuild(classId, 4, 60, 'epic'), 'shadowrealm', {
      tier: 0,
      levels: 12,
      seed: 5,
    })

    // Monotone-ish: no level may tank the kill rate (5% noise tolerance)
    for (let i = 1; i < rows.length; i++) {
      expect(
        rows[i].killsPerMinute,
        `level ${rows[i].level} kpm ${rows[i].killsPerMinute.toFixed(1)} vs ${rows[i - 1].killsPerMinute.toFixed(1)}`,
      ).toBeGreaterThanOrEqual(rows[i - 1].killsPerMinute * 0.95)
    }

    // Cumulative payoff: enchanting to 6 must be a real DPS upgrade
    expect(rows[6].kpmDeltaPct, `level-6 delta ${rows[6].kpmDeltaPct.toFixed(1)}%`).toBeGreaterThanOrEqual(10)
  })
})

describe('enchant payback pacing', () => {
  const spots: { zoneIdx: number; level: number; rarity: RarityId }[] = [
    { zoneIdx: 0, level: 4, rarity: 'epic' },
    { zoneIdx: 4, level: 60, rarity: 'epic' },
    { zoneIdx: 4, level: 60, rarity: 'legendary' },
    { zoneIdx: 7, level: 100, rarity: 'legendary' },
  ]

  it.each(spots)('zone $zoneIdx $rarity: first enchant pays back within 8 minutes', ({ zoneIdx, level, rarity }) => {
    const { zone } = ZONE_PROGRESSION[zoneIdx]
    const rows = measureEnchantROI(roiBuild('warrior', zoneIdx, level, rarity), zone, {
      tier: 0,
      levels: 1,
      seed: 9,
    })
    expect(rows[1].paybackMinutes, `payback ${rows[1].paybackMinutes.toFixed(1)} min`).toBeLessThanOrEqual(8)
  })
})
