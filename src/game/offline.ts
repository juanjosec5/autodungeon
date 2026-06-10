import type { Character, ZoneId, OfflineResult } from '../types/index'
import { spawnEnemy } from './enemies'
import { rollLoot, blankPity, DROP_CHANCE } from './items'

const KILL_INTERVAL_MS = 6000
export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000  // 8 hours
/** Gold per kill mirrors the engine's direct gold drop formula */
const GOLD_PER_XP = 0.35
/** One offline loot roll per this many (drop-chance-adjusted) kills */
const KILLS_PER_ITEM = 150
const MAX_OFFLINE_ITEMS = 5

/**
 * Pure function — no timers, no engine. Calculates what a character
 * would have earned idling in their current zone while offline.
 *
 * Mutates `character.pity` drop counters so offline grinding still
 * progresses bad-luck protection.
 *
 * @param character - current character state (pity counters are ticked)
 * @param zone      - zone to simulate kills in
 * @param elapsedMs - milliseconds since last save
 * @param offlineEfficiencyBonus - raw decimal bonus from prestige (e.g. 0.3 at 3 stacks)
 * @param tier      - NG+ difficulty tier (= prestige count), scales kill rewards
 */
export function calcOfflineProgress(
  character: Character,
  zone: ZoneId,
  elapsedMs: number,
  offlineEfficiencyBonus: number,
  tier = 0,
): OfflineResult {
  const effectiveMs = Math.min(elapsedMs, MAX_OFFLINE_MS)
  const efficiency = 1 + offlineEfficiencyBonus
  const kills = Math.floor((effectiveMs / KILL_INTERVAL_MS) * efficiency)

  const enemy = spawnEnemy(zone, tier)
  const xpEarned = kills * enemy.xpReward
  const goldEarned = kills * Math.max(1, Math.floor(enemy.xpReward * GOLD_PER_XP))

  const pity = (character.pity ??= blankPity())
  const itemsFound = []
  const rollCount = Math.min(MAX_OFFLINE_ITEMS, Math.floor((kills * DROP_CHANCE) / KILLS_PER_ITEM))
  for (let i = 0; i < rollCount; i++) {
    const offlineItem = rollLoot(zone, enemy.id, 0, pity)
    if (offlineItem) itemsFound.push(offlineItem)
  }

  return { durationMs: effectiveMs, kills, goldEarned, xpEarned, itemsFound }
}
