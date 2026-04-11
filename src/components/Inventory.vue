<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { getOffClassPenalty } from '../game/formulas'
import { getSellPrice } from '../game/items'
import { getItemSpriteStyle } from '../game/item-sprites'
import type { Item } from '../types/index'

const characterStore = useCharacterStore()
const char = computed(() => characterStore.character)

const SLOTS = 20
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const

// ── Collapse ──────────────────────────────────────────────────────────────
const collapsed = ref(localStorage.getItem('collapsed_inventory') === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('collapsed_inventory', String(collapsed.value))
}

// ── Hovered item (shows detail on hover) ──────────────────────────────────
const hoveredItem = ref<Item | null>(null)

// ── Active item (single-click → action buttons) ───────────────────────────
const activeItem = ref<Item | null>(null)

// What the detail panel displays — hover takes priority for quick comparison
const displayedItem = computed(() => hoveredItem.value ?? activeItem.value)

function selectItem(item: Item) {
  activeItem.value = activeItem.value?.id === item.id ? null : item
}

function equipActive() {
  if (!activeItem.value || cannotEquip(activeItem.value)) return
  characterStore.equipItem(activeItem.value)
  activeItem.value = null
}

function sellActive() {
  if (!activeItem.value) return
  characterStore.sellItems([activeItem.value.id])
  activeItem.value = null
}

// ── Multi-select (sell multiple) ───────────────────────────────────────────
const selectMode = ref(false)
const selected = ref<Set<string>>(new Set())

function toggleSelectMode() {
  selectMode.value = !selectMode.value
  if (!selectMode.value) selected.value = new Set()
  activeItem.value = null
}

function toggleSelect(item: Item) {
  const next = new Set(selected.value)
  if (next.has(item.id)) next.delete(item.id)
  else next.add(item.id)
  selected.value = next
}

const selectedGold = computed(() =>
  [...selected.value].reduce((sum, id) => {
    const item = char.value?.inventory.find(i => i.id === id)
    return sum + (item ? getSellPrice(item.rarity) : 0)
  }, 0)
)

function sellSelected() {
  characterStore.sellItems([...selected.value])
  selected.value = new Set()
}

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

function classLabel(item: Item): string {
  if (item.allowedClasses === 'any') return 'Any class'
  return item.allowedClasses.join(' / ')
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
  if (activeItem.value && junkIds.value.includes(activeItem.value.id)) activeItem.value = null
  characterStore.sellItems(junkIds.value)
}

// ── Sort ──────────────────────────────────────────────────────────────────
const sortMode = ref<'default' | 'rarity' | 'type'>('default')

const sortedInventory = computed(() => {
  const inv = [...(char.value?.inventory ?? [])]
  if (sortMode.value === 'rarity') {
    inv.sort((a, b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity))
  } else if (sortMode.value === 'type') {
    inv.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
  }
  return inv
})

// ── Slot grid ──────────────────────────────────────────────────────────────
const slots = computed(() => {
  const inv = sortedInventory.value
  return Array.from({ length: SLOTS }, (_, i) => inv[i] ?? null)
})

// ── Equipment comparison ──────────────────────────────────────────────────
interface StatDelta { label: string; value: number }

const comparisonDeltas = computed<StatDelta[]>(() => {
  const item = displayedItem.value
  const c = char.value
  if (!item || !c) return []
  const slot = item.type === 'weapon' ? 'weapon' : 'armor'
  const equipped = c.gear[slot]
  if (!equipped) return []
  const deltas: StatDelta[] = []
  if (item.type === 'weapon') {
    const newAvg = ((item.stats.minDmg ?? 0) + (item.stats.maxDmg ?? 0)) / 2
    const eqAvg  = ((equipped.stats.minDmg ?? 0) + (equipped.stats.maxDmg ?? 0)) / 2
    const diff = Math.round(newAvg - eqAvg)
    if (diff !== 0) deltas.push({ label: 'DMG', value: diff })
  } else {
    const defDiff = (item.stats.defBonus ?? 0) - (equipped.stats.defBonus ?? 0)
    const hpDiff  = (item.stats.hpBonus  ?? 0) - (equipped.stats.hpBonus  ?? 0)
    if (defDiff !== 0) deltas.push({ label: 'DEF', value: defDiff })
    if (hpDiff  !== 0) deltas.push({ label: 'HP',  value: hpDiff })
  }
  return deltas
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
    <div class="panel-title">
      Inventory
      <button class="collapse-btn" @click="toggleCollapse">{{ collapsed ? '►' : '▾' }}</button>
    </div>
    <div v-if="!collapsed" class="inner">

      <!-- Header -->
      <div class="inv-header">
        <span class="inv-count">{{ char?.inventory.length ?? 0 }} / {{ SLOTS }}</span>
        <div class="inv-actions">
          <label class="autoscrap-toggle" :class="{ active: characterStore.autoScrap }">
            <input type="checkbox" :checked="characterStore.autoScrap" @change="characterStore.toggleAutoScrap()" />
            Auto-scrap
          </label>
          <label class="autoscrap-toggle" :class="{ active: characterStore.autoEquip }">
            <input type="checkbox" :checked="characterStore.autoEquip" @change="characterStore.toggleAutoEquip()" />
            Auto-equip
          </label>
          <button
            v-if="junkIds.length > 0 && !selectMode"
            class="pixel-btn btn-scrap"
            @click="scrapJunk"
          >Scrap +{{ junkGold }}g</button>
          <button
            class="pixel-btn"
            :class="selectMode ? 'btn-purple' : ''"
            @click="toggleSelectMode"
          >{{ selectMode ? 'Cancel' : 'Multi-sell' }}</button>
        </div>
      </div>

      <!-- Sort controls -->
      <div class="sort-bar">
        <span class="sort-label">Sort:</span>
        <button class="sort-btn" :class="{ 'sort-active': sortMode === 'default' }" @click="sortMode = 'default'">Default</button>
        <button class="sort-btn" :class="{ 'sort-active': sortMode === 'rarity' }" @click="sortMode = 'rarity'">Rarity</button>
        <button class="sort-btn" :class="{ 'sort-active': sortMode === 'type' }"   @click="sortMode = 'type'">Type</button>
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
            !selectMode && activeItem?.id === item.id ? 'slot-active' : '',
            selectMode && selected.has(item.id) ? 'slot-selected' : '',
          ] : 'slot-empty'"
          @click="item && (selectMode ? toggleSelect(item) : selectItem(item))"
          @mouseenter="item && !selectMode && (hoveredItem = item)"
          @mouseleave="hoveredItem = null"
        >
          <template v-if="item">
            <div class="slot-sprite-wrap">
              <div class="slot-sprite" :style="{ boxShadow: getItemSpriteStyle(item.defId ?? item.id) }"></div>
            </div>
            <span v-if="classTag(item)" class="class-tag" :class="{ 'class-warn': isOffClass(item) }">
              {{ classTag(item) }}
            </span>
          </template>
        </div>
      </div>

      <!-- Item detail panel (hover = info; click = + action buttons) -->
      <div v-if="displayedItem && !selectMode" class="detail-panel" :class="rarityBorderClass[displayedItem.rarity]">
        <div class="detail-header">
          <div class="detail-sprite-wrap">
            <div class="detail-sprite" :style="{ boxShadow: getItemSpriteStyle(displayedItem.defId ?? displayedItem.id, 4) }"></div>
          </div>
          <div class="detail-name-block">
            <span :class="['detail-name', rarityTextClass[displayedItem.rarity]]">{{ displayedItem.name }}</span>
            <span :class="['detail-rarity', rarityTextClass[displayedItem.rarity]]">{{ displayedItem.rarity }}</span>
          </div>
          <span class="detail-price">{{ getSellPrice(displayedItem.rarity) }}g</span>
        </div>
        <div class="detail-stats">
          {{ statSummary(displayedItem) }}
          <span
            v-for="d in comparisonDeltas"
            :key="d.label"
            class="cmp-delta"
            :class="d.value > 0 ? 'cmp-pos' : 'cmp-neg'"
          >{{ d.value > 0 ? '+' : '' }}{{ d.value }} {{ d.label }}</span>
        </div>
        <div v-if="displayedItem.stats.special?.length" class="detail-specials">
          <span v-for="s in displayedItem.stats.special" :key="s.type" class="detail-special">✦ {{ s.type }}</span>
        </div>
        <div class="detail-class" :class="{ 'detail-class-warn': isOffClass(displayedItem), 'detail-class-locked': cannotEquip(displayedItem) }">
          {{ classLabel(displayedItem) }}
          <span v-if="cannotEquip(displayedItem)"> · cannot equip</span>
          <span v-else-if="isOffClass(displayedItem)"> · 70% effectiveness</span>
        </div>
        <!-- Action buttons only appear when item is clicked -->
        <div v-if="activeItem" class="detail-btns">
          <button
            class="pixel-btn"
            :class="cannotEquip(activeItem) ? '' : 'btn-gold'"
            :disabled="cannotEquip(activeItem)"
            @click="equipActive"
          >Equip</button>
          <button class="pixel-btn" @click="sellActive">Sell</button>
        </div>
        <div v-else class="detail-hint">click to select</div>
      </div>

      <!-- Multi-sell bar -->
      <div v-if="selectMode && selected.size > 0" class="sell-bar">
        <span class="sell-info">{{ selected.size }} item{{ selected.size > 1 ? 's' : '' }} · +{{ selectedGold }}g</span>
        <button class="pixel-btn btn-gold" @click="sellSelected">Sell</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 8px; }

.inv-header { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.inv-count  { font-size: 8px; color: var(--text-dim); }
.inv-actions { display: flex; gap: 5px; align-items: center; }

.autoscrap-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 7px;
  color: var(--text-dim);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.autoscrap-toggle input { display: none; }
.autoscrap-toggle::before {
  content: '';
  width: 10px;
  height: 10px;
  border: 2px solid var(--border);
  background: #0e0c1c;
  flex-shrink: 0;
}
.autoscrap-toggle.active { color: #d8a060; }
.autoscrap-toggle.active::before { background: #d8a060; border-color: #d8a060; }

.btn-scrap { font-size: 8px; padding: 4px 6px; color: #d8a060; border-color: #6a4010; background: #1e1008; }
.btn-scrap:hover:not(:disabled) { border-color: #d8a060; }

.sort-bar { display: flex; align-items: center; gap: 4px; }
.sort-label { font-size: 7px; color: var(--text-dim); }
.sort-btn { font-size: 7px; padding: 2px 6px; background: #0e0c1c; border: 1px solid var(--border); color: var(--text-dim); cursor: pointer; font-family: inherit; }
.sort-btn:hover { border-color: var(--border-hi); color: var(--text); }
.sort-active { border-color: #8060c0 !important; color: #c090f0 !important; }

.cmp-delta { margin-left: 6px; font-size: 7px; font-weight: bold; }
.cmp-pos { color: #40d860; }
.cmp-neg { color: #e05050; }

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
.slot-locked  { opacity: 0.5; cursor: not-allowed; }
.slot-empty   { opacity: 0.2; }
.slot-active   { outline: 2px solid #f07020; outline-offset: -2px; }
.slot-selected { outline: 2px solid #f07020; outline-offset: -2px; }

.slot-sprite-wrap {
  width: 26px;
  height: 28px;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slot-sprite {
  width: 3px;
  height: 3px;
  image-rendering: pixelated;
  flex-shrink: 0;
  transform: translate(-12px, -15px);
}

.detail-sprite-wrap {
  width: 36px;
  height: 36px;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.detail-sprite {
  width: 4px;
  height: 4px;
  image-rendering: pixelated;
  flex-shrink: 0;
  transform: translate(-16px, -20px);
}

.class-tag {
  position: absolute;
  bottom: 1px;
  left: 2px;
  font-size: 7px;
  color: var(--text-dim);
  line-height: 1;
}
.class-warn { color: #d8a060; }

/* rarity borders */
.rb-common    { border-color: #555560; }
.rb-uncommon  { border-color: #2d7a30; }
.rb-rare      { border-color: #2a5898; }
.rb-epic      { border-color: #80306a; }
.rb-legendary { border-color: #987820; background: rgba(100,70,0,0.2); }

/* rarity text */
.rt-common    { color: #909090; }
.rt-uncommon  { color: #4caf50; }
.rt-rare      { color: #4488dd; }
.rt-epic      { color: #d060b8; }
.rt-legendary { color: #daa520; }

/* detail panel */
.detail-panel {
  border: 2px solid var(--border);
  background: #0e0c1c;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-header { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
.detail-name-block { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.detail-name   { font-size: 9px; line-height: 1.4; }
.detail-rarity { font-size: 7px; text-transform: capitalize; opacity: 0.85; }
.detail-price  { font-size: 8px; color: var(--gold); white-space: nowrap; }
.detail-stats  { font-size: 8px; color: var(--text); }
.detail-specials { display: flex; flex-wrap: wrap; gap: 4px; }
.detail-special  { font-size: 8px; color: var(--purple); }
.detail-class {
  font-size: 8px;
  color: var(--text-dim);
  text-transform: capitalize;
}
.detail-class-warn   { color: #d8a060; }
.detail-class-locked { color: var(--red); }
.detail-btns { display: flex; gap: 6px; }
.detail-btns .pixel-btn { flex: 1; text-align: center; font-size: 8px; padding: 5px 4px; }
.detail-hint { font-size: 7px; color: var(--text-dim); text-align: center; }

/* sell bar */
.sell-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border: 1px solid var(--border);
  background: #0e0c1c;
}
.sell-info { font-size: 8px; color: var(--text); }
</style>
