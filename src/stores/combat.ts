import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Enemy, CombatLogEntry } from '../types/index'
import CombatEngine from '../game/engine'
import type { CombatEvent } from '../game/engine'
import { spawnEnemy } from '../game/enemies'
import { useCharacterStore } from './character'
import { useZoneStore } from './zone'
import { useSaveStore } from './save'

const MAX_LOG = 100

export const useCombatStore = defineStore('combat', () => {
  const engine = new CombatEngine()
  const currentEnemy = ref<Enemy | null>(null)
  const combatLog = ref<CombatLogEntry[]>([])
  const isRunning = ref(false)
  const isPaused = ref(false)
  const speed = ref<0.5 | 1 | 2 | 4>(1)
  const enemyHitFlash = ref(0)    // incremented when player lands a hit
  const enemyAttackShake = ref(0) // incremented when enemy attacks
  const lastEnemyDamage = ref(0)  // damage value of last player hit
  const lastEnemyCrit = ref(false)
  const enemySpawnCounter = ref(0) // incremented on each new enemy spawn
  const isBossActive = ref(false)
  const killCount = ref(0)
  const killsToNextBoss = ref(12)

  // ── Log helper ────────────────────────────────────────────────────────────

  function addLogEntry(entry: Omit<CombatLogEntry, 'id' | 'timestamp'>): void {
    const full: CombatLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    combatLog.value.push(full)
    if (combatLog.value.length > MAX_LOG) combatLog.value.shift()
  }

  // ── Engine event handler ──────────────────────────────────────────────────

  function handleEvent(event: CombatEvent): void {
    const characterStore = useCharacterStore()
    const p = event.payload

    switch (event.type) {
      case 'player_hit':
        if (currentEnemy.value) {
          currentEnemy.value = { ...currentEnemy.value, hp: p.enemyHP as number }
        }
        lastEnemyDamage.value = p.damage as number
        lastEnemyCrit.value = false
        enemyHitFlash.value++
        addLogEntry({
          type: 'hit',
          message: `You hit ${p.enemyName} for ${p.damage} damage. (${p.enemyHP}/${p.enemyMaxHP})`,
        })
        break

      case 'player_crit':
        if (currentEnemy.value) {
          currentEnemy.value = { ...currentEnemy.value, hp: p.enemyHP as number }
        }
        lastEnemyDamage.value = p.damage as number
        lastEnemyCrit.value = true
        enemyHitFlash.value++
        addLogEntry({
          type: 'crit',
          message: `⚡ CRIT! You hit ${p.enemyName} for ${p.damage} damage!`,
        })
        break

      case 'player_miss':
        addLogEntry({ type: 'miss', message: `You missed ${p.enemyName}.` })
        break

      case 'enemy_hit':
        enemyAttackShake.value++
        addLogEntry({
          type: 'hit',
          message: `${p.enemyName} hits you for ${p.damage} damage. (${p.playerHP}/${p.playerMaxHP})`,
        })
        break

      case 'enemy_dead': {
        const bossKill = p.isBoss as boolean | undefined
        addLogEntry({ type: 'hit', message: `💀 ${p.enemyName} has been slain!` })
        if (!bossKill) {
          killCount.value = engine.getKillCount()
          killsToNextBoss.value = engine.getKillsToNextBoss()
        }
        break
      }

      case 'boss_spawned': {
        isBossActive.value = true
        killCount.value = 0
        killsToNextBoss.value = engine.getKillsToNextBoss()
        addLogEntry({ type: 'zone', message: `⚠️ BOSS: ${(p.enemy as import('../types/index').Enemy).name} approaches!` })
        setTimeout(() => {
          currentEnemy.value = p.enemy as import('../types/index').Enemy
          enemySpawnCounter.value++
        }, 220)
        break
      }

      case 'boss_defeated': {
        isBossActive.value = false
        killCount.value = 0
        killsToNextBoss.value = engine.getKillsToNextBoss()
        addLogEntry({ type: 'levelup', message: `👑 ${p.enemyName} defeated! Guaranteed loot incoming...` })
        break
      }

      case 'xp_gained': {
        addLogEntry({ type: 'hit', message: `✨ +${p.amount} XP` })
        const levelsGained = characterStore.applyXP(p.amount as number)
        if (levelsGained > 0) {
          addLogEntry({
            type: 'levelup',
            message: `🎉 Level up! You are now level ${characterStore.character!.level}!`,
          })
          engine.updateCharacter(characterStore.character!)
          // Trigger save
          _triggerSave()
        }
        break
      }

      case 'loot_dropped': {
        const item = p.item as import('../types/index').Item
        // Keep lootStore.lastDroppedItem reactive for UI observers
        import('./loot').then(({ useLootStore }) => {
          useLootStore().lastDroppedItem = item
        })
        const isBossLoot = p.isBossLoot as boolean | undefined
        const result = characterStore.addToInventory(item)
        if (result.sold) {
          const msg = result.reason === 'scrap'
            ? `🗑 Auto-scrapped ${item.name} for ${result.gold}g`
            : `💰 Inventory full — sold ${item.name} for ${result.gold}g`
          addLogEntry({ type: 'sell', message: msg })
        } else {
          const prefix = isBossLoot ? '👑 Boss drop' : '🎁 Loot'
          addLogEntry({
            type: 'loot',
            message: `${prefix}: ${item.name} (${item.rarity})`,
          })
        }
        _triggerSave()
        break
      }

      case 'enemy_spawned':
        // Brief delay so the HP bar animates to 0% before the new enemy appears
        setTimeout(() => {
          currentEnemy.value = p.enemy as Enemy
          enemySpawnCounter.value++
        }, 220)
        break

      case 'hp_regen':
        addLogEntry({
          type: 'regen',
          message: `💚 Recovered ${p.amount} HP. (${p.currentHP}/${characterStore.character?.maxHP})`,
        })
        break

      case 'player_dead': {
        const char = characterStore.character!
        const xpLoss = Math.floor(char.xp * 0.1)
        const goldLoss = Math.floor(char.gold * 0.15)
        addLogEntry({
          type: 'death',
          message: `☠️ You were slain by ${p.enemyName}! Lost ${xpLoss}xp and ${goldLoss}g.`,
        })
        characterStore.applyDeathPenalty()
        _triggerSave()
        isRunning.value = false
        setTimeout(() => restartCombat(), 2000)
        break
      }

      case 'zone_cleared':
        // Reserved for MVP
        break
    }
  }

  // Register handler once on store init
  engine.on(handleEvent)

  // ── Private helpers ───────────────────────────────────────────────────────

  function _triggerSave(): void {
    useSaveStore().saveCharacter()
  }

  // ── Public actions ────────────────────────────────────────────────────────

  function startCombat(): void {
    const characterStore = useCharacterStore()
    const zoneStore = useZoneStore()
    const char = characterStore.character
    if (!char) return

    const enemy = spawnEnemy(zoneStore.activeZone)
    currentEnemy.value = enemy

    engine.start({
      character: char,
      enemy,
      zone: zoneStore.activeZone,
      speed: speed.value,
      isPaused: false,
    })

    isRunning.value = true
    isPaused.value = false

    addLogEntry({
      type: 'zone',
      message: `⚔️ Entering the ${zoneStore.activeZone}...`,
    })
  }

  function stopCombat(): void {
    engine.stop()
    isRunning.value = false
    isPaused.value = false
    isBossActive.value = false
    killCount.value = 0
    killsToNextBoss.value = 12
  }

  function pauseCombat(): void {
    engine.pause()
    isPaused.value = true
  }

  function resumeCombat(): void {
    engine.resume()
    isPaused.value = false
  }

  function setSpeed(s: 0.5 | 1 | 2 | 4): void {
    speed.value = s
    engine.setSpeed(s)
  }

  function restartCombat(): void {
    stopCombat()
    // Brief delay so stop clears timers before start re-arms them
    setTimeout(() => startCombat(), 100)
  }

  return {
    currentEnemy,
    combatLog,
    isRunning,
    isPaused,
    speed,
    enemyHitFlash,
    enemyAttackShake,
    lastEnemyDamage,
    lastEnemyCrit,
    enemySpawnCounter,
    isBossActive,
    killCount,
    killsToNextBoss,
    startCombat,
    stopCombat,
    pauseCombat,
    resumeCombat,
    setSpeed,
    restartCombat,
    addLogEntry,
  }
})
