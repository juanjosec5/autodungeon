import { describe, it, expect } from 'vitest'
import { getSkillBonuses, SKILL_DEFINITIONS } from '../skills'

describe('getSkillBonuses', () => {
  it('returns all zeros for empty skills object', () => {
    const bonuses = getSkillBonuses({})
    expect(bonuses.flatDef).toBe(0)
    expect(bonuses.critThresholdReduction).toBe(0)
    expect(bonuses.blockBonus).toBe(0)
    expect(bonuses.dodgeBonus).toBe(0)
    expect(bonuses.spellAmpBonus).toBe(0)
    expect(bonuses.critDamageBonus).toBe(0)
  })

  it('iron-skin: +3 DEF per level', () => {
    expect(getSkillBonuses({ 'iron-skin': 1 }).flatDef).toBe(3)
    expect(getSkillBonuses({ 'iron-skin': 5 }).flatDef).toBe(15)
  })

  it('killing-blow: reduces crit threshold by 1 per level', () => {
    expect(getSkillBonuses({ 'killing-blow': 1 }).critThresholdReduction).toBe(1)
    expect(getSkillBonuses({ 'killing-blow': 3 }).critThresholdReduction).toBe(3)
  })

  it("veterans-guard: +0.04 block per level", () => {
    const bonuses = getSkillBonuses({ 'veterans-guard': 5 })
    expect(bonuses.blockBonus).toBeCloseTo(0.20, 5)
  })

  it("survivors-will: +0.03 dodge per level", () => {
    const bonuses = getSkillBonuses({ 'survivors-will': 5 })
    expect(bonuses.dodgeBonus).toBeCloseTo(0.15, 5)
  })

  it('battle-focus: +0.06 spell amp per level', () => {
    const bonuses = getSkillBonuses({ 'battle-focus': 5 })
    expect(bonuses.spellAmpBonus).toBeCloseTo(0.30, 5)
  })

  it('lucky-strike: +0.10 crit damage per level', () => {
    const bonuses = getSkillBonuses({ 'lucky-strike': 5 })
    expect(bonuses.critDamageBonus).toBeCloseTo(0.50, 5)
  })

  it('combines multiple skills correctly', () => {
    const bonuses = getSkillBonuses({
      'iron-skin': 2,
      'killing-blow': 1,
      'lucky-strike': 3,
    })
    expect(bonuses.flatDef).toBe(6)
    expect(bonuses.critThresholdReduction).toBe(1)
    expect(bonuses.critDamageBonus).toBeCloseTo(0.30, 5)
    expect(bonuses.blockBonus).toBe(0)
    expect(bonuses.dodgeBonus).toBe(0)
  })
})

describe('SKILL_DEFINITIONS', () => {
  it('has 6 skills', () => {
    expect(SKILL_DEFINITIONS).toHaveLength(6)
  })

  it('all skills have unique IDs', () => {
    const ids = SKILL_DEFINITIONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all skills have positive maxLevel', () => {
    for (const skill of SKILL_DEFINITIONS) {
      expect(skill.maxLevel).toBeGreaterThan(0)
    }
  })
})
