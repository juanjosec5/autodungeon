import { describe, it, expect } from 'vitest'
import {
  applyStatUpgrades,
  applyUpgrade,
  getUpgradeBonuses,
  STAT_UPGRADE_PCT,
  HP_UPGRADE_PCT,
  UPGRADE_DEFINITIONS,
} from '../upgrades'
import type { Character } from '../../types/index'

const BASE = { str: 100, dex: 50, int: 20, maxHP: 500 }

describe('applyStatUpgrades', () => {
  it('returns base stats unchanged with no picks', () => {
    expect(applyStatUpgrades(BASE, {})).toEqual(BASE)
  })

  it('applies percentage per pick', () => {
    const result = applyStatUpgrades(BASE, { 'str-up': 10, 'hp-up': 5 })
    expect(result.str).toBe(Math.floor(100 * (1 + 10 * STAT_UPGRADE_PCT)))
    expect(result.maxHP).toBe(Math.floor(500 * (1 + 5 * HP_UPGRADE_PCT)))
    expect(result.dex).toBe(50)
    expect(result.int).toBe(20)
  })

  it('scales with the base stat (the late-game relevance fix)', () => {
    const low = applyStatUpgrades({ ...BASE, str: 10 }, { 'str-up': 20 })
    const high = applyStatUpgrades({ ...BASE, str: 200 }, { 'str-up': 20 })
    expect(low.str - 10).toBe(4)     // +40% of 10
    expect(high.str - 200).toBe(80)  // +40% of 200 — same picks, 20× the payoff
  })
})

describe('applyUpgrade', () => {
  it('only increments the picks record (no direct stat mutation)', () => {
    const char = {
      upgrades: {},
      stats: { str: 10, dex: 5, int: 2 },
      maxHP: 100,
      currentHP: 100,
    } as unknown as Character
    applyUpgrade(char, 'str-up')
    expect(char.upgrades['str-up']).toBe(1)
    expect(char.stats.str).toBe(10) // recalcStats applies the effect
  })
})

describe('UPGRADE_DEFINITIONS', () => {
  it('stat upgrades describe percentages', () => {
    for (const id of ['str-up', 'dex-up', 'int-up', 'hp-up'] as const) {
      const def = UPGRADE_DEFINITIONS.find((d) => d.id === id)!
      expect(def.description).toContain('%')
    }
  })

  it('getUpgradeBonuses is unaffected by stat upgrade picks', () => {
    const bonuses = getUpgradeBonuses({ 'str-up': 20, dodge: 2 })
    expect(bonuses.dodgeBonus).toBeCloseTo(0.08)
    expect(bonuses.flatDef).toBe(0)
  })
})
