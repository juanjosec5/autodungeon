import type { ClassId } from '../types/index'

interface ClassPassives {
  armorEffectiveness?: number // multiply final DEF bonus by this value
  regenChance: number
  critThreshold?: number // rogue: crits on roll >= this OR dex >= 12
  defIgnore?: number // mage: ignore this fraction of enemy DEF
  critCondition?: 'natural20' // warrior/mage: crit only on roll === 20
}

interface ClassDefinition {
  baseHP: number
  baseSTR: number
  baseDEX: number
  baseINT: number
  attackSpeed: number
  hpPerLevel: number
  strPerLevel: number
  dexPerLevel: number
  intPerLevel: number
  passives: ClassPassives
}

export const CLASS_DEFINITIONS: Record<ClassId, ClassDefinition> = {
  warrior: {
    baseHP: 120,
    baseSTR: 8,
    baseDEX: 4,
    baseINT: 2,
    attackSpeed: 1800,
    hpPerLevel: 12,
    strPerLevel: 2,
    dexPerLevel: 0.5,
    intPerLevel: 0,
    passives: {
      armorEffectiveness: 1.1,
      regenChance: 0.4,
      critCondition: 'natural20',
    },
  },
  rogue: {
    baseHP: 80,
    baseSTR: 5,
    baseDEX: 9,
    baseINT: 3,
    attackSpeed: 1100,
    hpPerLevel: 7,
    strPerLevel: 1,
    dexPerLevel: 2,
    intPerLevel: 0.5,
    passives: {
      critThreshold: 17,
      regenChance: 0.3,
    },
  },
  mage: {
    baseHP: 70,
    baseSTR: 2,
    baseDEX: 5,
    baseINT: 10,
    attackSpeed: 1500,
    hpPerLevel: 5,
    strPerLevel: 0,
    dexPerLevel: 1,
    intPerLevel: 2.5,
    passives: {
      defIgnore: 0.2,
      regenChance: 0.3,
      critCondition: 'natural20',
    },
  },
}

export function getStatsAtLevel(
  classId: ClassId,
  level: number,
): { hp: number; str: number; dex: number; int: number; maxHP: number } {
  const def = CLASS_DEFINITIONS[classId]
  const gained = level - 1
  const hp = Math.floor(def.baseHP + def.hpPerLevel * gained)
  const str = Math.floor(def.baseSTR + def.strPerLevel * gained)
  const dex = Math.floor(def.baseDEX + def.dexPerLevel * gained)
  const int = Math.floor(def.baseINT + def.intPerLevel * gained)
  return { hp, str, dex, int, maxHP: hp }
}

export function getXPToNextLevel(level: number): number {
  return Math.floor(100 * 1.15 ** level)
}
