import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '../character'
import { getXPToNextLevel } from '../../game/classes'
import type { Character, Item } from '../../types/index'

// ── localStorage mock (node env has no DOM) ───────────────────────────────────

const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value },
  removeItem: (key: string) => { delete localStorageStore[key] },
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k] },
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

// ── crypto.randomUUID (available in node 19+, stub for safety) ────────────────

if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.randomUUID !== 'function') {
  let counter = 0
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: () => `test-uuid-${++counter}` },
    writable: true,
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: `item-${Math.random()}`,
    name: 'Test Item',
    type: 'weapon',
    category: 'sword',
    rarity: 'common',
    allowedClasses: 'any',
    stats: { minDmg: 5, maxDmg: 10 },
    ...overrides,
  }
}

function getStore() {
  return useCharacterStore()
}

function createTestCharacter(store: ReturnType<typeof getStore>) {
  store.createCharacter('TestHero', 'warrior')
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear()
  setActivePinia(createPinia())
})

// ── createCharacter ───────────────────────────────────────────────────────────

describe('createCharacter', () => {
  it('initializes a warrior with correct base stats', () => {
    const store = getStore()
    store.createCharacter('Hero', 'warrior')
    const char = store.character!
    expect(char.name).toBe('Hero')
    expect(char.class).toBe('warrior')
    expect(char.level).toBe(1)
    expect(char.xp).toBe(0)
    expect(char.gold).toBe(0)
    expect(char.currentZone).toBe('forest')
    expect(char.skillPoints).toBe(0)
    expect(char.currentHP).toBe(char.maxHP)
  })

  it('starts with weapon and armor equipped', () => {
    const store = getStore()
    store.createCharacter('Hero', 'rogue')
    expect(store.character!.gear.weapon).not.toBeNull()
    expect(store.character!.gear.armor).not.toBeNull()
  })

  it('initializes blank lifetime stats', () => {
    const store = getStore()
    store.createCharacter('Hero', 'mage')
    const lt = store.character!.lifetime
    for (const v of Object.values(lt)) expect(v).toBe(0)
  })
})

// ── applyXP ───────────────────────────────────────────────────────────────────

describe('applyXP', () => {
  it('accumulates XP without leveling up', () => {
    const store = getStore()
    createTestCharacter(store)
    const gained = store.applyXP(10)
    expect(gained).toBe(0)
    expect(store.character!.xp).toBe(10)
    expect(store.character!.level).toBe(1)
  })

  it('levels up when XP meets threshold', () => {
    const store = getStore()
    createTestCharacter(store)
    const xpNeeded = store.character!.xpToNext
    const gained = store.applyXP(xpNeeded)
    expect(gained).toBe(1)
    expect(store.character!.level).toBe(2)
    expect(store.character!.xp).toBe(0)
  })

  it('handles multi-level-up in a single call', () => {
    const store = getStore()
    createTestCharacter(store)
    // Enough XP to gain several levels
    const gained = store.applyXP(100_000)
    expect(gained).toBeGreaterThan(1)
    expect(store.character!.level).toBeGreaterThan(2)
  })

  it('awards a skill point at every 5th level', () => {
    const store = getStore()
    createTestCharacter(store)
    // Give enough XP to reach level 5
    let xp = 0
    for (let lvl = 1; lvl <= 4; lvl++) xp += getXPToNextLevel(lvl)
    store.applyXP(xp)
    expect(store.character!.level).toBe(5)
    expect(store.character!.skillPoints).toBe(1)
  })

  it('awards 2 skill points when passing levels 5 and 10', () => {
    const store = getStore()
    createTestCharacter(store)
    let xp = 0
    for (let lvl = 1; lvl <= 9; lvl++) xp += getXPToNextLevel(lvl)
    store.applyXP(xp)
    expect(store.character!.level).toBe(10)
    expect(store.character!.skillPoints).toBe(2)
  })

  it('caps at MAX_LEVEL (100) and does not go over', () => {
    const store = getStore()
    createTestCharacter(store)
    store.applyXP(999_999_999)
    expect(store.character!.level).toBe(100)
  })

  it('caps XP at xpToNext when at max level', () => {
    const store = getStore()
    createTestCharacter(store)
    store.applyXP(999_999_999)
    const char = store.character!
    expect(char.xp).toBeLessThanOrEqual(char.xpToNext)
  })
})

// ── addToInventory ────────────────────────────────────────────────────────────

describe('addToInventory', () => {
  it('adds item to inventory when space available', () => {
    const store = getStore()
    createTestCharacter(store)
    const item = makeItem()
    const result = store.addToInventory(item)
    expect(result).toEqual({ sold: false })
    expect(store.character!.inventory).toContainEqual(item)
  })

  it('auto-sells when inventory is full (20 items)', () => {
    const store = getStore()
    createTestCharacter(store)
    // Fill inventory
    for (let i = 0; i < 20; i++) {
      store.character!.inventory.push(makeItem({ id: `fill-${i}` }))
    }
    const item = makeItem({ rarity: 'common' })
    const result = store.addToInventory(item)
    expect(result.sold).toBe(true)
    if (result.sold) {
      expect(result.reason).toBe('full')
      expect(result.gold).toBe(5) // common sell price
    }
  })

  it('scrap mode=smart: sells item worse than equipped', () => {
    const store = getStore()
    createTestCharacter(store)
    store.setScrapMode('smart')

    // Override equipped weapon with a strong one
    const strong = makeWeapon({ minDmg: 50, maxDmg: 60 })
    store.character!.gear.weapon = strong

    const weak = makeItem({ id: 'weak', stats: { minDmg: 1, maxDmg: 2 } })
    const result = store.addToInventory(weak)
    expect(result.sold).toBe(true)
    if (result.sold) expect(result.reason).toBe('scrap')
  })

  it('scrap mode=smart: keeps item better than equipped', () => {
    const store = getStore()
    createTestCharacter(store)
    store.setScrapMode('smart')

    const weak = makeItem({ id: 'weak-equipped', stats: { minDmg: 1, maxDmg: 2 } })
    store.character!.gear.weapon = weak

    const strong = makeItem({ id: 'strong-loot', stats: { minDmg: 50, maxDmg: 60 } })
    const result = store.addToInventory(strong)
    expect(result.sold).toBe(false)
  })

  it('scrap mode=smart-c: only scraps items up to common rarity', () => {
    const store = getStore()
    createTestCharacter(store)
    store.setScrapMode('smart-c')

    const strong = makeWeapon({ minDmg: 50, maxDmg: 60 })
    store.character!.gear.weapon = strong

    const uncommonWeak = makeItem({ rarity: 'uncommon', stats: { minDmg: 1, maxDmg: 2 } })
    const result = store.addToInventory(uncommonWeak)
    // uncommon > common cap → should NOT be scrapped
    expect(result.sold).toBe(false)
  })

  it('scrap mode=smart-r: scraps items up to rare rarity', () => {
    const store = getStore()
    createTestCharacter(store)
    store.setScrapMode('smart-r')

    const strong = makeWeapon({ minDmg: 50, maxDmg: 60 })
    store.character!.gear.weapon = strong

    const rareWeak = makeItem({ rarity: 'rare', stats: { minDmg: 1, maxDmg: 2 } })
    const result = store.addToInventory(rareWeak)
    expect(result.sold).toBe(true)
    if (result.sold) expect(result.reason).toBe('scrap')
  })

  it('auto-equip: equips item better than equipped', () => {
    const store = getStore()
    createTestCharacter(store)
    store.toggleAutoEquip() // enable

    const weak = makeItem({ id: 'weak-eq', stats: { minDmg: 1, maxDmg: 2 } })
    store.character!.gear.weapon = weak

    const strong = makeItem({ id: 'strong-drop', stats: { minDmg: 50, maxDmg: 60 } })
    const result = store.addToInventory(strong)
    expect(result).toEqual({ sold: false, equipped: true })
    expect(store.character!.gear.weapon?.id).toBe('strong-drop')
    // Old weapon should be in inventory
    expect(store.character!.inventory.some((i) => i.id === 'weak-eq')).toBe(true)
  })

  it('auto-equip + smart scrap: displaced item is scrapped when below rarity cap', () => {
    const store = getStore()
    createTestCharacter(store)
    store.toggleAutoEquip() // enable
    store.setScrapMode('smart-r') // scrap up to rare

    const weak = makeItem({ id: 'weak-eq', rarity: 'common', stats: { minDmg: 1, maxDmg: 2 } })
    store.character!.gear.weapon = weak
    const goldBefore = store.character!.gold

    const strong = makeItem({ id: 'strong-drop', rarity: 'common', stats: { minDmg: 50, maxDmg: 60 } })
    const result = store.addToInventory(strong)
    expect(result).toEqual({ sold: false, equipped: true })
    expect(store.character!.gear.weapon?.id).toBe('strong-drop')
    // Old common weapon should be scrapped (sold), NOT kept in inventory
    expect(store.character!.inventory.some((i) => i.id === 'weak-eq')).toBe(false)
    expect(store.character!.gold).toBeGreaterThan(goldBefore)
  })

  it('auto-equip + smart-r scrap: displaced epic is kept in inventory (above rarity cap)', () => {
    const store = getStore()
    createTestCharacter(store)
    store.toggleAutoEquip()
    store.setScrapMode('smart-r') // scrap only up to rare

    const epicOld = makeItem({ id: 'epic-displaced', rarity: 'epic', stats: { minDmg: 10, maxDmg: 15 } })
    store.character!.gear.weapon = epicOld

    const legendary = makeItem({ id: 'legendary-new', rarity: 'legendary', allowedClasses: ['warrior'], stats: { minDmg: 50, maxDmg: 60 } })
    store.addToInventory(legendary)
    // Epic above rarity cap → stays in inventory
    expect(store.character!.inventory.some((i) => i.id === 'epic-displaced')).toBe(true)
  })

  it('auto-equip: does not equip off-class legendary', () => {
    const store = getStore()
    createTestCharacter(store) // warrior
    store.toggleAutoEquip()

    const legendaryMageOnly = makeItem({
      id: 'mage-legendary',
      rarity: 'legendary',
      allowedClasses: ['mage'],
      stats: { minDmg: 999, maxDmg: 999 },
    })
    const result = store.addToInventory(legendaryMageOnly)
    // Legendary off-class has 0 penalty — should NOT be equipped
    expect(result).not.toEqual(expect.objectContaining({ equipped: true }))
  })
})

// ── spendSkillPoint ───────────────────────────────────────────────────────────

describe('spendSkillPoint', () => {
  it('returns no_points when no skill points available', () => {
    const store = getStore()
    createTestCharacter(store)
    expect(store.character!.skillPoints).toBe(0)
    const result = store.spendSkillPoint('iron-skin')
    expect(result).toBe('no_points')
  })

  it('successfully spends a skill point', () => {
    const store = getStore()
    createTestCharacter(store)
    store.character!.skillPoints = 1
    const result = store.spendSkillPoint('iron-skin')
    expect(result).toBe('ok')
    expect(store.character!.skills['iron-skin']).toBe(1)
    expect(store.character!.skillPoints).toBe(0)
  })

  it('increments skill level on successive spends', () => {
    const store = getStore()
    createTestCharacter(store)
    store.character!.skillPoints = 3
    store.spendSkillPoint('iron-skin')
    store.spendSkillPoint('iron-skin')
    store.spendSkillPoint('iron-skin')
    expect(store.character!.skills['iron-skin']).toBe(3)
  })

  it('returns max_level when skill is at cap', () => {
    const store = getStore()
    createTestCharacter(store)
    // iron-skin maxLevel = 5
    store.character!.skillPoints = 10
    for (let i = 0; i < 5; i++) store.spendSkillPoint('iron-skin')
    const result = store.spendSkillPoint('iron-skin')
    expect(result).toBe('max_level')
    expect(store.character!.skills['iron-skin']).toBe(5) // not incremented
    // Skill point should NOT have been consumed
    expect(store.character!.skillPoints).toBe(5)
  })

  it('returns no_points for unknown skill id', () => {
    const store = getStore()
    createTestCharacter(store)
    store.character!.skillPoints = 5
    // @ts-expect-error intentional invalid id
    const result = store.spendSkillPoint('not-a-real-skill')
    expect(result).toBe('no_points')
  })
})

// ── sellItems ─────────────────────────────────────────────────────────────────

describe('sellItems', () => {
  it('removes items and returns gold earned', () => {
    const store = getStore()
    createTestCharacter(store)
    const a = makeItem({ id: 'a', rarity: 'common' })
    const b = makeItem({ id: 'b', rarity: 'rare' })
    store.character!.inventory.push(a, b)
    const gold = store.sellItems(['a', 'b'])
    expect(gold).toBe(5 + 40) // common + rare sell prices
    expect(store.character!.inventory).toHaveLength(0)
    expect(store.character!.gold).toBeGreaterThanOrEqual(gold)
  })

  it('returns 0 for empty ids array', () => {
    const store = getStore()
    createTestCharacter(store)
    expect(store.sellItems([])).toBe(0)
  })

  it('ignores ids not found in inventory', () => {
    const store = getStore()
    createTestCharacter(store)
    expect(store.sellItems(['ghost-id'])).toBe(0)
  })
})

// ── applyDeathPenalty ─────────────────────────────────────────────────────────

describe('applyDeathPenalty', () => {
  it('reduces XP by 10% and gold by 15%', () => {
    const store = getStore()
    createTestCharacter(store)
    store.character!.xp = 100
    store.character!.gold = 200
    store.applyDeathPenalty()
    expect(store.character!.xp).toBe(90)
    expect(store.character!.gold).toBe(170)
  })

  it('restores HP to maxHP', () => {
    const store = getStore()
    createTestCharacter(store)
    store.character!.currentHP = 1
    store.applyDeathPenalty()
    expect(store.character!.currentHP).toBe(store.character!.maxHP)
  })

  it('does not go below 0 XP or gold', () => {
    const store = getStore()
    createTestCharacter(store)
    store.character!.xp = 0
    store.character!.gold = 0
    store.applyDeathPenalty()
    expect(store.character!.xp).toBe(0)
    expect(store.character!.gold).toBe(0)
  })
})

// ── restoreCharacter ──────────────────────────────────────────────────────────

describe('restoreCharacter', () => {
  it('backfills missing lifetime field from old saves', () => {
    const store = getStore()
    const oldSave = { lifetime: undefined } as unknown as Character
    store.restoreCharacter(oldSave)
    expect(store.character!.lifetime).toBeDefined()
    expect(store.character!.lifetime.kills).toBe(0)
  })

  it('backfills missing skillPoints from old saves', () => {
    const store = getStore()
    const oldSave = { skillPoints: undefined } as unknown as Character
    store.restoreCharacter(oldSave)
    expect(store.character!.skillPoints).toBe(0)
  })

  it('backfills missing skills from old saves', () => {
    const store = getStore()
    const oldSave = { skills: undefined } as unknown as Character
    store.restoreCharacter(oldSave)
    expect(store.character!.skills).toEqual({})
  })
})

// ── Helpers (used in addToInventory tests) ────────────────────────────────────

function makeWeapon(statsOverrides: Partial<Item['stats']> = {}): Item {
  return {
    id: `w-${Math.random()}`,
    name: 'Sword',
    type: 'weapon',
    category: 'sword',
    rarity: 'common',
    allowedClasses: 'any',
    stats: { minDmg: 5, maxDmg: 10, ...statsOverrides },
  }
}
