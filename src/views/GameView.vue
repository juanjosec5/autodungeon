<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSaveStore } from '../stores/save'
import { useCombatStore } from '../stores/combat'
import { useZoneStore } from '../stores/zone'
import { useCharacterStore } from '../stores/character'
import { useAchievementStore } from '../stores/achievement'
import { useTaskStore } from '../stores/tasks'
import { useProgressionStore } from '../stores/progression'
import { usePrestigeStore } from '../stores/prestige'
import { useAutoPickSetting } from '../composables/useAutoPickSetting'
import { ZONE_META } from '../game/zones'
import CharacterPanel from '../components/CharacterPanel.vue'
import EnemyPanel from '../components/EnemyPanel.vue'
import CombatLog from '../components/CombatLog.vue'
import ItemsPanel from '../components/ItemsPanel.vue'
import ZoneSelector from '../components/ZoneSelector.vue'
import DeathModal from '../components/DeathModal.vue'
import LevelUpModal from '../components/LevelUpModal.vue'
import OfflineRewardModal from '../components/OfflineRewardModal.vue'
import UnlockModal from '../components/UnlockModal.vue'
import ShopPanel from '../components/ShopPanel.vue'
import CodexPanel from '../components/CodexPanel.vue'
import EnchantPanel from '../components/EnchantPanel.vue'
import AchievementsPanel from '../components/AchievementsPanel.vue'
import PrestigePanel from '../components/PrestigePanel.vue'
import TasksPanel from '../components/TasksPanel.vue'
import type { PanelId } from '../types/index'

const router = useRouter()
const saveStore = useSaveStore()
const combatStore = useCombatStore()
const zoneStore = useZoneStore()
const characterStore = useCharacterStore()
const achievementStore = useAchievementStore()
const taskStore = useTaskStore()
const progressionStore = useProgressionStore()
const prestigeStore = usePrestigeStore()
const { alwaysAuto, toggleAlwaysAuto } = useAutoPickSetting()

const activePanel = ref<PanelId>('items')

const NAV_ITEMS: { id: PanelId; icon: string; label: string }[] = [
  { id: 'items',      icon: '⚔',  label: 'Items'      },
  { id: 'zone',       icon: '🗺', label: 'Zone'       },
  { id: 'shop',       icon: '🛒', label: 'Shop'       },
  { id: 'codex',      icon: '📖', label: 'Codex'      },
  { id: 'enchant',    icon: '✦',  label: 'Enchant'    },
  { id: 'challenges', icon: '🏆', label: 'Challenges' },
  { id: 'tasks',      icon: '📋', label: 'Tasks'      },
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

// Zone indicator
const zoneMeta = computed(() => ZONE_META[zoneStore.activeZone])

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

// Pause combat when an unlock modal is pending
watch(() => progressionStore.pendingUnlockModal, (unlock) => {
  if (unlock) combatStore.pauseCombat()
})

// Called by UnlockModal "Got it" — resume combat (if no more unlock modals queued)
// and switch to the newly unlocked panel.
function handleUnlockConfirm(panelId: PanelId): void {
  activePanel.value = panelId
  // pendingUnlockModal was already marked seen inside UnlockModal before this call.
  // If another unlock is still queued, stay paused so it can show next.
  if (!progressionStore.pendingUnlockModal) {
    if (combatStore.pausedForLevelUp) {
      combatStore.resumeAfterLevelUp()
    } else {
      combatStore.resumeCombat()
    }
  }
}

// Ensure activePanel is always in unlockedPanels (fallback on load)
watch(() => progressionStore.unlockedPanels, (panels) => {
  if (!panels.includes(activePanel.value)) {
    activePanel.value = 'items'
  }
})

onMounted(async () => {
  // Always load prestige data first — covers new-character creation path where
  // loadCharacter() is skipped and prestige multipliers must apply from the start.
  prestigeStore.loadPrestige()

  // Character already set means we just came from character creation — skip load
  if (!characterStore.character) {
    const found = await saveStore.loadCharacter()
    if (!found) {
      router.push('/')
      return
    }
  }

  // Always ensure tasks are loaded/reset-checked. loadCharacter() calls
  // loadTasks() for returning saves, but new characters skip that path.
  taskStore.loadTasks()

  // Silently mark already-unlocked panels as seen so existing chars don't get
  // a cascade of unlock modals.
  progressionStore.bulkMarkCurrentUnlocksSeen()

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

      <!-- Zone indicator -->
      <div class="zone-indicator-header">
        <span class="zone-icon" :style="{ color: zoneMeta.color }">{{ zoneMeta.icon }}</span>
        <span class="zone-name">{{ zoneMeta.label }}</span>
      </div>

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
            <!-- Auto-pick toggle -->
            <div class="auto-pick-row">
              <button
                class="pill-toggle"
                :class="{ active: alwaysAuto }"
                :aria-label="alwaysAuto ? 'Auto-pick on' : 'Auto-pick off'"
                @click="toggleAlwaysAuto"
              >
                <span class="pill-knob" />
              </button>
              <span class="auto-pick-label" :class="{ 'auto-pick-on': alwaysAuto }">
                {{ alwaysAuto ? 'Auto-pick: ON' : 'Auto-pick: off' }}
              </span>
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
        <!-- Side navigation — only unlocked panels are rendered -->
        <nav class="side-nav">
          <button
            v-for="item in NAV_ITEMS.filter(i => progressionStore.unlockedPanels.includes(i.id))"
            :key="item.id"
            class="nav-btn"
            :class="{ 'nav-active': activePanel === item.id }"
            @click="activePanel = item.id"
          >
            <span class="nav-icon-wrap">
              <span class="nav-icon">{{ item.icon }}</span>
              <span
                v-if="item.id === 'tasks' && taskStore.unclaimedCompletedCount > 0"
                class="nav-badge"
              >{{ taskStore.unclaimedCompletedCount }}</span>
              <span
                v-if="item.id === 'challenges' && achievementStore.hasClaimableReward"
                class="nav-badge nav-badge-green"
              >!</span>
            </span>
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
          <TasksPanel        v-if="activePanel === 'tasks'" />
          <CombatLog         v-if="activePanel === 'log'" class="log-fill" />
          <PrestigePanel     v-if="activePanel === 'prestige'" />
        </div>
      </div>
    </div>

    <DeathModal />
    <LevelUpModal />
    <OfflineRewardModal />
    <!-- Only show after all pending level-up picks are done; prevents both modals
         rendering simultaneously and combat resuming before upgrades are chosen. -->
    <UnlockModal
      v-if="(characterStore.character?.pendingLevelUps ?? 0) === 0"
      :on-confirm="handleUnlockConfirm"
    />
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

/* Zone indicator */
.zone-indicator-header {
  display: flex;
  align-items: center;
  gap: 4px;
}
.zone-icon {
  font-size: 10px;
  line-height: 1;
}
.zone-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: var(--text-dim);
  letter-spacing: 0.5px;
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

.nav-icon-wrap { position: relative; display: inline-flex; }
.nav-icon  { font-size: 14px; line-height: 1; }
.nav-label { font-size: 5px; color: var(--text-dim); letter-spacing: 0.5px; }
.nav-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #c0392b;
  color: #fff;
  font-size: 5px;
  min-width: 10px;
  height: 10px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
  line-height: 1;
}
.nav-badge-green {
  background: #2a7a48;
}
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
  min-width: 160px;
  box-shadow: 4px 4px 0 #000;
}
.pause-btn  { width: 100%; text-align: center; font-size: 7px; }
.speed-row  { display: flex; gap: 4px; }
.speed-btn  { flex: 1; text-align: center; font-size: 7px; padding: 4px 2px; }

/* Auto-pick row in popover */
.auto-pick-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--border);
}

.auto-pick-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  color: var(--text-dim);
  line-height: 1.4;
}
.auto-pick-on { color: var(--gold); }

/* Pill toggle (shared style for popover + modal) */
.pill-toggle {
  position: relative;
  width: 28px;
  height: 14px;
  background: #2a2840;
  border: 1px solid var(--border);
  border-radius: 7px;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.pill-toggle.active {
  background: var(--gold);
  border-color: var(--gold);
}

.pill-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  background: var(--text-dim);
  border-radius: 50%;
  transition: left 0.15s, background 0.15s;
}

.pill-toggle.active .pill-knob {
  left: 16px;
  background: #000;
}

/* Mobile: side nav becomes horizontal tab bar */
@media (max-width: 639px) {
  /* Header: compact title, hide verbose meta, push controls right */
  .game-title {
    font-size: 10px;
    letter-spacing: 1px;
  }
  .zone-indicator-header {
    display: none;
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
