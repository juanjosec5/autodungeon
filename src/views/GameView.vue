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
import ShopPanel from '../components/ShopPanel.vue'

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

    <div class="content">
      <!-- Enemy — full width -->
      <EnemyPanel class="enemy-row" />

      <!-- Main grid -->
      <div class="main-grid">

        <!-- Col 1: Character + Gear + Zone + Speed -->
        <div class="col">
          <CharacterPanel />
          <GearPanel />
          <ZoneSelector />
          <SpeedControl />
        </div>

        <!-- Col 2: Combat Log -->
        <div class="col">
          <CombatLog class="log-fill" />
        </div>

        <!-- Col 3: Inventory + Shop -->
        <div class="col col-wide">
          <Inventory />
          <ShopPanel />
        </div>

      </div>
    </div>

    <DeathModal />
  </div>
</template>

<style scoped>
.game-root {
  min-height: 100vh;
  padding: 12px;
}

.game-header {
  max-width: 72rem;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.game-title {
  font-size: 14px;
  letter-spacing: 3px;
  color: var(--gold);
  text-transform: uppercase;
  text-shadow: 2px 2px 0 #000, 0 0 20px rgba(200,160,40,0.4);
}
.game-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 8px;
  flex-wrap: wrap;
}
.meta-saving { color: var(--gold); }
.meta-saved  { color: var(--text-dim); }
.meta-user   { color: var(--text-dim); }

.content {
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-fill {
  flex: 1;
  min-height: 0;
}

/* Tablet: 2 columns */
@media (min-width: 640px) {
  .main-grid {
    grid-template-columns: 1fr 1fr;
  }
  .col-wide {
    grid-column: span 2;
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
  .col-wide {
    grid-column: span 1;
  }
}
</style>
