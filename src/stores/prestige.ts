import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PrestigeBonusId, PrestigeState, AscensionBonusId, ClassId } from '../types/index'
import { getXPToNextLevel } from '../game/classes'
import { useCharacterStore } from './character'
import { useTaskStore } from './tasks'

const LS_PRESTIGE_KEY = 'autodungeon_prestige'

export interface BonusDef {
  cost: number       // base cost — escalates per stack via costAt()
  maxStacks: number
  label: string
  effect: string
  icon: string
}

/** Cost of the next stack: base × 1.5^stacks, rounded up */
export function costAt(def: BonusDef, stacks: number): number {
  return Math.ceil(def.cost * Math.pow(1.5, stacks))
}

const CLASS_ASCENSION_BONUS: Record<ClassId, { id: AscensionBonusId; maxStacks: number; label: string; description: string }> = {
  warrior:   { id: 'overkill',      maxStacks: 5, label: 'Overkill',       description: 'Excess damage on kill carries to next enemy (25% +15%/stack)' },
  rogue:     { id: 'ghost-strike',  maxStacks: 5, label: 'Ghost Strike',   description: '+3% hit chance per stack (max +15%)' },
  mage:      { id: 'arcane-surge',  maxStacks: 5, label: 'Arcane Surge',   description: '+5% chance to double XP from a kill per stack' },
  priest:    { id: 'blessed-regen', maxStacks: 5, label: 'Blessed Regen',  description: 'Regenerate 0.5% max HP per second per stack' },
  undead:    { id: 'death-pact',    maxStacks: 5, label: 'Death Pact',     description: 'Survive a lethal hit with 1 HP (resets per zone)' },
  dragonkin: { id: 'dragon-scales', maxStacks: 5, label: 'Dragon Scales',  description: '+2% damage reduction per stack (max 10%)' },
}

const ASCENSION_BONUS_BY_ID = Object.fromEntries(
  Object.values(CLASS_ASCENSION_BONUS).map((b) => [b.id, b]),
) as Record<AscensionBonusId, (typeof CLASS_ASCENSION_BONUS)[ClassId]>

/** Token cost to refund all allocated mastery stacks */
export const MASTERY_RESPEC_COST = 5

export { CLASS_ASCENSION_BONUS }

export const usePrestigeStore = defineStore('prestige', () => {
  const prestigeCount = ref(0)
  const ascensionTokens = ref(0)
  const totalTokensEarned = ref(0)
  const bonuses = ref<Partial<Record<PrestigeBonusId, number>>>({})
  const ascensionBonuses = ref<Partial<Record<AscensionBonusId, number>>>({})
  const masteryPoints = ref(0)

  // ── NG+ difficulty ──────────────────────────────────────────────────────────

  /** Current NG+ difficulty tier — enemies scale with each prestige */
  const difficultyTier = computed(() => prestigeCount.value)

  /** Tokens a prestige at the given level would award at the current tier */
  function tokensForPrestige(level: number): number {
    return Math.floor((level / 10) * (1 + 0.5 * difficultyTier.value))
  }

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
  /** Blessed Regen: fraction of max HP regenerated per second */
  const passiveRegenPct    = computed(() => (ascensionBonuses.value['blessed-regen'] ?? 0) * 0.005)
  const damageReduction    = computed(() => (ascensionBonuses.value['dragon-scales'] ?? 0) * 0.02)
  const deathPactSaves     = computed(() => ascensionBonuses.value['death-pact']     ?? 0)
  const overkillStacks     = computed(() => ascensionBonuses.value['overkill']       ?? 0)
  /** Overkill: fraction of excess kill damage carried to the next enemy */
  const overkillCarryPct   = computed(() => {
    const stacks = ascensionBonuses.value['overkill'] ?? 0
    return stacks > 0 ? Math.min(1, 0.25 + 0.15 * stacks) : 0
  })

  // ── Token sink getters ──────────────────────────────────────────────────────
  /** Transcend: +5 max level per stack (base 100) */
  const maxLevelBonus = computed(() => (bonuses.value.transcend ?? 0) * 5)
  /** Loot Mastery: minimum drop rarity floor */
  const lootMasteryFloor = computed<'uncommon' | 'rare' | undefined>(() => {
    const stacks = bonuses.value.lootMastery ?? 0
    if (stacks >= 2) return 'rare'
    if (stacks === 1) return 'uncommon'
    return undefined
  })

  // ── Bonus definitions ───────────────────────────────────────────────────────

  const BONUS_DEFS: Record<PrestigeBonusId, BonusDef> = {
    xpBoost:           { cost: 2,  maxStacks: 8,  label: 'XP Boost',           effect: '+20% XP per stack',            icon: '✨' },
    goldBoost:         { cost: 2,  maxStacks: 8,  label: 'Gold Boost',         effect: '+20% gold per stack',          icon: '💰' },
    offlineEfficiency: { cost: 3,  maxStacks: 10, label: 'Offline Efficiency', effect: '+10% offline kill rate/stack', icon: '⏳' },
    startingLevel:     { cost: 5,  maxStacks: 5,  label: 'Head Start',         effect: 'Start at level 5, 10, 15...',  icon: '🚀' },
    hpBonus:           { cost: 2,  maxStacks: 12, label: 'Vitality',           effect: '+10% max HP per stack',        icon: '❤' },
    dropRateBonus:     { cost: 4,  maxStacks: 5,  label: 'Fortune',            effect: '+10% drop chance/stack',       icon: '🎁' },
    transcend:         { cost: 25, maxStacks: 5,  label: 'Transcend',          effect: '+5 max level per stack',       icon: '🌟' },
    lootMastery:       { cost: 10, maxStacks: 2,  label: 'Loot Mastery',       effect: 'Drops are uncommon+, then rare+', icon: '🍀' },
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function buyBonus(id: PrestigeBonusId): boolean {
    const def = BONUS_DEFS[id]
    const current = bonuses.value[id] ?? 0
    if (current >= def.maxStacks) return false
    const price = costAt(def, current)
    if (ascensionTokens.value < price) return false
    ascensionTokens.value -= price
    bonuses.value = { ...bonuses.value, [id]: current + 1 }
    savePrestige()
    return true
  }

  /** Spends one mastery point into any class's ascension bonus */
  function allocateMastery(id: AscensionBonusId): boolean {
    if (masteryPoints.value <= 0) return false
    const def = ASCENSION_BONUS_BY_ID[id]
    const current = ascensionBonuses.value[id] ?? 0
    if (current >= def.maxStacks) return false
    masteryPoints.value--
    ascensionBonuses.value = { ...ascensionBonuses.value, [id]: current + 1 }
    savePrestige()
    return true
  }

  /** Refunds all allocated mastery stacks back to unspent points */
  function respecMastery(): boolean {
    const totalStacks = Object.values(ascensionBonuses.value).reduce((a, b) => a + (b ?? 0), 0)
    if (totalStacks === 0) return false
    if (ascensionTokens.value < MASTERY_RESPEC_COST) return false
    ascensionTokens.value -= MASTERY_RESPEC_COST
    masteryPoints.value += totalStacks
    ascensionBonuses.value = {}
    savePrestige()
    return true
  }

  function prestige(): void {
    const characterStore = useCharacterStore()
    const char = characterStore.character
    if (!char || char.level < 50) return

    const tokensEarned = tokensForPrestige(char.level)
    ascensionTokens.value += tokensEarned
    totalTokensEarned.value += tokensEarned
    prestigeCount.value++
    useTaskStore().updateTracker({ prestigesDone: 1 })

    // Award a class-agnostic mastery point (spend via allocateMastery)
    masteryPoints.value++

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

      // Restore all spent skill-point upgrades — stats are percentage-based
      // and recomputed below via recalcStats()
      newChar.upgrades = savedUpgrades

      // Apply startingLevel bonus — grant skill points for skipped levels
      const sl = startingLevel.value
      if (sl > 1) {
        newChar.level = sl
        newChar.xpToNext = getXPToNextLevel(sl)
        newChar.skillPoints = (newChar.skillPoints ?? 0) + (sl - 1)
        newChar.pendingLevelUps = 0
      }

      characterStore.recalcStats()
      newChar.currentHP = newChar.maxHP
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
      masteryPoints: masteryPoints.value,
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
      masteryPoints.value = data.masteryPoints ?? 0
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
    masteryPoints,
    difficultyTier,
    tokensForPrestige,
    xpMultiplier,
    goldMultiplier,
    offlineEfficiencyBonus,
    startingLevel,
    hpMultiplier,
    dropRateBonus,
    hitChanceBonus,
    xpDoubleChance,
    passiveRegenPct,
    damageReduction,
    deathPactSaves,
    overkillStacks,
    overkillCarryPct,
    maxLevelBonus,
    lootMasteryFloor,
    BONUS_DEFS,
    addTokens,
    buyBonus,
    allocateMastery,
    respecMastery,
    prestige,
    savePrestige,
    loadPrestige,
  }
})
