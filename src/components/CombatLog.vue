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

watch(
  () => combatStore.combatLog.length,
  async () => {
    await nextTick()
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  },
)

const log = computed(() => [...combatStore.combatLog].reverse())
</script>

<template>
  <div class="pixel-panel flex flex-col h-full min-h-0">
    <div class="panel-title">Combat Log</div>
    <div ref="logEl" class="log-body">
      <div
        v-for="entry in log"
        :key="entry.id"
        :class="['log-entry', entryClass[entry.type]]"
      >&gt; {{ entry.message }}</div>
      <div v-if="!combatStore.combatLog.length" class="log-empty">Awaiting combat...</div>
    </div>
  </div>
</template>

<style scoped>
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
