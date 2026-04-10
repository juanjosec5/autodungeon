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
        addLogEntry({
          type: 'hit',
          message: `You hit ${p.enemyName} for ${p.damage} damage. (${p.enemyHP}/${p.enemyMaxHP})`,
        })
        break

      case 'player_crit':
        addLogEntry({
          type: 'crit',
          message: `⚡ CRIT! You hit ${p.enemyName} for ${p.damage} damage!`,
        })
        break

      case 'player_miss':
        addLogEntry({ type: 'miss', message: `You missed ${p.enemyName}.` })
        break

      case 'enemy_hit':
        addLogEntry({
          type: 'hit',
          message: `${p.enemyName} hits you for ${p.damage} damage. (${p.playerHP}/${p.playerMaxHP})`,
        })
        break

      case 'enemy_dead': {
        addLogEntry({ type: 'hit', message: `💀 ${p.enemyName} has been slain!` })
        // Sync reactive enemy ref after engine spawns the next one
        // engine.state is updated internally; we read it on xp_gained which fires right after
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
        const result = characterStore.addToInventory(item)
        if (result.sold) {
          addLogEntry({
            type: 'sell',
            message: `💰 Inventory full — sold ${item.name} for ${result.gold}g`,
          })
        } else {
          addLogEntry({
            type: 'loot',
            message: `🎁 Loot: ${item.name} (${item.rarity})`,
          })
        }
        _triggerSave()
        break
      }

      case 'enemy_spawned':
        currentEnemy.value = p.enemy as Enemy
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
    startCombat,
    stopCombat,
    pauseCombat,
    resumeCombat,
    setSpeed,
    restartCombat,
    addLogEntry,
  }
})
