<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'
import { getOffClassPenalty } from '../game/formulas'
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
</script>

<template>
  <div v-if="char" class="pixel-panel">
    <div class="panel-title">Gear</div>
    <div class="inner">
      <div
        class="slot"
        :class="char.gear.weapon ? 'slot-filled' : 'slot-empty'"
        @click="char.gear.weapon && unequip('weapon')"
      >
        <div v-if="char.gear.weapon" class="slot-content">
          <div class="slot-head">
            <span :class="['slot-name', rarityClass[char.gear.weapon.rarity]]">{{ char.gear.weapon.name }}</span>
            <span v-if="isOffClass(char.gear.weapon)" class="off-class">⚠ 70%</span>
          </div>
          <span class="slot-stat">{{ weaponSummary(char.gear.weapon) }}</span>
        </div>
        <span v-else class="slot-placeholder">Weapon — empty</span>
        <span v-if="char.gear.weapon" class="slot-hint">unequip</span>
      </div>

      <div
        class="slot"
        :class="char.gear.armor ? 'slot-filled' : 'slot-empty'"
        @click="char.gear.armor && unequip('armor')"
      >
        <div v-if="char.gear.armor" class="slot-content">
          <div class="slot-head">
            <span :class="['slot-name', rarityClass[char.gear.armor.rarity]]">{{ char.gear.armor.name }}</span>
            <span v-if="isOffClass(char.gear.armor)" class="off-class">⚠ 70%</span>
          </div>
          <span class="slot-stat">{{ armorSummary(char.gear.armor) }}</span>
        </div>
        <span v-else class="slot-placeholder">Armor — empty</span>
        <span v-if="char.gear.armor" class="slot-hint">unequip</span>
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
.slot-content { flex: 1; min-width: 0; }
.slot-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.slot-name { font-size: 9px; }
.slot-stat { font-size: 8px; color: var(--text-dim); }
.slot-placeholder { font-size: 9px; color: var(--text-dim); }
.slot-hint { font-size: 7px; color: var(--text-dim); white-space: nowrap; flex-shrink: 0; }
.off-class { font-size: 8px; color: #d8a060; }
.r-common    { color: var(--text); }
.r-uncommon  { color: var(--blue); }
.r-rare      { color: var(--gold); }
.r-epic      { color: var(--purple); }
.r-legendary { color: var(--gold); text-shadow: 0 0 6px rgba(224,184,78,0.6); }
</style>
