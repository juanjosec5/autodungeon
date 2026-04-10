<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useZoneStore } from '../stores/zone'
import { useSaveStore } from '../stores/save'
import { ITEM_DEFINITIONS, SHOP_ITEMS, getBuyPrice } from '../game/items'
import { getOffClassPenalty } from '../game/formulas'
import type { Item, ZoneId } from '../types/index'

const characterStore = useCharacterStore()
const zoneStore = useZoneStore()
const saveStore = useSaveStore()

const ZONE_ORDER: ZoneId[] = ['forest', 'dungeon', 'volcano']

const shopItems = computed(() => {
  const zone = zoneStore.activeZone
  const zoneIdx = ZONE_ORDER.indexOf(zone)
  return SHOP_ITEMS
    .filter(({ minZone }) => ZONE_ORDER.indexOf(minZone) <= zoneIdx)
    .map(({ itemId }) => ITEM_DEFINITIONS.find((i) => i.id === itemId)!)
    .filter(Boolean)
})

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

function rarityClass(rarity: string) {
  return `r-${rarity}`
}

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
  if (s.minDmg !== undefined) parts.push(`DMG ${s.minDmg}-${s.maxDmg}`)
  if (s.defBonus !== undefined) parts.push(`DEF +${s.defBonus}`)
  if (s.hpBonus !== undefined) parts.push(`HP +${s.hpBonus}`)
  return parts.join('  ')
}

function specialLine(item: Item): string {
  return (item.stats.special ?? []).map((fx) => {
    switch (fx.type) {
      case 'lifesteal':       return `Lifesteal ${Math.round(fx.value * 100)}%`
      case 'poison':          return `Poison ${Math.round(fx.dpsMultiplier * 100)}%`
      case 'dodge':           return `Dodge ${Math.round(fx.chance * 100)}%`
      case 'block':           return `Block ${Math.round(fx.chance * 100)}%`
      case 'defIgnore':       return `Armor ignore ${Math.round(fx.percent * 100)}%`
      case 'spellAmp':        return `Spell amp ${Math.round(fx.percent * 100)}%`
      case 'critThreshold':   return `Crit on ${fx.rollsAt}+`
      case 'doublecast':      return `Doublecast ${Math.round(fx.chance * 100)}%`
      case 'attackSpeedBonus':return `Atk speed +${Math.round(fx.percent * 100)}%`
      case 'regenOnKill':     return `Regen on kill ${Math.round(fx.percent * 100)}%`
      default: return ''
    }
  }).filter(Boolean).join(', ')
}
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title">Shop</div>

    <div class="inner">
      <!-- Gold display -->
      <div class="gold-row">
        <span class="gold-label">Gold:</span>
        <span class="gold-val">{{ char?.gold ?? 0 }}g</span>
        <span v-if="flashMsg" class="flash-msg">{{ flashMsg }}</span>
      </div>

      <!-- Item grid -->
      <div class="shop-grid">
        <button
          v-for="item in shopItems"
          :key="item.id"
          class="shop-slot"
          :class="[
            rarityClass(item.rarity),
            { 'slot-selected': selectedItem?.id === item.id },
            { 'slot-cant-afford': !canAfford(item) },
          ]"
          @click="selectItem(item)"
        >
          <span class="slot-icon">{{ item.type === 'weapon' ? '⚔️' : '🛡️' }}</span>
          <span class="slot-name">{{ item.name }}</span>
          <span class="slot-price">{{ getBuyPrice(item.rarity) }}g</span>
          <span v-if="classTag(item)" class="class-tag" :class="{ 'tag-offclass': isOffClass(item) }">
            {{ classTag(item) }}
          </span>
        </button>
      </div>

      <!-- Detail panel -->
      <div v-if="selectedItem" class="detail-panel" :class="rarityClass(selectedItem.rarity)">
        <div class="detail-name" :class="rarityClass(selectedItem.rarity)">{{ selectedItem.name }}</div>
        <div class="detail-rarity">{{ selectedItem.rarity.toUpperCase() }} {{ selectedItem.type.toUpperCase() }}</div>
        <div class="detail-stats">{{ statLine(selectedItem) }}</div>
        <div v-if="specialLine(selectedItem)" class="detail-special">{{ specialLine(selectedItem) }}</div>
        <div v-if="isOffClass(selectedItem)" class="detail-warn">⚠ Off-class: 50% penalty</div>
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
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 8px; }

.gold-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 8px;
}
.gold-label { color: var(--text-dim); }
.gold-val   { color: var(--gold); }
.flash-msg  { color: var(--gold); font-size: 7px; margin-left: auto; }

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
  padding: 5px 6px;
  cursor: pointer;
  box-shadow: 2px 2px 0 #000;
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
  top: 0; left: 0;
  text-align: left;
}
.shop-slot:hover { border-color: var(--border-hi); }
.shop-slot:active { top: 2px; left: 2px; box-shadow: none; }

.slot-icon  { font-size: 10px; line-height: 1; }
.slot-name  { color: var(--text); line-height: 1.4; }
.slot-price { color: var(--gold-dim); font-size: 7px; }

.slot-selected   { outline: 2px solid #f07020; outline-offset: -2px; }
.slot-cant-afford { opacity: 0.55; }

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

/* Rarity borders on shop slots */
.r-common    { border-color: #505060; }
.r-uncommon  { border-color: #308030; color: #60c060; }
.r-rare      { border-color: #304898; color: #6090e0; }
.r-epic      { border-color: #702898; color: #b060e0; }
.r-legendary { border-color: #987020; color: var(--gold); }

/* Detail panel */
.detail-panel {
  background: #100e20;
  border: 2px solid var(--border);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.detail-name    { font-size: 8px; }
.detail-rarity  { font-size: 7px; color: var(--text-dim); }
.detail-stats   { font-size: 7px; color: var(--text); }
.detail-special { font-size: 6px; color: #a080d0; }
.detail-warn    { font-size: 7px; color: #f07020; }
.detail-price   { font-size: 7px; color: var(--gold); }
.detail-actions { display: flex; gap: 6px; margin-top: 2px; }

.r-common .detail-name    { color: #c0c0c8; }
.r-uncommon .detail-name  { color: #60c060; }
.r-rare .detail-name      { color: #6090e0; }
.r-epic .detail-name      { color: #b060e0; }
.r-legendary .detail-name { color: var(--gold); }
</style>
