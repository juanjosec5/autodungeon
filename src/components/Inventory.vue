<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { getOffClassPenalty } from '../game/formulas'
import type { Item } from '../types/index'

const characterStore = useCharacterStore()
const char = computed(() => characterStore.character)
const tooltip = ref<{ item: Item; x: number; y: number } | null>(null)

const SLOTS = 20

const rarityBorder: Record<string, string> = {
  common:    'border-gray-600',
  uncommon:  'border-blue-500',
  rare:      'border-yellow-500',
  epic:      'border-purple-500',
  legendary: 'border-amber-400',
}

const rarityBg: Record<string, string> = {
  common:    'bg-gray-800',
  uncommon:  'bg-blue-950/60',
  rare:      'bg-yellow-950/60',
  epic:      'bg-purple-950/60',
  legendary: 'bg-amber-950/60',
}

const rarityText: Record<string, string> = {
  common:    'text-gray-400',
  uncommon:  'text-blue-400',
  rare:      'text-yellow-400',
  epic:      'text-purple-400',
  legendary: 'text-amber-400',
}

function canEquip(item: Item): boolean {
  if (!char.value) return false
  return getOffClassPenalty(item, char.value.class) !== 0
}

function equipItem(item: Item) {
  if (!canEquip(item)) return
  characterStore.equipItem(item)
  tooltip.value = null
}

function showTooltip(item: Item, e: MouseEvent) {
  tooltip.value = { item, x: (e.target as HTMLElement).getBoundingClientRect().right + 8, y: (e.target as HTMLElement).getBoundingClientRect().top }
}

function hideTooltip() {
  tooltip.value = null
}

function statSummary(item: Item): string {
  const s = item.stats
  const parts: string[] = []
  if (s.minDmg !== undefined) parts.push(`${s.minDmg}–${s.maxDmg} dmg`)
  if (s.defBonus) parts.push(`+${s.defBonus} DEF`)
  if (s.hpBonus)  parts.push(`+${s.hpBonus} HP`)
  return parts.join(' · ')
}

const slots = computed(() => {
  const inv = char.value?.inventory ?? []
  return Array.from({ length: SLOTS }, (_, i) => inv[i] ?? null)
})
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Inventory</span>
      <span class="text-xs text-gray-600">{{ char?.inventory.length ?? 0 }} / {{ SLOTS }}</span>
    </div>

    <div class="grid grid-cols-5 gap-1.5">
      <div
        v-for="(item, i) in slots"
        :key="i"
        class="aspect-square rounded-lg border flex items-center justify-center relative cursor-default transition-all"
        :class="item
          ? [rarityBorder[item.rarity], rarityBg[item.rarity], canEquip(item) ? 'cursor-pointer hover:brightness-125' : 'opacity-50 cursor-not-allowed']
          : 'border-gray-800 bg-gray-800/30'"
        @click="item && equipItem(item)"
        @mouseenter="item && showTooltip(item, $event)"
        @mouseleave="hideTooltip"
      >
        <span v-if="item" :class="['text-xs font-bold leading-none select-none', rarityText[item.rarity]]">
          {{ item.type === 'weapon' ? '⚔' : '🛡' }}
        </span>
      </div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <div
        v-if="tooltip"
        class="fixed z-50 bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl text-xs pointer-events-none w-48"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <p :class="['font-bold mb-1', rarityText[tooltip.item.rarity]]">{{ tooltip.item.name }}</p>
        <p class="text-gray-500 capitalize mb-1">{{ tooltip.item.rarity }} {{ tooltip.item.type }}</p>
        <p class="text-gray-300">{{ statSummary(tooltip.item) }}</p>
        <div v-if="tooltip.item.stats.special?.length" class="mt-1.5 flex flex-col gap-0.5">
          <span
            v-for="s in tooltip.item.stats.special"
            :key="s.type"
            class="text-purple-400"
          >✦ {{ s.type }}</span>
        </div>
        <p
          v-if="char && getOffClassPenalty(tooltip.item, char.class) === 0"
          class="text-red-400 mt-1.5"
        >Cannot equip (wrong class)</p>
        <p
          v-else-if="char && getOffClassPenalty(tooltip.item, char.class) < 1"
          class="text-yellow-600 mt-1.5"
        >⚠ 70% effectiveness</p>
      </div>
    </Teleport>
  </div>
</template>
