<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCombatStore } from '../stores/combat'
import { useCharacterStore } from '../stores/character'

const combatStore = useCombatStore()
const characterStore = useCharacterStore()

const visible = ref(false)
const slainBy = ref('')
const xpLost = ref(0)
const goldLost = ref(0)

watch(
  () => combatStore.combatLog,
  (log) => {
    const latest = log[log.length - 1]
    if (latest?.type === 'death') {
      const char = characterStore.character
      if (char) {
        xpLost.value = Math.floor((char.xp + (char.xp * 0.1)) * 0.1)
        goldLost.value = Math.floor((char.gold + (char.gold * 0.15)) * 0.15)
      }
      const match = latest.message.match(/slain by (.+?)!/)
      slainBy.value = match ? match[1] : 'an enemy'
      xpLost.value = 0
      goldLost.value = 0
      const xpMatch = latest.message.match(/Lost (\d+)xp/)
      const goldMatch = latest.message.match(/and (\d+)g/)
      if (xpMatch) xpLost.value = parseInt(xpMatch[1])
      if (goldMatch) goldLost.value = parseInt(goldMatch[1])

      visible.value = true
      setTimeout(() => { visible.value = false }, 3000)
    }
  },
  { deep: true },
)
</script>

<template>
  <Transition name="death">
    <div v-if="visible" class="modal-overlay">
      <div class="modal pixel-panel">
        <div class="skull">☠</div>
        <div class="modal-title">YOU DIED</div>
        <p class="modal-msg">Slain by <span class="slain-by">{{ slainBy }}</span></p>
        <div class="losses">
          <div class="loss-item">
            <span class="loss-val loss-xp">-{{ xpLost }} XP</span>
            <span class="loss-lbl">experience</span>
          </div>
          <div class="loss-divider"></div>
          <div class="loss-item">
            <span class="loss-val loss-gold">-{{ goldLost }}g</span>
            <span class="loss-lbl">gold</span>
          </div>
        </div>
        <p class="respawn">Respawning...</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.75);
}
.modal {
  padding: 28px 32px;
  text-align: center;
  max-width: 320px;
  width: calc(100% - 32px);
  border-color: #6a1818;
}
.skull { font-size: 36px; margin-bottom: 12px; display: block; }
.modal-title { font-size: 18px; color: var(--red); margin-bottom: 10px; letter-spacing: 2px; }
.modal-msg { font-size: 9px; color: var(--text-dim); margin-bottom: 16px; line-height: 1.8; }
.slain-by { color: #f08888; }
.losses { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px; }
.loss-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.loss-val { font-size: 13px; }
.loss-lbl { font-size: 7px; color: var(--text-dim); }
.loss-xp   { color: var(--red); }
.loss-gold { color: var(--gold); }
.loss-divider { width: 1px; height: 32px; background: var(--border); }
.respawn { font-size: 8px; color: var(--text-dim); }
/* transition */
.death-enter-active { transition: opacity 0.2s, transform 0.2s; }
.death-leave-active { transition: opacity 0.3s, transform 0.3s; }
.death-enter-from, .death-leave-to { opacity: 0; transform: scale(0.95); }
</style>
