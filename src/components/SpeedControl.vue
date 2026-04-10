<script setup lang="ts">
import { useCombatStore } from '../stores/combat'

const combatStore = useCombatStore()

const SPEEDS = [0.5, 1, 2, 4] as const

function togglePause() {
  if (combatStore.isPaused) {
    combatStore.resumeCombat()
  } else {
    combatStore.pauseCombat()
  }
}
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title">Controls</div>
    <div class="inner">
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
          :class="combatStore.speed === s ? 'btn-gold' : ''"
          @click="combatStore.setSpeed(s)"
        >{{ s }}×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 6px; }
.pause-btn { width: 100%; text-align: center; }
.speed-row { display: flex; gap: 6px; }
.speed-btn { flex: 1; text-align: center; }
</style>
