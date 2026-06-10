import { describe, it, expect } from 'vitest'
import { weaponDamage, armorStats, itemPowerScore } from '../item-curves'
import { ITEM_DEFINITIONS, ITEM_DEFS } from '../item-data'
import type { RarityId } from '../../types/index'

const RARITIES: RarityId[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const TIERS = [0, 1, 2, 3, 4, 5, 6, 7]

describe('weaponDamage', () => {
  it('is monotonically increasing in zone tier', () => {
    for (const rarity of RARITIES) {
      for (let z = 1; z < 8; z++) {
        const prev = weaponDamage(z - 1, rarity)
        const cur = weaponDamage(z, rarity)
        expect((cur.minDmg + cur.maxDmg) / 2).toBeGreaterThan((prev.minDmg + prev.maxDmg) / 2)
      }
    }
  })

  it('is monotonically increasing in rarity', () => {
    for (const z of TIERS) {
      for (let r = 1; r < RARITIES.length; r++) {
        const prev = weaponDamage(z, RARITIES[r - 1])
        const cur = weaponDamage(z, RARITIES[r])
        expect((cur.minDmg + cur.maxDmg) / 2).toBeGreaterThan((prev.minDmg + prev.maxDmg) / 2)
      }
    }
  })

  it('min is always below max', () => {
    for (const z of TIERS) {
      for (const r of RARITIES) {
        const { minDmg, maxDmg } = weaponDamage(z, r)
        expect(minDmg).toBeLessThan(maxDmg)
        expect(minDmg).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('anchors: forest common avg in [3, 6], nightmare legendary avg in [170, 240]', () => {
    const lo = weaponDamage(0, 'common')
    expect((lo.minDmg + lo.maxDmg) / 2).toBeGreaterThanOrEqual(3)
    expect((lo.minDmg + lo.maxDmg) / 2).toBeLessThanOrEqual(6)
    const hi = weaponDamage(7, 'legendary')
    expect((hi.minDmg + hi.maxDmg) / 2).toBeGreaterThanOrEqual(170)
    expect((hi.minDmg + hi.maxDmg) / 2).toBeLessThanOrEqual(240)
  })

  it('snapshot of the zone × rarity average table', () => {
    const table = TIERS.map((z) =>
      RARITIES.map((r) => {
        const { minDmg, maxDmg } = weaponDamage(z, r)
        return (minDmg + maxDmg) / 2
      }),
    )
    expect(table).toMatchSnapshot()
  })
})

describe('armorStats', () => {
  it('is monotonically increasing in zone tier (combined score)', () => {
    for (const rarity of RARITIES) {
      for (let z = 1; z < 8; z++) {
        const prev = armorStats(z - 1, rarity)
        const cur = armorStats(z, rarity)
        expect(cur.defBonus * 3 + cur.hpBonus).toBeGreaterThan(prev.defBonus * 3 + prev.hpBonus)
      }
    }
  })

  it('defMod/hpMod shape archetypes without changing total tier power drastically', () => {
    const robe = armorStats(7, 'legendary', 0.5, 1.4)
    const plate = armorStats(7, 'legendary', 1.4, 0.8)
    expect(robe.defBonus).toBeLessThan(plate.defBonus)
    expect(robe.hpBonus).toBeGreaterThan(plate.hpBonus)
  })
})

describe('itemPowerScore', () => {
  it('orders zone/rarity slots consistently', () => {
    expect(itemPowerScore(0, 'common')).toBeLessThan(itemPowerScore(0, 'legendary'))
    expect(itemPowerScore(0, 'legendary')).toBeLessThan(itemPowerScore(7, 'legendary'))
  })
})

describe('materialized ITEM_DEFINITIONS', () => {
  it('every def materializes with valid stats', () => {
    expect(ITEM_DEFINITIONS.length).toBe(ITEM_DEFS.length)
    for (const item of ITEM_DEFINITIONS) {
      expect(item.zoneTier).toBeGreaterThanOrEqual(0)
      expect(item.zoneTier).toBeLessThanOrEqual(7)
      if (item.type === 'weapon') {
        expect(item.stats.minDmg).toBeGreaterThanOrEqual(1)
        expect(item.stats.maxDmg).toBeGreaterThan(item.stats.minDmg!)
      } else {
        expect(item.stats.defBonus).toBeGreaterThanOrEqual(0)
        expect(item.stats.hpBonus).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('item ids are unique', () => {
    const ids = new Set(ITEM_DEFINITIONS.map((i) => i.id))
    expect(ids.size).toBe(ITEM_DEFINITIONS.length)
  })

  it('special effect values respect the data caps', () => {
    for (const item of ITEM_DEFINITIONS) {
      for (const s of item.stats.special ?? []) {
        switch (s.type) {
          case 'lifesteal': expect(s.value).toBeLessThanOrEqual(0.30); break
          case 'defIgnore': expect(s.percent).toBeLessThanOrEqual(0.50); break
          case 'spellAmp': expect(s.percent).toBeLessThanOrEqual(0.40); break
          case 'critThreshold': expect(s.rollsAt).toBeGreaterThanOrEqual(14); break
          case 'attackSpeedBonus': expect(s.percent).toBeLessThanOrEqual(0.25); break
          case 'doublecast': expect(s.chance).toBeLessThanOrEqual(0.35); break
          case 'dodge': expect(s.chance).toBeLessThanOrEqual(0.35); break
          case 'block': expect(s.chance).toBeLessThanOrEqual(0.35); break
        }
      }
    }
  })

  it('zone-locked items have zoneTier matching their dropFromZoneIdx', () => {
    for (const item of ITEM_DEFINITIONS) {
      if (item.dropFromZoneIdx !== undefined) {
        expect(item.zoneTier).toBe(item.dropFromZoneIdx)
      }
    }
  })
})
