import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ZoneId } from '../types/index'
import { useCharacterStore } from './character'

export const useZoneStore = defineStore('zone', () => {
  const activeZone = ref<ZoneId>('forest')
  // pendingZone tracks which zone the player has highlighted in the selector.
  // Stored in the store (not local component state) so it survives panel switches.
  const pendingZone = ref<ZoneId>('forest')

  function setZone(zone: ZoneId): void {
    const characterStore = useCharacterStore()
    if (!characterStore.unlockedZones.includes(zone)) return
    activeZone.value = zone
    pendingZone.value = zone
    characterStore.setZone(zone)
    // GameView watches activeZone and calls combatStore.restartCombat()
  }

  function selectPending(zone: ZoneId): void {
    const characterStore = useCharacterStore()
    if (!characterStore.unlockedZones.includes(zone)) return
    pendingZone.value = zone
  }

  function confirmPending(): void {
    setZone(pendingZone.value)
  }

  function resetToForest(): void {
    activeZone.value = 'forest'
    pendingZone.value = 'forest'
  }

  return { activeZone, pendingZone, setZone, selectPending, confirmPending, resetToForest }
})
