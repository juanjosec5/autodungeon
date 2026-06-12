<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePrestigeStore, costAt, MASTERY_RESPEC_COST } from '../stores/prestige'
import { useCharacterStore } from '../stores/character'
import { useSaveStore } from '../stores/save'
import { useCombatStore } from '../stores/combat'
import { useZoneStore } from '../stores/zone'
import { CLASS_ASCENSION_BONUS } from '../stores/prestige'
import { TIER_HP_GROWTH, TIER_ATK_GROWTH } from '../game/enemies'
import { NG_TIER_PLAYER_POWER } from '../game/combat-core'
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

function canAllocate(classId: ClassId): boolean {
  return prestigeStore.masteryPoints > 0 && ascStacks(classId) < CLASS_ASCENSION_BONUS[classId].maxStacks
}

function allocate(classId: ClassId): void {
  prestigeStore.allocateMastery(CLASS_ASCENSION_BONUS[classId].id)
}

const totalMasteryStacks = computed(() =>
  CLASS_ORDER.reduce((sum, cls) => sum + ascStacks(cls), 0),
)
const canRespec = computed(() =>
  totalMasteryStacks.value > 0 && prestigeStore.ascensionTokens >= MASTERY_RESPEC_COST,
)

const char = computed(() => characterStore.character)
const canPrestige = computed(() => (char.value?.level ?? 0) >= 50)
const tokensOnNextPrestige = computed(() => prestigeStore.tokensForPrestige(char.value?.level ?? 0))

const nextTierHpMult = computed(() => Math.pow(TIER_HP_GROWTH, prestigeStore.difficultyTier + 1).toFixed(2))
const nextTierAtkMult = computed(() => Math.pow(TIER_ATK_GROWTH, prestigeStore.difficultyTier + 1).toFixed(2))

const BONUS_ORDER: PrestigeBonusId[] = [
  'xpBoost', 'goldBoost', 'offlineEfficiency', 'startingLevel', 'hpBonus', 'dropRateBonus',
  'transcend', 'lootMastery',
]

function stacks(id: PrestigeBonusId): number {
  return prestigeStore.bonuses[id] ?? 0
}

function nextCost(id: PrestigeBonusId): number {
  return costAt(prestigeStore.BONUS_DEFS[id], stacks(id))
}

function canBuy(id: PrestigeBonusId): boolean {
  return stacks(id) < prestigeStore.BONUS_DEFS[id].maxStacks
    && prestigeStore.ascensionTokens >= nextCost(id)
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
        <div class="stat-divider"></div>
        <div class="stat-block">
          <span class="stat-val tier">{{ prestigeStore.difficultyTier }}</span>
          <span class="stat-lbl">NG+ Tier</span>
        </div>
      </div>

      <div v-if="prestigeStore.difficultyTier > 0" class="tier-note">
        Enemies: ×{{ Math.pow(TIER_HP_GROWTH, prestigeStore.difficultyTier).toFixed(2) }} HP,
        ×{{ Math.pow(TIER_ATK_GROWTH, prestigeStore.difficultyTier).toFixed(2) }} ATK
        — rewards scale to match.
        Attunement: +{{ Math.round(prestigeStore.difficultyTier * NG_TIER_PLAYER_POWER * 100) }}%
        damage &amp; max HP
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
            <template v-else>{{ nextCost(id) }} ⚡</template>
          </button>
        </div>
      </div>

      <!-- Class Mastery -->
      <div class="section-label">
        Class Mastery
        <span v-if="prestigeStore.masteryPoints > 0" class="mastery-points">
          {{ prestigeStore.masteryPoints }} point{{ prestigeStore.masteryPoints > 1 ? 's' : '' }} to spend
        </span>
      </div>
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
          <button
            v-if="prestigeStore.masteryPoints > 0"
            class="pixel-btn mastery-btn"
            :disabled="!canAllocate(cls)"
            @click="allocate(cls)"
          >+</button>
        </div>
        <button
          v-if="totalMasteryStacks > 0"
          class="pixel-btn respec-btn"
          :disabled="!canRespec"
          @click="prestigeStore.respecMastery()"
        >
          Respec all mastery ({{ MASTERY_RESPEC_COST }} ⚡)
        </button>
      </div>

      <!-- Prestige button -->
      <div class="prestige-section">
        <div v-if="canPrestige" class="prestige-preview">
          Next prestige: <span class="gold">+{{ tokensOnNextPrestige }} tokens</span>
          (level {{ char?.level }}) · NG+{{ prestigeStore.difficultyTier + 1 }}:
          enemies ×{{ nextTierHpMult }} HP / ×{{ nextTierAtkMult }} ATK ·
          you +{{ Math.round((prestigeStore.difficultyTier + 1) * NG_TIER_PLAYER_POWER * 100) }}%
          damage &amp; HP
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
.inner { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 8px 4px; display: flex; flex-direction: column; gap: 12px; }

/* Stats row */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
}
.stat-block { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-val { font-size: 14px; color: var(--text-hi); }
.stat-val.gold { color: var(--gold); }
.stat-val.dim { color: var(--text-dim); }
.stat-val.tier { color: #c060ff; }

.tier-note {
  font-size: 6px;
  color: var(--text-dim);
  text-align: center;
  line-height: 1.6;
  padding: 4px;
  border: 1px dashed var(--border);
}

.mastery-points { color: var(--gold); margin-left: 6px; }

.mastery-btn {
  font-size: 9px;
  padding: 4px 8px;
  background: #1a2818;
  border-color: #50a040;
  color: #80e060;
  flex-shrink: 0;
}
.mastery-btn:disabled { opacity: 0.3; cursor: default; box-shadow: none; top: 0; left: 0; }

.respec-btn {
  font-size: 7px;
  padding: 6px;
  background: #281818;
  border-color: #a05040;
  color: #e08060;
}
.respec-btn:disabled { opacity: 0.4; cursor: default; box-shadow: none; top: 0; left: 0; }
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
