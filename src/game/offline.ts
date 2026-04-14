import type { Character, ZoneId, OfflineResult } from '../types/index'
import { spawnEnemy } from './enemies'
import { rollLoot } from './items'

const KILL_INTERVAL_MS = 6000
export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000  // 8 hours

/**
 * Pure function — no timers, no engine. Calculates what a character
 * would have earned idling in their current zone while offline.
 *
 * @param character - current character state (used for zone fallback)
 * @param zone      - zone to simulate kills in
 * @param elapsedMs - milliseconds since last save
 * @param offlineEfficiencyBonus - raw decimal bonus from prestige (e.g. 0.3 at 3 stacks)
 */
export function calcOfflineProgress(
  character: Character,
  zone: ZoneId,
  elapsedMs: number,
  offlineEfficiencyBonus: number,
): OfflineResult {
  const effectiveMs = Math.min(elapsedMs, MAX_OFFLINE_MS)
  const efficiency = 1 + offlineEfficiencyBonus
  const kills = Math.floor((effectiveMs / KILL_INTERVAL_MS) * efficiency)

  const enemy = spawnEnemy(zone)
  const xpEarned = kills * enemy.xpReward
  const goldEarned = kills * Math.floor(enemy.xpReward * 0.6)

  // 1 loot roll per ~300 kills, capped at 3 items total
  const itemsFound = []
  const rollCount = Math.min(3, Math.floor(kills / 300))
  for (let i = 0; i < rollCount; i++) {
    itemsFound.push(rollLoot(zone, enemy.id))
  }

  // Suppress unused param warning — character reserved for future zone-level checks
  void character

  return { durationMs: effectiveMs, kills, goldEarned, xpEarned, itemsFound }
}
