import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  rollLoot,
  rollBisLoot,
  applyPity,
  blankPity,
  ZONE_RARITY_WEIGHTS,
  DROP_CHANCE,
  PITY_RARE,
  PITY_EPIC,
  ITEM_DEFINITIONS,
} from '../items'
import { ZONE_INDEX, ZONE_BIS_IDS } from '../item-data'
import type { RarityId, ZoneId } from '../../types/index'

const ZONES = Object.keys(ZONE_INDEX) as ZoneId[]
const RARITY_ORDER: RarityId[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

afterEach(() => vi.restoreAllMocks())

describe('ZONE_RARITY_WEIGHTS', () => {
  it('every row sums to ~1', () => {
    for (const row of ZONE_RARITY_WEIGHTS) {
      const sum = row.reduce((a, b) => a + b, 0)
      expect(sum).toBeCloseTo(1, 6)
    }
  })

  it('legendary chance rises with zone depth', () => {
    for (let z = 1; z < ZONE_RARITY_WEIGHTS.length; z++) {
      expect(ZONE_RARITY_WEIGHTS[z][4]).toBeGreaterThanOrEqual(ZONE_RARITY_WEIGHTS[z - 1][4])
    }
  })

  it('common chance falls with zone depth', () => {
    for (let z = 1; z < ZONE_RARITY_WEIGHTS.length; z++) {
      expect(ZONE_RARITY_WEIGHTS[z][0]).toBeLessThanOrEqual(ZONE_RARITY_WEIGHTS[z - 1][0])
    }
  })
})

describe('drop pools', () => {
  it('every zone × rarity with non-zero weight has a non-empty pool', () => {
    for (const zone of ZONES) {
      const zoneIdx = ZONE_INDEX[zone]
      const row = ZONE_RARITY_WEIGHTS[zoneIdx]
      for (let r = 0; r < row.length; r++) {
        if (row[r] === 0) continue
        const rarity = RARITY_ORDER[r]
        const pool = ITEM_DEFINITIONS.filter(
          (item) =>
            item.rarity === rarity &&
            (item.dropFromZoneIdx === undefined || item.dropFromZoneIdx <= zoneIdx) &&
            (item.zoneTier ?? 0) <= zoneIdx,
        )
        expect(pool.length, `${zone}/${rarity}`).toBeGreaterThan(0)
      }
    }
  })

  it('nightmare epic+ drops are never low-tier items', () => {
    for (let i = 0; i < 300; i++) {
      const item = rollLoot('nightmare', 'soul-eater')
      if (!item) continue
      if (item.rarity === 'epic' || item.rarity === 'legendary') {
        expect(item.zoneTier, `${item.name} tier ${item.zoneTier}`).toBeGreaterThanOrEqual(6)
      }
    }
  })
})

describe('non-boss legendaries', () => {
  it('volcano+ normal kills can drop legendaries', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999)
    const item = rollLoot('volcano', 'wyvern')!
    expect(item.rarity).toBe('legendary')
  })

  it('forest never drops epic or legendary', () => {
    for (let i = 0; i < 300; i++) {
      const item = rollLoot('forest', 'goblin')
      if (!item) continue
      expect(['common', 'uncommon', 'rare']).toContain(item.rarity)
    }
  })
})

describe('boss rarity floors', () => {
  it('volcano+ boss drops are always rare or better', () => {
    for (let i = 0; i < 100; i++) {
      const item = rollLoot('volcano', 'dragon')!
      expect(RARITY_ORDER.indexOf(item.rarity)).toBeGreaterThanOrEqual(RARITY_ORDER.indexOf('rare'))
    }
  })

  it('celestial+ boss drops are always epic or better', () => {
    for (let i = 0; i < 100; i++) {
      const item = rollLoot('celestial', 'celestial-archon')!
      expect(RARITY_ORDER.indexOf(item.rarity)).toBeGreaterThanOrEqual(RARITY_ORDER.indexOf('epic'))
    }
  })
})

describe('pity', () => {
  it('forces rare+ after PITY_RARE dry drops', () => {
    const pity = blankPity()
    pity.sinceRare = PITY_RARE - 1
    const result = applyPity('common', pity, ZONE_INDEX.dungeon)
    expect(RARITY_ORDER.indexOf(result)).toBeGreaterThanOrEqual(RARITY_ORDER.indexOf('rare'))
    expect(pity.sinceRare).toBe(0)
  })

  it('forces epic+ after PITY_EPIC dry drops where the zone allows epic', () => {
    const pity = blankPity()
    pity.sinceEpic = PITY_EPIC - 1
    const result = applyPity('common', pity, ZONE_INDEX.abyss)
    expect(RARITY_ORDER.indexOf(result)).toBeGreaterThanOrEqual(RARITY_ORDER.indexOf('epic'))
    expect(pity.sinceEpic).toBe(0)
  })

  it('does not force epic in forest (zone max is rare)', () => {
    const pity = blankPity()
    pity.sinceEpic = PITY_EPIC - 1
    const result = applyPity('common', pity, ZONE_INDEX.forest)
    expect(RARITY_ORDER.indexOf(result)).toBeLessThan(RARITY_ORDER.indexOf('epic'))
  })

  it('natural rare+ drops reset the rare counter', () => {
    const pity = blankPity()
    pity.sinceRare = 10
    applyPity('epic', pity, ZONE_INDEX.abyss)
    expect(pity.sinceRare).toBe(0)
    expect(pity.sinceEpic).toBe(0)
  })

  it('counters tick on non-qualifying drops', () => {
    const pity = blankPity()
    applyPity('common', pity, ZONE_INDEX.dungeon)
    expect(pity.sinceRare).toBe(1)
    expect(pity.sinceEpic).toBe(1)
  })

  it('rollLoot with pity guarantees a rare within PITY_RARE drops', () => {
    // Force the rarity roll to always land on common
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const pity = blankPity()
    let gotRare = false
    for (let i = 0; i < PITY_RARE; i++) {
      const item = rollLoot('dungeon', 'skeleton', 0, pity)
      if (item && RARITY_ORDER.indexOf(item.rarity) >= RARITY_ORDER.indexOf('rare')) {
        gotRare = true
        break
      }
    }
    expect(gotRare).toBe(true)
  })
})

describe('DROP_CHANCE', () => {
  it('is between 0 and 1', () => {
    expect(DROP_CHANCE).toBeGreaterThan(0)
    expect(DROP_CHANCE).toBeLessThan(1)
  })
})

describe('BiS pools', () => {
  it('every zone has exactly 12 BiS items', () => {
    for (const zone of ZONES) {
      expect(ZONE_BIS_IDS[zone].length, zone).toBe(12)
    }
  })

  it('every BiS id resolves to a legendary item at the zone tier', () => {
    for (const zone of ZONES) {
      const zoneIdx = ZONE_INDEX[zone]
      for (const id of ZONE_BIS_IDS[zone]) {
        const item = ITEM_DEFINITIONS.find((i) => i.id === id)
        expect(item, `${zone}: ${id}`).toBeDefined()
        expect(item!.rarity, `${zone}: ${id}`).toBe('legendary')
        expect(item!.zoneTier, `${zone}: ${id}`).toBeLessThanOrEqual(zoneIdx)
      }
    }
  })

  it('every class has a BiS weapon and armor in every zone', () => {
    const classes = ['warrior', 'rogue', 'mage', 'priest', 'undead', 'dragonkin'] as const
    for (const zone of ZONES) {
      const items = ZONE_BIS_IDS[zone].map((id) => ITEM_DEFINITIONS.find((i) => i.id === id)!)
      for (const cls of classes) {
        const usable = items.filter(
          (i) => i.allowedClasses === 'any' || i.allowedClasses.includes(cls),
        )
        expect(usable.some((i) => i.type === 'weapon'), `${zone}/${cls} weapon`).toBe(true)
        expect(usable.some((i) => i.type === 'armor'), `${zone}/${cls} armor`).toBe(true)
      }
    }
  })

  it('rollBisLoot returns a legendary from the zone pool', () => {
    for (const zone of ZONES) {
      const item = rollBisLoot(zone)!
      expect(item.rarity).toBe('legendary')
      expect(ZONE_BIS_IDS[zone]).toContain(item.defId)
    }
  })
})
