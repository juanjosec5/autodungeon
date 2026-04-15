<script setup lang="ts">
import { useProgressionStore } from '../stores/progression'

const props = defineProps<{
  onConfirm: (panelId: import('../types/index').PanelId) => void
}>()

const progressionStore = useProgressionStore()

function handleGotIt(): void {
  const unlock = progressionStore.pendingUnlockModal
  if (!unlock) return
  progressionStore.markUnlockSeen(unlock.panelId)
  props.onConfirm(unlock.panelId)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="unlock">
      <div v-if="progressionStore.pendingUnlockModal" class="unlock-overlay">
        <div class="unlock-modal pixel-panel">
          <div class="unlock-icon">⚔</div>
          <div class="unlock-title">{{ progressionStore.pendingUnlockModal.title }}</div>
          <p class="unlock-desc">{{ progressionStore.pendingUnlockModal.description }}</p>
          <button class="pixel-btn unlock-btn" @click="handleGotIt">Got it</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.unlock-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.78);
}

.unlock-modal {
  padding: 28px 24px 24px;
  max-width: 380px;
  width: calc(100% - 32px);
  text-align: center;
  border-color: #a07820;
}

.unlock-icon {
  font-size: 28px;
  margin-bottom: 12px;
  display: block;
}

.unlock-title {
  font-size: 13px;
  color: var(--gold);
  letter-spacing: 1px;
  margin-bottom: 14px;
  line-height: 1.5;
}

.unlock-desc {
  font-size: 8px;
  color: var(--text-dim);
  line-height: 1.8;
  margin-bottom: 20px;
}

.unlock-btn {
  font-size: 8px;
  padding: 6px 20px;
  border-color: var(--gold);
  color: var(--gold);
}

.unlock-btn:hover {
  background: rgba(200, 160, 40, 0.12);
}

.unlock-enter-active { transition: opacity 0.18s, transform 0.18s; }
.unlock-leave-active { transition: opacity 0.18s, transform 0.18s; }
.unlock-enter-from, .unlock-leave-to { opacity: 0; transform: scale(0.96); }
</style>
