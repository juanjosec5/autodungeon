<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'
import { UPGRADE_DEFINITIONS } from '../game/upgrades'
import type { UpgradeDef } from '../game/upgrades'
import type { UpgradeId } from '../types/index'

const characterStore = useCharacterStore()

const char = computed(() => characterStore.character)
const skillPoints = computed(() => char.value?.skillPoints ?? 0)

const OFFENSE_IDS: UpgradeId[] = ['str-up', 'dex-up', 'int-up', 'crit-chance', 'crit-damage', 'def-ignore', 'spell-amp']
const DEFENSE_IDS: UpgradeId[] = ['flat-def', 'hp-up', 'block', 'dodge', 'lifesteal']
const UTILITY_IDS: UpgradeId[] = ['atk-speed', 'regen-kill']

function defsForColumn(ids: UpgradeId[]) {
  if (!char.value) return []
  const cls = char.value.class
  return ids
    .map((id) => UPGRADE_DEFINITIONS.find((d) => d.id === id))
    .filter((d): d is UpgradeDef => !!d && (d.allowedClasses === 'any' || d.allowedClasses.includes(cls)))
}

const offenseDefs = computed(() => defsForColumn(OFFENSE_IDS))
const defenseDefs = computed(() => defsForColumn(DEFENSE_IDS))
const utilityDefs = computed(() => defsForColumn(UTILITY_IDS))

function stacksFor(id: UpgradeId): number {
  return char.value?.upgrades?.[id] ?? 0
}

function spend(id: UpgradeId) {
  characterStore.spendSkillPoint(id)
}
</script>

<template>
  <div class="pixel-panel skills-panel">
    <div class="panel-title">
      Skills
      <span v-if="skillPoints > 0" class="points-badge">{{ skillPoints }} point{{ skillPoints !== 1 ? 's' : '' }} available</span>
      <span v-else class="points-empty">0 unspent points</span>
    </div>

    <div class="columns">
      <!-- Offense -->
      <div class="col">
        <div class="col-header">Offense</div>
        <div
          v-for="def in offenseDefs"
          :key="def.id"
          class="upgrade-card"
          :class="{ maxed: stacksFor(def.id) >= def.maxPicks }"
        >
          <div class="upg-name">{{ def.name }}</div>
          <div class="upg-desc">{{ def.description }}</div>
          <div class="upg-footer">
            <span class="upg-stacks">{{ stacksFor(def.id) }}/{{ def.maxPicks }}</span>
            <button
              v-if="stacksFor(def.id) < def.maxPicks"
              class="pixel-btn upg-btn"
              :disabled="skillPoints <= 0"
              @click="spend(def.id)"
            >+ Spend</button>
            <span v-else class="upg-maxed">MAXED</span>
          </div>
        </div>
      </div>

      <!-- Defense -->
      <div class="col">
        <div class="col-header">Defense</div>
        <div
          v-for="def in defenseDefs"
          :key="def.id"
          class="upgrade-card"
          :class="{ maxed: stacksFor(def.id) >= def.maxPicks }"
        >
          <div class="upg-name">{{ def.name }}</div>
          <div class="upg-desc">{{ def.description }}</div>
          <div class="upg-footer">
            <span class="upg-stacks">{{ stacksFor(def.id) }}/{{ def.maxPicks }}</span>
            <button
              v-if="stacksFor(def.id) < def.maxPicks"
              class="pixel-btn upg-btn"
              :disabled="skillPoints <= 0"
              @click="spend(def.id)"
            >+ Spend</button>
            <span v-else class="upg-maxed">MAXED</span>
          </div>
        </div>
      </div>

      <!-- Utility -->
      <div class="col">
        <div class="col-header">Utility</div>
        <div
          v-for="def in utilityDefs"
          :key="def.id"
          class="upgrade-card"
          :class="{ maxed: stacksFor(def.id) >= def.maxPicks }"
        >
          <div class="upg-name">{{ def.name }}</div>
          <div class="upg-desc">{{ def.description }}</div>
          <div class="upg-footer">
            <span class="upg-stacks">{{ stacksFor(def.id) }}/{{ def.maxPicks }}</span>
            <button
              v-if="stacksFor(def.id) < def.maxPicks"
              class="pixel-btn upg-btn"
              :disabled="skillPoints <= 0"
              @click="spend(def.id)"
            >+ Spend</button>
            <span v-else class="upg-maxed">MAXED</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-panel { padding-bottom: 12px; }

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.points-badge {
  font-size: 7px;
  color: var(--gold);
  background: rgba(200,160,40,0.12);
  border: 1px solid var(--gold);
  padding: 2px 6px;
  border-radius: 2px;
}

.points-empty {
  font-size: 7px;
  color: var(--text-dim);
}

.columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 10px;
}

.col-header {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}

.upgrade-card {
  background: #0d0b1a;
  border: 1px solid var(--border);
  padding: 7px 8px;
  margin-bottom: 5px;
  transition: border-color 0.1s;
}

.upgrade-card:last-child { margin-bottom: 0; }

.upgrade-card.maxed {
  opacity: 0.55;
}

.upgrade-card:not(.maxed):hover {
  border-color: var(--border-hi);
}

.upg-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  color: var(--text);
  margin-bottom: 4px;
  line-height: 1.4;
}

.upg-desc {
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
  color: var(--text-dim);
  margin-bottom: 6px;
  line-height: 1.6;
}

.upg-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.upg-stacks {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  color: var(--text-dim);
}

.upg-btn {
  font-size: 5px;
  padding: 3px 6px;
}

.upg-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.upg-maxed {
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
  color: var(--gold);
  opacity: 0.7;
}

@media (max-width: 639px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
