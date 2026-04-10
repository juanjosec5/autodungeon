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
</script>

<template>
  <div v-if="char" class="pixel-panel">
    <div class="panel-title">Player</div>
    <div class="inner">
      <div class="char-header">
        <span class="char-name">{{ char.name }}</span>
        <span class="char-level">LV.{{ char.level }}</span>
      </div>
      <div class="bars">
        <div class="bar-row">
          <span class="bar-lbl">HP</span>
          <div class="bar-track"><div class="bar-fill bar-hp" :style="{ width: hpPercent + '%' }"></div></div>
          <span class="bar-val">{{ char.currentHP }}/{{ char.maxHP }}</span>
        </div>
        <div class="bar-row">
          <span class="bar-lbl">XP</span>
          <div class="bar-track"><div class="bar-fill bar-xp" :style="{ width: xpPercent + '%' }"></div></div>
          <span class="bar-val">{{ char.xp }}/{{ char.xpToNext }}</span>
        </div>
      </div>
      <div class="stats-row">
        <div class="stats">
          <span class="stat">STR <b>{{ char.stats.str }}</b></span>
          <span class="stat">DEX <b>{{ char.stats.dex }}</b></span>
          <span class="stat">INT <b>{{ char.stats.int }}</b></span>
        </div>
        <span class="gold">{{ char.gold }}g</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 10px; }
.char-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 4px; }
.char-name { font-size: 9px; color: var(--text-hi); line-height: 1.6; }
.char-level { font-size: 7px; color: var(--gold); white-space: nowrap; }
.bars { display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: flex; align-items: center; gap: 8px; }
.bar-lbl { font-size: 6px; color: var(--text); width: 18px; flex-shrink: 0; }
.bar-val { font-size: 6px; color: var(--text); width: 64px; text-align: right; flex-shrink: 0; }
.stats-row { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border); }
.stats { display: flex; gap: 12px; }
.stat { font-size: 6px; color: var(--text-dim); }
.stat b { color: var(--text); font-weight: normal; }
.gold { font-size: 6px; color: var(--gold); }
</style>
