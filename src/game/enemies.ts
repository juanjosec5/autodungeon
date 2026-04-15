import type { Enemy, ZoneId } from '../types/index'

const ENEMY_HP_MULTIPLIER = 2.2
const BOSS_HP_MULTIPLIER = 3.0

export const ENEMY_DEFINITIONS: Enemy[] = [
  // ── Forest ───────────────────────────────────────────────────────────────────
  { id: 'wolf',         name: 'Wolf',         zone: 'forest',  hp: 18,  maxHp: 18,  atk: [3,  6],  def: 3,  xpReward: 20,   attackSpeed: 1400 },
  { id: 'giant-spider', name: 'Giant Spider', zone: 'forest',  hp: 25,  maxHp: 25,  atk: [3,  8],  def: 4,  xpReward: 32,   attackSpeed: 1100 },
  { id: 'goblin',       name: 'Goblin',       zone: 'forest',  hp: 22,  maxHp: 22,  atk: [4,  7],  def: 4,  xpReward: 28,   attackSpeed: 1600 },
  { id: 'goblin-shaman',name: 'Goblin Shaman',zone: 'forest',  hp: 28,  maxHp: 28,  atk: [5,  9],  def: 3,  xpReward: 40,   attackSpeed: 1700 },
  { id: 'bandit',       name: 'Bandit',       zone: 'forest',  hp: 35,  maxHp: 35,  atk: [5,  9],  def: 5,  xpReward: 45,   attackSpeed: 1800 },
  // Boss
  { id: 'forest-troll', name: 'Forest Troll', zone: 'forest',  hp: 150, maxHp: 150, atk: [10, 16], def: 14, xpReward: 300,  attackSpeed: 2300, isBoss: true },

  // ── Dungeon ──────────────────────────────────────────────────────────────────
  { id: 'zombie',       name: 'Zombie',       zone: 'dungeon', hp: 55,  maxHp: 55,  atk: [6, 11],  def: 5,  xpReward: 85,   attackSpeed: 2400 },
  { id: 'skeleton',     name: 'Skeleton',     zone: 'dungeon', hp: 50,  maxHp: 50,  atk: [7, 12],  def: 6,  xpReward: 80,   attackSpeed: 1500 },
  { id: 'orc',          name: 'Orc',          zone: 'dungeon', hp: 75,  maxHp: 75,  atk: [9, 15],  def: 9,  xpReward: 120,  attackSpeed: 2000 },
  { id: 'orc-berserker',name: 'Orc Berserker',zone: 'dungeon', hp: 80,  maxHp: 80,  atk: [11,18],  def: 7,  xpReward: 145,  attackSpeed: 1600 },
  { id: 'lich',         name: 'Lich',         zone: 'dungeon', hp: 65,  maxHp: 65,  atk: [12,20],  def: 6,  xpReward: 160,  attackSpeed: 1500 },
  // Boss
  { id: 'dark-knight',  name: 'Dark Knight',  zone: 'dungeon', hp: 330, maxHp: 330, atk: [18, 30], def: 26, xpReward: 1000, attackSpeed: 2200, isBoss: true },

  // ── Volcano ──────────────────────────────────────────────────────────────────
  { id: 'fire-elemental',name: 'Fire Elemental', zone: 'volcano', hp: 130, maxHp: 130, atk: [15,25], def: 10, xpReward: 280,  attackSpeed: 1300 },
  { id: 'magma-golem',  name: 'Magma Golem',  zone: 'volcano', hp: 170, maxHp: 170, atk: [14,22],  def: 20, xpReward: 340,  attackSpeed: 2400 },
  { id: 'wyvern',       name: 'Wyvern',       zone: 'volcano', hp: 180, maxHp: 180, atk: [18,30],  def: 15, xpReward: 400,  attackSpeed: 1800 },
  { id: 'inferno-drake',name: 'Inferno Drake',zone: 'volcano', hp: 200, maxHp: 200, atk: [22,36],  def: 13, xpReward: 480,  attackSpeed: 1500 },
  { id: 'lava-witch',   name: 'Lava Witch',   zone: 'volcano', hp: 155, maxHp: 155, atk: [20,32],  def: 11, xpReward: 420,  attackSpeed: 1400 },
  // Boss
  { id: 'dragon',       name: 'Dragon',       zone: 'volcano', hp: 900, maxHp: 900, atk: [38, 60], def: 40, xpReward: 3500, attackSpeed: 2500, isBoss: true },

  // ── Abyss ────────────────────────────────────────────────────────────────────
  { id: 'shadow-imp',   name: 'Shadow Imp',   zone: 'abyss',   hp: 210, maxHp: 210, atk: [16,26],  def: 14, xpReward: 525,  attackSpeed: 1400 },
  { id: 'void-hound',   name: 'Void Hound',   zone: 'abyss',   hp: 260, maxHp: 260, atk: [20,32],  def: 18, xpReward: 650,  attackSpeed: 1400 },
  { id: 'void-knight',  name: 'Void Knight',  zone: 'abyss',   hp: 320, maxHp: 320, atk: [24,38],  def: 24, xpReward: 800,  attackSpeed: 1900 },
  { id: 'demon-lord',   name: 'Demon Lord',   zone: 'abyss',   hp: 420, maxHp: 420, atk: [28,44],  def: 20, xpReward: 1100, attackSpeed: 2100 },
  { id: 'void-shade',   name: 'Void Shade',   zone: 'abyss',   hp: 280, maxHp: 280, atk: [22,34],  def: 16, xpReward: 700,  attackSpeed: 1600 },
  // Boss
  { id: 'abyssal-titan',name: 'Abyssal Titan',zone: 'abyss',   hp: 1400, maxHp: 1400, atk: [40,64], def: 40, xpReward: 8000, attackSpeed: 2800, isBoss: true },

  // ── Shadowrealm (L30) ────────────────────────────────────────────────────────
  { id: 'shadow-wraith',   name: 'Shadow Wraith',   zone: 'shadowrealm', hp: 450,  maxHp: 450,  atk: [30,48],  def: 22, xpReward: 900,  attackSpeed: 1400 },
  { id: 'nightmare-stalker',name:'Nightmare Stalker',zone: 'shadowrealm', hp: 520,  maxHp: 520,  atk: [34,54],  def: 24, xpReward: 1040, attackSpeed: 1500 },
  { id: 'soul-harvester',  name: 'Soul Harvester',  zone: 'shadowrealm', hp: 580,  maxHp: 580,  atk: [36,58],  def: 25, xpReward: 1160, attackSpeed: 1600 },
  { id: 'dark-phantom',    name: 'Dark Phantom',    zone: 'shadowrealm', hp: 640,  maxHp: 640,  atk: [38,62],  def: 26, xpReward: 1280, attackSpeed: 1300 },
  { id: 'cursed-revenant', name: 'Cursed Revenant', zone: 'shadowrealm', hp: 700,  maxHp: 700,  atk: [40,66],  def: 28, xpReward: 1400, attackSpeed: 1800 },
  // Boss
  { id: 'dread-sovereign', name: 'Dread Sovereign', zone: 'shadowrealm', hp: 3500, maxHp: 3500, atk: [68,108], def: 65, xpReward: 16000, attackSpeed: 2700, isBoss: true },

  // ── Celestial (L45) ──────────────────────────────────────────────────────────
  { id: 'celestial-sentinel',   name: 'Celestial Sentinel',   zone: 'celestial', hp: 850,  maxHp: 850,  atk: [45,72],  def: 32, xpReward: 1700, attackSpeed: 1400 },
  { id: 'starshard-construct',  name: 'Starshard Construct',  zone: 'celestial', hp: 920,  maxHp: 920,  atk: [48,78],  def: 35, xpReward: 1840, attackSpeed: 2000 },
  { id: 'fallen-seraph',        name: 'Fallen Seraph',        zone: 'celestial', hp: 980,  maxHp: 980,  atk: [50,82],  def: 33, xpReward: 1960, attackSpeed: 1500 },
  { id: 'astral-warden',        name: 'Astral Warden',        zone: 'celestial', hp: 1050, maxHp: 1050, atk: [52,84],  def: 36, xpReward: 2100, attackSpeed: 1900 },
  { id: 'divine-fury',          name: 'Divine Fury',          zone: 'celestial', hp: 1100, maxHp: 1100, atk: [55,88],  def: 34, xpReward: 2200, attackSpeed: 1500 },
  // Boss
  { id: 'celestial-archon',     name: 'Celestial Archon',     zone: 'celestial', hp: 9000, maxHp: 9000, atk: [140,220], def: 120, xpReward: 30000, attackSpeed: 2600, isBoss: true },

  // ── Void (L60) ───────────────────────────────────────────────────────────────
  { id: 'void-specter',   name: 'Void Specter',   zone: 'void', hp: 1200, maxHp: 1200, atk: [60, 96],  def: 40, xpReward: 2400, attackSpeed: 1400 },
  { id: 'nullborn',       name: 'Nullborn',       zone: 'void', hp: 1300, maxHp: 1300, atk: [65,104],  def: 42, xpReward: 2600, attackSpeed: 1800 },
  { id: 'entropy-fiend',  name: 'Entropy Fiend',  zone: 'void', hp: 1400, maxHp: 1400, atk: [70,112],  def: 45, xpReward: 2800, attackSpeed: 2000 },
  { id: 'oblivion-shade', name: 'Oblivion Shade', zone: 'void', hp: 1450, maxHp: 1450, atk: [72,116],  def: 44, xpReward: 2900, attackSpeed: 1600 },
  { id: 'rift-terror',    name: 'Rift Terror',    zone: 'void', hp: 1500, maxHp: 1500, atk: [75,120],  def: 46, xpReward: 3000, attackSpeed: 1700 },
  // Boss
  { id: 'the-unmaker',    name: 'The Unmaker',    zone: 'void', hp: 18000, maxHp: 18000, atk: [220,340], def: 180, xpReward: 60000, attackSpeed: 2500, isBoss: true },

  // ── Nightmare (L80) ──────────────────────────────────────────────────────────
  { id: 'nightmare-horror',  name: 'Nightmare Horror',  zone: 'nightmare', hp: 1800, maxHp: 1800, atk: [88,140],  def: 55, xpReward: 3600,  attackSpeed: 1400 },
  { id: 'chaos-spawn',       name: 'Chaos Spawn',       zone: 'nightmare', hp: 1900, maxHp: 1900, atk: [92,148],  def: 58, xpReward: 3800,  attackSpeed: 1700 },
  { id: 'abyssal-nightmare', name: 'Abyssal Nightmare', zone: 'nightmare', hp: 2000, maxHp: 2000, atk: [96,155],  def: 60, xpReward: 4000,  attackSpeed: 1800 },
  { id: 'dread-walker',      name: 'Dread Walker',      zone: 'nightmare', hp: 2200, maxHp: 2200, atk: [100,162], def: 62, xpReward: 4400,  attackSpeed: 1900 },
  { id: 'soul-eater',        name: 'Soul Eater',        zone: 'nightmare', hp: 2400, maxHp: 2400, atk: [105,170], def: 65, xpReward: 4800,  attackSpeed: 1600 },
  // Boss
  { id: 'eternal-nightmare', name: 'Eternal Nightmare', zone: 'nightmare', hp: 35000, maxHp: 35000, atk: [350,540], def: 280, xpReward: 120000, attackSpeed: 2500, isBoss: true },
]

/** Normal (non-boss) enemies for a zone — used for random spawning */
export function getEnemiesForZone(zone: ZoneId): Enemy[] {
  return ENEMY_DEFINITIONS
    .filter((e) => e.zone === zone && !e.isBoss)
    .map((e) => structuredClone(e))
}

/** Returns a fresh clone of the zone boss */
export function getBossForZone(zone: ZoneId): Enemy {
  const boss = ENEMY_DEFINITIONS.find((e) => e.zone === zone && e.isBoss)
  if (!boss) throw new Error(`No boss defined for zone: ${zone}`)
  const clone = structuredClone(boss)
  clone.maxHp = Math.floor(clone.maxHp * BOSS_HP_MULTIPLIER)
  clone.hp = clone.maxHp
  return clone
}

export function spawnEnemy(zone: ZoneId): Enemy {
  const pool = getEnemiesForZone(zone)
  const enemy = pool[Math.floor(Math.random() * pool.length)]
  enemy.maxHp = Math.floor(enemy.maxHp * ENEMY_HP_MULTIPLIER)
  enemy.hp = enemy.maxHp
  return enemy
}
