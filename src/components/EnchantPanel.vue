<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useSaveStore } from '../stores/save'
import { useProgressionStore } from '../stores/progression'
import { fmtNum } from '../utils/format'
import { LS_KEYS } from '../utils/storage'
import TutorialToast from './TutorialToast.vue'
import type { Item } from '../types/index'

const characterStore = useCharacterStore()
const saveStore = useSaveStore()
const progressionStore = useProgressionStore()
const char = computed(() => characterStore.character)

function rarityClass(rarity: string) { return `r-${rarity}` }

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

const enchantableItems = computed<Item[]>(() => {
  const c = char.value
  if (!c) return []
  const gear = [c.gear.weapon, c.gear.armor].filter(Boolean) as Item[]
  return [...gear, ...c.inventory]
})

const enchantFlash = ref<string | null>(null)
let enchantFlashTimer: ReturnType<typeof setTimeout> | null = null

function doEnchant(item: Item) {
  const result = characterStore.enchantItem(item.id)
  if (result === 'enchanted') {
    enchantFlash.value = `${item.name} enchanted!`
    saveStore.saveCharacter()
  } else if (result === 'no_gold') {
    enchantFlash.value = 'Not enough gold!'
  } else {
    enchantFlash.value = 'Item not found!'
  }
  if (enchantFlashTimer) clearTimeout(enchantFlashTimer)
  enchantFlashTimer = setTimeout(() => { enchantFlash.value = null }, 2000)
}

onBeforeUnmount(() => { if (enchantFlashTimer) clearTimeout(enchantFlashTimer) })

const collapsed = ref(localStorage.getItem(LS_KEYS.collapsed.enchant) === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem(LS_KEYS.collapsed.enchant, String(collapsed.value))
}
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title" @click="toggleCollapse">
      Enchant
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>

    <div class="inner" v-if="!collapsed">
      <TutorialToast
        v-if="!progressionStore.hasSeen('enchant')"
        panel-id="enchant"
        title="Enchanting"
        @dismiss="progressionStore.markTutorialSeen('enchant')"
      >
        Spend gold to add a random special effect to any item. Enchanting again <b>rerolls</b> the effect — you can't stack multiple enchants.<br>
        Higher rarity items cost more to enchant but can roll more powerful effects.<br>
        Enchanting your equipped gear is fine — the item stays equipped.
      </TutorialToast>

      <div class="gold-row">
        <span class="gold-label">Gold:</span>
        <span class="gold-val">{{ fmtNum(char?.gold ?? 0) }}g</span>
        <span v-if="enchantFlash" class="flash-msg">{{ enchantFlash }}</span>
      </div>
      <p class="enchant-hint">Add or reroll a special effect on any owned item. Cost doubles each enchant.</p>
      <div v-if="enchantableItems.length === 0" class="enchant-empty">No items to enchant.</div>
      <div
        v-for="item in enchantableItems"
        :key="item.id"
        class="enchant-row"
        :class="rarityClass(item.rarity)"
      >
        <div class="enchant-item-info">
          <span class="enchant-item-name">{{ item.name }}</span>
          <span class="enchant-item-specials">{{ specialLine(item) || 'No specials' }}</span>
          <span v-if="(item.enchantCount ?? 0) > 0" class="enchant-count">Enchanted ×{{ item.enchantCount }}</span>
        </div>
        <div class="enchant-item-right">
          <span class="enchant-cost">{{ characterStore.getEnchantCost(item) }}g</span>
          <button
            class="pixel-btn btn-gold enchant-btn"
            :disabled="(char?.gold ?? 0) < characterStore.getEnchantCost(item)"
            @click="doEnchant(item)"
          >✦</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.enchant-hint {
  font-size: 7px;
  color: var(--text-dim);
  margin: 0;
  line-height: 1.8;
}
.enchant-empty { font-size: 7px; color: var(--text-dim); text-align: center; padding: 8px; }
.enchant-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #100e20;
  border: 2px solid var(--border);
  padding: 6px 8px;
}
.enchant-row.r-uncommon  { border-color: #2d7a30; }
.enchant-row.r-rare      { border-color: #2a5898; }
.enchant-row.r-epic      { border-color: #80306a; }
.enchant-row.r-legendary { border-color: #987820; }
.enchant-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.enchant-item-name     { font-size: 7px; color: var(--text-hi); }
.enchant-item-specials { font-size: 6px; color: #a080d0; }
.enchant-count         { font-size: 6px; color: var(--gold-dim, #c09030); }
.enchant-item-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.enchant-cost { font-size: 7px; color: var(--gold); white-space: nowrap; }
.enchant-btn {
  font-size: 10px;
  padding: 4px 7px;
}
</style>
