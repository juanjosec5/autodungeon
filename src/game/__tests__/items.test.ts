import { describe, it, expect, vi } from 'vitest'
import {
  getSellPrice,
  getBuyPrice,
  calcEnchantCost,
  getItemById,
  rollLoot,
  rollBisLoot,
  ITEM_DEFINITIONS,
  ENCHANT_BASE_FACTOR,
  ENCHANT_GROWTH,
  ENCHANT_TIER_GROWTH,
  ENCHANT_RARITY_MULT,
  ENCHANT_CRIT_ITEM_FLOOR,
  WEAPON_ENCHANT_TYPES,
  ARMOR_ENCHANT_TYPES,
  enchantEffectValue,
  enchantCeiling,
  effectValue,
  previewEnchant,
  applyEnchant,
  migrateEnchantedSpecials,
} from '../items'
import { SPECIAL_CAPS, isBetterThan, ENCHANT_EQUIP_WEIGHT } from '../formulas'
import type { Item, RarityId, SpecialEffect } from '../../types/index'

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
    ['common', 40],
    ['uncommon', 120],
    ['rare', 320],
    ['epic', 960],
    ['legendary', 4000],
  ]

  it.each(cases)('returns %d for %s at zone tier 0', (rarity, expected) => {
    expect(getBuyPrice(rarity)).toBe(expected)
  })

  it('scales with zone tier (×1.5 per tier)', () => {
    expect(getBuyPrice('common', 1)).toBe(60)
    expect(getBuyPrice('common', 2)).toBe(90)
    expect(getBuyPrice('legendary', 7)).toBe(Math.round(4000 * Math.pow(1.5, 7)))
  })

  it('buy price is always > sell price', () => {
    const rarities: RarityId[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    for (const r of rarities) {
      expect(getBuyPrice(r)).toBeGreaterThan(getSellPrice(r))
    }
  })
})

// ── getSellPrice zone scaling ────────────────────────────────────────────────

describe('getSellPrice zone scaling', () => {
  function makeItem(rarity: RarityId, zoneTier: number): Item {
    return {
      id: 'x', name: 'X', type: 'weapon', category: 'sword',
      rarity, allowedClasses: 'any', zoneTier,
      stats: { minDmg: 1, maxDmg: 2 },
    }
  }

  it('scales sell price by 1.5^zoneTier', () => {
    expect(getSellPrice(makeItem('common', 0))).toBe(5)
    expect(getSellPrice(makeItem('common', 4))).toBe(Math.round(5 * Math.pow(1.5, 4)))
    expect(getSellPrice(makeItem('legendary', 7))).toBe(Math.round(500 * Math.pow(1.5, 7)))
  })

  it('treats missing zoneTier as 0 (legacy saved items)', () => {
    const item = makeItem('rare', 0)
    delete item.zoneTier
    expect(getSellPrice(item)).toBe(40)
  })
})

// ── calcEnchantCost ───────────────────────────────────────────────────────────

describe('calcEnchantCost', () => {
  function makeItem(rarity: RarityId, enchantCount?: number, zoneTier = 0): Item {
    return {
      id: 'x', name: 'X', type: 'weapon', category: 'sword',
      rarity, allowedClasses: 'any', zoneTier,
      stats: { minDmg: 1, maxDmg: 2 },
      enchantCount,
    }
  }

  it('base cost: getBuyPrice × ENCHANT_BASE_FACTOR when enchantCount is 0', () => {
    const item = makeItem('common', 0)
    expect(calcEnchantCost(item)).toBe(Math.floor(getBuyPrice('common') * ENCHANT_BASE_FACTOR))
  })

  it('base cost when enchantCount is undefined (treated as 0)', () => {
    const item = makeItem('common', undefined)
    expect(calcEnchantCost(item)).toBe(Math.floor(getBuyPrice('common') * ENCHANT_BASE_FACTOR))
  })

  it('grows ×ENCHANT_GROWTH with each enchant', () => {
    const base = getBuyPrice('rare') * ENCHANT_BASE_FACTOR
    expect(calcEnchantCost(makeItem('rare', 0))).toBe(Math.floor(base))
    expect(calcEnchantCost(makeItem('rare', 1))).toBe(Math.floor(base * ENCHANT_GROWTH))
    expect(calcEnchantCost(makeItem('rare', 2))).toBe(Math.floor(base * ENCHANT_GROWTH ** 2))
    expect(calcEnchantCost(makeItem('rare', 3))).toBe(Math.floor(base * ENCHANT_GROWTH ** 3))
  })

  it('scales with zone tier', () => {
    const lowTier = calcEnchantCost(makeItem('epic', 0, 0))
    const highTier = calcEnchantCost(makeItem('epic', 0, 7))
    expect(highTier).toBeGreaterThan(lowTier * 10)
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
    const item = rollLoot('forest', 'goblin')!
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
      if (!item) continue
      expect(['common', 'uncommon', 'rare']).toContain(item.rarity)
    }
  })

  it('dungeon zone: never returns legendary (for non-boss)', () => {
    for (let i = 0; i < 200; i++) {
      const item = rollLoot('dungeon', 'skeleton')
      if (!item) continue
      expect(item.rarity).not.toBe('legendary')
    }
  })

  it('void zone allows legendary for boss enemies', () => {
    // Force Math.random to hit the legendary weight bracket by returning a value
    // just below cumulative sum where legendary kicks in (> 0.9999)
    vi.spyOn(Math, 'random').mockReturnValue(0.9999)
    const item = rollLoot('void', 'the-unmaker')!
    expect(item.rarity).toBe('legendary')
    vi.restoreAllMocks()
  })

  it('items belong to a pool reachable from the given zone', () => {
    const item = rollLoot('forest', 'goblin')!
    const template = ITEM_DEFINITIONS.find((i) => i.id === item.defId)
    expect(template).toBeDefined()
    // Forest is zone index 0, so dropFromZoneIdx must be 0 or undefined
    if (template!.dropFromZoneIdx !== undefined) {
      expect(template!.dropFromZoneIdx).toBeLessThanOrEqual(0)
    }
  })

  it('returns a different id on each call (no referential sharing)', () => {
    const a = rollLoot('dungeon', 'skeleton')!
    const b = rollLoot('dungeon', 'skeleton')!
    expect(a.id).not.toBe(b.id)
  })
})

// ── rollBisLoot ───────────────────────────────────────────────────────────────

describe('rollBisLoot', () => {
  it('returns an Item with a unique id', () => {
    const item = rollBisLoot('forest')!
    expect(item).toBeDefined()
    expect(item.id).toBeTruthy()
  })

  it('returns a legendary item', () => {
    // BiS loot is always legendary
    for (const zone of ['forest', 'dungeon', 'volcano', 'abyss', 'shadowrealm', 'celestial', 'void', 'nightmare'] as const) {
      const item = rollBisLoot(zone)
      if (!item) continue
      expect(item.rarity).toBe('legendary')
    }
  })

  it('id differs from defId (deep clone with new uuid)', () => {
    const item = rollBisLoot('dungeon')!
    expect(item.id).not.toBe(item.defId)
  })

  it('gives different ids on successive calls', () => {
    const a = rollBisLoot('forest')!
    const b = rollBisLoot('forest')!
    expect(a.id).not.toBe(b.id)
  })
})

// ── Enchant engine ────────────────────────────────────────────────────────────

function makeEnchItem(opts: {
  type?: 'weapon' | 'armor'
  rarity?: RarityId
  zoneTier?: number
  special?: SpecialEffect[]
  enchantCount?: number
  defId?: string
}): Item {
  return {
    id: 'ench-test', name: 'Ench Test',
    type: opts.type ?? 'weapon', category: 'sword',
    rarity: opts.rarity ?? 'common', allowedClasses: 'any',
    zoneTier: opts.zoneTier ?? 0,
    enchantCount: opts.enchantCount,
    defId: opts.defId,
    stats: { minDmg: 1, maxDmg: 2, special: opts.special ? structuredClone(opts.special) : [] },
  }
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('enchantEffectValue', () => {
  it('scales with zone tier and rarity', () => {
    // base × (1 + 0.12·tier) × rarityMult, rounded to 2 decimals
    expect(enchantEffectValue('lifesteal', 0, 'common')).toBe(0.08)
    expect(enchantEffectValue('lifesteal', 4, 'epic')).toBe(
      Math.round(0.08 * (1 + ENCHANT_TIER_GROWTH * 4) * ENCHANT_RARITY_MULT.epic * 100) / 100,
    )
    expect(enchantEffectValue('defIgnore', 7, 'legendary')).toBe(
      Math.round(0.12 * (1 + ENCHANT_TIER_GROWTH * 7) * ENCHANT_RARITY_MULT.legendary * 100) / 100,
    )
  })

  it('critThreshold is scale-free (rollsAt anchor)', () => {
    expect(enchantEffectValue('critThreshold', 0, 'common')).toBe(18)
    expect(enchantEffectValue('critThreshold', 7, 'legendary')).toBe(18)
  })
})

describe('enchantCeiling', () => {
  it('is min(global cap, 2× scaled base)', () => {
    // T0 common lifesteal: 2 × 0.08 = 0.16 < cap 0.3
    expect(enchantCeiling('lifesteal', 0, 'common')).toBe(0.16)
    // T7 legendary lifesteal: 2 × 0.26 = 0.52 → clamped to cap 0.3
    expect(enchantCeiling('lifesteal', 7, 'legendary')).toBe(SPECIAL_CAPS.lifesteal)
    // attackSpeedBonus consumes the attackSpeedPct cap
    expect(enchantCeiling('attackSpeedBonus', 7, 'legendary')).toBe(SPECIAL_CAPS.attackSpeedPct)
  })

  it('uncapped poison only has the per-item ceiling', () => {
    const scaled = enchantEffectValue('poison', 7, 'legendary')
    expect(enchantCeiling('poison', 7, 'legendary')).toBe(Math.round(2 * scaled * 100) / 100)
  })

  it('critThreshold ceiling is the item floor of 15', () => {
    expect(enchantCeiling('critThreshold', 0, 'common')).toBe(ENCHANT_CRIT_ITEM_FLOOR)
  })
})

describe('applyEnchant invariants (seeded fuzz)', () => {
  const rarities: RarityId[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
  const naturalPools: SpecialEffect[] = [
    { type: 'spellAmp', percent: 0.3 },
    { type: 'doublecast', chance: 0.25 },
    { type: 'defIgnore', percent: 0.4 },
    { type: 'lifesteal', value: 0.25 },
    { type: 'critThreshold', rollsAt: 16 },
    { type: 'poison', dpsMultiplier: 0.2 },
    { type: 'dodge', chance: 0.2 },
    { type: 'block', chance: 0.12 },
  ]

  it('never removes effects, never lowers values, respects ceilings, terminates at maxed', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const type = rng() < 0.5 ? 'weapon' : 'armor'
      const zoneTier = Math.floor(rng() * 8)
      const rarity = rarities[Math.floor(rng() * rarities.length)]
      const naturals = [...naturalPools].sort(() => rng() - 0.5).slice(0, Math.floor(rng() * 4))
      const item = makeEnchItem({ type, rarity, zoneTier, special: naturals })

      let guard = 0
      for (;;) {
        const before = new Map((item.stats.special ?? []).map((s) => [s.type, effectValue(s)]))
        const preview = previewEnchant(item)
        const result = applyEnchant(item, rng)
        expect(result.kind).toBe(preview.kind === 'add' ? 'added' : preview.kind === 'upgrade' ? 'upgraded' : 'maxed')
        if (result.kind === 'maxed') break

        const special = item.stats.special ?? []
        // No duplicate types
        expect(new Set(special.map((s) => s.type)).size).toBe(special.length)
        expect(special.length).toBeLessThanOrEqual(3)
        // Monotone: nothing that existed got worse (crit: rollsAt never rises)
        for (const [t, prev] of before) {
          const now = special.find((s) => s.type === t)!
          expect(now).toBeDefined()
          if (t === 'critThreshold') {
            expect(effectValue(now)).toBeLessThanOrEqual(prev)
            expect(effectValue(now)).toBeGreaterThanOrEqual(ENCHANT_CRIT_ITEM_FLOOR)
          } else {
            expect(effectValue(now)).toBeGreaterThanOrEqual(prev)
          }
        }
        // Upgrades match the preview exactly
        if (result.kind === 'upgraded' && preview.kind === 'upgrade') {
          expect(result.type).toBe(preview.type)
          expect(result.to).toBe(preview.to)
        }
        expect(++guard).toBeLessThan(60) // bounded path to maxed
      }
    }
  })

  it('only adds pool types for the item slot', () => {
    const rng = mulberry32(11)
    const item = makeEnchItem({ type: 'armor', rarity: 'rare', zoneTier: 3 })
    for (let i = 0; i < 3; i++) {
      const result = applyEnchant(item, rng)
      expect(result.kind).toBe('added')
      if (result.kind === 'added') {
        expect(ARMOR_ENCHANT_TYPES).toContain(result.effect.type)
        expect(WEAPON_ENCHANT_TYPES).not.toContain(result.effect.type)
      }
    }
  })

  it('maxed items are never mutated and enchantCount stays put', () => {
    const item = makeEnchItem({ type: 'weapon', rarity: 'common', zoneTier: 0 })
    const rng = mulberry32(13)
    while (applyEnchant(item, rng).kind !== 'maxed') { /* drive to maxed */ }
    const snapshot = structuredClone(item)
    expect(applyEnchant(item, rng).kind).toBe('maxed')
    expect(item).toEqual(snapshot)
  })
})

describe('migrateEnchantedSpecials', () => {
  it('dedupes legacy duplicate types keeping the best value', () => {
    const item = makeEnchItem({
      type: 'weapon', rarity: 'rare', zoneTier: 2, enchantCount: 4,
      special: [
        { type: 'lifesteal', value: 0.08 },
        { type: 'lifesteal', value: 0.2 },
        { type: 'critThreshold', rollsAt: 18 },
        { type: 'critThreshold', rollsAt: 16 },
      ],
    })
    migrateEnchantedSpecials(item)
    const special = item.stats.special!
    expect(special.filter((s) => s.type === 'lifesteal')).toHaveLength(1)
    expect(effectValue(special.find((s) => s.type === 'lifesteal')!)).toBeGreaterThanOrEqual(0.2)
    expect(effectValue(special.find((s) => s.type === 'critThreshold')!)).toBe(16)
  })

  it('raises flat-era pool values to scaled values, never lowers', () => {
    const item = makeEnchItem({
      type: 'weapon', rarity: 'legendary', zoneTier: 7, enchantCount: 3,
      special: [
        { type: 'lifesteal', value: 0.08 },   // flat-era roll → raised
        { type: 'defIgnore', percent: 0.5 },  // strong natural → untouched
      ],
    })
    migrateEnchantedSpecials(item)
    const ls = item.stats.special!.find((s) => s.type === 'lifesteal')!
    const di = item.stats.special!.find((s) => s.type === 'defIgnore')!
    expect(effectValue(ls)).toBe(Math.min(
      enchantEffectValue('lifesteal', 7, 'legendary'),
      enchantCeiling('lifesteal', 7, 'legendary'),
    ))
    expect(effectValue(di)).toBe(0.5)
  })

  it('restores natural specials lost to legacy rerolls', () => {
    const template = ITEM_DEFINITIONS.find((i) => (i.stats.special?.length ?? 0) >= 2)!
    const item = makeEnchItem({
      type: template.type, rarity: template.rarity, zoneTier: template.zoneTier,
      enchantCount: 2, defId: template.id,
      special: [structuredClone(template.stats.special![0])],
    })
    migrateEnchantedSpecials(item)
    expect(item.stats.special!.length).toBeGreaterThanOrEqual(2)
    const types = item.stats.special!.map((s) => s.type)
    expect(types).toContain(template.stats.special![1].type)
  })

  it('is idempotent', () => {
    const item = makeEnchItem({
      type: 'armor', rarity: 'epic', zoneTier: 4, enchantCount: 5,
      special: [
        { type: 'dodge', chance: 0.08 },
        { type: 'dodge', chance: 0.12 },
        { type: 'spellAmp', percent: 0.3 },
      ],
    })
    migrateEnchantedSpecials(item)
    const once = structuredClone(item)
    migrateEnchantedSpecials(item)
    expect(item).toEqual(once)
  })
})

describe('isBetterThan enchant shield', () => {
  function weapon(avgDmg: number, enchantCount = 0): Item {
    return {
      ...makeEnchItem({ type: 'weapon', zoneTier: 4, enchantCount }),
      stats: { minDmg: avgDmg - 2, maxDmg: avgDmg + 2, special: [] },
    }
  }

  it('a next-tier drop (+50% base damage) still beats a 12-level enchanted item', () => {
    const equipped = weapon(100, 12)
    const drop = weapon(150, 0)
    expect(isBetterThan(drop, equipped, 'warrior')).toBe(true)
  })

  it('a marginal sidegrade (+5% base) does not displace a 12-level investment', () => {
    const equipped = weapon(100, 12)
    const drop = weapon(105, 0)
    expect(isBetterThan(drop, equipped, 'warrior')).toBe(false)
  })

  it('weight constant matches the documented 3%/level', () => {
    expect(ENCHANT_EQUIP_WEIGHT).toBe(0.03)
  })
})
