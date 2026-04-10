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

// Watch combat log for the most recent death entry
watch(
  () => combatStore.combatLog,
  (log) => {
    const latest = log[log.length - 1]
    if (latest?.type === 'death') {
      const char = characterStore.character
      if (char) {
        xpLost.value = Math.floor((char.xp + (char.xp * 0.1)) * 0.1) // approx before penalty applied
        goldLost.value = Math.floor((char.gold + (char.gold * 0.15)) * 0.15)
      }
      // Parse enemy name from log message
      const match = latest.message.match(/slain by (.+?)!/)
      slainBy.value = match ? match[1] : 'an enemy'
      xpLost.value = 0
      goldLost.value = 0
      // Re-parse directly from the message which has the values
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
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <div class="bg-gray-950 border border-red-800/60 rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full mx-4">
        <div class="text-5xl mb-4">☠️</div>
        <h2 class="text-2xl font-black text-red-400 mb-2 uppercase tracking-wide">You Died</h2>
        <p class="text-gray-400 mb-4">
          You were slain by <span class="text-red-300 font-semibold">{{ slainBy }}</span>.
        </p>
        <div class="flex justify-center gap-6 text-sm mb-6">
          <div class="flex flex-col items-center">
            <span class="text-red-500 font-bold text-lg">-{{ xpLost }} XP</span>
            <span class="text-gray-600 text-xs">experience lost</span>
          </div>
          <div class="w-px bg-gray-800" />
          <div class="flex flex-col items-center">
            <span class="text-yellow-600 font-bold text-lg">-{{ goldLost }}g</span>
            <span class="text-gray-600 text-xs">gold lost</span>
          </div>
        </div>
        <p class="text-gray-600 text-xs">Respawning...</p>
      </div>
    </div>
  </Transition>
</template>
