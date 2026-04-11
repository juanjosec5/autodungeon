export type SpecialEffect =
  | { type: 'lifesteal'; value: number }
  | { type: 'poison'; dpsMultiplier: number }
  | { type: 'dodge'; chance: number }
  | { type: 'block'; chance: number }
  | { type: 'defIgnore'; percent: number }
  | { type: 'spellAmp'; percent: number }
  | { type: 'critThreshold'; rollsAt: number }
  | { type: 'doublecast'; chance: number }
  | { type: 'attackSpeedBonus'; percent: number }
  | { type: 'regenOnKill'; percent: number }

export interface Item {
  id: string
  defId?: string  // original ITEM_DEFINITIONS id, preserved for sprite lookups
  name: string
  type: 'weapon' | 'armor'
  category: string  // e.g. 'Sword', 'Dagger', 'Staff', 'Shield', 'Robes'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  allowedClasses: ('warrior' | 'rogue' | 'mage')[] | 'any'
  stats: {
    minDmg?: number
    maxDmg?: number
    defBonus?: number
    hpBonus?: number
    special?: SpecialEffect[]
  }
}

export interface Character {
  id: string
  userId?: string
  name: string
  class: 'warrior' | 'rogue' | 'mage'
  level: number
  xp: number
  xpToNext: number
  currentHP: number
  maxHP: number
  stats: {
    str: number
    dex: number
    int: number
  }
  gear: {
    weapon: Item | null
    armor: Item | null
  }
  inventory: Item[]
  gold: number
  currentZone: 'forest' | 'dungeon' | 'volcano' | 'abyss'
  createdAt: string
  lastSaved: string
}

export interface Enemy {
  id: string
  name: string
  zone: ZoneId
  hp: number
  maxHp: number
  atk: [number, number]
  def: number
  xpReward: number
  attackSpeed: number
  isBoss?: boolean
}

export interface CombatLogEntry {
  id: string
  timestamp: number
  message: string
  type: 'hit' | 'crit' | 'miss' | 'loot' | 'levelup' | 'death' | 'regen' | 'sell' | 'zone'
}

export type ZoneId = 'forest' | 'dungeon' | 'volcano' | 'abyss'
export type ClassId = 'warrior' | 'rogue' | 'mage'
export type RarityId = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
