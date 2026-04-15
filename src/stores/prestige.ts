import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PrestigeBonusId, PrestigeState, AscensionBonusId, ClassId } from '../types/index'
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

const CLASS_ASCENSION_BONUS: Record<ClassId, { id: AscensionBonusId; maxStacks: number; label: string; description: string }> = {
  warrior:   { id: 'overkill',      maxStacks: 5, label: 'Overkill',       description: 'Excess damage on kill carries to next enemy (50% cap)' },
  rogue:     { id: 'ghost-strike',  maxStacks: 5, label: 'Ghost Strike',   description: '+3% hit chance per stack (max +15%)' },
  mage:      { id: 'arcane-surge',  maxStacks: 5, label: 'Arcane Surge',   description: '+5% chance to double XP from a kill per stack' },
  priest:    { id: 'blessed-regen', maxStacks: 5, label: 'Blessed Regen',  description: '+1 HP regenerated per second per stack' },
  undead:    { id: 'death-pact',    maxStacks: 3, label: 'Death Pact',     description: 'Survive a lethal hit with 1 HP (resets per zone)' },
  dragonkin: { id: 'dragon-scales', maxStacks: 5, label: 'Dragon Scales',  description: '+2% damage reduction per stack (max 10%)' },
}

export { CLASS_ASCENSION_BONUS }

export const usePrestigeStore = defineStore('prestige', () => {
  const prestigeCount = ref(0)
  const ascensionTokens = ref(0)
  const totalTokensEarned = ref(0)
  const bonuses = ref<Partial<Record<PrestigeBonusId, number>>>({})
  const ascensionBonuses = ref<Partial<Record<AscensionBonusId, number>>>({})

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

  // ── Ascension bonus computed getters ────────────────────────────────────────
  const hitChanceBonus     = computed(() => (ascensionBonuses.value['ghost-strike']  ?? 0) * 0.03)
  const xpDoubleChance     = computed(() => (ascensionBonuses.value['arcane-surge']  ?? 0) * 0.05)
  const passiveRegenPerSec = computed(() => ascensionBonuses.value['blessed-regen']  ?? 0)
  const damageReduction    = computed(() => (ascensionBonuses.value['dragon-scales'] ?? 0) * 0.02)
  const deathPactSaves     = computed(() => ascensionBonuses.value['death-pact']     ?? 0)
  const overkillStacks     = computed(() => ascensionBonuses.value['overkill']       ?? 0)

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

    // Award class-specific ascension bonus
    const cb = CLASS_ASCENSION_BONUS[char.class]
    const cur = ascensionBonuses.value[cb.id] ?? 0
    if (cur < cb.maxStacks) {
      ascensionBonuses.value[cb.id] = cur + 1
    }

    // Preserve persistent data before reset
    const charId = char.id
    const lifetime = { ...char.lifetime }
    const discoveredItems = [...(char.discoveredItems ?? [])]
    const charName = char.name
    const charClass = char.class
    const savedUpgrades = { ...(char.upgrades ?? {}) }

    // Full character reset (zone challenges reset so set items can be re-earned)
    characterStore.createCharacter(charName, charClass)

    // Restore persistent data — keep the same ID so the save slot is overwritten
    const newChar = characterStore.character
    if (newChar) {
      newChar.id = charId
      newChar.lifetime = lifetime
      newChar.discoveredItems = discoveredItems

      // Restore all spent skill-point upgrades
      newChar.upgrades = savedUpgrades

      // Re-apply the four upgrades that bake mutations directly into char.stats
      // (all others are read at combat time via getUpgradeBonuses so need no re-application)
      newChar.stats.str += (savedUpgrades['str-up'] ?? 0) * 2
      newChar.stats.dex += (savedUpgrades['dex-up'] ?? 0) * 2
      newChar.stats.int += (savedUpgrades['int-up'] ?? 0) * 2
      const hpFromUpgrades = (savedUpgrades['hp-up'] ?? 0) * 15
      newChar.maxHP += hpFromUpgrades
      newChar.currentHP = newChar.maxHP

      // Apply startingLevel bonus — grant skill points for skipped levels
      const sl = startingLevel.value
      if (sl > 1) {
        newChar.level = sl
        const stats = getStatsAtLevel(newChar.class, sl)
        newChar.stats.str = stats.str + (savedUpgrades['str-up'] ?? 0) * 2
        newChar.stats.dex = stats.dex + (savedUpgrades['dex-up'] ?? 0) * 2
        newChar.stats.int = stats.int + (savedUpgrades['int-up'] ?? 0) * 2
        newChar.maxHP = Math.floor(stats.maxHP * hpMultiplier.value) + hpFromUpgrades
        newChar.currentHP = newChar.maxHP
        newChar.xpToNext = getXPToNextLevel(sl)
        newChar.skillPoints = (newChar.skillPoints ?? 0) + (sl - 1)
        newChar.pendingLevelUps = 0
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
      ascensionBonuses: ascensionBonuses.value,
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
      ascensionBonuses.value = data.ascensionBonuses ?? {}
    } catch {
      // Corrupt data — ignore
    }
  }

  return {
    prestigeCount,
    ascensionTokens,
    totalTokensEarned,
    bonuses,
    ascensionBonuses,
    xpMultiplier,
    goldMultiplier,
    offlineEfficiencyBonus,
    startingLevel,
    hpMultiplier,
    dropRateBonus,
    hitChanceBonus,
    xpDoubleChance,
    passiveRegenPerSec,
    damageReduction,
    deathPactSaves,
    overkillStacks,
    BONUS_DEFS,
    addTokens,
    buyBonus,
    prestige,
    savePrestige,
    loadPrestige,
  }
})
