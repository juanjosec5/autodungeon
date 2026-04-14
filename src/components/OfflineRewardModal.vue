<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useCombatStore } from '../stores/combat'

const characterStore = useCharacterStore()
const combatStore = useCombatStore()

const result = computed(() => characterStore.pendingOfflineResult)

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function collectRewards(): void {
  characterStore.pendingOfflineResult = null
  combatStore.startCombat()
}

const RARITY_COLORS: Record<string, string> = {
  common:    '#b0a8c8',
  uncommon:  '#60c060',
  rare:      '#4080d0',
  epic:      '#9050e0',
  legendary: '#e0b84e',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="offline">
      <div v-if="result" class="modal-overlay">
        <div class="modal pixel-panel">
          <div class="modal-icon">⏳</div>
          <div class="modal-title">WELCOME BACK</div>
          <p class="modal-sub">You were gone for <span class="hi">{{ formatDuration(result.durationMs) }}</span></p>

          <div class="rewards-grid">
            <div class="reward-row">
              <span class="reward-lbl">Kills</span>
              <span class="reward-val">{{ result.kills.toLocaleString() }}</span>
            </div>
            <div class="reward-row">
              <span class="reward-lbl">Gold</span>
              <span class="reward-val gold">+{{ result.goldEarned.toLocaleString() }}g</span>
            </div>
            <div class="reward-row">
              <span class="reward-lbl">XP</span>
              <span class="reward-val xp">+{{ result.xpEarned.toLocaleString() }}</span>
            </div>
          </div>

          <div v-if="result.itemsFound.length > 0" class="items-section">
            <div class="items-label">Items Found</div>
            <div
              v-for="item in result.itemsFound"
              :key="item.id"
              class="item-row"
              :style="{ color: RARITY_COLORS[item.rarity] }"
            >
              {{ item.name }}
              <span class="item-rarity">({{ item.rarity }})</span>
            </div>
          </div>

          <button class="pixel-btn collect-btn" @click="collectRewards">
            COLLECT REWARDS
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 55;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.8);
}
.modal {
  padding: 28px 32px;
  text-align: center;
  max-width: 340px;
  width: calc(100% - 32px);
  border-color: #3a4878;
}
.modal-icon { font-size: 32px; margin-bottom: 12px; display: block; }
.modal-title { font-size: 14px; color: var(--text-hi); margin-bottom: 8px; letter-spacing: 2px; }
.modal-sub { font-size: 8px; color: var(--text-dim); margin-bottom: 20px; line-height: 1.8; }
.hi { color: var(--gold); }

.rewards-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  border: 1px solid var(--border);
  padding: 12px 16px;
}
.reward-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.reward-lbl { font-size: 7px; color: var(--text-dim); }
.reward-val { font-size: 10px; color: var(--text-hi); }
.reward-val.gold { color: var(--gold); }
.reward-val.xp   { color: #60c0ff; }

.items-section {
  margin-bottom: 16px;
  text-align: left;
}
.items-label {
  font-size: 7px;
  color: var(--text-dim);
  margin-bottom: 8px;
  text-transform: uppercase;
}
.item-row {
  font-size: 8px;
  line-height: 2;
}
.item-rarity {
  color: var(--text-dim);
  font-size: 7px;
  margin-left: 4px;
}

.collect-btn {
  width: 100%;
  padding: 10px;
  font-size: 9px;
  background: #1a2848;
  border-color: var(--border-hi);
  color: var(--text-hi);
}
.collect-btn:hover { background: #222f58; }

/* transition */
.offline-enter-active { transition: opacity 0.25s, transform 0.25s; }
.offline-leave-active { transition: opacity 0.2s, transform 0.2s; }
.offline-enter-from, .offline-leave-to { opacity: 0; transform: scale(0.95); }
</style>
