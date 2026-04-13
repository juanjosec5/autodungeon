import { describe, it, expect, vi } from 'vitest'
import {
  getSellPrice,
  getBuyPrice,
  calcEnchantCost,
  getItemById,
  rollLoot,
  rollBisLoot,
  ITEM_DEFINITIONS,
} from '../items'
import type { Item, RarityId } from '../../types/index'

// ── getSellPrice ──────────────────────────────────────────────────────────────

describe('getSellPrice', () => {
  const cases: [RarityId, number][] = [
    ['common', 5],
    ['uncommon', 15],
    ['rare', 40],
    ['epic', 120],
    ['legendary', 500],
  ]

  it.each(cases)('returns %d for %s', (rarity, expected) => {
    expect(getSellPrice(rarity)).toBe(expected)
  })
})

// ── getBuyPrice ───────────────────────────────────────────────────────────────

describe('getBuyPrice', () => {
  const cases: [RarityId, number][] = [
    ['common', 20],
    ['uncommon', 60],
    ['rare', 150],
    ['epic', 450],
    ['legendary', 2000],
  ]

  it.each(cases)('returns %d for %s', (rarity, expected) => {
    expect(getBuyPrice(rarity)).toBe(expected)
  })

  it('buy price is always >= sell price', () => {
    const rarities: RarityId[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    for (const r of rarities) {
      expect(getBuyPrice(r)).toBeGreaterThan(getSellPrice(r))
    }
  })
})

// ── calcEnchantCost ───────────────────────────────────────────────────────────

describe('calcEnchantCost', () => {
  function makeItem(rarity: RarityId, enchantCount?: number): Item {
    return {
      id: 'x', name: 'X', type: 'weapon', category: 'sword',
      rarity, allowedClasses: 'any',
      stats: { minDmg: 1, maxDmg: 2 },
      enchantCount,
    }
  }

  it('base cost: getBuyPrice * 3 when enchantCount is 0', () => {
    const item = makeItem('common', 0)
    expect(calcEnchantCost(item)).toBe(getBuyPrice('common') * 3) // 60
  })

  it('base cost when enchantCount is undefined (treated as 0)', () => {
    const item = makeItem('common', undefined)
    expect(calcEnchantCost(item)).toBe(getBuyPrice('common') * 3)
  })

  it('doubles with each enchant (2^n)', () => {
    const base = getBuyPrice('rare') * 3 // 450
    expect(calcEnchantCost(makeItem('rare', 0))).toBe(base)
    expect(calcEnchantCost(makeItem('rare', 1))).toBe(base * 2)
    expect(calcEnchantCost(makeItem('rare', 2))).toBe(base * 4)
    expect(calcEnchantCost(makeItem('rare', 3))).toBe(base * 8)
  })

  it('applies to legendary correctly', () => {
    const item = makeItem('legendary', 1)
    expect(calcEnchantCost(item)).toBe(getBuyPrice('legendary') * 3 * 2)
  })
})

// ── getItemById ───────────────────────────────────────────────────────────────

describe('getItemById', () => {
  it('returns a known item', () => {
    const first = ITEM_DEFINITIONS[0]
    const result = getItemById(first.id)
    expect(result).toBeDefined()
    expect(result?.id).toBe(first.id)
  })

  it('returns undefined for unknown id', () => {
    expect(getItemById('this-does-not-exist')).toBeUndefined()
  })

  it('returns the original template object (same reference as ITEM_DEFINITIONS)', () => {
    const first = ITEM_DEFINITIONS[0]
    expect(getItemById(first.id)).toBe(first)
  })
})

// ── rollLoot ──────────────────────────────────────────────────────────────────

describe('rollLoot', () => {
  it('returns an Item with a unique id', () => {
    const item = rollLoot('forest', 'goblin')
    expect(item).toBeDefined()
    expect(item.id).toBeTruthy()
    expect(item.defId).toBeTruthy()
    // id should differ from defId (it gets crypto.randomUUID())
    expect(item.id).not.toBe(item.defId)
  })

  it('forest zone: never returns epic or legendary', () => {
    // Run many times to be statistically confident
    for (let i = 0; i < 200; i++) {
      const item = rollLoot('forest', 'goblin')
      expect(['common', 'uncommon', 'rare']).toContain(item.rarity)
    }
  })

  it('dungeon zone: never returns legendary (for non-boss)', () => {
    for (let i = 0; i < 200; i++) {
      const item = rollLoot('dungeon', 'skeleton')
      expect(item.rarity).not.toBe('legendary')
    }
  })

  it('void zone allows legendary for boss enemies', () => {
    // Force Math.random to hit the legendary weight bracket by returning a value
    // just below cumulative sum where legendary kicks in (> 0.9999)
    vi.spyOn(Math, 'random').mockReturnValue(0.9999)
    const item = rollLoot('void', 'the-unmaker')
    expect(item.rarity).toBe('legendary')
    vi.restoreAllMocks()
  })

  it('items belong to a pool reachable from the given zone', () => {
    const item = rollLoot('forest', 'goblin')
    const template = ITEM_DEFINITIONS.find((i) => i.id === item.defId)
    expect(template).toBeDefined()
    // Forest is zone index 0, so dropFromZoneIdx must be 0 or undefined
    if (template!.dropFromZoneIdx !== undefined) {
      expect(template!.dropFromZoneIdx).toBeLessThanOrEqual(0)
    }
  })

  it('returns a different id on each call (no referential sharing)', () => {
    const a = rollLoot('dungeon', 'skeleton')
    const b = rollLoot('dungeon', 'skeleton')
    expect(a.id).not.toBe(b.id)
  })
})

// ── rollBisLoot ───────────────────────────────────────────────────────────────

describe('rollBisLoot', () => {
  it('returns an Item with a unique id', () => {
    const item = rollBisLoot('forest')
    expect(item).toBeDefined()
    expect(item.id).toBeTruthy()
  })

  it('returns a legendary item', () => {
    // BiS loot is always legendary
    for (const zone of ['forest', 'dungeon', 'volcano', 'abyss', 'shadowrealm', 'celestial', 'void', 'nightmare'] as const) {
      const item = rollBisLoot(zone)
      expect(item.rarity).toBe('legendary')
    }
  })

  it('id differs from defId (deep clone with new uuid)', () => {
    const item = rollBisLoot('dungeon')
    expect(item.id).not.toBe(item.defId)
  })

  it('gives different ids on successive calls', () => {
    const a = rollBisLoot('forest')
    const b = rollBisLoot('forest')
    expect(a.id).not.toBe(b.id)
  })
})
