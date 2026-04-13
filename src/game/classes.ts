import type { ClassId } from '../types/index'

interface ClassPassives {
  armorEffectiveness?: number // warrior/dragonkin: multiply armor DEF bonus
  regenChance: number
  critThreshold?: number      // rogue/undead/dragonkin: crits on roll >= this value
  defIgnore?: number          // mage: ignore this fraction of enemy DEF
  regenPower?: number         // priest: multiply heal amount (e.g. 1.4 = +40% healing)
  lifestealBase?: number      // undead: innate lifesteal fraction on every hit
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
  damageStat: 'str' | 'int'  // which stat bonus applies to weapon damage
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
    damageStat: 'str',
    passives: {
      armorEffectiveness: 1.1,
      regenChance: 0.4,
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
    damageStat: 'str',
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
    intPerLevel: 2.0,
    damageStat: 'int',
    passives: {
      defIgnore: 0.15,
      regenChance: 0.3,
    },
  },
  priest: {
    baseHP: 90,
    baseSTR: 3,
    baseDEX: 5,
    baseINT: 8,
    attackSpeed: 1700,
    hpPerLevel: 9,
    strPerLevel: 0,
    dexPerLevel: 0.5,
    intPerLevel: 2.0,
    damageStat: 'int',
    passives: {
      regenChance: 0.70,
      regenPower: 1.4,
    },
  },
  undead: {
    baseHP: 100,
    baseSTR: 10,
    baseDEX: 4,
    baseINT: 2,
    attackSpeed: 1500,
    hpPerLevel: 8,
    strPerLevel: 2.5,
    dexPerLevel: 0.5,
    intPerLevel: 0,
    damageStat: 'str',
    passives: {
      critThreshold: 18,
      regenChance: 0.0,
      lifestealBase: 0.10,
    },
  },
  dragonkin: {
    baseHP: 115,
    baseSTR: 7,
    baseDEX: 3,
    baseINT: 4,
    attackSpeed: 1900,
    hpPerLevel: 11,
    strPerLevel: 1.5,
    dexPerLevel: 0.5,
    intPerLevel: 0.5,
    damageStat: 'str',
    passives: {
      armorEffectiveness: 1.25,
      critThreshold: 19,
      regenChance: 0.3,
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
  return Math.floor(100 * 1.13 ** level)
}
