import type { Item, ClassId, SpecialEffect } from '../types/index'
import { CLASS_DEFINITIONS } from './classes'

export function d20(): number {
  return Math.floor(Math.random() * 20) + 1
}

export function rollDamage(minDmg: number, maxDmg: number): number {
  return Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg
}

/**
 * Type-safe lookup for a specific SpecialEffect by type.
 * Returns the narrowed effect object or undefined.
 */
export function getSpecial<K extends SpecialEffect['type']>(
  special: SpecialEffect[] | undefined,
  type: K,
): Extract<SpecialEffect, { type: K }> | undefined {
  return special?.find((s): s is Extract<SpecialEffect, { type: K }> => s.type === type)
}

export function calcHit(dex: number, enemyDef: number): boolean {
  return d20() + dex >= enemyDef
}

export function calcCrit(
  roll: number,
  classId: ClassId,
  extraCritThreshold?: number,
  skillCritBonus: number = 0,
): boolean {
  const baseCritThreshold = CLASS_DEFINITIONS[classId].passives.critThreshold ?? 20
  return roll >= (extraCritThreshold ?? baseCritThreshold) - skillCritBonus
}

export function calcPlayerDamage(params: {
  classId: ClassId
  str: number
  int: number
  weapon: Item | null
  isCrit: boolean
  enemyDef: number
  defIgnorePercent: number
  armorSpellAmp?: number
  critMultiplier?: number
}): number {
  const { classId, str, int, weapon, isCrit, enemyDef, defIgnorePercent, armorSpellAmp = 0, critMultiplier = 1.5 } = params

  const minDmg = weapon?.stats.minDmg ?? 1
  const maxDmg = weapon?.stats.maxDmg ?? 3
  const statBonus = CLASS_DEFINITIONS[classId].damageStat === 'int' ? int : str

  let raw = rollDamage(minDmg, maxDmg) + statBonus
  if (isCrit) raw = Math.floor(raw * critMultiplier)

  // SpellAmp: mage-only multiplier (weapon + armor stacked) applied before DEF reduction
  if (classId === 'mage') {
    const weaponSpellAmp = getSpecial(weapon?.stats.special, 'spellAmp')?.percent ?? 0
    const totalSpellAmp = weaponSpellAmp + armorSpellAmp
    if (totalSpellAmp > 0) raw = Math.floor(raw * (1 + totalSpellAmp))
  }

  const effectiveDef = Math.floor(enemyDef * (1 - defIgnorePercent))
  return Math.max(1, raw - effectiveDef)
}

export function calcEnemyDamage(atk: [number, number], playerDef: number): number {
  return Math.max(1, rollDamage(atk[0], atk[1]) - playerDef)
}

export function calcRegenAmount(maxHP: number): number {
  return Math.floor((Math.random() * (0.35 - 0.15) + 0.15) * maxHP)
}

export function calcDeathPenalty(
  currentXP: number,
  gold: number,
): { xpLoss: number; goldLoss: number } {
  return {
    xpLoss: Math.floor(currentXP * 0.1),
    goldLoss: Math.floor(gold * 0.15),
  }
}

export function getOffClassPenalty(item: Item, classId: ClassId): number {
  if (item.allowedClasses === 'any') return 1.0
  if ((item.allowedClasses as ClassId[]).includes(classId)) return 1.0
  if (item.rarity === 'legendary') return 0
  return 0.7
}

/**
 * Compares two same-slot items using effective stats (off-class penalty applied to both).
 * Weapons: effective average damage. Armor: weighted DEF×3 + HP.
 */
export function isBetterThan(newItem: Item, equipped: Item, classId: ClassId): boolean {
  const newPenalty = getOffClassPenalty(newItem, classId)
  const eqPenalty  = getOffClassPenalty(equipped, classId)
  if (newItem.type === 'weapon') {
    const newEff = ((newItem.stats.minDmg ?? 0) + (newItem.stats.maxDmg ?? 0)) / 2 * newPenalty
    const eqEff  = ((equipped.stats.minDmg ?? 0) + (equipped.stats.maxDmg ?? 0)) / 2 * eqPenalty
    return newEff > eqEff
  } else {
    const newEff = ((newItem.stats.defBonus ?? 0) * 3 + (newItem.stats.hpBonus ?? 0)) * newPenalty
    const eqEff  = ((equipped.stats.defBonus ?? 0) * 3 + (equipped.stats.hpBonus ?? 0)) * eqPenalty
    return newEff > eqEff
  }
}
