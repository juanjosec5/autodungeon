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
    <div class="panel-title" @click="toggleCollapse">
      Gear
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>
    <div v-if="!collapsed" class="inner">

      <!-- Weapon slot -->
      <div
        class="slot"
        :class="char.gear.weapon ? ['slot-filled', rarityClass[char.gear.weapon.rarity]] : 'slot-empty'"
      >
        <template v-if="char.gear.weapon">
          <div class="gear-sprite-wrap">
            <div class="gear-sprite" :style="{ boxShadow: getItemSpriteStyle(char.gear.weapon.defId ?? char.gear.weapon.id, 4) }"></div>
          </div>
          <div class="slot-content">
            <div class="slot-head">
              <span :class="['slot-name', rarityClass[char.gear.weapon.rarity]]">{{ char.gear.weapon.name }}</span>
              <span :class="['slot-badge', rarityClass[char.gear.weapon.rarity]]">{{ char.gear.weapon.rarity }}</span>
            </div>
            <div class="slot-stats">{{ statLine(char.gear.weapon) }}</div>
            <div v-if="specialLine(char.gear.weapon)" class="slot-special">{{ specialLine(char.gear.weapon) }}</div>
            <div v-if="isOffClass(char.gear.weapon)" class="slot-warn">⚠ Off-class: 70% effectiveness</div>
          </div>
          <button class="pixel-btn unequip-btn" @click="unequip('weapon')">Unequip</button>
        </template>
        <span v-else class="slot-placeholder">⚔ Weapon — empty</span>
      </div>

      <!-- Armor slot -->
      <div
        class="slot"
        :class="char.gear.armor ? ['slot-filled', rarityClass[char.gear.armor.rarity]] : 'slot-empty'"
      >
        <template v-if="char.gear.armor">
          <div class="gear-sprite-wrap">
            <div class="gear-sprite" :style="{ boxShadow: getItemSpriteStyle(char.gear.armor.defId ?? char.gear.armor.id, 4) }"></div>
          </div>
          <div class="slot-content">
            <div class="slot-head">
              <span :class="['slot-name', rarityClass[char.gear.armor.rarity]]">{{ char.gear.armor.name }}</span>
              <span :class="['slot-badge', rarityClass[char.gear.armor.rarity]]">{{ char.gear.armor.rarity }}</span>
            </div>
            <div class="slot-stats">{{ statLine(char.gear.armor) }}</div>
            <div v-if="specialLine(char.gear.armor)" class="slot-special">{{ specialLine(char.gear.armor) }}</div>
            <div v-if="isOffClass(char.gear.armor)" class="slot-warn">⚠ Off-class: 70% effectiveness</div>
          </div>
          <button class="pixel-btn unequip-btn" @click="unequip('armor')">Unequip</button>
        </template>
        <span v-else class="slot-placeholder">🛡 Armor — empty</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 8px; }

.slot {
  border: 2px solid var(--border);
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #0e0c1c;
  position: relative;
}
.slot-filled { cursor: default; }
.slot-empty { border-style: dashed; opacity: 0.4; cursor: default; }

/* Rarity border tints */
.slot-filled.r-uncommon  { border-color: #2d7a30; background: #0b140c; }
.slot-filled.r-rare      { border-color: #2a5898; background: #08101e; }
.slot-filled.r-epic      { border-color: #80306a; background: #160a14; }
.slot-filled.r-legendary { border-color: #987820; background: #180e00; }

/* Sprite */
.gear-sprite-wrap {
  width: 40px;
  height: 44px;
  flex-shrink: 0;
  overflow: visible;
  position: relative;
}
.gear-sprite {
  width: 4px;
  height: 4px;
  image-rendering: pixelated;
  position: absolute;
  top: 0;
  left: 0;
}

/* Slot content */
.slot-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.slot-head { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.slot-name { font-size: 9px; }
.slot-badge {
  font-size: 6px;
  padding: 1px 4px;
  border: 1px solid currentColor;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.slot-stats   { font-size: 8px; color: var(--text); }
.slot-special { font-size: 7px; color: #a080d0; line-height: 1.6; }
.slot-warn    { font-size: 7px; color: #d8a060; }
.slot-placeholder { font-size: 8px; color: var(--text-dim); }

.unequip-btn {
  flex-shrink: 0;
  align-self: flex-start;
  font-size: 7px;
  padding: 4px 8px;
  color: var(--text-dim);
  border-color: var(--border);
}

/* Rarity text colors */
.r-common    { color: #909090; }
.r-uncommon  { color: #4caf50; }
.r-rare      { color: #4488dd; }
.r-epic      { color: #d060b8; }
.r-legendary { color: #daa520; text-shadow: 0 0 6px rgba(218,165,32,0.4); }
</style>
