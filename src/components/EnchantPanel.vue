<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useSaveStore } from '../stores/save'
import { useProgressionStore } from '../stores/progression'
import { previewEnchant, type EnchantPreview } from '../game/items'
import { getEffectTotals, type CappedEffectType } from '../game/effect-totals'
import { fmtNum } from '../utils/format'
import { LS_KEYS } from '../utils/storage'
import TutorialToast from './TutorialToast.vue'
import type { Item, SpecialEffect } from '../types/index'

const characterStore = useCharacterStore()
const saveStore = useSaveStore()
const progressionStore = useProgressionStore()
const char = computed(() => characterStore.character)

function rarityClass(rarity: string) { return `r-${rarity}` }

const EFFECT_LABELS: Record<SpecialEffect['type'], string> = {
  lifesteal: 'Lifesteal',
  poison: 'Poison',
  dodge: 'Dodge',
  block: 'Block',
  defIgnore: 'Armor ignore',
  spellAmp: 'Spell amp',
  critThreshold: 'Crit on',
  doublecast: 'Doublecast',
  attackSpeedBonus: 'Atk speed',
  regenOnKill: 'Regen on kill',
}

function fmtEffect(type: SpecialEffect['type'], value: number): string {
  if (type === 'critThreshold') return `${EFFECT_LABELS[type]} ${value}+`
  return `${EFFECT_LABELS[type]} ${Math.round(value * 100)}%`
}

function specialLine(item: Item): string {
  return (item.stats.special ?? []).map((fx) => {
    switch (fx.type) {
      case 'lifesteal':        return fmtEffect(fx.type, fx.value)
      case 'poison':           return fmtEffect(fx.type, fx.dpsMultiplier)
      case 'dodge':
      case 'block':
      case 'doublecast':       return fmtEffect(fx.type, fx.chance)
      case 'defIgnore':
      case 'spellAmp':
      case 'attackSpeedBonus':
      case 'regenOnKill':      return fmtEffect(fx.type, fx.percent)
      case 'critThreshold':    return fmtEffect(fx.type, fx.rollsAt)
      default: return ''
    }
  }).filter(Boolean).join(', ')
}

/** Build-wide saturation per effect type — flags enchants that add nothing */
const effectTotals = computed(() => (char.value ? getEffectTotals(char.value) : null))

function isSaturated(type: SpecialEffect['type']): boolean {
  const totals = effectTotals.value
  if (!totals) return false
  if (type === 'critThreshold') return totals.critAtFloor
  return totals.byType[type as CappedEffectType]?.saturated ?? false
}

interface NextInfo {
  preview: EnchantPreview
  /** Human line describing the next enchant */
  line: string
  /** True when every possible outcome is already cap-saturated for this build */
  capped: boolean
  maxed: boolean
}

function nextInfo(item: Item): NextInfo {
  const preview = previewEnchant(item)
  if (preview.kind === 'maxed') {
    return { preview, line: 'Fully enchanted', capped: false, maxed: true }
  }
  if (preview.kind === 'upgrade') {
    const line = preview.type === 'critThreshold'
      ? `Next: ${EFFECT_LABELS[preview.type]} ${preview.from}+ → ${preview.to}+`
      : `Next: ${EFFECT_LABELS[preview.type]} ${Math.round(preview.from * 100)}% → ${Math.round(preview.to * 100)}%`
    return { preview, line, capped: isSaturated(preview.type), maxed: false }
  }
  const names = preview.candidates.map((c) => {
    switch (c.type) {
      case 'lifesteal':        return fmtEffect(c.type, c.value)
      case 'poison':           return fmtEffect(c.type, c.dpsMultiplier)
      case 'dodge':
      case 'block':
      case 'doublecast':       return fmtEffect(c.type, c.chance)
      case 'critThreshold':    return fmtEffect(c.type, c.rollsAt)
      default:                 return fmtEffect(c.type, 'percent' in c ? c.percent : 0)
    }
  })
  return {
    preview,
    line: `Next adds one of: ${names.join(', ')}`,
    capped: preview.candidates.every((c) => isSaturated(c.type)),
    maxed: false,
  }
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
  } else if (result === 'maxed') {
    enchantFlash.value = 'Already fully enchanted!'
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
        Spend gold to enchant any item: it gains a new special effect scaled to its zone tier and rarity.<br>
        Once an item holds 3 effects, enchanting <b>upgrades</b> the weakest one — it never replaces or weakens what's there.<br>
        Enchanting your equipped gear is fine — the item stays equipped.
      </TutorialToast>

      <div class="gold-row">
        <span class="gold-label">Gold:</span>
        <span class="gold-val">{{ fmtNum(char?.gold ?? 0) }}g</span>
        <span v-if="enchantFlash" class="flash-msg">{{ enchantFlash }}</span>
      </div>
      <p class="enchant-hint">Add or upgrade a special effect on any owned item. Effects scale with the item's tier and rarity; cost grows each enchant.</p>
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
          <template v-for="info in [nextInfo(item)]" :key="item.id + '-next'">
            <span class="enchant-next" :class="{ maxed: info.maxed }">{{ info.line }}</span>
            <span v-if="info.capped" class="enchant-capped">⚠ capped for your build — adds nothing right now</span>
          </template>
        </div>
        <div class="enchant-item-right">
          <template v-if="nextInfo(item).maxed">
            <button class="pixel-btn enchant-btn" disabled>✦</button>
          </template>
          <template v-else>
            <span class="enchant-cost">{{ characterStore.getEnchantCost(item) }}g</span>
            <button
              class="pixel-btn btn-gold enchant-btn"
              :disabled="(char?.gold ?? 0) < characterStore.getEnchantCost(item)"
              @click="doEnchant(item)"
            >✦</button>
          </template>
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
.enchant-next          { font-size: 6px; color: #6fae6f; }
.enchant-next.maxed    { color: var(--text-dim); }
.enchant-capped        { font-size: 6px; color: #c08040; }
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
