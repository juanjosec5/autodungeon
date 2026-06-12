import type { Character, Enemy, ZoneId, RarityId } from '../types/index'
import { rollDamage } from './formulas'
import { rollLoot, rollBisLoot, blankPity, DROP_CHANCE, BIS_CHANCE, PITY_BIS } from './items'
import { spawnEnemy, getBossForZone } from './enemies'
import { playerAttackIntervalMs, resolvePlayerAttack, resolveEnemyAttack, resolveKillRegen, type CombatBuffs } from './combat-core'
import { useShopStore } from '../stores/shop'

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
  difficultyTier: number   // NG+ tier (= prestige count): scales enemy HP/ATK/rewards
  lootMasteryFloor?: RarityId  // prestige Loot Mastery: minimum drop rarity
  // Ascension bonuses
  hitChanceBonus: number       // ghost-strike: +3% hit chance per stack
  damageReduction: number      // dragon-scales: +2% DR per stack
  overkillStacks: number       // >0 = overkill carry active
  overkillCarryPct: number     // fraction of excess kill damage carried over
  passiveRegenPct: number      // blessed-regen: fraction of max HP healed per second
  deathPactSaves: number       // remaining death pact saves this zone
  overkillCarry: number        // internal: excess damage carried to next enemy
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
  private regenTimer: ReturnType<typeof setInterval> | null = null
  private handlers: CombatEventHandler[] = []
  private isDead = false

  // ── Public API ──────────────────────────────────────────────────────────────

  start(state: Omit<CombatState, 'killCount' | 'killsToNextBoss' | 'overkillCarry'>): void {
    this.state = {
      ...state,
      dropRateBonus:       state.dropRateBonus ?? 0,
      difficultyTier:      state.difficultyTier ?? 0,
      hitChanceBonus:      state.hitChanceBonus ?? 0,
      damageReduction:     state.damageReduction ?? 0,
      overkillStacks:      state.overkillStacks ?? 0,
      overkillCarryPct:    state.overkillCarryPct ?? 0,
      passiveRegenPct:     state.passiveRegenPct ?? 0,
      deathPactSaves:      state.deathPactSaves ?? 0,
      killCount: 0,
      killsToNextBoss: rollDamage(10, 15),
      overkillCarry: 0,
    }
    this.isDead = false
    this.startRegenTimer()
    this.schedulePlayerTick()
    this.scheduleEnemyTick()
  }

  stop(): void {
    if (this.playerTickTimer !== null) clearTimeout(this.playerTickTimer)
    if (this.enemyTickTimer !== null) clearTimeout(this.enemyTickTimer)
    this.stopRegenTimer()
    this.playerTickTimer = null
    this.enemyTickTimer = null
    this.state = null
  }

  pause(): void {
    if (!this.state) return
    this.state.isPaused = true
    if (this.playerTickTimer !== null) clearTimeout(this.playerTickTimer)
    if (this.enemyTickTimer !== null) clearTimeout(this.enemyTickTimer)
    this.stopRegenTimer()
    this.playerTickTimer = null
    this.enemyTickTimer = null
  }

  resume(): void {
    if (!this.state) return
    this.state.isPaused = false
    this.startRegenTimer()
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

  private startRegenTimer(): void {
    this.stopRegenTimer()
    if (!this.state || this.state.passiveRegenPct <= 0) return
    this.regenTimer = setInterval(() => {
      if (!this.state || this.state.isPaused || this.isDead) return
      const { character } = this.state
      // Percent of max HP per second so the bonus stays relevant at any level
      const amt = Math.max(1, Math.floor(this.state.passiveRegenPct * character.maxHP))
      character.currentHP = Math.min(character.maxHP, character.currentHP + amt)
      this.emit({ type: 'hp_regen', payload: { amount: amt, currentHP: character.currentHP } })
    }, 1000)
  }

  private stopRegenTimer(): void {
    if (this.regenTimer !== null) {
      clearInterval(this.regenTimer)
      this.regenTimer = null
    }
  }

  /** Live shop buffs + ascension bonuses packed for the shared combat core */
  private getBuffs(): CombatBuffs {
    const shop = useShopStore()
    return {
      shopDamageBonus: shop.damageBonus,
      shopDefBonus: shop.defBonus,
      shopAtkSpeedBonus: shop.atkSpeedBonus,
      hitChanceBonus: this.state?.hitChanceBonus ?? 0,
      damageReduction: this.state?.damageReduction ?? 0,
      ngTier: this.state?.difficultyTier ?? 0,
    }
  }

  private getPlayerAttackInterval(): number {
    if (!this.state) return 1000
    const { character, speed } = this.state
    const interval = playerAttackIntervalMs(character, useShopStore().atkSpeedBonus)
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

    const outcome = resolvePlayerAttack(character, enemy, this.getBuffs())

    if (!outcome.hit) {
      this.emit({ type: 'player_miss', payload: { enemyName: enemy.name } })
    } else {
      if (outcome.poisonDamage > 0) enemy.hp -= outcome.poisonDamage
      enemy.hp -= outcome.damage

      if (outcome.lifestealHeal > 0) {
        character.currentHP = Math.min(character.maxHP, character.currentHP + outcome.lifestealHeal)
      }

      this.emit({
        type: outcome.crit ? 'player_crit' : 'player_hit',
        payload: {
          damage: outcome.damage,
          poisonDamage: outcome.poisonDamage > 0 ? outcome.poisonDamage : undefined,
          lifestealHeal: outcome.lifestealHeal > 0 ? outcome.lifestealHeal : undefined,
          enemyName: enemy.name,
          enemyHP: enemy.hp,
          enemyMaxHP: enemy.maxHp,
        },
      })

      if (outcome.doublecastDamage > 0) {
        enemy.hp -= outcome.doublecastDamage
        this.emit({
          type: 'player_hit',
          payload: {
            damage: outcome.doublecastDamage,
            enemyName: enemy.name,
            enemyHP: enemy.hp,
            enemyMaxHP: enemy.maxHp,
          },
        })
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

    const outcome = resolveEnemyAttack(character, enemy, this.getBuffs())
    if (outcome.dodged || outcome.blocked) {
      this.scheduleEnemyTick()
      return
    }

    const { damage } = outcome
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
      // Death Pact: survive a lethal hit with 1 HP (resets per zone start)
      if ((this.state.deathPactSaves ?? 0) > 0) {
        this.state.deathPactSaves--
        character.currentHP = 1
        this.emit({ type: 'hp_regen', payload: { amount: 0, currentHP: 1 } })
        this.scheduleEnemyTick()
        return
      }
      this.isDead = true
      character.currentHP = 0
      if (this.playerTickTimer !== null) clearTimeout(this.playerTickTimer)
      if (this.enemyTickTimer !== null) clearTimeout(this.enemyTickTimer)
      this.stopRegenTimer()
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
    this.emit({
      type: 'enemy_dead',
      payload: {
        enemyId: enemy.id,
        enemyName: enemy.name,
        isBoss: enemy.isBoss ?? false,
        goldReward: Math.max(1, Math.round(enemy.xpReward * 0.35)),
      },
    })
    this.emit({ type: 'xp_gained', payload: { amount: enemy.xpReward } })

    // Loot — bosses always drop (with rarity floor); normal kills at DROP_CHANCE
    const dropBonus = this.state.dropRateBonus ?? 0
    const lootFloor = this.state.lootMasteryFloor
    const pity = (character.pity ??= blankPity())
    if (enemy.isBoss) {
      const regularItem = rollLoot(this.state.zone, enemy.id, dropBonus, pity, lootFloor)
      if (regularItem) this.emit({ type: 'loot_dropped', payload: { item: regularItem } })

      // BiS legendary: BIS_CHANCE per boss kill, hard pity at PITY_BIS kills
      pity.bossKillsSinceBis++
      if (Math.random() < BIS_CHANCE || pity.bossKillsSinceBis >= PITY_BIS) {
        const bisItem = rollBisLoot(this.state.zone)
        if (bisItem) {
          pity.bossKillsSinceBis = 0
          this.emit({ type: 'loot_dropped', payload: { item: bisItem, isBossLoot: true } })
        }
      }

      this.emit({ type: 'boss_defeated', payload: { enemyName: enemy.name } })
      this.state.killCount = 0
      this.state.killsToNextBoss = rollDamage(10, 15)
    } else {
      if (Math.random() < DROP_CHANCE) {
        const item = rollLoot(this.state.zone, enemy.id, dropBonus, pity, lootFloor)
        if (item) this.emit({ type: 'loot_dropped', payload: { item } })
      }
      this.state.killCount++
    }

    // Regen on kill: class base chance + armor bonus + upgrade bonus + set bonus
    const healAmt = resolveKillRegen(character)
    if (healAmt > 0) {
      character.currentHP = Math.min(character.maxHP, character.currentHP + healAmt)
      this.emit({
        type: 'hp_regen',
        payload: { amount: healAmt, currentHP: character.currentHP },
      })
    }

    // Overkill: carry a fraction of excess kill damage to the next normal enemy
    let overkillCarry = 0
    if ((this.state.overkillCarryPct ?? 0) > 0 && !enemy.isBoss && enemy.hp < 0) {
      overkillCarry = Math.floor(Math.abs(enemy.hp) * this.state.overkillCarryPct)
    }

    // Spawn next enemy — boss after threshold, otherwise normal
    if (!enemy.isBoss && this.state.killCount >= this.state.killsToNextBoss) {
      const boss = getBossForZone(this.state.zone, this.state.difficultyTier)
      this.state.enemy = boss
      this.emit({ type: 'boss_spawned', payload: { enemy: boss } })
    } else {
      const newEnemy = spawnEnemy(this.state.zone, this.state.difficultyTier)
      // Apply overkill carry to new enemy
      if (overkillCarry > 0) {
        newEnemy.hp -= overkillCarry
        if (newEnemy.hp <= 0) {
          this.state.enemy = newEnemy
          this.emit({ type: 'enemy_spawned', payload: { enemy: newEnemy } })
          this.handleEnemyDeath()
          return
        }
      }
      this.state.enemy = newEnemy
      this.emit({ type: 'enemy_spawned', payload: { enemy: newEnemy } })
    }

    this.schedulePlayerTick()
    this.scheduleEnemyTick()
  }
}


export default CombatEngine
