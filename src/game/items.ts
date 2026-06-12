import type { Item, ZoneId, RarityId, SpecialEffect } from '../types/index'
import {
  ITEM_DEFINITIONS,
  ZONE_INDEX,
  ZONE_BIS_IDS,
  WEAPON_ENCHANT_TYPES,
  ARMOR_ENCHANT_TYPES,
  ENCHANT_EFFECT_BASES,
  SHOP_ITEMS,
} from './item-data'
import { SPECIAL_CAPS } from './formulas'

// Re-export data constants so existing imports don't break
export { ITEM_DEFINITIONS, ZONE_INDEX, WEAPON_ENCHANT_TYPES, ARMOR_ENCHANT_TYPES, ENCHANT_EFFECT_BASES, SHOP_ITEMS }

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
export const ENCHANT_GROWTH = 1.35
/** First enchant costs buyPrice × this factor */
export const ENCHANT_BASE_FACTOR = 0.5

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
 * Cost to enchant an item:
 * buyPrice(rarity, zoneTier) × ENCHANT_BASE_FACTOR × ENCHANT_GROWTH^enchantCount
 */
export function calcEnchantCost(item: Item): number {
  return Math.floor(
    getBuyPrice(item.rarity, item.zoneTier ?? 0) * ENCHANT_BASE_FACTOR * Math.pow(ENCHANT_GROWTH, item.enchantCount ?? 0),
  )
}

// ── Enchant engine ────────────────────────────────────────────────────────────
// Enchanting is strictly monotone: it ADDS a missing pool effect at a value
// scaled to the item's zone tier and rarity, or (once the item holds 3
// effects) STEPS UP the existing effect with the most headroom. It never
// rerolls, replaces, or weakens anything — a fully-saturated item reports
// 'maxed' and must not be charged. SPECIAL_CAPS stay authoritative at
// consumption sites; the per-item ceiling below just bounds what enchanting
// alone can reach.

/** Enchant effect growth per zone tier (linear, fraction of base) */
export const ENCHANT_TIER_GROWTH = 0.12
/** Enchant effect multiplier by item rarity */
export const ENCHANT_RARITY_MULT: Record<RarityId, number> = {
  common: 1, uncommon: 1.15, rare: 1.3, epic: 1.5, legendary: 1.75,
}
/** Upgrade step = this fraction of the item's scaled base value */
export const ENCHANT_STEP_FRACTION = 0.25
/** Per-item ceiling = this × scaled base (then clamped by the global cap) */
export const ENCHANT_CEILING_MULT = 2
/** Best rollsAt an enchanted item can reach (global floor of 14 unchanged) */
export const ENCHANT_CRIT_ITEM_FLOOR = 15

/** Global caps by effect type (attackSpeedBonus consumes the attackSpeedPct cap) */
const CAP_BY_TYPE: Partial<Record<SpecialEffect['type'], number>> = {
  spellAmp: SPECIAL_CAPS.spellAmp,
  defIgnore: SPECIAL_CAPS.defIgnore,
  lifesteal: SPECIAL_CAPS.lifesteal,
  dodge: SPECIAL_CAPS.dodge,
  block: SPECIAL_CAPS.block,
  attackSpeedBonus: SPECIAL_CAPS.attackSpeedPct,
  doublecast: SPECIAL_CAPS.doublecast,
}

const round2 = (v: number): number => Math.round(v * 100) / 100

/** Reads the magnitude of any special effect (rollsAt for critThreshold) */
export function effectValue(fx: SpecialEffect): number {
  switch (fx.type) {
    case 'lifesteal':        return fx.value
    case 'poison':           return fx.dpsMultiplier
    case 'dodge':
    case 'block':
    case 'doublecast':       return fx.chance
    case 'defIgnore':
    case 'spellAmp':
    case 'attackSpeedBonus':
    case 'regenOnKill':      return fx.percent
    case 'critThreshold':    return fx.rollsAt
  }
}

function makeEffect(type: SpecialEffect['type'], value: number): SpecialEffect {
  switch (type) {
    case 'lifesteal':        return { type, value }
    case 'poison':           return { type, dpsMultiplier: value }
    case 'dodge':
    case 'block':
    case 'doublecast':       return { type, chance: value }
    case 'defIgnore':
    case 'spellAmp':
    case 'attackSpeedBonus':
    case 'regenOnKill':      return { type, percent: value }
    case 'critThreshold':    return { type, rollsAt: value }
  }
}

function setEffectValue(fx: SpecialEffect, value: number): void {
  switch (fx.type) {
    case 'lifesteal':        fx.value = value; break
    case 'poison':           fx.dpsMultiplier = value; break
    case 'dodge':
    case 'block':
    case 'doublecast':       fx.chance = value; break
    case 'defIgnore':
    case 'spellAmp':
    case 'attackSpeedBonus':
    case 'regenOnKill':      fx.percent = value; break
    case 'critThreshold':    fx.rollsAt = value; break
  }
}

/** Value a freshly-added enchant effect rolls at for this tier/rarity */
export function enchantEffectValue(type: SpecialEffect['type'], zoneTier: number, rarity: RarityId): number {
  const base = ENCHANT_EFFECT_BASES[type]
  if (type === 'critThreshold') return base // rollsAt anchor, scale-free
  return round2(base * (1 + ENCHANT_TIER_GROWTH * zoneTier) * ENCHANT_RARITY_MULT[rarity])
}

/**
 * Highest value enchant upgrade-steps can push an effect to on this item
 * (for critThreshold: the LOWEST rollsAt, since lower is better).
 */
export function enchantCeiling(type: SpecialEffect['type'], zoneTier: number, rarity: RarityId): number {
  if (type === 'critThreshold') return ENCHANT_CRIT_ITEM_FLOOR
  const scaledBase = enchantEffectValue(type, zoneTier, rarity)
  return round2(Math.min(CAP_BY_TYPE[type] ?? Infinity, ENCHANT_CEILING_MULT * scaledBase))
}

/** Fraction of enchantable headroom remaining for an effect on this item (0–1) */
function headroomRatio(fx: SpecialEffect, zoneTier: number, rarity: RarityId): number {
  const current = effectValue(fx)
  if (fx.type === 'critThreshold') {
    const span = ENCHANT_EFFECT_BASES.critThreshold - ENCHANT_CRIT_ITEM_FLOOR
    return Math.max(0, (current - ENCHANT_CRIT_ITEM_FLOOR) / span)
  }
  const ceiling = enchantCeiling(fx.type, zoneTier, rarity)
  return Math.max(0, (ceiling - current) / ceiling)
}

/** Post-step value for an effect (clamped to the item's ceiling) */
function steppedValue(fx: SpecialEffect, zoneTier: number, rarity: RarityId): number {
  const current = effectValue(fx)
  if (fx.type === 'critThreshold') return Math.max(ENCHANT_CRIT_ITEM_FLOOR, current - 1)
  const scaledBase = enchantEffectValue(fx.type, zoneTier, rarity)
  const step = Math.max(0.01, round2(ENCHANT_STEP_FRACTION * scaledBase))
  return round2(Math.min(enchantCeiling(fx.type, zoneTier, rarity), current + step))
}

export type EnchantPreview =
  | { kind: 'add'; candidates: SpecialEffect[] }
  | { kind: 'upgrade'; type: SpecialEffect['type']; from: number; to: number }
  | { kind: 'maxed' }

export type EnchantResult =
  | { kind: 'added'; effect: SpecialEffect }
  | { kind: 'upgraded'; type: SpecialEffect['type']; from: number; to: number }
  | { kind: 'maxed' }

/**
 * What the next enchant on this item will do. Deterministic except for the
 * 'add' case, where one of the listed candidates is rolled.
 */
export function previewEnchant(item: Item): EnchantPreview {
  const special = item.stats.special ?? []
  const zoneTier = item.zoneTier ?? 0
  const pool = item.type === 'weapon' ? WEAPON_ENCHANT_TYPES : ARMOR_ENCHANT_TYPES

  if (special.length < 3) {
    const existing = new Set(special.map((s) => s.type))
    const missing = pool.filter((t) => !existing.has(t))
    if (missing.length > 0) {
      return {
        kind: 'add',
        candidates: missing.map((t) =>
          makeEffect(t, t === 'critThreshold'
            ? ENCHANT_EFFECT_BASES.critThreshold
            : Math.min(enchantEffectValue(t, zoneTier, item.rarity), enchantCeiling(t, zoneTier, item.rarity))),
        ),
      }
    }
  }

  // Upgrade the existing effect with the largest relative headroom
  let best: SpecialEffect | null = null
  let bestRatio = 0
  for (const fx of special) {
    const ratio = headroomRatio(fx, zoneTier, item.rarity)
    if (ratio > bestRatio + 1e-9) {
      best = fx
      bestRatio = ratio
    }
  }
  if (!best || bestRatio <= 1e-9) return { kind: 'maxed' }

  return {
    kind: 'upgrade',
    type: best.type,
    from: effectValue(best),
    to: steppedValue(best, zoneTier, item.rarity),
  }
}

/**
 * Applies one enchant level: adds a (random) missing pool effect, or steps up
 * the effect previewEnchant targets. Mutates the item (specials and
 * enchantCount) — except on 'maxed', which changes nothing. Strictly monotone:
 * no existing effect value ever decreases.
 */
export function applyEnchant(item: Item, rng: () => number = Math.random): EnchantResult {
  const preview = previewEnchant(item)
  if (preview.kind === 'maxed') return { kind: 'maxed' }

  if (!item.stats.special) item.stats.special = []
  item.enchantCount = (item.enchantCount ?? 0) + 1

  if (preview.kind === 'add') {
    const effect = preview.candidates[Math.floor(rng() * preview.candidates.length)]
    item.stats.special.push(structuredClone(effect))
    return { kind: 'added', effect }
  }

  const fx = item.stats.special.find((s) => s.type === preview.type)!
  setEffectValue(fx, preview.to)
  return { kind: 'upgraded', type: preview.type, from: preview.from, to: preview.to }
}

/**
 * One-time cleanup for items enchanted under the legacy reroll system, run on
 * load for any item with enchantCount > 0. Idempotent and monotone:
 *  1. dedupes effects by type (old rerolls could stack duplicates; only the
 *     first was ever read) keeping the best value,
 *  2. raises pool-typed effect values to today's tier/rarity-scaled roll
 *     (goodwill for gold spent on flat-era enchants), and
 *  3. refills empty slots from the template's natural specials that rerolls
 *     destroyed.
 */
export function migrateEnchantedSpecials(item: Item): void {
  const special = item.stats.special ?? []
  const zoneTier = item.zoneTier ?? 0

  // 1. Dedupe by type, keeping the best value (lowest rollsAt for crit)
  const byType = new Map<SpecialEffect['type'], SpecialEffect>()
  for (const fx of special) {
    const existing = byType.get(fx.type)
    if (!existing) {
      byType.set(fx.type, fx)
    } else if (fx.type === 'critThreshold'
      ? effectValue(fx) < effectValue(existing)
      : effectValue(fx) > effectValue(existing)) {
      byType.set(fx.type, fx)
    }
  }
  const deduped = [...byType.values()]

  // 2. Goodwill re-grant: flat-era pool values rise to today's scaled values
  const pool = item.type === 'weapon' ? WEAPON_ENCHANT_TYPES : ARMOR_ENCHANT_TYPES
  for (const fx of deduped) {
    if (!pool.includes(fx.type) || fx.type === 'critThreshold') continue
    const scaled = Math.min(
      enchantEffectValue(fx.type, zoneTier, item.rarity),
      enchantCeiling(fx.type, zoneTier, item.rarity),
    )
    if (scaled > effectValue(fx)) setEffectValue(fx, scaled)
  }

  // 3. Restore natural specials lost to legacy rerolls
  if (deduped.length < 3) {
    const template = getItemById(item.defId ?? item.id)
    const have = new Set(deduped.map((s) => s.type))
    for (const natural of template?.stats.special ?? []) {
      if (deduped.length >= 3) break
      if (!have.has(natural.type)) {
        deduped.push(structuredClone(natural))
        have.add(natural.type)
      }
    }
  }

  item.stats.special = deduped
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
