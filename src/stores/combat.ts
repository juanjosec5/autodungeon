import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { Enemy, CombatLogEntry } from '../types/index'
import CombatEngine from '../game/engine'
import type { CombatEvent } from '../game/engine'
import { spawnEnemy } from '../game/enemies'
import { useCharacterStore } from './character'
import { useZoneStore } from './zone'
import { useSaveStore } from './save'
import { useAchievementStore } from './achievement'

const MAX_LOG = 100

function loadSpeed(): 0.5 | 1 | 2 | 4 {
  const saved = localStorage.getItem('combatSpeed')
  if (saved === '0.5' || saved === '1' || saved === '2' || saved === '4') {
    return Number(saved) as 0.5 | 1 | 2 | 4
  }
  return 1
}

export const useCombatStore = defineStore('combat', () => {
  const engine = new CombatEngine()
  const currentEnemy = ref<Enemy | null>(null)
  const combatLog = ref<CombatLogEntry[]>([])
  const isRunning = ref(false)
  const isPaused = ref(false)
  const speed = ref<0.5 | 1 | 2 | 4>(loadSpeed())
  const enemyHitFlash = ref(0)
  const enemyAttackShake = ref(0)
  const lastEnemyDamage = ref(0)
  const lastEnemyCrit = ref(false)
  const enemySpawnCounter = ref(0)
  const isBossActive = ref(false)
  const killCount = ref(0)
  const killsToNextBoss = ref(12)

  // Floating number triggers
  const playerMissFlash = ref(0)
  const lifestealFlash = ref(0)
  const lastLifestealAmount = ref(0)
  const regenFlash = ref(0)
  const lastRegenAmount = ref(0)

  // ── Session stats (resets on page load) ──────────────────────────────────

  const session = reactive({
    kills: 0,
    bossKills: 0,
    itemsLooted: 0,
    goldEarned: 0,
  })

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
      case 'player_hit': {
        const dmg = p.damage as number
        if (currentEnemy.value) {
          currentEnemy.value = { ...currentEnemy.value, hp: p.enemyHP as number }
        }
        lastEnemyDamage.value = dmg
        lastEnemyCrit.value = false
        enemyHitFlash.value++
        characterStore.updateLifetime({ damageDealt: dmg, highestHit: dmg })
        useAchievementStore().trackDamage(useZoneStore().activeZone, dmg)
        if (p.lifestealHeal) {
          lastLifestealAmount.value = p.lifestealHeal as number
          lifestealFlash.value++
        }
        addLogEntry({
          type: 'hit',
          message: `You hit ${p.enemyName} for ${dmg} damage. (${p.enemyHP}/${p.enemyMaxHP})`,
        })
        break
      }

      case 'player_crit': {
        const dmg = p.damage as number
        if (currentEnemy.value) {
          currentEnemy.value = { ...currentEnemy.value, hp: p.enemyHP as number }
        }
        lastEnemyDamage.value = dmg
        lastEnemyCrit.value = true
        enemyHitFlash.value++
        characterStore.updateLifetime({ damageDealt: dmg, highestHit: dmg })
        useAchievementStore().trackDamage(useZoneStore().activeZone, dmg)
        useAchievementStore().trackCrit(useZoneStore().activeZone)
        if (p.lifestealHeal) {
          lastLifestealAmount.value = p.lifestealHeal as number
          lifestealFlash.value++
        }
        addLogEntry({
          type: 'crit',
          message: `⚡ CRIT! You hit ${p.enemyName} for ${dmg} damage!`,
        })
        break
      }

      case 'player_miss':
        playerMissFlash.value++
        addLogEntry({ type: 'miss', message: `You missed ${p.enemyName}.` })
        break

      case 'enemy_hit':
        enemyAttackShake.value++
        characterStore.updateLifetime({ damageReceived: p.damage as number })
        addLogEntry({
          type: 'hit',
          message: `${p.enemyName} hits you for ${p.damage} damage. (${p.playerHP}/${p.playerMaxHP})`,
        })
        break

      case 'enemy_dead': {
        const bossKill = p.isBoss as boolean | undefined
        addLogEntry({ type: 'hit', message: `💀 ${p.enemyName} has been slain!` })
        useAchievementStore().trackKill(useZoneStore().activeZone, p.enemyId as string, bossKill ?? false)
        if (bossKill) {
          session.bossKills++
          characterStore.updateLifetime({ bossKills: 1 })
        } else {
          session.kills++
          killCount.value = engine.getKillCount()
          killsToNextBoss.value = engine.getKillsToNextBoss()
          characterStore.updateLifetime({ kills: 1 })
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
          _triggerSave()
        }
        break
      }

      case 'loot_dropped': {
        const item = p.item as import('../types/index').Item
        import('./loot').then(({ useLootStore }) => {
          useLootStore().lastDroppedItem = item
        })
        const isBossLoot = p.isBossLoot as boolean | undefined
        const result = characterStore.addToInventory(item)
        if (result.sold) {
          const gold = result.gold
          session.goldEarned += gold
          characterStore.updateLifetime({ goldEarned: gold })
          if (result.reason === 'scrap') {
            characterStore.updateLifetime({ itemsScrapped: 1 })
            addLogEntry({ type: 'sell', message: `🗑 Auto-scrapped ${item.name} for ${gold}g` })
          } else {
            addLogEntry({ type: 'sell', message: `💰 Inventory full — sold ${item.name} for ${gold}g` })
          }
        } else {
          session.itemsLooted++
          characterStore.updateLifetime({ itemsLooted: 1 })
          if (result.equipped) {
            addLogEntry({ type: 'loot', message: `⚡ Auto-equipped ${item.name} (${item.rarity})` })
          } else {
            const prefix = isBossLoot ? '👑 Boss drop' : '🎁 Loot'
            addLogEntry({ type: 'loot', message: `${prefix}: ${item.name} (${item.rarity})` })
          }
        }
        _triggerSave()
        break
      }

      case 'enemy_spawned':
        setTimeout(() => {
          currentEnemy.value = p.enemy as Enemy
          enemySpawnCounter.value++
        }, 220)
        break

      case 'hp_regen':
        lastRegenAmount.value = p.amount as number
        regenFlash.value++
        addLogEntry({
          type: 'regen',
          message: `💚 Recovered ${p.amount} HP. (${p.currentHP}/${characterStore.character?.maxHP})`,
        })
        break

      case 'player_dead': {
        const char = characterStore.character!
        // Preview losses for log message, then apply
        const xpLoss = Math.floor(char.xp * 0.1)
        const goldLoss = Math.floor(char.gold * 0.15)
        characterStore.applyDeathPenalty()
        characterStore.updateLifetime({ deaths: 1 })
        addLogEntry({
          type: 'death',
          message: `☠️ You were slain by ${p.enemyName}! Lost ${xpLoss}xp and ${goldLoss}g.`,
        })
        _triggerSave()
        isRunning.value = false
        setTimeout(() => restartCombat(), 2000)
        break
      }

    }
  }

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
    localStorage.setItem('combatSpeed', String(s))
  }

  function restartCombat(): void {
    stopCombat()
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
    playerMissFlash,
    lifestealFlash,
    lastLifestealAmount,
    regenFlash,
    lastRegenAmount,
    session,
    startCombat,
    stopCombat,
    pauseCombat,
    resumeCombat,
    setSpeed,
    restartCombat,
    addLogEntry,
  }
})
