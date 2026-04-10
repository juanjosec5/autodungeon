<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'

const characterStore = useCharacterStore()
const char = computed(() => characterStore.character)

const hpPercent = computed(() => {
  if (!char.value) return 0
  return Math.max(0, Math.min(100, (char.value.currentHP / char.value.maxHP) * 100))
})

const xpPercent = computed(() => {
  if (!char.value) return 0
  return Math.max(0, Math.min(100, (char.value.xp / char.value.xpToNext) * 100))
})

const hpBarColor = computed(() => {
  const pct = hpPercent.value
  if (pct > 50) return 'bg-green-500'
  if (pct > 25) return 'bg-yellow-400'
  return 'bg-red-500'
})

const classBadgeColor: Record<string, string> = {
  warrior: 'bg-orange-900/50 text-orange-300 border-orange-700/50',
  rogue:   'bg-purple-900/50 text-purple-300 border-purple-700/50',
  mage:    'bg-blue-900/50   text-blue-300   border-blue-700/50',
}
</script>

<template>
  <div v-if="char" class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
    <!-- Name + class + level -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span class="font-bold text-gray-100 truncate">{{ char.name }}</span>
        <span
          :class="['text-xs px-2 py-0.5 rounded border font-semibold uppercase tracking-wide', classBadgeColor[char.class]]"
        >{{ char.class }}</span>
      </div>
      <span class="text-amber-400 font-bold text-sm shrink-0">Lv. {{ char.level }}</span>
    </div>

    <!-- HP bar -->
    <div>
      <div class="flex justify-between text-xs text-gray-400 mb-1">
        <span>HP</span>
        <span>{{ char.currentHP }} / {{ char.maxHP }}</span>
      </div>
      <div class="h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          :class="['h-full rounded-full transition-all duration-300', hpBarColor]"
          :style="{ width: hpPercent + '%' }"
        />
      </div>
    </div>

    <!-- XP bar -->
    <div>
      <div class="flex justify-between text-xs text-gray-400 mb-1">
        <span>XP</span>
        <span>{{ char.xp }} / {{ char.xpToNext }}</span>
      </div>
      <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          class="h-full bg-amber-500 rounded-full transition-all duration-300"
          :style="{ width: xpPercent + '%' }"
        />
      </div>
    </div>

    <!-- Stats + gold -->
    <div class="flex items-center justify-between pt-1 border-t border-gray-800">
      <div class="flex gap-4 text-xs">
        <span class="text-gray-400">STR <span class="text-gray-200 font-mono">{{ char.stats.str }}</span></span>
        <span class="text-gray-400">DEX <span class="text-gray-200 font-mono">{{ char.stats.dex }}</span></span>
        <span class="text-gray-400">INT <span class="text-gray-200 font-mono">{{ char.stats.int }}</span></span>
      </div>
      <span class="text-amber-400 text-xs font-semibold">{{ char.gold }}g</span>
    </div>
  </div>
</template>
