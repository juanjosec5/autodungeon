<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useSaveStore } from '../stores/save'
import { useProgressionStore } from '../stores/progression'
import { useShopStore } from '../stores/shop'
import { CONSUMABLE_DEFS } from '../game/shop'
import { getBuyPrice } from '../game/items'
import { getOffClassPenalty } from '../game/formulas'
import { getItemSpriteStyle } from '../game/item-sprites'
import { fmtNum } from '../utils/format'
import TutorialToast from './TutorialToast.vue'
import type { Item, ConsumableId } from '../types/index'

const characterStore = useCharacterStore()
const saveStore = useSaveStore()
const progressionStore = useProgressionStore()
const shopStore = useShopStore()

// ── Tabs ──────────────────────────────────────────────────────────────────────
type Tab = 'stock' | 'consumables'
const activeTab = ref<Tab>('stock')

// ── Countdown timer ───────────────────────────────────────────────────────────
const now = ref(Date.now())
let clockTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => { clockTimer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => { if (clockTimer) clearInterval(clockTimer) })

function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60).toString().padStart(2, '0')
  const s = (total % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const restockIn = computed(() => formatMs(shopStore.timeToNextRotation))

// ── Stock tab ─────────────────────────────────────────────────────────────────
const stockItems = computed(() => shopStore.currentStock)

const stockWeapons = computed(() => stockItems.value.filter((i) => i.type === 'weapon'))
const stockArmors  = computed(() => stockItems.value.filter((i) => i.type === 'armor'))

const selectedItem = ref<Item | null>(null)

function selectItem(item: Item) {
  selectedItem.value = selectedItem.value?.id === item.id ? null : item
}

const char = computed(() => characterStore.character)

function canAfford(item: Item) {
  return (char.value?.gold ?? 0) >= getBuyPrice(item.rarity)
}
function invFull() {
  return (char.value?.inventory.length ?? 0) >= 50
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

// ── Consumables tab ───────────────────────────────────────────────────────────
const consFlashMsg = ref<Record<ConsumableId, string | null>>({
  'war-potion': null, 'iron-flask': null, 'swift-elixir': null,
  'fortune-charm': null, 'xp-tome': null,
})
const consFlashTimers: Partial<Record<ConsumableId, ReturnType<typeof setTimeout>>> = {}

function flashCons(id: ConsumableId, msg: string) {
  consFlashMsg.value[id] = msg
  if (consFlashTimers[id]) clearTimeout(consFlashTimers[id])
  consFlashTimers[id] = setTimeout(() => { consFlashMsg.value[id] = null }, 2000)
}

function buyCons(id: ConsumableId) {
  const def = CONSUMABLE_DEFS.find((d) => d.id === id)
  if (!def || !char.value) return
  const result = shopStore.buyConsumable(id, char.value.gold, (amount) => {
    const success = characterStore.spendGold(amount)
    if (success) saveStore.saveCharacter()
    return success
  })
  if (result) {
    flashCons(id, 'Active!')
  } else {
    flashCons(id, 'Not enough gold!')
  }
}

const collapsed = ref(localStorage.getItem('collapsed_shop') === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('collapsed_shop', String(collapsed.value))
}
</script>

<template>
  <div class="pixel-panel shop-panel">
    <div class="panel-title" @click="toggleCollapse">
      Shop
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>

    <div class="inner" v-if="!collapsed">
      <TutorialToast
        v-if="!progressionStore.hasSeen('shop')"
        panel-id="shop"
        title="The Shop"
        @dismiss="progressionStore.markTutorialSeen('shop')"
      >
        Stock rotates every 30 minutes — 3 weapons + 3 armors each rotation.<br>
        Consumables are temporary gold-bought buffs that persist through page reloads.
      </TutorialToast>

      <!-- Gold + flash -->
      <div class="gold-row">
        <span class="gold-label">Gold:</span>
        <span class="gold-val">{{ fmtNum(char?.gold ?? 0) }}g</span>
        <span v-if="flashMsg" class="flash-msg">{{ flashMsg }}</span>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ 'tab-active': activeTab === 'stock' }"
          @click="activeTab = 'stock'"
        >⚔ Stock</button>
        <button
          class="tab-btn"
          :class="{ 'tab-active': activeTab === 'consumables' }"
          @click="activeTab = 'consumables'"
        >🧪 Consumables</button>
      </div>

      <!-- ── Stock tab ─────────────────────────────────────────────────── -->
      <template v-if="activeTab === 'stock'">
        <div class="restock-row">
          <span class="restock-label">Restock in:</span>
          <span class="restock-val">{{ restockIn }}</span>
        </div>

        <!-- Weapons -->
        <div class="stock-section-label">⚔ Weapons</div>
        <div class="shop-grid">
          <button
            v-for="item in stockWeapons"
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
            <span v-if="isOffClass(item)" class="off-class-warning">⚠ 30%</span>
            <span v-else-if="classTag(item)" class="class-tag">{{ classTag(item) }}</span>
          </button>
        </div>

        <!-- Armor -->
        <div class="stock-section-label">🛡 Armor</div>
        <div class="shop-grid">
          <button
            v-for="item in stockArmors"
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
            <span v-if="isOffClass(item)" class="off-class-warning">⚠ 30%</span>
            <span v-else-if="classTag(item)" class="class-tag">{{ classTag(item) }}</span>
          </button>
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
      </template>

      <!-- ── Consumables tab ───────────────────────────────────────────── -->
      <template v-if="activeTab === 'consumables'">
        <div class="cons-grid">
          <div
            v-for="def in CONSUMABLE_DEFS"
            :key="def.id"
            class="cons-card"
            :class="{ 'cons-active': shopStore.isActive(def.id) }"
          >
            <div class="cons-icon">{{ def.icon }}</div>
            <div class="cons-name">{{ def.name }}</div>
            <div class="cons-desc">{{ def.description }}</div>
            <div v-if="shopStore.isActive(def.id)" class="cons-timer">
              ⏱ {{ formatMs(shopStore.remainingMs(def.id)) }}
            </div>
            <div v-if="consFlashMsg[def.id]" class="cons-flash">{{ consFlashMsg[def.id] }}</div>
            <button
              class="pixel-btn cons-buy"
              :disabled="shopStore.isActive(def.id) || (char?.gold ?? 0) < def.cost"
              @click="buyCons(def.id)"
            >
              <template v-if="shopStore.isActive(def.id)">Active</template>
              <template v-else>{{ def.cost }}g</template>
            </button>
          </div>
        </div>
      </template>
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

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 4px;
}
.tab-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  background: #1a1830;
  border: 2px solid var(--border);
  color: var(--text-dim);
  padding: 5px 8px;
  cursor: pointer;
}
.tab-btn:hover { border-color: var(--border-hi); color: var(--text); }
.tab-active {
  border-color: var(--gold);
  color: var(--gold);
  background: rgba(200,160,40,0.08);
}

/* Restock row */
.restock-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 7px;
}
.restock-label { color: var(--text-dim); }
.restock-val   { color: var(--gold); font-size: 8px; }

/* Stock section label */
.stock-section-label {
  font-size: 7px;
  color: var(--text-dim);
  letter-spacing: 1px;
  padding: 2px 0;
  border-bottom: 1px solid var(--border);
  margin-top: 2px;
}

/* Shop grid */
.shop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

.r-common    .shop-slot, .shop-slot.r-common    { border-color: #555560; }
.r-uncommon  .shop-slot, .shop-slot.r-uncommon  { border-color: #2d7a30; }
.r-rare      .shop-slot, .shop-slot.r-rare      { border-color: #2a5898; }
.r-epic      .shop-slot, .shop-slot.r-epic      { border-color: #80306a; }
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

.off-class-warning {
  position: absolute;
  top: 3px;
  right: 3px;
  font-size: 5px;
  color: var(--orange, #f08830);
  line-height: 1;
}

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
.r-epic .detail-name      { color: #d060b8; }
.r-legendary .detail-name { color: #daa520; }

/* Consumables grid */
.cons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.cons-card {
  background: #0d0b1a;
  border: 1px solid var(--border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.cons-card.cons-active {
  border-color: var(--gold);
  background: rgba(200,160,40,0.06);
}

.cons-icon { font-size: 16px; }
.cons-name { font-family: 'Press Start 2P', monospace; font-size: 6px; color: var(--text-hi); }
.cons-desc { font-family: 'Press Start 2P', monospace; font-size: 5px; color: var(--text-dim); line-height: 1.6; }
.cons-timer { font-family: 'Press Start 2P', monospace; font-size: 7px; color: var(--gold); }
.cons-flash { font-family: 'Press Start 2P', monospace; font-size: 6px; color: var(--gold); }

.cons-buy {
  font-size: 6px;
  padding: 4px 8px;
  width: 100%;
  margin-top: 2px;
}
.cons-buy:disabled { opacity: 0.4; cursor: default; box-shadow: none; top: 0; left: 0; }
</style>
