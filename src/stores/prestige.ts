import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PrestigeBonusId, PrestigeState } from '../types/index'
import { getStatsAtLevel, getXPToNextLevel } from '../game/classes'
import { useCharacterStore } from './character'
import { useTaskStore } from './tasks'

const LS_PRESTIGE_KEY = 'autodungeon_prestige'

export interface BonusDef {
  cost: number
  maxStacks: number
  label: string
  effect: string
  icon: string
}

export const usePrestigeStore = defineStore('prestige', () => {
  const prestigeCount = ref(0)
  const ascensionTokens = ref(0)
  const totalTokensEarned = ref(0)
  const bonuses = ref<Partial<Record<PrestigeBonusId, number>>>({})

  // ── Computed multipliers ────────────────────────────────────────────────────

  const xpMultiplier = computed(() => 1 + (bonuses.value.xpBoost ?? 0) * 0.2)
  const goldMultiplier = computed(() => 1 + (bonuses.value.goldBoost ?? 0) * 0.2)
  const offlineEfficiencyBonus = computed(() => (bonuses.value.offlineEfficiency ?? 0) * 0.1)
  const startingLevel = computed(() => {
    const stacks = bonuses.value.startingLevel ?? 0
    return stacks > 0 ? stacks * 5 : 1
  })
  const hpMultiplier = computed(() => 1 + (bonuses.value.hpBonus ?? 0) * 0.1)
  const dropRateBonus = computed(() => (bonuses.value.dropRateBonus ?? 0) * 0.1)

  // ── Bonus definitions ───────────────────────────────────────────────────────

  const BONUS_DEFS: Record<PrestigeBonusId, BonusDef> = {
    xpBoost:           { cost: 2,  maxStacks: 5,  label: 'XP Boost',          effect: '+20% XP per stack',            icon: '✨' },
    goldBoost:         { cost: 2,  maxStacks: 5,  label: 'Gold Boost',         effect: '+20% gold per stack',          icon: '💰' },
    offlineEfficiency: { cost: 3,  maxStacks: 10, label: 'Offline Efficiency', effect: '+10% offline kill rate/stack', icon: '⏳' },
    startingLevel:     { cost: 5,  maxStacks: 5,  label: 'Head Start',         effect: 'Start at level 5, 10, 15...',  icon: '🚀' },
    hpBonus:           { cost: 2,  maxStacks: 10, label: 'Vitality',           effect: '+10% max HP per stack',        icon: '❤' },
    dropRateBonus:     { cost: 4,  maxStacks: 5,  label: 'Fortune',            effect: '+10% drop chance/stack',       icon: '🎁' },
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function buyBonus(id: PrestigeBonusId): boolean {
    const def = BONUS_DEFS[id]
    const current = bonuses.value[id] ?? 0
    if (current >= def.maxStacks) return false
    if (ascensionTokens.value < def.cost) return false
    ascensionTokens.value -= def.cost
    bonuses.value = { ...bonuses.value, [id]: current + 1 }
    savePrestige()
    return true
  }

  function prestige(): void {
    const characterStore = useCharacterStore()
    const char = characterStore.character
    if (!char || char.level < 50) return

    const tokensEarned = Math.floor(char.level / 10)
    ascensionTokens.value += tokensEarned
    totalTokensEarned.value += tokensEarned
    prestigeCount.value++
    useTaskStore().updateTracker({ prestigesDone: 1 })

    // Preserve persistent data before reset
    const charId = char.id
    const lifetime = { ...char.lifetime }
    const discoveredItems = [...(char.discoveredItems ?? [])]
    const charName = char.name
    const charClass = char.class

    // Full character reset (zone challenges reset so set items can be re-earned)
    characterStore.createCharacter(charName, charClass)

    // Restore persistent data — keep the same ID so the save slot is overwritten
    const newChar = characterStore.character
    if (newChar) {
      newChar.id = charId
      newChar.lifetime = lifetime
      newChar.discoveredItems = discoveredItems

      // Apply startingLevel bonus
      const sl = startingLevel.value
      if (sl > 1) {
        newChar.level = sl
        const stats = getStatsAtLevel(newChar.class, sl)
        newChar.stats = { str: stats.str, dex: stats.dex, int: stats.int }
        newChar.maxHP = Math.floor(stats.maxHP * hpMultiplier.value)
        newChar.currentHP = newChar.maxHP
        newChar.xpToNext = getXPToNextLevel(sl)
        newChar.pendingLevelUps = sl - 1  // upgrade picks for each skipped level
      }
    }

    savePrestige()
  }

  function addTokens(amount: number): void {
    ascensionTokens.value += amount
    totalTokensEarned.value += amount
    savePrestige()
  }

  function savePrestige(): void {
    localStorage.setItem(LS_PRESTIGE_KEY, JSON.stringify({
      prestigeCount: prestigeCount.value,
      ascensionTokens: ascensionTokens.value,
      totalTokensEarned: totalTokensEarned.value,
      bonuses: bonuses.value,
    } satisfies PrestigeState))
  }

  function loadPrestige(): void {
    const raw = localStorage.getItem(LS_PRESTIGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw) as Partial<PrestigeState>
      prestigeCount.value = data.prestigeCount ?? 0
      ascensionTokens.value = data.ascensionTokens ?? 0
      totalTokensEarned.value = data.totalTokensEarned ?? 0
      bonuses.value = data.bonuses ?? {}
    } catch {
      // Corrupt data — ignore
    }
  }

  return {
    prestigeCount,
    ascensionTokens,
    totalTokensEarned,
    bonuses,
    xpMultiplier,
    goldMultiplier,
    offlineEfficiencyBonus,
    startingLevel,
    hpMultiplier,
    dropRateBonus,
    BONUS_DEFS,
    addTokens,
    buyBonus,
    prestige,
    savePrestige,
    loadPrestige,
  }
})
