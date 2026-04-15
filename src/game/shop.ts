import type { ConsumableId } from '../types/index'
import { ITEM_DEFINITIONS, SHOP_ITEMS, ZONE_INDEX } from './item-data'
import type { Item, ZoneId } from '../types/index'

export interface ConsumableDef {
  id: ConsumableId
  name: string
  description: string
  cost: number
  durationMs: number
  icon: string
}

export const CONSUMABLE_DEFS: ConsumableDef[] = [
  {
    id: 'war-potion',
    name: 'War Potion',
    description: '+25% damage for 5 minutes',
    cost: 500,
    durationMs: 5 * 60 * 1000,
    icon: '⚔',
  },
  {
    id: 'iron-flask',
    name: 'Iron Flask',
    description: '+15 DEF for 5 minutes',
    cost: 400,
    durationMs: 5 * 60 * 1000,
    icon: '🛡',
  },
  {
    id: 'swift-elixir',
    name: 'Swift Elixir',
    description: '+20% attack speed for 3 minutes',
    cost: 600,
    durationMs: 3 * 60 * 1000,
    icon: '⚡',
  },
  {
    id: 'fortune-charm',
    name: 'Fortune Charm',
    description: '+20% gold drops for 5 minutes',
    cost: 300,
    durationMs: 5 * 60 * 1000,
    icon: '🍀',
  },
  {
    id: 'xp-tome',
    name: 'XP Tome',
    description: '+30% XP for 5 minutes',
    cost: 800,
    durationMs: 5 * 60 * 1000,
    icon: '📖',
  },
]

export const ROTATION_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

/** Deterministic seeded LCG shuffle — same slot index → same stock for all players. */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed >>> 0
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Returns up to 3 weapons + 3 armor from the current rotation slot,
 *  filtered to items whose minZone ≤ the player's active zone. */
export function getStockForSlot(slotIndex: number, zone: ZoneId): Item[] {
  const maxZoneIndex = ZONE_INDEX[zone] ?? 0

  const allItems = SHOP_ITEMS
    .filter(({ minZone }) => minZone <= maxZoneIndex)
    .map(({ id }) => ITEM_DEFINITIONS.find((i) => i.id === id))
    .filter((i): i is Item => !!i)

  const weapons = allItems.filter((i) => i.type === 'weapon')
  const armors  = allItems.filter((i) => i.type === 'armor')

  // Incorporate zone into seed so each zone sees distinct stock at the same time slot
  const wSeed = slotIndex * 16 + maxZoneIndex * 2 + 1
  const aSeed = slotIndex * 16 + maxZoneIndex * 2 + 2

  const shuffledWeapons = seededShuffle(weapons, wSeed)
  const shuffledArmors  = seededShuffle(armors,  aSeed)

  return [...shuffledWeapons.slice(0, 3), ...shuffledArmors.slice(0, 3)]
}
