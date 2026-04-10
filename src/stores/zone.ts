import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ZoneId } from '../types/index'
import { useCharacterStore } from './character'

export const useZoneStore = defineStore('zone', () => {
  const activeZone = ref<ZoneId>('forest')

  function setZone(zone: ZoneId): void {
    const characterStore = useCharacterStore()
    if (!characterStore.unlockedZones.includes(zone)) return

    activeZone.value = zone
    characterStore.setZone(zone)

    // Combat store will react to zone change — imported lazily to avoid circular deps
    const { useCombatStore } = require('./combat') as typeof import('./combat')
    const combatStore = useCombatStore()
    combatStore.restartCombat()
  }

  return { activeZone, setZone }
})
