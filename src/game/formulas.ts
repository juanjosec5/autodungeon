import type { Item, ClassId } from '../types/index'

export function d20(): number {
  return Math.floor(Math.random() * 20) + 1
}

export function rollDamage(minDmg: number, maxDmg: number): number {
  return Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg
}

export function calcHit(dex: number, enemyDef: number): boolean {
  return d20() + dex >= enemyDef
}

export function calcCrit(
  roll: number,
  _dex: number,
  classId: ClassId,
  extraCritThreshold?: number,
): boolean {
  switch (classId) {
    case 'warrior':
      return roll === 20
    case 'rogue':
      return roll >= (extraCritThreshold ?? 17)
    case 'mage':
      return roll === 20
  }
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
}): number {
  const { classId, str, int, weapon, isCrit, enemyDef, defIgnorePercent, armorSpellAmp = 0 } = params

  const minDmg = weapon?.stats.minDmg ?? 1
  const maxDmg = weapon?.stats.maxDmg ?? 3
  const statBonus = classId === 'mage' ? int : str

  let raw = rollDamage(minDmg, maxDmg) + statBonus
  if (isCrit) raw = Math.floor(raw * 1.5)

  // SpellAmp: mage-only multiplier (weapon + armor stacked) applied before DEF reduction
  if (classId === 'mage') {
    const weaponSpellAmp = (weapon?.stats.special?.find((s) => s.type === 'spellAmp') as
      | { type: 'spellAmp'; percent: number }
      | undefined)?.percent ?? 0
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
