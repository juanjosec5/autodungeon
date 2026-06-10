import type { Item, ZoneId, RarityId } from '../types/index'
import {
  ITEM_DEFINITIONS,
  ZONE_INDEX,
  ZONE_BIS_IDS,
  WEAPON_ENCHANTS,
  ARMOR_ENCHANTS,
  SHOP_ITEMS,
} from './item-data'

// Re-export data constants so existing imports don't break
export { ITEM_DEFINITIONS, ZONE_INDEX, WEAPON_ENCHANTS, ARMOR_ENCHANTS, SHOP_ITEMS }

// ── Price tables ──────────────────────────────────────────────────────────────
// Prices scale with the item's zone tier so gold stays relevant in late zones.

const SELL_PRICES: Record<RarityId, number> = {
  common: 5, uncommon: 15, rare: 40, epic: 120, legendary: 500,
}

/** Buy price = base sell × this multiplier (before zone scaling) */
const BUY_MULTIPLIER = 8
/** Per-zone-tier price growth — matches the item stat curve's ZONE_GROWTH */
const PRICE_ZONE_GROWTH = 1.5
/** Enchant cost growth per existing enchant */
const ENCHANT_GROWTH = 1.6
/** First enchant costs buyPrice × this factor */
const ENCHANT_BASE_FACTOR = 1.5

function zonePriceScale(zoneTier: number): number {
  return Math.pow(PRICE_ZONE_GROWTH, zoneTier)
}

export function getSellPrice(item: Item | RarityId): number {
  if (typeof item === 'string') return SELL_PRICES[item]
  const base = Math.round(SELL_PRICES[item.rarity] * zonePriceScale(item.zoneTier ?? 0))
  const n = item.enchantCount ?? 0
  if (n === 0) return base
  // Total enchant investment: geometric sum of calcEnchantCost over n enchants
  const buy = getBuyPrice(item.rarity, item.zoneTier ?? 0)
  const enchantTotal = buy * ENCHANT_BASE_FACTOR * (Math.pow(ENCHANT_GROWTH, n) - 1) / (ENCHANT_GROWTH - 1)
  return Math.floor((base + enchantTotal) * 0.3)
}

export function getBuyPrice(rarity: RarityId, zoneTier = 0): number {
  return Math.round(SELL_PRICES[rarity] * BUY_MULTIPLIER * zonePriceScale(zoneTier))
}

/**
 * Cost to enchant an item: buyPrice(rarity, zoneTier) × 1.5 × 1.6^enchantCount
 */
export function calcEnchantCost(item: Item): number {
  return Math.floor(
    getBuyPrice(item.rarity, item.zoneTier ?? 0) * ENCHANT_BASE_FACTOR * Math.pow(ENCHANT_GROWTH, item.enchantCount ?? 0),
  )
}

// ── Lookup ────────────────────────────────────────────────────────────────────

export function getItemById(id: string): Item | undefined {
  return ITEM_DEFINITIONS.find((item) => item.id === id)
}

// ── Loot rolling ─────────────────────────────────────────────────────────────

const RARITY_WEIGHTS: { rarity: RarityId; weight: number }[] = [
  { rarity: 'common',    weight: 0.5999 },
  { rarity: 'uncommon',  weight: 0.25   },
  { rarity: 'rare',      weight: 0.12   },
  { rarity: 'epic',      weight: 0.03   },
  { rarity: 'legendary', weight: 0.0001 },
]

/** Boss enemy IDs — allowed to drop Legendary loot via rollLoot */
const BOSS_IDS = new Set([
  'forest-troll', 'dark-knight', 'dragon', 'abyssal-titan',
  'dread-sovereign', 'celestial-archon', 'the-unmaker', 'eternal-nightmare',
])

function rollRarity(isBoss: boolean): RarityId {
  const roll = Math.random()
  let cumulative = 0
  for (const { rarity, weight } of RARITY_WEIGHTS) {
    cumulative += weight
    if (roll < cumulative) {
      if (rarity === 'legendary' && !isBoss) return 'epic'
      return rarity
    }
  }
  return 'common'
}

/**
 * @param bonusChance - optional prestige drop rate bonus (0–0.5). When > 0,
 *   each roll has this probability of bumping rarity up one tier.
 */
export function rollLoot(zone: ZoneId, enemyId: string, bonusChance = 0): Item | null {
  const isBoss = BOSS_IDS.has(enemyId)
  const zoneIdx = ZONE_INDEX[zone]
  let rarity = rollRarity(isBoss)

  // Apply prestige drop rate bonus: chance to upgrade rarity by one tier
  if (bonusChance > 0 && Math.random() < bonusChance) {
    const RARITIES: RarityId[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    const idx = RARITIES.indexOf(rarity)
    if (idx < RARITIES.length - 1) rarity = RARITIES[idx + 1]
  }

  // Clamp rarity to zone pool
  if (zone === 'forest') {
    if (rarity === 'legendary' || rarity === 'epic') rarity = 'rare'
  } else if (zone === 'dungeon') {
    if (rarity === 'legendary') rarity = 'epic'
  }

  // Filter items by rarity and zone availability
  const pool = ITEM_DEFINITIONS.filter(
    (item) =>
      item.rarity === rarity &&
      (item.dropFromZoneIdx === undefined || item.dropFromZoneIdx <= zoneIdx),
  )
  const template = pool[Math.floor(Math.random() * pool.length)]
  if (!template) return null
  return { ...structuredClone(template), defId: template.id, id: crypto.randomUUID() }
}

/**
 * Rolls a zone-specific BiS (best-in-slot) legendary.
 * Called at 1/200 chance on boss kill.
 */
export function rollBisLoot(zone: ZoneId): Item | null {
  const ids = ZONE_BIS_IDS[zone]
  const id = ids[Math.floor(Math.random() * ids.length)]
  const template = ITEM_DEFINITIONS.find((i) => i.id === id)
  if (!template) return null
  return { ...structuredClone(template), defId: template.id, id: crypto.randomUUID() }
}
