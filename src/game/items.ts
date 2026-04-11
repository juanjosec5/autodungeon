import type { Item, ZoneId, RarityId } from '../types/index'

export const ITEM_DEFINITIONS: Item[] = [

  // ── Warrior weapons ───────────────────────────────────────────────────────────
  {
    id: 'rusty-sword', name: 'Rusty Sword', type: 'weapon', category: 'Sword', rarity: 'common',
    allowedClasses: ['warrior'], stats: { minDmg: 3, maxDmg: 7 },
  },
  {
    id: 'iron-sword', name: 'Iron Sword', type: 'weapon', category: 'Sword', rarity: 'uncommon',
    allowedClasses: 'any', stats: { minDmg: 6, maxDmg: 11 },
  },
  {
    id: 'war-hammer', name: 'War Hammer', type: 'weapon', category: 'Hammer', rarity: 'uncommon',
    allowedClasses: ['warrior'], stats: { minDmg: 8, maxDmg: 15 },
  },
  {
    id: 'broad-sword', name: 'Broad Sword', type: 'weapon', category: 'Sword', rarity: 'rare',
    allowedClasses: 'any', stats: { minDmg: 10, maxDmg: 17 },
  },
  {
    id: 'battle-axe', name: 'Battle Axe', type: 'weapon', category: 'Axe', rarity: 'rare',
    allowedClasses: 'any', stats: { minDmg: 12, maxDmg: 20 },
  },
  {
    id: 'shadowblade', name: 'Shadowblade', type: 'weapon', category: 'Sword', rarity: 'epic',
    allowedClasses: 'any', stats: { minDmg: 15, maxDmg: 24, special: [{ type: 'lifesteal', value: 0.1 }] },
  },
  {
    id: 'storm-cleaver', name: 'Storm Cleaver', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: 'any',
    stats: { minDmg: 17, maxDmg: 27, special: [{ type: 'critThreshold', rollsAt: 19 }, { type: 'attackSpeedBonus', percent: 0.1 }] },
  },
  {
    id: 'godslayer', name: 'Godslayer', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'],
    stats: {
      minDmg: 30, maxDmg: 50,
      special: [{ type: 'lifesteal', value: 0.2 }, { type: 'defIgnore', percent: 0.15 }, { type: 'critThreshold', rollsAt: 18 }],
    },
  },
  {
    id: 'titans-fist', name: "Titan's Fist", type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['warrior'],
    stats: {
      minDmg: 45, maxDmg: 70,
      special: [{ type: 'lifesteal', value: 0.25 }, { type: 'defIgnore', percent: 0.2 }, { type: 'attackSpeedBonus', percent: 0.15 }],
    },
  },

  // ── Rogue weapons ─────────────────────────────────────────────────────────────
  {
    id: 'shiv', name: 'Shiv', type: 'weapon', category: 'Dagger', rarity: 'common',
    allowedClasses: 'any', stats: { minDmg: 2, maxDmg: 5 },
  },
  {
    id: 'bone-dagger', name: 'Bone Dagger', type: 'weapon', category: 'Dagger', rarity: 'uncommon',
    allowedClasses: ['rogue'], stats: { minDmg: 3, maxDmg: 8 },
  },
  {
    id: 'twin-daggers', name: 'Twin Daggers', type: 'weapon', category: 'Daggers', rarity: 'uncommon',
    allowedClasses: 'any', stats: { minDmg: 4, maxDmg: 9 },
  },
  {
    id: 'venomblade', name: 'Venomblade', type: 'weapon', category: 'Dagger', rarity: 'rare',
    allowedClasses: 'any', stats: { minDmg: 7, maxDmg: 14, special: [{ type: 'poison', dpsMultiplier: 0.15 }] },
  },
  {
    id: 'cursed-blade', name: 'Cursed Blade', type: 'weapon', category: 'Dagger', rarity: 'rare',
    allowedClasses: 'any', stats: { minDmg: 8, maxDmg: 16, special: [{ type: 'poison', dpsMultiplier: 0.2 }] },
  },
  {
    id: 'deathwhisper', name: 'Deathwhisper', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: 'any', stats: { minDmg: 12, maxDmg: 20, special: [{ type: 'critThreshold', rollsAt: 15 }] },
  },
  {
    id: 'soul-reaper', name: 'Soul Reaper', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: 'any',
    stats: { minDmg: 14, maxDmg: 23, special: [{ type: 'lifesteal', value: 0.12 }, { type: 'critThreshold', rollsAt: 16 }] },
  },
  {
    id: 'wraithfang', name: 'Wraithfang', type: 'weapon', category: 'Dagger', rarity: 'legendary',
    allowedClasses: ['rogue'],
    stats: {
      minDmg: 25, maxDmg: 42,
      special: [{ type: 'poison', dpsMultiplier: 0.25 }, { type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }],
    },
  },
  {
    id: 'phantom-blades', name: 'Phantom Blades', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'],
    stats: {
      minDmg: 30, maxDmg: 50,
      special: [{ type: 'critThreshold', rollsAt: 12 }, { type: 'poison', dpsMultiplier: 0.3 }, { type: 'attackSpeedBonus', percent: 0.35 }],
    },
  },

  // ── Mage weapons ──────────────────────────────────────────────────────────────
  {
    id: 'crooked-staff', name: 'Crooked Staff', type: 'weapon', category: 'Staff', rarity: 'common',
    allowedClasses: 'any', stats: { minDmg: 4, maxDmg: 8 },
  },
  {
    id: 'ember-rod', name: 'Ember Rod', type: 'weapon', category: 'Staff', rarity: 'uncommon',
    allowedClasses: ['mage'], stats: { minDmg: 9, maxDmg: 16 },
  },
  {
    id: 'arcane-wand', name: 'Arcane Wand', type: 'weapon', category: 'Wand', rarity: 'uncommon',
    allowedClasses: 'any', stats: { minDmg: 7, maxDmg: 13 },
  },
  {
    id: 'spellbreaker', name: 'Spellbreaker', type: 'weapon', category: 'Staff', rarity: 'rare',
    allowedClasses: 'any', stats: { minDmg: 12, maxDmg: 20 },
  },
  {
    id: 'crystal-staff', name: 'Crystal Staff', type: 'weapon', category: 'Staff', rarity: 'rare',
    allowedClasses: 'any', stats: { minDmg: 14, maxDmg: 23 },
  },
  {
    id: 'voidstaff', name: 'Voidstaff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: 'any', stats: { minDmg: 18, maxDmg: 30, special: [{ type: 'defIgnore', percent: 0.35 }] },
  },
  {
    id: 'arcane-surge', name: 'Arcane Surge', type: 'weapon', category: 'Wand', rarity: 'epic',
    allowedClasses: 'any',
    stats: { minDmg: 22, maxDmg: 36, special: [{ type: 'defIgnore', percent: 0.3 }, { type: 'spellAmp', percent: 0.15 }] },
  },
  {
    id: 'eternum', name: 'Eternum', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'],
    stats: {
      minDmg: 35, maxDmg: 55,
      special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.3 }],
    },
  },
  {
    id: 'abyssal-tome', name: 'Abyssal Tome', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'],
    stats: {
      minDmg: 42, maxDmg: 65,
      special: [{ type: 'defIgnore', percent: 0.6 }, { type: 'doublecast', chance: 0.35 }, { type: 'spellAmp', percent: 0.2 }],
    },
  },

  // ── Armor ─────────────────────────────────────────────────────────────────────
  {
    id: 'leather-scraps', name: 'Leather Scraps', type: 'armor', category: 'Light Armor', rarity: 'common',
    allowedClasses: 'any', stats: { defBonus: 1, hpBonus: 5 },
  },
  {
    id: 'chainmail', name: 'Chainmail', type: 'armor', category: 'Chain Armor', rarity: 'uncommon',
    allowedClasses: 'any', stats: { defBonus: 3, hpBonus: 10 },
  },
  {
    id: 'iron-shield', name: 'Iron Shield', type: 'armor', category: 'Shield', rarity: 'uncommon',
    allowedClasses: ['warrior'], stats: { defBonus: 5, hpBonus: 6 },
  },
  {
    id: 'shadow-cloak', name: 'Shadow Cloak', type: 'armor', category: 'Cloak', rarity: 'uncommon',
    allowedClasses: 'any', stats: { defBonus: 2, hpBonus: 8 },
  },
  {
    id: 'mage-robes', name: 'Mage Robes', type: 'armor', category: 'Robes', rarity: 'uncommon',
    allowedClasses: 'any', stats: { defBonus: 1, hpBonus: 12 },
  },
  {
    id: 'plate-armor', name: 'Plate Armor', type: 'armor', category: 'Plate Armor', rarity: 'rare',
    allowedClasses: 'any', stats: { defBonus: 6, hpBonus: 20 },
  },
  {
    id: 'bone-plate', name: 'Bone Plate', type: 'armor', category: 'Plate Armor', rarity: 'rare',
    allowedClasses: 'any', stats: { defBonus: 7, hpBonus: 22 },
  },
  {
    id: 'assassins-garb', name: "Assassin's Garb", type: 'armor', category: 'Light Armor', rarity: 'rare',
    allowedClasses: 'any', stats: { defBonus: 4, hpBonus: 15 },
  },
  {
    id: 'arcane-vestment', name: 'Arcane Vestment', type: 'armor', category: 'Robes', rarity: 'rare',
    allowedClasses: 'any', stats: { defBonus: 3, hpBonus: 20, special: [{ type: 'spellAmp', percent: 0.1 }] },
  },
  {
    id: 'cursed-vestments', name: 'Cursed Vestments', type: 'armor', category: 'Robes', rarity: 'rare',
    allowedClasses: 'any', stats: { defBonus: 3, hpBonus: 18, special: [{ type: 'spellAmp', percent: 0.08 }] },
  },
  {
    id: 'dragonscale-mail', name: 'Dragonscale Mail', type: 'armor', category: 'Chain Armor', rarity: 'epic',
    allowedClasses: 'any', stats: { defBonus: 10, hpBonus: 35 },
  },
  {
    id: 'blood-plate', name: 'Blood Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: 'any', stats: { defBonus: 13, hpBonus: 42, special: [{ type: 'regenOnKill', percent: 0.1 }] },
  },
  {
    id: 'phantom-shroud', name: 'Phantom Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: 'any', stats: { defBonus: 7, hpBonus: 25, special: [{ type: 'dodge', chance: 0.2 }] },
  },
  {
    id: 'shadow-veil', name: 'Shadow Veil', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: 'any', stats: { defBonus: 8, hpBonus: 28, special: [{ type: 'dodge', chance: 0.25 }] },
  },
  {
    id: 'starweave-robe', name: 'Starweave Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: 'any', stats: { defBonus: 5, hpBonus: 30, special: [{ type: 'spellAmp', percent: 0.15 }] },
  },
  {
    id: 'arcane-barrier', name: 'Arcane Barrier', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: 'any', stats: { defBonus: 7, hpBonus: 36, special: [{ type: 'spellAmp', percent: 0.2 }] },
  },
  {
    id: 'aegis-of-eternity', name: 'Aegis of Eternity', type: 'armor', category: 'Shield', rarity: 'legendary',
    allowedClasses: ['warrior'], stats: { defBonus: 18, hpBonus: 60, special: [{ type: 'block', chance: 0.1 }] },
  },
  {
    id: 'voidweave-shroud', name: 'Voidweave Shroud', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], stats: { defBonus: 12, hpBonus: 40, special: [{ type: 'dodge', chance: 0.3 }] },
  },
  {
    id: 'archmages-mantle', name: "Archmage's Mantle", type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'],
    stats: { defBonus: 8, hpBonus: 50, special: [{ type: 'spellAmp', percent: 0.25 }, { type: 'regenOnKill', percent: 0.15 }] },
  },
  {
    id: 'abyssal-plate', name: 'Abyssal Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'],
    stats: { defBonus: 25, hpBonus: 90, special: [{ type: 'block', chance: 0.15 }, { type: 'regenOnKill', percent: 0.2 }] },
  },
  {
    id: 'void-shroud', name: 'Void Shroud', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'],
    stats: { defBonus: 16, hpBonus: 60, special: [{ type: 'dodge', chance: 0.35 }, { type: 'regenOnKill', percent: 0.1 }] },
  },
  {
    id: 'rift-mantle', name: 'Rift Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'],
    stats: { defBonus: 11, hpBonus: 75, special: [{ type: 'spellAmp', percent: 0.4 }, { type: 'regenOnKill', percent: 0.2 }] },
  },
]

export function getItemById(id: string): Item | undefined {
  return ITEM_DEFINITIONS.find((item) => item.id === id)
}

const RARITY_WEIGHTS: { rarity: RarityId; weight: number }[] = [
  { rarity: 'common',    weight: 0.5999 },
  { rarity: 'uncommon',  weight: 0.25   },
  { rarity: 'rare',      weight: 0.12   },
  { rarity: 'epic',      weight: 0.03   },
  { rarity: 'legendary', weight: 0.0001 },
]

/** Boss enemy IDs — allowed to drop Legendary loot via rollLoot */
const BOSS_IDS = new Set(['forest-troll', 'dark-knight', 'dragon', 'abyssal-titan'])

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

export function rollLoot(zone: ZoneId, enemyId: string): Item {
  const isBoss = BOSS_IDS.has(enemyId)
  let rarity = rollRarity(isBoss)

  // Clamp rarity to zone pool
  if (zone === 'forest') {
    if (rarity === 'legendary' || rarity === 'epic') rarity = 'rare'
  } else if (zone === 'dungeon') {
    if (rarity === 'legendary') rarity = 'epic'
  }
  // volcano and abyss: no clamp (volcano boss drops legendary, abyss boss drops legendary)

  const pool = ITEM_DEFINITIONS.filter((item) => item.rarity === rarity)
  const template = pool[Math.floor(Math.random() * pool.length)]
  return { ...structuredClone(template), defId: template.id, id: crypto.randomUUID() }
}

/** Guaranteed weapon drop for zone boss — always top rarity for that zone */
export function rollBossLoot(zone: ZoneId): Item {
  const rarityByZone: Record<ZoneId, RarityId> = {
    forest:  'rare',
    dungeon: 'epic',
    volcano: 'legendary',
    abyss:   'legendary',
  }
  const rarity = rarityByZone[zone]
  const pool = ITEM_DEFINITIONS.filter((i) => i.type === 'weapon' && i.rarity === rarity)
  const template = pool[Math.floor(Math.random() * pool.length)]
  return { ...structuredClone(template), defId: template.id, id: crypto.randomUUID() }
}

export function getSellPrice(rarity: RarityId): number {
  const prices: Record<RarityId, number> = {
    common: 5, uncommon: 15, rare: 40, epic: 120, legendary: 500,
  }
  return prices[rarity]
}

export function getBuyPrice(rarity: RarityId): number {
  const prices: Record<RarityId, number> = {
    common: 20, uncommon: 60, rare: 150, epic: 450, legendary: 2000,
  }
  return prices[rarity]
}

export const SHOP_ITEMS: { id: string; minZone: number }[] = [
  { id: 'rusty-sword',        minZone: 0 },
  { id: 'shiv',               minZone: 0 },
  { id: 'crooked-staff',      minZone: 0 },
  { id: 'leather-scraps',     minZone: 0 },
  { id: 'iron-sword',         minZone: 1 },
  { id: 'war-hammer',         minZone: 1 },
  { id: 'bone-dagger',        minZone: 1 },
  { id: 'twin-daggers',       minZone: 1 },
  { id: 'ember-rod',          minZone: 1 },
  { id: 'arcane-wand',        minZone: 1 },
  { id: 'chainmail',          minZone: 1 },
  { id: 'iron-shield',        minZone: 1 },
  { id: 'shadow-cloak',       minZone: 1 },
  { id: 'mage-robes',         minZone: 1 },
  { id: 'broad-sword',        minZone: 2 },
  { id: 'battle-axe',         minZone: 2 },
  { id: 'venomblade',         minZone: 2 },
  { id: 'cursed-blade',       minZone: 2 },
  { id: 'spellbreaker',       minZone: 2 },
  { id: 'crystal-staff',      minZone: 2 },
  { id: 'plate-armor',        minZone: 2 },
  { id: 'bone-plate',         minZone: 2 },
  { id: 'assassins-garb',     minZone: 2 },
  { id: 'arcane-vestment',    minZone: 2 },
  { id: 'cursed-vestments',   minZone: 2 },
  { id: 'shadowblade',        minZone: 3 },
  { id: 'storm-cleaver',      minZone: 3 },
  { id: 'deathwhisper',       minZone: 3 },
  { id: 'soul-reaper',        minZone: 3 },
  { id: 'voidstaff',          minZone: 3 },
  { id: 'arcane-surge',       minZone: 3 },
  { id: 'dragonscale-mail',   minZone: 3 },
  { id: 'blood-plate',        minZone: 3 },
  { id: 'phantom-shroud',     minZone: 3 },
  { id: 'shadow-veil',        minZone: 3 },
  { id: 'starweave-robe',     minZone: 3 },
  { id: 'arcane-barrier',     minZone: 3 },
  { id: 'godslayer',          minZone: 4 },
  { id: 'titans-fist',        minZone: 4 },
  { id: 'wraithfang',         minZone: 4 },
  { id: 'phantom-blades',     minZone: 4 },
  { id: 'eternum',            minZone: 4 },
  { id: 'abyssal-tome',       minZone: 4 },
  { id: 'aegis-of-eternity',  minZone: 4 },
  { id: 'voidweave-shroud',   minZone: 4 },
  { id: 'archmages-mantle',   minZone: 4 },
  { id: 'abyssal-plate',      minZone: 4 },
  { id: 'void-shroud',        minZone: 4 },
  { id: 'rift-mantle',        minZone: 4 },
]
