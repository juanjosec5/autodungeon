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

  // ── Priest weapons ────────────────────────────────────────────────────────────
  {
    id: 'holy-staff', name: 'Holy Staff', type: 'weapon', category: 'Staff', rarity: 'common',
    allowedClasses: ['priest'], stats: { minDmg: 2, maxDmg: 5 },
  },
  {
    id: 'sacred-staff', name: 'Sacred Staff', type: 'weapon', category: 'Staff', rarity: 'uncommon',
    allowedClasses: ['priest'], stats: { minDmg: 7, maxDmg: 14 },
  },
  {
    id: 'divine-wand', name: 'Divine Wand', type: 'weapon', category: 'Wand', rarity: 'uncommon',
    allowedClasses: ['priest'], stats: { minDmg: 8, maxDmg: 15, special: [{ type: 'attackSpeedBonus', percent: 0.08 }] },
  },
  {
    id: 'sanctified-staff', name: 'Sanctified Staff', type: 'weapon', category: 'Staff', rarity: 'rare',
    allowedClasses: ['priest'], stats: { minDmg: 11, maxDmg: 18 },
  },
  {
    id: 'blessing-rod', name: 'Blessing Rod', type: 'weapon', category: 'Wand', rarity: 'rare',
    allowedClasses: ['priest'], stats: { minDmg: 12, maxDmg: 20, special: [{ type: 'lifesteal', value: 0.08 }] },
  },
  {
    id: 'holy-relic', name: 'Holy Relic', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], stats: { minDmg: 18, maxDmg: 30, special: [{ type: 'lifesteal', value: 0.12 }, { type: 'critThreshold', rollsAt: 19 }] },
  },
  {
    id: 'radiant-wand', name: 'Radiant Wand', type: 'weapon', category: 'Wand', rarity: 'epic',
    allowedClasses: ['priest'], stats: { minDmg: 16, maxDmg: 27, special: [{ type: 'attackSpeedBonus', percent: 0.15 }, { type: 'lifesteal', value: 0.10 }] },
  },
  {
    id: 'divine-arbiter', name: 'Divine Arbiter', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'],
    stats: { minDmg: 30, maxDmg: 48, special: [{ type: 'lifesteal', value: 0.20 }, { type: 'critThreshold', rollsAt: 18 }, { type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'seraphic-tome', name: 'Seraphic Tome', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['priest'],
    stats: { minDmg: 35, maxDmg: 55, special: [{ type: 'lifesteal', value: 0.25 }, { type: 'attackSpeedBonus', percent: 0.15 }, { type: 'critThreshold', rollsAt: 19 }] },
  },

  // ── Undead weapons ────────────────────────────────────────────────────────────
  {
    id: 'bone-blade', name: 'Bone Blade', type: 'weapon', category: 'Sword', rarity: 'common',
    allowedClasses: ['undead'], stats: { minDmg: 3, maxDmg: 8 },
  },
  {
    id: 'death-blade', name: 'Death Blade', type: 'weapon', category: 'Sword', rarity: 'uncommon',
    allowedClasses: ['undead'], stats: { minDmg: 6, maxDmg: 12 },
  },
  {
    id: 'bone-axe', name: 'Bone Axe', type: 'weapon', category: 'Axe', rarity: 'uncommon',
    allowedClasses: ['undead'], stats: { minDmg: 7, maxDmg: 14, special: [{ type: 'critThreshold', rollsAt: 17 }] },
  },
  {
    id: 'cursed-scythe', name: 'Cursed Scythe', type: 'weapon', category: 'Scythe', rarity: 'rare',
    allowedClasses: ['undead'], stats: { minDmg: 10, maxDmg: 18, special: [{ type: 'lifesteal', value: 0.08 }] },
  },
  {
    id: 'necrotic-blade', name: 'Necrotic Blade', type: 'weapon', category: 'Sword', rarity: 'rare',
    allowedClasses: ['undead'], stats: { minDmg: 11, maxDmg: 19, special: [{ type: 'critThreshold', rollsAt: 17 }, { type: 'attackSpeedBonus', percent: 0.08 }] },
  },
  {
    id: 'soul-drain-axe', name: 'Soul Drain Axe', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['undead'], stats: { minDmg: 18, maxDmg: 30, special: [{ type: 'lifesteal', value: 0.15 }, { type: 'critThreshold', rollsAt: 17 }] },
  },
  {
    id: 'reaper-scythe', name: 'Reaper Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], stats: { minDmg: 16, maxDmg: 26, special: [{ type: 'lifesteal', value: 0.12 }, { type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'banshee-blade', name: 'Banshee Blade', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['undead'],
    stats: { minDmg: 32, maxDmg: 52, special: [{ type: 'lifesteal', value: 0.25 }, { type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.10 }] },
  },
  {
    id: 'soul-harvester-scythe', name: "Soul Harvester's Scythe", type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'],
    stats: { minDmg: 28, maxDmg: 45, special: [{ type: 'lifesteal', value: 0.30 }, { type: 'critThreshold', rollsAt: 16 }, { type: 'attackSpeedBonus', percent: 0.15 }] },
  },

  // ── Dragonkin weapons ─────────────────────────────────────────────────────────
  {
    id: 'dragon-claw', name: 'Dragon Claw', type: 'weapon', category: 'Gauntlet', rarity: 'common',
    allowedClasses: ['dragonkin'], stats: { minDmg: 2, maxDmg: 7 },
  },
  {
    id: 'iron-claw', name: 'Iron Claw', type: 'weapon', category: 'Gauntlet', rarity: 'uncommon',
    allowedClasses: ['dragonkin'], stats: { minDmg: 6, maxDmg: 13 },
  },
  {
    id: 'scale-axe', name: 'Scale Axe', type: 'weapon', category: 'Axe', rarity: 'uncommon',
    allowedClasses: ['dragonkin'], stats: { minDmg: 7, maxDmg: 15 },
  },
  {
    id: 'dragonfire-axe', name: 'Dragonfire Axe', type: 'weapon', category: 'Axe', rarity: 'rare',
    allowedClasses: ['dragonkin'], stats: { minDmg: 11, maxDmg: 19, special: [{ type: 'defIgnore', percent: 0.10 }] },
  },
  {
    id: 'ember-claw', name: 'Ember Claw', type: 'weapon', category: 'Gauntlet', rarity: 'rare',
    allowedClasses: ['dragonkin'], stats: { minDmg: 10, maxDmg: 18, special: [{ type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'volcanic-gauntlet', name: 'Volcanic Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], stats: { minDmg: 18, maxDmg: 30, special: [{ type: 'defIgnore', percent: 0.15 }, { type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'warlord-axe', name: 'Warlord Axe', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['dragonkin'], stats: { minDmg: 20, maxDmg: 34, special: [{ type: 'lifesteal', value: 0.10 }, { type: 'critThreshold', rollsAt: 18 }] },
  },
  {
    id: 'dragonlord-gauntlet', name: "Dragonlord's Gauntlet", type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'],
    stats: { minDmg: 34, maxDmg: 55, special: [{ type: 'defIgnore', percent: 0.25 }, { type: 'attackSpeedBonus', percent: 0.20 }, { type: 'lifesteal', value: 0.10 }] },
  },
  {
    id: 'titan-axe-of-flames', name: 'Titan Axe of Flames', type: 'weapon', category: 'Axe', rarity: 'legendary',
    allowedClasses: ['dragonkin'],
    stats: { minDmg: 38, maxDmg: 62, special: [{ type: 'lifesteal', value: 0.15 }, { type: 'defIgnore', percent: 0.20 }, { type: 'critThreshold', rollsAt: 18 }] },
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

  // ── Priest armor ──────────────────────────────────────────────────────────────
  {
    id: 'holy-vestments', name: 'Holy Vestments', type: 'armor', category: 'Robes', rarity: 'uncommon',
    allowedClasses: ['priest'], stats: { defBonus: 2, hpBonus: 18 },
  },
  {
    id: 'blessed-robes', name: 'Blessed Robes', type: 'armor', category: 'Robes', rarity: 'rare',
    allowedClasses: ['priest'], stats: { defBonus: 4, hpBonus: 28, special: [{ type: 'regenOnKill', percent: 0.10 }] },
  },
  {
    id: 'divine-shroud', name: 'Divine Shroud', type: 'armor', category: 'Cloak', rarity: 'rare',
    allowedClasses: ['priest'], stats: { defBonus: 3, hpBonus: 22 },
  },
  {
    id: 'sacred-vestments', name: 'Sacred Vestments', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], stats: { defBonus: 7, hpBonus: 50, special: [{ type: 'regenOnKill', percent: 0.15 }] },
  },
  {
    id: 'holy-guardian-robe', name: 'Holy Guardian Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], stats: { defBonus: 8, hpBonus: 55, special: [{ type: 'regenOnKill', percent: 0.12 }, { type: 'block', chance: 0.08 }] },
  },
  {
    id: 'divine-covenant', name: 'Divine Covenant', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], stats: { defBonus: 12, hpBonus: 85, special: [{ type: 'regenOnKill', percent: 0.30 }] },
  },
  {
    id: 'seraph-mantle', name: 'Seraph Mantle', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['priest'], stats: { defBonus: 10, hpBonus: 90, special: [{ type: 'regenOnKill', percent: 0.25 }, { type: 'block', chance: 0.10 }] },
  },

  // ── Undead armor ──────────────────────────────────────────────────────────────
  {
    id: 'bone-shroud', name: 'Bone Shroud', type: 'armor', category: 'Cloak', rarity: 'uncommon',
    allowedClasses: ['undead'], stats: { defBonus: 3, hpBonus: 12 },
  },
  {
    id: 'death-plate', name: 'Death Plate', type: 'armor', category: 'Plate Armor', rarity: 'rare',
    allowedClasses: ['undead'], stats: { defBonus: 8, hpBonus: 25 },
  },
  {
    id: 'necromancer-vestments', name: 'Necromancer Vestments', type: 'armor', category: 'Robes', rarity: 'rare',
    allowedClasses: ['undead'], stats: { defBonus: 4, hpBonus: 20, special: [{ type: 'block', chance: 0.06 }] },
  },
  {
    id: 'undying-plate', name: 'Undying Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], stats: { defBonus: 14, hpBonus: 45, special: [{ type: 'block', chance: 0.10 }] },
  },
  {
    id: 'wraith-shroud', name: 'Wraith Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['undead'], stats: { defBonus: 9, hpBonus: 35, special: [{ type: 'dodge', chance: 0.15 }] },
  },
  {
    id: 'immortal-plate', name: 'Immortal Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], stats: { defBonus: 22, hpBonus: 75, special: [{ type: 'block', chance: 0.15 }] },
  },
  {
    id: 'deathlord-vestments', name: 'Deathlord Vestments', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['undead'], stats: { defBonus: 12, hpBonus: 65, special: [{ type: 'block', chance: 0.12 }, { type: 'dodge', chance: 0.10 }] },
  },

  // ── Dragonkin armor ───────────────────────────────────────────────────────────
  {
    id: 'dragonhide-vest', name: 'Dragonhide Vest', type: 'armor', category: 'Chain Armor', rarity: 'uncommon',
    allowedClasses: ['dragonkin'], stats: { defBonus: 5, hpBonus: 14 },
  },
  {
    id: 'iron-scales', name: 'Iron Scales', type: 'armor', category: 'Chain Armor', rarity: 'rare',
    allowedClasses: ['dragonkin'], stats: { defBonus: 8, hpBonus: 26 },
  },
  {
    id: 'dragon-plate', name: 'Dragon Plate', type: 'armor', category: 'Plate Armor', rarity: 'rare',
    allowedClasses: ['dragonkin'], stats: { defBonus: 9, hpBonus: 22, special: [{ type: 'block', chance: 0.07 }] },
  },
  {
    id: 'dragonscale-fortress', name: 'Dragonscale Fortress', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], stats: { defBonus: 15, hpBonus: 58, special: [{ type: 'block', chance: 0.14 }, { type: 'regenOnKill', percent: 0.08 }] },
  },
  {
    id: 'volcanic-plate', name: 'Volcanic Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], stats: { defBonus: 13, hpBonus: 52, special: [{ type: 'block', chance: 0.12 }] },
  },
  {
    id: 'dragonlord-aegis', name: "Dragonlord's Aegis", type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], stats: { defBonus: 28, hpBonus: 105, special: [{ type: 'block', chance: 0.20 }, { type: 'regenOnKill', percent: 0.20 }] },
  },
  {
    id: 'ancient-dragon-plate', name: 'Ancient Dragon Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], stats: { defBonus: 24, hpBonus: 90, special: [{ type: 'block', chance: 0.18 }, { type: 'regenOnKill', percent: 0.15 }] },
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // ── Abyss zone items (dropFromZoneIdx: 3) ─────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════════

  // Epics — one weapon per class
  {
    id: 'abyssal-sword', name: 'Abyssal Sword', type: 'weapon', category: 'Sword', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 3,
    stats: { minDmg: 30, maxDmg: 48, special: [{ type: 'defIgnore', percent: 0.20 }, { type: 'lifesteal', value: 0.08 }] },
  },
  {
    id: 'shadow-pierce', name: 'Shadow Pierce', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 3,
    stats: { minDmg: 25, maxDmg: 40, special: [{ type: 'critThreshold', rollsAt: 16 }, { type: 'attackSpeedBonus', percent: 0.15 }] },
  },
  {
    id: 'void-wand', name: 'Void Wand', type: 'weapon', category: 'Wand', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 3,
    stats: { minDmg: 28, maxDmg: 46, special: [{ type: 'defIgnore', percent: 0.35 }, { type: 'spellAmp', percent: 0.10 }] },
  },
  {
    id: 'soul-staff', name: 'Soul Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 3,
    stats: { minDmg: 26, maxDmg: 42, special: [{ type: 'lifesteal', value: 0.10 }, { type: 'attackSpeedBonus', percent: 0.10 }] },
  },
  {
    id: 'abyssal-scythe', name: 'Abyssal Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 3,
    stats: { minDmg: 28, maxDmg: 46, special: [{ type: 'lifesteal', value: 0.13 }, { type: 'critThreshold', rollsAt: 17 }] },
  },
  {
    id: 'void-gauntlet', name: 'Void Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 3,
    stats: { minDmg: 30, maxDmg: 50, special: [{ type: 'defIgnore', percent: 0.12 }, { type: 'attackSpeedBonus', percent: 0.10 }] },
  },
  // Epics — armor per class
  {
    id: 'abyss-plate', name: 'Abyss Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], dropFromZoneIdx: 3,
    stats: { defBonus: 16, hpBonus: 60, special: [{ type: 'block', chance: 0.12 }, { type: 'regenOnKill', percent: 0.08 }] },
  },
  {
    id: 'void-veil', name: 'Void Veil', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], dropFromZoneIdx: 3,
    stats: { defBonus: 12, hpBonus: 50, special: [{ type: 'dodge', chance: 0.22 }] },
  },
  {
    id: 'abyssal-robe', name: 'Abyssal Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], dropFromZoneIdx: 3,
    stats: { defBonus: 8, hpBonus: 58, special: [{ type: 'spellAmp', percent: 0.18 }, { type: 'regenOnKill', percent: 0.07 }] },
  },
  {
    id: 'abyss-sacred-robe', name: 'Abyss Sacred Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 3,
    stats: { defBonus: 8, hpBonus: 65, special: [{ type: 'regenOnKill', percent: 0.12 }] },
  },
  {
    id: 'undead-carapace', name: 'Undead Carapace', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 3,
    stats: { defBonus: 14, hpBonus: 50, special: [{ type: 'block', chance: 0.10 }] },
  },
  {
    id: 'dragonbone-plate', name: 'Dragonbone Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 3,
    stats: { defBonus: 17, hpBonus: 65, special: [{ type: 'block', chance: 0.13 }, { type: 'regenOnKill', percent: 0.07 }] },
  },
  // BiS Legendaries — one weapon per class
  {
    id: 'abyss-warlord', name: 'Abyss Warlord', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 3,
    stats: { minDmg: 45, maxDmg: 72, special: [{ type: 'lifesteal', value: 0.18 }, { type: 'defIgnore', percent: 0.22 }, { type: 'critThreshold', rollsAt: 18 }] },
  },
  {
    id: 'void-dancer', name: 'Void Dancer', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 3,
    stats: { minDmg: 38, maxDmg: 60, special: [{ type: 'critThreshold', rollsAt: 13 }, { type: 'attackSpeedBonus', percent: 0.35 }, { type: 'poison', dpsMultiplier: 0.22 }] },
  },
  {
    id: 'void-grimoire', name: 'Void Grimoire', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 3,
    stats: { minDmg: 40, maxDmg: 65, special: [{ type: 'defIgnore', percent: 0.55 }, { type: 'doublecast', chance: 0.25 }, { type: 'spellAmp', percent: 0.18 }] },
  },
  {
    id: 'divine-word', name: 'Divine Word', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 3,
    stats: { minDmg: 36, maxDmg: 58, special: [{ type: 'lifesteal', value: 0.20 }, { type: 'critThreshold', rollsAt: 18 }, { type: 'attackSpeedBonus', percent: 0.10 }] },
  },
  {
    id: 'soul-drinker', name: 'Soul Drinker', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 3,
    stats: { minDmg: 40, maxDmg: 65, special: [{ type: 'lifesteal', value: 0.28 }, { type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'iron-dragon-gauntlet', name: 'Iron Dragon Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 3,
    stats: { minDmg: 42, maxDmg: 68, special: [{ type: 'defIgnore', percent: 0.20 }, { type: 'attackSpeedBonus', percent: 0.18 }, { type: 'lifesteal', value: 0.10 }] },
  },
  // BiS Legendaries — armor per class
  {
    id: 'abyss-guardian-plate', name: 'Abyss Guardian Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], dropFromZoneIdx: 3,
    stats: { defBonus: 24, hpBonus: 88, special: [{ type: 'block', chance: 0.18 }, { type: 'regenOnKill', percent: 0.22 }] },
  },
  {
    id: 'abyssal-mantle', name: 'Abyssal Mantle', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], dropFromZoneIdx: 3,
    stats: { defBonus: 16, hpBonus: 65, special: [{ type: 'dodge', chance: 0.35 }, { type: 'regenOnKill', percent: 0.10 }] },
  },
  {
    id: 'void-archmage-robe', name: 'Void Archmage Robe', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], dropFromZoneIdx: 3,
    stats: { defBonus: 11, hpBonus: 78, special: [{ type: 'spellAmp', percent: 0.38 }, { type: 'regenOnKill', percent: 0.22 }] },
  },
  {
    id: 'priest-abyss-vestment', name: "High Priest's Vestment", type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 3,
    stats: { defBonus: 10, hpBonus: 85, special: [{ type: 'regenOnKill', percent: 0.28 }] },
  },
  {
    id: 'bonelord-plate', name: 'Bonelord Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 3,
    stats: { defBonus: 22, hpBonus: 75, special: [{ type: 'block', chance: 0.15 }, { type: 'dodge', chance: 0.08 }] },
  },
  {
    id: 'dragonlord-plate', name: "Dragonlord's Plate", type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 3,
    stats: { defBonus: 28, hpBonus: 98, special: [{ type: 'block', chance: 0.22 }, { type: 'regenOnKill', percent: 0.18 }] },
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
  // Priest / Undead / Dragonkin — zone 4
  {
    id: 'shadow-tome', name: 'Shadow Tome', type: 'weapon', category: 'Tome', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 4,
    stats: { minDmg: 38, maxDmg: 62, special: [{ type: 'lifesteal', value: 0.12 }, { type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'shadow-scythe', name: 'Shadow Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 4,
    stats: { minDmg: 42, maxDmg: 68, special: [{ type: 'lifesteal', value: 0.15 }, { type: 'critThreshold', rollsAt: 17 }] },
  },
  {
    id: 'shadow-talon', name: 'Shadow Talon', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 4,
    stats: { minDmg: 44, maxDmg: 72, special: [{ type: 'defIgnore', percent: 0.18 }, { type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'shadow-vestment', name: 'Shadow Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 4,
    stats: { defBonus: 9, hpBonus: 72, special: [{ type: 'regenOnKill', percent: 0.10 }] },
  },
  {
    id: 'shadow-carapace', name: 'Shadow Carapace', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 4,
    stats: { defBonus: 16, hpBonus: 62, special: [{ type: 'block', chance: 0.12 }] },
  },
  {
    id: 'shadow-dragonplate', name: 'Shadow Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 4,
    stats: { defBonus: 22, hpBonus: 80, special: [{ type: 'block', chance: 0.15 }, { type: 'regenOnKill', percent: 0.08 }] },
  },
  {
    id: 'dread-sermon', name: 'Dread Sermon', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 4,
    stats: { minDmg: 58, maxDmg: 92, special: [{ type: 'lifesteal', value: 0.22 }, { type: 'critThreshold', rollsAt: 18 }, { type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'dread-reaper', name: 'Dread Reaper', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 4,
    stats: { minDmg: 62, maxDmg: 98, special: [{ type: 'lifesteal', value: 0.28 }, { type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.12 }] },
  },
  {
    id: 'dread-gauntlet', name: 'Dread Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 4,
    stats: { minDmg: 68, maxDmg: 110, special: [{ type: 'defIgnore', percent: 0.28 }, { type: 'attackSpeedBonus', percent: 0.20 }, { type: 'lifesteal', value: 0.10 }] },
  },
  {
    id: 'dread-cassock', name: 'Dread Cassock', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 4,
    stats: { defBonus: 14, hpBonus: 105, special: [{ type: 'regenOnKill', percent: 0.28 }] },
  },
  {
    id: 'dread-boneguard', name: 'Dread Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 4,
    stats: { defBonus: 26, hpBonus: 88, special: [{ type: 'block', chance: 0.18 }, { type: 'dodge', chance: 0.08 }] },
  },
  {
    id: 'dread-dragonarmor', name: "Dread Dragon Armor", type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 4,
    stats: { defBonus: 36, hpBonus: 118, special: [{ type: 'block', chance: 0.22 }, { type: 'regenOnKill', percent: 0.22 }] },
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
  // Priest / Undead / Dragonkin — zone 5
  {
    id: 'celestial-staff', name: 'Celestial Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 5,
    stats: { minDmg: 50, maxDmg: 80, special: [{ type: 'lifesteal', value: 0.14 }, { type: 'attackSpeedBonus', percent: 0.15 }, { type: 'critThreshold', rollsAt: 18 }] },
  },
  {
    id: 'celestial-scythe', name: 'Celestial Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 5,
    stats: { minDmg: 55, maxDmg: 88, special: [{ type: 'lifesteal', value: 0.18 }, { type: 'critThreshold', rollsAt: 16 }] },
  },
  {
    id: 'celestial-gauntlet', name: 'Celestial Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 5,
    stats: { minDmg: 58, maxDmg: 92, special: [{ type: 'defIgnore', percent: 0.22 }, { type: 'attackSpeedBonus', percent: 0.15 }] },
  },
  {
    id: 'celestial-vestment', name: 'Celestial Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 5,
    stats: { defBonus: 11, hpBonus: 90, special: [{ type: 'regenOnKill', percent: 0.12 }] },
  },
  {
    id: 'celestial-boneguard', name: 'Celestial Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 5,
    stats: { defBonus: 20, hpBonus: 80, special: [{ type: 'block', chance: 0.14 }] },
  },
  {
    id: 'celestial-dragonplate', name: 'Celestial Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 5,
    stats: { defBonus: 28, hpBonus: 104, special: [{ type: 'block', chance: 0.18 }, { type: 'regenOnKill', percent: 0.10 }] },
  },
  {
    id: 'seraph-staff', name: 'Seraph Staff', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 5,
    stats: { minDmg: 75, maxDmg: 120, special: [{ type: 'lifesteal', value: 0.25 }, { type: 'critThreshold', rollsAt: 17 }, { type: 'attackSpeedBonus', percent: 0.15 }] },
  },
  {
    id: 'death-celestial-blade', name: 'Celestial Death Blade', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 5,
    stats: { minDmg: 80, maxDmg: 128, special: [{ type: 'lifesteal', value: 0.32 }, { type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.15 }] },
  },
  {
    id: 'dragon-celestial-gauntlet', name: 'Dragon Celestial Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 5,
    stats: { minDmg: 88, maxDmg: 140, special: [{ type: 'defIgnore', percent: 0.32 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'lifesteal', value: 0.12 }] },
  },
  {
    id: 'seraph-vestment', name: 'Seraph Vestment', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 5,
    stats: { defBonus: 18, hpBonus: 135, special: [{ type: 'regenOnKill', percent: 0.32 }] },
  },
  {
    id: 'celestial-deathlord-armor', name: 'Celestial Deathlord Armor', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 5,
    stats: { defBonus: 33, hpBonus: 112, special: [{ type: 'block', chance: 0.22 }, { type: 'dodge', chance: 0.10 }] },
  },
  {
    id: 'dragon-celestial-plate', name: 'Dragon Celestial Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 5,
    stats: { defBonus: 46, hpBonus: 152, special: [{ type: 'block', chance: 0.25 }, { type: 'regenOnKill', percent: 0.28 }] },
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
  // Priest / Undead / Dragonkin — zone 6
  {
    id: 'void-sermon-staff', name: 'Void Sermon Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 6,
    stats: { minDmg: 65, maxDmg: 104, special: [{ type: 'lifesteal', value: 0.16 }, { type: 'attackSpeedBonus', percent: 0.18 }, { type: 'critThreshold', rollsAt: 17 }] },
  },
  {
    id: 'void-scythe', name: 'Void Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 6,
    stats: { minDmg: 72, maxDmg: 115, special: [{ type: 'lifesteal', value: 0.20 }, { type: 'critThreshold', rollsAt: 15 }] },
  },
  {
    id: 'void-talon', name: 'Void Talon', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 6,
    stats: { minDmg: 75, maxDmg: 120, special: [{ type: 'defIgnore', percent: 0.28 }, { type: 'attackSpeedBonus', percent: 0.18 }] },
  },
  {
    id: 'void-vestment', name: 'Void Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 6,
    stats: { defBonus: 14, hpBonus: 115, special: [{ type: 'regenOnKill', percent: 0.15 }] },
  },
  {
    id: 'void-boneguard', name: 'Void Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 6,
    stats: { defBonus: 26, hpBonus: 105, special: [{ type: 'block', chance: 0.17 }] },
  },
  {
    id: 'void-dragonplate', name: 'Void Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 6,
    stats: { defBonus: 37, hpBonus: 136, special: [{ type: 'block', chance: 0.22 }, { type: 'regenOnKill', percent: 0.12 }] },
  },
  {
    id: 'eternity-staff', name: 'Eternity Staff', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 6,
    stats: { minDmg: 100, maxDmg: 160, special: [{ type: 'lifesteal', value: 0.30 }, { type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.18 }] },
  },
  {
    id: 'eternal-scythe', name: 'Eternal Scythe', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 6,
    stats: { minDmg: 105, maxDmg: 165, special: [{ type: 'lifesteal', value: 0.38 }, { type: 'critThreshold', rollsAt: 12 }, { type: 'attackSpeedBonus', percent: 0.18 }] },
  },
  {
    id: 'eternal-talon', name: 'Eternal Talon', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 6,
    stats: { minDmg: 115, maxDmg: 183, special: [{ type: 'defIgnore', percent: 0.38 }, { type: 'attackSpeedBonus', percent: 0.30 }, { type: 'lifesteal', value: 0.15 }] },
  },
  {
    id: 'eternity-vestment', name: 'Eternity Vestment', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 6,
    stats: { defBonus: 22, hpBonus: 175, special: [{ type: 'regenOnKill', percent: 0.38 }] },
  },
  {
    id: 'eternal-boneguard', name: 'Eternal Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 6,
    stats: { defBonus: 44, hpBonus: 150, special: [{ type: 'block', chance: 0.26 }, { type: 'dodge', chance: 0.12 }] },
  },
  {
    id: 'eternal-dragonplate', name: 'Eternal Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 6,
    stats: { defBonus: 60, hpBonus: 198, special: [{ type: 'block', chance: 0.28 }, { type: 'regenOnKill', percent: 0.35 }] },
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
  // Priest / Undead / Dragonkin — zone 7
  {
    id: 'nightmare-staff', name: 'Nightmare Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 7,
    stats: { minDmg: 85, maxDmg: 135, special: [{ type: 'lifesteal', value: 0.18 }, { type: 'attackSpeedBonus', percent: 0.22 }, { type: 'critThreshold', rollsAt: 16 }] },
  },
  {
    id: 'nightmare-scythe', name: 'Nightmare Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 7,
    stats: { minDmg: 94, maxDmg: 150, special: [{ type: 'lifesteal', value: 0.22 }, { type: 'critThreshold', rollsAt: 14 }] },
  },
  {
    id: 'nightmare-talon', name: 'Nightmare Talon', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 7,
    stats: { minDmg: 98, maxDmg: 156, special: [{ type: 'defIgnore', percent: 0.32 }, { type: 'attackSpeedBonus', percent: 0.22 }] },
  },
  {
    id: 'nightmare-vestment', name: 'Nightmare Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], dropFromZoneIdx: 7,
    stats: { defBonus: 18, hpBonus: 148, special: [{ type: 'regenOnKill', percent: 0.18 }] },
  },
  {
    id: 'nightmare-boneguard', name: 'Nightmare Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], dropFromZoneIdx: 7,
    stats: { defBonus: 34, hpBonus: 136, special: [{ type: 'block', chance: 0.20 }] },
  },
  {
    id: 'nightmare-dragonplate', name: 'Nightmare Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 7,
    stats: { defBonus: 48, hpBonus: 178, special: [{ type: 'block', chance: 0.25 }, { type: 'regenOnKill', percent: 0.15 }] },
  },
  {
    id: 'abyssal-decree', name: 'Abyssal Decree', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 7,
    stats: { minDmg: 132, maxDmg: 208, special: [{ type: 'lifesteal', value: 0.35 }, { type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.22 }] },
  },
  {
    id: 'apocalyptic-scythe', name: 'Apocalyptic Scythe', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 7,
    stats: { minDmg: 138, maxDmg: 218, special: [{ type: 'lifesteal', value: 0.42 }, { type: 'critThreshold', rollsAt: 10 }, { type: 'attackSpeedBonus', percent: 0.22 }] },
  },
  {
    id: 'apocalyptic-talon', name: 'Apocalyptic Talon', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 7,
    stats: { minDmg: 150, maxDmg: 238, special: [{ type: 'defIgnore', percent: 0.45 }, { type: 'attackSpeedBonus', percent: 0.35 }, { type: 'lifesteal', value: 0.18 }] },
  },
  {
    id: 'apocalypse-vestment', name: 'Apocalypse Vestment', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], dropFromZoneIdx: 7,
    stats: { defBonus: 30, hpBonus: 232, special: [{ type: 'regenOnKill', percent: 0.42 }] },
  },
  {
    id: 'apocalyptic-boneguard', name: 'Apocalyptic Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], dropFromZoneIdx: 7,
    stats: { defBonus: 58, hpBonus: 200, special: [{ type: 'block', chance: 0.30 }, { type: 'dodge', chance: 0.14 }] },
  },
  {
    id: 'apocalyptic-dragonplate', name: 'Apocalyptic Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], dropFromZoneIdx: 7,
    stats: { defBonus: 78, hpBonus: 260, special: [{ type: 'block', chance: 0.32 }, { type: 'regenOnKill', percent: 0.40 }] },
  },
]

// ── Zone index mapping ────────────────────────────────────────────────────────

export const ZONE_INDEX: Record<ZoneId, number> = {
  forest: 0, dungeon: 1, volcano: 2, abyss: 3,
  shadowrealm: 4, celestial: 5, void: 6, nightmare: 7,
}

// ── BiS pools per zone ────────────────────────────────────────────────────────

export const ZONE_BIS_IDS: Record<ZoneId, string[]> = {
  forest:      ['void-edge', 'godslayer', 'titans-fist', 'shadowdancer', 'wraithfang', 'phantom-blades', 'celestial-tome', 'eternum', 'seraphic-tome', 'divine-arbiter', 'soul-harvester-scythe', 'banshee-blade', 'dragonlord-gauntlet', 'titan-axe-of-flames', 'aegis-of-eternity', 'voidweave-shroud', 'archmages-mantle'],
  dungeon:     ['void-edge', 'godslayer', 'titans-fist', 'shadowdancer', 'wraithfang', 'phantom-blades', 'celestial-tome', 'eternum', 'seraphic-tome', 'divine-arbiter', 'soul-harvester-scythe', 'banshee-blade', 'dragonlord-gauntlet', 'titan-axe-of-flames', 'aegis-of-eternity', 'voidweave-shroud', 'archmages-mantle'],
  volcano:     ['titans-fist', 'phantom-blades', 'abyssal-tome', 'abyssal-plate', 'void-shroud', 'rift-mantle'],
  abyss:       ['abyss-warlord', 'void-dancer', 'void-grimoire', 'divine-word', 'soul-drinker', 'iron-dragon-gauntlet', 'abyss-guardian-plate', 'abyssal-mantle', 'void-archmage-robe', 'priest-abyss-vestment', 'bonelord-plate', 'dragonlord-plate'],
  shadowrealm: ['shade-reaper', 'twilight-fang', 'grimoire-of-dread', 'dread-sermon', 'dread-reaper', 'dread-gauntlet', 'shadowplate-fortress', 'dread-stalker-veil', 'shadow-weave-mantle', 'dread-cassock', 'dread-boneguard', 'dread-dragonarmor'],
  celestial:   ['sunblade-divine', 'starburst-knives', 'astral-codex', 'seraph-staff', 'death-celestial-blade', 'dragon-celestial-gauntlet', 'celestial-aegis', 'starlight-veil', 'cosmic-mantle', 'seraph-vestment', 'celestial-deathlord-armor', 'dragon-celestial-plate'],
  void:        ['null-executioner', 'void-piercer', 'entropy-grimoire', 'eternity-staff', 'eternal-scythe', 'eternal-talon', 'nullshield', 'void-wraith-cloak', 'entropy-mantle', 'eternity-vestment', 'eternal-boneguard', 'eternal-dragonplate'],
  nightmare:   ['apocalypse-blade', 'nightmare-fang', 'tome-of-infinite-dread', 'abyssal-decree', 'apocalyptic-scythe', 'apocalyptic-talon', 'eternal-fortress', 'nightmare-wraith', 'dreamweavers-mantle', 'apocalypse-vestment', 'apocalyptic-boneguard', 'apocalyptic-dragonplate'],
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
  { id: 'sacred-staff',       minZone: 1 },
  { id: 'divine-wand',        minZone: 1 },
  { id: 'death-blade',        minZone: 1 },
  { id: 'bone-axe',           minZone: 1 },
  { id: 'iron-claw',          minZone: 1 },
  { id: 'scale-axe',          minZone: 1 },
  { id: 'chainmail',          minZone: 1 },
  { id: 'padded-armor',       minZone: 1 },
  { id: 'linen-robe',         minZone: 1 },
  { id: 'iron-shield',        minZone: 1 },
  { id: 'shadow-cloak',       minZone: 1 },
  { id: 'mage-robes',         minZone: 1 },
  { id: 'holy-vestments',     minZone: 1 },
  { id: 'bone-shroud',        minZone: 1 },
  { id: 'dragonhide-vest',    minZone: 1 },
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
  { id: 'sanctified-staff',   minZone: 2 },
  { id: 'blessing-rod',       minZone: 2 },
  { id: 'cursed-scythe',      minZone: 2 },
  { id: 'necrotic-blade',     minZone: 2 },
  { id: 'dragonfire-axe',     minZone: 2 },
  { id: 'ember-claw',         minZone: 2 },
  { id: 'plate-armor',        minZone: 2 },
  { id: 'bone-plate',         minZone: 2 },
  { id: 'assassins-garb',     minZone: 2 },
  { id: 'scale-mail',         minZone: 2 },
  { id: 'arcane-vestment',    minZone: 2 },
  { id: 'cursed-vestments',   minZone: 2 },
  { id: 'blessed-robes',      minZone: 2 },
  { id: 'divine-shroud',      minZone: 2 },
  { id: 'death-plate',        minZone: 2 },
  { id: 'necromancer-vestments', minZone: 2 },
  { id: 'iron-scales',        minZone: 2 },
  { id: 'dragon-plate',       minZone: 2 },
  // ── Abyss (zone 3) ──
  { id: 'shadowblade',        minZone: 3 },
  { id: 'storm-cleaver',      minZone: 3 },
  { id: 'berserker-axe',      minZone: 3 },
  { id: 'deathwhisper',       minZone: 3 },
  { id: 'soul-reaper',        minZone: 3 },
  { id: 'wraith-dagger',      minZone: 3 },
  { id: 'voidstaff',          minZone: 3 },
  { id: 'arcane-surge',       minZone: 3 },
  { id: 'holy-relic',         minZone: 3 },
  { id: 'radiant-wand',       minZone: 3 },
  { id: 'soul-drain-axe',     minZone: 3 },
  { id: 'reaper-scythe',      minZone: 3 },
  { id: 'volcanic-gauntlet',  minZone: 3 },
  { id: 'warlord-axe',        minZone: 3 },
  { id: 'dragonscale-mail',   minZone: 3 },
  { id: 'blood-plate',        minZone: 3 },
  { id: 'thornmail',          minZone: 3 },
  { id: 'phantom-shroud',     minZone: 3 },
  { id: 'shadow-veil',        minZone: 3 },
  { id: 'starweave-robe',     minZone: 3 },
  { id: 'arcane-barrier',     minZone: 3 },
  { id: 'sacred-vestments',   minZone: 3 },
  { id: 'holy-guardian-robe', minZone: 3 },
  { id: 'undying-plate',      minZone: 3 },
  { id: 'wraith-shroud',      minZone: 3 },
  { id: 'dragonscale-fortress', minZone: 3 },
  { id: 'volcanic-plate',     minZone: 3 },
  // ── Shadowrealm (zone 4) ──
  { id: 'dread-axe',          minZone: 4 },
  { id: 'shadow-knives',      minZone: 4 },
  { id: 'dusk-staff',         minZone: 4 },
  { id: 'shadow-tome',        minZone: 4 },
  { id: 'shadow-scythe',      minZone: 4 },
  { id: 'shadow-talon',       minZone: 4 },
  { id: 'shadow-plate',       minZone: 4 },
  { id: 'dread-shroud',       minZone: 4 },
  { id: 'cursed-mantle',      minZone: 4 },
  { id: 'shadow-vestment',    minZone: 4 },
  { id: 'shadow-carapace',    minZone: 4 },
  { id: 'shadow-dragonplate', minZone: 4 },
  // ── Celestial (zone 5) ──
  { id: 'holy-cleaver',       minZone: 5 },
  { id: 'celestial-blades',   minZone: 5 },
  { id: 'star-wand',          minZone: 5 },
  { id: 'celestial-staff',    minZone: 5 },
  { id: 'celestial-scythe',   minZone: 5 },
  { id: 'celestial-gauntlet', minZone: 5 },
  { id: 'astral-plate',       minZone: 5 },
  { id: 'celestial-shroud',   minZone: 5 },
  { id: 'divine-robe',        minZone: 5 },
  { id: 'celestial-vestment', minZone: 5 },
  { id: 'celestial-boneguard', minZone: 5 },
  { id: 'celestial-dragonplate', minZone: 5 },
  // ── Void (zone 6) ──
  { id: 'void-cleaver',       minZone: 6 },
  { id: 'null-daggers',       minZone: 6 },
  { id: 'rift-staff',         minZone: 6 },
  { id: 'void-sermon-staff',  minZone: 6 },
  { id: 'void-scythe',        minZone: 6 },
  { id: 'void-talon',         minZone: 6 },
  { id: 'void-plate',         minZone: 6 },
  { id: 'null-shroud',        minZone: 6 },
  { id: 'rift-vestment',      minZone: 6 },
  { id: 'void-vestment',      minZone: 6 },
  { id: 'void-boneguard',     minZone: 6 },
  { id: 'void-dragonplate',   minZone: 6 },
  // ── Nightmare (zone 7) ──
  { id: 'horror-blade',       minZone: 7 },
  { id: 'nightmare-blades',   minZone: 7 },
  { id: 'dread-tome',         minZone: 7 },
  { id: 'nightmare-staff',    minZone: 7 },
  { id: 'nightmare-scythe',   minZone: 7 },
  { id: 'nightmare-talon',    minZone: 7 },
  { id: 'nightmare-plate',    minZone: 7 },
  { id: 'dread-wraith',       minZone: 7 },
  { id: 'horror-vestment',    minZone: 7 },
  { id: 'nightmare-vestment', minZone: 7 },
  { id: 'nightmare-boneguard', minZone: 7 },
  { id: 'nightmare-dragonplate', minZone: 7 },
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
  { id: 'divine-arbiter',          minZone: 4 },
  { id: 'seraphic-tome',           minZone: 4 },
  { id: 'banshee-blade',           minZone: 4 },
  { id: 'soul-harvester-scythe',   minZone: 4 },
  { id: 'dragonlord-gauntlet',     minZone: 4 },
  { id: 'titan-axe-of-flames',     minZone: 4 },
  { id: 'aegis-of-eternity',       minZone: 4 },
  { id: 'voidweave-shroud',        minZone: 4 },
  { id: 'archmages-mantle',        minZone: 4 },
  { id: 'abyssal-plate',           minZone: 4 },
  { id: 'void-shroud',             minZone: 4 },
  { id: 'rift-mantle',             minZone: 4 },
  { id: 'divine-covenant',         minZone: 4 },
  { id: 'seraph-mantle',           minZone: 4 },
  { id: 'immortal-plate',          minZone: 4 },
  { id: 'deathlord-vestments',     minZone: 4 },
  { id: 'dragonlord-aegis',        minZone: 4 },
  { id: 'ancient-dragon-plate',    minZone: 4 },
  { id: 'shade-reaper',            minZone: 5 },
  { id: 'twilight-fang',           minZone: 5 },
  { id: 'grimoire-of-dread',       minZone: 5 },
  { id: 'dread-sermon',            minZone: 5 },
  { id: 'dread-reaper',            minZone: 5 },
  { id: 'dread-gauntlet',          minZone: 5 },
  { id: 'shadowplate-fortress',    minZone: 5 },
  { id: 'dread-stalker-veil',      minZone: 5 },
  { id: 'shadow-weave-mantle',     minZone: 5 },
  { id: 'dread-cassock',           minZone: 5 },
  { id: 'dread-boneguard',         minZone: 5 },
  { id: 'dread-dragonarmor',       minZone: 5 },
  { id: 'sunblade-divine',         minZone: 6 },
  { id: 'starburst-knives',        minZone: 6 },
  { id: 'astral-codex',            minZone: 6 },
  { id: 'seraph-staff',            minZone: 6 },
  { id: 'death-celestial-blade',   minZone: 6 },
  { id: 'dragon-celestial-gauntlet', minZone: 6 },
  { id: 'celestial-aegis',         minZone: 6 },
  { id: 'starlight-veil',          minZone: 6 },
  { id: 'cosmic-mantle',           minZone: 6 },
  { id: 'seraph-vestment',         minZone: 6 },
  { id: 'celestial-deathlord-armor', minZone: 6 },
  { id: 'dragon-celestial-plate',  minZone: 6 },
  { id: 'null-executioner',        minZone: 7 },
  { id: 'void-piercer',            minZone: 7 },
  { id: 'entropy-grimoire',        minZone: 7 },
  { id: 'eternity-staff',          minZone: 7 },
  { id: 'eternal-scythe',          minZone: 7 },
  { id: 'eternal-talon',           minZone: 7 },
  { id: 'nullshield',              minZone: 7 },
  { id: 'void-wraith-cloak',       minZone: 7 },
  { id: 'entropy-mantle',          minZone: 7 },
  { id: 'eternity-vestment',       minZone: 7 },
  { id: 'eternal-boneguard',       minZone: 7 },
  { id: 'eternal-dragonplate',     minZone: 7 },
  { id: 'apocalypse-blade',        minZone: 8 },
  { id: 'nightmare-fang',          minZone: 8 },
  { id: 'tome-of-infinite-dread',  minZone: 8 },
  { id: 'abyssal-decree',          minZone: 8 },
  { id: 'apocalyptic-scythe',      minZone: 8 },
  { id: 'apocalyptic-talon',       minZone: 8 },
  { id: 'eternal-fortress',        minZone: 8 },
  { id: 'nightmare-wraith',        minZone: 8 },
  { id: 'dreamweavers-mantle',     minZone: 8 },
  { id: 'apocalypse-vestment',     minZone: 8 },
  { id: 'apocalyptic-boneguard',   minZone: 8 },
  { id: 'apocalyptic-dragonplate', minZone: 8 },
]

