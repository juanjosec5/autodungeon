import type { Item, ZoneId, ClassId, RarityId, SpecialEffect } from '../types/index'
import { weaponDamage, armorStats } from './item-curves'

// ── Declarative item definitions ─────────────────────────────────────────────
// Stats are NOT stored here — they are generated from zoneTier + rarity by the
// curves in item-curves.ts. Per-item mods (dmgMod/defMod/hpMod) shape flavor
// within a band; tune progression in item-curves.ts, not here.

export interface ItemDef {
  id: string
  name: string
  type: 'weapon' | 'armor'
  category: string
  rarity: RarityId
  allowedClasses: ClassId[] | 'any'
  zoneTier: number          // anchors the stat curve (0–7)
  dropFromZoneIdx?: number  // minimum zone index this item appears in drop pools
  dmgMod?: number
  defMod?: number
  hpMod?: number
  special?: SpecialEffect[]
}

export const ITEM_DEFS: ItemDef[] = [
  {
    id: 'rusty-sword', name: 'Rusty Sword', type: 'weapon', category: 'Sword', rarity: 'common',
    allowedClasses: ['warrior'], zoneTier: 0, dmgMod: 1.11,
  },
  {
    id: 'club', name: 'Club', type: 'weapon', category: 'Hammer', rarity: 'common',
    allowedClasses: ['warrior'], zoneTier: 0, dmgMod: 0.89,
  },
  {
    id: 'iron-sword', name: 'Iron Sword', type: 'weapon', category: 'Sword', rarity: 'uncommon',
    allowedClasses: 'any', zoneTier: 1, dmgMod: 0.97,
  },
  {
    id: 'war-hammer', name: 'War Hammer', type: 'weapon', category: 'Hammer', rarity: 'uncommon',
    allowedClasses: ['warrior'], zoneTier: 2, dmgMod: 0.87,
  },
  {
    id: 'broad-sword', name: 'Broad Sword', type: 'weapon', category: 'Sword', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 1, dmgMod: 1.2,
  },
  {
    id: 'battle-axe', name: 'Battle Axe', type: 'weapon', category: 'Axe', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 2, dmgMod: 0.96,
  },
  {
    id: 'executioners-axe', name: "Executioner's Axe", type: 'weapon', category: 'Axe', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 2, dmgMod: 1.05,
    special: [{ type: 'critThreshold', rollsAt: 19 }],
  },
  {
    id: 'shadowblade', name: 'Shadowblade', type: 'weapon', category: 'Sword', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 2, dmgMod: 0.92,
    special: [{ type: 'lifesteal', value: 0.1 }],
  },
  {
    id: 'storm-cleaver', name: 'Storm Cleaver', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 2, dmgMod: 1.03,
    special: [{ type: 'critThreshold', rollsAt: 19 }, { type: 'attackSpeedBonus', percent: 0.1 }],
  },
  {
    id: 'berserker-axe', name: 'Berserker Axe', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 2, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.08 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'void-edge', name: 'Void Edge', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 3, dmgMod: 1.1,
    special: [{ type: 'defIgnore', percent: 0.25 }, { type: 'critThreshold', rollsAt: 17 }, { type: 'lifesteal', value: 0.15 }],
  },
  {
    id: 'godslayer', name: 'Godslayer', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 3, dmgMod: 0.98,
    special: [{ type: 'lifesteal', value: 0.2 }, { type: 'defIgnore', percent: 0.15 }, { type: 'critThreshold', rollsAt: 18 }],
  },
  {
    id: 'titans-fist', name: "Titan's Fist", type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 4, dmgMod: 0.93,
    special: [{ type: 'lifesteal', value: 0.25 }, { type: 'defIgnore', percent: 0.2 }, { type: 'attackSpeedBonus', percent: 0.15 }],
  },
  {
    id: 'holy-staff', name: 'Holy Staff', type: 'weapon', category: 'Staff', rarity: 'common',
    allowedClasses: ['priest'], zoneTier: 0, dmgMod: 0.85,
  },
  {
    id: 'sacred-staff', name: 'Sacred Staff', type: 'weapon', category: 'Staff', rarity: 'uncommon',
    allowedClasses: ['priest'], zoneTier: 1, dmgMod: 1.2,
  },
  {
    id: 'divine-wand', name: 'Divine Wand', type: 'weapon', category: 'Wand', rarity: 'uncommon',
    allowedClasses: ['priest'], zoneTier: 2, dmgMod: 0.87,
    special: [{ type: 'attackSpeedBonus', percent: 0.08 }],
  },
  {
    id: 'sanctified-staff', name: 'Sanctified Staff', type: 'weapon', category: 'Staff', rarity: 'rare',
    allowedClasses: ['priest'], zoneTier: 2, dmgMod: 0.87,
  },
  {
    id: 'blessing-rod', name: 'Blessing Rod', type: 'weapon', category: 'Wand', rarity: 'rare',
    allowedClasses: ['priest'], zoneTier: 2, dmgMod: 0.96,
    special: [{ type: 'lifesteal', value: 0.08 }],
  },
  {
    id: 'holy-relic', name: 'Holy Relic', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 2, dmgMod: 1.13,
    special: [{ type: 'lifesteal', value: 0.12 }, { type: 'critThreshold', rollsAt: 19 }],
  },
  {
    id: 'radiant-wand', name: 'Radiant Wand', type: 'weapon', category: 'Wand', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 2, dmgMod: 1.01,
    special: [{ type: 'attackSpeedBonus', percent: 0.15 }, { type: 'lifesteal', value: 0.1 }],
  },
  {
    id: 'divine-arbiter', name: 'Divine Arbiter', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 3, dmgMod: 0.95,
    special: [{ type: 'lifesteal', value: 0.2 }, { type: 'critThreshold', rollsAt: 18 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'seraphic-tome', name: 'Seraphic Tome', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 3, dmgMod: 1.1,
    special: [{ type: 'lifesteal', value: 0.25 }, { type: 'attackSpeedBonus', percent: 0.15 }, { type: 'critThreshold', rollsAt: 19 }],
  },
  {
    id: 'bone-blade', name: 'Bone Blade', type: 'weapon', category: 'Sword', rarity: 'common',
    allowedClasses: ['undead'], zoneTier: 0, dmgMod: 1.2,
  },
  {
    id: 'death-blade', name: 'Death Blade', type: 'weapon', category: 'Sword', rarity: 'uncommon',
    allowedClasses: ['undead'], zoneTier: 1, dmgMod: 1.03,
  },
  {
    id: 'bone-axe', name: 'Bone Axe', type: 'weapon', category: 'Axe', rarity: 'uncommon',
    allowedClasses: ['undead'], zoneTier: 1, dmgMod: 1.2,
    special: [{ type: 'critThreshold', rollsAt: 17 }],
  },
  {
    id: 'cursed-scythe', name: 'Cursed Scythe', type: 'weapon', category: 'Scythe', rarity: 'rare',
    allowedClasses: ['undead'], zoneTier: 2, dmgMod: 0.85,
    special: [{ type: 'lifesteal', value: 0.08 }],
  },
  {
    id: 'necrotic-blade', name: 'Necrotic Blade', type: 'weapon', category: 'Sword', rarity: 'rare',
    allowedClasses: ['undead'], zoneTier: 2, dmgMod: 0.9,
    special: [{ type: 'critThreshold', rollsAt: 17 }, { type: 'attackSpeedBonus', percent: 0.08 }],
  },
  {
    id: 'soul-drain-axe', name: 'Soul Drain Axe', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 2, dmgMod: 1.13,
    special: [{ type: 'lifesteal', value: 0.15 }, { type: 'critThreshold', rollsAt: 17 }],
  },
  {
    id: 'reaper-scythe', name: 'Reaper Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 2, dmgMod: 0.99,
    special: [{ type: 'lifesteal', value: 0.12 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'banshee-blade', name: 'Banshee Blade', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 3, dmgMod: 1.02,
    special: [{ type: 'lifesteal', value: 0.25 }, { type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.1 }],
  },
  {
    id: 'soul-harvester-scythe', name: "Soul Harvester's Scythe", type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 3, dmgMod: 0.89,
    special: [{ type: 'lifesteal', value: 0.3 }, { type: 'critThreshold', rollsAt: 16 }, { type: 'attackSpeedBonus', percent: 0.15 }],
  },
  {
    id: 'dragon-claw', name: 'Dragon Claw', type: 'weapon', category: 'Gauntlet', rarity: 'common',
    allowedClasses: ['dragonkin'], zoneTier: 0,
  },
  {
    id: 'iron-claw', name: 'Iron Claw', type: 'weapon', category: 'Gauntlet', rarity: 'uncommon',
    allowedClasses: ['dragonkin'], zoneTier: 1, dmgMod: 1.08,
  },
  {
    id: 'scale-axe', name: 'Scale Axe', type: 'weapon', category: 'Axe', rarity: 'uncommon',
    allowedClasses: ['dragonkin'], zoneTier: 2, dmgMod: 0.85,
  },
  {
    id: 'dragonfire-axe', name: 'Dragonfire Axe', type: 'weapon', category: 'Axe', rarity: 'rare',
    allowedClasses: ['dragonkin'], zoneTier: 2, dmgMod: 0.9,
    special: [{ type: 'defIgnore', percent: 0.1 }],
  },
  {
    id: 'ember-claw', name: 'Ember Claw', type: 'weapon', category: 'Gauntlet', rarity: 'rare',
    allowedClasses: ['dragonkin'], zoneTier: 2, dmgMod: 0.85,
    special: [{ type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'volcanic-gauntlet', name: 'Volcanic Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 2, dmgMod: 1.13,
    special: [{ type: 'defIgnore', percent: 0.15 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'warlord-axe', name: 'Warlord Axe', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 3, dmgMod: 0.85,
    special: [{ type: 'lifesteal', value: 0.1 }, { type: 'critThreshold', rollsAt: 18 }],
  },
  {
    id: 'dragonlord-gauntlet', name: "Dragonlord's Gauntlet", type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 3, dmgMod: 1.09,
    special: [{ type: 'defIgnore', percent: 0.25 }, { type: 'attackSpeedBonus', percent: 0.2 }, { type: 'lifesteal', value: 0.1 }],
  },
  {
    id: 'titan-axe-of-flames', name: 'Titan Axe of Flames', type: 'weapon', category: 'Axe', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 3, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.15 }, { type: 'defIgnore', percent: 0.2 }, { type: 'critThreshold', rollsAt: 18 }],
  },
  {
    id: 'shiv', name: 'Shiv', type: 'weapon', category: 'Dagger', rarity: 'common',
    allowedClasses: 'any', zoneTier: 0, dmgMod: 0.85,
  },
  {
    id: 'hunting-knife', name: 'Hunting Knife', type: 'weapon', category: 'Dagger', rarity: 'common',
    allowedClasses: 'any', zoneTier: 0, dmgMod: 0.85,
  },
  {
    id: 'bone-dagger', name: 'Bone Dagger', type: 'weapon', category: 'Dagger', rarity: 'uncommon',
    allowedClasses: ['rogue'], zoneTier: 0, dmgMod: 0.94,
  },
  {
    id: 'twin-daggers', name: 'Twin Daggers', type: 'weapon', category: 'Daggers', rarity: 'uncommon',
    allowedClasses: 'any', zoneTier: 0, dmgMod: 1.11,
  },
  {
    id: 'steel-dagger', name: 'Steel Dagger', type: 'weapon', category: 'Dagger', rarity: 'uncommon',
    allowedClasses: ['rogue'], zoneTier: 1, dmgMod: 0.91,
  },
  {
    id: 'throwing-knives', name: 'Throwing Knives', type: 'weapon', category: 'Daggers', rarity: 'uncommon',
    allowedClasses: 'any', zoneTier: 0, dmgMod: 0.94,
    special: [{ type: 'attackSpeedBonus', percent: 0.1 }],
  },
  {
    id: 'venomblade', name: 'Venomblade', type: 'weapon', category: 'Dagger', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 1, dmgMod: 0.94,
    special: [{ type: 'poison', dpsMultiplier: 0.15 }],
  },
  {
    id: 'cursed-blade', name: 'Cursed Blade', type: 'weapon', category: 'Dagger', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 1, dmgMod: 1.08,
    special: [{ type: 'poison', dpsMultiplier: 0.2 }],
  },
  {
    id: 'spirit-blade', name: 'Spirit Blade', type: 'weapon', category: 'Dagger', rarity: 'rare',
    allowedClasses: ['rogue'], zoneTier: 1, dmgMod: 1.17,
    special: [{ type: 'lifesteal', value: 0.1 }],
  },
  {
    id: 'shadowstep-blade', name: 'Shadowstep Blade', type: 'weapon', category: 'Dagger', rarity: 'rare',
    allowedClasses: ['rogue'], zoneTier: 2, dmgMod: 0.85,
    special: [{ type: 'attackSpeedBonus', percent: 0.15 }],
  },
  {
    id: 'deathwhisper', name: 'Deathwhisper', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 1, dmgMod: 1.13,
    special: [{ type: 'critThreshold', rollsAt: 15 }],
  },
  {
    id: 'soul-reaper', name: 'Soul Reaper', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 2, dmgMod: 0.87,
    special: [{ type: 'lifesteal', value: 0.12 }, { type: 'critThreshold', rollsAt: 16 }],
  },
  {
    id: 'wraith-dagger', name: 'Wraith Dagger', type: 'weapon', category: 'Dagger', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 1, dmgMod: 1.2,
    special: [{ type: 'poison', dpsMultiplier: 0.18 }, { type: 'dodge', chance: 0.1 }],
  },
  {
    id: 'shadowdancer', name: 'Shadowdancer', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 3, dmgMod: 0.89,
    special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'poison', dpsMultiplier: 0.2 }],
  },
  {
    id: 'wraithfang', name: 'Wraithfang', type: 'weapon', category: 'Dagger', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 3, dmgMod: 0.85,
    special: [{ type: 'poison', dpsMultiplier: 0.25 }, { type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }],
  },
  {
    id: 'phantom-blades', name: 'Phantom Blades', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 3, dmgMod: 0.98,
    special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'poison', dpsMultiplier: 0.3 }, { type: 'attackSpeedBonus', percent: 0.25 }],
  },
  {
    id: 'crooked-staff', name: 'Crooked Staff', type: 'weapon', category: 'Staff', rarity: 'common',
    allowedClasses: 'any', zoneTier: 1, dmgMod: 0.89,
  },
  {
    id: 'apprentice-wand', name: 'Apprentice Wand', type: 'weapon', category: 'Wand', rarity: 'common',
    allowedClasses: ['mage'], zoneTier: 0,
  },
  {
    id: 'ember-rod', name: 'Ember Rod', type: 'weapon', category: 'Staff', rarity: 'uncommon',
    allowedClasses: ['mage'], zoneTier: 2, dmgMod: 0.95,
  },
  {
    id: 'arcane-wand', name: 'Arcane Wand', type: 'weapon', category: 'Wand', rarity: 'uncommon',
    allowedClasses: 'any', zoneTier: 1, dmgMod: 1.14,
  },
  {
    id: 'battle-staff', name: 'Battle Staff', type: 'weapon', category: 'Staff', rarity: 'uncommon',
    allowedClasses: ['mage'], zoneTier: 2, dmgMod: 1.06,
  },
  {
    id: 'spellbreaker', name: 'Spellbreaker', type: 'weapon', category: 'Staff', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 2, dmgMod: 0.96,
  },
  {
    id: 'crystal-staff', name: 'Crystal Staff', type: 'weapon', category: 'Staff', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 2, dmgMod: 1.11,
  },
  {
    id: 'lightning-rod', name: 'Lightning Rod', type: 'weapon', category: 'Staff', rarity: 'rare',
    allowedClasses: ['mage'], zoneTier: 2, dmgMod: 1.02,
    special: [{ type: 'defIgnore', percent: 0.15 }],
  },
  {
    id: 'voidstaff', name: 'Voidstaff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 2, dmgMod: 1.13,
    special: [{ type: 'defIgnore', percent: 0.35 }],
  },
  {
    id: 'arcane-surge', name: 'Arcane Surge', type: 'weapon', category: 'Wand', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 3, dmgMod: 0.91,
    special: [{ type: 'defIgnore', percent: 0.3 }, { type: 'spellAmp', percent: 0.15 }],
  },
  {
    id: 'celestial-tome', name: 'Celestial Tome', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 3, dmgMod: 1.19,
    special: [{ type: 'spellAmp', percent: 0.3 }, { type: 'doublecast', chance: 0.25 }, { type: 'defIgnore', percent: 0.4 }],
  },
  {
    id: 'eternum', name: 'Eternum', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 3, dmgMod: 1.1,
    special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.3 }],
  },
  {
    id: 'abyssal-tome', name: 'Abyssal Tome', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 4, dmgMod: 0.87,
    special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.35 }, { type: 'spellAmp', percent: 0.2 }],
  },
  {
    id: 'leather-scraps', name: 'Leather Scraps', type: 'armor', category: 'Light Armor', rarity: 'common',
    allowedClasses: 'any', zoneTier: 0, defMod: 0.83, hpMod: 0.71,
  },
  {
    id: 'worn-tunic', name: 'Worn Tunic', type: 'armor', category: 'Light Armor', rarity: 'common',
    allowedClasses: 'any', zoneTier: 0, defMod: 0.5, hpMod: 1.14,
  },
  {
    id: 'chainmail', name: 'Chainmail', type: 'armor', category: 'Chain Armor', rarity: 'uncommon',
    allowedClasses: 'any', zoneTier: 1, defMod: 1.28, hpMod: 0.73,
  },
  {
    id: 'padded-armor', name: 'Padded Armor', type: 'armor', category: 'Light Armor', rarity: 'uncommon',
    allowedClasses: 'any', zoneTier: 1, defMod: 0.85, hpMod: 0.88,
  },
  {
    id: 'linen-robe', name: 'Linen Robe', type: 'armor', category: 'Robes', rarity: 'uncommon',
    allowedClasses: 'any', zoneTier: 1, defMod: 0.5, hpMod: 1.1,
  },
  {
    id: 'iron-shield', name: 'Iron Shield', type: 'armor', category: 'Shield', rarity: 'uncommon',
    allowedClasses: ['warrior'], zoneTier: 1, defMod: 1.5, hpMod: 0.5,
  },
  {
    id: 'shadow-cloak', name: 'Shadow Cloak', type: 'armor', category: 'Cloak', rarity: 'uncommon',
    allowedClasses: 'any', zoneTier: 0, defMod: 1.28, hpMod: 0.88,
  },
  {
    id: 'mage-robes', name: 'Mage Robes', type: 'armor', category: 'Robes', rarity: 'uncommon',
    allowedClasses: 'any', zoneTier: 0, defMod: 0.64, hpMod: 1.32,
  },
  {
    id: 'plate-armor', name: 'Plate Armor', type: 'armor', category: 'Plate Armor', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 2, defMod: 1.35, hpMod: 0.77,
  },
  {
    id: 'bone-plate', name: 'Bone Plate', type: 'armor', category: 'Plate Armor', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 2, defMod: 1.5, hpMod: 0.85,
  },
  {
    id: 'assassins-garb', name: "Assassin's Garb", type: 'armor', category: 'Light Armor', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 1, defMod: 1.35, hpMod: 0.87,
  },
  {
    id: 'scale-mail', name: 'Scale Mail', type: 'armor', category: 'Chain Armor', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 2, defMod: 1.35, hpMod: 0.69,
    special: [{ type: 'block', chance: 0.05 }],
  },
  {
    id: 'arcane-vestment', name: 'Arcane Vestment', type: 'armor', category: 'Robes', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 1, defMod: 1.01, hpMod: 1.15,
    special: [{ type: 'spellAmp', percent: 0.1 }],
  },
  {
    id: 'cursed-vestments', name: 'Cursed Vestments', type: 'armor', category: 'Robes', rarity: 'rare',
    allowedClasses: 'any', zoneTier: 1, defMod: 1.01, hpMod: 1.04,
    special: [{ type: 'spellAmp', percent: 0.08 }],
  },
  {
    id: 'dragonscale-mail', name: 'Dragonscale Mail', type: 'armor', category: 'Chain Armor', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 3, defMod: 1.18, hpMod: 0.71,
  },
  {
    id: 'thornmail', name: 'Thornmail', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 3, defMod: 1.41, hpMod: 0.77,
    special: [{ type: 'block', chance: 0.12 }],
  },
  {
    id: 'blood-plate', name: 'Blood Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 3, defMod: 1.5, hpMod: 0.85,
    special: [{ type: 'regenOnKill', percent: 0.1 }],
  },
  {
    id: 'phantom-shroud', name: 'Phantom Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 2, defMod: 1.23, hpMod: 0.76,
    special: [{ type: 'dodge', chance: 0.2 }],
  },
  {
    id: 'shadow-veil', name: 'Shadow Veil', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 2, defMod: 1.41, hpMod: 0.85,
    special: [{ type: 'dodge', chance: 0.25 }],
  },
  {
    id: 'starweave-robe', name: 'Starweave Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 2, defMod: 0.88, hpMod: 0.91,
    special: [{ type: 'spellAmp', percent: 0.15 }],
  },
  {
    id: 'arcane-barrier', name: 'Arcane Barrier', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: 'any', zoneTier: 2, defMod: 1.23, hpMod: 1.09,
    special: [{ type: 'spellAmp', percent: 0.2 }],
  },
  {
    id: 'aegis-of-eternity', name: 'Aegis of Eternity', type: 'armor', category: 'Shield', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 3, defMod: 1.5, hpMod: 0.94,
    special: [{ type: 'block', chance: 0.1 }],
  },
  {
    id: 'voidweave-shroud', name: 'Voidweave Shroud', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 2, defMod: 1.5, hpMod: 0.94,
    special: [{ type: 'dodge', chance: 0.3 }],
  },
  {
    id: 'archmages-mantle', name: "Archmage's Mantle", type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 2, defMod: 1.1, hpMod: 1.18,
    special: [{ type: 'spellAmp', percent: 0.25 }, { type: 'regenOnKill', percent: 0.15 }],
  },
  {
    id: 'abyssal-plate', name: 'Abyssal Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 4, defMod: 1.5, hpMod: 0.94,
    special: [{ type: 'block', chance: 0.15 }, { type: 'regenOnKill', percent: 0.2 }],
  },
  {
    id: 'void-shroud', name: 'Void Shroud', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 3, defMod: 1.46, hpMod: 0.94,
    special: [{ type: 'dodge', chance: 0.35 }, { type: 'regenOnKill', percent: 0.1 }],
  },
  {
    id: 'rift-mantle', name: 'Rift Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 3, defMod: 1.01, hpMod: 1.18,
    special: [{ type: 'spellAmp', percent: 0.4 }, { type: 'regenOnKill', percent: 0.2 }],
  },
  {
    id: 'holy-vestments', name: 'Holy Vestments', type: 'armor', category: 'Robes', rarity: 'uncommon',
    allowedClasses: ['priest'], zoneTier: 1, defMod: 0.85, hpMod: 1.32,
  },
  {
    id: 'blessed-robes', name: 'Blessed Robes', type: 'armor', category: 'Robes', rarity: 'rare',
    allowedClasses: ['priest'], zoneTier: 2, defMod: 0.9, hpMod: 1.08,
    special: [{ type: 'regenOnKill', percent: 0.1 }],
  },
  {
    id: 'divine-shroud', name: 'Divine Shroud', type: 'armor', category: 'Cloak', rarity: 'rare',
    allowedClasses: ['priest'], zoneTier: 1, defMod: 1.01, hpMod: 1.27,
  },
  {
    id: 'sacred-vestments', name: 'Sacred Vestments', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 3, defMod: 0.82, hpMod: 1.01,
    special: [{ type: 'regenOnKill', percent: 0.15 }],
  },
  {
    id: 'holy-guardian-robe', name: 'Holy Guardian Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 3, defMod: 0.94, hpMod: 1.11,
    special: [{ type: 'regenOnKill', percent: 0.12 }, { type: 'block', chance: 0.08 }],
  },
  {
    id: 'divine-covenant', name: 'Divine Covenant', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 4, defMod: 0.73, hpMod: 0.89,
    special: [{ type: 'regenOnKill', percent: 0.3 }],
  },
  {
    id: 'seraph-mantle', name: 'Seraph Mantle', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 4, defMod: 0.61, hpMod: 0.94,
    special: [{ type: 'regenOnKill', percent: 0.25 }, { type: 'block', chance: 0.1 }],
  },
  {
    id: 'bone-shroud', name: 'Bone Shroud', type: 'armor', category: 'Cloak', rarity: 'uncommon',
    allowedClasses: ['undead'], zoneTier: 1, defMod: 1.28, hpMod: 0.88,
  },
  {
    id: 'death-plate', name: 'Death Plate', type: 'armor', category: 'Plate Armor', rarity: 'rare',
    allowedClasses: ['undead'], zoneTier: 3, defMod: 1.2, hpMod: 0.64,
  },
  {
    id: 'necromancer-vestments', name: 'Necromancer Vestments', type: 'armor', category: 'Robes', rarity: 'rare',
    allowedClasses: ['undead'], zoneTier: 1, defMod: 1.35, hpMod: 1.15,
    special: [{ type: 'block', chance: 0.06 }],
  },
  {
    id: 'undying-plate', name: 'Undying Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 3, defMod: 1.5, hpMod: 0.91,
    special: [{ type: 'block', chance: 0.1 }],
  },
  {
    id: 'wraith-shroud', name: 'Wraith Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 3, defMod: 1.06, hpMod: 0.71,
    special: [{ type: 'dodge', chance: 0.15 }],
  },
  {
    id: 'immortal-plate', name: 'Immortal Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 4, defMod: 1.34, hpMod: 0.78,
    special: [{ type: 'block', chance: 0.15 }],
  },
  {
    id: 'deathlord-vestments', name: 'Deathlord Vestments', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 3, defMod: 1.1, hpMod: 1.02,
    special: [{ type: 'block', chance: 0.12 }, { type: 'dodge', chance: 0.1 }],
  },
  {
    id: 'dragonhide-vest', name: 'Dragonhide Vest', type: 'armor', category: 'Chain Armor', rarity: 'uncommon',
    allowedClasses: ['dragonkin'], zoneTier: 2, defMod: 1.42, hpMod: 0.68,
  },
  {
    id: 'iron-scales', name: 'Iron Scales', type: 'armor', category: 'Chain Armor', rarity: 'rare',
    allowedClasses: ['dragonkin'], zoneTier: 3, defMod: 1.2, hpMod: 0.67,
  },
  {
    id: 'dragon-plate', name: 'Dragon Plate', type: 'armor', category: 'Plate Armor', rarity: 'rare',
    allowedClasses: ['dragonkin'], zoneTier: 3, defMod: 1.35, hpMod: 0.56,
    special: [{ type: 'block', chance: 0.07 }],
  },
  {
    id: 'dragonscale-fortress', name: 'Dragonscale Fortress', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 4, defMod: 1.18, hpMod: 0.78,
    special: [{ type: 'block', chance: 0.14 }, { type: 'regenOnKill', percent: 0.08 }],
  },
  {
    id: 'volcanic-plate', name: 'Volcanic Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 3, defMod: 1.5, hpMod: 1.05,
    special: [{ type: 'block', chance: 0.12 }],
  },
  {
    id: 'dragonlord-aegis', name: "Dragonlord's Aegis", type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 5, defMod: 1.14, hpMod: 0.73,
    special: [{ type: 'block', chance: 0.2 }, { type: 'regenOnKill', percent: 0.2 }],
  },
  {
    id: 'ancient-dragon-plate', name: 'Ancient Dragon Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 4, defMod: 1.46, hpMod: 0.94,
    special: [{ type: 'block', chance: 0.18 }, { type: 'regenOnKill', percent: 0.15 }],
  },
  {
    id: 'abyssal-sword', name: 'Abyssal Sword', type: 'weapon', category: 'Sword', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.2 }, { type: 'lifesteal', value: 0.08 }],
  },
  {
    id: 'shadow-pierce', name: 'Shadow Pierce', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.02,
    special: [{ type: 'critThreshold', rollsAt: 16 }, { type: 'attackSpeedBonus', percent: 0.15 }],
  },
  {
    id: 'void-wand', name: 'Void Wand', type: 'weapon', category: 'Wand', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.16,
    special: [{ type: 'defIgnore', percent: 0.35 }, { type: 'spellAmp', percent: 0.1 }],
  },
  {
    id: 'soul-staff', name: 'Soul Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.07,
    special: [{ type: 'lifesteal', value: 0.1 }, { type: 'attackSpeedBonus', percent: 0.1 }],
  },
  {
    id: 'abyssal-scythe', name: 'Abyssal Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.16,
    special: [{ type: 'lifesteal', value: 0.13 }, { type: 'critThreshold', rollsAt: 17 }],
  },
  {
    id: 'void-gauntlet', name: 'Void Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.12 }, { type: 'attackSpeedBonus', percent: 0.1 }],
  },
  {
    id: 'abyss-plate', name: 'Abyss Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 1.5, hpMod: 1.21,
    special: [{ type: 'block', chance: 0.12 }, { type: 'regenOnKill', percent: 0.08 }],
  },
  {
    id: 'void-veil', name: 'Void Veil', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 1.41, hpMod: 1.01,
    special: [{ type: 'dodge', chance: 0.22 }],
  },
  {
    id: 'abyssal-robe', name: 'Abyssal Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 0.94, hpMod: 1.17,
    special: [{ type: 'spellAmp', percent: 0.18 }, { type: 'regenOnKill', percent: 0.07 }],
  },
  {
    id: 'abyss-sacred-robe', name: 'Abyss Sacred Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 0.94, hpMod: 1.31,
    special: [{ type: 'regenOnKill', percent: 0.12 }],
  },
  {
    id: 'undead-carapace', name: 'Undead Carapace', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 1.5, hpMod: 1.01,
    special: [{ type: 'block', chance: 0.1 }],
  },
  {
    id: 'dragonbone-plate', name: 'Dragonbone Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 1.5, hpMod: 1.31,
    special: [{ type: 'block', chance: 0.13 }, { type: 'regenOnKill', percent: 0.07 }],
  },
  {
    id: 'abyss-warlord', name: 'Abyss Warlord', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.18 }, { type: 'defIgnore', percent: 0.22 }, { type: 'critThreshold', rollsAt: 18 }],
  },
  {
    id: 'void-dancer', name: 'Void Dancer', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.19,
    special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'poison', dpsMultiplier: 0.22 }],
  },
  {
    id: 'void-grimoire', name: 'Void Grimoire', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.25 }, { type: 'spellAmp', percent: 0.18 }],
  },
  {
    id: 'divine-word', name: 'Divine Word', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.15,
    special: [{ type: 'lifesteal', value: 0.2 }, { type: 'critThreshold', rollsAt: 18 }, { type: 'attackSpeedBonus', percent: 0.1 }],
  },
  {
    id: 'soul-drinker', name: 'Soul Drinker', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.28 }, { type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'iron-dragon-gauntlet', name: 'Iron Dragon Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 3, dropFromZoneIdx: 3, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.2 }, { type: 'attackSpeedBonus', percent: 0.18 }, { type: 'lifesteal', value: 0.1 }],
  },
  {
    id: 'abyss-guardian-plate', name: 'Abyss Guardian Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 1.5, hpMod: 1.38,
    special: [{ type: 'block', chance: 0.18 }, { type: 'regenOnKill', percent: 0.22 }],
  },
  {
    id: 'abyssal-mantle', name: 'Abyssal Mantle', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 1.46, hpMod: 1.02,
    special: [{ type: 'dodge', chance: 0.35 }, { type: 'regenOnKill', percent: 0.1 }],
  },
  {
    id: 'void-archmage-robe', name: 'Void Archmage Robe', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 1.01, hpMod: 1.22,
    special: [{ type: 'spellAmp', percent: 0.38 }, { type: 'regenOnKill', percent: 0.22 }],
  },
  {
    id: 'priest-abyss-vestment', name: "High Priest's Vestment", type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 0.91, hpMod: 1.33,
    special: [{ type: 'regenOnKill', percent: 0.28 }],
  },
  {
    id: 'bonelord-plate', name: 'Bonelord Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 1.5, hpMod: 1.18,
    special: [{ type: 'block', chance: 0.15 }, { type: 'dodge', chance: 0.08 }],
  },
  {
    id: 'dragonlord-plate', name: "Dragonlord's Plate", type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 3, dropFromZoneIdx: 3, defMod: 1.5, hpMod: 1.5,
    special: [{ type: 'block', chance: 0.22 }, { type: 'regenOnKill', percent: 0.18 }],
  },
  {
    id: 'dread-axe', name: 'Dread Axe', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.15,
    special: [{ type: 'lifesteal', value: 0.1 }, { type: 'attackSpeedBonus', percent: 0.08 }],
  },
  {
    id: 'shadow-knives', name: 'Shadow Knives', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 0.95,
    special: [{ type: 'critThreshold', rollsAt: 16 }, { type: 'attackSpeedBonus', percent: 0.2 }],
  },
  {
    id: 'dusk-staff', name: 'Dusk Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.09,
    special: [{ type: 'defIgnore', percent: 0.4 }, { type: 'spellAmp', percent: 0.12 }],
  },
  {
    id: 'shadow-plate', name: 'Shadow Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 1.5, hpMod: 0.94,
    special: [{ type: 'block', chance: 0.15 }],
  },
  {
    id: 'dread-shroud', name: 'Dread Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 1.1, hpMod: 0.78,
    special: [{ type: 'dodge', chance: 0.28 }],
  },
  {
    id: 'cursed-mantle', name: 'Cursed Mantle', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 0.78, hpMod: 1.01,
    special: [{ type: 'spellAmp', percent: 0.22 }, { type: 'regenOnKill', percent: 0.08 }],
  },
  {
    id: 'shade-reaper', name: 'Shade Reaper', type: 'weapon', category: 'Axe', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.2 }, { type: 'defIgnore', percent: 0.25 }, { type: 'critThreshold', rollsAt: 18 }],
  },
  {
    id: 'twilight-fang', name: 'Twilight Fang', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.06,
    special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'poison', dpsMultiplier: 0.25 }],
  },
  {
    id: 'grimoire-of-dread', name: 'Grimoire of Dread', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.3 }, { type: 'spellAmp', percent: 0.25 }],
  },
  {
    id: 'shadowplate-fortress', name: 'Shadowplate Fortress', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 1.5, hpMod: 1.36,
    special: [{ type: 'block', chance: 0.2 }, { type: 'regenOnKill', percent: 0.25 }],
  },
  {
    id: 'dread-stalker-veil', name: "Dread Stalker's Veil", type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 1.34, hpMod: 0.94,
    special: [{ type: 'dodge', chance: 0.35 }, { type: 'regenOnKill', percent: 0.12 }],
  },
  {
    id: 'shadow-weave-mantle', name: 'Shadow Weave Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 0.98, hpMod: 1.15,
    special: [{ type: 'spellAmp', percent: 0.4 }, { type: 'regenOnKill', percent: 0.25 }],
  },
  {
    id: 'shadow-tome', name: 'Shadow Tome', type: 'weapon', category: 'Tome', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.05,
    special: [{ type: 'lifesteal', value: 0.12 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'shadow-scythe', name: 'Shadow Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.15,
    special: [{ type: 'lifesteal', value: 0.15 }, { type: 'critThreshold', rollsAt: 17 }],
  },
  {
    id: 'shadow-talon', name: 'Shadow Talon', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.18 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'shadow-vestment', name: 'Shadow Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 0.71, hpMod: 0.97,
    special: [{ type: 'regenOnKill', percent: 0.1 }],
  },
  {
    id: 'shadow-carapace', name: 'Shadow Carapace', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 1.25, hpMod: 0.83,
    special: [{ type: 'block', chance: 0.12 }],
  },
  {
    id: 'shadow-dragonplate', name: 'Shadow Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 1.5, hpMod: 1.07,
    special: [{ type: 'block', chance: 0.15 }, { type: 'regenOnKill', percent: 0.08 }],
  },
  {
    id: 'dread-sermon', name: 'Dread Sermon', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.22 }, { type: 'critThreshold', rollsAt: 18 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'dread-reaper', name: 'Dread Reaper', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.28 }, { type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'dread-gauntlet', name: 'Dread Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 4, dropFromZoneIdx: 4, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.28 }, { type: 'attackSpeedBonus', percent: 0.2 }, { type: 'lifesteal', value: 0.1 }],
  },
  {
    id: 'dread-cassock', name: 'Dread Cassock', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 0.85, hpMod: 1.1,
    special: [{ type: 'regenOnKill', percent: 0.28 }],
  },
  {
    id: 'dread-boneguard', name: 'Dread Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 1.5, hpMod: 0.92,
    special: [{ type: 'block', chance: 0.18 }, { type: 'dodge', chance: 0.08 }],
  },
  {
    id: 'dread-dragonarmor', name: 'Dread Dragon Armor', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 4, dropFromZoneIdx: 4, defMod: 1.5, hpMod: 1.23,
    special: [{ type: 'block', chance: 0.22 }, { type: 'regenOnKill', percent: 0.22 }],
  },
  {
    id: 'holy-cleaver', name: 'Holy Cleaver', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 1,
    special: [{ type: 'defIgnore', percent: 0.15 }, { type: 'lifesteal', value: 0.12 }],
  },
  {
    id: 'celestial-blades', name: 'Celestial Blades', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 0.85,
    special: [{ type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.22 }],
  },
  {
    id: 'star-wand', name: 'Star Wand', type: 'weapon', category: 'Wand', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 0.95,
    special: [{ type: 'defIgnore', percent: 0.45 }, { type: 'doublecast', chance: 0.2 }],
  },
  {
    id: 'astral-plate', name: 'Astral Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 1.36, hpMod: 0.81,
    special: [{ type: 'block', chance: 0.17 }, { type: 'regenOnKill', percent: 0.1 }],
  },
  {
    id: 'celestial-shroud', name: 'Celestial Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 0.94, hpMod: 0.67,
    special: [{ type: 'dodge', chance: 0.3 }],
  },
  {
    id: 'divine-robe', name: 'Divine Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 0.68, hpMod: 0.9,
    special: [{ type: 'spellAmp', percent: 0.28 }, { type: 'regenOnKill', percent: 0.12 }],
  },
  {
    id: 'sunblade-divine', name: 'Sunblade Divine', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 1.19,
    special: [{ type: 'lifesteal', value: 0.25 }, { type: 'defIgnore', percent: 0.3 }, { type: 'attackSpeedBonus', percent: 0.2 }],
  },
  {
    id: 'starburst-knives', name: 'Starburst Knives', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 0.93,
    special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'poison', dpsMultiplier: 0.3 }],
  },
  {
    id: 'astral-codex', name: 'Astral Codex', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 1.11,
    special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.35 }, { type: 'spellAmp', percent: 0.3 }],
  },
  {
    id: 'celestial-aegis', name: 'Celestial Aegis', type: 'armor', category: 'Shield', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 1.5, hpMod: 1.22,
    special: [{ type: 'block', chance: 0.25 }, { type: 'regenOnKill', percent: 0.3 }],
  },
  {
    id: 'starlight-veil', name: 'Starlight Veil', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 1.22, hpMod: 0.87,
    special: [{ type: 'dodge', chance: 0.35 }, { type: 'regenOnKill', percent: 0.15 }],
  },
  {
    id: 'cosmic-mantle', name: 'Cosmic Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 0.89, hpMod: 1.05,
    special: [{ type: 'spellAmp', percent: 0.4 }, { type: 'regenOnKill', percent: 0.3 }],
  },
  {
    id: 'celestial-staff', name: 'Celestial Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 0.91,
    special: [{ type: 'lifesteal', value: 0.14 }, { type: 'attackSpeedBonus', percent: 0.15 }, { type: 'critThreshold', rollsAt: 18 }],
  },
  {
    id: 'celestial-scythe', name: 'Celestial Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 1,
    special: [{ type: 'lifesteal', value: 0.18 }, { type: 'critThreshold', rollsAt: 16 }],
  },
  {
    id: 'celestial-gauntlet', name: 'Celestial Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 1.05,
    special: [{ type: 'defIgnore', percent: 0.22 }, { type: 'attackSpeedBonus', percent: 0.15 }],
  },
  {
    id: 'celestial-vestment', name: 'Celestial Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 0.57, hpMod: 0.81,
    special: [{ type: 'regenOnKill', percent: 0.12 }],
  },
  {
    id: 'celestial-boneguard', name: 'Celestial Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 1.05, hpMod: 0.72,
    special: [{ type: 'block', chance: 0.14 }],
  },
  {
    id: 'celestial-dragonplate', name: 'Celestial Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 1.46, hpMod: 0.93,
    special: [{ type: 'block', chance: 0.18 }, { type: 'regenOnKill', percent: 0.1 }],
  },
  {
    id: 'seraph-staff', name: 'Seraph Staff', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 1.06,
    special: [{ type: 'lifesteal', value: 0.25 }, { type: 'critThreshold', rollsAt: 17 }, { type: 'attackSpeedBonus', percent: 0.15 }],
  },
  {
    id: 'death-celestial-blade', name: 'Celestial Death Blade', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 1.13,
    special: [{ type: 'lifesteal', value: 0.3 }, { type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.15 }],
  },
  {
    id: 'dragon-celestial-gauntlet', name: 'Dragon Celestial Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 5, dropFromZoneIdx: 5, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.32 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'lifesteal', value: 0.12 }],
  },
  {
    id: 'seraph-vestment', name: 'Seraph Vestment', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 0.73, hpMod: 0.94,
    special: [{ type: 'regenOnKill', percent: 0.32 }],
  },
  {
    id: 'celestial-deathlord-armor', name: 'Celestial Deathlord Armor', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 1.34, hpMod: 0.78,
    special: [{ type: 'block', chance: 0.22 }, { type: 'dodge', chance: 0.1 }],
  },
  {
    id: 'dragon-celestial-plate', name: 'Dragon Celestial Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 5, dropFromZoneIdx: 5, defMod: 1.5, hpMod: 1.06,
    special: [{ type: 'block', chance: 0.25 }, { type: 'regenOnKill', percent: 0.28 }],
  },
  {
    id: 'void-cleaver', name: 'Void Cleaver', type: 'weapon', category: 'Axe', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.87,
    special: [{ type: 'defIgnore', percent: 0.2 }, { type: 'lifesteal', value: 0.15 }],
  },
  {
    id: 'null-daggers', name: 'Null Daggers', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.85,
    special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }],
  },
  {
    id: 'rift-staff', name: 'Rift Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.85,
    special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.22 }],
  },
  {
    id: 'void-plate', name: 'Void Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 1.18, hpMod: 0.72,
    special: [{ type: 'block', chance: 0.2 }, { type: 'regenOnKill', percent: 0.12 }],
  },
  {
    id: 'null-shroud', name: 'Null Shroud', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 0.84, hpMod: 0.6,
    special: [{ type: 'dodge', chance: 0.35 }],
  },
  {
    id: 'rift-vestment', name: 'Rift Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 0.63, hpMod: 0.78,
    special: [{ type: 'spellAmp', percent: 0.35 }, { type: 'regenOnKill', percent: 0.15 }],
  },
  {
    id: 'null-executioner', name: 'Null Executioner', type: 'weapon', category: 'Axe', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 1.03,
    special: [{ type: 'lifesteal', value: 0.3 }, { type: 'defIgnore', percent: 0.35 }, { type: 'critThreshold', rollsAt: 17 }],
  },
  {
    id: 'void-piercer', name: 'Void Piercer', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.85,
    special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'poison', dpsMultiplier: 0.35 }],
  },
  {
    id: 'entropy-grimoire', name: 'Entropy Grimoire', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.98,
    special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.35 }, { type: 'spellAmp', percent: 0.35 }],
  },
  {
    id: 'nullshield', name: 'Nullshield', type: 'armor', category: 'Shield', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 1.5, hpMod: 1.07,
    special: [{ type: 'block', chance: 0.3 }, { type: 'regenOnKill', percent: 0.35 }],
  },
  {
    id: 'void-wraith-cloak', name: 'Void Wraith Cloak', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 1.08, hpMod: 0.79,
    special: [{ type: 'dodge', chance: 0.35 }, { type: 'regenOnKill', percent: 0.18 }],
  },
  {
    id: 'entropy-mantle', name: 'Entropy Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 0.81, hpMod: 0.93,
    special: [{ type: 'spellAmp', percent: 0.4 }, { type: 'regenOnKill', percent: 0.35 }],
  },
  {
    id: 'void-sermon-staff', name: 'Void Sermon Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.85,
    special: [{ type: 'lifesteal', value: 0.16 }, { type: 'attackSpeedBonus', percent: 0.18 }, { type: 'critThreshold', rollsAt: 17 }],
  },
  {
    id: 'void-scythe', name: 'Void Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.87,
    special: [{ type: 'lifesteal', value: 0.2 }, { type: 'critThreshold', rollsAt: 15 }],
  },
  {
    id: 'void-talon', name: 'Void Talon', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.91,
    special: [{ type: 'defIgnore', percent: 0.28 }, { type: 'attackSpeedBonus', percent: 0.18 }],
  },
  {
    id: 'void-vestment', name: 'Void Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 0.5, hpMod: 0.69,
    special: [{ type: 'regenOnKill', percent: 0.15 }],
  },
  {
    id: 'void-boneguard', name: 'Void Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 0.91, hpMod: 0.63,
    special: [{ type: 'block', chance: 0.17 }],
  },
  {
    id: 'void-dragonplate', name: 'Void Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 1.29, hpMod: 0.81,
    special: [{ type: 'block', chance: 0.22 }, { type: 'regenOnKill', percent: 0.12 }],
  },
  {
    id: 'eternity-staff', name: 'Eternity Staff', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.94,
    special: [{ type: 'lifesteal', value: 0.3 }, { type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.18 }],
  },
  {
    id: 'eternal-scythe', name: 'Eternal Scythe', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 0.98,
    special: [{ type: 'lifesteal', value: 0.3 }, { type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.18 }],
  },
  {
    id: 'eternal-talon', name: 'Eternal Talon', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 6, dropFromZoneIdx: 6, dmgMod: 1.08,
    special: [{ type: 'defIgnore', percent: 0.38 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'lifesteal', value: 0.15 }],
  },
  {
    id: 'eternity-vestment', name: 'Eternity Vestment', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 0.6, hpMod: 0.81,
    special: [{ type: 'regenOnKill', percent: 0.38 }],
  },
  {
    id: 'eternal-boneguard', name: 'Eternal Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 1.19, hpMod: 0.7,
    special: [{ type: 'block', chance: 0.26 }, { type: 'dodge', chance: 0.12 }],
  },
  {
    id: 'eternal-dragonplate', name: 'Eternal Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 6, dropFromZoneIdx: 6, defMod: 1.5, hpMod: 0.92,
    special: [{ type: 'block', chance: 0.28 }, { type: 'regenOnKill', percent: 0.35 }],
  },
  {
    id: 'horror-blade', name: 'Horror Blade', type: 'weapon', category: 'Sword', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.85,
    special: [{ type: 'defIgnore', percent: 0.25 }, { type: 'lifesteal', value: 0.18 }],
  },
  {
    id: 'nightmare-blades', name: 'Nightmare Blades', type: 'weapon', category: 'Daggers', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.85,
    special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }],
  },
  {
    id: 'dread-tome', name: 'Dread Tome', type: 'weapon', category: 'Tome', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.85,
    special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.25 }],
  },
  {
    id: 'nightmare-plate', name: 'Nightmare Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 1.05, hpMod: 0.64,
    special: [{ type: 'block', chance: 0.23 }, { type: 'regenOnKill', percent: 0.15 }],
  },
  {
    id: 'dread-wraith', name: 'Dread Wraith', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 0.74, hpMod: 0.53,
    special: [{ type: 'dodge', chance: 0.35 }],
  },
  {
    id: 'horror-vestment', name: 'Horror Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 0.56, hpMod: 0.7,
    special: [{ type: 'spellAmp', percent: 0.4 }, { type: 'regenOnKill', percent: 0.18 }],
  },
  {
    id: 'apocalypse-blade', name: 'Apocalypse Blade', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.9,
    special: [{ type: 'lifesteal', value: 0.3 }, { type: 'defIgnore', percent: 0.4 }, { type: 'critThreshold', rollsAt: 16 }],
  },
  {
    id: 'nightmare-fang', name: 'Nightmare Fang', type: 'weapon', category: 'Daggers', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.85,
    special: [{ type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'poison', dpsMultiplier: 0.4 }],
  },
  {
    id: 'tome-of-infinite-dread', name: 'Tome of Infinite Dread', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.86,
    special: [{ type: 'defIgnore', percent: 0.5 }, { type: 'doublecast', chance: 0.35 }, { type: 'spellAmp', percent: 0.4 }],
  },
  {
    id: 'eternal-fortress', name: 'Eternal Fortress', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 1.5, hpMod: 0.93,
    special: [{ type: 'block', chance: 0.35 }, { type: 'regenOnKill', percent: 0.4 }],
  },
  {
    id: 'nightmare-wraith', name: 'Nightmare Wraith', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 0.99, hpMod: 0.7,
    special: [{ type: 'dodge', chance: 0.35 }, { type: 'regenOnKill', percent: 0.22 }],
  },
  {
    id: 'dreamweavers-mantle', name: "Dreamweaver's Mantle", type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 0.72, hpMod: 0.82,
    special: [{ type: 'spellAmp', percent: 0.4 }, { type: 'regenOnKill', percent: 0.4 }],
  },
  {
    id: 'nightmare-staff', name: 'Nightmare Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.85,
    special: [{ type: 'lifesteal', value: 0.18 }, { type: 'attackSpeedBonus', percent: 0.22 }, { type: 'critThreshold', rollsAt: 16 }],
  },
  {
    id: 'nightmare-scythe', name: 'Nightmare Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.85,
    special: [{ type: 'lifesteal', value: 0.22 }, { type: 'critThreshold', rollsAt: 14 }],
  },
  {
    id: 'nightmare-talon', name: 'Nightmare Talon', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.85,
    special: [{ type: 'defIgnore', percent: 0.32 }, { type: 'attackSpeedBonus', percent: 0.22 }],
  },
  {
    id: 'nightmare-vestment', name: 'Nightmare Vestment', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 0.5, hpMod: 0.59,
    special: [{ type: 'regenOnKill', percent: 0.18 }],
  },
  {
    id: 'nightmare-boneguard', name: 'Nightmare Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 0.79, hpMod: 0.54,
    special: [{ type: 'block', chance: 0.2 }],
  },
  {
    id: 'nightmare-dragonplate', name: 'Nightmare Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 1.11, hpMod: 0.71,
    special: [{ type: 'block', chance: 0.25 }, { type: 'regenOnKill', percent: 0.15 }],
  },
  {
    id: 'abyssal-decree', name: 'Abyssal Decree', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.85,
    special: [{ type: 'lifesteal', value: 0.3 }, { type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.22 }],
  },
  {
    id: 'apocalyptic-scythe', name: 'Apocalyptic Scythe', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.86,
    special: [{ type: 'lifesteal', value: 0.3 }, { type: 'critThreshold', rollsAt: 14 }, { type: 'attackSpeedBonus', percent: 0.22 }],
  },
  {
    id: 'apocalyptic-talon', name: 'Apocalyptic Talon', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 7, dropFromZoneIdx: 7, dmgMod: 0.93,
    special: [{ type: 'defIgnore', percent: 0.45 }, { type: 'attackSpeedBonus', percent: 0.25 }, { type: 'lifesteal', value: 0.18 }],
  },
  {
    id: 'apocalypse-vestment', name: 'Apocalypse Vestment', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 0.54, hpMod: 0.72,
    special: [{ type: 'regenOnKill', percent: 0.4 }],
  },
  {
    id: 'apocalyptic-boneguard', name: 'Apocalyptic Boneguard', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 1.05, hpMod: 0.62,
    special: [{ type: 'block', chance: 0.3 }, { type: 'dodge', chance: 0.14 }],
  },
  {
    id: 'apocalyptic-dragonplate', name: 'Apocalyptic Dragonplate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 7, dropFromZoneIdx: 7, defMod: 1.41, hpMod: 0.81,
    special: [{ type: 'block', chance: 0.32 }, { type: 'regenOnKill', percent: 0.4 }],
  },

  // ── Forest zone items (dropFromZoneIdx: 0) ────────────────────────────────────
  {
    id: 'oakheart-blade', name: 'Oakheart Blade', type: 'weapon', category: 'Sword', rarity: 'uncommon',
    allowedClasses: ['warrior'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.1,
  },
  {
    id: 'thornfang-dagger', name: 'Thornfang Dagger', type: 'weapon', category: 'Dagger', rarity: 'uncommon',
    allowedClasses: ['rogue'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.05,
    special: [{ type: 'poison', dpsMultiplier: 0.1 }],
  },
  {
    id: 'willow-staff', name: 'Willow Staff', type: 'weapon', category: 'Staff', rarity: 'uncommon',
    allowedClasses: ['mage'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.05,
  },
  {
    id: 'grovekeeper-rod', name: 'Grovekeeper Rod', type: 'weapon', category: 'Wand', rarity: 'uncommon',
    allowedClasses: ['priest'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.05,
  },
  {
    id: 'gravewood-scythe', name: 'Gravewood Scythe', type: 'weapon', category: 'Scythe', rarity: 'uncommon',
    allowedClasses: ['undead'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.1,
  },
  {
    id: 'wyrmling-claw', name: 'Wyrmling Claw', type: 'weapon', category: 'Gauntlet', rarity: 'uncommon',
    allowedClasses: ['dragonkin'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.1,
  },
  {
    id: 'barkhide-plate', name: 'Barkhide Plate', type: 'armor', category: 'Plate Armor', rarity: 'rare',
    allowedClasses: ['warrior'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 1.2, hpMod: 0.9,
  },
  {
    id: 'wolfshadow-cloak', name: 'Wolfshadow Cloak', type: 'armor', category: 'Cloak', rarity: 'rare',
    allowedClasses: ['rogue'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 0.7, hpMod: 1.1,
    special: [{ type: 'dodge', chance: 0.06 }],
  },
  {
    id: 'fernweave-robe', name: 'Fernweave Robe', type: 'armor', category: 'Robes', rarity: 'rare',
    allowedClasses: ['mage'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 0.6, hpMod: 1.2,
    special: [{ type: 'spellAmp', percent: 0.06 }],
  },
  {
    id: 'sylvan-vestments', name: 'Sylvan Vestments', type: 'armor', category: 'Vestments', rarity: 'rare',
    allowedClasses: ['priest'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 0.65, hpMod: 1.2,
    special: [{ type: 'regenOnKill', percent: 0.06 }],
  },
  {
    id: 'mossbone-shroud', name: 'Mossbone Shroud', type: 'armor', category: 'Shroud', rarity: 'rare',
    allowedClasses: ['undead'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 0.9, hpMod: 1.05,
  },
  {
    id: 'greenscale-mail', name: 'Greenscale Mail', type: 'armor', category: 'Scale Armor', rarity: 'rare',
    allowedClasses: ['dragonkin'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 1.15, hpMod: 0.95,
  },

  // ── Forest BiS legendaries (boss-only via ZONE_BIS_IDS) ───────────────────────
  {
    id: 'heartwood-cleaver', name: 'Heartwood Cleaver', type: 'weapon', category: 'Axe', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.1 }, { type: 'critThreshold', rollsAt: 18 }],
  },
  {
    id: 'kingsbane-fang', name: 'Kingsbane Fang', type: 'weapon', category: 'Dagger', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.15,
    special: [{ type: 'poison', dpsMultiplier: 0.18 }, { type: 'critThreshold', rollsAt: 16 }],
  },
  {
    id: 'archdruid-staff', name: 'Archdruid Staff', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.15,
    special: [{ type: 'spellAmp', percent: 0.12 }, { type: 'doublecast', chance: 0.08 }],
  },
  {
    id: 'lifebloom-relic', name: 'Lifebloom Relic', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.15,
    special: [{ type: 'lifesteal', value: 0.12 }, { type: 'attackSpeedBonus', percent: 0.08 }],
  },
  {
    id: 'rotwood-reaper', name: 'Rotwood Reaper', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.14 }, { type: 'critThreshold', rollsAt: 17 }],
  },
  {
    id: 'emerald-wyrm-talon', name: 'Emerald Wyrm Talon', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 0, dropFromZoneIdx: 0, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.1 }, { type: 'attackSpeedBonus', percent: 0.1 }],
  },
  {
    id: 'ancient-oak-aegis', name: 'Ancient Oak Aegis', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 1.25, hpMod: 1.0,
    special: [{ type: 'block', chance: 0.1 }],
  },
  {
    id: 'verdant-shadow-garb', name: 'Verdant Shadow Garb', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 0.75, hpMod: 1.15,
    special: [{ type: 'dodge', chance: 0.12 }],
  },
  {
    id: 'living-root-mantle', name: 'Living Root Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 0.6, hpMod: 1.25,
    special: [{ type: 'spellAmp', percent: 0.1 }],
  },
  {
    id: 'blessed-grove-raiment', name: 'Blessed Grove Raiment', type: 'armor', category: 'Vestments', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 0.65, hpMod: 1.25,
    special: [{ type: 'regenOnKill', percent: 0.12 }],
  },
  {
    id: 'lichen-bone-carapace', name: 'Lichen Bone Carapace', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 1.1, hpMod: 1.05,
    special: [{ type: 'block', chance: 0.08 }, { type: 'dodge', chance: 0.06 }],
  },
  {
    id: 'verdant-dragonhide', name: 'Verdant Dragonhide', type: 'armor', category: 'Scale Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 0, dropFromZoneIdx: 0, defMod: 1.2, hpMod: 1.05,
    special: [{ type: 'regenOnKill', percent: 0.1 }],
  },

  // ── Dungeon zone items (dropFromZoneIdx: 1) ───────────────────────────────────
  {
    id: 'dungeoneer-greatsword', name: 'Dungeoneer Greatsword', type: 'weapon', category: 'Sword', rarity: 'rare',
    allowedClasses: ['warrior'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.1,
  },
  {
    id: 'lockpick-stiletto', name: 'Lockpick Stiletto', type: 'weapon', category: 'Dagger', rarity: 'rare',
    allowedClasses: ['rogue'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.05,
    special: [{ type: 'attackSpeedBonus', percent: 0.06 }],
  },
  {
    id: 'catacomb-scepter', name: 'Catacomb Scepter', type: 'weapon', category: 'Staff', rarity: 'rare',
    allowedClasses: ['mage'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.05,
    special: [{ type: 'spellAmp', percent: 0.05 }],
  },
  {
    id: 'crypt-censer', name: 'Crypt Censer', type: 'weapon', category: 'Wand', rarity: 'rare',
    allowedClasses: ['priest'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.05,
    special: [{ type: 'lifesteal', value: 0.05 }],
  },
  {
    id: 'ossuary-scythe', name: 'Ossuary Scythe', type: 'weapon', category: 'Scythe', rarity: 'rare',
    allowedClasses: ['undead'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.1,
  },
  {
    id: 'iron-fang-gauntlet', name: 'Iron Fang Gauntlet', type: 'weapon', category: 'Gauntlet', rarity: 'rare',
    allowedClasses: ['dragonkin'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.1,
  },
  {
    id: 'jailer-plate', name: 'Jailer Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 1.2, hpMod: 0.95,
    special: [{ type: 'block', chance: 0.08 }],
  },
  {
    id: 'cell-shadow-garb', name: 'Cell Shadow Garb', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 0.7, hpMod: 1.15,
    special: [{ type: 'dodge', chance: 0.1 }],
  },
  {
    id: 'warden-seal-robe', name: 'Warden Seal Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 0.6, hpMod: 1.2,
    special: [{ type: 'spellAmp', percent: 0.08 }],
  },
  {
    id: 'sanctum-vestments', name: 'Sanctum Vestments', type: 'armor', category: 'Vestments', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 0.65, hpMod: 1.2,
    special: [{ type: 'regenOnKill', percent: 0.08 }],
  },
  {
    id: 'tombguard-plate', name: 'Tombguard Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 1.1, hpMod: 1.0,
    special: [{ type: 'block', chance: 0.08 }],
  },
  {
    id: 'drakebone-mail', name: 'Drakebone Mail', type: 'armor', category: 'Scale Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 1.2, hpMod: 0.95,
    special: [{ type: 'regenOnKill', percent: 0.06 }],
  },

  // ── Dungeon BiS legendaries ───────────────────────────────────────────────────
  {
    id: 'oathbreaker', name: 'Oathbreaker', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.12 }, { type: 'defIgnore', percent: 0.1 }],
  },
  {
    id: 'wardens-end', name: "Warden's End", type: 'weapon', category: 'Dagger', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.15,
    special: [{ type: 'critThreshold', rollsAt: 15 }, { type: 'attackSpeedBonus', percent: 0.1 }],
  },
  {
    id: 'lichbane-scepter', name: 'Lichbane Scepter', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.15,
    special: [{ type: 'spellAmp', percent: 0.15 }, { type: 'doublecast', chance: 0.1 }],
  },
  {
    id: 'redemption-rod', name: 'Redemption Rod', type: 'weapon', category: 'Wand', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.15,
    special: [{ type: 'lifesteal', value: 0.15 }, { type: 'critThreshold', rollsAt: 17 }],
  },
  {
    id: 'soulchain-reaper', name: 'Soulchain Reaper', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.16 }, { type: 'critThreshold', rollsAt: 16 }],
  },
  {
    id: 'dungeon-wyrm-fist', name: 'Dungeon Wyrm Fist', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 1, dropFromZoneIdx: 1, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.12 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'darkcell-bulwark', name: 'Darkcell Bulwark', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 1.25, hpMod: 1.0,
    special: [{ type: 'block', chance: 0.12 }],
  },
  {
    id: 'gloomstalker-shroud', name: 'Gloomstalker Shroud', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 0.75, hpMod: 1.15,
    special: [{ type: 'dodge', chance: 0.14 }],
  },
  {
    id: 'spellbound-mantle', name: 'Spellbound Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 0.6, hpMod: 1.25,
    special: [{ type: 'spellAmp', percent: 0.12 }],
  },
  {
    id: 'martyr-vestments', name: 'Martyr Vestments', type: 'armor', category: 'Vestments', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 0.65, hpMod: 1.25,
    special: [{ type: 'regenOnKill', percent: 0.14 }],
  },
  {
    id: 'deathwarden-plate', name: 'Deathwarden Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 1.1, hpMod: 1.1,
    special: [{ type: 'block', chance: 0.1 }, { type: 'dodge', chance: 0.06 }],
  },
  {
    id: 'obsidian-drakemail', name: 'Obsidian Drakemail', type: 'armor', category: 'Scale Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 1, dropFromZoneIdx: 1, defMod: 1.2, hpMod: 1.05,
    special: [{ type: 'regenOnKill', percent: 0.12 }],
  },

  // ── Volcano zone items (dropFromZoneIdx: 2) ───────────────────────────────────
  {
    id: 'magma-edge', name: 'Magma Edge', type: 'weapon', category: 'Sword', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.1,
    special: [{ type: 'defIgnore', percent: 0.08 }],
  },
  {
    id: 'cinder-fang', name: 'Cinder Fang', type: 'weapon', category: 'Dagger', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.05,
    special: [{ type: 'poison', dpsMultiplier: 0.15 }],
  },
  {
    id: 'flamecaller-staff', name: 'Flamecaller Staff', type: 'weapon', category: 'Staff', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.05,
    special: [{ type: 'spellAmp', percent: 0.1 }],
  },
  {
    id: 'sunfire-rod', name: 'Sunfire Rod', type: 'weapon', category: 'Wand', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.05,
    special: [{ type: 'lifesteal', value: 0.08 }],
  },
  {
    id: 'charblack-scythe', name: 'Charblack Scythe', type: 'weapon', category: 'Scythe', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.1,
    special: [{ type: 'lifesteal', value: 0.08 }],
  },
  {
    id: 'lavaborn-claw', name: 'Lavaborn Claw', type: 'weapon', category: 'Gauntlet', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.1,
    special: [{ type: 'attackSpeedBonus', percent: 0.08 }],
  },
  {
    id: 'pyroclast-plate', name: 'Pyroclast Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['warrior'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 1.2, hpMod: 0.95,
    special: [{ type: 'block', chance: 0.1 }],
  },
  {
    id: 'ashwalker-garb', name: 'Ashwalker Garb', type: 'armor', category: 'Cloak', rarity: 'epic',
    allowedClasses: ['rogue'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 0.7, hpMod: 1.15,
    special: [{ type: 'dodge', chance: 0.12 }],
  },
  {
    id: 'emberweave-robe', name: 'Emberweave Robe', type: 'armor', category: 'Robes', rarity: 'epic',
    allowedClasses: ['mage'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 0.6, hpMod: 1.2,
    special: [{ type: 'spellAmp', percent: 0.1 }],
  },
  {
    id: 'flamewarded-vestments', name: 'Flamewarded Vestments', type: 'armor', category: 'Vestments', rarity: 'epic',
    allowedClasses: ['priest'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 0.65, hpMod: 1.2,
    special: [{ type: 'regenOnKill', percent: 0.1 }],
  },
  {
    id: 'scorchbone-plate', name: 'Scorchbone Plate', type: 'armor', category: 'Plate Armor', rarity: 'epic',
    allowedClasses: ['undead'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 1.1, hpMod: 1.0,
    special: [{ type: 'block', chance: 0.08 }],
  },
  {
    id: 'moltenscale-mail', name: 'Moltenscale Mail', type: 'armor', category: 'Scale Armor', rarity: 'epic',
    allowedClasses: ['dragonkin'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 1.2, hpMod: 0.95,
    special: [{ type: 'regenOnKill', percent: 0.08 }],
  },

  // ── Volcano BiS legendaries ───────────────────────────────────────────────────
  {
    id: 'caldera-greatblade', name: 'Caldera Greatblade', type: 'weapon', category: 'Sword', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.14 }, { type: 'defIgnore', percent: 0.12 }],
  },
  {
    id: 'phoenix-talon-daggers', name: 'Phoenix Talon Daggers', type: 'weapon', category: 'Dagger', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.15,
    special: [{ type: 'critThreshold', rollsAt: 15 }, { type: 'poison', dpsMultiplier: 0.2 }],
  },
  {
    id: 'eruption-codex', name: 'Eruption Codex', type: 'weapon', category: 'Tome', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.15,
    special: [{ type: 'spellAmp', percent: 0.18 }, { type: 'doublecast', chance: 0.12 }],
  },
  {
    id: 'solar-benediction', name: 'Solar Benediction', type: 'weapon', category: 'Staff', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.15,
    special: [{ type: 'lifesteal', value: 0.16 }, { type: 'attackSpeedBonus', percent: 0.1 }],
  },
  {
    id: 'pyre-harvester', name: 'Pyre Harvester', type: 'weapon', category: 'Scythe', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.2,
    special: [{ type: 'lifesteal', value: 0.18 }, { type: 'critThreshold', rollsAt: 16 }],
  },
  {
    id: 'dragonfire-fist', name: 'Dragonfire Fist', type: 'weapon', category: 'Gauntlet', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 2, dropFromZoneIdx: 2, dmgMod: 1.2,
    special: [{ type: 'defIgnore', percent: 0.15 }, { type: 'attackSpeedBonus', percent: 0.12 }],
  },
  {
    id: 'magma-lord-plate', name: 'Magma Lord Plate', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['warrior'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 1.25, hpMod: 1.0,
    special: [{ type: 'block', chance: 0.14 }],
  },
  {
    id: 'firewalker-shroud', name: 'Firewalker Shroud', type: 'armor', category: 'Cloak', rarity: 'legendary',
    allowedClasses: ['rogue'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 0.75, hpMod: 1.15,
    special: [{ type: 'dodge', chance: 0.16 }],
  },
  {
    id: 'cinderlord-mantle', name: 'Cinderlord Mantle', type: 'armor', category: 'Robes', rarity: 'legendary',
    allowedClasses: ['mage'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 0.6, hpMod: 1.25,
    special: [{ type: 'spellAmp', percent: 0.14 }],
  },
  {
    id: 'phoenix-feather-raiment', name: 'Phoenix Feather Raiment', type: 'armor', category: 'Vestments', rarity: 'legendary',
    allowedClasses: ['priest'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 0.65, hpMod: 1.25,
    special: [{ type: 'regenOnKill', percent: 0.16 }],
  },
  {
    id: 'ashlord-carapace', name: 'Ashlord Carapace', type: 'armor', category: 'Plate Armor', rarity: 'legendary',
    allowedClasses: ['undead'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 1.1, hpMod: 1.1,
    special: [{ type: 'block', chance: 0.12 }, { type: 'dodge', chance: 0.08 }],
  },
  {
    id: 'infernal-dragonplate', name: 'Infernal Dragonplate', type: 'armor', category: 'Scale Armor', rarity: 'legendary',
    allowedClasses: ['dragonkin'], zoneTier: 2, dropFromZoneIdx: 2, defMod: 1.2, hpMod: 1.05,
    special: [{ type: 'regenOnKill', percent: 0.14 }],
  },
]

// ── Materialization ───────────────────────────────────────────────────────────

function materializeItem(def: ItemDef): Item {
  const stats: Item['stats'] = {}
  if (def.type === 'weapon') {
    const { minDmg, maxDmg } = weaponDamage(def.zoneTier, def.rarity, def.dmgMod ?? 1)
    stats.minDmg = minDmg
    stats.maxDmg = maxDmg
  } else {
    const { defBonus, hpBonus } = armorStats(def.zoneTier, def.rarity, def.defMod ?? 1, def.hpMod ?? 1)
    stats.defBonus = defBonus
    stats.hpBonus = hpBonus
  }
  if (def.special) stats.special = structuredClone(def.special)
  const item: Item = {
    id: def.id,
    name: def.name,
    type: def.type,
    category: def.category,
    rarity: def.rarity,
    allowedClasses: def.allowedClasses,
    zoneTier: def.zoneTier,
    stats,
  }
  if (def.dropFromZoneIdx !== undefined) item.dropFromZoneIdx = def.dropFromZoneIdx
  return item
}

export const ITEM_DEFINITIONS: Item[] = ITEM_DEFS.map(materializeItem)

// ── Zone index mapping ────────────────────────────────────────────────────────

export const ZONE_INDEX: Record<ZoneId, number> = {
  forest: 0, dungeon: 1, volcano: 2, abyss: 3,
  shadowrealm: 4, celestial: 5, void: 6, nightmare: 7,
}

// ── BiS pools per zone ────────────────────────────────────────────────────────

export const ZONE_BIS_IDS: Record<ZoneId, string[]> = {
  forest      : ['heartwood-cleaver', 'kingsbane-fang', 'archdruid-staff', 'lifebloom-relic', 'rotwood-reaper', 'emerald-wyrm-talon', 'ancient-oak-aegis', 'verdant-shadow-garb', 'living-root-mantle', 'blessed-grove-raiment', 'lichen-bone-carapace', 'verdant-dragonhide'],
  dungeon     : ['oathbreaker', 'wardens-end', 'lichbane-scepter', 'redemption-rod', 'soulchain-reaper', 'dungeon-wyrm-fist', 'darkcell-bulwark', 'gloomstalker-shroud', 'spellbound-mantle', 'martyr-vestments', 'deathwarden-plate', 'obsidian-drakemail'],
  volcano     : ['caldera-greatblade', 'phoenix-talon-daggers', 'eruption-codex', 'solar-benediction', 'pyre-harvester', 'dragonfire-fist', 'magma-lord-plate', 'firewalker-shroud', 'cinderlord-mantle', 'phoenix-feather-raiment', 'ashlord-carapace', 'infernal-dragonplate'],
  abyss       : ['abyss-warlord', 'void-dancer', 'void-grimoire', 'divine-word', 'soul-drinker', 'iron-dragon-gauntlet', 'abyss-guardian-plate', 'abyssal-mantle', 'void-archmage-robe', 'priest-abyss-vestment', 'bonelord-plate', 'dragonlord-plate'],
  shadowrealm : ['shade-reaper', 'twilight-fang', 'grimoire-of-dread', 'dread-sermon', 'dread-reaper', 'dread-gauntlet', 'shadowplate-fortress', 'dread-stalker-veil', 'shadow-weave-mantle', 'dread-cassock', 'dread-boneguard', 'dread-dragonarmor'],
  celestial   : ['sunblade-divine', 'starburst-knives', 'astral-codex', 'seraph-staff', 'death-celestial-blade', 'dragon-celestial-gauntlet', 'celestial-aegis', 'starlight-veil', 'cosmic-mantle', 'seraph-vestment', 'celestial-deathlord-armor', 'dragon-celestial-plate'],
  void        : ['null-executioner', 'void-piercer', 'entropy-grimoire', 'eternity-staff', 'eternal-scythe', 'eternal-talon', 'nullshield', 'void-wraith-cloak', 'entropy-mantle', 'eternity-vestment', 'eternal-boneguard', 'eternal-dragonplate'],
  nightmare   : ['apocalypse-blade', 'nightmare-fang', 'tome-of-infinite-dread', 'abyssal-decree', 'apocalyptic-scythe', 'apocalyptic-talon', 'eternal-fortress', 'nightmare-wraith', 'dreamweavers-mantle', 'apocalypse-vestment', 'apocalyptic-boneguard', 'apocalyptic-dragonplate'],
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
  { id: 'rusty-sword', minZone: 0 },
  { id: 'club', minZone: 0 },
  { id: 'shiv', minZone: 0 },
  { id: 'hunting-knife', minZone: 0 },
  { id: 'crooked-staff', minZone: 0 },
  { id: 'apprentice-wand', minZone: 0 },
  { id: 'leather-scraps', minZone: 0 },
  { id: 'worn-tunic', minZone: 0 },
  { id: 'iron-sword', minZone: 1 },
  { id: 'war-hammer', minZone: 1 },
  { id: 'bone-dagger', minZone: 1 },
  { id: 'twin-daggers', minZone: 1 },
  { id: 'steel-dagger', minZone: 1 },
  { id: 'throwing-knives', minZone: 1 },
  { id: 'ember-rod', minZone: 1 },
  { id: 'arcane-wand', minZone: 1 },
  { id: 'battle-staff', minZone: 1 },
  { id: 'sacred-staff', minZone: 1 },
  { id: 'divine-wand', minZone: 1 },
  { id: 'death-blade', minZone: 1 },
  { id: 'bone-axe', minZone: 1 },
  { id: 'iron-claw', minZone: 1 },
  { id: 'scale-axe', minZone: 1 },
  { id: 'chainmail', minZone: 1 },
  { id: 'padded-armor', minZone: 1 },
  { id: 'linen-robe', minZone: 1 },
  { id: 'iron-shield', minZone: 1 },
  { id: 'shadow-cloak', minZone: 1 },
  { id: 'mage-robes', minZone: 1 },
  { id: 'holy-vestments', minZone: 1 },
  { id: 'bone-shroud', minZone: 1 },
  { id: 'dragonhide-vest', minZone: 1 },
  { id: 'broad-sword', minZone: 2 },
  { id: 'battle-axe', minZone: 2 },
  { id: 'executioners-axe', minZone: 2 },
  { id: 'venomblade', minZone: 2 },
  { id: 'cursed-blade', minZone: 2 },
  { id: 'spirit-blade', minZone: 2 },
  { id: 'shadowstep-blade', minZone: 2 },
  { id: 'spellbreaker', minZone: 2 },
  { id: 'crystal-staff', minZone: 2 },
  { id: 'lightning-rod', minZone: 2 },
  { id: 'sanctified-staff', minZone: 2 },
  { id: 'blessing-rod', minZone: 2 },
  { id: 'cursed-scythe', minZone: 2 },
  { id: 'necrotic-blade', minZone: 2 },
  { id: 'dragonfire-axe', minZone: 2 },
  { id: 'ember-claw', minZone: 2 },
  { id: 'plate-armor', minZone: 2 },
  { id: 'bone-plate', minZone: 2 },
  { id: 'assassins-garb', minZone: 2 },
  { id: 'scale-mail', minZone: 2 },
  { id: 'arcane-vestment', minZone: 2 },
  { id: 'cursed-vestments', minZone: 2 },
  { id: 'blessed-robes', minZone: 2 },
  { id: 'divine-shroud', minZone: 2 },
  { id: 'death-plate', minZone: 2 },
  { id: 'necromancer-vestments', minZone: 2 },
  { id: 'iron-scales', minZone: 2 },
  { id: 'dragon-plate', minZone: 2 },
  { id: 'shadowblade', minZone: 3 },
  { id: 'storm-cleaver', minZone: 3 },
  { id: 'berserker-axe', minZone: 3 },
  { id: 'deathwhisper', minZone: 3 },
  { id: 'soul-reaper', minZone: 3 },
  { id: 'wraith-dagger', minZone: 3 },
  { id: 'voidstaff', minZone: 3 },
  { id: 'arcane-surge', minZone: 3 },
  { id: 'holy-relic', minZone: 3 },
  { id: 'radiant-wand', minZone: 3 },
  { id: 'soul-drain-axe', minZone: 3 },
  { id: 'reaper-scythe', minZone: 3 },
  { id: 'volcanic-gauntlet', minZone: 3 },
  { id: 'warlord-axe', minZone: 3 },
  { id: 'dragonscale-mail', minZone: 3 },
  { id: 'blood-plate', minZone: 3 },
  { id: 'thornmail', minZone: 3 },
  { id: 'phantom-shroud', minZone: 3 },
  { id: 'shadow-veil', minZone: 3 },
  { id: 'starweave-robe', minZone: 3 },
  { id: 'arcane-barrier', minZone: 3 },
  { id: 'sacred-vestments', minZone: 3 },
  { id: 'holy-guardian-robe', minZone: 3 },
  { id: 'undying-plate', minZone: 3 },
  { id: 'wraith-shroud', minZone: 3 },
  { id: 'dragonscale-fortress', minZone: 3 },
  { id: 'volcanic-plate', minZone: 3 },
  { id: 'dread-axe', minZone: 4 },
  { id: 'shadow-knives', minZone: 4 },
  { id: 'dusk-staff', minZone: 4 },
  { id: 'shadow-tome', minZone: 4 },
  { id: 'shadow-scythe', minZone: 4 },
  { id: 'shadow-talon', minZone: 4 },
  { id: 'shadow-plate', minZone: 4 },
  { id: 'dread-shroud', minZone: 4 },
  { id: 'cursed-mantle', minZone: 4 },
  { id: 'shadow-vestment', minZone: 4 },
  { id: 'shadow-carapace', minZone: 4 },
  { id: 'shadow-dragonplate', minZone: 4 },
  { id: 'holy-cleaver', minZone: 5 },
  { id: 'celestial-blades', minZone: 5 },
  { id: 'star-wand', minZone: 5 },
  { id: 'celestial-staff', minZone: 5 },
  { id: 'celestial-scythe', minZone: 5 },
  { id: 'celestial-gauntlet', minZone: 5 },
  { id: 'astral-plate', minZone: 5 },
  { id: 'celestial-shroud', minZone: 5 },
  { id: 'divine-robe', minZone: 5 },
  { id: 'celestial-vestment', minZone: 5 },
  { id: 'celestial-boneguard', minZone: 5 },
  { id: 'celestial-dragonplate', minZone: 5 },
  { id: 'void-cleaver', minZone: 6 },
  { id: 'null-daggers', minZone: 6 },
  { id: 'rift-staff', minZone: 6 },
  { id: 'void-sermon-staff', minZone: 6 },
  { id: 'void-scythe', minZone: 6 },
  { id: 'void-talon', minZone: 6 },
  { id: 'void-plate', minZone: 6 },
  { id: 'null-shroud', minZone: 6 },
  { id: 'rift-vestment', minZone: 6 },
  { id: 'void-vestment', minZone: 6 },
  { id: 'void-boneguard', minZone: 6 },
  { id: 'void-dragonplate', minZone: 6 },
  { id: 'horror-blade', minZone: 7 },
  { id: 'nightmare-blades', minZone: 7 },
  { id: 'dread-tome', minZone: 7 },
  { id: 'nightmare-staff', minZone: 7 },
  { id: 'nightmare-scythe', minZone: 7 },
  { id: 'nightmare-talon', minZone: 7 },
  { id: 'nightmare-plate', minZone: 7 },
  { id: 'dread-wraith', minZone: 7 },
  { id: 'horror-vestment', minZone: 7 },
  { id: 'nightmare-vestment', minZone: 7 },
  { id: 'nightmare-boneguard', minZone: 7 },
  { id: 'nightmare-dragonplate', minZone: 7 },
  { id: 'void-edge', minZone: 4 },
  { id: 'godslayer', minZone: 4 },
  { id: 'titans-fist', minZone: 4 },
  { id: 'shadowdancer', minZone: 4 },
  { id: 'wraithfang', minZone: 4 },
  { id: 'phantom-blades', minZone: 4 },
  { id: 'celestial-tome', minZone: 4 },
  { id: 'eternum', minZone: 4 },
  { id: 'abyssal-tome', minZone: 4 },
  { id: 'divine-arbiter', minZone: 4 },
  { id: 'seraphic-tome', minZone: 4 },
  { id: 'banshee-blade', minZone: 4 },
  { id: 'soul-harvester-scythe', minZone: 4 },
  { id: 'dragonlord-gauntlet', minZone: 4 },
  { id: 'titan-axe-of-flames', minZone: 4 },
  { id: 'aegis-of-eternity', minZone: 4 },
  { id: 'voidweave-shroud', minZone: 4 },
  { id: 'archmages-mantle', minZone: 4 },
  { id: 'abyssal-plate', minZone: 4 },
  { id: 'void-shroud', minZone: 4 },
  { id: 'rift-mantle', minZone: 4 },
  { id: 'divine-covenant', minZone: 4 },
  { id: 'seraph-mantle', minZone: 4 },
  { id: 'immortal-plate', minZone: 4 },
  { id: 'deathlord-vestments', minZone: 4 },
  { id: 'dragonlord-aegis', minZone: 4 },
  { id: 'ancient-dragon-plate', minZone: 4 },
  { id: 'shade-reaper', minZone: 5 },
  { id: 'twilight-fang', minZone: 5 },
  { id: 'grimoire-of-dread', minZone: 5 },
  { id: 'dread-sermon', minZone: 5 },
  { id: 'dread-reaper', minZone: 5 },
  { id: 'dread-gauntlet', minZone: 5 },
  { id: 'shadowplate-fortress', minZone: 5 },
  { id: 'dread-stalker-veil', minZone: 5 },
  { id: 'shadow-weave-mantle', minZone: 5 },
  { id: 'dread-cassock', minZone: 5 },
  { id: 'dread-boneguard', minZone: 5 },
  { id: 'dread-dragonarmor', minZone: 5 },
  { id: 'sunblade-divine', minZone: 6 },
  { id: 'starburst-knives', minZone: 6 },
  { id: 'astral-codex', minZone: 6 },
  { id: 'seraph-staff', minZone: 6 },
  { id: 'death-celestial-blade', minZone: 6 },
  { id: 'dragon-celestial-gauntlet', minZone: 6 },
  { id: 'celestial-aegis', minZone: 6 },
  { id: 'starlight-veil', minZone: 6 },
  { id: 'cosmic-mantle', minZone: 6 },
  { id: 'seraph-vestment', minZone: 6 },
  { id: 'celestial-deathlord-armor', minZone: 6 },
  { id: 'dragon-celestial-plate', minZone: 6 },
  { id: 'null-executioner', minZone: 7 },
  { id: 'void-piercer', minZone: 7 },
  { id: 'entropy-grimoire', minZone: 7 },
  { id: 'eternity-staff', minZone: 7 },
  { id: 'eternal-scythe', minZone: 7 },
  { id: 'eternal-talon', minZone: 7 },
  { id: 'nullshield', minZone: 7 },
  { id: 'void-wraith-cloak', minZone: 7 },
  { id: 'entropy-mantle', minZone: 7 },
  { id: 'eternity-vestment', minZone: 7 },
  { id: 'eternal-boneguard', minZone: 7 },
  { id: 'eternal-dragonplate', minZone: 7 },
  { id: 'apocalypse-blade', minZone: 8 },
  { id: 'nightmare-fang', minZone: 8 },
  { id: 'tome-of-infinite-dread', minZone: 8 },
  { id: 'abyssal-decree', minZone: 8 },
  { id: 'apocalyptic-scythe', minZone: 8 },
  { id: 'apocalyptic-talon', minZone: 8 },
  { id: 'eternal-fortress', minZone: 8 },
  { id: 'nightmare-wraith', minZone: 8 },
  { id: 'dreamweavers-mantle', minZone: 8 },
  { id: 'apocalypse-vestment', minZone: 8 },
  { id: 'apocalyptic-boneguard', minZone: 8 },
  { id: 'apocalyptic-dragonplate', minZone: 8 },
]
