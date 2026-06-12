import type { Enemy, ZoneId } from '../types/index'

const ENEMY_HP_MULTIPLIER = 2.2

// ── NG+ difficulty tiers ──────────────────────────────────────────────────────
// tier = prestige count. HP/ATK and rewards grow per tier; DEF stays flat on
// purpose — DEF doubles as the hit DC, and scaling it would recreate the
// unhittable-boss wall the base curve was tuned to avoid.
//
// Growth is tuned against NG+ Attunement (the player's +10% damage/HP per
// tier, see NG_TIER_PLAYER_POWER in combat-core.ts): enemies compound slowly
// while the player grows linearly, so difficulty creeps up each prestige
// without ever hard-walling a maxed character in an at-level zone. The
// simulator suite (simulate.test.ts / npm run sim:report) guards this balance.

export const TIER_HP_GROWTH = 1.12
export const TIER_ATK_GROWTH = 1.1
export const TIER_REWARD_GROWTH = 1.1

function applyTier(enemy: Enemy, tier: number): Enemy {
  if (tier <= 0) return enemy
  const hpMult = Math.pow(TIER_HP_GROWTH, tier)
  const atkMult = Math.pow(TIER_ATK_GROWTH, tier)
  const rewardMult = Math.pow(TIER_REWARD_GROWTH, tier)
  enemy.maxHp = Math.floor(enemy.maxHp * hpMult)
  enemy.hp = enemy.maxHp
  enemy.atk = [Math.floor(enemy.atk[0] * atkMult), Math.floor(enemy.atk[1] * atkMult)]
  enemy.xpReward = Math.floor(enemy.xpReward * rewardMult)
  return enemy
}

// Boss hp/maxHp values below are FINAL (no multiplier applied on spawn).
// DEF doubles as the hit DC (d20 + dex >= def), so it is tuned to keep
// at-zone-level characters of every class hitting >= ~70% of the time.

export const ENEMY_DEFINITIONS: Enemy[] = [
  // ── Forest ───────────────────────────────────────────────────────────────────
  { id: 'wolf',         name: 'Wolf',         zone: 'forest',  hp: 18,  maxHp: 18,  atk: [3,  6],  def: 3,  xpReward: 20,   attackSpeed: 1400 },
  { id: 'giant-spider', name: 'Giant Spider', zone: 'forest',  hp: 25,  maxHp: 25,  atk: [3,  8],  def: 4,  xpReward: 32,   attackSpeed: 1100 },
  { id: 'goblin',       name: 'Goblin',       zone: 'forest',  hp: 22,  maxHp: 22,  atk: [4,  7],  def: 4,  xpReward: 28,   attackSpeed: 1600 },
  { id: 'goblin-shaman',name: 'Goblin Shaman',zone: 'forest',  hp: 28,  maxHp: 28,  atk: [5,  9],  def: 3,  xpReward: 40,   attackSpeed: 1700 },
  { id: 'bandit',       name: 'Bandit',       zone: 'forest',  hp: 35,  maxHp: 35,  atk: [5,  9],  def: 5,  xpReward: 45,   attackSpeed: 1800 },
  // Boss
  { id: 'forest-troll', name: 'Forest Troll', zone: 'forest',  hp: 150, maxHp: 150, atk: [10, 16], def: 10, xpReward: 200,  attackSpeed: 2300, isBoss: true },

  // ── Dungeon ──────────────────────────────────────────────────────────────────
  { id: 'zombie',       name: 'Zombie',       zone: 'dungeon', hp: 55,  maxHp: 55,  atk: [6, 11],  def: 6,  xpReward: 85,   attackSpeed: 2400 },
  { id: 'skeleton',     name: 'Skeleton',     zone: 'dungeon', hp: 50,  maxHp: 50,  atk: [7, 12],  def: 6,  xpReward: 80,   attackSpeed: 1500 },
  { id: 'orc',          name: 'Orc',          zone: 'dungeon', hp: 75,  maxHp: 75,  atk: [9, 15],  def: 9,  xpReward: 120,  attackSpeed: 2000 },
  { id: 'orc-berserker',name: 'Orc Berserker',zone: 'dungeon', hp: 80,  maxHp: 80,  atk: [11,18],  def: 7,  xpReward: 145,  attackSpeed: 1600 },
  { id: 'lich',         name: 'Lich',         zone: 'dungeon', hp: 65,  maxHp: 65,  atk: [12,20],  def: 7,  xpReward: 160,  attackSpeed: 1500 },
  // Boss
  { id: 'dark-knight',  name: 'Dark Knight',  zone: 'dungeon', hp: 320, maxHp: 320, atk: [18, 30], def: 16, xpReward: 650,  attackSpeed: 2200, isBoss: true },

  // ── Volcano ──────────────────────────────────────────────────────────────────
  { id: 'fire-elemental',name: 'Fire Elemental', zone: 'volcano', hp: 130, maxHp: 130, atk: [15,25], def: 10, xpReward: 280,  attackSpeed: 1300 },
  { id: 'magma-golem',  name: 'Magma Golem',  zone: 'volcano', hp: 170, maxHp: 170, atk: [14,22],  def: 14, xpReward: 340,  attackSpeed: 2400 },
  { id: 'wyvern',       name: 'Wyvern',       zone: 'volcano', hp: 180, maxHp: 180, atk: [18,30],  def: 12, xpReward: 400,  attackSpeed: 1800 },
  { id: 'inferno-drake',name: 'Inferno Drake',zone: 'volcano', hp: 200, maxHp: 200, atk: [22,36],  def: 11, xpReward: 480,  attackSpeed: 1500 },
  { id: 'lava-witch',   name: 'Lava Witch',   zone: 'volcano', hp: 155, maxHp: 155, atk: [20,32],  def: 10, xpReward: 420,  attackSpeed: 1400 },
  // Boss
  { id: 'dragon',       name: 'Dragon',       zone: 'volcano', hp: 750, maxHp: 750, atk: [38, 60], def: 24, xpReward: 2200, attackSpeed: 2500, isBoss: true },

  // ── Abyss ────────────────────────────────────────────────────────────────────
  { id: 'shadow-imp',   name: 'Shadow Imp',   zone: 'abyss',   hp: 210, maxHp: 210, atk: [16,26],  def: 14, xpReward: 525,  attackSpeed: 1400 },
  { id: 'void-hound',   name: 'Void Hound',   zone: 'abyss',   hp: 260, maxHp: 260, atk: [20,32],  def: 16, xpReward: 650,  attackSpeed: 1400 },
  { id: 'void-knight',  name: 'Void Knight',  zone: 'abyss',   hp: 320, maxHp: 320, atk: [24,38],  def: 18, xpReward: 800,  attackSpeed: 1900 },
  { id: 'demon-lord',   name: 'Demon Lord',   zone: 'abyss',   hp: 420, maxHp: 420, atk: [28,44],  def: 17, xpReward: 1100, attackSpeed: 2100 },
  { id: 'void-shade',   name: 'Void Shade',   zone: 'abyss',   hp: 280, maxHp: 280, atk: [22,34],  def: 15, xpReward: 700,  attackSpeed: 1600 },
  // Boss
  { id: 'abyssal-titan',name: 'Abyssal Titan',zone: 'abyss',   hp: 1400, maxHp: 1400, atk: [40,64], def: 28, xpReward: 5000, attackSpeed: 2800, isBoss: true },

  // ── Shadowrealm (L50) ────────────────────────────────────────────────────────
  { id: 'shadow-wraith',   name: 'Shadow Wraith',   zone: 'shadowrealm', hp: 450,  maxHp: 450,  atk: [30,48],  def: 18, xpReward: 900,  attackSpeed: 1400 },
  { id: 'nightmare-stalker',name:'Nightmare Stalker',zone: 'shadowrealm', hp: 520,  maxHp: 520,  atk: [34,54],  def: 20, xpReward: 1040, attackSpeed: 1500 },
  { id: 'soul-harvester',  name: 'Soul Harvester',  zone: 'shadowrealm', hp: 580,  maxHp: 580,  atk: [36,58],  def: 21, xpReward: 1160, attackSpeed: 1600 },
  { id: 'dark-phantom',    name: 'Dark Phantom',    zone: 'shadowrealm', hp: 640,  maxHp: 640,  atk: [38,62],  def: 22, xpReward: 1280, attackSpeed: 1300 },
  { id: 'cursed-revenant', name: 'Cursed Revenant', zone: 'shadowrealm', hp: 700,  maxHp: 700,  atk: [40,66],  def: 24, xpReward: 1400, attackSpeed: 1800 },
  // Boss
  { id: 'dread-sovereign', name: 'Dread Sovereign', zone: 'shadowrealm', hp: 2600, maxHp: 2600, atk: [68,108], def: 35, xpReward: 10000, attackSpeed: 2700, isBoss: true },

  // ── Celestial (L65) ──────────────────────────────────────────────────────────
  { id: 'celestial-sentinel',   name: 'Celestial Sentinel',   zone: 'celestial', hp: 680,  maxHp: 680,  atk: [36,58],  def: 24, xpReward: 1700, attackSpeed: 1400 },
  { id: 'starshard-construct',  name: 'Starshard Construct',  zone: 'celestial', hp: 740,  maxHp: 740,  atk: [38,62],  def: 27, xpReward: 1840, attackSpeed: 2000 },
  { id: 'fallen-seraph',        name: 'Fallen Seraph',        zone: 'celestial', hp: 780,  maxHp: 780,  atk: [40,66],  def: 25, xpReward: 1960, attackSpeed: 1500 },
  { id: 'astral-warden',        name: 'Astral Warden',        zone: 'celestial', hp: 840,  maxHp: 840,  atk: [42,67],  def: 28, xpReward: 2100, attackSpeed: 1900 },
  { id: 'divine-fury',          name: 'Divine Fury',          zone: 'celestial', hp: 880,  maxHp: 880,  atk: [44,70],  def: 26, xpReward: 2200, attackSpeed: 1500 },
  // Boss
  { id: 'celestial-archon',     name: 'Celestial Archon',     zone: 'celestial', hp: 4800, maxHp: 4800, atk: [95,150], def: 43, xpReward: 19000, attackSpeed: 2600, isBoss: true },

  // ── Void (L80) ───────────────────────────────────────────────────────────────
  { id: 'void-specter',   name: 'Void Specter',   zone: 'void', hp: 900,  maxHp: 900,  atk: [45, 72],  def: 30, xpReward: 2400, attackSpeed: 1400 },
  { id: 'nullborn',       name: 'Nullborn',       zone: 'void', hp: 975,  maxHp: 975,  atk: [49, 78],  def: 32, xpReward: 2600, attackSpeed: 1800 },
  { id: 'entropy-fiend',  name: 'Entropy Fiend',  zone: 'void', hp: 1050, maxHp: 1050, atk: [53, 84],  def: 34, xpReward: 2800, attackSpeed: 2000 },
  { id: 'oblivion-shade', name: 'Oblivion Shade', zone: 'void', hp: 1090, maxHp: 1090, atk: [54, 87],  def: 33, xpReward: 2900, attackSpeed: 1600 },
  { id: 'rift-terror',    name: 'Rift Terror',    zone: 'void', hp: 1125, maxHp: 1125, atk: [56, 90],  def: 36, xpReward: 3000, attackSpeed: 1700 },
  // Boss
  { id: 'the-unmaker',    name: 'The Unmaker',    zone: 'void', hp: 8500, maxHp: 8500, atk: [130,200], def: 50, xpReward: 38000, attackSpeed: 2500, isBoss: true },

  // ── Nightmare (L95) ──────────────────────────────────────────────────────────
  { id: 'nightmare-horror',  name: 'Nightmare Horror',  zone: 'nightmare', hp: 1260, maxHp: 1260, atk: [62, 98],  def: 36, xpReward: 3600,  attackSpeed: 1400 },
  { id: 'chaos-spawn',       name: 'Chaos Spawn',       zone: 'nightmare', hp: 1330, maxHp: 1330, atk: [64,104],  def: 38, xpReward: 3800,  attackSpeed: 1700 },
  { id: 'abyssal-nightmare', name: 'Abyssal Nightmare', zone: 'nightmare', hp: 1400, maxHp: 1400, atk: [67,109],  def: 40, xpReward: 4000,  attackSpeed: 1800 },
  { id: 'dread-walker',      name: 'Dread Walker',      zone: 'nightmare', hp: 1540, maxHp: 1540, atk: [70,113],  def: 42, xpReward: 4400,  attackSpeed: 1900 },
  { id: 'soul-eater',        name: 'Soul Eater',        zone: 'nightmare', hp: 1680, maxHp: 1680, atk: [74,119],  def: 44, xpReward: 4800,  attackSpeed: 1600 },
  // Boss
  { id: 'eternal-nightmare', name: 'Eternal Nightmare', zone: 'nightmare', hp: 15000, maxHp: 15000, atk: [180,280], def: 58, xpReward: 75000, attackSpeed: 2500, isBoss: true },
]

/** Normal (non-boss) enemies for a zone — used for random spawning */
export function getEnemiesForZone(zone: ZoneId): Enemy[] {
  return ENEMY_DEFINITIONS
    .filter((e) => e.zone === zone && !e.isBoss)
    .map((e) => structuredClone(e))
}

/** Returns a fresh clone of the zone boss (definition HP is final at tier 0) */
export function getBossForZone(zone: ZoneId, tier = 0): Enemy {
  const boss = ENEMY_DEFINITIONS.find((e) => e.zone === zone && e.isBoss)
  if (!boss) throw new Error(`No boss defined for zone: ${zone}`)
  return applyTier(structuredClone(boss), tier)
}

export function spawnEnemy(zone: ZoneId, tier = 0): Enemy {
  const pool = getEnemiesForZone(zone)
  const enemy = pool[Math.floor(Math.random() * pool.length)]
  enemy.maxHp = Math.floor(enemy.maxHp * ENEMY_HP_MULTIPLIER)
  enemy.hp = enemy.maxHp
  return applyTier(enemy, tier)
}
