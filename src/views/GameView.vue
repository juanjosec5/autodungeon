<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSaveStore } from '../stores/save'
import { useCombatStore } from '../stores/combat'
import { useZoneStore } from '../stores/zone'
import { useAuthStore } from '../stores/auth'
import { useCharacterStore } from '../stores/character'
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
const authStore = useAuthStore()
const characterStore = useCharacterStore()

// Restart combat whenever the active zone changes
watch(() => zoneStore.activeZone, () => {
  if (combatStore.isRunning) combatStore.restartCombat()
})

onMounted(async () => {
  // Character already set means we just came from character creation — skip load
  if (!characterStore.character) {
    const found = await saveStore.loadCharacter()
    if (!found) {
      router.push('/')
      return
    }
  }
  combatStore.startCombat()
})

onUnmounted(() => {
  combatStore.stopCombat()
})
</script>

<template>
  <div class="game-root">
    <!-- Header -->
    <div class="game-header">
      <h1 class="game-title">Autodungeon</h1>
      <div class="game-meta">
        <span v-if="saveStore.isSaving" class="meta-saving">Saving...</span>
        <span v-else-if="saveStore.lastSaved" class="meta-saved">
          Saved {{ new Date(saveStore.lastSaved).toLocaleTimeString() }}
        </span>
        <span v-if="!authStore.isGuest" class="meta-user">{{ authStore.session?.user.email }}</span>
        <span v-else class="meta-user">Guest</span>
        <button class="pixel-btn" @click="router.push('/')">← Menu</button>
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

<style scoped>
.game-root {
  min-height: 100vh;
  padding: 16px;
}
.game-header {
  max-width: 72rem;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.game-title {
  font-size: 16px;
  letter-spacing: 4px;
  color: var(--gold);
  text-transform: uppercase;
  text-shadow: 2px 2px 0 #000, 0 0 20px rgba(200,160,40,0.4);
}
.game-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 8px;
}
.meta-saving { color: var(--gold); }
.meta-saved  { color: var(--text-dim); }
.meta-user   { color: var(--text-dim); }
</style>
