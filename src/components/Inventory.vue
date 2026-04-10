<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { getOffClassPenalty } from '../game/formulas'
import type { Item } from '../types/index'

const characterStore = useCharacterStore()
const char = computed(() => characterStore.character)
const tooltip = ref<{ item: Item; x: number; y: number } | null>(null)

const SLOTS = 20

const rarityBorderClass: Record<string, string> = {
  common:    'rb-common',
  uncommon:  'rb-uncommon',
  rare:      'rb-rare',
  epic:      'rb-epic',
  legendary: 'rb-legendary',
}

const rarityTextClass: Record<string, string> = {
  common:    'rt-common',
  uncommon:  'rt-uncommon',
  rare:      'rt-rare',
  epic:      'rt-epic',
  legendary: 'rt-legendary',
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
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  tooltip.value = { item, x: rect.right + 8, y: rect.top }
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
  <div class="pixel-panel">
    <div class="panel-title">Inventory</div>
    <div class="inner">
      <div class="inv-header">
        <span class="inv-count">{{ char?.inventory.length ?? 0 }} / {{ SLOTS }}</span>
      </div>
      <div class="inv-grid">
        <div
          v-for="(item, i) in slots"
          :key="i"
          class="inv-slot"
          :class="item
            ? [rarityBorderClass[item.rarity], canEquip(item) ? 'slot-equippable' : 'slot-locked']
            : 'slot-empty'"
          @click="item && equipItem(item)"
          @mouseenter="item && showTooltip(item, $event)"
          @mouseleave="hideTooltip"
        >
          <span v-if="item" :class="['slot-icon', rarityTextClass[item.rarity]]">
            {{ item.type === 'weapon' ? '⚔' : '🛡' }}
          </span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="tooltip"
        class="tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <span :class="['tt-name', rarityTextClass[tooltip.item.rarity]]">{{ tooltip.item.name }}</span>
        <span class="tt-sub">{{ tooltip.item.rarity }} {{ tooltip.item.type }}</span>
        <span class="tt-stats">{{ statSummary(tooltip.item) }}</span>
        <div v-if="tooltip.item.stats.special?.length" class="tt-specials">
          <span v-for="s in tooltip.item.stats.special" :key="s.type" class="tt-special">✦ {{ s.type }}</span>
        </div>
        <span v-if="char && getOffClassPenalty(tooltip.item, char.class) === 0" class="tt-warn-no">Cannot equip</span>
        <span v-else-if="char && getOffClassPenalty(tooltip.item, char.class) < 1" class="tt-warn-off">⚠ 70% effectiveness</span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; }
.inv-header { margin-bottom: 8px; }
.inv-count { font-size: 6px; color: var(--text-dim); }
.inv-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
.inv-slot {
  aspect-ratio: 1;
  border: 2px solid var(--border);
  background: #0e0c1c;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slot-equippable { cursor: pointer; }
.slot-equippable:hover { border-color: var(--border-hi); }
.slot-locked { opacity: 0.4; cursor: not-allowed; }
.slot-empty  { opacity: 0.2; }
.slot-icon { font-size: 10px; line-height: 1; }
/* rarity borders */
.rb-common    { border-color: #42387a; }
.rb-uncommon  { border-color: #4080d0; }
.rb-rare      { border-color: var(--gold); }
.rb-epic      { border-color: #9050e0; }
.rb-legendary { border-color: var(--gold); background: rgba(100,60,0,0.2); }
/* rarity text */
.rt-common    { color: var(--text); }
.rt-uncommon  { color: var(--blue); }
.rt-rare      { color: var(--gold); }
.rt-epic      { color: var(--purple); }
.rt-legendary { color: var(--gold); }
/* tooltip */
.tooltip {
  position: fixed;
  z-index: 50;
  pointer-events: none;
  background: var(--panel);
  border: 2px solid var(--border);
  box-shadow: 3px 3px 0 #000;
  padding: 8px;
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tt-name    { font-size: 7px; }
.tt-sub     { font-size: 6px; color: var(--text-dim); text-transform: capitalize; }
.tt-stats   { font-size: 6px; color: var(--text); }
.tt-specials { display: flex; flex-direction: column; gap: 2px; }
.tt-special  { font-size: 6px; color: var(--purple); }
.tt-warn-no  { font-size: 6px; color: var(--red); }
.tt-warn-off { font-size: 6px; color: #d8a060; }
</style>
