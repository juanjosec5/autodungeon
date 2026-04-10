import type { Enemy, ZoneId } from '../types/index'

export const ENEMY_DEFINITIONS: Enemy[] = [
  // Forest
  { id: 'wolf', name: 'Wolf', zone: 'forest', hp: 18, maxHp: 18, atk: [3, 6], def: 3, xpReward: 20, attackSpeed: 1400 },
  { id: 'goblin', name: 'Goblin', zone: 'forest', hp: 22, maxHp: 22, atk: [4, 7], def: 4, xpReward: 28, attackSpeed: 1600 },
  { id: 'bandit', name: 'Bandit', zone: 'forest', hp: 35, maxHp: 35, atk: [5, 9], def: 5, xpReward: 45, attackSpeed: 1800 },
  // Dungeon
  { id: 'skeleton', name: 'Skeleton', zone: 'dungeon', hp: 50, maxHp: 50, atk: [7, 12], def: 6, xpReward: 80, attackSpeed: 1500 },
  { id: 'orc', name: 'Orc', zone: 'dungeon', hp: 75, maxHp: 75, atk: [9, 15], def: 9, xpReward: 120, attackSpeed: 2000 },
  { id: 'dark-knight', name: 'Dark Knight', zone: 'dungeon', hp: 110, maxHp: 110, atk: [12, 20], def: 13, xpReward: 200, attackSpeed: 2200 },
  // Volcano
  { id: 'fire-elemental', name: 'Fire Elemental', zone: 'volcano', hp: 130, maxHp: 130, atk: [15, 25], def: 10, xpReward: 280, attackSpeed: 1300 },
  { id: 'wyvern', name: 'Wyvern', zone: 'volcano', hp: 180, maxHp: 180, atk: [18, 30], def: 15, xpReward: 400, attackSpeed: 1800 },
  { id: 'dragon', name: 'Dragon', zone: 'volcano', hp: 300, maxHp: 300, atk: [25, 40], def: 20, xpReward: 700, attackSpeed: 2500 },
]

export function getEnemiesForZone(zone: ZoneId): Enemy[] {
  return ENEMY_DEFINITIONS.filter((e) => e.zone === zone).map((e) => structuredClone(e))
}

export function spawnEnemy(zone: ZoneId): Enemy {
  const pool = getEnemiesForZone(zone)
  const enemy = pool[Math.floor(Math.random() * pool.length)]
  enemy.hp = enemy.maxHp
  return enemy
}
