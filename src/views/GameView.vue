<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSaveStore } from '../stores/save'
import { useCombatStore } from '../stores/combat'
import { useZoneStore } from '../stores/zone'
import { useAuthStore } from '../stores/auth'
import { useCharacterStore } from '../stores/character'
import { useAchievementStore } from '../stores/achievement'
import CharacterPanel from '../components/CharacterPanel.vue'
import EnemyPanel from '../components/EnemyPanel.vue'
import CombatLog from '../components/CombatLog.vue'
import GearPanel from '../components/GearPanel.vue'
import Inventory from '../components/Inventory.vue'
import ZoneSelector from '../components/ZoneSelector.vue'
import DeathModal from '../components/DeathModal.vue'
import ShopPanel from '../components/ShopPanel.vue'
import AchievementsPanel from '../components/AchievementsPanel.vue'

const router = useRouter()
const saveStore = useSaveStore()
const combatStore = useCombatStore()
const zoneStore = useZoneStore()
const authStore = useAuthStore()
const characterStore = useCharacterStore()
const achievementStore = useAchievementStore()

type PanelId = 'gear' | 'inventory' | 'zone' | 'shop' | 'challenges' | 'log'

const activePanel = ref<PanelId>('gear')

const NAV_ITEMS: { id: PanelId; icon: string; label: string }[] = [
  { id: 'gear',       icon: '⚔',  label: 'Gear'       },
  { id: 'inventory',  icon: '🎒', label: 'Inventory'  },
  { id: 'zone',       icon: '🗺', label: 'Zone'       },
  { id: 'shop',       icon: '🛒', label: 'Shop'       },
  { id: 'challenges', icon: '🏆', label: 'Challenges' },
  { id: 'log',        icon: '📜', label: 'Log'        },
]

// Controls popover
const showControls = ref(false)
const SPEEDS = [0.5, 1, 2, 4] as const

function togglePause() {
  if (combatStore.isPaused) combatStore.resumeCombat()
  else combatStore.pauseCombat()
}

// Restart combat whenever the active zone changes
watch(() => zoneStore.activeZone, () => {
  if (combatStore.isRunning) combatStore.restartCombat()
})

// Notify combat log when a zone challenge set is completed
watch(() => achievementStore.rewardNotifications, (notifications) => {
  for (const n of [...notifications]) {
    combatStore.addLogEntry({
      type: 'levelup',
      message: `🏆 ${n.zoneName} challenges complete! Received: ${n.weaponName} + ${n.armorName}`,
    })
    achievementStore.clearNotification(n.zone)
  }
}, { deep: true })

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

        <!-- Controls popover trigger -->
        <div class="controls-wrap">
          <button
            class="pixel-btn ctrl-btn"
            :class="{ 'ctrl-active': showControls }"
            @click="showControls = !showControls"
            title="Speed controls"
          >⚙</button>
          <div v-if="showControls" class="ctrl-popover">
            <button
              class="pixel-btn pause-btn"
              :class="combatStore.isPaused ? 'btn-purple' : ''"
              :disabled="!combatStore.isRunning"
              @click="togglePause"
            >{{ combatStore.isPaused ? '▶ Resume' : '⏸ Pause' }}</button>
            <div class="speed-row">
              <button
                v-for="s in SPEEDS"
                :key="s"
                class="pixel-btn speed-btn"
                :class="combatStore.speed === s ? 'btn-gold' : ''"
                @click="combatStore.setSpeed(s)"
              >{{ s }}×</button>
            </div>
          </div>
        </div>

        <button class="pixel-btn" @click="router.push('/')">← Menu</button>
      </div>
    </div>

    <div class="content">
      <!-- Enemy — full width, always visible -->
      <EnemyPanel />

      <!-- Character — full width, always visible -->
      <CharacterPanel class="char-wide" />

      <!-- Panel area: side nav + main content -->
      <div class="panel-area">
        <!-- Side navigation -->
        <nav class="side-nav">
          <button
            v-for="item in NAV_ITEMS"
            :key="item.id"
            class="nav-btn"
            :class="{ 'nav-active': activePanel === item.id }"
            @click="activePanel = item.id"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </button>
        </nav>

        <!-- Selected panel -->
        <div class="main-panel">
          <GearPanel         v-if="activePanel === 'gear'" />
          <Inventory         v-if="activePanel === 'inventory'" />
          <ZoneSelector      v-if="activePanel === 'zone'" />
          <ShopPanel         v-if="activePanel === 'shop'" />
          <AchievementsPanel v-if="activePanel === 'challenges'" />
          <CombatLog         v-if="activePanel === 'log'" class="log-fill" />
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

/* Panel area: side nav + main content */
.panel-area {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

/* Side nav — vertical on desktop */
.side-nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
  width: 76px;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 9px 4px 7px;
  background: #0e0c1c;
  border: 2px solid var(--border);
  font-family: 'Press Start 2P', monospace;
  cursor: pointer;
  width: 100%;
  transition: border-color 0.1s, background 0.1s;
}
.nav-btn:hover {
  border-color: var(--border-hi);
  background: #141228;
}
.nav-btn.nav-active {
  background: #1a1830;
  border-color: var(--gold);
}

.nav-icon  { font-size: 14px; line-height: 1; }
.nav-label { font-size: 5px; color: var(--text-dim); letter-spacing: 0.5px; }
.nav-btn.nav-active .nav-label { color: var(--gold); }

/* Main panel — fills remaining space */
.main-panel {
  flex: 1;
  min-width: 0;
}

.log-fill { min-height: 320px; }

/* Controls popover */
.controls-wrap {
  position: relative;
}
.ctrl-btn {
  font-size: 12px;
  padding: 3px 7px;
  line-height: 1;
}
.ctrl-active {
  border-color: var(--gold);
  color: var(--gold);
}
.ctrl-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 200;
  background: #0e0c1e;
  border: 2px solid var(--border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
  box-shadow: 4px 4px 0 #000;
}
.pause-btn  { width: 100%; text-align: center; font-size: 7px; }
.speed-row  { display: flex; gap: 4px; }
.speed-btn  { flex: 1; text-align: center; font-size: 7px; padding: 4px 2px; }

/* Mobile: side nav becomes horizontal tab bar */
@media (max-width: 639px) {
  .panel-area {
    flex-direction: column;
  }
  .side-nav {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }
  .nav-btn {
    flex: 1;
    min-width: 56px;
    padding: 7px 2px 5px;
  }
  .nav-icon  { font-size: 12px; }
  .nav-label { font-size: 5px; }
}
</style>
