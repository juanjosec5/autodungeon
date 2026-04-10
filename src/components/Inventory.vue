<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { getOffClassPenalty } from '../game/formulas'
import { getSellPrice } from '../game/items'
import type { Item } from '../types/index'

const characterStore = useCharacterStore()
const char = computed(() => characterStore.character)

const SLOTS = 20
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const

// ── Selection state ────────────────────────────────────────────────────────
const selectMode = ref(false)
const selected = ref<Set<string>>(new Set())

function toggleSelectMode() {
  selectMode.value = !selectMode.value
  if (!selectMode.value) selected.value = new Set()
}

function toggleSelect(item: Item) {
  const next = new Set(selected.value)
  if (next.has(item.id)) next.delete(item.id)
  else next.add(item.id)
  selected.value = next
}

// ── Tooltip ───────────────────────────────────────────────────────────────
const tooltip = ref<{ item: Item; x: number; y: number } | null>(null)

function showTooltip(item: Item, e: MouseEvent) {
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  tooltip.value = { item, x: rect.right + 8, y: rect.top }
}
function hideTooltip() { tooltip.value = null }

// ── Class helpers ─────────────────────────────────────────────────────────
function classTag(item: Item): string {
  if (item.allowedClasses === 'any') return ''
  return item.allowedClasses.map(c => c[0].toUpperCase()).join('/')
}

function isOffClass(item: Item): boolean {
  if (!char.value) return false
  return getOffClassPenalty(item, char.value.class) < 1.0
}

function cannotEquip(item: Item): boolean {
  if (!char.value) return false
  return getOffClassPenalty(item, char.value.class) === 0
}

// ── Equip ──────────────────────────────────────────────────────────────────
function handleSlotClick(item: Item) {
  if (selectMode.value) {
    toggleSelect(item)
  } else if (!cannotEquip(item)) {
    characterStore.equipItem(item)
    tooltip.value = null
  }
}

// ── Sell selected ──────────────────────────────────────────────────────────
const selectedItems = computed(() =>
  (char.value?.inventory ?? []).filter(i => selected.value.has(i.id))
)

const selectedGold = computed(() =>
  selectedItems.value.reduce((sum, i) => sum + getSellPrice(i.rarity), 0)
)

function sellSelected() {
  characterStore.sellItems([...selected.value])
  selected.value = new Set()
}

// ── Scrap junk ────────────────────────────────────────────────────────────
const junkIds = computed<string[]>(() => {
  const c = char.value
  if (!c) return []
  const weaponTier = c.gear.weapon ? RARITY_ORDER.indexOf(c.gear.weapon.rarity) : -1
  const armorTier  = c.gear.armor  ? RARITY_ORDER.indexOf(c.gear.armor.rarity)  : -1
  return c.inventory
    .filter(item => {
      const tier = RARITY_ORDER.indexOf(item.rarity)
      if (item.type === 'weapon') return weaponTier > 0 && tier < weaponTier
      if (item.type === 'armor')  return armorTier  > 0 && tier < armorTier
      return false
    })
    .map(i => i.id)
})

const junkGold = computed(() =>
  junkIds.value.reduce((sum, id) => {
    const item = char.value?.inventory.find(i => i.id === id)
    return sum + (item ? getSellPrice(item.rarity) : 0)
  }, 0)
)

function scrapJunk() {
  characterStore.sellItems(junkIds.value)
}

// ── Slot grid ──────────────────────────────────────────────────────────────
const slots = computed(() => {
  const inv = char.value?.inventory ?? []
  return Array.from({ length: SLOTS }, (_, i) => inv[i] ?? null)
})

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

function statSummary(item: Item): string {
  const s = item.stats
  const parts: string[] = []
  if (s.minDmg !== undefined) parts.push(`${s.minDmg}–${s.maxDmg} dmg`)
  if (s.defBonus) parts.push(`+${s.defBonus} DEF`)
  if (s.hpBonus)  parts.push(`+${s.hpBonus} HP`)
  return parts.join(' · ')
}
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title">Inventory</div>
    <div class="inner">

      <!-- Header row -->
      <div class="inv-header">
        <span class="inv-count">{{ char?.inventory.length ?? 0 }} / {{ SLOTS }}</span>
        <div class="inv-actions">
          <button
            v-if="junkIds.length > 0 && !selectMode"
            class="pixel-btn btn-scrap"
            @click="scrapJunk"
          >Scrap Junk +{{ junkGold }}g</button>
          <button
            class="pixel-btn"
            :class="selectMode ? 'btn-purple' : ''"
            @click="toggleSelectMode"
          >{{ selectMode ? 'Cancel' : 'Select' }}</button>
        </div>
      </div>

      <!-- Grid -->
      <div class="inv-grid">
        <div
          v-for="(item, i) in slots"
          :key="i"
          class="inv-slot"
          :class="item ? [
            rarityBorderClass[item.rarity],
            cannotEquip(item) ? 'slot-locked' : 'slot-equippable',
            selectMode && selected.has(item.id) ? 'slot-selected' : '',
          ] : 'slot-empty'"
          @click="item && handleSlotClick(item)"
          @mouseenter="item && !selectMode && showTooltip(item, $event)"
          @mouseleave="hideTooltip"
        >
          <template v-if="item">
            <span :class="['slot-icon', rarityTextClass[item.rarity]]">
              {{ item.type === 'weapon' ? '⚔' : '🛡' }}
            </span>
            <!-- Class tag -->
            <span v-if="classTag(item)" class="class-tag" :class="{ 'class-warn': isOffClass(item) }">
              {{ classTag(item) }}
            </span>
          </template>
        </div>
      </div>

      <!-- Sell selected bar -->
      <div v-if="selectMode && selected.size > 0" class="sell-bar">
        <span class="sell-info">{{ selected.size }} item{{ selected.size > 1 ? 's' : '' }} · +{{ selectedGold }}g</span>
        <button class="pixel-btn btn-gold" @click="sellSelected">Sell</button>
      </div>

    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <div
        v-if="tooltip"
        class="tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <span :class="['tt-name', rarityTextClass[tooltip.item.rarity]]">{{ tooltip.item.name }}</span>
        <span class="tt-sub">
          {{ tooltip.item.rarity }} {{ tooltip.item.type }}
          <span v-if="classTag(tooltip.item)"> · {{ classTag(tooltip.item) }}</span>
        </span>
        <span class="tt-stats">{{ statSummary(tooltip.item) }}</span>
        <div v-if="tooltip.item.stats.special?.length" class="tt-specials">
          <span v-for="s in tooltip.item.stats.special" :key="s.type" class="tt-special">✦ {{ s.type }}</span>
        </div>
        <span v-if="char && getOffClassPenalty(tooltip.item, char.class) === 0" class="tt-warn-no">Cannot equip (wrong class)</span>
        <span v-else-if="char && getOffClassPenalty(tooltip.item, char.class) < 1" class="tt-warn-off">⚠ 70% effectiveness</span>
        <span class="tt-price">Sell: {{ getSellPrice(tooltip.item.rarity) }}g</span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 8px; }

.inv-header { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.inv-count  { font-size: 6px; color: var(--text-dim); }
.inv-actions { display: flex; gap: 5px; align-items: center; }

.btn-scrap { font-size: 6px; padding: 4px 6px; color: #d8a060; border-color: #6a4010; background: #1e1008; }
.btn-scrap:hover { border-color: #d8a060; }

.inv-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }

.inv-slot {
  aspect-ratio: 1;
  border: 2px solid var(--border);
  background: #0e0c1c;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.slot-equippable { cursor: pointer; }
.slot-equippable:hover { border-color: var(--border-hi); }
.slot-locked  { opacity: 0.4; cursor: not-allowed; }
.slot-empty   { opacity: 0.2; }
.slot-selected { outline: 2px solid var(--gold); outline-offset: -2px; }

.slot-icon { font-size: 10px; line-height: 1; }

/* class tag — bottom-left corner */
.class-tag {
  position: absolute;
  bottom: 1px;
  left: 2px;
  font-size: 4px;
  color: var(--text-dim);
  line-height: 1;
}
.class-warn { color: #d8a060; }

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

/* sell bar */
.sell-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border: 1px solid var(--border);
  background: #0e0c1c;
}
.sell-info { font-size: 6px; color: var(--text); }

/* tooltip */
.tooltip {
  position: fixed;
  z-index: 50;
  pointer-events: none;
  background: var(--panel);
  border: 2px solid var(--border);
  box-shadow: 3px 3px 0 #000;
  padding: 8px;
  width: 168px;
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
.tt-price    { font-size: 6px; color: var(--text-dim); margin-top: 2px; border-top: 1px solid var(--border); padding-top: 4px; }

/* rarity name colors */
.rt-common    { color: var(--text); }
.rt-uncommon  { color: var(--blue); }
.rt-rare      { color: var(--gold); }
.rt-epic      { color: var(--purple); }
.rt-legendary { color: var(--gold); }
</style>
