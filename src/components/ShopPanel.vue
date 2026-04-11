<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useZoneStore } from '../stores/zone'
import { useSaveStore } from '../stores/save'
import { ITEM_DEFINITIONS, SHOP_ITEMS, getBuyPrice } from '../game/items'
import { getOffClassPenalty } from '../game/formulas'
import { getItemSpriteStyle } from '../game/item-sprites'
import type { Item, ZoneId } from '../types/index'

const characterStore = useCharacterStore()
const zoneStore = useZoneStore()
const saveStore = useSaveStore()

const ZONE_ORDER: ZoneId[] = ['forest', 'dungeon', 'volcano', 'abyss']
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const

const availableItems = computed(() => {
  const zone = zoneStore.activeZone
  const zoneIdx = ZONE_ORDER.indexOf(zone)
  return SHOP_ITEMS
    .filter(({ minZone }) => minZone <= zoneIdx)
    .map(({ id }) => ITEM_DEFINITIONS.find((i) => i.id === id)!)
    .filter(Boolean)
})

// Group by type then rarity
type ItemGroup = { rarity: string; items: Item[] }

const weaponGroups = computed<ItemGroup[]>(() =>
  RARITIES
    .map(rarity => ({
      rarity,
      items: availableItems.value.filter(i => i.type === 'weapon' && i.rarity === rarity),
    }))
    .filter(g => g.items.length > 0),
)

const armorGroups = computed<ItemGroup[]>(() =>
  RARITIES
    .map(rarity => ({
      rarity,
      items: availableItems.value.filter(i => i.type === 'armor' && i.rarity === rarity),
    }))
    .filter(g => g.items.length > 0),
)

// Accordion state
const weaponsOpen = ref(true)
const armorOpen = ref(true)

const selectedItem = ref<Item | null>(null)

function selectItem(item: Item) {
  selectedItem.value = selectedItem.value?.id === item.id ? null : item
}

const char = computed(() => characterStore.character)

function canAfford(item: Item) {
  return (char.value?.gold ?? 0) >= getBuyPrice(item.rarity)
}
function invFull() {
  return (char.value?.inventory.length ?? 0) >= 20
}

const flashMsg = ref<string | null>(null)
let flashTimer: ReturnType<typeof setTimeout> | null = null
function flash(msg: string) {
  flashMsg.value = msg
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => { flashMsg.value = null }, 2000)
}

function buy(item: Item) {
  const result = characterStore.buyItem(item.id)
  if (result === 'bought') {
    flash(`Bought ${item.name}!`)
    saveStore.saveCharacter()
    selectedItem.value = null
  } else if (result === 'no_gold') {
    flash('Not enough gold!')
  } else {
    flash('Inventory full!')
  }
}

function rarityClass(rarity: string) { return `r-${rarity}` }

function classTag(item: Item): string | null {
  if (item.allowedClasses === 'any') return null
  if (item.allowedClasses.length === 1) return item.allowedClasses[0][0].toUpperCase()
  return item.allowedClasses.map((c) => c[0].toUpperCase()).join('/')
}

function isOffClass(item: Item): boolean {
  if (!char.value) return false
  return getOffClassPenalty(item, char.value.class) < 1
}

function statLine(item: Item): string {
  const s = item.stats
  const parts: string[] = []
  if (s.minDmg !== undefined) parts.push(`DMG ${s.minDmg}–${s.maxDmg}`)
  if (s.defBonus !== undefined) parts.push(`DEF +${s.defBonus}`)
  if (s.hpBonus !== undefined) parts.push(`HP +${s.hpBonus}`)
  return parts.join('  ')
}

function specialLine(item: Item): string {
  return (item.stats.special ?? []).map((fx) => {
    switch (fx.type) {
      case 'lifesteal':        return `Lifesteal ${Math.round(fx.value * 100)}%`
      case 'poison':           return `Poison ${Math.round(fx.dpsMultiplier * 100)}%`
      case 'dodge':            return `Dodge ${Math.round(fx.chance * 100)}%`
      case 'block':            return `Block ${Math.round(fx.chance * 100)}%`
      case 'defIgnore':        return `Armor ignore ${Math.round(fx.percent * 100)}%`
      case 'spellAmp':         return `Spell amp ${Math.round(fx.percent * 100)}%`
      case 'critThreshold':    return `Crit on ${fx.rollsAt}+`
      case 'doublecast':       return `Doublecast ${Math.round(fx.chance * 100)}%`
      case 'attackSpeedBonus': return `Atk speed +${Math.round(fx.percent * 100)}%`
      case 'regenOnKill':      return `Regen on kill ${Math.round(fx.percent * 100)}%`
      default: return ''
    }
  }).filter(Boolean).join(', ')
}

const RARITY_LABEL: Record<string, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary',
}

// ── Zone preview (codex tab) ──────────────────────────────────────────────────

const activeTab = ref<'shop' | 'codex'>('shop')

const ZONE_META = [
  { name: 'Forest',  minZoneIdx: 0, unlockLevel: 1  },
  { name: 'Dungeon', minZoneIdx: 1, unlockLevel: 5  },
  { name: 'Volcano', minZoneIdx: 2, unlockLevel: 12 },
  { name: 'Abyss',   minZoneIdx: 3, unlockLevel: 20 },
] as const

type ZoneSection = {
  name: string
  unlockLevel: number
  unlocked: boolean
  weapons: Item[]
  armor: Item[]
}

const codexZones = computed<ZoneSection[]>(() => {
  const currentZoneIdx = ZONE_ORDER.indexOf(zoneStore.activeZone)
  const charLevel = characterStore.character?.level ?? 1

  return ZONE_META.map(({ name, minZoneIdx, unlockLevel }) => {
    const items = SHOP_ITEMS
      .filter(({ minZone }) => minZone === minZoneIdx || (minZoneIdx === 3 && minZone >= 3))
      .map(({ id }) => ITEM_DEFINITIONS.find((i) => i.id === id)!)
      .filter(Boolean)
    return {
      name,
      unlockLevel,
      unlocked: charLevel >= unlockLevel && currentZoneIdx >= minZoneIdx,
      weapons: items.filter((i) => i.type === 'weapon'),
      armor:   items.filter((i) => i.type === 'armor'),
    }
  })
})

const previewItem = ref<Item | null>(null)
const previewLocked = ref(false)

const collapsed = ref(localStorage.getItem('collapsed_shop') === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('collapsed_shop', String(collapsed.value))
}

function selectPreview(item: Item, locked: boolean) {
  if (previewItem.value?.id === item.id) {
    previewItem.value = null
  } else {
    previewItem.value = item
    previewLocked.value = locked
  }
}
</script>

<template>
  <div class="pixel-panel shop-panel">
    <div class="panel-title">
      Shop
      <button class="collapse-btn" @click="toggleCollapse">{{ collapsed ? '►' : '▾' }}</button>
    </div>

    <!-- Tabs -->
    <div v-if="!collapsed" class="shop-tabs">
      <button class="shop-tab" :class="{ active: activeTab === 'shop' }" @click="activeTab = 'shop'">Buy</button>
      <button class="shop-tab" :class="{ active: activeTab === 'codex' }" @click="activeTab = 'codex'">Codex</button>
    </div>

    <div class="inner" v-if="!collapsed && activeTab === 'shop'">
      <!-- Gold + flash -->
      <div class="gold-row">
        <span class="gold-label">Gold:</span>
        <span class="gold-val">{{ char?.gold ?? 0 }}g</span>
        <span v-if="flashMsg" class="flash-msg">{{ flashMsg }}</span>
      </div>

      <!-- Weapons accordion -->
      <div class="accordion-section">
        <button class="accordion-header" @click="weaponsOpen = !weaponsOpen">
          <span class="acc-icon">⚔</span>
          <span class="acc-label">Weapons</span>
          <span class="acc-count">{{ availableItems.filter(i => i.type === 'weapon').length }}</span>
          <span class="acc-chevron" :class="{ open: weaponsOpen }">▾</span>
        </button>

        <Transition name="acc">
          <div v-if="weaponsOpen" class="accordion-body">
            <template v-for="group in weaponGroups" :key="group.rarity">
              <div class="rarity-divider" :class="rarityClass(group.rarity)">
                {{ RARITY_LABEL[group.rarity] }}
              </div>
              <div class="shop-grid">
                <button
                  v-for="item in group.items"
                  :key="item.id"
                  class="shop-slot"
                  :class="[
                    rarityClass(item.rarity),
                    { 'slot-selected': selectedItem?.id === item.id },
                    { 'slot-cant-afford': !canAfford(item) },
                  ]"
                  @click="selectItem(item)"
                >
                  <div class="slot-sprite-wrap">
                    <div class="slot-sprite" :style="{ boxShadow: getItemSpriteStyle(item.id) }"></div>
                  </div>
                  <span class="slot-name">{{ item.name }}</span>
                  <span class="slot-price">{{ getBuyPrice(item.rarity) }}g</span>
                  <span v-if="classTag(item)" class="class-tag" :class="{ 'tag-offclass': isOffClass(item) }">
                    {{ classTag(item) }}
                  </span>
                </button>
              </div>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Armor accordion -->
      <div class="accordion-section">
        <button class="accordion-header" @click="armorOpen = !armorOpen">
          <span class="acc-icon">🛡</span>
          <span class="acc-label">Armor</span>
          <span class="acc-count">{{ availableItems.filter(i => i.type === 'armor').length }}</span>
          <span class="acc-chevron" :class="{ open: armorOpen }">▾</span>
        </button>

        <Transition name="acc">
          <div v-if="armorOpen" class="accordion-body">
            <template v-for="group in armorGroups" :key="group.rarity">
              <div class="rarity-divider" :class="rarityClass(group.rarity)">
                {{ RARITY_LABEL[group.rarity] }}
              </div>
              <div class="shop-grid">
                <button
                  v-for="item in group.items"
                  :key="item.id"
                  class="shop-slot"
                  :class="[
                    rarityClass(item.rarity),
                    { 'slot-selected': selectedItem?.id === item.id },
                    { 'slot-cant-afford': !canAfford(item) },
                  ]"
                  @click="selectItem(item)"
                >
                  <div class="slot-sprite-wrap">
                    <div class="slot-sprite" :style="{ boxShadow: getItemSpriteStyle(item.id) }"></div>
                  </div>
                  <span class="slot-name">{{ item.name }}</span>
                  <span class="slot-price">{{ getBuyPrice(item.rarity) }}g</span>
                  <span v-if="classTag(item)" class="class-tag" :class="{ 'tag-offclass': isOffClass(item) }">
                    {{ classTag(item) }}
                  </span>
                </button>
              </div>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Detail panel -->
      <div v-if="selectedItem" class="detail-panel" :class="rarityClass(selectedItem.rarity)">
        <div class="detail-header">
          <div class="detail-sprite-wrap">
            <div class="detail-sprite" :style="{ boxShadow: getItemSpriteStyle(selectedItem.id, 4) }"></div>
          </div>
          <div class="detail-text">
            <div class="detail-name" :class="rarityClass(selectedItem.rarity)">{{ selectedItem.name }}</div>
            <div class="detail-rarity">{{ selectedItem.rarity.toUpperCase() }} {{ selectedItem.type.toUpperCase() }}</div>
          </div>
        </div>
        <div class="detail-stats">{{ statLine(selectedItem) }}</div>
        <div v-if="specialLine(selectedItem)" class="detail-special">{{ specialLine(selectedItem) }}</div>
        <div v-if="isOffClass(selectedItem)" class="detail-warn">⚠ Off-class: 70% effectiveness</div>
        <div class="detail-price">Cost: {{ getBuyPrice(selectedItem.rarity) }}g</div>
        <div class="detail-actions">
          <button
            class="pixel-btn btn-gold"
            :disabled="!canAfford(selectedItem) || invFull()"
            @click="buy(selectedItem)"
          >
            {{ invFull() ? 'Inv Full' : !canAfford(selectedItem) ? 'No Gold' : 'Buy' }}
          </button>
          <button class="pixel-btn" @click="selectedItem = null">✕</button>
        </div>
      </div>
    </div>

    <!-- Codex tab -->
    <div class="inner" v-if="!collapsed && activeTab === 'codex'">
      <div
        v-for="zone in codexZones"
        :key="zone.name"
        class="codex-zone"
        :class="{ 'zone-locked': !zone.unlocked }"
      >
        <div class="codex-zone-header">
          <span class="codex-zone-name">{{ zone.name }}</span>
          <span v-if="!zone.unlocked" class="codex-zone-lock">Lv {{ zone.unlockLevel }}</span>
        </div>

        <template v-for="[label, items] in [['Weapons', zone.weapons], ['Armor', zone.armor]] as const" :key="label">
          <div v-if="(items as Item[]).length" class="codex-type-label">{{ label }}</div>
          <div class="codex-grid">
            <button
              v-for="item in (items as Item[])"
              :key="item.id"
              class="codex-slot"
              :class="[rarityClass(item.rarity), { 'slot-selected': previewItem?.id === item.id }]"
              @click="selectPreview(item, !zone.unlocked)"
            >
              <div class="slot-sprite-wrap">
                <div class="slot-sprite" :style="{ boxShadow: getItemSpriteStyle(item.id) }"></div>
              </div>
              <span class="slot-name">{{ item.name }}</span>
            </button>
          </div>
        </template>
      </div>

      <!-- Preview detail panel -->
      <div v-if="previewItem" class="detail-panel" :class="rarityClass(previewItem.rarity)">
        <div class="detail-header">
          <div class="detail-sprite-wrap">
            <div class="detail-sprite" :style="{ boxShadow: getItemSpriteStyle(previewItem.id, 4) }"></div>
          </div>
          <div class="detail-text">
            <div class="detail-name" :class="rarityClass(previewItem.rarity)">{{ previewItem.name }}</div>
            <div class="detail-rarity">{{ previewItem.rarity.toUpperCase() }} {{ previewItem.type.toUpperCase() }}</div>
          </div>
        </div>
        <div class="detail-stats">{{ statLine(previewItem) }}</div>
        <div v-if="specialLine(previewItem)" class="detail-special">{{ specialLine(previewItem) }}</div>
        <div v-if="isOffClass(previewItem)" class="detail-warn">⚠ Off-class: 70% effectiveness</div>
        <div class="detail-actions">
          <button
            v-if="!previewLocked"
            class="pixel-btn btn-gold"
            :disabled="!canAfford(previewItem) || invFull()"
            @click="buy(previewItem); previewItem = null"
          >
            {{ invFull() ? 'Inv Full' : !canAfford(previewItem) ? 'No Gold' : 'Buy' }}
          </button>
          <span v-else class="codex-locked-label">🔒 Zone locked</span>
          <button class="pixel-btn" @click="previewItem = null">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-panel { height: fit-content; }
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 6px; }

.gold-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 8px;
}
.gold-label { color: var(--text-dim); }
.gold-val   { color: var(--gold); }
.flash-msg  { color: var(--gold); font-size: 7px; margin-left: auto; }

/* Accordion */
.accordion-section {
  border: 2px solid var(--border);
}

.accordion-header {
  width: 100%;
  background: #16142a;
  border: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--text);
  padding: 7px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  text-align: left;
}
.accordion-header:hover { background: #1e1c38; }

.acc-icon  { font-size: 10px; }
.acc-label { flex: 1; }
.acc-count { color: var(--text-dim); font-size: 7px; }
.acc-chevron {
  font-size: 10px;
  color: var(--text-dim);
  transition: transform 0.2s;
  display: inline-block;
}
.acc-chevron.open { transform: rotate(180deg); }

.accordion-body {
  padding: 6px 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

/* Accordion open/close animation */
.acc-enter-active, .acc-leave-active {
  transition: opacity 0.15s, max-height 0.2s ease;
  max-height: 1000px;
  overflow: hidden;
}
.acc-enter-from, .acc-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Rarity sub-dividers */
.rarity-divider {
  font-size: 6px;
  padding: 2px 4px;
  letter-spacing: 1px;
  border-left: 2px solid currentColor;
  margin-top: 2px;
}
.r-common    { color: #909090; border-color: #555560; }
.r-uncommon  { color: #4caf50; border-color: #2d7a30; }
.r-rare      { color: #4488dd; border-color: #2a5898; }
.r-epic      { color: #00e676; border-color: #00a854; }
.r-legendary { color: #daa520; border-color: #987820; }

/* Shop grid */
.shop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.shop-slot {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  background: #1a1830;
  border: 2px solid var(--border);
  padding: 5px 6px 5px 8px;
  cursor: pointer;
  box-shadow: 2px 2px 0 #000;
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
  top: 0; left: 0;
  text-align: left;
  overflow: visible;
}
.shop-slot:hover { border-color: var(--border-hi); }
.shop-slot:active { top: 2px; left: 2px; box-shadow: none; }

/* Item sprite in slot */
.slot-sprite-wrap {
  width: 26px;
  height: 28px;
  overflow: visible;
  position: relative;
  flex-shrink: 0;
}
.slot-sprite {
  width: 3px;
  height: 3px;
  image-rendering: pixelated;
  position: absolute;
  top: 0;
  left: 0;
}

.slot-name  { color: var(--text); line-height: 1.4; }
.slot-price { color: var(--gold-dim, #c09030); font-size: 6px; }

.slot-selected     { outline: 2px solid #f07020; outline-offset: -2px; }
.slot-cant-afford  { opacity: 0.55; }

/* Rarity borders on slots */
.r-common    .shop-slot, .shop-slot.r-common    { border-color: #555560; }
.r-uncommon  .shop-slot, .shop-slot.r-uncommon  { border-color: #2d7a30; }
.r-rare      .shop-slot, .shop-slot.r-rare      { border-color: #2a5898; }
.r-epic      .shop-slot, .shop-slot.r-epic      { border-color: #00a854; }
.r-legendary .shop-slot, .shop-slot.r-legendary { border-color: #987820; }

.class-tag {
  position: absolute;
  top: 3px; right: 4px;
  font-size: 6px;
  padding: 1px 2px;
  border: 1px solid var(--border);
  color: var(--text-dim);
  background: rgba(0,0,0,0.5);
}
.tag-offclass { color: #f07020; border-color: #a05010; }

/* Detail panel */
.detail-panel {
  background: #100e20;
  border: 2px solid var(--border);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.detail-sprite-wrap {
  width: 36px;
  height: 36px;
  overflow: visible;
  flex-shrink: 0;
  position: relative;
}
.detail-sprite {
  width: 4px;
  height: 4px;
  image-rendering: pixelated;
  position: absolute;
  top: 0;
  left: 0;
}
.detail-text   { display: flex; flex-direction: column; gap: 3px; }
.detail-name    { font-size: 8px; }
.detail-rarity  { font-size: 7px; color: var(--text-dim); }
.detail-stats   { font-size: 7px; color: var(--text); }
.detail-special { font-size: 6px; color: #a080d0; }
.detail-warn    { font-size: 7px; color: #f07020; }
.detail-price   { font-size: 7px; color: var(--gold); }
.detail-actions { display: flex; gap: 6px; margin-top: 2px; }

.r-common .detail-name    { color: #909090; }
.r-uncommon .detail-name  { color: #4caf50; }
.r-rare .detail-name      { color: #4488dd; }
.r-epic .detail-name      { color: #00e676; }
.r-legendary .detail-name { color: #daa520; }

/* Tabs */
.shop-tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
}
.shop-tab {
  flex: 1;
  background: #0e0c1c;
  border: none;
  border-right: 2px solid var(--border);
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: var(--text-dim);
  padding: 6px 4px;
  cursor: pointer;
}
.shop-tab:last-child { border-right: none; }
.shop-tab:hover { background: #16142a; color: var(--text); }
.shop-tab.active { background: #16142a; color: var(--text-hi); border-bottom: 2px solid var(--text-hi); margin-bottom: -2px; }

/* Codex */
.codex-zone {
  border: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
}
.codex-zone.zone-locked { opacity: 0.45; }

.codex-zone-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}
.codex-zone-name { font-size: 8px; color: var(--text-hi); }
.codex-zone-lock { font-size: 7px; color: var(--text-dim); }

.codex-type-label { font-size: 6px; color: var(--text-dim); margin-top: 2px; }

.codex-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.codex-slot {
  width: 100%;
  background: #0e0c1c;
  border: 2px solid var(--border);
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: var(--text);
  padding: 4px 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  text-align: left;
  position: relative;
}
.codex-slot:hover { border-color: var(--border-hi); }

.codex-locked-label { font-size: 7px; color: var(--text-dim); }
</style>
