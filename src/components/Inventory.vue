<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { getOffClassPenalty } from '../game/formulas'
import { getSellPrice } from '../game/items'
import { getItemSpriteStyle } from '../game/item-sprites'
import type { Item } from '../types/index'

const characterStore = useCharacterStore()
const char = computed(() => characterStore.character)

const SLOTS = 50
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const

// ── Collapse ──────────────────────────────────────────────────────────────
const collapsed = ref(localStorage.getItem('collapsed_inventory') === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('collapsed_inventory', String(collapsed.value))
}

// ── Item popover ───────────────────────────────────────────────────────────
const activeItem = ref<Item | null>(null)
const popoverStyle = ref<{ left: string; top: string }>({ left: '0px', top: '0px' })

function selectItem(item: Item, event: MouseEvent) {
  if (activeItem.value?.id === item.id) {
    activeItem.value = null
    return
  }
  activeItem.value = item
  positionPopover(event)
}

function positionPopover(event: MouseEvent) {
  const W = 220, H = 220
  const x = event.clientX + 12
  const y = event.clientY - 10
  popoverStyle.value = {
    left: (x + W > window.innerWidth  ? event.clientX - W - 12 : x) + 'px',
    top:  (y + H > window.innerHeight ? window.innerHeight - H - 8 : y) + 'px',
  }
}

function closePopover() { activeItem.value = null }

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

// ── Scrap junk (manual button — always uses effective-stat comparison) ────
const junkIds = computed<string[]>(() => {
  const c = char.value
  if (!c) return []
  return c.inventory
    .filter(item => {
      const slot = item.type === 'weapon' ? 'weapon' : 'armor'
      const equipped = c.gear[slot]
      if (!equipped) return false
      const iPen = getOffClassPenalty(item, c.class)
      const ePen = getOffClassPenalty(equipped, c.class)
      if (item.type === 'weapon') {
        const iEff = ((item.stats.minDmg ?? 0) + (item.stats.maxDmg ?? 0)) / 2 * iPen
        const eEff = ((equipped.stats.minDmg ?? 0) + (equipped.stats.maxDmg ?? 0)) / 2 * ePen
        return iEff < eEff
      } else {
        const iEff = ((item.stats.defBonus ?? 0) * 3 + (item.stats.hpBonus ?? 0)) * iPen
        const eEff = ((equipped.stats.defBonus ?? 0) * 3 + (equipped.stats.hpBonus ?? 0)) * ePen
        return iEff < eEff
      }
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

// ── Equipment comparison (penalty-aware) ──────────────────────────────────
interface StatDelta { label: string; value: number }

const comparisonDeltas = computed<StatDelta[]>(() => {
  const item = activeItem.value
  const c = char.value
  if (!item || !c) return []
  const slot = item.type === 'weapon' ? 'weapon' : 'armor'
  const equipped = c.gear[slot]
  if (!equipped) return []
  const iPen = getOffClassPenalty(item, c.class)
  const ePen = getOffClassPenalty(equipped, c.class)
  const deltas: StatDelta[] = []
  if (item.type === 'weapon') {
    const newAvg = ((item.stats.minDmg ?? 0) + (item.stats.maxDmg ?? 0)) / 2 * iPen
    const eqAvg  = ((equipped.stats.minDmg ?? 0) + (equipped.stats.maxDmg ?? 0)) / 2 * ePen
    const diff = Math.round(newAvg - eqAvg)
    if (diff !== 0) deltas.push({ label: 'DMG', value: diff })
  } else {
    const defDiff = Math.floor((item.stats.defBonus ?? 0) * iPen) - Math.floor((equipped.stats.defBonus ?? 0) * ePen)
    const hpDiff  = Math.floor((item.stats.hpBonus  ?? 0) * iPen) - Math.floor((equipped.stats.hpBonus  ?? 0) * ePen)
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
    <div class="panel-title" @click="toggleCollapse">
      Inventory
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>
    <div v-if="!collapsed" class="inner">

      <!-- Header -->
      <div class="inv-header">
        <span class="inv-count">{{ char?.inventory.length ?? 0 }} / {{ SLOTS }}</span>
        <div class="inv-actions">
          <div class="scrap-threshold">
            <span class="scrap-label">Scrap:</span>
            <button
              v-for="[mode, label, tip] in ([
                ['off',     'Off',  'No auto-scrap'],
                ['smart',   '↓All', 'Scrap if worse than equipped (any rarity)'],
                ['smart-c', '↓C',   'Scrap if worse than equipped (common only)'],
                ['smart-u', '↓U',   'Scrap if worse than equipped (up to uncommon)'],
                ['smart-r', '↓R',   'Scrap if worse than equipped (up to rare)'],
              ] as const)"
              :key="mode"
              class="threshold-btn"
              :class="{ 'threshold-active': characterStore.scrapMode === mode }"
              :title="tip"
              @click="characterStore.setScrapMode(mode)"
            >{{ label }}</button>
          </div>
          <label class="autoscrap-toggle" :class="{ active: characterStore.autoEquip }">
            <input type="checkbox" :checked="characterStore.autoEquip" @change="characterStore.toggleAutoEquip()" />
            Auto-equip
          </label>
          <button
            class="pixel-btn"
            :class="selectMode ? 'btn-purple' : ''"
            @click="toggleSelectMode"
          >{{ selectMode ? 'Cancel' : 'Multi-sell' }}</button>
        </div>
      </div>
      <!-- Scrap junk row — separate line so it never causes header reflow -->
      <div v-if="junkIds.length > 0 && !selectMode" class="scrap-row">
        <button class="pixel-btn btn-scrap" @click="scrapJunk">Scrap {{ junkIds.length }} worse item{{ junkIds.length > 1 ? 's' : '' }} +{{ junkGold }}g</button>
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
          @click="item && (selectMode ? toggleSelect(item) : selectItem(item, $event))"
        >
          <template v-if="item">
            <div class="slot-sprite-wrap">
              <div class="slot-sprite" :style="{ boxShadow: getItemSpriteStyle(item.defId ?? item.id, 2) }"></div>
            </div>
            <span v-if="classTag(item)" class="class-tag" :class="{ 'class-warn': isOffClass(item) }">
              {{ classTag(item) }}
            </span>
          </template>
        </div>
      </div>

      <!-- Multi-sell bar -->
      <div v-if="selectMode && selected.size > 0" class="sell-bar">
        <span class="sell-info">{{ selected.size }} item{{ selected.size > 1 ? 's' : '' }} · +{{ selectedGold }}g</span>
        <button class="pixel-btn btn-gold" @click="sellSelected">Sell</button>
      </div>

    </div>
  </div>

  <!-- Item popover -->
  <Teleport to="body">
    <template v-if="activeItem && !selectMode">
      <div class="popover-backdrop" @click="closePopover" />
      <div class="item-popover" :class="rarityBorderClass[activeItem.rarity]" :style="popoverStyle">
        <!-- Header -->
        <div class="pop-header">
          <div class="pop-sprite-wrap">
            <div class="pop-sprite" :style="{ boxShadow: getItemSpriteStyle(activeItem.defId ?? activeItem.id, 4) }"></div>
          </div>
          <div class="pop-name-block">
            <span :class="['pop-name', rarityTextClass[activeItem.rarity]]">{{ activeItem.name }}</span>
            <span :class="['pop-rarity', rarityTextClass[activeItem.rarity]]">{{ activeItem.rarity }}</span>
          </div>
          <span class="pop-price">{{ getSellPrice(activeItem.rarity) }}g</span>
        </div>
        <!-- Stats + comparison -->
        <div class="pop-stats">
          {{ statSummary(activeItem) }}
          <span
            v-for="d in comparisonDeltas"
            :key="d.label"
            class="cmp-delta"
            :class="d.value > 0 ? 'cmp-pos' : 'cmp-neg'"
          > {{ d.value > 0 ? '+' : '' }}{{ d.value }} {{ d.label }}</span>
        </div>
        <!-- Specials -->
        <div v-if="activeItem.stats.special?.length" class="pop-specials">
          <span v-for="s in activeItem.stats.special" :key="s.type" class="pop-special">✦ {{ s.type }}</span>
        </div>
        <!-- Class -->
        <div class="pop-class" :class="{ 'pop-class-warn': isOffClass(activeItem), 'pop-class-locked': cannotEquip(activeItem) }">
          {{ classLabel(activeItem) }}
          <span v-if="cannotEquip(activeItem)"> · cannot equip</span>
          <span v-else-if="isOffClass(activeItem)"> · 70% effectiveness</span>
        </div>
        <!-- Actions -->
        <div class="pop-btns">
          <button
            class="pixel-btn"
            :class="cannotEquip(activeItem) ? '' : 'btn-gold'"
            :disabled="cannotEquip(activeItem)"
            @click="equipActive"
          >Equip</button>
          <button class="pixel-btn" @click="sellActive">Sell</button>
          <button class="pixel-btn" @click="closePopover">✕</button>
        </div>
      </div>
    </template>
  </Teleport>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 8px; }

.inv-header { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.inv-count  { font-size: 8px; color: var(--text-dim); }
.inv-actions { display: flex; gap: 5px; align-items: center; }

.scrap-threshold {
  display: flex;
  align-items: center;
  gap: 2px;
}
.scrap-label { font-size: 7px; color: var(--text-dim); margin-right: 2px; white-space: nowrap; }
.threshold-btn {
  font-size: 7px;
  padding: 2px 5px;
  background: #0e0c1c;
  border: 1px solid var(--border);
  color: var(--text-dim);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}
.threshold-btn:hover { border-color: var(--border-hi); color: var(--text); }
.threshold-active { border-color: #d8a060 !important; color: #d8a060 !important; }

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

.scrap-row { display: flex; }
.btn-scrap { font-size: 8px; padding: 4px 6px; color: #d8a060; border-color: #6a4010; background: #1e1008; width: 100%; }
.btn-scrap:hover:not(:disabled) { border-color: #d8a060; }

.sort-bar { display: flex; align-items: center; gap: 4px; }
.sort-label { font-size: 7px; color: var(--text-dim); }
.sort-btn { font-size: 7px; padding: 2px 6px; background: #0e0c1c; border: 1px solid var(--border); color: var(--text-dim); cursor: pointer; font-family: inherit; }
.sort-btn:hover { border-color: var(--border-hi); color: var(--text); }
.sort-active { border-color: #8060c0 !important; color: #c090f0 !important; }

.cmp-delta { font-size: 7px; font-weight: bold; }
.cmp-pos { color: #40d860; }
.cmp-neg { color: #e05050; }

.inv-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 3px; }

.inv-slot {
  aspect-ratio: 1;
  border: 2px solid var(--border);
  background: #0e0c1c;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
}
.slot-equippable { cursor: pointer; }
.slot-equippable:hover { border-color: var(--border-hi); }
.slot-locked  { opacity: 0.5; cursor: not-allowed; }
.slot-empty   { opacity: 0.2; }
.slot-active   { outline: 2px solid #f07020; outline-offset: -2px; }
.slot-selected { outline: 2px solid #f07020; outline-offset: -2px; }

.slot-sprite-wrap {
  width: 14px;
  height: 16px;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slot-sprite {
  width: 2px;
  height: 2px;
  image-rendering: pixelated;
  flex-shrink: 0;
  transform: translate(-8px, -10px);
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

/* Popover backdrop + card (teleported to body, so not scoped — use :global) */

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

/* Teleported popover — :global so scoped doesn't strip selectors */
:global(.popover-backdrop) {
  position: fixed;
  inset: 0;
  z-index: 299;
}
:global(.item-popover) {
  position: fixed;
  z-index: 300;
  background: #0e0c1e;
  border: 2px solid var(--border);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 220px;
  box-shadow: 4px 4px 0 #000;
  font-family: 'Press Start 2P', monospace;
}
:global(.item-popover.rb-uncommon) { border-color: #2d7a30; }
:global(.item-popover.rb-rare)     { border-color: #2a5898; }
:global(.item-popover.rb-epic)     { border-color: #80306a; }
:global(.item-popover.rb-legendary){ border-color: #987820; }

:global(.pop-header) { display: flex; align-items: center; gap: 8px; }
:global(.pop-sprite-wrap) {
  width: 32px; height: 32px;
  flex-shrink: 0; overflow: visible; position: relative;
}
:global(.pop-sprite) {
  width: 4px; height: 4px;
  image-rendering: pixelated;
  position: absolute; top: 0; left: 0;
}
:global(.pop-name-block) { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
:global(.pop-name)   { font-size: 8px; line-height: 1.5; }
:global(.pop-rarity) { font-size: 6px; text-transform: capitalize; opacity: 0.8; }
:global(.pop-price)  { font-size: 8px; color: var(--gold); white-space: nowrap; flex-shrink: 0; }

:global(.rt-common)    { color: #909090; }
:global(.rt-uncommon)  { color: #4caf50; }
:global(.rt-rare)      { color: #4488dd; }
:global(.rt-epic)      { color: #d060b8; }
:global(.rt-legendary) { color: #daa520; }

:global(.pop-stats)   { font-size: 7px; color: var(--text); line-height: 1.8; }
:global(.pop-specials){ display: flex; flex-wrap: wrap; gap: 4px; }
:global(.pop-special) { font-size: 7px; color: #a080d0; }
:global(.pop-class)   { font-size: 7px; color: var(--text-dim); text-transform: capitalize; }
:global(.pop-class-warn)   { color: #d8a060; }
:global(.pop-class-locked) { color: #e05050; }
:global(.pop-btns) { display: flex; gap: 6px; margin-top: 2px; }
:global(.pop-btns .pixel-btn) { flex: 1; text-align: center; font-size: 7px; padding: 5px 4px; }
</style>
