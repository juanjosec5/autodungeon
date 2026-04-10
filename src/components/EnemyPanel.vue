<script setup lang="ts">
import { computed } from 'vue'
import { useCombatStore } from '../stores/combat'

const combatStore = useCombatStore()
const enemy = computed(() => combatStore.currentEnemy)

const hpPercent = computed(() => {
  if (!enemy.value) return 0
  return Math.max(0, Math.min(100, (enemy.value.hp / enemy.value.maxHp) * 100))
})

const zoneBadgeColor: Record<string, string> = {
  forest:  'bg-green-900/50 text-green-300 border-green-700/50',
  dungeon: 'bg-gray-700/50  text-gray-300  border-gray-600/50',
  volcano: 'bg-red-900/50   text-red-300   border-red-700/50',
}
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
    <template v-if="enemy">
      <!-- Name + zone badge -->
      <div class="flex items-center justify-between gap-2">
        <span class="font-bold text-gray-100 animate-pulse">{{ enemy.name }}</span>
        <span
          :class="['text-xs px-2 py-0.5 rounded border font-semibold uppercase tracking-wide', zoneBadgeColor[enemy.zone]]"
        >{{ enemy.zone }}</span>
      </div>

      <!-- HP bar -->
      <div>
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span>HP</span>
          <span>{{ enemy.hp }} / {{ enemy.maxHp }}</span>
        </div>
        <div class="h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-red-500 rounded-full transition-all duration-300"
            :style="{ width: hpPercent + '%' }"
          />
        </div>
      </div>

      <!-- ATK + DEF -->
      <div class="flex gap-4 text-xs pt-1 border-t border-gray-800">
        <span class="text-gray-400">ATK <span class="text-gray-200 font-mono">{{ enemy.atk[0] }}–{{ enemy.atk[1] }}</span></span>
        <span class="text-gray-400">DEF <span class="text-gray-200 font-mono">{{ enemy.def }}</span></span>
        <span class="text-gray-400">SPD <span class="text-gray-200 font-mono">{{ (enemy.attackSpeed / 1000).toFixed(1) }}s</span></span>
      </div>
    </template>

    <div v-else class="text-gray-600 text-sm text-center py-2">No enemy</div>
  </div>
</template>
