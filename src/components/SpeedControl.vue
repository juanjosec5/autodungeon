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
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3 flex-wrap">
    <!-- Play / Pause -->
    <button
      @click="togglePause"
      :disabled="!combatStore.isRunning"
      :class="[
        'px-4 py-2 rounded-lg text-sm font-bold border transition-all',
        combatStore.isRunning
          ? 'border-amber-600/60 bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
          : 'border-gray-700 text-gray-600 cursor-not-allowed opacity-50',
      ]"
    >
      {{ combatStore.isPaused ? '▶ Resume' : '⏸ Pause' }}
    </button>

    <!-- Speed buttons -->
    <div class="flex gap-1">
      <button
        v-for="s in SPEEDS"
        :key="s"
        @click="combatStore.setSpeed(s)"
        :class="[
          'px-3 py-2 rounded-lg text-xs font-bold border transition-all',
          combatStore.speed === s
            ? 'bg-amber-500 border-amber-400 text-gray-950'
            : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200',
        ]"
      >
        {{ s }}x
      </button>
    </div>
  </div>
</template>
