import { describe, it, expect } from 'vitest'
import { getStatsAtLevel, getXPToNextLevel, CLASS_DEFINITIONS } from '../classes'

describe('getStatsAtLevel', () => {
  describe('warrior', () => {
    it('has correct stats at level 1', () => {
      const stats = getStatsAtLevel('warrior', 1)
      const def = CLASS_DEFINITIONS.warrior
      expect(stats.maxHP).toBe(def.baseHP)
      expect(stats.str).toBe(def.baseSTR)
      expect(stats.dex).toBe(def.baseDEX)
      expect(stats.int).toBe(def.baseINT)
    })

    it('hp and maxHP are equal', () => {
      const stats = getStatsAtLevel('warrior', 10)
      expect(stats.hp).toBe(stats.maxHP)
    })

    it('grows HP correctly per level', () => {
      const level10 = getStatsAtLevel('warrior', 10)
      const expected = Math.floor(CLASS_DEFINITIONS.warrior.baseHP + CLASS_DEFINITIONS.warrior.hpPerLevel * 9)
      expect(level10.maxHP).toBe(expected)
    })

    it('grows STR correctly per level', () => {
      const level20 = getStatsAtLevel('warrior', 20)
      const expected = Math.floor(CLASS_DEFINITIONS.warrior.baseSTR + CLASS_DEFINITIONS.warrior.strPerLevel * 19)
      expect(level20.str).toBe(expected)
    })
  })

  describe('rogue', () => {
    it('has correct base stats at level 1', () => {
      const stats = getStatsAtLevel('rogue', 1)
      const def = CLASS_DEFINITIONS.rogue
      expect(stats.maxHP).toBe(def.baseHP)
      expect(stats.str).toBe(def.baseSTR)
      expect(stats.dex).toBe(def.baseDEX)
      expect(stats.int).toBe(def.baseINT)
    })

    it('grows DEX faster than warrior', () => {
      const rogueL50 = getStatsAtLevel('rogue', 50)
      const warriorL50 = getStatsAtLevel('warrior', 50)
      expect(rogueL50.dex).toBeGreaterThan(warriorL50.dex)
    })
  })

  describe('mage', () => {
    it('has correct base stats at level 1', () => {
      const stats = getStatsAtLevel('mage', 1)
      const def = CLASS_DEFINITIONS.mage
      expect(stats.maxHP).toBe(def.baseHP)
      expect(stats.int).toBe(def.baseINT)
    })

    it('has the lowest base HP', () => {
      const mageHP = getStatsAtLevel('mage', 1).maxHP
      const warriorHP = getStatsAtLevel('warrior', 1).maxHP
      const rogueHP = getStatsAtLevel('rogue', 1).maxHP
      expect(mageHP).toBeLessThan(warriorHP)
      expect(mageHP).toBeLessThan(rogueHP)
    })

    it('has highest INT at high levels', () => {
      const mageL100 = getStatsAtLevel('mage', 100)
      const warriorL100 = getStatsAtLevel('warrior', 100)
      const rogueL100 = getStatsAtLevel('rogue', 100)
      expect(mageL100.int).toBeGreaterThan(warriorL100.int)
      expect(mageL100.int).toBeGreaterThan(rogueL100.int)
    })
  })

  it('all stats are non-negative integers at all levels', () => {
    const classes = ['warrior', 'rogue', 'mage', 'priest', 'undead', 'dragonkin'] as const
    for (const cls of classes) {
      for (const level of [1, 5, 10, 50, 100]) {
        const stats = getStatsAtLevel(cls, level)
        for (const val of [stats.maxHP, stats.str, stats.dex, stats.int]) {
          expect(val).toBeGreaterThanOrEqual(0)
          expect(Number.isInteger(val)).toBe(true)
        }
      }
    }
  })
})

describe('priest', () => {
  it('has correct base stats at level 1', () => {
    const stats = getStatsAtLevel('priest', 1)
    expect(stats.maxHP).toBe(90)
    expect(stats.int).toBe(8)
    expect(stats.str).toBe(3)
  })

  it('gains INT at the same rate as post-nerf mage (2 per level)', () => {
    const priestL1  = getStatsAtLevel('priest', 1)
    const priestL11 = getStatsAtLevel('priest', 11)
    // 10 levels × 2.0 intPerLevel = 20 INT gained
    expect(priestL11.int - priestL1.int).toBe(20)
  })
})

describe('undead', () => {
  it('has correct base stats at level 1', () => {
    const stats = getStatsAtLevel('undead', 1)
    expect(stats.maxHP).toBe(100)
    expect(stats.str).toBe(10)
  })

  it('has the highest STR at level 100', () => {
    const undeadL100  = getStatsAtLevel('undead', 100)
    const warriorL100 = getStatsAtLevel('warrior', 100)
    expect(undeadL100.str).toBeGreaterThan(warriorL100.str)
  })
})

describe('dragonkin', () => {
  it('has correct base stats at level 1', () => {
    const stats = getStatsAtLevel('dragonkin', 1)
    expect(stats.maxHP).toBe(115)
    expect(stats.str).toBe(7)
  })

  it('has the highest HP per level (11)', () => {
    const dragonkinL50 = getStatsAtLevel('dragonkin', 50)
    const rogueL50     = getStatsAtLevel('rogue', 50)
    expect(dragonkinL50.maxHP).toBeGreaterThan(rogueL50.maxHP)
  })
})

describe('getXPToNextLevel', () => {
  it('returns 113 for level 1 (floor(100 * 1.13^1))', () => {
    expect(getXPToNextLevel(1)).toBe(Math.floor(100 * 1.13))
  })

  it('increases monotonically', () => {
    for (let lvl = 1; lvl < 99; lvl++) {
      expect(getXPToNextLevel(lvl + 1)).toBeGreaterThan(getXPToNextLevel(lvl))
    }
  })

  it('returns a positive integer at all levels', () => {
    for (const lvl of [1, 10, 50, 99, 100]) {
      const xp = getXPToNextLevel(lvl)
      expect(xp).toBeGreaterThan(0)
      expect(Number.isInteger(xp)).toBe(true)
    }
  })
})
