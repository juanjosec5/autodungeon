<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSaveStore } from '../stores/save'
import { useCombatStore } from '../stores/combat'
import { useZoneStore } from '../stores/zone'
import CharacterPanel from '../components/CharacterPanel.vue'
import EnemyPanel from '../components/EnemyPanel.vue'
import CombatLog from '../components/CombatLog.vue'
import GearPanel from '../components/GearPanel.vue'
import Inventory from '../components/Inventory.vue'
import ZoneSelector from '../components/ZoneSelector.vue'
import SpeedControl from '../components/SpeedControl.vue'
import DeathModal from '../components/DeathModal.vue'

const router = useRouter()
const saveStore = useSaveStore()
const combatStore = useCombatStore()
const zoneStore = useZoneStore()

// Restart combat whenever the active zone changes
watch(() => zoneStore.activeZone, () => {
  if (combatStore.isRunning) combatStore.restartCombat()
})

onMounted(async () => {
  const found = await saveStore.loadCharacter()
  if (!found) {
    router.push('/')
    return
  }
  combatStore.startCombat()
})

onUnmounted(() => {
  combatStore.stopCombat()
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 p-4">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-4 flex items-center justify-between">
      <h1 class="text-xl font-black tracking-widest text-amber-400 uppercase">Autodungeon</h1>
      <div class="flex items-center gap-3 text-xs text-gray-600">
        <span v-if="saveStore.isSaving" class="text-amber-600">Saving...</span>
        <span v-else-if="saveStore.lastSaved">
          Saved {{ new Date(saveStore.lastSaved).toLocaleTimeString() }}
        </span>
      </div>
    </div>

    <!-- Main grid -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      <!-- Col 1: Character + Gear -->
      <div class="flex flex-col gap-4">
        <CharacterPanel />
        <GearPanel />
        <ZoneSelector />
      </div>

      <!-- Col 2: Enemy + Combat Log -->
      <div class="flex flex-col gap-4">
        <EnemyPanel />
        <CombatLog class="flex-1" />
      </div>

      <!-- Col 3: Inventory + Speed -->
      <div class="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
        <Inventory />
        <SpeedControl />
      </div>

    </div>

    <DeathModal />
  </div>
</template>
