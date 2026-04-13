import type { Item, ZoneId, SpecialEffect } from '../types/index'

export const ITEM_DEFINITIONS: Item[] = [

  // ── Warrior weapons ───────────────────────────────────────────────────────────
  {
    id: 'rusty-sword', name: 'Rusty Sword', type: 'weapon', category: 'Sword', rarity: 'common',
    allowedClasses: ['warrior'], stats: { minDmg: 3, maxDmg: 7 },
  },
  {
    id: 'club', name: 'Club', type: 'weapon', category: 'Hammer', rarity: 'common',
    allowedClasses: ['warrior'], stats: { minDmg: 2, maxDmg: 6 },
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
    id: 'executioners-axe', name: "Executioner's Axe", type: 'weapon', category: 'Axe', rarity: 'rare',
    allowedClasses: 'any', stats: { minDmg: 13, maxDmg: 22, special: [{ type: 'critThreshold', rollsAt: 19 }] },
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
    id: 'berserker-axe', name: 'Berserker Axe', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['warrior'],
    stats: { minDmg: 20, maxDmg: 32, special: [{ type: 'lifesteal', value: 0.08 }, { type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'void-edge', name: 'Void Edge', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'],
    stats: {
      minDmg: 35, maxDmg: 55,
      special: [{ type: 'defIgnore', percent: 0.25 }, { type: 'critThreshold', rollsAt: 17 }, { type: 'lifesteal', value: 0.15 }],
    },
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
    id: 'hunting-knife', name: 'Hunting Knife', type: 'weapon', category: 'Dagger', rarity: 'common',
    allowedClasses: 'any', stats: { minDmg: 2, maxDmg: 4 },
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
    id: 'steel-dagger', name: 'Steel Dagger', type: 'weapon', category: 'Dagger', rarity: 'uncommon',
    allowedClasses: ['rogue'], stats: { minDmg: 5, maxDmg: 11 },
  },
  {
    id: 'throwing-knives', name: 'Throwing Knives', type: 'weapon', category: 'Daggers', rarity: 'uncommon',
    allowedClasses: 'any', stats: { minDmg: 3, maxDmg: 8, special: [{ type: 'attackSpeedBonus', percent: 0.1 }] },
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
    id: 'spirit-blade', name: 'Spirit Blade', type: 'weapon', category: 'Dagger', rarity: 'rare',
    allowedClasses: ['rogue'], stats: { minDmg: 9, maxDmg: 17, special: [{ type: 'lifesteal', value: 0.1 }] },
  },
  {
    id: 'shadowstep-blade', name: 'Shadowstep Blade', type: 'weapon', category: 'Dagger', rarity: 'rare',
    allowedClasses: ['rogue'], stats: { minDmg: 10, maxDmg: 18, special: [{ type: 'attackSpeedBonus', percent: 0.15 }] },
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
    id: 'wraith-dagger', name: 'Wraith Dagger', type: 'weapon', category: 'Dagger', rarity: 'epic',
    allowedClasses: ['rogue'],
    stats: { minDmg: 13, maxDmg: 21, special: [{ type: 'poison', dpsMultiplier: 0.18 }, { type: 'dodge', chance: 0.1 }] },
  },
  {
    id: 'shadowdancer', name: 'Shadowdancer', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'],
    stats: {
      minDmg: 28, maxDmg: 45,
      special: [{ type: 'critThreshold', rollsAt: 13 }, { type: 'attackSpeedBonus', percent: 0.3 }, { type: 'poison', dpsMultiplier: 0.2 }],
    },
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
    id: 'apprentice-wand', name: 'Apprentice Wand', type: 'weapon', category: 'Wand', rarity: 'common',
    allowedClasses: ['mage'], stats: { minDmg: 3, maxDmg: 6 },
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
    id: 'battle-staff', name: 'Battle Staff', type: 'weapon', category: 'Staff', rarity: 'uncommon',
    allowedClasses: ['mage'], stats: { minDmg: 10, maxDmg: 18 },
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
    id: 'lightning-rod', name: 'Lightning Rod', type: 'weapon', category: 'Staff', rarity: 'rare',
    allowedClasses: ['mage'], stats: { minDmg: 13, maxDmg: 21, special: [{ type: 'defIgnore', percent: 0.15 }] },
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
    id: 'celestial-tome', name: 'Celestial Tome', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'],
    stats: {
      minDmg: 38, maxDmg: 60,
      special: [{ type: 'spellAmp', percent: 0.3 }, { type: 'doublecast', chance: 0.25 }, { type: 'defIgnore', percent: 0.4 }],
    },
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
    id: 'worn-tunic', name: 'Worn Tunic', type: 'armor', category: 'Light Armor', rarity: 'common',
    allowedClasses: 'any', stats: { defBonus: 0, hpBonus: 8 },
  },
  {
    id: 'chainmail', name: 'Chainmail', type: 'armor', category: 'Chain Armor', rarity: 'uncommon',
    allowedClasses: 'any', stats: { defBonus: 3, hpBonus: 10 },
  },
  {
    id: 'padded-armor', name: 'Padded Armor', type: 'armor', category: 'Light Armor', rarity: 'uncommon',
    allowedClasses: 'any', stats: { defBonus: 2, hpBonus: 12 },
  },
  {
    id: 'linen-robe', name: 'Linen Robe', type: 'armor', category: 'Robes', rarity: 'uncommon',
    allowedClasses: 'any', stats: { defBonus: 1, hpBonus: 15 },
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
    id: 'scale-mail', name: 'Scale Mail', type: 'armor', category: 'Chain Armor', rarity: 'rare',
    allowedClasses: 'any', stats: { defBonus: 6, hpBonus: 18, special: [{ type: 'block', chance: 0.05 }] },
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
    id: 'thornmail', name: 'Thornmail', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: 'any', stats: { defBonus: 12, hpBonus: 38, special: [{ type: 'block', chance: 0.12 }] },
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

  // ═══════════════════════════════════════════════════════════════════════════════
  // ── Shadowrealm zone items (dropFromZoneIdx: 4) ───────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════════

  // Epics
  {
    id: 'dread-axe', name: 'Dread Axe', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 4,
    stats: { minDmg: 42, maxDmg: 68, special: [{ type: 'lifesteal', value: 0.1 }, { type: 'attackSpeedBonus', percent: 0.08 }] },
  },
  {
    id: 'shadow-knives', name: 'Shadow Knives', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 4,
    stats: { minDmg: 35, maxDmg: 56, special: [{ type: 'critThreshold', rollsAt: 16 }, { type: 'attackSpeedBonus', percent: 0.2 }] },
  },
  {
    id: 'dusk-staff', name: 'Dusk Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 4,
    stats: { minDmg: 40, maxDmg: 64, special: [{ type: 'defIgnore', percent: 0.4 }, { type: 'spellAmp', percent: 0.12 }] },
  },
  {
    id: 'shadow-plate', name: 'Shadow Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 4,
    stats: { defBonus: 20, hpBonus: 70, special: [{ type: 'block', chance: 0.15 }] },
  },
  {
    id: 'dread-shroud', name: 'Dread Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 4,
    stats: { defBonus: 14, hpBonus: 58, special: [{ type: 'dodge', chance: 0.28 }] },
  },
  {
    id: 'cursed-mantle', name: 'Cursed Mantle', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 4,
    stats: { defBonus: 10, hpBonus: 75, special: [{ type: 'spellAmp', percent: 0.22 }, { type: 'regenOnKill', percent: 0.08 }] },
  },
  // BiS Legendaries
  {
    id: 'shade-reaper', name: 'Shade Reaper', type: 'weapon', category: 'Axe', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 4,
    stats: {
      minDmg: 65, maxDmg: 100,
      special: [{ type: 'lifesteal', value: 0.2 }, { type: 'defIgnore', percent: 0.25 }, { type: 'critThreshold', rollsAt: 18 }],
    },
  },
  {
    id: 'twilight-fang', name: 'Twilight Fang', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 4,
    stats: {
      minDmg: 50, maxDmg: 80,
      special: [{ type: 'critThreshold', rollsAt: 11 }, { type: 'attackSpeedBonus', percent: 0.4 }, { type: 'poison', dpsMultiplier: 0.25 }],
    },
  },
  {
    id: 'grimoire-of-dread', name: 'Grimoire of Dread', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 4,
    stats: {
      minDmg: 60, maxDmg: 95,
      special: [{ type: 'defIgnore', percent: 0.65 }, { type: 'doublecast', chance: 0.3 }, { type: 'spellAmp', percent: 0.25 }],
    },
  },
  {
    id: 'shadowplate-fortress', name: 'Shadowplate Fortress', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 4,
    stats: { defBonus: 35, hpBonus: 130, special: [{ type: 'block', chance: 0.2 }, { type: 'regenOnKill', percent: 0.25 }] },
  },
  {
    id: 'dread-stalker-veil', name: "Dread Stalker's Veil", type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 4,
    stats: { defBonus: 22, hpBonus: 90, special: [{ type: 'dodge', chance: 0.4 }, { type: 'regenOnKill', percent: 0.12 }] },
  },
  {
    id: 'shadow-weave-mantle', name: 'Shadow Weave Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 4,
    stats: { defBonus: 16, hpBonus: 110, special: [{ type: 'spellAmp', percent: 0.45 }, { type: 'regenOnKill', percent: 0.25 }] },
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // ── Celestial zone items (dropFromZoneIdx: 5) ─────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════════

  // Epics
  {
    id: 'holy-cleaver', name: 'Holy Cleaver', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 5,
    stats: { minDmg: 55, maxDmg: 88, special: [{ type: 'defIgnore', percent: 0.15 }, { type: 'lifesteal', value: 0.12 }] },
  },
  {
    id: 'celestial-blades', name: 'Celestial Blades', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 5,
    stats: { minDmg: 46, maxDmg: 74, special: [{ type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.22 }] },
  },
  {
    id: 'star-wand', name: 'Star Wand', type: 'weapon', category: 'Wand', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 5,
    stats: { minDmg: 52, maxDmg: 84, special: [{ type: 'defIgnore', percent: 0.45 }, { type: 'doublecast', chance: 0.2 }] },
  },
  {
    id: 'astral-plate', name: 'Astral Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 5,
    stats: { defBonus: 26, hpBonus: 90, special: [{ type: 'block', chance: 0.17 }, { type: 'regenOnKill', percent: 0.1 }] },
  },
  {
    id: 'celestial-shroud', name: 'Celestial Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 5,
    stats: { defBonus: 18, hpBonus: 75, special: [{ type: 'dodge', chance: 0.3 }] },
  },
  {
    id: 'divine-robe', name: 'Divine Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 5,
    stats: { defBonus: 13, hpBonus: 100, special: [{ type: 'spellAmp', percent: 0.28 }, { type: 'regenOnKill', percent: 0.12 }] },
  },
  // BiS Legendaries
  {
    id: 'sunblade-divine', name: 'Sunblade Divine', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 5,
    stats: {
      minDmg: 85, maxDmg: 135,
      special: [{ type: 'lifesteal', value: 0.25 }, { type: 'defIgnore', percent: 0.3 }, { type: 'attackSpeedBonus', percent: 0.2 }],
    },
  },
  {
    id: 'starburst-knives', name: 'Starburst Knives', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 5,
    stats: {
      minDmg: 66, maxDmg: 105,
      special: [{ type: 'critThreshold', rollsAt: 10 }, { type: 'attackSpeedBonus', percent: 0.45 }, { type: 'poison', dpsMultiplier: 0.3 }],
    },
  },
  {
    id: 'astral-codex', name: 'Astral Codex', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 5,
    stats: {
      minDmg: 80, maxDmg: 125,
      special: [{ type: 'defIgnore', percent: 0.7 }, { type: 'doublecast', chance: 0.38 }, { type: 'spellAmp', percent: 0.3 }],
    },
  },
  {
    id: 'celestial-aegis', name: 'Celestial Aegis', type: 'armor', category: 'Shield', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 5,
    stats: { defBonus: 48, hpBonus: 175, special: [{ type: 'block', chance: 0.25 }, { type: 'regenOnKill', percent: 0.3 }] },
  },
  {
    id: 'starlight-veil', name: 'Starlight Veil', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 5,
    stats: { defBonus: 30, hpBonus: 125, special: [{ type: 'dodge', chance: 0.45 }, { type: 'regenOnKill', percent: 0.15 }] },
  },
  {
    id: 'cosmic-mantle', name: 'Cosmic Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 5,
    stats: { defBonus: 22, hpBonus: 150, special: [{ type: 'spellAmp', percent: 0.55 }, { type: 'regenOnKill', percent: 0.3 }] },
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // ── Void zone items (dropFromZoneIdx: 6) ──────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════════

  // Epics
  {
    id: 'void-cleaver', name: 'Void Cleaver', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 6,
    stats: { minDmg: 72, maxDmg: 115, special: [{ type: 'defIgnore', percent: 0.2 }, { type: 'lifesteal', value: 0.15 }] },
  },
  {
    id: 'null-daggers', name: 'Null Daggers', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 6,
    stats: { minDmg: 60, maxDmg: 96, special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }] },
  },
  {
    id: 'rift-staff', name: 'Rift Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 6,
    stats: { minDmg: 68, maxDmg: 108, special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.22 }] },
  },
  {
    id: 'void-plate', name: 'Void Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 6,
    stats: { defBonus: 34, hpBonus: 120, special: [{ type: 'block', chance: 0.2 }, { type: 'regenOnKill', percent: 0.12 }] },
  },
  {
    id: 'null-shroud', name: 'Null Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 6,
    stats: { defBonus: 24, hpBonus: 100, special: [{ type: 'dodge', chance: 0.35 }] },
  },
  {
    id: 'rift-vestment', name: 'Rift Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 6,
    stats: { defBonus: 18, hpBonus: 130, special: [{ type: 'spellAmp', percent: 0.35 }, { type: 'regenOnKill', percent: 0.15 }] },
  },
  // BiS Legendaries
  {
    id: 'null-executioner', name: 'Null Executioner', type: 'weapon', category: 'Axe', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 6,
    stats: {
      minDmg: 110, maxDmg: 175,
      special: [{ type: 'lifesteal', value: 0.3 }, { type: 'defIgnore', percent: 0.35 }, { type: 'critThreshold', rollsAt: 17 }],
    },
  },
  {
    id: 'void-piercer', name: 'Void Piercer', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 6,
    stats: {
      minDmg: 85, maxDmg: 136,
      special: [{ type: 'critThreshold', rollsAt: 9 }, { type: 'attackSpeedBonus', percent: 0.5 }, { type: 'poison', dpsMultiplier: 0.35 }],
    },
  },
  {
    id: 'entropy-grimoire', name: 'Entropy Grimoire', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 6,
    stats: {
      minDmg: 105, maxDmg: 165,
      special: [{ type: 'defIgnore', percent: 0.75 }, { type: 'doublecast', chance: 0.45 }, { type: 'spellAmp', percent: 0.35 }],
    },
  },
  {
    id: 'nullshield', name: 'Nullshield', type: 'armor', category: 'Shield', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 6,
    stats: { defBonus: 65, hpBonus: 230, special: [{ type: 'block', chance: 0.3 }, { type: 'regenOnKill', percent: 0.35 }] },
  },
  {
    id: 'void-wraith-cloak', name: 'Void Wraith Cloak', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 6,
    stats: { defBonus: 40, hpBonus: 170, special: [{ type: 'dodge', chance: 0.5 }, { type: 'regenOnKill', percent: 0.18 }] },
  },
  {
    id: 'entropy-mantle', name: 'Entropy Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 6,
    stats: { defBonus: 30, hpBonus: 200, special: [{ type: 'spellAmp', percent: 0.65 }, { type: 'regenOnKill', percent: 0.35 }] },
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // ── Nightmare zone items (dropFromZoneIdx: 7) ─────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════════

  // Epics
  {
    id: 'horror-blade', name: 'Horror Blade', type: 'weapon', category: 'Sword', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 7,
    stats: { minDmg: 95, maxDmg: 150, special: [{ type: 'defIgnore', percent: 0.25 }, { type: 'lifesteal', value: 0.18 }] },
  },
  {
    id: 'nightmare-blades', name: 'Nightmare Blades', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 7,
    stats: { minDmg: 78, maxDmg: 124, special: [{ type: 'critThreshold', rollsAt: 13 }, { type: 'attackSpeedBonus', percent: 0.28 }] },
  },
  {
    id: 'dread-tome', name: 'Dread Tome', type: 'weapon', category: 'Tome', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 7,
    stats: { minDmg: 90, maxDmg: 142, special: [{ type: 'defIgnore', percent: 0.55 }, { type: 'doublecast', chance: 0.25 }] },
  },
  {
    id: 'nightmare-plate', name: 'Nightmare Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 7,
    stats: { defBonus: 45, hpBonus: 160, special: [{ type: 'block', chance: 0.23 }, { type: 'regenOnKill', percent: 0.15 }] },
  },
  {
    id: 'dread-wraith', name: 'Dread Wraith', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 7,
    stats: { defBonus: 32, hpBonus: 132, special: [{ type: 'dodge', chance: 0.4 }] },
  },
  {
    id: 'horror-vestment', name: 'Horror Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 7,
    stats: { defBonus: 24, hpBonus: 175, special: [{ type: 'spellAmp', percent: 0.42 }, { type: 'regenOnKill', percent: 0.18 }] },
  },
  // BiS Legendaries
  {
    id: 'apocalypse-blade', name: 'Apocalypse Blade', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 7,
    stats: {
      minDmg: 145, maxDmg: 230,
      special: [{ type: 'lifesteal', value: 0.35 }, { type: 'defIgnore', percent: 0.4 }, { type: 'critThreshold', rollsAt: 16 }],
    },
  },
  {
    id: 'nightmare-fang', name: 'Nightmare Fang', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 7,
    stats: {
      minDmg: 112, maxDmg: 178,
      special: [{ type: 'critThreshold', rollsAt: 8 }, { type: 'attackSpeedBonus', percent: 0.55 }, { type: 'poison', dpsMultiplier: 0.4 }],
    },
  },
  {
    id: 'tome-of-infinite-dread', name: 'Tome of Infinite Dread', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 7,
    stats: {
      minDmg: 138, maxDmg: 218,
      special: [{ type: 'defIgnore', percent: 0.8 }, { type: 'doublecast', chance: 0.5 }, { type: 'spellAmp', percent: 0.4 }],
    },
  },
  {
    id: 'eternal-fortress', name: 'Eternal Fortress', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 7,
    stats: { defBonus: 85, hpBonus: 300, special: [{ type: 'block', chance: 0.35 }, { type: 'regenOnKill', percent: 0.4 }] },
  },
  {
    id: 'nightmare-wraith', name: 'Nightmare Wraith', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 7,
    stats: { defBonus: 55, hpBonus: 225, special: [{ type: 'dodge', chance: 0.55 }, { type: 'regenOnKill', percent: 0.22 }] },
  },
  {
    id: 'dreamweavers-mantle', name: "Dreamweaver's Mantle", type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 7,
    stats: { defBonus: 40, hpBonus: 265, special: [{ type: 'spellAmp', percent: 0.75 }, { type: 'regenOnKill', percent: 0.4 }] },
  },
]

// ── Zone index mapping ────────────────────────────────────────────────────────

export const ZONE_INDEX: Record<ZoneId, number> = {
  forest: 0, dungeon: 1, volcano: 2, abyss: 3,
  shadowrealm: 4, celestial: 5, void: 6, nightmare: 7,
}

// ── BiS pools per zone ────────────────────────────────────────────────────────

export const ZONE_BIS_IDS: Record<ZoneId, string[]> = {
  forest:      ['void-edge', 'godslayer', 'shadowdancer', 'wraithfang', 'celestial-tome', 'eternum', 'aegis-of-eternity', 'voidweave-shroud', 'archmages-mantle'],
  dungeon:     ['void-edge', 'godslayer', 'shadowdancer', 'wraithfang', 'celestial-tome', 'eternum', 'aegis-of-eternity', 'voidweave-shroud', 'archmages-mantle'],
  volcano:     ['titans-fist', 'phantom-blades', 'abyssal-tome', 'abyssal-plate', 'void-shroud', 'rift-mantle'],
  abyss:       ['titans-fist', 'phantom-blades', 'abyssal-tome', 'abyssal-plate', 'void-shroud', 'rift-mantle'],
  shadowrealm: ['shade-reaper', 'twilight-fang', 'grimoire-of-dread', 'shadowplate-fortress', 'dread-stalker-veil', 'shadow-weave-mantle'],
  celestial:   ['sunblade-divine', 'starburst-knives', 'astral-codex', 'celestial-aegis', 'starlight-veil', 'cosmic-mantle'],
  void:        ['null-executioner', 'void-piercer', 'entropy-grimoire', 'nullshield', 'void-wraith-cloak', 'entropy-mantle'],
  nightmare:   ['apocalypse-blade', 'nightmare-fang', 'tome-of-infinite-dread', 'eternal-fortress', 'nightmare-wraith', 'dreamweavers-mantle'],
}

// ── Item enchant pools ────────────────────────────────────────────────────────

export const WEAPON_ENCHANTS: SpecialEffect[] = [
  { type: 'lifesteal', value: 0.08 },
  { type: 'poison', dpsMultiplier: 0.12 },
  { type: 'critThreshold', rollsAt: 18 },
  { type: 'attackSpeedBonus', percent: 0.08 },
  { type: 'defIgnore', percent: 0.12 },
]

export const ARMOR_ENCHANTS: SpecialEffect[] = [
  { type: 'dodge', chance: 0.08 },
  { type: 'block', chance: 0.08 },
  { type: 'regenOnKill', percent: 0.08 },
  { type: 'spellAmp', percent: 0.08 },
]

// ── Shop item pool (id + minimum zone index to appear) ────────────────────────

export const SHOP_ITEMS: { id: string; minZone: number }[] = [
  // ── Forest (zone 0) ──
  { id: 'rusty-sword',        minZone: 0 },
  { id: 'club',               minZone: 0 },
  { id: 'shiv',               minZone: 0 },
  { id: 'hunting-knife',      minZone: 0 },
  { id: 'crooked-staff',      minZone: 0 },
  { id: 'apprentice-wand',    minZone: 0 },
  { id: 'leather-scraps',     minZone: 0 },
  { id: 'worn-tunic',         minZone: 0 },
  // ── Dungeon (zone 1) ──
  { id: 'iron-sword',         minZone: 1 },
  { id: 'war-hammer',         minZone: 1 },
  { id: 'bone-dagger',        minZone: 1 },
  { id: 'twin-daggers',       minZone: 1 },
  { id: 'steel-dagger',       minZone: 1 },
  { id: 'throwing-knives',    minZone: 1 },
  { id: 'ember-rod',          minZone: 1 },
  { id: 'arcane-wand',        minZone: 1 },
  { id: 'battle-staff',       minZone: 1 },
  { id: 'chainmail',          minZone: 1 },
  { id: 'padded-armor',       minZone: 1 },
  { id: 'linen-robe',         minZone: 1 },
  { id: 'iron-shield',        minZone: 1 },
  { id: 'shadow-cloak',       minZone: 1 },
  { id: 'mage-robes',         minZone: 1 },
  // ── Volcano (zone 2) ──
  { id: 'broad-sword',        minZone: 2 },
  { id: 'battle-axe',         minZone: 2 },
  { id: 'executioners-axe',   minZone: 2 },
  { id: 'venomblade',         minZone: 2 },
  { id: 'cursed-blade',       minZone: 2 },
  { id: 'spirit-blade',       minZone: 2 },
  { id: 'shadowstep-blade',   minZone: 2 },
  { id: 'spellbreaker',       minZone: 2 },
  { id: 'crystal-staff',      minZone: 2 },
  { id: 'lightning-rod',      minZone: 2 },
  { id: 'plate-armor',        minZone: 2 },
  { id: 'bone-plate',         minZone: 2 },
  { id: 'assassins-garb',     minZone: 2 },
  { id: 'scale-mail',         minZone: 2 },
  { id: 'arcane-vestment',    minZone: 2 },
  { id: 'cursed-vestments',   minZone: 2 },
  // ── Abyss (zone 3) ──
  { id: 'shadowblade',        minZone: 3 },
  { id: 'storm-cleaver',      minZone: 3 },
  { id: 'berserker-axe',      minZone: 3 },
  { id: 'deathwhisper',       minZone: 3 },
  { id: 'soul-reaper',        minZone: 3 },
  { id: 'wraith-dagger',      minZone: 3 },
  { id: 'voidstaff',          minZone: 3 },
  { id: 'arcane-surge',       minZone: 3 },
  { id: 'dragonscale-mail',   minZone: 3 },
  { id: 'blood-plate',        minZone: 3 },
  { id: 'thornmail',          minZone: 3 },
  { id: 'phantom-shroud',     minZone: 3 },
  { id: 'shadow-veil',        minZone: 3 },
  { id: 'starweave-robe',     minZone: 3 },
  { id: 'arcane-barrier',     minZone: 3 },
  // ── Shadowrealm (zone 4) ──
  { id: 'dread-axe',          minZone: 4 },
  { id: 'shadow-knives',      minZone: 4 },
  { id: 'dusk-staff',         minZone: 4 },
  { id: 'shadow-plate',       minZone: 4 },
  { id: 'dread-shroud',       minZone: 4 },
  { id: 'cursed-mantle',      minZone: 4 },
  // ── Celestial (zone 5) ──
  { id: 'holy-cleaver',       minZone: 5 },
  { id: 'celestial-blades',   minZone: 5 },
  { id: 'star-wand',          minZone: 5 },
  { id: 'astral-plate',       minZone: 5 },
  { id: 'celestial-shroud',   minZone: 5 },
  { id: 'divine-robe',        minZone: 5 },
  // ── Void (zone 6) ──
  { id: 'void-cleaver',       minZone: 6 },
  { id: 'null-daggers',       minZone: 6 },
  { id: 'rift-staff',         minZone: 6 },
  { id: 'void-plate',         minZone: 6 },
  { id: 'null-shroud',        minZone: 6 },
  { id: 'rift-vestment',      minZone: 6 },
  // ── Nightmare (zone 7) ──
  { id: 'horror-blade',       minZone: 7 },
  { id: 'nightmare-blades',   minZone: 7 },
  { id: 'dread-tome',         minZone: 7 },
  { id: 'nightmare-plate',    minZone: 7 },
  { id: 'dread-wraith',       minZone: 7 },
  { id: 'horror-vestment',    minZone: 7 },
  // ── Legendaries (codex/late-game) ──
  { id: 'void-edge',               minZone: 4 },
  { id: 'godslayer',               minZone: 4 },
  { id: 'titans-fist',             minZone: 4 },
  { id: 'shadowdancer',            minZone: 4 },
  { id: 'wraithfang',              minZone: 4 },
  { id: 'phantom-blades',          minZone: 4 },
  { id: 'celestial-tome',          minZone: 4 },
  { id: 'eternum',                 minZone: 4 },
  { id: 'abyssal-tome',            minZone: 4 },
  { id: 'aegis-of-eternity',       minZone: 4 },
  { id: 'voidweave-shroud',        minZone: 4 },
  { id: 'archmages-mantle',        minZone: 4 },
  { id: 'abyssal-plate',           minZone: 4 },
  { id: 'void-shroud',             minZone: 4 },
  { id: 'rift-mantle',             minZone: 4 },
  { id: 'shade-reaper',            minZone: 5 },
  { id: 'twilight-fang',           minZone: 5 },
  { id: 'grimoire-of-dread',       minZone: 5 },
  { id: 'shadowplate-fortress',    minZone: 5 },
  { id: 'dread-stalker-veil',      minZone: 5 },
  { id: 'shadow-weave-mantle',     minZone: 5 },
  { id: 'sunblade-divine',         minZone: 6 },
  { id: 'starburst-knives',        minZone: 6 },
  { id: 'astral-codex',            minZone: 6 },
  { id: 'celestial-aegis',         minZone: 6 },
  { id: 'starlight-veil',          minZone: 6 },
  { id: 'cosmic-mantle',           minZone: 6 },
  { id: 'null-executioner',        minZone: 7 },
  { id: 'void-piercer',            minZone: 7 },
  { id: 'entropy-grimoire',        minZone: 7 },
  { id: 'nullshield',              minZone: 7 },
  { id: 'void-wraith-cloak',       minZone: 7 },
  { id: 'entropy-mantle',          minZone: 7 },
  { id: 'apocalypse-blade',        minZone: 8 },
  { id: 'nightmare-fang',          minZone: 8 },
  { id: 'tome-of-infinite-dread',  minZone: 8 },
  { id: 'eternal-fortress',        minZone: 8 },
  { id: 'nightmare-wraith',        minZone: 8 },
  { id: 'dreamweavers-mantle',     minZone: 8 },
]

