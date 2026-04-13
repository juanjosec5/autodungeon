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
  category: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  allowedClasses: ('warrior' | 'rogue' | 'mage')[] | 'any'
  dropFromZoneIdx?: number  // minimum zone index this item appears in drop pools
  enchantCount?: number     // number of times enchanted
  stats: {
    minDmg?: number
    maxDmg?: number
    defBonus?: number
    hpBonus?: number
    special?: SpecialEffect[]
  }
}

export interface LifetimeStats {
  kills: number
  bossKills: number
  deaths: number
  damageDealt: number
  damageReceived: number
  goldEarned: number
  itemsLooted: number
  itemsScrapped: number
  highestHit: number
  timePlayed: number
}

export type SkillId =
  | 'iron-skin'
  | 'killing-blow'
  | 'veterans-guard'
  | 'lucky-strike'
  | 'survivors-will'
  | 'battle-focus'

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
  currentZone: ZoneId
  skillPoints: number
  skills: Partial<Record<SkillId, number>>
  createdAt: string
  lastSaved: string
  lifetime: LifetimeStats
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

export type ZoneId = 'forest' | 'dungeon' | 'volcano' | 'abyss' | 'shadowrealm' | 'celestial' | 'void' | 'nightmare'
export type ClassId = 'warrior' | 'rogue' | 'mage'
export type RarityId = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/**
 * Auto-scrap mode:
 *   'off'     — disabled
 *   'smart'   — scrap if worse than equipped (any rarity)
 *   'smart-c' — scrap if worse than equipped AND rarity ≤ common
 *   'smart-u' — scrap if worse than equipped AND rarity ≤ uncommon
 *   'smart-r' — scrap if worse than equipped AND rarity ≤ rare
 */
export type ScrapMode = 'off' | 'smart' | 'smart-c' | 'smart-u' | 'smart-r'
