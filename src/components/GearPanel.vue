<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { getOffClassPenalty } from '../game/formulas'
import { getItemSpriteStyle } from '../game/item-sprites'
import type { Item } from '../types/index'

const characterStore = useCharacterStore()
const char = computed(() => characterStore.character)

const rarityClass: Record<string, string> = {
  common:    'r-common',
  uncommon:  'r-uncommon',
  rare:      'r-rare',
  epic:      'r-epic',
  legendary: 'r-legendary',
}

function isOffClass(item: Item): boolean {
  if (!char.value) return false
  return getOffClassPenalty(item, char.value.class) < 1.0
}

function weaponSummary(item: Item): string {
  return `${item.stats.minDmg}–${item.stats.maxDmg} dmg`
}

function armorSummary(item: Item): string {
  const parts: string[] = []
  if (item.stats.defBonus) parts.push(`+${item.stats.defBonus} DEF`)
  if (item.stats.hpBonus)  parts.push(`+${item.stats.hpBonus} HP`)
  return parts.join('  ')
}

function unequip(slot: 'weapon' | 'armor') {
  characterStore.unequipItem(slot)
}

const collapsed = ref(localStorage.getItem('collapsed_gear') === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('collapsed_gear', String(collapsed.value))
}
</script>

<template>
  <div v-if="char" class="pixel-panel">
    <div class="panel-title">
      Gear
      <button class="collapse-btn" @click="toggleCollapse">{{ collapsed ? '►' : '▾' }}</button>
    </div>
    <div v-if="!collapsed" class="inner">
      <div
        class="slot"
        :class="char.gear.weapon ? 'slot-filled' : 'slot-empty'"
        @click="char.gear.weapon && unequip('weapon')"
      >
        <template v-if="char.gear.weapon">
          <div class="gear-sprite-wrap">
            <div class="gear-sprite" :style="{ boxShadow: getItemSpriteStyle(char.gear.weapon.defId ?? char.gear.weapon.id) }"></div>
          </div>
          <div class="slot-content">
            <div class="slot-head">
              <span :class="['slot-name', rarityClass[char.gear.weapon.rarity]]">{{ char.gear.weapon.name }}</span>
              <span :class="['slot-rarity', rarityClass[char.gear.weapon.rarity]]">{{ char.gear.weapon.rarity }}</span>
              <span v-if="isOffClass(char.gear.weapon)" class="off-class">⚠ 70%</span>
            </div>
            <span class="slot-stat">{{ weaponSummary(char.gear.weapon) }}</span>
          </div>
          <span class="slot-hint">unequip</span>
        </template>
        <span v-else class="slot-placeholder">Weapon — empty</span>
      </div>

      <div
        class="slot"
        :class="char.gear.armor ? 'slot-filled' : 'slot-empty'"
        @click="char.gear.armor && unequip('armor')"
      >
        <template v-if="char.gear.armor">
          <div class="gear-sprite-wrap">
            <div class="gear-sprite" :style="{ boxShadow: getItemSpriteStyle(char.gear.armor.defId ?? char.gear.armor.id) }"></div>
          </div>
          <div class="slot-content">
            <div class="slot-head">
              <span :class="['slot-name', rarityClass[char.gear.armor.rarity]]">{{ char.gear.armor.name }}</span>
              <span :class="['slot-rarity', rarityClass[char.gear.armor.rarity]]">{{ char.gear.armor.rarity }}</span>
              <span v-if="isOffClass(char.gear.armor)" class="off-class">⚠ 70%</span>
            </div>
            <span class="slot-stat">{{ armorSummary(char.gear.armor) }}</span>
          </div>
          <span class="slot-hint">unequip</span>
        </template>
        <span v-else class="slot-placeholder">Armor — empty</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 6px; }
.slot {
  border: 2px solid var(--border);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-shadow: 2px 2px 0 #000;
  position: relative;
  top: 0; left: 0;
}
.slot-filled { background: #1e1c38; cursor: pointer; }
.slot-filled:hover { border-color: var(--border-hi); }
.slot-filled:active { top: 2px; left: 2px; box-shadow: none; }
.slot-empty { border-style: dashed; opacity: 0.45; cursor: default; }
.gear-sprite-wrap {
  width: 28px;
  height: 30px;
  flex-shrink: 0;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gear-sprite {
  width: 3px;
  height: 3px;
  image-rendering: pixelated;
  flex-shrink: 0;
  transform: translate(-12px, -15px);
}
.slot-content { flex: 1; min-width: 0; }
.slot-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.slot-name { font-size: 9px; }
.slot-rarity { font-size: 7px; text-transform: capitalize; opacity: 0.85; }
.slot-stat { font-size: 8px; color: var(--text-dim); }
.slot-placeholder { font-size: 9px; color: var(--text-dim); }
.slot-hint { font-size: 7px; color: var(--text-dim); white-space: nowrap; flex-shrink: 0; }
.off-class { font-size: 8px; color: #d8a060; }
.r-common    { color: #909090; }
.r-uncommon  { color: #4caf50; }
.r-rare      { color: #4488dd; }
.r-epic      { color: #d060b8; }
.r-legendary { color: #daa520; text-shadow: 0 0 6px rgba(218,165,32,0.5); }
</style>
