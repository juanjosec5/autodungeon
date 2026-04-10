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
    // GameView watches activeZone and calls combatStore.restartCombat()
  }

  return { activeZone, setZone }
})
