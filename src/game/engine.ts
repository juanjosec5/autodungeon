import type { Character, Enemy, ZoneId } from '../types/index'
import { d20, calcHit, calcCrit, calcPlayerDamage, calcEnemyDamage, calcRegenAmount, getSpecial } from './formulas'
import { rollLoot, rollBisLoot } from './items'
import { CLASS_DEFINITIONS } from './classes'
import { spawnEnemy, getBossForZone } from './enemies'
import { getUpgradeBonuses } from './upgrades'
import { getActiveSet } from './sets'

// ─── Exported types ───────────────────────────────────────────────────────────

export interface CombatState {
  character: Character
  enemy: Enemy
  zone: ZoneId
  speed: number
  isPaused: boolean
  killCount: number        // normal kills since last boss
  killsToNextBoss: number  // threshold, rerolled after each boss
  dropRateBonus: number    // prestige Fortune bonus (0–0.5)
}

export type CombatEventType =
  | 'player_hit'
  | 'player_miss'
  | 'player_crit'
  | 'enemy_hit'
  | 'enemy_dead'
  | 'enemy_spawned'
  | 'boss_spawned'
  | 'boss_defeated'
  | 'player_dead'
  | 'loot_dropped'
  | 'xp_gained'
  | 'level_up'
  | 'hp_regen'

export interface CombatEvent {
  type: CombatEventType
  payload: Record<string, unknown>
}

export type CombatEventHandler = (event: CombatEvent) => void

// ─── CombatEngine ─────────────────────────────────────────────────────────────

export class CombatEngine {
  private state: CombatState | null = null
  private playerTickTimer: ReturnType<typeof setTimeout> | null = null
  private enemyTickTimer: ReturnType<typeof setTimeout> | null = null
  private handlers: CombatEventHandler[] = []
  private isDead = false

  // ── Public API ──────────────────────────────────────────────────────────────

  start(state: Omit<CombatState, 'killCount' | 'killsToNextBoss'>): void {
    this.state = {
      ...state,
      dropRateBonus: state.dropRateBonus ?? 0,
      killCount: 0,
      killsToNextBoss: rollDamage(10, 15),
    }
    this.isDead = false
    this.schedulePlayerTick()
    this.scheduleEnemyTick()
  }

  stop(): void {
    if (this.playerTickTimer !== null) clearTimeout(this.playerTickTimer)
    if (this.enemyTickTimer !== null) clearTimeout(this.enemyTickTimer)
    this.playerTickTimer = null
    this.enemyTickTimer = null
    this.state = null
  }

  pause(): void {
    if (!this.state) return
    this.state.isPaused = true
    if (this.playerTickTimer !== null) clearTimeout(this.playerTickTimer)
    if (this.enemyTickTimer !== null) clearTimeout(this.enemyTickTimer)
    this.playerTickTimer = null
    this.enemyTickTimer = null
  }

  resume(): void {
    if (!this.state) return
    this.state.isPaused = false
    this.schedulePlayerTick()
    this.scheduleEnemyTick()
  }

  setSpeed(multiplier: 0.5 | 1 | 2 | 4): void {
    if (!this.state) return
    this.state.speed = multiplier
    if (this.playerTickTimer !== null) clearTimeout(this.playerTickTimer)
    if (this.enemyTickTimer !== null) clearTimeout(this.enemyTickTimer)
    this.schedulePlayerTick()
    this.scheduleEnemyTick()
  }

  updateCharacter(character: Character): void {
    if (!this.state) return
    this.state.character = character
  }

  getKillCount(): number { return this.state?.killCount ?? 0 }
  getKillsToNextBoss(): number { return this.state?.killsToNextBoss ?? 12 }

  on(handler: CombatEventHandler): () => void {
    this.handlers.push(handler)
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler)
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private emit(event: CombatEvent): void {
    for (const handler of this.handlers) handler(event)
  }

  private getPlayerAttackInterval(): number {
    if (!this.state) return 1000
    const { character, speed } = this.state
    const weapon = character.gear.weapon
    const ub = getUpgradeBonuses(character.upgrades ?? {})
    const baseInterval = CLASS_DEFINITIONS[character.class].attackSpeed
    const speedBonus = getSpecial(weapon?.stats.special, 'attackSpeedBonus')?.percent ?? 0
    const setBonus = getActiveSet(character.gear.weapon, character.gear.armor)
    const setSpeedReduction = setBonus?.bonus.type === 'atk_speed' ? setBonus.bonus.value : 0
    const interval = Math.max(200, (baseInterval * (1 - speedBonus)) - ub.attackSpeedReduction - setSpeedReduction)
    return Math.floor(interval / speed)
  }

  private getEnemyAttackInterval(): number {
    if (!this.state) return 1000
    return Math.floor(this.state.enemy.attackSpeed / this.state.speed)
  }

  private schedulePlayerTick(): void {
    this.playerTickTimer = setTimeout(() => this.playerTick(), this.getPlayerAttackInterval())
  }

  private scheduleEnemyTick(): void {
    this.enemyTickTimer = setTimeout(() => this.enemyTick(), this.getEnemyAttackInterval())
  }

  private playerTick(): void {
    if (!this.state || this.state.isPaused || this.isDead) return
    const { character, enemy } = this.state
    const weapon = character.gear.weapon
    const ub = getUpgradeBonuses(character.upgrades ?? {})
    const activeSet = getActiveSet(character.gear.weapon, character.gear.armor)
    const setBonus = activeSet?.bonus ?? null

    // Def ignore: base class passive + weapon special + upgrade bonus
    const classDef = CLASS_DEFINITIONS[character.class]
    const baseDefIgnore = classDef.passives.defIgnore ?? 0
    const weaponDefIgnore = getSpecial(weapon?.stats.special, 'defIgnore')?.percent ?? 0
    const defIgnorePercent = Math.min(0.9, baseDefIgnore + weaponDefIgnore + ub.defIgnoreBonus)

    // Crit threshold from weapon special
    const extraCritThreshold = getSpecial(weapon?.stats.special, 'critThreshold')?.rollsAt

    const roll = d20()
    const hits = calcHit(character.stats.dex, enemy.def)
    const isCrit = hits && calcCrit(roll, character.class, extraCritThreshold, ub.critThresholdReduction)

    if (!hits) {
      this.emit({ type: 'player_miss', payload: { enemyName: enemy.name } })
    } else {
      const poisonSpecial = getSpecial(weapon?.stats.special, 'poison')
      const armorSpellAmp = getSpecial(character.gear.armor?.stats.special, 'spellAmp')?.percent ?? 0
      const setSpellAmp = setBonus?.type === 'spell_amp' ? setBonus.value : 0

      const setCritDamage = setBonus?.type === 'crit_damage' ? setBonus.value : 0

      const dmgParams = {
        classId: character.class,
        str: character.stats.str,
        int: character.stats.int,
        weapon,
        isCrit,
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

      // Poison
      let poisonDamage: number | undefined
      if (poisonSpecial) {
        poisonDamage = Math.max(1, Math.floor(damage * poisonSpecial.dpsMultiplier))
        enemy.hp -= poisonDamage
      }

      enemy.hp -= damage

      // Lifesteal (weapon special + class innate + upgrade + set)
      const lifestealSpecial = getSpecial(weapon?.stats.special, 'lifesteal')
      const lifestealBase = classDef.passives.lifestealBase ?? 0
      const setLifesteal = setBonus?.type === 'lifesteal' ? setBonus.value : 0
      const totalLifestealFraction = (lifestealSpecial?.value ?? 0) + lifestealBase + ub.lifestealBonus + setLifesteal
      let lifestealHeal = 0
      if (totalLifestealFraction > 0) {
        lifestealHeal = Math.floor(damage * totalLifestealFraction)
        character.currentHP = Math.min(character.maxHP, character.currentHP + lifestealHeal)
      }

      const eventType = isCrit ? 'player_crit' : 'player_hit'
      this.emit({
        type: eventType,
        payload: {
          damage,
          poisonDamage,
          lifestealHeal: lifestealHeal > 0 ? lifestealHeal : undefined,
          enemyName: enemy.name,
          enemyHP: enemy.hp,
          enemyMaxHP: enemy.maxHp,
        },
      })

      // Doublecast (mage only)
      if (character.class === 'mage') {
        const doublecastSpecial = getSpecial(weapon?.stats.special, 'doublecast')
        if (doublecastSpecial && Math.random() < doublecastSpecial.chance) {
          const bonusDamage = calcPlayerDamage(dmgParams)
          enemy.hp -= bonusDamage
          this.emit({
            type: 'player_hit',
            payload: {
              damage: bonusDamage,
              enemyName: enemy.name,
              enemyHP: enemy.hp,
              enemyMaxHP: enemy.maxHp,
            },
          })
        }
      }
    }

    if (enemy.hp <= 0) {
      this.handleEnemyDeath()
    } else {
      this.schedulePlayerTick()
    }
  }

  private enemyTick(): void {
    if (!this.state || this.state.isPaused || this.isDead) return
    const { character, enemy } = this.state
    const ub = getUpgradeBonuses(character.upgrades ?? {})
    const activeSet = getActiveSet(character.gear.weapon, character.gear.armor)
    const setBonus = activeSet?.bonus ?? null

    // Dodge (armor + upgrade + set) — capped at 75% to prevent near-immunity
    const armorDodge = getSpecial(character.gear.armor?.stats.special, 'dodge')?.chance ?? 0
    const setDodge = setBonus?.type === 'dodge' ? setBonus.value : 0
    if (Math.random() < Math.min(0.75, armorDodge + ub.dodgeBonus + setDodge)) {
      this.scheduleEnemyTick()
      return
    }

    // Block (armor + upgrade) — capped at 75%
    const armorBlock = getSpecial(character.gear.armor?.stats.special, 'block')?.chance ?? 0
    if (Math.random() < Math.min(0.75, armorBlock + ub.blockBonus)) {
      this.scheduleEnemyTick()
      return
    }

    // Player DEF: armor base + warrior armorEffectiveness bonus + upgrade flat DEF + set flat DEF
    const classDef = CLASS_DEFINITIONS[character.class]
    const armorDef = character.gear.armor?.stats.defBonus ?? 0
    const armorEffBonus = (classDef.passives.armorEffectiveness ?? 1) - 1
    const setFlatDef = setBonus?.type === 'flat_def' ? setBonus.value : 0
    const playerDef = Math.floor(armorDef * (1 + armorEffBonus)) + ub.flatDef + setFlatDef

    const damage = calcEnemyDamage(enemy.atk, playerDef)
    character.currentHP -= damage
    this.emit({
      type: 'enemy_hit',
      payload: {
        damage,
        enemyName: enemy.name,
        playerHP: character.currentHP,
        playerMaxHP: character.maxHP,
      },
    })

    if (character.currentHP <= 0) {
      this.isDead = true
      character.currentHP = 0
      if (this.playerTickTimer !== null) clearTimeout(this.playerTickTimer)
      if (this.enemyTickTimer !== null) clearTimeout(this.enemyTickTimer)
      this.playerTickTimer = null
      this.enemyTickTimer = null
      this.emit({ type: 'player_dead', payload: { enemyName: enemy.name } })
    } else {
      this.scheduleEnemyTick()
    }
  }

  private handleEnemyDeath(): void {
    if (!this.state) return
    const { character, enemy } = this.state

    if (this.enemyTickTimer !== null) clearTimeout(this.enemyTickTimer)
    if (this.playerTickTimer !== null) clearTimeout(this.playerTickTimer)
    this.enemyTickTimer = null
    this.playerTickTimer = null

    enemy.hp = 0
    this.emit({ type: 'enemy_dead', payload: { enemyId: enemy.id, enemyName: enemy.name, isBoss: enemy.isBoss ?? false } })
    this.emit({ type: 'xp_gained', payload: { amount: enemy.xpReward } })

    // Loot
    const dropBonus = this.state.dropRateBonus ?? 0
    if (enemy.isBoss) {
      const regularItem = rollLoot(this.state.zone, enemy.id, dropBonus)
      this.emit({ type: 'loot_dropped', payload: { item: regularItem } })

      // 1/200 chance for zone-specific BiS legendary
      if (Math.random() < 1 / 200) {
        const bisItem = rollBisLoot(this.state.zone)
        this.emit({ type: 'loot_dropped', payload: { item: bisItem, isBossLoot: true } })
      }

      this.emit({ type: 'boss_defeated', payload: { enemyName: enemy.name } })
      this.state.killCount = 0
      this.state.killsToNextBoss = rollDamage(10, 15)
    } else {
      const item = rollLoot(this.state.zone, enemy.id, dropBonus)
      this.emit({ type: 'loot_dropped', payload: { item } })
      this.state.killCount++
    }

    // Regen on kill: class base chance + armor bonus + upgrade bonus + set bonus
    const regenOnKillBonus = getSpecial(character.gear.armor?.stats.special, 'regenOnKill')?.percent ?? 0
    const classDef = CLASS_DEFINITIONS[character.class]
    const ub = getUpgradeBonuses(character.upgrades ?? {})
    const activeSet = getActiveSet(character.gear.weapon, character.gear.armor)
    const setRegenBonus = activeSet?.bonus.type === 'hp_regen_pct' ? activeSet.bonus.value : 0
    const totalRegenChance = Math.min(0.9, classDef.passives.regenChance + regenOnKillBonus + ub.regenOnKillBonus + setRegenBonus)
    if (Math.random() < totalRegenChance) {
      const regenPower = classDef.passives.regenPower ?? 1
      const healAmt = Math.floor(calcRegenAmount(character.maxHP) * regenPower)
      character.currentHP = Math.min(character.maxHP, character.currentHP + healAmt)
      this.emit({
        type: 'hp_regen',
        payload: { amount: healAmt, currentHP: character.currentHP },
      })
    }

    // Spawn next enemy — boss after threshold, otherwise normal
    if (!enemy.isBoss && this.state.killCount >= this.state.killsToNextBoss) {
      const boss = getBossForZone(this.state.zone)
      this.state.enemy = boss
      this.emit({ type: 'boss_spawned', payload: { enemy: boss } })
    } else {
      const newEnemy = spawnEnemy(this.state.zone)
      this.state.enemy = newEnemy
      this.emit({ type: 'enemy_spawned', payload: { enemy: newEnemy } })
    }

    this.schedulePlayerTick()
    this.scheduleEnemyTick()
  }
}

// Reuse rollDamage for integer range — same formula, named clearly in context
function rollDamage(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default CombatEngine
