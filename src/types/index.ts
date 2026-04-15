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
  allowedClasses: ClassId[] | 'any'
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

export type UpgradeId =
  | 'str-up'
  | 'dex-up'
  | 'int-up'
  | 'hp-up'
  | 'flat-def'
  | 'atk-speed'
  | 'crit-chance'
  | 'crit-damage'
  | 'dodge'
  | 'block'
  | 'lifesteal'
  | 'spell-amp'
  | 'def-ignore'
  | 'regen-kill'

// Keep SkillId for backward-compat migration in restoreCharacter
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
  class: ClassId
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
  upgrades: Partial<Record<UpgradeId, number>>
  pendingLevelUps: number
  // Legacy — kept for migration only, not used by engine
  skillPoints?: number
  skills?: Partial<Record<SkillId, number>>
  createdAt: string
  lastSaved: string
  lifetime: LifetimeStats
  zoneAchievements?: Partial<Record<ZoneId, ZoneAchievementProgress>>
  discoveredItems?: string[]
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
export type ClassId = 'warrior' | 'rogue' | 'mage' | 'priest' | 'undead' | 'dragonkin'
export type RarityId = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface ZoneAchievementProgress {
  kills: number
  bossKills: number
  crits: number
  damageDealt: number
  enemyTypesSeen: string[]
  setRewarded: boolean
}

/**
 * Auto-scrap mode:
 *   'off'     — disabled
 *   'smart'   — scrap if worse than equipped (any rarity)
 *   'smart-c' — scrap if worse than equipped AND rarity ≤ common
 *   'smart-u' — scrap if worse than equipped AND rarity ≤ uncommon
 *   'smart-r' — scrap if worse than equipped AND rarity ≤ rare
 */
export type ScrapMode = 'off' | 'smart' | 'smart-c' | 'smart-u' | 'smart-r'

export type PrestigeBonusId =
  | 'xpBoost'
  | 'goldBoost'
  | 'offlineEfficiency'
  | 'startingLevel'
  | 'hpBonus'
  | 'dropRateBonus'

export interface OfflineResult {
  durationMs: number
  kills: number
  goldEarned: number
  xpEarned: number
  itemsFound: Item[]
}

export interface PrestigeState {
  prestigeCount: number
  ascensionTokens: number
  totalTokensEarned: number
  bonuses: Partial<Record<PrestigeBonusId, number>>
}
