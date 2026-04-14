<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSaveStore } from '../stores/save'
import { useCombatStore } from '../stores/combat'
import { useZoneStore } from '../stores/zone'
import { useCharacterStore } from '../stores/character'
import { useAchievementStore } from '../stores/achievement'
import CharacterPanel from '../components/CharacterPanel.vue'
import EnemyPanel from '../components/EnemyPanel.vue'
import CombatLog from '../components/CombatLog.vue'
import ItemsPanel from '../components/ItemsPanel.vue'
import ZoneSelector from '../components/ZoneSelector.vue'
import DeathModal from '../components/DeathModal.vue'
import LevelUpModal from '../components/LevelUpModal.vue'
import OfflineRewardModal from '../components/OfflineRewardModal.vue'
import ShopPanel from '../components/ShopPanel.vue'
import CodexPanel from '../components/CodexPanel.vue'
import EnchantPanel from '../components/EnchantPanel.vue'
import AchievementsPanel from '../components/AchievementsPanel.vue'
import PrestigePanel from '../components/PrestigePanel.vue'

const router = useRouter()
const saveStore = useSaveStore()
const combatStore = useCombatStore()
const zoneStore = useZoneStore()
const characterStore = useCharacterStore()
const achievementStore = useAchievementStore()

type PanelId = 'items' | 'zone' | 'shop' | 'codex' | 'enchant' | 'challenges' | 'log' | 'prestige'

const activePanel = ref<PanelId>('items')

const NAV_ITEMS: { id: PanelId; icon: string; label: string }[] = [
  { id: 'items',      icon: '⚔',  label: 'Items'      },
  { id: 'zone',       icon: '🗺', label: 'Zone'       },
  { id: 'shop',       icon: '🛒', label: 'Shop'       },
  { id: 'codex',      icon: '📖', label: 'Codex'      },
  { id: 'enchant',    icon: '✦',  label: 'Enchant'    },
  { id: 'challenges', icon: '🏆', label: 'Challenges' },
  { id: 'log',        icon: '📜', label: 'Log'        },
  { id: 'prestige',   icon: '⚡',  label: 'Ascend'     },
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
  // If there are offline rewards pending, OfflineRewardModal will start combat
  // once the player dismisses it. Otherwise start immediately.
  if (!characterStore.pendingOfflineResult) {
    combatStore.startCombat()
  }
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

        <!-- Controls popover trigger -->
        <div class="controls-wrap">
          <button
            class="pixel-btn ctrl-btn"
            :class="{ 'ctrl-active': showControls }"
            @click="showControls = !showControls"
            title="Speed controls"
          ><span class="ctrl-icon">⚙</span></button>
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
          <ItemsPanel        v-if="activePanel === 'items'" />
          <ZoneSelector      v-if="activePanel === 'zone'" />
          <ShopPanel         v-if="activePanel === 'shop'" />
          <CodexPanel        v-if="activePanel === 'codex'" />
          <EnchantPanel      v-if="activePanel === 'enchant'" />
          <AchievementsPanel v-if="activePanel === 'challenges'" />
          <CombatLog         v-if="activePanel === 'log'" class="log-fill" />
          <PrestigePanel     v-if="activePanel === 'prestige'" />
        </div>
      </div>
    </div>

    <DeathModal />
    <LevelUpModal />
    <OfflineRewardModal />
  </div>
</template>

<style scoped>
.game-root {
  min-height: 100vh;
  padding: 12px;
  overflow-x: hidden;
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
  display: flex;
  align-items: center;
  justify-content: center;
}
.ctrl-icon {
  display: block;
  transform: translateY(-2px);
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
  /* Header: compact title, hide verbose meta, push controls right */
  .game-title {
    font-size: 10px;
    letter-spacing: 1px;
  }
  .game-meta {
    margin-left: auto;
    flex-wrap: nowrap;
  }
  .meta-saving,
  .meta-saved,
  .meta-user {
    display: none;
  }

  /* Panel area: stack nav on top */
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
