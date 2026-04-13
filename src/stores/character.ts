import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Character, Item, ZoneId, ClassId, RarityId, LifetimeStats, SkillId, ScrapMode } from '../types/index'
import { getStatsAtLevel, getXPToNextLevel } from '../game/classes'
import { getItemById, getSellPrice, getBuyPrice, WEAPON_ENCHANTS, ARMOR_ENCHANTS, calcEnchantCost } from '../game/items'
import { getOffClassPenalty, isBetterThan, calcDeathPenalty } from '../game/formulas'
import { SKILL_DEFINITIONS } from '../game/skills'

const STARTER_GEAR: Record<ClassId, { weaponId: string; armorId: string }> = {
  warrior:   { weaponId: 'rusty-sword',  armorId: 'leather-scraps' },
  rogue:     { weaponId: 'shiv',         armorId: 'leather-scraps' },
  mage:      { weaponId: 'crooked-staff', armorId: 'leather-scraps' },
  priest:    { weaponId: 'holy-staff',   armorId: 'leather-scraps' },
  undead:    { weaponId: 'bone-blade',   armorId: 'leather-scraps' },
  dragonkin: { weaponId: 'dragon-claw',  armorId: 'leather-scraps' },
}

const ZONE_UNLOCK_LEVELS: Record<ZoneId, number> = {
  forest:      1,
  dungeon:     5,
  volcano:     12,
  abyss:       20,
  shadowrealm: 30,
  celestial:   45,
  void:        60,
  nightmare:   80,
}

const MAX_LEVEL = 100

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const

export const useCharacterStore = defineStore('character', () => {
  const character = ref<Character | null>(null)

  const SCRAP_MODES = ['off', 'smart', 'smart-c', 'smart-u', 'smart-r'] as const satisfies readonly ScrapMode[]
  const savedScrapMode = localStorage.getItem('scrapMode') as ScrapMode | null
  const scrapMode = ref<ScrapMode>(
    savedScrapMode && (SCRAP_MODES as readonly string[]).includes(savedScrapMode) ? savedScrapMode : 'off',
  )
  const autoEquip = ref(localStorage.getItem('autoEquip') === 'true')

  function setScrapMode(mode: ScrapMode): void {
    scrapMode.value = mode
    localStorage.setItem('scrapMode', mode)
  }

  function toggleAutoEquip(): void {
    autoEquip.value = !autoEquip.value
    localStorage.setItem('autoEquip', String(autoEquip.value))
  }

  // ── Getters ──────────────────────────────────────────────────────────────────

  const unlockedZones = computed<ZoneId[]>(() => {
    if (!character.value) return ['forest']
    const level = character.value.level
    return (Object.entries(ZONE_UNLOCK_LEVELS) as [ZoneId, number][])
      .filter(([, minLevel]) => level >= minLevel)
      .map(([zone]) => zone)
  })

  const effectiveWeaponStats = computed(() => {
    const char = character.value
    const weapon = char?.gear.weapon
    if (!char || !weapon) return null
    const penalty = getOffClassPenalty(weapon, char.class)
    return {
      minDmg: Math.floor((weapon.stats.minDmg ?? 0) * penalty),
      maxDmg: Math.floor((weapon.stats.maxDmg ?? 0) * penalty),
      penalty,
    }
  })

  const effectiveArmorStats = computed(() => {
    const char = character.value
    const armor = char?.gear.armor
    if (!char || !armor) return null
    const penalty = getOffClassPenalty(armor, char.class)
    return {
      defBonus: Math.floor((armor.stats.defBonus ?? 0) * penalty),
      hpBonus: Math.floor((armor.stats.hpBonus ?? 0) * penalty),
      penalty,
    }
  })

  // ── Actions ──────────────────────────────────────────────────────────────────

  function _blankLifetime(): LifetimeStats {
    return {
      kills: 0, bossKills: 0, deaths: 0, damageDealt: 0,
      damageReceived: 0, goldEarned: 0, itemsLooted: 0,
      itemsScrapped: 0, highestHit: 0, timePlayed: 0,
    }
  }

  function createCharacter(name: string, classId: ClassId): void {
    const stats = getStatsAtLevel(classId, 1)
    const starter = STARTER_GEAR[classId]
    const weapon = structuredClone(getItemById(starter.weaponId)) ?? null
    const armor = structuredClone(getItemById(starter.armorId)) ?? null

    character.value = {
      id: crypto.randomUUID(),
      name,
      class: classId,
      level: 1,
      xp: 0,
      xpToNext: getXPToNextLevel(1),
      currentHP: stats.maxHP,
      maxHP: stats.maxHP,
      stats: { str: stats.str, dex: stats.dex, int: stats.int },
      gear: { weapon, armor },
      inventory: [],
      gold: 0,
      currentZone: 'forest',
      skillPoints: 0,
      skills: {},
      createdAt: new Date().toISOString(),
      lastSaved: new Date().toISOString(),
      lifetime: _blankLifetime(),
    }
  }

  function restoreCharacter(data: Character): void {
    // Backwards compat: old saves may not have these fields
    if (!data.lifetime) data.lifetime = _blankLifetime()
    if (data.skillPoints === undefined) data.skillPoints = 0
    if (!data.skills) data.skills = {}
    character.value = data
  }

  function updateLifetime(delta: Partial<LifetimeStats>): void {
    const char = character.value
    if (!char) return
    for (const [k, v] of Object.entries(delta) as [keyof LifetimeStats, number][]) {
      if (k === 'highestHit') {
        char.lifetime.highestHit = Math.max(char.lifetime.highestHit, v)
      } else {
        (char.lifetime[k] as number) += v
      }
    }
  }

  function equipItem(item: Item): void {
    const char = character.value
    if (!char) return

    // Block legendary off-class equip
    if (getOffClassPenalty(item, char.class) === 0) return

    const slot = item.type === 'weapon' ? 'weapon' : 'armor'
    const current = char.gear[slot]

    // Swap current equipped back into inventory if present
    if (current) {
      char.inventory.push(current)
    }

    char.gear[slot] = item
    char.inventory = char.inventory.filter((i) => i.id !== item.id)

    // Recalculate maxHP if armor changed (hpBonus)
    _recalcMaxHP()
  }

  function unequipItem(slot: 'weapon' | 'armor'): void {
    const char = character.value
    if (!char) return
    const item = char.gear[slot]
    if (!item) return

    if (char.inventory.length < 20) {
      char.inventory.push(item)
    } else {
      // Auto-sell if no inventory space
      char.gold += getSellPrice(item.rarity)
    }

    char.gear[slot] = null
    _recalcMaxHP()
  }

  /**
   * Returns { sold: true, gold, reason } if item was auto-sold,
   * { sold: false, equipped: true } if auto-equipped,
   * otherwise returns { sold: false }.
   */
  function addToInventory(item: Item): { sold: true; gold: number; reason: 'full' | 'scrap' } | { sold: false; equipped?: boolean } {
    const char = character.value
    if (!char) return { sold: false }

    // Auto-equip: equip if strictly better than current gear (penalty-aware) and class can use it
    if (autoEquip.value && getOffClassPenalty(item, char.class) !== 0) {
      const slot = item.type === 'weapon' ? 'weapon' : 'armor'
      const current = char.gear[slot]
      if (current && isBetterThan(item, current, char.class)) {
        char.inventory.push(current)
        char.gear[slot] = item
        _recalcMaxHP()
        return { sold: false, equipped: true }
      }
    }

    // Smart scrap: sell if worse than equipped (penalty-aware), optionally capped by rarity
    if (scrapMode.value !== 'off') {
      const slot = item.type === 'weapon' ? 'weapon' : 'armor'
      const equipped = char.gear[slot]
      if (equipped) {
        const isWorse = !isBetterThan(item, equipped, char.class)
        let eligible = isWorse
        if (isWorse && scrapMode.value !== 'smart') {
          const capRarity: Record<string, RarityId> = {
            'smart-c': 'common', 'smart-u': 'uncommon', 'smart-r': 'rare',
          }
          const cap = capRarity[scrapMode.value]
          eligible = RARITY_ORDER.indexOf(item.rarity) <= RARITY_ORDER.indexOf(cap)
        }
        if (eligible) {
          const gold = getSellPrice(item.rarity)
          char.gold += gold
          return { sold: true, gold, reason: 'scrap' }
        }
      }
    }

    if (char.inventory.length >= 20) {
      const gold = getSellPrice(item.rarity)
      char.gold += gold
      return { sold: true, gold, reason: 'full' }
    }

    char.inventory.push(item)
    return { sold: false }
  }

  /**
   * Accumulates XP and handles level-up chain.
   * Returns the number of levels gained (0 if none).
   */
  function applyXP(amount: number): number {
    const char = character.value
    if (!char) return 0

    char.xp += amount
    let levelsGained = 0

    while (char.xp >= char.xpToNext && char.level < MAX_LEVEL) {
      char.xp -= char.xpToNext
      char.level += 1
      levelsGained++

      // Award a skill point every 5 levels
      if (char.level % 5 === 0) {
        char.skillPoints = (char.skillPoints ?? 0) + 1
      }

      const newStats = getStatsAtLevel(char.class, char.level)
      const hpDiff = newStats.maxHP - char.maxHP
      char.maxHP = newStats.maxHP
      char.currentHP = Math.min(char.maxHP, char.currentHP + hpDiff)
      char.stats.str = newStats.str
      char.stats.dex = newStats.dex
      char.stats.int = newStats.int
      char.xpToNext = getXPToNextLevel(char.level)
    }

    // At max level cap XP at xpToNext
    if (char.level >= MAX_LEVEL) {
      char.xp = Math.min(char.xp, char.xpToNext)
    }

    return levelsGained
  }

  function applyDeathPenalty(): void {
    const char = character.value
    if (!char) return
    const { xpLoss, goldLoss } = calcDeathPenalty(char.xp, char.gold)
    char.xp = Math.max(0, char.xp - xpLoss)
    char.gold = Math.max(0, char.gold - goldLoss)
    char.currentHP = char.maxHP
  }

  /**
   * Sells a batch of inventory items by ID.
   * Returns total gold earned.
   */
  function sellItems(ids: string[]): number {
    const char = character.value
    if (!char || ids.length === 0) return 0
    const idSet = new Set(ids)
    let totalGold = 0
    char.inventory = char.inventory.filter((item) => {
      if (idSet.has(item.id)) {
        totalGold += getSellPrice(item.rarity)
        return false
      }
      return true
    })
    char.gold += totalGold
    return totalGold
  }

  /**
   * Buys an item from the shop by its template ID.
   * Returns 'bought', 'no_gold', or 'inv_full'.
   */
  function buyItem(itemId: string): 'bought' | 'no_gold' | 'inv_full' {
    const char = character.value
    if (!char) return 'inv_full'

    const template = getItemById(itemId)
    if (!template) return 'inv_full'

    const price = getBuyPrice(template.rarity)
    if (char.gold < price) return 'no_gold'
    if (char.inventory.length >= 20) return 'inv_full'

    char.gold -= price
    char.inventory.push({ ...structuredClone(template), defId: template.id, id: crypto.randomUUID() })
    return 'bought'
  }

  function setZone(zone: ZoneId): void {
    const char = character.value
    if (!char) return
    char.currentZone = zone
  }

  /**
   * Spends one skill point to level up a skill.
   * Returns 'ok', 'no_points', or 'max_level'.
   */
  function spendSkillPoint(skillId: SkillId): 'ok' | 'no_points' | 'max_level' {
    const char = character.value
    if (!char) return 'no_points'
    if ((char.skillPoints ?? 0) <= 0) return 'no_points'

    const def = SKILL_DEFINITIONS.find((s) => s.id === skillId)
    if (!def) return 'no_points'

    const current = (char.skills ?? {})[skillId] ?? 0
    if (current >= def.maxLevel) return 'max_level'

    char.skills = { ...(char.skills ?? {}), [skillId]: current + 1 }
    char.skillPoints = (char.skillPoints ?? 0) - 1
    return 'ok'
  }

  /**
   * Enchants an item (in inventory or equipped) by adding/rerolling a special effect.
   * Cost: getBuyPrice(rarity) * 3 * 2^enchantCount
   * Returns 'enchanted', 'no_gold', or 'not_found'.
   */
  function enchantItem(itemId: string): 'enchanted' | 'no_gold' | 'not_found' {
    const char = character.value
    if (!char) return 'not_found'

    // Search inventory and gear
    const gearItems = [char.gear.weapon, char.gear.armor].filter(Boolean) as Item[]
    const item = [...char.inventory, ...gearItems].find((i) => i.id === itemId)
    if (!item) return 'not_found'

    const cost = calcEnchantCost(item)
    if (char.gold < cost) return 'no_gold'

    const pool = item.type === 'weapon' ? WEAPON_ENCHANTS : ARMOR_ENCHANTS
    if (!item.stats.special) item.stats.special = []

    const existingTypes = new Set(item.stats.special.map((s) => s.type))
    const available = pool.filter((e) => !existingTypes.has(e.type))

    if (available.length > 0 && item.stats.special.length < 3) {
      // Add a new effect not already present
      const effect = available[Math.floor(Math.random() * available.length)]
      item.stats.special.push(structuredClone(effect))
    } else {
      // Reroll a random existing effect from the pool
      const replaceIdx = Math.floor(Math.random() * item.stats.special.length)
      const newEffect = pool[Math.floor(Math.random() * pool.length)]
      item.stats.special[replaceIdx] = structuredClone(newEffect)
    }

    item.enchantCount = (item.enchantCount ?? 0) + 1
    char.gold -= cost
    return 'enchanted'
  }

  /**
   * Returns the cost in gold to enchant a given item next time.
   */
  function getEnchantCost(item: Item): number {
    return calcEnchantCost(item)
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  function _recalcMaxHP(): void {
    const char = character.value
    if (!char) return
    const baseStats = getStatsAtLevel(char.class, char.level)
    const armorHpBonus = char.gear.armor?.stats.hpBonus ?? 0
    const penalty = char.gear.armor ? getOffClassPenalty(char.gear.armor, char.class) : 1
    const effectiveHpBonus = Math.floor(armorHpBonus * penalty)
    const newMax = baseStats.maxHP + effectiveHpBonus
    const diff = newMax - char.maxHP
    char.maxHP = newMax
    char.currentHP = Math.min(newMax, char.currentHP + Math.max(0, diff))
  }

  return {
    character,
    scrapMode,
    setScrapMode,
    autoEquip,
    toggleAutoEquip,
    unlockedZones,
    effectiveWeaponStats,
    effectiveArmorStats,
    createCharacter,
    restoreCharacter,
    updateLifetime,
    equipItem,
    unequipItem,
    addToInventory,
    sellItems,
    buyItem,
    applyXP,
    applyDeathPenalty,
    setZone,
    spendSkillPoint,
    enchantItem,
    getEnchantCost,
  }
})
