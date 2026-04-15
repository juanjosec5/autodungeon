<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePrestigeStore } from '../stores/prestige'
import { useCharacterStore } from '../stores/character'
import { useSaveStore } from '../stores/save'
import { useCombatStore } from '../stores/combat'
import { useZoneStore } from '../stores/zone'
import { CLASS_ASCENSION_BONUS } from '../stores/prestige'
import type { PrestigeBonusId, ClassId } from '../types/index'

const prestigeStore = usePrestigeStore()
const characterStore = useCharacterStore()
const saveStore = useSaveStore()
const combatStore = useCombatStore()
const zoneStore = useZoneStore()

const confirming = ref(false)

const CLASS_ORDER: ClassId[] = ['warrior', 'rogue', 'mage', 'priest', 'undead', 'dragonkin']
const CLASS_ICONS: Record<ClassId, string> = {
  warrior: '⚔', rogue: '🗡', mage: '🔮', priest: '✝', undead: '💀', dragonkin: '🐉',
}

function ascStacks(classId: ClassId): number {
  const bonusId = CLASS_ASCENSION_BONUS[classId].id
  return prestigeStore.ascensionBonuses[bonusId] ?? 0
}

const char = computed(() => characterStore.character)
const canPrestige = computed(() => (char.value?.level ?? 0) >= 50)
const tokensOnNextPrestige = computed(() => Math.floor((char.value?.level ?? 0) / 10))

const BONUS_ORDER: PrestigeBonusId[] = [
  'xpBoost', 'goldBoost', 'offlineEfficiency', 'startingLevel', 'hpBonus', 'dropRateBonus',
]

function stacks(id: PrestigeBonusId): number {
  return prestigeStore.bonuses[id] ?? 0
}

function canBuy(id: PrestigeBonusId): boolean {
  const def = prestigeStore.BONUS_DEFS[id]
  return stacks(id) < def.maxStacks && prestigeStore.ascensionTokens >= def.cost
}

function isMaxed(id: PrestigeBonusId): boolean {
  return stacks(id) >= prestigeStore.BONUS_DEFS[id].maxStacks
}

function buyBonus(id: PrestigeBonusId): void {
  prestigeStore.buyBonus(id)
}

function doPrestige(): void {
  combatStore.stopCombat()
  combatStore.setSpeed(1)
  zoneStore.resetToForest()
  prestigeStore.prestige()
  saveStore.saveCharacter()
  confirming.value = false
  combatStore.startCombat()
}
</script>

<template>
  <div class="pixel-panel prestige-panel">
    <div class="panel-title">⚡ ASCENSION</div>
    <div class="inner">

      <!-- Stats bar -->
      <div class="stats-row">
        <div class="stat-block">
          <span class="stat-val">{{ prestigeStore.prestigeCount }}</span>
          <span class="stat-lbl">Prestiges</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-block">
          <span class="stat-val gold">{{ prestigeStore.ascensionTokens }}</span>
          <span class="stat-lbl">Tokens</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-block">
          <span class="stat-val dim">{{ prestigeStore.totalTokensEarned }}</span>
          <span class="stat-lbl">Total Earned</span>
        </div>
      </div>

      <!-- Bonus shop -->
      <div class="section-label">Ascension Bonuses</div>
      <div class="bonus-grid">
        <div
          v-for="id in BONUS_ORDER"
          :key="id"
          class="bonus-card pixel-panel"
          :class="{ maxed: isMaxed(id) }"
        >
          <div class="bonus-icon">{{ prestigeStore.BONUS_DEFS[id].icon }}</div>
          <div class="bonus-name">{{ prestigeStore.BONUS_DEFS[id].label }}</div>
          <div class="bonus-effect">{{ prestigeStore.BONUS_DEFS[id].effect }}</div>
          <div class="bonus-stacks">
            <span class="stacks-val">{{ stacks(id) }}/{{ prestigeStore.BONUS_DEFS[id].maxStacks }}</span>
          </div>
          <button
            class="pixel-btn buy-btn"
            :disabled="!canBuy(id)"
            :class="{ maxed: isMaxed(id) }"
            @click="buyBonus(id)"
          >
            <template v-if="isMaxed(id)">MAX</template>
            <template v-else>{{ prestigeStore.BONUS_DEFS[id].cost }} ⚡</template>
          </button>
        </div>
      </div>

      <!-- Class Mastery -->
      <div class="section-label">Class Mastery</div>
      <div class="mastery-list">
        <div
          v-for="cls in CLASS_ORDER"
          :key="cls"
          class="mastery-row"
          :class="{ 'mastery-active': char?.class === cls }"
        >
          <span class="mastery-icon">{{ CLASS_ICONS[cls] }}</span>
          <div class="mastery-info">
            <div class="mastery-name">{{ CLASS_ASCENSION_BONUS[cls].label }}</div>
            <div class="mastery-desc">{{ CLASS_ASCENSION_BONUS[cls].description }}</div>
          </div>
          <div class="mastery-progress">
            <div class="mastery-pips">
              <span
                v-for="i in CLASS_ASCENSION_BONUS[cls].maxStacks"
                :key="i"
                class="mastery-pip"
                :class="{ filled: i <= ascStacks(cls) }"
              />
            </div>
            <span class="mastery-count">{{ ascStacks(cls) }}/{{ CLASS_ASCENSION_BONUS[cls].maxStacks }}</span>
          </div>
        </div>
      </div>

      <!-- Prestige button -->
      <div class="prestige-section">
        <div v-if="canPrestige" class="prestige-preview">
          Next prestige: <span class="gold">+{{ tokensOnNextPrestige }} tokens</span>
          (level {{ char?.level }})
        </div>
        <div v-else class="prestige-locked">
          Reach level 50 to unlock Ascension
        </div>

        <template v-if="!confirming">
          <button
            class="pixel-btn prestige-btn"
            :disabled="!canPrestige"
            @click="confirming = true"
          >
            ⚡ PRESTIGE
          </button>
        </template>
        <template v-else>
          <div class="confirm-msg">Reset character? Lifetime stats and items codex are preserved.</div>
          <div class="confirm-btns">
            <button class="pixel-btn confirm-yes" @click="doPrestige">Confirm</button>
            <button class="pixel-btn confirm-no" @click="confirming = false">Cancel</button>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<style scoped>
.prestige-panel { height: 100%; display: flex; flex-direction: column; }
.inner { flex: 1; overflow-y: auto; padding: 8px 4px; display: flex; flex-direction: column; gap: 12px; }

/* Stats row */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
}
.stat-block { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-val { font-size: 14px; color: var(--text-hi); }
.stat-val.gold { color: var(--gold); }
.stat-val.dim { color: var(--text-dim); }
.stat-lbl { font-size: 6px; color: var(--text-dim); text-transform: uppercase; }
.stat-divider { width: 1px; height: 28px; background: var(--border); }

/* Section label */
.section-label {
  font-size: 7px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Bonus grid */
.bonus-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.bonus-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 8px;
  text-align: center;
  transition: border-color 0.15s;
}
.bonus-card.maxed { border-color: var(--gold); opacity: 0.7; }
.bonus-icon { font-size: 16px; }
.bonus-name { font-size: 7px; color: var(--text-hi); }
.bonus-effect { font-size: 6px; color: var(--text-dim); line-height: 1.6; }
.bonus-stacks { font-size: 8px; color: var(--text-dim); }
.stacks-val { color: var(--text-hi); }

.buy-btn {
  font-size: 7px;
  padding: 5px 10px;
  background: #1a1830;
  border-color: var(--border-hi);
  width: 100%;
}
.buy-btn:disabled { opacity: 0.4; cursor: default; box-shadow: none; top: 0; left: 0; }
.buy-btn.maxed { border-color: var(--gold); color: var(--gold); }

/* Class Mastery */
.mastery-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mastery-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  background: #0d0b1a;
  border: 1px solid var(--border);
}

.mastery-row.mastery-active {
  border-color: var(--gold);
  background: rgba(200,160,40,0.06);
}

.mastery-icon { font-size: 12px; flex-shrink: 0; }

.mastery-info { flex: 1; min-width: 0; }

.mastery-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  color: var(--text-hi);
  margin-bottom: 3px;
}

.mastery-desc {
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
  color: var(--text-dim);
  line-height: 1.6;
}

.mastery-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}

.mastery-pips {
  display: flex;
  gap: 3px;
}

.mastery-pip {
  width: 7px;
  height: 7px;
  border: 1px solid var(--border);
  background: #1a1830;
}

.mastery-pip.filled {
  background: var(--gold);
  border-color: var(--gold);
}

.mastery-count {
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
  color: var(--text-dim);
}

/* Prestige section */
.prestige-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  text-align: center;
}
.prestige-preview { font-size: 8px; color: var(--text-dim); }
.prestige-locked { font-size: 7px; color: var(--text-dim); font-style: italic; }

.prestige-btn {
  font-size: 9px;
  padding: 10px;
  background: #1a1230;
  border-color: #7060c0;
  color: var(--text-hi);
  width: 100%;
}
.prestige-btn:disabled { opacity: 0.35; cursor: default; box-shadow: none; top: 0; left: 0; }
.prestige-btn:not(:disabled):hover { background: #221840; }

.confirm-msg { font-size: 7px; color: #f0a040; line-height: 1.8; }
.confirm-btns { display: flex; gap: 8px; }
.confirm-yes {
  flex: 1; font-size: 8px; padding: 8px;
  background: #2a1010; border-color: var(--red); color: var(--red);
}
.confirm-no {
  flex: 1; font-size: 8px; padding: 8px;
  background: #1a1830; border-color: var(--border-hi);
}

.gold { color: var(--gold); }

@media (max-width: 639px) {
  .bonus-grid { grid-template-columns: 1fr; }
}
</style>
