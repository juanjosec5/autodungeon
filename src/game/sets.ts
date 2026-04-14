import type { Item } from '../types/index'

export type SetBonus =
  | { type: 'damage_pct';    value: number }  // multiply final damage by (1 + value)
  | { type: 'flat_def';      value: number }  // add flat DEF in enemyTick
  | { type: 'lifesteal';     value: number }  // additional lifesteal fraction on hit
  | { type: 'crit_damage';   value: number }  // add to critMultiplier
  | { type: 'dodge';         value: number }  // add to dodge chance
  | { type: 'atk_speed';     value: number }  // subtract ms from attack interval
  | { type: 'spell_amp';     value: number }  // add to spellAmp
  | { type: 'hp_regen_pct';  value: number }  // add to regenOnKill chance

export interface SetDefinition {
  id: string
  name: string
  weaponId: string
  armorId: string
  bonus: SetBonus
}

export const SET_DEFINITIONS: SetDefinition[] = [
  // ── Forest ───────────────────────────────────────────────────────────────
  { id: 'forest-stalker',  name: 'Forest Stalker',  weaponId: 'hunting-knife',   armorId: 'leather-scraps',   bonus: { type: 'damage_pct',   value: 0.12 } },
  { id: 'apprentice-path', name: "Apprentice's Path", weaponId: 'apprentice-wand', armorId: 'worn-tunic',       bonus: { type: 'spell_amp',    value: 0.10 } },

  // ── Dungeon ──────────────────────────────────────────────────────────────
  { id: 'iron-warrior',    name: 'Iron Warrior',    weaponId: 'iron-sword',      armorId: 'chainmail',        bonus: { type: 'flat_def',     value: 8  } },
  { id: 'shadow-walker',   name: 'Shadow Walker',   weaponId: 'steel-dagger',    armorId: 'shadow-cloak',     bonus: { type: 'dodge',        value: 0.08 } },
  { id: 'arcane-scholar',  name: 'Arcane Scholar',  weaponId: 'arcane-wand',     armorId: 'mage-robes',       bonus: { type: 'spell_amp',    value: 0.12 } },
  { id: 'sacred-order',    name: 'Sacred Order',    weaponId: 'divine-wand',     armorId: 'holy-vestments',   bonus: { type: 'hp_regen_pct', value: 0.08 } },

  // ── Volcano ──────────────────────────────────────────────────────────────
  { id: 'dragon-knight',   name: 'Dragon Knight',   weaponId: 'dragonfire-axe',  armorId: 'dragon-plate',     bonus: { type: 'damage_pct',   value: 0.15 } },
  { id: 'death-knight',    name: 'Death Knight',    weaponId: 'cursed-blade',    armorId: 'death-plate',      bonus: { type: 'lifesteal',    value: 0.06 } },
  { id: 'arcane-master',   name: 'Arcane Master',   weaponId: 'crystal-staff',   armorId: 'arcane-vestment',  bonus: { type: 'spell_amp',    value: 0.15 } },

  // ── Abyss ────────────────────────────────────────────────────────────────
  { id: 'void-walker',     name: 'Void Walker',     weaponId: 'abyssal-sword',   armorId: 'abyss-plate',      bonus: { type: 'crit_damage',  value: 0.10 } },
  { id: 'abyssal-mage',    name: 'Abyssal Mage',    weaponId: 'void-wand',       armorId: 'abyssal-robe',     bonus: { type: 'spell_amp',    value: 0.12 } },

  // ── Shadowrealm ──────────────────────────────────────────────────────────
  { id: 'dread-set',       name: 'Dread Set',       weaponId: 'shadowblade',     armorId: 'shadow-plate',     bonus: { type: 'lifesteal',    value: 0.08 } },
  { id: 'shadow-caster',   name: 'Shadow Caster',   weaponId: 'shadow-tome',     armorId: 'shadow-vestment',  bonus: { type: 'spell_amp',    value: 0.18 } },

  // ── Celestial ────────────────────────────────────────────────────────────
  { id: 'celestial-rogue', name: 'Celestial Rogue', weaponId: 'celestial-blades', armorId: 'celestial-shroud', bonus: { type: 'crit_damage',  value: 0.15 } },
  { id: 'celestial-mage',  name: 'Celestial Mage',  weaponId: 'celestial-staff',  armorId: 'celestial-vestment', bonus: { type: 'spell_amp',  value: 0.15 } },

  // ── Void ─────────────────────────────────────────────────────────────────
  { id: 'void-hunter',     name: 'Void Hunter',     weaponId: 'void-edge',       armorId: 'void-shroud',      bonus: { type: 'atk_speed',    value: 150  } },
  { id: 'entropy-coven',   name: 'Entropy Coven',   weaponId: 'entropy-grimoire', armorId: 'entropy-mantle',  bonus: { type: 'spell_amp',    value: 0.20 } },

  // ── Nightmare ────────────────────────────────────────────────────────────
  { id: 'nightmare-rogue', name: 'Nightmare Rogue', weaponId: 'nightmare-blades', armorId: 'nightmare-plate', bonus: { type: 'damage_pct',   value: 0.20 } },
  { id: 'nightmare-coven', name: 'Nightmare Coven', weaponId: 'nightmare-staff',  armorId: 'nightmare-vestment', bonus: { type: 'spell_amp', value: 0.25 } },
]

/** Returns the active set if the equipped weapon+armor form a matching pair, otherwise null. */
export function getActiveSet(weapon: Item | null, armor: Item | null): SetDefinition | null {
  if (!weapon || !armor) return null
  const wId = weapon.defId ?? weapon.id
  const aId = armor.defId ?? armor.id
  return SET_DEFINITIONS.find((s) => s.weaponId === wId && s.armorId === aId) ?? null
}
