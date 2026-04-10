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

// ── Active item (single-click reveals details) ─────────────────────────────
const activeItem = ref<Item | null>(null)

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

      <!-- Header -->
      <div class="inv-header">
        <span class="inv-count">{{ char?.inventory.length ?? 0 }} / {{ SLOTS }}</span>
        <div class="inv-actions">
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
            isOffClass(item) ? 'slot-offclass' : '',
          ] : 'slot-empty'"
          @click="item && (selectMode ? toggleSelect(item) : selectItem(item))"
        >
          <template v-if="item">
            <span :class="['slot-icon', rarityTextClass[item.rarity]]">
              {{ item.type === 'weapon' ? '⚔' : '🛡' }}
            </span>
            <span v-if="classTag(item)" class="class-tag" :class="{ 'class-warn': isOffClass(item) }">
              {{ classTag(item) }}
            </span>
          </template>
        </div>
      </div>

      <!-- Item detail panel (single-click) -->
      <div v-if="activeItem && !selectMode" class="detail-panel" :class="rarityBorderClass[activeItem.rarity]">
        <div class="detail-header">
          <span :class="['detail-name', rarityTextClass[activeItem.rarity]]">{{ activeItem.name }}</span>
          <span class="detail-price">{{ getSellPrice(activeItem.rarity) }}g</span>
        </div>
        <div class="detail-stats">{{ statSummary(activeItem) }}</div>
        <div v-if="activeItem.stats.special?.length" class="detail-specials">
          <span v-for="s in activeItem.stats.special" :key="s.type" class="detail-special">✦ {{ s.type }}</span>
        </div>
        <div class="detail-class" :class="{ 'detail-class-warn': isOffClass(activeItem), 'detail-class-locked': cannotEquip(activeItem) }">
          {{ classLabel(activeItem) }}
          <span v-if="cannotEquip(activeItem)"> · cannot equip</span>
          <span v-else-if="isOffClass(activeItem)"> · 70% effectiveness</span>
        </div>
        <div class="detail-btns">
          <button
            class="pixel-btn"
            :class="cannotEquip(activeItem) ? '' : 'btn-gold'"
            :disabled="cannotEquip(activeItem)"
            @click="equipActive"
          >Equip</button>
          <button class="pixel-btn" @click="sellActive">Sell</button>
        </div>
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
.inv-count  { font-size: 6px; color: var(--text-dim); }
.inv-actions { display: flex; gap: 5px; align-items: center; }

.btn-scrap { font-size: 6px; padding: 4px 6px; color: #d8a060; border-color: #6a4010; background: #1e1008; }
.btn-scrap:hover:not(:disabled) { border-color: #d8a060; }

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
.slot-active   { outline: 2px solid var(--gold); outline-offset: -2px; }
.slot-selected { outline: 2px solid var(--gold); outline-offset: -2px; }
.slot-offclass { filter: hue-rotate(30deg); }

.slot-icon { font-size: 10px; line-height: 1; }

.class-tag {
  position: absolute;
  bottom: 1px;
  left: 2px;
  font-size: 5px;
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
.detail-name   { font-size: 7px; line-height: 1.4; }
.detail-price  { font-size: 6px; color: var(--gold); white-space: nowrap; }
.detail-stats  { font-size: 6px; color: var(--text); }
.detail-specials { display: flex; flex-wrap: wrap; gap: 4px; }
.detail-special  { font-size: 6px; color: var(--purple); }
.detail-class {
  font-size: 6px;
  color: var(--text-dim);
  text-transform: capitalize;
}
.detail-class-warn   { color: #d8a060; }
.detail-class-locked { color: var(--red); }
.detail-btns { display: flex; gap: 6px; }
.detail-btns .pixel-btn { flex: 1; text-align: center; font-size: 6px; padding: 5px 4px; }

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
</style>
