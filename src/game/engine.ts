import type { Character, Enemy, ZoneId } from '../types/index'
import { d20, calcHit, calcCrit, calcPlayerDamage, calcEnemyDamage, calcRegenAmount } from './formulas'
import { rollLoot, rollBossLoot } from './items'
import { CLASS_DEFINITIONS } from './classes'
import { spawnEnemy, getBossForZone } from './enemies'

// ─── Exported types ───────────────────────────────────────────────────────────

export interface CombatState {
  character: Character
  enemy: Enemy
  zone: ZoneId
  speed: number
  isPaused: boolean
  killCount: number        // normal kills since last boss
  killsToNextBoss: number  // threshold, rerolled after each boss
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
  | 'zone_cleared'

export interface CombatEvent {
  type: CombatEventType
  payload: Record<string, unknown>
}

export type CombatEventHandler = (event: CombatEvent) => void

// ─── CombatEngine ─────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

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
      killCount: 0,
      killsToNextBoss: randomBetween(10, 15),
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
    const baseInterval = CLASS_DEFINITIONS[character.class].attackSpeed
    const bonus =
      (weapon?.stats.special?.find((s) => s.type === 'attackSpeedBonus') as
        | { type: 'attackSpeedBonus'; percent: number }
        | undefined)?.percent ?? 0
    return Math.floor((baseInterval * (1 - bonus)) / speed)
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

    // Def ignore
    const classDef = CLASS_DEFINITIONS[character.class]
    const baseDefIgnore = classDef.passives.defIgnore ?? 0
    const weaponDefIgnore =
      (weapon?.stats.special?.find((s) => s.type === 'defIgnore') as
        | { type: 'defIgnore'; percent: number }
        | undefined)?.percent ?? 0
    const defIgnorePercent = Math.min(0.9, baseDefIgnore + weaponDefIgnore)

    // Crit threshold from weapon
    const extraCritThreshold =
      (weapon?.stats.special?.find((s) => s.type === 'critThreshold') as
        | { type: 'critThreshold'; rollsAt: number }
        | undefined)?.rollsAt

    const roll = d20()
    const hits = calcHit(character.stats.dex, enemy.def)
    const isCrit = hits && calcCrit(roll, character.stats.dex, character.class, extraCritThreshold)

    if (!hits) {
      this.emit({ type: 'player_miss', payload: { enemyName: enemy.name } })
    } else {
      // Poison special
      const poisonSpecial = weapon?.stats.special?.find((s) => s.type === 'poison') as
        | { type: 'poison'; dpsMultiplier: number }
        | undefined

      const dmgParams = {
        classId: character.class,
        str: character.stats.str,
        int: character.stats.int,
        weapon,
        isCrit,
        enemyDef: enemy.def,
        defIgnorePercent,
      }

      let damage = calcPlayerDamage(dmgParams)

      // Poison
      let poisonDamage: number | undefined
      if (poisonSpecial) {
        poisonDamage = Math.max(1, Math.floor(damage * poisonSpecial.dpsMultiplier))
        enemy.hp -= poisonDamage
      }

      enemy.hp -= damage

      const eventType = isCrit ? 'player_crit' : 'player_hit'
      this.emit({
        type: eventType,
        payload: {
          damage,
          poisonDamage,
          enemyName: enemy.name,
          enemyHP: enemy.hp,
          enemyMaxHP: enemy.maxHp,
        },
      })

      // Lifesteal
      const lifestealSpecial = weapon?.stats.special?.find((s) => s.type === 'lifesteal') as
        | { type: 'lifesteal'; value: number }
        | undefined
      if (lifestealSpecial) {
        const heal = Math.floor(damage * lifestealSpecial.value)
        character.currentHP = Math.min(character.maxHP, character.currentHP + heal)
      }

      // Doublecast (mage only)
      if (character.class === 'mage') {
        const doublecastSpecial = weapon?.stats.special?.find((s) => s.type === 'doublecast') as
          | { type: 'doublecast'; chance: number }
          | undefined
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

    // Dodge
    const dodgeChance =
      (character.gear.armor?.stats.special?.find((s) => s.type === 'dodge') as
        | { type: 'dodge'; chance: number }
        | undefined)?.chance ?? 0
    if (Math.random() < dodgeChance) {
      this.scheduleEnemyTick()
      return
    }

    // Block
    const blockChance =
      (character.gear.armor?.stats.special?.find((s) => s.type === 'block') as
        | { type: 'block'; chance: number }
        | undefined)?.chance ?? 0
    if (Math.random() < blockChance) {
      this.scheduleEnemyTick()
      return
    }

    // Player DEF
    const armorDef = character.gear.armor?.stats.defBonus ?? 0
    const warriorBonus = character.class === 'warrior' ? armorDef * 0.1 : 0
    const playerDef = Math.floor(armorDef + warriorBonus)

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
    this.emit({ type: 'enemy_dead', payload: { enemyName: enemy.name, isBoss: enemy.isBoss ?? false } })

    // XP
    this.emit({ type: 'xp_gained', payload: { amount: enemy.xpReward } })

    // Loot — boss gets guaranteed weapon drop on top of regular loot
    if (enemy.isBoss) {
      const bonusItem = rollBossLoot(this.state.zone)
      this.emit({ type: 'loot_dropped', payload: { item: bonusItem, isBossLoot: true } })
      this.emit({ type: 'boss_defeated', payload: { enemyName: enemy.name } })
      this.state.killCount = 0
      this.state.killsToNextBoss = randomBetween(10, 15)
    } else {
      const item = rollLoot(this.state.zone, enemy.id)
      this.emit({ type: 'loot_dropped', payload: { item } })
      this.state.killCount++
    }

    // Regen on kill
    const classDef = CLASS_DEFINITIONS[character.class]
    const regenOnKillBonus =
      (character.gear.armor?.stats.special?.find((s) => s.type === 'regenOnKill') as
        | { type: 'regenOnKill'; percent: number }
        | undefined)?.percent ?? 0
    const totalRegenChance = Math.min(0.9, classDef.passives.regenChance + regenOnKillBonus)
    if (Math.random() < totalRegenChance) {
      const healAmt = calcRegenAmount(character.maxHP)
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

export default CombatEngine
