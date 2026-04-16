<script setup lang="ts">
import { computed, ref } from 'vue'
import { useZoneStore } from '../stores/zone'
import { useCharacterStore } from '../stores/character'
import { LS_KEYS } from '../utils/storage'
import type { ZoneId } from '../types/index'

const zoneStore = useZoneStore()
const characterStore = useCharacterStore()

const ZONES: { id: ZoneId; label: string; unlockLevel: number; icon: string }[] = [
  { id: 'forest',      label: 'Forest',      unlockLevel: 1,  icon: '🌲' },
  { id: 'dungeon',     label: 'Dungeon',     unlockLevel: 8,  icon: '💀' },
  { id: 'volcano',     label: 'Volcano',     unlockLevel: 20, icon: '🌋' },
  { id: 'abyss',       label: 'Abyss',       unlockLevel: 35, icon: '🕳️' },
  { id: 'shadowrealm', label: 'Shadowrealm', unlockLevel: 50, icon: '🌑' },
  { id: 'celestial',   label: 'Celestial',   unlockLevel: 65, icon: '✨' },
  { id: 'void',        label: 'Void',        unlockLevel: 80, icon: '🌀' },
  { id: 'nightmare',   label: 'Nightmare',   unlockLevel: 95, icon: '👁️' },
]

const unlocked = computed(() => characterStore.unlockedZones)

function isUnlocked(zone: ZoneId) {
  return unlocked.value.includes(zone)
}

function select(zone: ZoneId) {
  if (!isUnlocked(zone)) return
  zoneStore.selectPending(zone)
}

function travel() {
  zoneStore.confirmPending()
}

const collapsed = ref(localStorage.getItem(LS_KEYS.collapsed.zone) === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem(LS_KEYS.collapsed.zone, String(collapsed.value))
}
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title" @click="toggleCollapse">
      Zone
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>
    <div v-if="!collapsed" class="inner">
      <button
        v-for="zone in ZONES"
        :key="zone.id"
        class="zone-btn"
        :class="{
          'zone-active': zoneStore.activeZone === zone.id,
          'zone-pending': zoneStore.pendingZone === zone.id && zoneStore.pendingZone !== zoneStore.activeZone,
          'zone-locked': !isUnlocked(zone.id),
        }"
        :disabled="!isUnlocked(zone.id)"
        @click="select(zone.id)"
      >
        <span>{{ zone.icon }} {{ zone.label.toUpperCase() }}</span>
        <span v-if="!isUnlocked(zone.id)" class="zone-lock">LV.{{ zone.unlockLevel }}</span>
        <span v-else-if="zoneStore.activeZone === zone.id" class="zone-active-label">active</span>
      </button>
      <button
        v-if="zoneStore.pendingZone !== zoneStore.activeZone"
        class="travel-btn"
        @click="travel"
      >
        ▶ Travel to {{ ZONES.find(z => z.id === zoneStore.pendingZone)?.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 5px; }
.zone-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--text);
  background: #1e1c38;
  border: 2px solid var(--border);
  padding: 7px 8px;
  cursor: pointer;
  box-shadow: 2px 2px 0 #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  top: 0; left: 0;
  width: 100%;
}
.zone-btn:hover:not(:disabled) { border-color: var(--border-hi); }
.zone-btn:active:not(:disabled) { top: 2px; left: 2px; box-shadow: none; }
.zone-active  { border-color: var(--gold); color: var(--gold); background: rgba(100,70,20,0.15); }
.zone-pending { border-color: #5a9fff; color: #5a9fff; background: rgba(40,80,160,0.15); }
.zone-locked  { opacity: 0.45; cursor: not-allowed; color: var(--text-dim); }
.zone-lock    { font-size: 7px; color: var(--text-dim); }
.zone-active-label { font-size: 7px; color: var(--gold-dim); }
.travel-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  margin-top: 4px;
  padding: 8px;
  width: 100%;
  background: #1a3a6a;
  border: 2px solid #5a9fff;
  color: #5a9fff;
  cursor: pointer;
  box-shadow: 2px 2px 0 #000;
}
.travel-btn:hover { background: #1f4a8a; }
.travel-btn:active { box-shadow: none; transform: translate(2px, 2px); }
</style>
