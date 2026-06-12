import type { Character, Enemy } from '../types/index'
import { d20, calcHit, calcCrit, calcPlayerDamage, calcEnemyDamage, calcRegenAmount, getSpecial, SPECIAL_CAPS } from './formulas'
import { CLASS_DEFINITIONS } from './classes'
import { getUpgradeBonuses } from './upgrades'
import { getActiveSet } from './sets'

/**
 * Pure combat resolution shared by the live CombatEngine and the headless
 * simulator (simulate.ts). Transient buffs (shop consumables, ascension
 * bonuses) are passed explicitly so these functions stay store-free.
 * Nothing in here mutates the character or the enemy — callers apply the
 * returned deltas themselves.
 */

/**
 * NG+ Attunement: the player gains +10% damage and +10% max HP per NG+ tier
 * (linear). Counterpart of the enemies' per-tier TIER_HP_GROWTH /
 * TIER_ATK_GROWTH compounding — tuned together so prestige difficulty rises
 * gently instead of walling capped characters.
 */
export const NG_TIER_PLAYER_POWER = 0.1

export interface CombatBuffs {
  /** War Potion — useShopStore().damageBonus in the live engine */
  shopDamageBonus: number
  /** Iron Flask — useShopStore().defBonus */
  shopDefBonus: number
  /** Swift Elixir — useShopStore().atkSpeedBonus */
  shopAtkSpeedBonus: number
  /** Ghost Strike ascension: stacks × 0.03 */
  hitChanceBonus: number
  /** Dragon Scales ascension: stacks × 0.02 */
  damageReduction: number
  /** NG+ tier (= prestige count) — grants NG_TIER_PLAYER_POWER damage per tier */
  ngTier: number
}

export const NO_BUFFS: CombatBuffs = Object.freeze({
  shopDamageBonus: 0,
  shopDefBonus: 0,
  shopAtkSpeedBonus: 0,
  hitChanceBonus: 0,
  damageReduction: 0,
  ngTier: 0,
})

export interface PlayerAttackOutcome {
  hit: boolean
  crit: boolean
  /** Main hit damage (0 on miss) */
  damage: number
  /** Poison rider damage (0 if no poison special) */
  poisonDamage: number
  /** Mage doublecast proc damage (0 if no proc) */
  doublecastDamage: number
  /** HP healed by lifesteal on the main hit (0 if none) */
  lifestealHeal: number
}

export interface EnemyAttackOutcome {
  dodged: boolean
  blocked: boolean
  /** Damage taken after DEF and damage reduction (0 if dodged/blocked) */
  damage: number
}

/** Player attack interval in ms before game-speed division */
export function playerAttackIntervalMs(character: Character, shopAtkSpeedBonus = 0): number {
  const weapon = character.gear.weapon
  const ub = getUpgradeBonuses(character.upgrades ?? {})
  const baseInterval = CLASS_DEFINITIONS[character.class].attackSpeed
  const speedBonus = getSpecial(weapon?.stats.special, 'attackSpeedBonus')?.percent ?? 0
  const setBonus = getActiveSet(character.gear.weapon, character.gear.armor)
  const setSpeedReduction = setBonus?.bonus.type === 'atk_speed' ? setBonus.bonus.value : 0
  const speedPct = Math.min(SPECIAL_CAPS.attackSpeedPct, speedBonus + shopAtkSpeedBonus)
  return Math.max(200, (baseInterval * (1 - speedPct)) - ub.attackSpeedReduction - setSpeedReduction)
}

export function resolvePlayerAttack(
  character: Character,
  enemy: Enemy,
  buffs: CombatBuffs = NO_BUFFS,
): PlayerAttackOutcome {
  const weapon = character.gear.weapon
  const ub = getUpgradeBonuses(character.upgrades ?? {})
  const setBonus = getActiveSet(character.gear.weapon, character.gear.armor)?.bonus ?? null

  // Def ignore: base class passive + weapon special + upgrade bonus
  const classDef = CLASS_DEFINITIONS[character.class]
  const baseDefIgnore = classDef.passives.defIgnore ?? 0
  const weaponDefIgnore = getSpecial(weapon?.stats.special, 'defIgnore')?.percent ?? 0
  const defIgnorePercent = Math.min(SPECIAL_CAPS.defIgnore, baseDefIgnore + weaponDefIgnore + ub.defIgnoreBonus)

  // Crit threshold from weapon special
  const extraCritThreshold = getSpecial(weapon?.stats.special, 'critThreshold')?.rollsAt

  const roll = d20()
  // Ghost Strike: hitChanceBonus is stacks × 0.03; ×20 converts to effective DEX (~1 DEX ≈ 0.15% hit)
  const bonusDex = Math.round(buffs.hitChanceBonus * 20)
  const hit = calcHit(character.stats.dex + bonusDex, enemy.def)
  const crit = hit && calcCrit(roll, character.class, extraCritThreshold, ub.critThresholdReduction)

  if (!hit) {
    return { hit, crit: false, damage: 0, poisonDamage: 0, doublecastDamage: 0, lifestealHeal: 0 }
  }

  const armorSpellAmp = getSpecial(character.gear.armor?.stats.special, 'spellAmp')?.percent ?? 0
  const setSpellAmp = setBonus?.type === 'spell_amp' ? setBonus.value : 0
  const setCritDamage = setBonus?.type === 'crit_damage' ? setBonus.value : 0

  const dmgParams = {
    classId: character.class,
    str: character.stats.str,
    int: character.stats.int,
    weapon,
    isCrit: crit,
    enemyDef: enemy.def,
    defIgnorePercent,
    armorSpellAmp: armorSpellAmp + ub.spellAmpBonus + setSpellAmp,
    critMultiplier: 1.5 + ub.critDamageBonus + setCritDamage,
  }

  let damage = calcPlayerDamage(dmgParams)

  // Set damage_pct bonus applied after base calc
  if (setBonus?.type === 'damage_pct') {
    damage = Math.floor(damage * (1 + setBonus.value))
  }

  // War Potion: +25% damage
  if (buffs.shopDamageBonus > 0) {
    damage = Math.floor(damage * (1 + buffs.shopDamageBonus))
  }

  // NG+ Attunement: +10% damage per prestige tier
  const ngMult = 1 + buffs.ngTier * NG_TIER_PLAYER_POWER
  if (buffs.ngTier > 0) {
    damage = Math.floor(damage * ngMult)
  }

  // Poison
  const poisonSpecial = getSpecial(weapon?.stats.special, 'poison')
  const poisonDamage = poisonSpecial ? Math.max(1, Math.floor(damage * poisonSpecial.dpsMultiplier)) : 0

  // Lifesteal (weapon special + class innate + upgrade + set) — main hit only
  const lifestealSpecial = getSpecial(weapon?.stats.special, 'lifesteal')
  const lifestealBase = classDef.passives.lifestealBase ?? 0
  const setLifesteal = setBonus?.type === 'lifesteal' ? setBonus.value : 0
  const totalLifestealFraction = Math.min(
    SPECIAL_CAPS.lifesteal,
    (lifestealSpecial?.value ?? 0) + lifestealBase + ub.lifestealBonus + setLifesteal,
  )
  const lifestealHeal = totalLifestealFraction > 0 ? Math.floor(damage * totalLifestealFraction) : 0

  // Doublecast (mage only) — base damage params, no set/shop multipliers
  let doublecastDamage = 0
  if (character.class === 'mage') {
    const doublecastSpecial = getSpecial(weapon?.stats.special, 'doublecast')
    if (doublecastSpecial && Math.random() < Math.min(SPECIAL_CAPS.doublecast, doublecastSpecial.chance)) {
      doublecastDamage = Math.floor(calcPlayerDamage(dmgParams) * ngMult)
    }
  }

  return { hit, crit, damage, poisonDamage, doublecastDamage, lifestealHeal }
}

export function resolveEnemyAttack(
  character: Character,
  enemy: Enemy,
  buffs: CombatBuffs = NO_BUFFS,
): EnemyAttackOutcome {
  const ub = getUpgradeBonuses(character.upgrades ?? {})
  const setBonus = getActiveSet(character.gear.weapon, character.gear.armor)?.bonus ?? null

  // Dodge (armor + upgrade + set)
  const armorDodge = getSpecial(character.gear.armor?.stats.special, 'dodge')?.chance ?? 0
  const setDodge = setBonus?.type === 'dodge' ? setBonus.value : 0
  if (Math.random() < Math.min(SPECIAL_CAPS.dodge, armorDodge + ub.dodgeBonus + setDodge)) {
    return { dodged: true, blocked: false, damage: 0 }
  }

  // Block (armor + upgrade)
  const armorBlock = getSpecial(character.gear.armor?.stats.special, 'block')?.chance ?? 0
  if (Math.random() < Math.min(SPECIAL_CAPS.block, armorBlock + ub.blockBonus)) {
    return { dodged: false, blocked: true, damage: 0 }
  }

  // Player DEF: armor base + warrior armorEffectiveness bonus + upgrade flat DEF + set flat DEF
  const classDef = CLASS_DEFINITIONS[character.class]
  const armorDef = character.gear.armor?.stats.defBonus ?? 0
  const armorEffBonus = (classDef.passives.armorEffectiveness ?? 1) - 1
  const setFlatDef = setBonus?.type === 'flat_def' ? setBonus.value : 0
  const playerDef = Math.floor(armorDef * (1 + armorEffBonus)) + ub.flatDef + setFlatDef + buffs.shopDefBonus

  const rawDamage = calcEnemyDamage(enemy.atk, playerDef)
  // Dragon Scales: reduce incoming damage (2% per stack, max 10%)
  const damage = Math.max(1, Math.floor(rawDamage * (1 - buffs.damageReduction)))
  return { dodged: false, blocked: false, damage }
}

/**
 * Rolls the on-kill regen proc. Returns the heal amount (0 if no proc).
 */
export function resolveKillRegen(character: Character): number {
  const regenOnKillBonus = getSpecial(character.gear.armor?.stats.special, 'regenOnKill')?.percent ?? 0
  const classDef = CLASS_DEFINITIONS[character.class]
  const ub = getUpgradeBonuses(character.upgrades ?? {})
  const activeSet = getActiveSet(character.gear.weapon, character.gear.armor)
  const setRegenBonus = activeSet?.bonus.type === 'hp_regen_pct' ? activeSet.bonus.value : 0
  const totalRegenChance = Math.min(0.9, classDef.passives.regenChance + regenOnKillBonus + ub.regenOnKillBonus + setRegenBonus)
  if (Math.random() >= totalRegenChance) return 0
  const regenPower = classDef.passives.regenPower ?? 1
  return Math.floor(calcRegenAmount(character.maxHP) * regenPower)
}
