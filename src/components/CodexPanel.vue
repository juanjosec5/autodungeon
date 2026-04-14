<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useZoneStore } from '../stores/zone'
import { ITEM_DEFINITIONS, SHOP_ITEMS } from '../game/item-data'
import { getOffClassPenalty } from '../game/formulas'
import { getItemSpriteStyle } from '../game/item-sprites'
import type { Item, ZoneId } from '../types/index'

const characterStore = useCharacterStore()
const zoneStore = useZoneStore()
const char = computed(() => characterStore.character)

const ZONE_ORDER: ZoneId[] = ['forest', 'dungeon', 'volcano', 'abyss', 'shadowrealm', 'celestial', 'void', 'nightmare']

const ZONE_META = [
  { name: 'Forest',      minZoneIdx: 0, maxZoneIdx: 0, unlockLevel: 1  },
  { name: 'Dungeon',     minZoneIdx: 1, maxZoneIdx: 1, unlockLevel: 5  },
  { name: 'Volcano',     minZoneIdx: 2, maxZoneIdx: 2, unlockLevel: 12 },
  { name: 'Abyss',       minZoneIdx: 3, maxZoneIdx: 3, unlockLevel: 20 },
  { name: 'Shadowrealm', minZoneIdx: 4, maxZoneIdx: 4, unlockLevel: 30 },
  { name: 'Celestial',   minZoneIdx: 5, maxZoneIdx: 5, unlockLevel: 45 },
  { name: 'Void',        minZoneIdx: 6, maxZoneIdx: 6, unlockLevel: 60 },
  { name: 'Nightmare',   minZoneIdx: 7, maxZoneIdx: 7, unlockLevel: 80 },
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

  return ZONE_META.map(({ name, minZoneIdx, maxZoneIdx, unlockLevel }) => {
    const items = SHOP_ITEMS
      .filter(({ minZone }) => minZone >= minZoneIdx && minZone <= maxZoneIdx)
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

const discoveredItems = computed<Set<string>>(() => {
  const list = characterStore.character?.discoveredItems ?? []
  return new Set(list)
})

function isDiscovered(item: Item): boolean {
  return discoveredItems.value.has(item.id)
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

// Hover tooltip
const tooltipItem = ref<Item | null>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

function showTooltip(event: MouseEvent, item: Item) {
  tooltipItem.value = item
  updateTooltipPos(event)
}
function updateTooltipPos(event: MouseEvent) {
  tooltipX.value = event.clientX
  tooltipY.value = event.clientY
}
function hideTooltip() {
  tooltipItem.value = null
}

const collapsed = ref(localStorage.getItem('collapsed_codex') === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('collapsed_codex', String(collapsed.value))
}
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title" @click="toggleCollapse">
      Codex
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>

    <div class="inner" v-if="!collapsed">
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
            <div
              v-for="item in (items as Item[])"
              :key="item.id"
              class="codex-slot"
              :class="[
                isDiscovered(item) ? rarityClass(item.rarity) : 'undiscovered',
              ]"
              @mouseenter="isDiscovered(item) ? showTooltip($event, item) : null"
              @mousemove="isDiscovered(item) ? updateTooltipPos($event) : null"
              @mouseleave="hideTooltip"
            >
              <template v-if="isDiscovered(item)">
                <div class="slot-sprite-wrap">
                  <div class="slot-sprite" :style="{ boxShadow: getItemSpriteStyle(item.id) }"></div>
                </div>
                <span class="slot-name">{{ item.name }}</span>
                <span v-if="classTag(item)" class="class-tag" :class="{ 'tag-offclass': isOffClass(item) }">{{ classTag(item) }}</span>
              </template>
              <template v-else>
                <div class="slot-sprite-wrap">
                  <div class="mystery-icon">?</div>
                </div>
                <span class="slot-name undiscovered-name">???</span>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Codex hover tooltip (teleported to body) -->
    <Teleport to="body">
      <div
        v-if="tooltipItem && !collapsed"
        class="codex-tooltip"
        :class="rarityClass(tooltipItem.rarity)"
        :style="{ left: tooltipX + 14 + 'px', top: tooltipY - 10 + 'px' }"
      >
        <div class="tt-header">
          <div class="tt-sprite-wrap">
            <div class="tt-sprite" :style="{ boxShadow: getItemSpriteStyle(tooltipItem.id, 4) }"></div>
          </div>
          <div class="tt-info">
            <div class="tt-name" :class="rarityClass(tooltipItem.rarity)">{{ tooltipItem.name }}</div>
            <div class="tt-rarity">{{ tooltipItem.rarity.toUpperCase() }} {{ tooltipItem.type.toUpperCase() }}</div>
          </div>
        </div>
        <div class="tt-stats">{{ statLine(tooltipItem) }}</div>
        <div v-if="specialLine(tooltipItem)" class="tt-special">{{ specialLine(tooltipItem) }}</div>
        <div v-if="isOffClass(tooltipItem)" class="tt-warn">⚠ Off-class: 70%</div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 6px; }

/* Rarity colors */
.r-common    { color: #909090; border-color: #555560; }
.r-uncommon  { color: #4caf50; border-color: #2d7a30; }
.r-rare      { color: #4488dd; border-color: #2a5898; }
.r-epic      { color: #d060b8; border-color: #80306a; }
.r-legendary { color: #daa520; border-color: #987820; }

/* Codex zones */
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

/* Undiscovered */
.codex-slot.undiscovered {
  border-color: #2a2840;
  cursor: default;
  opacity: 0.6;
}
.mystery-icon {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #444460;
  width: 26px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.undiscovered-name { color: #3a3858; }

/* Sprite */
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
.slot-name { color: var(--text); line-height: 1.4; }

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

/* Tooltip */
.codex-tooltip {
  position: fixed;
  z-index: 9999;
  background: #0e0c1e;
  border: 2px solid var(--border);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: none;
  max-width: 200px;
  box-shadow: 4px 4px 0 #000;
}
.codex-tooltip.r-uncommon  { border-color: #2d7a30; }
.codex-tooltip.r-rare      { border-color: #2a5898; }
.codex-tooltip.r-epic      { border-color: #80306a; }
.codex-tooltip.r-legendary { border-color: #987820; }

.tt-header { display: flex; align-items: flex-start; gap: 8px; }
.tt-sprite-wrap {
  width: 30px; height: 30px;
  flex-shrink: 0;
  position: relative;
  overflow: visible;
}
.tt-sprite {
  width: 4px; height: 4px;
  image-rendering: pixelated;
  position: absolute;
  top: 0; left: 0;
}
.tt-info { display: flex; flex-direction: column; gap: 2px; }
.tt-name { font-size: 7px; }
.tt-name.r-common    { color: #909090; }
.tt-name.r-uncommon  { color: #4caf50; }
.tt-name.r-rare      { color: #4488dd; }
.tt-name.r-epic      { color: #d060b8; }
.tt-name.r-legendary { color: #daa520; }
.tt-rarity  { font-size: 6px; color: var(--text-dim); }
.tt-stats   { font-size: 7px; color: var(--text); }
.tt-special { font-size: 6px; color: #a080d0; }
.tt-warn    { font-size: 6px; color: #f07020; }
</style>
