import type { RarityId } from '../types/index'

// ── Tunables ──────────────────────────────────────────────────────────────────
// All item stats in the game derive from these constants. Retuning progression
// means editing here — never the individual item definitions.

/** Average weapon damage at zone 0, common rarity, mod 1 */
export const WEAPON_BASE_AVG = 4.5
/** Multiplicative stat growth per zone tier (zones 0–7) */
export const ZONE_GROWTH = 1.5
/** Rarity stat multipliers */
export const RARITY_MULT: Record<RarityId, number> = {
  common: 1,
  uncommon: 1.3,
  rare: 1.65,
  epic: 2.1,
  legendary: 2.7,
}
/** Weapon min/max spread around the average: min = avg×(1−spread), max = avg×(1+spread) */
export const WEAPON_SPREAD = 0.3
/** Armor DEF at zone 0, common rarity, mod 1 */
export const ARMOR_DEF_BASE = 1.2
/** Armor HP bonus at zone 0, common rarity, mod 1 */
export const ARMOR_HP_BASE = 7

// ── Curves ────────────────────────────────────────────────────────────────────

function zoneRarityScale(zoneTier: number, rarity: RarityId): number {
  return Math.pow(ZONE_GROWTH, zoneTier) * RARITY_MULT[rarity]
}

/**
 * Weapon damage range for a zone tier (0–7) and rarity.
 * `dmgMod` is a per-item flavor multiplier (roughly 0.85–1.2).
 */
export function weaponDamage(
  zoneTier: number,
  rarity: RarityId,
  dmgMod = 1,
): { minDmg: number; maxDmg: number } {
  const avg = WEAPON_BASE_AVG * zoneRarityScale(zoneTier, rarity) * dmgMod
  return {
    minDmg: Math.max(1, Math.round(avg * (1 - WEAPON_SPREAD))),
    maxDmg: Math.max(2, Math.round(avg * (1 + WEAPON_SPREAD))),
  }
}

/**
 * Armor DEF/HP for a zone tier (0–7) and rarity.
 * `defMod`/`hpMod` shape armor archetypes (robes: low def / high hp, plate: inverse).
 */
export function armorStats(
  zoneTier: number,
  rarity: RarityId,
  defMod = 1,
  hpMod = 1,
): { defBonus: number; hpBonus: number } {
  const scale = zoneRarityScale(zoneTier, rarity)
  return {
    defBonus: Math.max(0, Math.round(ARMOR_DEF_BASE * scale * defMod)),
    hpBonus: Math.max(1, Math.round(ARMOR_HP_BASE * scale * hpMod)),
  }
}

/**
 * Single comparable power number for a zone/rarity slot — used for pricing
 * and balance tests, not combat.
 */
export function itemPowerScore(zoneTier: number, rarity: RarityId): number {
  return zoneRarityScale(zoneTier, rarity)
}
