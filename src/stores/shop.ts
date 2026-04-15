import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ConsumableId } from '../types/index'
import { CONSUMABLE_DEFS, getStockForSlot, ROTATION_INTERVAL_MS } from '../game/shop'
import { useZoneStore } from './zone'

interface ActiveConsumable {
  id: ConsumableId
  expiresAt: number
}

interface ShopSaveData {
  activeConsumables: ActiveConsumable[]
}

const LS_SHOP = 'autodungeon_shop'

export const useShopStore = defineStore('shop', () => {
  const activeConsumables = ref<ActiveConsumable[]>([])

  // ── Computed stock ──────────────────────────────────────────────────────────

  const currentSlotIndex = computed(() => Math.floor(Date.now() / ROTATION_INTERVAL_MS))

  const currentStock = computed(() => getStockForSlot(currentSlotIndex.value, useZoneStore().activeZone))

  const timeToNextRotation = computed(() => {
    const nextRotation = (currentSlotIndex.value + 1) * ROTATION_INTERVAL_MS
    return Math.max(0, nextRotation - Date.now())
  })

  // ── Consumable bonus computeds ──────────────────────────────────────────────

  function isActive(id: ConsumableId): boolean {
    const entry = activeConsumables.value.find((c) => c.id === id)
    return !!entry && entry.expiresAt > Date.now()
  }

  function remainingMs(id: ConsumableId): number {
    const entry = activeConsumables.value.find((c) => c.id === id)
    if (!entry) return 0
    return Math.max(0, entry.expiresAt - Date.now())
  }

  const damageBonus  = computed(() => isActive('war-potion')    ? 0.25 : 0)
  const defBonus     = computed(() => isActive('iron-flask')     ? 15   : 0)
  const atkSpeedBonus= computed(() => isActive('swift-elixir')   ? 0.20 : 0)
  const goldBonus    = computed(() => isActive('fortune-charm')  ? 0.20 : 0)
  const xpBonus      = computed(() => isActive('xp-tome')        ? 0.30 : 0)

  // ── Actions ─────────────────────────────────────────────────────────────────

  function buyConsumable(id: ConsumableId, gold: number, spendGold: (amount: number) => boolean): boolean {
    const def = CONSUMABLE_DEFS.find((d) => d.id === id)
    if (!def) return false
    if (gold < def.cost) return false
    if (!spendGold(def.cost)) return false

    const now = Date.now()
    const existing = activeConsumables.value.findIndex((c) => c.id === id)
    const expiresAt = now + def.durationMs

    if (existing >= 0) {
      // Refresh timer if re-bought while active
      activeConsumables.value[existing].expiresAt = expiresAt
    } else {
      activeConsumables.value.push({ id, expiresAt })
    }
    save()
    return true
  }

  function pruneExpired(): void {
    const now = Date.now()
    const before = activeConsumables.value.length
    activeConsumables.value = activeConsumables.value.filter((c) => c.expiresAt > now)
    if (activeConsumables.value.length !== before) save()
  }

  function save(): void {
    const data: ShopSaveData = { activeConsumables: activeConsumables.value }
    localStorage.setItem(LS_SHOP, JSON.stringify(data))
  }

  function load(): void {
    const raw = localStorage.getItem(LS_SHOP)
    if (!raw) return
    try {
      const data = JSON.parse(raw) as ShopSaveData
      activeConsumables.value = data.activeConsumables ?? []
      pruneExpired()
    } catch {
      // Corrupt data — ignore
    }
  }

  // Prune expired consumables every second
  setInterval(pruneExpired, 1000)

  return {
    currentStock,
    currentSlotIndex,
    timeToNextRotation,
    activeConsumables,
    damageBonus,
    defBonus,
    atkSpeedBonus,
    goldBonus,
    xpBonus,
    isActive,
    remainingMs,
    buyConsumable,
    pruneExpired,
    load,
    save,
  }
})
