import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Item, ZoneId } from '../types/index'
import { rollLoot } from '../game/items'

export const useLootStore = defineStore('loot', () => {
  const lastDroppedItem = ref<Item | null>(null)

  function processLootDrop(zone: ZoneId, isDragon: boolean): Item {
    const item = rollLoot(zone, isDragon)
    lastDroppedItem.value = item
    return item
  }

  return { lastDroppedItem, processLootDrop }
})
