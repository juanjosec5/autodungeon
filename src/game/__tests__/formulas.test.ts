import { describe, it, expect, vi } from 'vitest'
import {
  d20,
  rollDamage,
  calcHit,
  calcCrit,
  calcPlayerDamage,
  calcEnemyDamage,
  calcRegenAmount,
  calcDeathPenalty,
  getOffClassPenalty,
  isBetterThan,
  getSpecial,
} from '../formulas'
import type { Item, SpecialEffect } from '../../types/index'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeWeapon(overrides: Partial<Item['stats']> = {}, rarity: Item['rarity'] = 'common', allowedClasses: Item['allowedClasses'] = 'any'): Item {
  return {
    id: 'test-weapon',
    name: 'Test Weapon',
    type: 'weapon',
    category: 'sword',
    rarity,
    allowedClasses,
    stats: { minDmg: 5, maxDmg: 10, ...overrides },
  }
}

function makeArmor(overrides: Partial<Item['stats']> = {}, rarity: Item['rarity'] = 'common', allowedClasses: Item['allowedClasses'] = 'any'): Item {
  return {
    id: 'test-armor',
    name: 'Test Armor',
    type: 'armor',
    category: 'plate',
    rarity,
    allowedClasses,
    stats: { defBonus: 5, hpBonus: 20, ...overrides },
  }
}

// ── d20 ───────────────────────────────────────────────────────────────────────

describe('d20', () => {
  it('returns integers between 1 and 20 inclusive', () => {
    for (let i = 0; i < 200; i++) {
      const roll = d20()
      expect(roll).toBeGreaterThanOrEqual(1)
      expect(roll).toBeLessThanOrEqual(20)
      expect(Number.isInteger(roll)).toBe(true)
    }
  })

  it('produces the full range over many rolls', () => {
    const results = new Set<number>()
    for (let i = 0; i < 10_000; i++) results.add(d20())
    expect(results.size).toBe(20)
  })
})

// ── rollDamage ────────────────────────────────────────────────────────────────

describe('rollDamage', () => {
  it('returns values within [min, max]', () => {
    for (let i = 0; i < 200; i++) {
      const v = rollDamage(3, 9)
      expect(v).toBeGreaterThanOrEqual(3)
      expect(v).toBeLessThanOrEqual(9)
    }
  })

  it('returns exactly min when min === max', () => {
    for (let i = 0; i < 20; i++) {
      expect(rollDamage(7, 7)).toBe(7)
    }
  })

  it('returns an integer', () => {
    for (let i = 0; i < 50; i++) {
      expect(Number.isInteger(rollDamage(1, 100))).toBe(true)
    }
  })
})

// ── calcHit ───────────────────────────────────────────────────────────────────

describe('calcHit', () => {
  it('always hits when d20+dex is well above enemyDef', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99) // d20 = 20
    expect(calcHit(100, 1)).toBe(true)
    vi.restoreAllMocks()
  })

  it('always misses when d20+dex is well below enemyDef', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // d20 = 1
    expect(calcHit(0, 30)).toBe(false)
    vi.restoreAllMocks()
  })

  it('hits when roll equals enemyDef exactly (>= check)', () => {
    // d20 roll = 10 when random = 0.45 → floor(0.45*20)+1 = 10
    vi.spyOn(Math, 'random').mockReturnValue(0.45)
    expect(calcHit(5, 15)).toBe(true) // 10 + 5 = 15 >= 15
    vi.restoreAllMocks()
  })
})

// ── calcCrit ─────────────────────────────────────────────────────────────────

describe('calcCrit', () => {
  describe('warrior (threshold 20 — 5% base crit)', () => {
    it('crits on roll 20', () => expect(calcCrit(20, 'warrior')).toBe(true))
    it('does not crit on roll 19', () => expect(calcCrit(19, 'warrior')).toBe(false))
    it('skillCritBonus=1 lowers threshold to 19', () => expect(calcCrit(19, 'warrior', undefined, 1)).toBe(true))
    it('respects weapon extraCritThreshold', () => {
      expect(calcCrit(19, 'warrior', 19)).toBe(true)
      expect(calcCrit(18, 'warrior', 19)).toBe(false)
    })
  })

  describe('rogue (threshold 17 — 20% base crit)', () => {
    it('crits on roll >= 17', () => {
      expect(calcCrit(17, 'rogue')).toBe(true)
      expect(calcCrit(20, 'rogue')).toBe(true)
    })
    it('does not crit on roll 16', () => expect(calcCrit(16, 'rogue')).toBe(false))
    it('extraCritThreshold overrides class threshold', () => {
      expect(calcCrit(15, 'rogue', 15)).toBe(true)
      expect(calcCrit(14, 'rogue', 15)).toBe(false)
    })
    it('skillCritBonus lowers the threshold', () => expect(calcCrit(15, 'rogue', 17, 2)).toBe(true))
  })

  describe('mage (threshold 20 — 5% base crit)', () => {
    it('crits on roll 20', () => expect(calcCrit(20, 'mage')).toBe(true))
    it('does not crit on roll 19', () => expect(calcCrit(19, 'mage')).toBe(false))
    it('skillCritBonus lowers threshold', () => expect(calcCrit(18, 'mage', undefined, 2)).toBe(true))
  })

  describe('undead (threshold 18 — 15% base crit)', () => {
    it('crits on roll >= 18', () => {
      expect(calcCrit(18, 'undead')).toBe(true)
      expect(calcCrit(20, 'undead')).toBe(true)
    })
    it('does not crit on roll 17', () => expect(calcCrit(17, 'undead')).toBe(false))
    it('skillCritBonus further lowers threshold', () => expect(calcCrit(16, 'undead', undefined, 2)).toBe(true))
  })

  describe('dragonkin (threshold 19 — 10% base crit)', () => {
    it('crits on roll >= 19', () => {
      expect(calcCrit(19, 'dragonkin')).toBe(true)
      expect(calcCrit(20, 'dragonkin')).toBe(true)
    })
    it('does not crit on roll 18', () => expect(calcCrit(18, 'dragonkin')).toBe(false))
  })

  describe('priest (threshold 20 — 5% base crit)', () => {
    it('crits on roll 20', () => expect(calcCrit(20, 'priest')).toBe(true))
    it('does not crit on roll 19', () => expect(calcCrit(19, 'priest')).toBe(false))
  })
})

// ── calcPlayerDamage ──────────────────────────────────────────────────────────

describe('calcPlayerDamage', () => {
  it('returns at least 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // rollDamage returns min
    const dmg = calcPlayerDamage({
      classId: 'warrior', str: 0, int: 0, weapon: makeWeapon({ minDmg: 1, maxDmg: 1 }),
      isCrit: false, enemyDef: 999, defIgnorePercent: 0,
    })
    expect(dmg).toBeGreaterThanOrEqual(1)
    vi.restoreAllMocks()
  })

  it('applies stat bonus: warrior uses str', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // min roll
    const weapon = makeWeapon({ minDmg: 5, maxDmg: 5 })
    const dmg = calcPlayerDamage({ classId: 'warrior', str: 10, int: 0, weapon, isCrit: false, enemyDef: 0, defIgnorePercent: 0 })
    expect(dmg).toBe(15) // 5 + 10 str - 0 def
    vi.restoreAllMocks()
  })

  it('applies stat bonus: mage uses int', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = makeWeapon({ minDmg: 5, maxDmg: 5 })
    const dmg = calcPlayerDamage({ classId: 'mage', str: 0, int: 8, weapon, isCrit: false, enemyDef: 0, defIgnorePercent: 0 })
    expect(dmg).toBe(13) // 5 + 8 int
    vi.restoreAllMocks()
  })

  it('applies crit multiplier (1.5x default)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = makeWeapon({ minDmg: 10, maxDmg: 10 })
    const dmg = calcPlayerDamage({ classId: 'warrior', str: 0, int: 0, weapon, isCrit: true, enemyDef: 0, defIgnorePercent: 0 })
    expect(dmg).toBe(15) // floor(10 * 1.5)
    vi.restoreAllMocks()
  })

  it('applies custom crit multiplier', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = makeWeapon({ minDmg: 10, maxDmg: 10 })
    const dmg = calcPlayerDamage({ classId: 'warrior', str: 0, int: 0, weapon, isCrit: true, enemyDef: 0, defIgnorePercent: 0, critMultiplier: 2.0 })
    expect(dmg).toBe(20)
    vi.restoreAllMocks()
  })

  it('applies spellAmp for mage', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const special: SpecialEffect[] = [{ type: 'spellAmp', percent: 0.5 }]
    const weapon = makeWeapon({ minDmg: 10, maxDmg: 10, special })
    const dmg = calcPlayerDamage({ classId: 'mage', str: 0, int: 0, weapon, isCrit: false, enemyDef: 0, defIgnorePercent: 0 })
    expect(dmg).toBe(15) // floor(10 * 1.5)
    vi.restoreAllMocks()
  })

  it('spellAmp stacks armor + weapon for mage', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const special: SpecialEffect[] = [{ type: 'spellAmp', percent: 0.25 }]
    const weapon = makeWeapon({ minDmg: 10, maxDmg: 10, special })
    const dmg = calcPlayerDamage({ classId: 'mage', str: 0, int: 0, weapon, isCrit: false, enemyDef: 0, defIgnorePercent: 0, armorSpellAmp: 0.25 })
    expect(dmg).toBe(15) // floor(10 * 1.5) — 25+25=50% amp
    vi.restoreAllMocks()
  })

  it('priest uses INT for stat bonus', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = makeWeapon({ minDmg: 5, maxDmg: 5 })
    const dmg = calcPlayerDamage({ classId: 'priest', str: 0, int: 8, weapon, isCrit: false, enemyDef: 0, defIgnorePercent: 0 })
    expect(dmg).toBe(13) // 5 + 8 int
    vi.restoreAllMocks()
  })

  it('spellAmp does NOT apply for priest (even with spellAmp weapon)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const special: SpecialEffect[] = [{ type: 'spellAmp', percent: 1.0 }]
    const weapon = makeWeapon({ minDmg: 10, maxDmg: 10, special })
    const dmg = calcPlayerDamage({ classId: 'priest', str: 0, int: 0, weapon, isCrit: false, enemyDef: 0, defIgnorePercent: 0 })
    expect(dmg).toBe(10) // no amp
    vi.restoreAllMocks()
  })

  it('spellAmp does NOT apply for warrior', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const special: SpecialEffect[] = [{ type: 'spellAmp', percent: 1.0 }]
    const weapon = makeWeapon({ minDmg: 10, maxDmg: 10, special })
    const dmg = calcPlayerDamage({ classId: 'warrior', str: 0, int: 0, weapon, isCrit: false, enemyDef: 0, defIgnorePercent: 0 })
    expect(dmg).toBe(10) // no amp
    vi.restoreAllMocks()
  })

  it('reduces damage by effective DEF', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = makeWeapon({ minDmg: 20, maxDmg: 20 })
    const dmg = calcPlayerDamage({ classId: 'warrior', str: 0, int: 0, weapon, isCrit: false, enemyDef: 10, defIgnorePercent: 0 })
    expect(dmg).toBe(10)
    vi.restoreAllMocks()
  })

  it('defIgnorePercent reduces effective DEF', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const weapon = makeWeapon({ minDmg: 20, maxDmg: 20 })
    // defIgnorePercent=0.5 → effectiveDef = floor(10 * 0.5) = 5
    const dmg = calcPlayerDamage({ classId: 'warrior', str: 0, int: 0, weapon, isCrit: false, enemyDef: 10, defIgnorePercent: 0.5 })
    expect(dmg).toBe(15)
    vi.restoreAllMocks()
  })

  it('uses 1-3 damage when no weapon', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const dmg = calcPlayerDamage({ classId: 'warrior', str: 0, int: 0, weapon: null, isCrit: false, enemyDef: 0, defIgnorePercent: 0 })
    expect(dmg).toBeGreaterThanOrEqual(1)
    vi.restoreAllMocks()
  })
})

// ── calcEnemyDamage ───────────────────────────────────────────────────────────

describe('calcEnemyDamage', () => {
  it('returns at least 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(calcEnemyDamage([1, 1], 999)).toBe(1)
    vi.restoreAllMocks()
  })

  it('subtracts player DEF', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // min roll
    expect(calcEnemyDamage([20, 20], 5)).toBe(15)
    vi.restoreAllMocks()
  })
})

// ── calcRegenAmount ───────────────────────────────────────────────────────────

describe('calcRegenAmount', () => {
  it('returns value between 15% and 35% of maxHP', () => {
    for (let i = 0; i < 100; i++) {
      const regen = calcRegenAmount(100)
      expect(regen).toBeGreaterThanOrEqual(15)
      expect(regen).toBeLessThanOrEqual(35)
    }
  })

  it('scales with maxHP', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // min ~15%
    expect(calcRegenAmount(200)).toBe(30)
    vi.restoreAllMocks()
  })
})

// ── calcDeathPenalty ──────────────────────────────────────────────────────────

describe('calcDeathPenalty', () => {
  it('loses 10% XP and 15% gold', () => {
    const { xpLoss, goldLoss } = calcDeathPenalty(100, 200)
    expect(xpLoss).toBe(10)
    expect(goldLoss).toBe(30)
  })

  it('floors fractional losses', () => {
    const { xpLoss, goldLoss } = calcDeathPenalty(9, 9)
    expect(xpLoss).toBe(0) // floor(0.9) = 0
    expect(goldLoss).toBe(1) // floor(1.35) = 1
  })

  it('returns 0 losses for 0 values', () => {
    const { xpLoss, goldLoss } = calcDeathPenalty(0, 0)
    expect(xpLoss).toBe(0)
    expect(goldLoss).toBe(0)
  })
})

// ── getOffClassPenalty ────────────────────────────────────────────────────────

describe('getOffClassPenalty', () => {
  it('returns 1.0 for allowedClasses="any"', () => {
    expect(getOffClassPenalty(makeWeapon(), 'warrior')).toBe(1.0)
  })

  it('returns 1.0 for matching class', () => {
    const item = makeWeapon({}, 'common', ['warrior', 'rogue'])
    expect(getOffClassPenalty(item, 'warrior')).toBe(1.0)
    expect(getOffClassPenalty(item, 'rogue')).toBe(1.0)
  })

  it('returns 0.7 for off-class non-legendary', () => {
    const item = makeWeapon({}, 'rare', ['warrior'])
    expect(getOffClassPenalty(item, 'mage')).toBe(0.7)
  })

  it('returns 0 for off-class legendary', () => {
    const item = makeWeapon({}, 'legendary', ['warrior'])
    expect(getOffClassPenalty(item, 'mage')).toBe(0)
  })
})

// ── isBetterThan ─────────────────────────────────────────────────────────────

describe('isBetterThan', () => {
  it('correctly compares weapons by average damage', () => {
    const stronger = makeWeapon({ minDmg: 15, maxDmg: 20 }) // avg 17.5
    const weaker   = makeWeapon({ minDmg: 5,  maxDmg: 10 }) // avg 7.5
    expect(isBetterThan(stronger, weaker, 'warrior')).toBe(true)
    expect(isBetterThan(weaker, stronger, 'warrior')).toBe(false)
  })

  it('equal weapons return false (not strictly better)', () => {
    const a = makeWeapon({ minDmg: 10, maxDmg: 10 })
    const b = makeWeapon({ minDmg: 10, maxDmg: 10 })
    expect(isBetterThan(a, b, 'warrior')).toBe(false)
  })

  it('correctly compares armors: DEF×3 + HP', () => {
    const better = makeArmor({ defBonus: 10, hpBonus: 0 }) // 30
    const worse  = makeArmor({ defBonus: 0,  hpBonus: 29 }) // 29
    expect(isBetterThan(better, worse, 'warrior')).toBe(true)
    expect(isBetterThan(worse, better, 'warrior')).toBe(false)
  })

  it('applies off-class penalty when comparing', () => {
    // New item: warrior-only with high damage — penalty for mage = 0.7
    const newW   = makeWeapon({ minDmg: 20, maxDmg: 20 }, 'rare', ['warrior']) // eff avg = 14
    // Equipped: any-class with lower base — no penalty
    const equip  = makeWeapon({ minDmg: 15, maxDmg: 15 }, 'common', 'any')    // eff avg = 15
    // Even though newW has higher base, penalty makes it worse for mage
    expect(isBetterThan(newW, equip, 'mage')).toBe(false)
  })
})

// ── getSpecial ────────────────────────────────────────────────────────────────

describe('getSpecial', () => {
  const special: SpecialEffect[] = [
    { type: 'lifesteal', value: 0.1 },
    { type: 'poison', dpsMultiplier: 0.5 },
    { type: 'dodge', chance: 0.15 },
  ]

  it('returns the matching effect', () => {
    const result = getSpecial(special, 'lifesteal')
    expect(result).toEqual({ type: 'lifesteal', value: 0.1 })
  })

  it('returns undefined when type not present', () => {
    expect(getSpecial(special, 'block')).toBeUndefined()
  })

  it('returns undefined for undefined input', () => {
    expect(getSpecial(undefined, 'lifesteal')).toBeUndefined()
  })

  it('returns undefined for empty array', () => {
    expect(getSpecial([], 'lifesteal')).toBeUndefined()
  })

  it('narrows the type correctly (type-level check via property access)', () => {
    const result = getSpecial(special, 'poison')
    // TypeScript narrows result to { type: 'poison'; dpsMultiplier: number }
    expect(result?.dpsMultiplier).toBe(0.5)
  })
})
