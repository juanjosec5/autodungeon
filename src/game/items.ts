import type { Item, ZoneId, RarityId } from '../types/index'

export const ITEM_DEFINITIONS: Item[] = [
  // ── Warrior weapons ──────────────────────────────────────────────────────
  {
    id: 'rusty-sword',
    name: 'Rusty Sword',
    type: 'weapon',
    rarity: 'common',
    allowedClasses: ['warrior'],
    stats: { minDmg: 3, maxDmg: 7 },
  },
  {
    id: 'iron-sword',
    name: 'Iron Sword',
    type: 'weapon',
    rarity: 'uncommon',
    allowedClasses: 'any',
    stats: { minDmg: 6, maxDmg: 11 },
  },
  {
    id: 'broad-sword',
    name: 'Broad Sword',
    type: 'weapon',
    rarity: 'rare',
    allowedClasses: 'any',
    stats: { minDmg: 10, maxDmg: 17 },
  },
  {
    id: 'shadowblade',
    name: 'Shadowblade',
    type: 'weapon',
    rarity: 'epic',
    allowedClasses: 'any',
    stats: { minDmg: 15, maxDmg: 24, special: [{ type: 'lifesteal', value: 0.1 }] },
  },
  {
    id: 'godslayer',
    name: 'Godslayer',
    type: 'weapon',
    rarity: 'legendary',
    allowedClasses: ['warrior'],
    stats: {
      minDmg: 30,
      maxDmg: 50,
      special: [
        { type: 'lifesteal', value: 0.2 },
        { type: 'defIgnore', percent: 0.15 },
        { type: 'critThreshold', rollsAt: 18 },
      ],
    },
  },

  // ── Rogue weapons ─────────────────────────────────────────────────────────
  {
    id: 'shiv',
    name: 'Shiv',
    type: 'weapon',
    rarity: 'common',
    allowedClasses: 'any',
    stats: { minDmg: 2, maxDmg: 5 },
  },
  {
    id: 'twin-daggers',
    name: 'Twin Daggers',
    type: 'weapon',
    rarity: 'uncommon',
    allowedClasses: 'any',
    stats: { minDmg: 4, maxDmg: 9 },
  },
  {
    id: 'venomblade',
    name: 'Venomblade',
    type: 'weapon',
    rarity: 'rare',
    allowedClasses: 'any',
    stats: { minDmg: 7, maxDmg: 14, special: [{ type: 'poison', dpsMultiplier: 0.15 }] },
  },
  {
    id: 'deathwhisper',
    name: 'Deathwhisper',
    type: 'weapon',
    rarity: 'epic',
    allowedClasses: 'any',
    stats: { minDmg: 12, maxDmg: 20, special: [{ type: 'critThreshold', rollsAt: 15 }] },
  },
  {
    id: 'wraithfang',
    name: 'Wraithfang',
    type: 'weapon',
    rarity: 'legendary',
    allowedClasses: ['rogue'],
    stats: {
      minDmg: 25,
      maxDmg: 42,
      special: [
        { type: 'poison', dpsMultiplier: 0.25 },
        { type: 'critThreshold', rollsAt: 14 },
        { type: 'attackSpeedBonus', percent: 0.25 },
      ],
    },
  },

  // ── Mage weapons ──────────────────────────────────────────────────────────
  {
    id: 'crooked-staff',
    name: 'Crooked Staff',
    type: 'weapon',
    rarity: 'common',
    allowedClasses: 'any',
    stats: { minDmg: 4, maxDmg: 8 },
  },
  {
    id: 'arcane-wand',
    name: 'Arcane Wand',
    type: 'weapon',
    rarity: 'uncommon',
    allowedClasses: 'any',
    stats: { minDmg: 7, maxDmg: 13 },
  },
  {
    id: 'spellbreaker',
    name: 'Spellbreaker',
    type: 'weapon',
    rarity: 'rare',
    allowedClasses: 'any',
    stats: { minDmg: 12, maxDmg: 20 },
  },
  {
    id: 'voidstaff',
    name: 'Voidstaff',
    type: 'weapon',
    rarity: 'epic',
    allowedClasses: 'any',
    stats: { minDmg: 18, maxDmg: 30, special: [{ type: 'defIgnore', percent: 0.35 }] },
  },
  {
    id: 'eternum',
    name: 'Eternum',
    type: 'weapon',
    rarity: 'legendary',
    allowedClasses: ['mage'],
    stats: {
      minDmg: 35,
      maxDmg: 55,
      special: [
        { type: 'defIgnore', percent: 0.5 },
        { type: 'doublecast', chance: 0.3 },
      ],
    },
  },

  // ── Armor ─────────────────────────────────────────────────────────────────
  {
    id: 'leather-scraps',
    name: 'Leather Scraps',
    type: 'armor',
    rarity: 'common',
    allowedClasses: 'any',
    stats: { defBonus: 1, hpBonus: 5 },
  },
  {
    id: 'chainmail',
    name: 'Chainmail',
    type: 'armor',
    rarity: 'uncommon',
    allowedClasses: 'any',
    stats: { defBonus: 3, hpBonus: 10 },
  },
  {
    id: 'shadow-cloak',
    name: 'Shadow Cloak',
    type: 'armor',
    rarity: 'uncommon',
    allowedClasses: 'any',
    stats: { defBonus: 2, hpBonus: 8 },
  },
  {
    id: 'mage-robes',
    name: 'Mage Robes',
    type: 'armor',
    rarity: 'uncommon',
    allowedClasses: 'any',
    stats: { defBonus: 1, hpBonus: 12 },
  },
  {
    id: 'plate-armor',
    name: 'Plate Armor',
    type: 'armor',
    rarity: 'rare',
    allowedClasses: 'any',
    stats: { defBonus: 6, hpBonus: 20 },
  },
  {
    id: 'assassins-garb',
    name: "Assassin's Garb",
    type: 'armor',
    rarity: 'rare',
    allowedClasses: 'any',
    stats: { defBonus: 4, hpBonus: 15 },
  },
  {
    id: 'arcane-vestment',
    name: 'Arcane Vestment',
    type: 'armor',
    rarity: 'rare',
    allowedClasses: 'any',
    stats: { defBonus: 3, hpBonus: 20, special: [{ type: 'spellAmp', percent: 0.1 }] },
  },
  {
    id: 'dragonscale-mail',
    name: 'Dragonscale Mail',
    type: 'armor',
    rarity: 'epic',
    allowedClasses: 'any',
    stats: { defBonus: 10, hpBonus: 35 },
  },
  {
    id: 'phantom-shroud',
    name: 'Phantom Shroud',
    type: 'armor',
    rarity: 'epic',
    allowedClasses: 'any',
    stats: { defBonus: 7, hpBonus: 25, special: [{ type: 'dodge', chance: 0.2 }] },
  },
  {
    id: 'starweave-robe',
    name: 'Starweave Robe',
    type: 'armor',
    rarity: 'epic',
    allowedClasses: 'any',
    stats: { defBonus: 5, hpBonus: 30, special: [{ type: 'spellAmp', percent: 0.15 }] },
  },
  {
    id: 'aegis-of-eternity',
    name: 'Aegis of Eternity',
    type: 'armor',
    rarity: 'legendary',
    allowedClasses: ['warrior'],
    stats: { defBonus: 18, hpBonus: 60, special: [{ type: 'block', chance: 0.1 }] },
  },
  {
    id: 'voidweave-shroud',
    name: 'Voidweave Shroud',
    type: 'armor',
    rarity: 'legendary',
    allowedClasses: ['rogue'],
    stats: { defBonus: 12, hpBonus: 40, special: [{ type: 'dodge', chance: 0.3 }] },
  },
  {
    id: 'archmages-mantle',
    name: "Archmage's Mantle",
    type: 'armor',
    rarity: 'legendary',
    allowedClasses: ['mage'],
    stats: {
      defBonus: 8,
      hpBonus: 50,
      special: [
        { type: 'spellAmp', percent: 0.25 },
        { type: 'regenOnKill', percent: 0.15 },
      ],
    },
  },
]

export function getItemById(id: string): Item | undefined {
  return ITEM_DEFINITIONS.find((item) => item.id === id)
}

const RARITY_WEIGHTS: { rarity: RarityId; weight: number }[] = [
  { rarity: 'common', weight: 0.5999 },
  { rarity: 'uncommon', weight: 0.25 },
  { rarity: 'rare', weight: 0.12 },
  { rarity: 'epic', weight: 0.03 },
  { rarity: 'legendary', weight: 0.0001 },
]

function rollRarity(isDragon: boolean): RarityId {
  const roll = Math.random()
  let cumulative = 0
  for (const { rarity, weight } of RARITY_WEIGHTS) {
    cumulative += weight
    if (roll < cumulative) {
      if (rarity === 'legendary' && !isDragon) return 'epic'
      return rarity
    }
  }
  return 'common'
}

export function rollLoot(zone: ZoneId, isDragon: boolean): Item {
  let rarity = rollRarity(isDragon)

  // Clamp rarity to zone pool
  if (zone === 'forest') {
    if (rarity === 'legendary' || rarity === 'epic') rarity = 'rare'
  } else if (zone === 'dungeon') {
    if (rarity === 'legendary') rarity = 'epic'
  }

  const pool = ITEM_DEFINITIONS.filter((item) => item.rarity === rarity)
  const template = pool[Math.floor(Math.random() * pool.length)]
  return { ...structuredClone(template), id: crypto.randomUUID() }
}

export function getSellPrice(rarity: RarityId): number {
  const prices: Record<RarityId, number> = {
    common: 5,
    uncommon: 15,
    rare: 40,
    epic: 120,
    legendary: 500,
  }
  return prices[rarity]
}
