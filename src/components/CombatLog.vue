<script setup lang="ts">
import { computed, watch, ref, nextTick } from 'vue'
import { useCombatStore } from '../stores/combat'
import type { CombatLogEntry } from '../types/index'

const combatStore = useCombatStore()
const logEl = ref<HTMLElement | null>(null)

const entryClass: Record<CombatLogEntry['type'], string> = {
  hit:     'l-hit',
  crit:    'l-crit',
  miss:    'l-miss',
  loot:    'l-loot',
  levelup: 'l-level',
  death:   'l-death',
  regen:   'l-regen',
  sell:    'l-sell',
  zone:    'l-zone',
}

type FilterMode = 'all' | 'combat' | 'loot' | 'system'
const filterMode = ref<FilterMode>('all')

const COMBAT_TYPES = new Set<CombatLogEntry['type']>(['hit', 'crit', 'miss'])
const LOOT_TYPES   = new Set<CombatLogEntry['type']>(['loot', 'sell'])
const SYSTEM_TYPES = new Set<CombatLogEntry['type']>(['levelup', 'death', 'regen', 'zone'])

const log = computed(() => {
  const entries = [...combatStore.combatLog].reverse()
  if (filterMode.value === 'all') return entries
  if (filterMode.value === 'combat') return entries.filter(e => COMBAT_TYPES.has(e.type))
  if (filterMode.value === 'loot')   return entries.filter(e => LOOT_TYPES.has(e.type))
  return entries.filter(e => SYSTEM_TYPES.has(e.type))
})

watch(
  () => combatStore.combatLog.length,
  async () => {
    await nextTick()
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  },
)
</script>

<template>
  <div class="pixel-panel flex flex-col h-full min-h-0">
    <div class="panel-title">Combat Log</div>

    <!-- Session stats -->
    <div v-if="combatStore.isRunning || combatStore.session.kills > 0" class="session-stats">
      <span class="stat-chip">⚔️ {{ combatStore.session.kills }}</span>
      <span class="stat-chip">👑 {{ combatStore.session.bossKills }}</span>
      <span class="stat-chip">🎁 {{ combatStore.session.itemsLooted }}</span>
      <span class="stat-chip gold">💰 {{ combatStore.session.goldEarned }}g</span>
    </div>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button class="filter-tab" :class="{ active: filterMode === 'all' }"    @click="filterMode = 'all'">All</button>
      <button class="filter-tab" :class="{ active: filterMode === 'combat' }" @click="filterMode = 'combat'">Combat</button>
      <button class="filter-tab" :class="{ active: filterMode === 'loot' }"   @click="filterMode = 'loot'">Loot</button>
      <button class="filter-tab" :class="{ active: filterMode === 'system' }" @click="filterMode = 'system'">System</button>
    </div>

    <div ref="logEl" class="log-body">
      <div
        v-for="entry in log"
        :key="entry.id"
        :class="['log-entry', entryClass[entry.type]]"
      >&gt; {{ entry.message }}</div>
      <div v-if="!log.length" class="log-empty">{{ combatStore.combatLog.length ? 'No entries for this filter.' : 'Awaiting combat...' }}</div>
    </div>
  </div>
</template>

<style scoped>
.session-stats {
  display: flex;
  gap: 6px;
  padding: 4px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-wrap: wrap;
}
.stat-chip {
  font-size: 8px;
  color: var(--text-dim);
  white-space: nowrap;
}
.stat-chip.gold { color: var(--gold); }

.filter-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.filter-tab {
  flex: 1;
  font-size: 7px;
  padding: 4px 2px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-family: inherit;
  transition: color 0.1s, border-color 0.1s;
}
.filter-tab:hover { color: var(--text); }
.filter-tab.active { color: #c090f0; border-bottom-color: #8060c0; }

.log-body {
  flex: 1;
  overflow-y: auto;
  padding: 6px 10px 10px;
  display: flex;
  flex-direction: column-reverse;
  min-height: 0;
  max-height: 300px;
  scrollbar-width: thin;
  scrollbar-color: #40386a transparent;
}
.log-body::-webkit-scrollbar       { width: 4px; }
.log-body::-webkit-scrollbar-track { background: #100e20; }
.log-body::-webkit-scrollbar-thumb { background: #40386a; }
.log-entry {
  font-size: 8.5px;
  line-height: 2.2;
  padding: 0 2px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.log-empty { font-size: 9px; color: var(--text-dim); text-align: center; padding: 20px 0; }
.l-hit    { color: #e0d8f0; }
.l-crit   { color: #f0d820; }
.l-miss   { color: #7868a0; }
.l-loot   { color: #58d880; }
.l-death  { color: #e03838; }
.l-regen  { color: #40d898; }
.l-level  { color: var(--gold); }
.l-sell   { color: #d8a060; }
.l-zone   { color: #8898e0; }
</style>
