<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCombatStore } from '../stores/combat'
import { usePrestigeStore } from '../stores/prestige'
import { LS_KEYS } from '../utils/storage'

const combatStore = useCombatStore()
const prestigeStore = usePrestigeStore()

const collapsed = ref(localStorage.getItem(LS_KEYS.collapsed.controls) === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem(LS_KEYS.collapsed.controls, String(collapsed.value))
}

const SPEEDS = [0.5, 1, 2, 4] as const

const canUse4x = computed(() => prestigeStore.prestigeCount >= 3)

function togglePause() {
  if (combatStore.isPaused) {
    combatStore.resumeCombat()
  } else {
    combatStore.pauseCombat()
  }
}

function setSpeed(s: 0.5 | 1 | 2 | 4) {
  if (s === 4 && !canUse4x.value) return
  combatStore.setSpeed(s)
}
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title" @click="toggleCollapse">
      Controls
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>
    <div v-if="!collapsed" class="inner">
      <button
        class="pixel-btn pause-btn"
        :class="combatStore.isPaused ? 'btn-purple' : ''"
        :disabled="!combatStore.isRunning"
        @click="togglePause"
      >
        {{ combatStore.isPaused ? '▶ RESUME' : '⏸ PAUSE' }}
      </button>
      <div class="speed-row">
        <button
          v-for="s in SPEEDS"
          :key="s"
          class="pixel-btn speed-btn"
          :class="[combatStore.speed === s ? 'btn-gold' : '', s === 4 && !canUse4x ? 'btn-locked' : '']"
          :title="s === 4 && !canUse4x ? 'Unlock after 3 prestiges' : ''"
          @click="setSpeed(s)"
        >{{ s }}×{{ s === 4 && !canUse4x ? ' 🔒' : '' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 6px; }
.pause-btn { width: 100%; text-align: center; }
.btn-locked { opacity: 0.45; cursor: not-allowed; }
.speed-row { display: flex; gap: 6px; }
.speed-btn { flex: 1; text-align: center; }
</style>
