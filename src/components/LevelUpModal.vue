<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useCombatStore } from '../stores/combat'
import { useProgressionStore } from '../stores/progression'
import { useAutoPickSetting } from '../composables/useAutoPickSetting'
import type { UpgradeDef } from '../game/upgrades'

const characterStore = useCharacterStore()
const combatStore = useCombatStore()
const progressionStore = useProgressionStore()
const { alwaysAuto, toggleAlwaysAuto: _toggleAlwaysAuto } = useAutoPickSetting()

// ── Choices rolled for current pending level-up ──────────────────────────────
const choices = ref<UpgradeDef[]>([])
const visible = computed(() => (characterStore.character?.pendingLevelUps ?? 0) > 0)

// First-time hint
const hasSeenLevelUp = ref(localStorage.getItem('hasSeenLevelUp') === 'true')

watch(visible, (show) => {
  if (!show) return
  choices.value = characterStore.getUpgradeChoices()
  if (alwaysAuto.value) {
    pickUpgrade(null)
  }
}, { immediate: true })

// ── Picking an upgrade ───────────────────────────────────────────────────────
function pickUpgrade(upgradeId: string | null): void {
  if (upgradeId) {
    characterStore.selectUpgrade(upgradeId as import('../types/index').UpgradeId)
  } else {
    characterStore.autoSelectUpgrade(choices.value)
  }
  // If no more pending level-ups, resume combat — but only if no unlock modal
  // is about to appear (unlock watcher in GameView handles pausing; if we resume
  // here the unlock modal would show with combat running briefly).
  if ((characterStore.character?.pendingLevelUps ?? 0) === 0) {
    if (!progressionStore.pendingUnlockModal) {
      combatStore.resumeAfterLevelUp()
    }
    // If there IS a pending unlock, GameView's watcher keeps combat paused and
    // handleUnlockConfirm will call resumeCombat() when the modal is dismissed.
  } else {
    // Re-roll for the next pending level-up
    choices.value = characterStore.getUpgradeChoices()
    if (alwaysAuto.value) {
      pickUpgrade(null)
    }
  }
}

function toggleAlwaysAuto(): void {
  _toggleAlwaysAuto()
  // If auto was just turned ON while the modal is open, pick immediately
  if (alwaysAuto.value && visible.value) {
    pickUpgrade(null)
  }
}

function dismissFirstTimeHint(): void {
  hasSeenLevelUp.value = true
  localStorage.setItem('hasSeenLevelUp', 'true')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="levelup">
      <div v-if="visible && !alwaysAuto" class="lu-overlay">
        <div class="lu-modal pixel-panel">
          <!-- Header -->
          <div class="lu-header">
            <span class="lu-star">★</span>
            <span class="lu-title">LEVEL UP!</span>
            <span class="lu-level">→ Lv {{ characterStore.character?.level }}</span>
            <span v-if="(characterStore.character?.pendingLevelUps ?? 0) > 1" class="lu-queue">
              (+{{ (characterStore.character?.pendingLevelUps ?? 1) - 1 }} more)
            </span>
          </div>

          <!-- First-time hint -->
          <div v-if="!hasSeenLevelUp" class="lu-first-hint">
            <span>Game is paused — choose an upgrade.</span>
            <span>Turn on Auto-pick below to skip this.</span>
            <button class="lu-hint-dismiss" @click="dismissFirstTimeHint">✕</button>
          </div>

          <p class="lu-sub">Choose an upgrade:</p>

          <!-- Upgrade cards -->
          <div class="lu-cards">
            <button
              v-for="choice in choices"
              :key="choice.id"
              class="lu-card pixel-btn"
              @click="pickUpgrade(choice.id)"
            >
              <span class="card-name">{{ choice.name }}</span>
              <span class="card-desc">{{ choice.description }}</span>
            </button>
          </div>

          <!-- Auto-select row -->
          <div class="lu-auto-row">
            <button class="lu-auto-btn pixel-btn" @click="pickUpgrade(null)">
              Auto-select ▶
            </button>
          </div>

          <!-- Pill toggle -->
          <div class="auto-toggle-row">
            <button
              class="pill-toggle"
              :class="{ active: alwaysAuto }"
              :aria-label="alwaysAuto ? 'Auto-pick on' : 'Auto-pick off'"
              @click="toggleAlwaysAuto"
            >
              <span class="pill-knob" />
            </button>
            <span class="auto-toggle-label">Auto-pick upgrades</span>
            <span class="auto-toggle-hint" :class="{ 'hint-on': alwaysAuto }">
              {{ alwaysAuto ? 'Upgrades picked automatically' : 'Game pauses — you choose' }}
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lu-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.78);
}

.lu-modal {
  padding: 24px 20px 20px;
  max-width: 420px;
  width: calc(100% - 24px);
  text-align: center;
}

/* Header */
.lu-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.lu-star  { font-size: 18px; color: var(--gold); }
.lu-title { font-size: 14px; color: var(--gold); letter-spacing: 2px; }
.lu-level { font-size: 10px; color: var(--text-dim); }
.lu-queue { font-size: 8px;  color: var(--text-dim); }

/* First-time hint */
.lu-first-hint {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: rgba(255, 200, 60, 0.06);
  border: 1px solid rgba(255, 200, 60, 0.3);
  border-left: 3px solid var(--gold);
  padding: 6px 28px 6px 10px;
  margin-bottom: 10px;
  text-align: left;
  font-size: 6px;
  color: var(--text-dim);
  line-height: 1.6;
}

.lu-hint-dismiss {
  position: absolute;
  top: 4px;
  right: 6px;
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-family: inherit;
  font-size: 7px;
  padding: 0;
  line-height: 1;
}
.lu-hint-dismiss:hover { color: var(--text); }

.lu-sub {
  font-size: 8px;
  color: var(--text-dim);
  margin-bottom: 14px;
}

/* Cards */
.lu-cards {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.lu-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 110px;
  min-height: 72px;
  padding: 10px 8px;
  cursor: pointer;
  text-align: center;
}

.lu-card:hover {
  border-color: var(--gold);
  color: var(--gold);
}

.card-name {
  font-size: 8px;
  color: inherit;
  line-height: 1.4;
}

.card-desc {
  font-size: 7px;
  color: var(--text-dim);
  line-height: 1.5;
}

.lu-card:hover .card-desc {
  color: var(--gold);
}

/* Auto-select row */
.lu-auto-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}

.lu-auto-btn {
  font-size: 7px;
  padding: 4px 8px;
  white-space: nowrap;
}

/* Pill toggle */
.auto-toggle-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.auto-toggle-label {
  font-size: 7px;
  color: var(--text-dim);
}

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

.auto-toggle-hint {
  font-size: 6px;
  color: var(--text-dim);
}

.auto-toggle-hint.hint-on {
  color: var(--gold);
}

/* Transition */
.levelup-enter-active { transition: opacity 0.18s, transform 0.18s; }
.levelup-leave-active { transition: opacity 0.18s, transform 0.18s; }
.levelup-enter-from, .levelup-leave-to { opacity: 0; transform: scale(0.96); }
</style>
