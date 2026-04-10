import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Item } from '../types/index'

export const useLootStore = defineStore('loot', () => {
  const lastDroppedItem = ref<Item | null>(null)

  return { lastDroppedItem }
})
