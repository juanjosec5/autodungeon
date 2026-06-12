import type { Character, SpecialEffect } from '../types/index'
import { SPECIAL_CAPS, getSpecial } from './formulas'
import { CLASS_DEFINITIONS } from './classes'
import { getUpgradeBonuses } from './upgrades'
import { getActiveSet } from './sets'

/**
 * Live build-wide totals for cap-limited effects, mirroring the engine's
 * stacking (gear + class passives + upgrades + sets). Single source of truth
 * for "is this effect already saturated for this character" — consumed by
 * SkillsPanel (cap labels on upgrades) and EnchantPanel (capped-enchant
 * badges).
 */

export interface EffectTotal {
  /** Current build-wide total (uncapped sum) */
  total: number
  /** The hard cap this effect is clamped to at consumption */
  cap: number
  /** True when more of this effect adds nothing */
  saturated: boolean
}

export type CappedEffectType = Extract<
  SpecialEffect['type'],
  'dodge' | 'block' | 'lifesteal' | 'spellAmp' | 'defIgnore' | 'attackSpeedBonus' | 'doublecast'
>

export interface EffectTotals {
  byType: Partial<Record<CappedEffectType, EffectTotal>>
  /** Effective crit threshold after gear/class/upgrades (floor-clamped) */
  critThreshold: number
  critAtFloor: boolean
}

export function getEffectTotals(char: Character): EffectTotals {
  const ub = getUpgradeBonuses(char.upgrades ?? {})
  const weapon = char.gear.weapon
  const armor = char.gear.armor
  const classDef = CLASS_DEFINITIONS[char.class]
  const set = getActiveSet(weapon, armor)?.bonus ?? null

  const dodge = (getSpecial(armor?.stats.special, 'dodge')?.chance ?? 0)
    + ub.dodgeBonus + (set?.type === 'dodge' ? set.value : 0)
  const block = (getSpecial(armor?.stats.special, 'block')?.chance ?? 0) + ub.blockBonus
  const lifesteal = (getSpecial(weapon?.stats.special, 'lifesteal')?.value ?? 0)
    + (classDef.passives.lifestealBase ?? 0) + ub.lifestealBonus
    + (set?.type === 'lifesteal' ? set.value : 0)
  const spellAmp = (getSpecial(weapon?.stats.special, 'spellAmp')?.percent ?? 0)
    + (getSpecial(armor?.stats.special, 'spellAmp')?.percent ?? 0)
    + ub.spellAmpBonus + (set?.type === 'spell_amp' ? set.value : 0)
  const defIgnore = (classDef.passives.defIgnore ?? 0)
    + (getSpecial(weapon?.stats.special, 'defIgnore')?.percent ?? 0) + ub.defIgnoreBonus
  const attackSpeedBonus = getSpecial(weapon?.stats.special, 'attackSpeedBonus')?.percent ?? 0
  const doublecast = getSpecial(weapon?.stats.special, 'doublecast')?.chance ?? 0

  const entry = (total: number, cap: number): EffectTotal => ({
    total,
    cap,
    saturated: total >= cap - 1e-9,
  })

  const baseThreshold = getSpecial(weapon?.stats.special, 'critThreshold')?.rollsAt
    ?? classDef.passives.critThreshold ?? 20
  const critThreshold = Math.max(SPECIAL_CAPS.critThresholdFloor, baseThreshold - ub.critThresholdReduction)

  return {
    byType: {
      dodge: entry(dodge, SPECIAL_CAPS.dodge),
      block: entry(block, SPECIAL_CAPS.block),
      lifesteal: entry(lifesteal, SPECIAL_CAPS.lifesteal),
      spellAmp: entry(spellAmp, SPECIAL_CAPS.spellAmp),
      defIgnore: entry(defIgnore, SPECIAL_CAPS.defIgnore),
      attackSpeedBonus: entry(attackSpeedBonus, SPECIAL_CAPS.attackSpeedPct),
      doublecast: entry(doublecast, SPECIAL_CAPS.doublecast),
    },
    critThreshold,
    critAtFloor: critThreshold <= SPECIAL_CAPS.critThresholdFloor,
  }
}
