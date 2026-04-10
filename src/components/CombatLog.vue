<script setup lang="ts">
import { computed, watch, ref, nextTick } from 'vue'
import { useCombatStore } from '../stores/combat'
import type { CombatLogEntry } from '../types/index'

const combatStore = useCombatStore()
const logEl = ref<HTMLElement | null>(null)

const entryColor: Record<CombatLogEntry['type'], string> = {
  hit:     'text-gray-300',
  crit:    'text-yellow-300 font-semibold',
  miss:    'text-gray-500',
  loot:    'text-green-400',
  levelup: 'text-amber-400 font-semibold',
  death:   'text-red-400 font-semibold',
  regen:   'text-teal-400',
  sell:    'text-orange-400',
  zone:    'text-blue-400',
}

// Auto-scroll to bottom on new entries
watch(
  () => combatStore.combatLog.length,
  async () => {
    await nextTick()
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  },
)

function relativeTime(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 5) return 'now'
  if (diff < 60) return `${diff}s ago`
  return `${Math.floor(diff / 60)}m ago`
}

const log = computed(() => [...combatStore.combatLog].reverse())
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-full min-h-0">
    <div class="px-4 py-2 border-b border-gray-800 shrink-0">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Combat Log</span>
    </div>
    <div
      ref="logEl"
      class="flex-1 overflow-y-auto px-4 py-3 flex flex-col-reverse gap-0.5 text-xs"
      style="max-height: 280px;"
    >
      <div
        v-for="entry in log"
        :key="entry.id"
        class="flex items-baseline justify-between gap-2"
      >
        <span :class="entryColor[entry.type]">{{ entry.message }}</span>
        <span class="text-gray-700 shrink-0 tabular-nums">{{ relativeTime(entry.timestamp) }}</span>
      </div>
      <div v-if="!combatStore.combatLog.length" class="text-gray-600 text-center py-4">
        Awaiting combat...
      </div>
    </div>
  </div>
</template>
