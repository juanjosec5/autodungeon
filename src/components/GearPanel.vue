<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'
import { getOffClassPenalty } from '../game/formulas'
import type { Item } from '../types/index'

const characterStore = useCharacterStore()
const char = computed(() => characterStore.character)

const rarityColor: Record<string, string> = {
  common:    'text-gray-400',
  uncommon:  'text-blue-400',
  rare:      'text-yellow-400',
  epic:      'text-purple-400',
  legendary: 'text-amber-400',
}

function isOffClass(item: Item): boolean {
  if (!char.value) return false
  return getOffClassPenalty(item, char.value.class) < 1.0
}

function weaponSummary(item: Item): string {
  return `${item.stats.minDmg}–${item.stats.maxDmg} dmg`
}

function armorSummary(item: Item): string {
  const parts: string[] = []
  if (item.stats.defBonus) parts.push(`+${item.stats.defBonus} DEF`)
  if (item.stats.hpBonus)  parts.push(`+${item.stats.hpBonus} HP`)
  return parts.join('  ')
}

function unequip(slot: 'weapon' | 'armor') {
  characterStore.unequipItem(slot)
}
</script>

<template>
  <div v-if="char" class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
    <span class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Gear</span>

    <!-- Weapon slot -->
    <div
      class="rounded-lg border p-3 flex items-center justify-between gap-2 cursor-pointer hover:border-gray-600 transition-colors"
      :class="char.gear.weapon ? 'border-gray-700 bg-gray-800/50' : 'border-dashed border-gray-700'"
      @click="char.gear.weapon && unequip('weapon')"
    >
      <div v-if="char.gear.weapon" class="min-w-0">
        <div class="flex items-center gap-2">
          <span :class="['text-sm font-semibold truncate', rarityColor[char.gear.weapon.rarity]]">
            {{ char.gear.weapon.name }}
          </span>
          <span
            v-if="isOffClass(char.gear.weapon)"
            class="text-xs text-yellow-600 shrink-0"
            title="Off-class: 70% effectiveness"
          >⚠ 70%</span>
        </div>
        <span class="text-xs text-gray-500">{{ weaponSummary(char.gear.weapon) }}</span>
      </div>
      <div v-else class="text-gray-600 text-sm">Weapon — empty</div>
      <span v-if="char.gear.weapon" class="text-gray-600 text-xs shrink-0">click to unequip</span>
    </div>

    <!-- Armor slot -->
    <div
      class="rounded-lg border p-3 flex items-center justify-between gap-2 cursor-pointer hover:border-gray-600 transition-colors"
      :class="char.gear.armor ? 'border-gray-700 bg-gray-800/50' : 'border-dashed border-gray-700'"
      @click="char.gear.armor && unequip('armor')"
    >
      <div v-if="char.gear.armor" class="min-w-0">
        <div class="flex items-center gap-2">
          <span :class="['text-sm font-semibold truncate', rarityColor[char.gear.armor.rarity]]">
            {{ char.gear.armor.name }}
          </span>
          <span
            v-if="isOffClass(char.gear.armor)"
            class="text-xs text-yellow-600 shrink-0"
            title="Off-class: 70% effectiveness"
          >⚠ 70%</span>
        </div>
        <span class="text-xs text-gray-500">{{ armorSummary(char.gear.armor) }}</span>
      </div>
      <div v-else class="text-gray-600 text-sm">Armor — empty</div>
      <span v-if="char.gear.armor" class="text-gray-600 text-xs shrink-0">click to unequip</span>
    </div>
  </div>
</template>
