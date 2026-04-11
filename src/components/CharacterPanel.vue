<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useZoneStore } from '../stores/zone'
import { CLASS_DEFINITIONS } from '../game/classes'
import type { ZoneId } from '../types/index'

const characterStore = useCharacterStore()
const zoneStore = useZoneStore()
const char = computed(() => characterStore.character)

const hpPercent = computed(() => {
  if (!char.value) return 0
  return Math.max(0, Math.min(100, (char.value.currentHP / char.value.maxHP) * 100))
})

const xpPercent = computed(() => {
  if (!char.value) return 0
  return Math.max(0, Math.min(100, (char.value.xp / char.value.xpToNext) * 100))
})

const ZONE_AVG_DEF: Record<ZoneId, number> = {
  forest: 4, dungeon: 7, volcano: 14, abyss: 19,
}

const combatStats = computed(() => {
  if (!char.value) return null
  const { class: classId, stats } = char.value
  const passives = CLASS_DEFINITIONS[classId].passives
  const zone = zoneStore.activeZone
  const avgDef = ZONE_AVG_DEF[zone]

  // Weapon
  const wep = characterStore.effectiveWeaponStats
  const weaponMin = wep?.minDmg ?? 1
  const weaponMax = wep?.maxDmg ?? 3
  const statBonus = classId === 'mage' ? stats.int : stats.str

  // DPS vs zone average (no crit)
  const defIgnore = passives.defIgnore ?? 0
  const effEnemyDef = Math.floor(avgDef * (1 - defIgnore))
  const minDPS = Math.max(1, weaponMin + statBonus - effEnemyDef)
  const maxDPS = Math.max(1, weaponMax + statBonus - effEnemyDef)

  // Crit chance
  let critPct: number
  if (classId === 'rogue') {
    critPct = Math.round((21 - (passives.critThreshold ?? 17)) / 20 * 100)
  } else {
    critPct = 5 // nat 20 only
  }

  // Hit chance vs zone avg
  const hitPct = Math.min(100, Math.max(5, Math.round((21 - avgDef + stats.dex) / 20 * 100)))

  // Effective player DEF
  const baseArmorDef = characterStore.effectiveArmorStats?.defBonus ?? 0
  const armorEff = passives.armorEffectiveness ?? 1.0
  const effDef = Math.floor(baseArmorDef * armorEff)

  return { minDPS, maxDPS, critPct, hitPct, effDef }
})

const collapsedStats = ref(localStorage.getItem('collapsed_combatStats') === 'true')
function toggleStats() {
  collapsedStats.value = !collapsedStats.value
  localStorage.setItem('collapsed_combatStats', String(collapsedStats.value))
}

const collapsed = ref(localStorage.getItem('collapsed_character') === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('collapsed_character', String(collapsed.value))
}
</script>

<template>
  <div v-if="char" class="pixel-panel">
    <div class="panel-title" @click="toggleCollapse">
      Player
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>
    <div v-if="!collapsed" class="inner">
      <div class="char-header">
        <div class="char-name-row">
          <span class="char-name">{{ char.name }}</span>
          <span :class="['class-badge', `class-${char.class}`]">{{ char.class.toUpperCase() }}</span>
        </div>
        <span class="char-level">LV.{{ char.level }}</span>
      </div>
      <div class="bars">
        <div class="bar-row">
          <span class="bar-lbl">HP</span>
          <div class="bar-track"><div class="bar-fill bar-hp" :style="{ width: hpPercent + '%' }"></div></div>
          <span class="bar-val">{{ char.currentHP }}/{{ char.maxHP }}</span>
        </div>
        <div class="bar-row">
          <span class="bar-lbl">XP</span>
          <div class="bar-track"><div class="bar-fill bar-xp" :style="{ width: xpPercent + '%' }"></div></div>
          <span class="bar-val">{{ char.xp }}/{{ char.xpToNext }}</span>
        </div>
      </div>
      <div class="stats-row">
        <div class="stats">
          <span class="stat">STR <b>{{ char.stats.str }}</b></span>
          <span class="stat">DEX <b>{{ char.stats.dex }}</b></span>
          <span class="stat">INT <b>{{ char.stats.int }}</b></span>
        </div>
        <span class="gold">{{ char.gold }}g</span>
      </div>

      <!-- Combat Stats subsection -->
      <div v-if="combatStats" class="combat-stats-section">
        <button class="cs-header" @click="toggleStats">
          <span class="cs-title">Combat Stats</span>
          <span class="collapse-btn cs-chevron">{{ collapsedStats ? '►' : '▾' }}</span>
        </button>
        <div v-if="!collapsedStats" class="cs-grid">
          <span class="cs-label">DPS range</span>
          <span class="cs-value">{{ combatStats.minDPS }}–{{ combatStats.maxDPS }}</span>
          <span class="cs-label">Crit chance</span>
          <span class="cs-value">{{ combatStats.critPct }}%</span>
          <span class="cs-label">Hit chance</span>
          <span class="cs-value">{{ combatStats.hitPct }}%</span>
          <span class="cs-label">Eff. DEF</span>
          <span class="cs-value">{{ combatStats.effDef }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 10px; }
.char-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 4px; }
.char-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.char-name { font-size: 11px; color: var(--text-hi); line-height: 1.6; }
.char-level { font-size: 9px; color: var(--gold); white-space: nowrap; }
.class-badge {
  font-size: 7px;
  padding: 2px 4px;
  border: 1px solid;
  line-height: 1;
}
.class-warrior { color: #e88040; border-color: #804020; background: rgba(80,30,0,0.4); }
.class-rogue   { color: #a060d8; border-color: #502880; background: rgba(40,10,60,0.4); }
.class-mage    { color: #4090e0; border-color: #204880; background: rgba(10,20,60,0.4); }
.bars { display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: flex; align-items: center; gap: 8px; }
.bar-lbl { font-size: 8px; color: var(--text); width: 18px; flex-shrink: 0; }
.bar-val { font-size: 8px; color: var(--text); width: 64px; text-align: right; flex-shrink: 0; }
.stats-row { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border); }
.stats { display: flex; gap: 12px; }
.stat { font-size: 8px; color: var(--text-dim); }
.stat b { color: var(--text); font-weight: normal; }
.gold { font-size: 8px; color: var(--gold); }

.combat-stats-section {
  border-top: 1px solid var(--border);
  padding-top: 6px;
}
.cs-header {
  width: 100%;
  background: transparent;
  border: none;
  font-family: 'Press Start 2P', monospace;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0 0 4px;
}
.cs-title { font-size: 7px; color: var(--text-dim); }
.cs-chevron { font-size: 12px; transform: translateY(-2px); }
.cs-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 10px;
  padding-top: 4px;
}
.cs-label { font-size: 7px; color: var(--text-dim); }
.cs-value { font-size: 7px; color: var(--text); text-align: right; }
</style>
