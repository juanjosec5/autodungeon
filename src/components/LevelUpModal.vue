<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useCombatStore } from '../stores/combat'
import type { UpgradeDef } from '../game/upgrades'

const characterStore = useCharacterStore()
const combatStore = useCombatStore()

// ── Persistent "always auto" toggle ─────────────────────────────────────────
const alwaysAuto = ref(localStorage.getItem('levelUpAlwaysAuto') === 'true')
function toggleAlwaysAuto(): void {
  alwaysAuto.value = !alwaysAuto.value
  localStorage.setItem('levelUpAlwaysAuto', String(alwaysAuto.value))
}

// ── Choices rolled for current pending level-up ──────────────────────────────
const choices = ref<UpgradeDef[]>([])
const visible = computed(() => (characterStore.character?.pendingLevelUps ?? 0) > 0)

watch(visible, (show) => {
  if (show) {
    choices.value = characterStore.getUpgradeChoices()
    if (alwaysAuto.value) {
      // Immediate auto-pick — no modal shown
      pickUpgrade(null)
      return
    }
    startCountdown()
  } else {
    stopCountdown()
  }
})

// ── Auto-select countdown (8 s) ──────────────────────────────────────────────
const AUTO_SECONDS = 8
const secondsLeft = ref(AUTO_SECONDS)
let countdownInterval: ReturnType<typeof setInterval> | null = null

function startCountdown(): void {
  secondsLeft.value = AUTO_SECONDS
  stopCountdown()
  countdownInterval = setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      stopCountdown()
      pickUpgrade(null)  // null → auto-pick
    }
  }, 1000)
}

function stopCountdown(): void {
  if (countdownInterval !== null) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

onUnmounted(stopCountdown)

// ── Picking an upgrade ───────────────────────────────────────────────────────
function pickUpgrade(upgradeId: string | null): void {
  stopCountdown()
  if (upgradeId) {
    characterStore.selectUpgrade(upgradeId as import('../types/index').UpgradeId)
  } else {
    characterStore.autoSelectUpgrade(choices.value)
  }
  // If no more pending level-ups, resume combat
  if ((characterStore.character?.pendingLevelUps ?? 0) === 0) {
    combatStore.resumeAfterLevelUp()
  } else {
    // Re-roll for the next pending level-up
    choices.value = characterStore.getUpgradeChoices()
    if (alwaysAuto.value) {
      pickUpgrade(null)
    } else {
      startCountdown()
    }
  }
}

// ── Progress bar width ───────────────────────────────────────────────────────
const countdownPct = computed(() => (secondsLeft.value / AUTO_SECONDS) * 100)
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
            <div class="lu-countdown">
              <div class="lu-bar" :style="{ width: countdownPct + '%' }"></div>
            </div>
            <span class="lu-secs">{{ secondsLeft }}s</span>
          </div>

          <!-- Always auto toggle -->
          <button class="lu-toggle" @click="toggleAlwaysAuto">
            <span class="toggle-box">{{ alwaysAuto ? '■' : '□' }}</span>
            Always auto-select
          </button>
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
  gap: 8px;
  margin-bottom: 12px;
}

.lu-auto-btn {
  font-size: 7px;
  padding: 4px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.lu-countdown {
  flex: 1;
  height: 6px;
  background: var(--border);
  border: 1px solid var(--border);
  overflow: hidden;
}

.lu-bar {
  height: 100%;
  background: var(--gold);
  transition: width 1s linear;
}

.lu-secs {
  font-size: 7px;
  color: var(--text-dim);
  min-width: 18px;
  text-align: right;
  flex-shrink: 0;
}

/* Always-auto toggle */
.lu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 7px;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 auto;
  padding: 2px 4px;
}

.lu-toggle:hover { color: var(--text); }
.toggle-box { font-size: 9px; }

/* Transition */
.levelup-enter-active { transition: opacity 0.18s, transform 0.18s; }
.levelup-leave-active { transition: opacity 0.18s, transform 0.18s; }
.levelup-enter-from, .levelup-leave-to { opacity: 0; transform: scale(0.96); }
</style>
