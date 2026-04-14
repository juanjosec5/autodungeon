import type { ZoneId, Item, ZoneAchievementProgress } from '../types/index'

export function blankZoneProgress(): ZoneAchievementProgress {
  return { kills: 0, bossKills: 0, crits: 0, damageDealt: 0, enemyTypesSeen: [], setRewarded: false }
}

export interface Challenge {
  id: string
  label: string
  /** Raw description — numbers unformatted, formatted in UI via fmtNum */
  description: string
  progress: (p: ZoneAchievementProgress) => number
  target: number
  isDone: (p: ZoneAchievementProgress) => boolean
}

export interface RewardItemTemplate {
  defId: string
  name: string
  type: 'weapon' | 'armor'
  category: string
  rarity: Item['rarity']
  stats: Item['stats']
}

export interface ZoneReward {
  weapon: RewardItemTemplate
  armor: RewardItemTemplate
}

export interface ZoneChallengeSet {
  zone: ZoneId
  zoneName: string
  challenges: Challenge[]
  reward: ZoneReward
}

// ── Challenge builders ────────────────────────────────────────────────────────

function killC(target: number, label: string): Challenge {
  return {
    id: 'kills', label,
    description: `Kill ${target} enemies in this zone`,
    progress: (p) => p.kills,
    target,
    isDone: (p) => p.kills >= target,
  }
}

function bossC(bossName: string, times: number): Challenge {
  return {
    id: 'boss-kills', label: `${bossName} Slayer`,
    description: `Defeat ${bossName} ${times}×`,
    progress: (p) => p.bossKills,
    target: times,
    isDone: (p) => p.bossKills >= times,
  }
}

function critC(target: number, label: string): Challenge {
  return {
    id: 'crits', label,
    description: `Land ${target} critical hits in this zone`,
    progress: (p) => p.crits,
    target,
    isDone: (p) => p.crits >= target,
  }
}

function damageC(target: number, label: string): Challenge {
  return {
    id: 'damage', label,
    description: `Deal ${target} total damage in this zone`,
    progress: (p) => p.damageDealt,
    target,
    isDone: (p) => p.damageDealt >= target,
  }
}

function typesC(ids: string[]): Challenge {
  return {
    id: 'enemy-types', label: 'Zone Cleanse',
    description: `Kill every enemy type (${ids.length} types)`,
    progress: (p) => ids.filter((id) => p.enemyTypesSeen.includes(id)).length,
    target: ids.length,
    isDone: (p) => ids.every((id) => p.enemyTypesSeen.includes(id)),
  }
}

// ── Reward item builders ──────────────────────────────────────────────────────

function rewardWeapon(defId: string, name: string, rarity: Item['rarity'], category: string, minDmg: number, maxDmg: number, special: Item['stats']['special']): RewardItemTemplate {
  return { defId, name, type: 'weapon', category, rarity, stats: { minDmg, maxDmg, special } }
}

function rewardArmor(defId: string, name: string, rarity: Item['rarity'], defBonus: number, hpBonus: number, special: Item['stats']['special']): RewardItemTemplate {
  return { defId, name, type: 'armor', category: 'Plate Armor', rarity, stats: { defBonus, hpBonus, special } }
}

// ── Zone challenge sets ───────────────────────────────────────────────────────

export const ZONE_CHALLENGE_SETS: ZoneChallengeSet[] = [
  {
    zone: 'forest', zoneName: 'Forest',
    challenges: [
      typesC(['wolf', 'giant-spider', 'goblin', 'goblin-shaman', 'bandit']),
      killC(100, 'Forest Slaughter'),
      bossC('Forest Troll', 10),
      critC(25, 'Sharp Eyes'),
    ],
    reward: {
      weapon: rewardWeapon('reward-forest-blade', 'Verdant Edge', 'epic', 'Sword', 20, 34, [
        { type: 'lifesteal', value: 0.10 },
        { type: 'critThreshold', rollsAt: 18 },
      ]),
      armor: rewardArmor('reward-forest-plate', 'Forest Guardian Plate', 'epic', 14, 55, [
        { type: 'block', chance: 0.10 },
        { type: 'regenOnKill', percent: 0.08 },
      ]),
    },
  },

  {
    zone: 'dungeon', zoneName: 'Dungeon',
    challenges: [
      killC(150, 'Dungeon Delver'),
      bossC('Dark Knight', 10),
      damageC(30_000, 'Brute Force'),
      critC(50, 'Deadly Precision'),
    ],
    reward: {
      weapon: rewardWeapon('reward-dungeon-axe', 'Dungeon Reaper', 'epic', 'Axe', 28, 45, [
        { type: 'defIgnore', percent: 0.18 },
        { type: 'attackSpeedBonus', percent: 0.10 },
      ]),
      armor: rewardArmor('reward-dungeon-plate', 'Dungeon Fortress', 'epic', 18, 70, [
        { type: 'block', chance: 0.12 },
        { type: 'regenOnKill', percent: 0.10 },
      ]),
    },
  },

  {
    zone: 'volcano', zoneName: 'Volcano',
    challenges: [
      killC(200, 'Pyromaniac'),
      bossC('Dragon', 25),
      damageC(200_000, 'Inferno'),
      critC(100, 'Fire Eyes'),
    ],
    reward: {
      weapon: rewardWeapon('reward-volcano-sword', 'Eruption Blade', 'legendary', 'Sword', 38, 60, [
        { type: 'lifesteal', value: 0.12 },
        { type: 'defIgnore', percent: 0.15 },
        { type: 'attackSpeedBonus', percent: 0.08 },
      ]),
      armor: rewardArmor('reward-volcano-plate', 'Magma Shell', 'legendary', 26, 92, [
        { type: 'block', chance: 0.15 },
        { type: 'regenOnKill', percent: 0.15 },
      ]),
    },
  },

  {
    zone: 'abyss', zoneName: 'Abyss',
    challenges: [
      killC(200, 'Abyss Walker'),
      bossC('Abyssal Titan', 25),
      damageC(1_000_000, 'Void Power'),
      critC(150, 'Abyss Sight'),
    ],
    reward: {
      weapon: rewardWeapon('reward-abyss-axe', 'Abyssal Fang', 'legendary', 'Axe', 48, 76, [
        { type: 'defIgnore', percent: 0.22 },
        { type: 'lifesteal', value: 0.12 },
        { type: 'critThreshold', rollsAt: 17 },
      ]),
      armor: rewardArmor('reward-abyss-plate', 'Abyss Guard', 'legendary', 34, 115, [
        { type: 'block', chance: 0.18 },
        { type: 'regenOnKill', percent: 0.18 },
      ]),
    },
  },

  {
    zone: 'shadowrealm', zoneName: 'Shadowrealm',
    challenges: [
      killC(250, 'Shadow Reaper'),
      bossC('Dread Sovereign', 35),
      damageC(5_000_000, 'Shadow Force'),
      critC(200, 'Shadow Eyes'),
    ],
    reward: {
      weapon: rewardWeapon('reward-shadow-axe', 'Dread Edge', 'legendary', 'Axe', 62, 98, [
        { type: 'defIgnore', percent: 0.28 },
        { type: 'attackSpeedBonus', percent: 0.15 },
        { type: 'critThreshold', rollsAt: 17 },
      ]),
      armor: rewardArmor('reward-shadow-plate', 'Shadow Fortress', 'legendary', 45, 148, [
        { type: 'block', chance: 0.20 },
        { type: 'regenOnKill', percent: 0.22 },
      ]),
    },
  },

  {
    zone: 'celestial', zoneName: 'Celestial',
    challenges: [
      killC(250, 'Celestial Slayer'),
      bossC('Celestial Archon', 35),
      damageC(15_000_000, 'Divine Power'),
      critC(250, 'Celestial Sight'),
    ],
    reward: {
      weapon: rewardWeapon('reward-celestial-sword', 'Celestial Arbiter', 'legendary', 'Sword', 80, 128, [
        { type: 'defIgnore', percent: 0.30 },
        { type: 'lifesteal', value: 0.15 },
        { type: 'attackSpeedBonus', percent: 0.18 },
      ]),
      armor: rewardArmor('reward-celestial-plate', 'Celestial Rampart', 'legendary', 58, 182, [
        { type: 'block', chance: 0.22 },
        { type: 'regenOnKill', percent: 0.26 },
      ]),
    },
  },

  {
    zone: 'void', zoneName: 'Void',
    challenges: [
      killC(300, 'Void Strider'),
      bossC('The Unmaker', 100),
      damageC(50_000_000, 'Entropy'),
      critC(300, 'Void Eyes'),
    ],
    reward: {
      weapon: rewardWeapon('reward-void-axe', 'Void Annihilator', 'legendary', 'Axe', 100, 160, [
        { type: 'defIgnore', percent: 0.35 },
        { type: 'attackSpeedBonus', percent: 0.20 },
        { type: 'critThreshold', rollsAt: 16 },
      ]),
      armor: rewardArmor('reward-void-plate', 'Void Bulwark', 'legendary', 72, 218, [
        { type: 'block', chance: 0.25 },
        { type: 'regenOnKill', percent: 0.30 },
      ]),
    },
  },

  {
    zone: 'nightmare', zoneName: 'Nightmare',
    challenges: [
      killC(300, 'Nightmare Conqueror'),
      bossC('Eternal Nightmare', 3),
      damageC(200_000_000, 'Apocalyptic'),
      critC(400, 'Nightmare Sight'),
    ],
    reward: {
      weapon: rewardWeapon('reward-nightmare-axe', 'Apocalypse Edge', 'legendary', 'Axe', 130, 205, [
        { type: 'defIgnore', percent: 0.40 },
        { type: 'lifesteal', value: 0.20 },
        { type: 'critThreshold', rollsAt: 15 },
        { type: 'attackSpeedBonus', percent: 0.20 },
      ]),
      armor: rewardArmor('reward-nightmare-plate', 'Nightmare Fortress', 'legendary', 92, 268, [
        { type: 'block', chance: 0.28 },
        { type: 'regenOnKill', percent: 0.35 },
      ]),
    },
  },
]
