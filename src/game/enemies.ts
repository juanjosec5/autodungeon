import type { Enemy, ZoneId } from '../types/index'

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
  { id: 'shadow-imp',   name: 'Shadow Imp',   zone: 'abyss',   hp: 210, maxHp: 210, atk: [16,26],  def: 14, xpReward: 420,  attackSpeed: 1400 },
  { id: 'void-hound',   name: 'Void Hound',   zone: 'abyss',   hp: 260, maxHp: 260, atk: [20,32],  def: 18, xpReward: 520,  attackSpeed: 1400 },
  { id: 'void-knight',  name: 'Void Knight',  zone: 'abyss',   hp: 320, maxHp: 320, atk: [24,38],  def: 24, xpReward: 640,  attackSpeed: 1900 },
  { id: 'demon-lord',   name: 'Demon Lord',   zone: 'abyss',   hp: 420, maxHp: 420, atk: [28,44],  def: 20, xpReward: 880,  attackSpeed: 2100 },
  { id: 'void-shade',   name: 'Void Shade',   zone: 'abyss',   hp: 280, maxHp: 280, atk: [22,34],  def: 16, xpReward: 560,  attackSpeed: 1600 },
  // Boss
  { id: 'abyssal-titan',name: 'Abyssal Titan',zone: 'abyss',   hp: 1950, maxHp: 1950, atk: [55,88],  def: 52, xpReward: 7000, attackSpeed: 2800, isBoss: true },
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
  clone.hp = clone.maxHp
  return clone
}

export function spawnEnemy(zone: ZoneId): Enemy {
  const pool = getEnemiesForZone(zone)
  const enemy = pool[Math.floor(Math.random() * pool.length)]
  enemy.hp = enemy.maxHp
  return enemy
}
