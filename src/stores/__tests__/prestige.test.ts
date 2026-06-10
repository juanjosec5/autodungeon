import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePrestigeStore, costAt, MASTERY_RESPEC_COST } from '../prestige'
import { useCharacterStore } from '../character'
import { spawnEnemy, getBossForZone, TIER_HP_GROWTH, TIER_ATK_GROWTH, TIER_REWARD_GROWTH } from '../../game/enemies'

// ── localStorage mock (node env has no DOM) ───────────────────────────────────

const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value },
  removeItem: (key: string) => { delete localStorageStore[key] },
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k] },
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('tokensForPrestige', () => {
  it('scales with level at tier 0', () => {
    const store = usePrestigeStore()
    expect(store.tokensForPrestige(50)).toBe(5)
    expect(store.tokensForPrestige(100)).toBe(10)
  })

  it('scales with NG+ tier (+50% per tier)', () => {
    const store = usePrestigeStore()
    store.prestigeCount = 1
    expect(store.tokensForPrestige(60)).toBe(9)   // 6 × 1.5
    store.prestigeCount = 2
    expect(store.tokensForPrestige(60)).toBe(12)  // 6 × 2.0
    store.prestigeCount = 4
    expect(store.tokensForPrestige(100)).toBe(30) // 10 × 3.0
  })
})

describe('costAt', () => {
  it('escalates ×1.5 per stack, rounded up', () => {
    const def = { cost: 2, maxStacks: 8, label: '', effect: '', icon: '' }
    expect(costAt(def, 0)).toBe(2)
    expect(costAt(def, 1)).toBe(3)
    expect(costAt(def, 2)).toBe(5)  // 4.5 → 5
    expect(costAt(def, 3)).toBe(7)  // 6.75 → 7
  })
})

describe('buyBonus', () => {
  it('deducts the escalating price per stack', () => {
    const store = usePrestigeStore()
    store.ascensionTokens = 10
    expect(store.buyBonus('xpBoost')).toBe(true)   // costs 2
    expect(store.ascensionTokens).toBe(8)
    expect(store.buyBonus('xpBoost')).toBe(true)   // costs 3
    expect(store.ascensionTokens).toBe(5)
    expect(store.buyBonus('xpBoost')).toBe(true)   // costs 5 (4.5 → 5)
    expect(store.ascensionTokens).toBe(0)
    expect(store.buyBonus('xpBoost')).toBe(false)  // can't afford stack 4
  })

  it('respects maxStacks', () => {
    const store = usePrestigeStore()
    store.ascensionTokens = 999999
    const def = store.BONUS_DEFS.lootMastery
    for (let i = 0; i < def.maxStacks; i++) {
      expect(store.buyBonus('lootMastery')).toBe(true)
    }
    expect(store.buyBonus('lootMastery')).toBe(false)
  })
})

describe('token sinks', () => {
  it('transcend raises the character max level by 5 per stack', () => {
    const prestige = usePrestigeStore()
    const character = useCharacterStore()
    expect(character.maxLevel).toBe(100)
    prestige.ascensionTokens = 1000
    prestige.buyBonus('transcend')
    expect(character.maxLevel).toBe(105)
    prestige.buyBonus('transcend')
    expect(character.maxLevel).toBe(110)
  })

  it('lootMastery floor progresses uncommon → rare', () => {
    const store = usePrestigeStore()
    expect(store.lootMasteryFloor).toBeUndefined()
    store.ascensionTokens = 1000
    store.buyBonus('lootMastery')
    expect(store.lootMasteryFloor).toBe('uncommon')
    store.buyBonus('lootMastery')
    expect(store.lootMasteryFloor).toBe('rare')
  })
})

describe('mastery points', () => {
  it('allocates into any class bonus and respects maxStacks', () => {
    const store = usePrestigeStore()
    store.masteryPoints = 6
    expect(store.allocateMastery('blessed-regen')).toBe(true)
    expect(store.ascensionBonuses['blessed-regen']).toBe(1)
    expect(store.masteryPoints).toBe(5)

    for (let i = 0; i < 4; i++) store.allocateMastery('blessed-regen')
    expect(store.ascensionBonuses['blessed-regen']).toBe(5)
    // 6th allocation hits maxStacks (5)
    expect(store.allocateMastery('blessed-regen')).toBe(false)
    expect(store.masteryPoints).toBe(1)
  })

  it('fails with no points', () => {
    const store = usePrestigeStore()
    expect(store.allocateMastery('overkill')).toBe(false)
  })

  it('respec refunds all stacks for a flat token cost', () => {
    const store = usePrestigeStore()
    store.masteryPoints = 3
    store.allocateMastery('overkill')
    store.allocateMastery('ghost-strike')
    store.allocateMastery('dragon-scales')
    store.ascensionTokens = MASTERY_RESPEC_COST
    expect(store.respecMastery()).toBe(true)
    expect(store.masteryPoints).toBe(3)
    expect(store.ascensionTokens).toBe(0)
    expect(store.ascensionBonuses['overkill']).toBeUndefined()
  })

  it('respec fails without stacks or tokens', () => {
    const store = usePrestigeStore()
    expect(store.respecMastery()).toBe(false)
    store.masteryPoints = 1
    store.allocateMastery('overkill')
    store.ascensionTokens = MASTERY_RESPEC_COST - 1
    expect(store.respecMastery()).toBe(false)
  })
})

describe('ascension bonus scaling', () => {
  it('overkill carry scales with stacks', () => {
    const store = usePrestigeStore()
    expect(store.overkillCarryPct).toBe(0)
    store.masteryPoints = 5
    store.allocateMastery('overkill')
    expect(store.overkillCarryPct).toBeCloseTo(0.4)
    for (let i = 0; i < 4; i++) store.allocateMastery('overkill')
    expect(store.overkillCarryPct).toBeCloseTo(1.0)
  })

  it('blessed regen is percent-based', () => {
    const store = usePrestigeStore()
    store.masteryPoints = 2
    store.allocateMastery('blessed-regen')
    store.allocateMastery('blessed-regen')
    expect(store.passiveRegenPct).toBeCloseTo(0.01)
  })
})

describe('prestige action', () => {
  function setupLevel60Character() {
    const character = useCharacterStore()
    character.createCharacter('Hero', 'warrior')
    character.character!.level = 60
    character.character!.lifetime.kills = 1234
    character.character!.upgrades = { 'str-up': 3 }
    return character
  }

  it('requires level 50', () => {
    const prestige = usePrestigeStore()
    const character = useCharacterStore()
    character.createCharacter('Hero', 'warrior')
    character.character!.level = 49
    prestige.prestige()
    expect(prestige.prestigeCount).toBe(0)
  })

  it('awards tier-scaled tokens and a mastery point, preserves id/lifetime/upgrades', () => {
    const prestige = usePrestigeStore()
    const character = setupLevel60Character()
    const charId = character.character!.id

    prestige.prestige()

    expect(prestige.prestigeCount).toBe(1)
    expect(prestige.ascensionTokens).toBe(6)       // floor(60/10) at tier 0
    expect(prestige.masteryPoints).toBe(1)
    expect(character.character!.id).toBe(charId)
    expect(character.character!.level).toBe(1)
    expect(character.character!.lifetime.kills).toBe(1234)
    expect(character.character!.upgrades['str-up']).toBe(3)
  })

  it('second prestige earns more tokens at the higher tier', () => {
    const prestige = usePrestigeStore()
    setupLevel60Character()
    prestige.prestige()

    const character = useCharacterStore()
    character.character!.level = 60
    prestige.prestige()
    expect(prestige.ascensionTokens).toBe(6 + 9)  // tier 0: 6, tier 1: 9
    expect(prestige.difficultyTier).toBe(2)
  })
})

describe('NG+ enemy scaling', () => {
  it('spawnEnemy scales HP/ATK/XP with tier and leaves DEF flat', () => {
    const base = getBossForZone('forest', 0)
    const tiered = getBossForZone('forest', 2)
    expect(tiered.maxHp).toBe(Math.floor(base.maxHp * Math.pow(TIER_HP_GROWTH, 2)))
    expect(tiered.atk[0]).toBe(Math.floor(base.atk[0] * Math.pow(TIER_ATK_GROWTH, 2)))
    expect(tiered.xpReward).toBe(Math.floor(base.xpReward * Math.pow(TIER_REWARD_GROWTH, 2)))
    expect(tiered.def).toBe(base.def)
  })

  it('tier 0 spawns are unchanged', () => {
    for (let i = 0; i < 20; i++) {
      const enemy = spawnEnemy('forest', 0)
      expect(enemy.maxHp).toBeLessThan(100) // forest normals: max 35 × 2.2 = 77
    }
  })
})
