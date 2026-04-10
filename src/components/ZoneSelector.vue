<script setup lang="ts">
import { computed } from 'vue'
import { useZoneStore } from '../stores/zone'
import { useCharacterStore } from '../stores/character'
import type { ZoneId } from '../types/index'

const zoneStore = useZoneStore()
const characterStore = useCharacterStore()

const ZONES: { id: ZoneId; label: string; unlockLevel: number; icon: string }[] = [
  { id: 'forest',  label: 'Forest',  unlockLevel: 1,  icon: '🌲' },
  { id: 'dungeon', label: 'Dungeon', unlockLevel: 5,  icon: '💀' },
  { id: 'volcano', label: 'Volcano', unlockLevel: 12, icon: '🌋' },
]

const unlocked = computed(() => characterStore.unlockedZones)

function isUnlocked(zone: ZoneId) {
  return unlocked.value.includes(zone)
}

function select(zone: ZoneId) {
  if (!isUnlocked(zone)) return
  zoneStore.setZone(zone)
}
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
    <span class="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">Zone</span>
    <div class="flex flex-col gap-2">
      <button
        v-for="zone in ZONES"
        :key="zone.id"
        @click="select(zone.id)"
        :disabled="!isUnlocked(zone.id)"
        :class="[
          'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all border',
          zoneStore.activeZone === zone.id
            ? 'bg-amber-900/30 border-amber-600/60 text-amber-300'
            : isUnlocked(zone.id)
              ? 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50'
              : 'border-gray-800 text-gray-600 cursor-not-allowed opacity-50',
        ]"
      >
        <span>{{ zone.icon }} {{ zone.label }}</span>
        <span v-if="!isUnlocked(zone.id)" class="text-xs text-gray-600">Lv. {{ zone.unlockLevel }}</span>
        <span v-else-if="zoneStore.activeZone === zone.id" class="text-xs text-amber-600">active</span>
      </button>
    </div>
  </div>
</template>
