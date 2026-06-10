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

/** Chance a normal (non-boss) kill drops an item. Bosses always drop. */
export const DROP_CHANCE = 0.45
/** Pity: a rare+ drop is guaranteed within this many drops */
export const PITY_RARE = 30
/** Pity: an epic+ drop is guaranteed within this many drops (where epic can drop) */
export const PITY_EPIC = 120
/** Pity: a BiS legendary is guaranteed within this many boss kills */
export const PITY_BIS = 150
/** Base BiS legendary chance per boss kill */
export const BIS_CHANCE = 1 / 100

const RARITIES: RarityId[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

/**
 * Per-zone rarity weights [common, uncommon, rare, epic, legendary].
 * Rows sum to 1; a zero weight means that rarity cannot drop there.
 * Deeper zones drop meaningfully better loot.
 */
export const ZONE_RARITY_WEIGHTS: [number, number, number, number, number][] = [
  /* forest      */ [0.70, 0.24, 0.06, 0,     0    ],
  /* dungeon     */ [0.60, 0.27, 0.11, 0.02,  0    ],
  /* volcano     */ [0.50, 0.30, 0.15, 0.045, 0.005],
  /* abyss       */ [0.42, 0.31, 0.19, 0.07,  0.01 ],
  /* shadowrealm */ [0.35, 0.30, 0.23, 0.10,  0.02 ],
  /* celestial   */ [0.28, 0.29, 0.26, 0.14,  0.03 ],
  /* void        */ [0.22, 0.27, 0.28, 0.18,  0.05 ],
  /* nightmare   */ [0.16, 0.24, 0.30, 0.22,  0.08 ],
]

/** Boss enemy IDs — get a rarity floor on their guaranteed drop */
const BOSS_IDS = new Set([
  'forest-troll', 'dark-knight', 'dragon', 'abyssal-titan',
  'dread-sovereign', 'celestial-archon', 'the-unmaker', 'eternal-nightmare',
])

export interface PityState {
  sinceRare: number
  sinceEpic: number
  bossKillsSinceBis: number
}

export function blankPity(): PityState {
  return { sinceRare: 0, sinceEpic: 0, bossKillsSinceBis: 0 }
}

/** Highest rarity with a non-zero weight in the given zone */
function bestZoneRarity(zoneIdx: number): RarityId {
  const row = ZONE_RARITY_WEIGHTS[zoneIdx]
  for (let i = row.length - 1; i >= 0; i--) {
    if (row[i] > 0) return RARITIES[i]
  }
  return 'common'
}

function rollRarity(zoneIdx: number): RarityId {
  const row = ZONE_RARITY_WEIGHTS[zoneIdx]
  const roll = Math.random()
  let cumulative = 0
  for (let i = 0; i < row.length; i++) {
    cumulative += row[i]
    if (roll < cumulative) return RARITIES[i]
  }
  return 'common'
}

function clampRarity(rarity: RarityId, max: RarityId): RarityId {
  return RARITIES.indexOf(rarity) > RARITIES.indexOf(max) ? max : rarity
}

function raiseRarity(rarity: RarityId, min: RarityId): RarityId {
  return RARITIES.indexOf(rarity) < RARITIES.indexOf(min) ? min : rarity
}

/**
 * Applies and updates pity counters: counts drops since the last rare+/epic+
 * and forces the floor when the threshold is reached. Mutates `pity`.
 */
export function applyPity(rarity: RarityId, pity: PityState, zoneIdx: number): RarityId {
  const best = bestZoneRarity(zoneIdx)
  let result = rarity

  pity.sinceRare++
  if (pity.sinceRare >= PITY_RARE && RARITIES.indexOf(best) >= RARITIES.indexOf('rare')) {
    result = raiseRarity(result, 'rare')
  }

  pity.sinceEpic++
  if (pity.sinceEpic >= PITY_EPIC && RARITIES.indexOf(best) >= RARITIES.indexOf('epic')) {
    result = raiseRarity(result, 'epic')
  }

  if (RARITIES.indexOf(result) >= RARITIES.indexOf('rare')) pity.sinceRare = 0
  if (RARITIES.indexOf(result) >= RARITIES.indexOf('epic')) pity.sinceEpic = 0
  return result
}

/**
 * Drop pool for a zone and rarity: zone-locked availability plus a tier
 * window [zoneIdx−1, zoneIdx] so deep zones stop dropping starter gear.
 * When no at-tier items exist for a rarity (deep-zone commons are vendor
 * trash by design), falls back to the highest tier available ≤ zoneIdx.
 */
function dropPool(zoneIdx: number, rarity: RarityId): Item[] {
  const available = ITEM_DEFINITIONS.filter(
    (item) =>
      item.rarity === rarity &&
      (item.dropFromZoneIdx === undefined || item.dropFromZoneIdx <= zoneIdx) &&
      (item.zoneTier ?? 0) <= zoneIdx,
  )
  const windowed = available.filter((item) => (item.zoneTier ?? 0) >= zoneIdx - 1)
  if (windowed.length > 0) return windowed
  if (available.length === 0) return available
  const maxTier = Math.max(...available.map((i) => i.zoneTier ?? 0))
  return available.filter((i) => (i.zoneTier ?? 0) === maxTier)
}

/**
 * Rolls a loot drop for a kill in the given zone.
 *
 * @param bonusChance - prestige Fortune bonus (0–0.5): probability of bumping
 *   rarity up one tier.
 * @param pity - optional pity counters (mutated). Guarantees rare+ within
 *   PITY_RARE drops and epic+ within PITY_EPIC drops where the zone allows.
 * @param minRarity - optional rarity floor (e.g. Loot Mastery prestige sink).
 */
export function rollLoot(
  zone: ZoneId,
  enemyId: string,
  bonusChance = 0,
  pity?: PityState,
  minRarity?: RarityId,
): Item | null {
  const zoneIdx = ZONE_INDEX[zone]
  const isBoss = BOSS_IDS.has(enemyId)
  let rarity = rollRarity(zoneIdx)

  // Prestige Fortune: chance to upgrade rarity by one tier
  if (bonusChance > 0 && Math.random() < bonusChance) {
    const idx = RARITIES.indexOf(rarity)
    if (idx < RARITIES.length - 1) rarity = RARITIES[idx + 1]
  }

  // Boss guaranteed drops have a rarity floor in deeper zones
  if (isBoss) {
    if (zoneIdx >= 5) rarity = raiseRarity(rarity, 'epic')
    else if (zoneIdx >= 2) rarity = raiseRarity(rarity, 'rare')
  }

  if (minRarity) rarity = raiseRarity(rarity, minRarity)
  if (pity) rarity = applyPity(rarity, pity, zoneIdx)

  // Never exceed what the zone can drop
  rarity = clampRarity(rarity, bestZoneRarity(zoneIdx))

  const pool = dropPool(zoneIdx, rarity)
  const template = pool[Math.floor(Math.random() * pool.length)]
  if (!template) return null
  return { ...structuredClone(template), defId: template.id, id: crypto.randomUUID() }
}

/**
 * Rolls a zone-specific BiS (best-in-slot) legendary.
 * Called at BIS_CHANCE per boss kill, with a hard pity at PITY_BIS kills.
 */
export function rollBisLoot(zone: ZoneId): Item | null {
  const ids = ZONE_BIS_IDS[zone]
  const id = ids[Math.floor(Math.random() * ids.length)]
  const template = ITEM_DEFINITIONS.find((i) => i.id === id)
  if (!template) return null
  return { ...structuredClone(template), defId: template.id, id: crypto.randomUUID() }
}
