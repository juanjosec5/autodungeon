<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ClassId } from '../types/index'
import { useCharacterStore } from '../stores/character'
import { useSaveStore } from '../stores/save'
import { useAuthStore } from '../stores/auth'
import { getStatsAtLevel } from '../game/classes'
import AuthModal from './AuthModal.vue'

const router = useRouter()
const characterStore = useCharacterStore()
const saveStore = useSaveStore()
const authStore = useAuthStore()

// ── Auth modal ────────────────────────────────────────────────────────────────

const showAuthModal = ref(false)
const supabaseAvailable = computed(() => {
  const url = import.meta.env.VITE_SUPABASE_URL
  return typeof url === 'string' && url.length > 0
})

// ── Saved character check ────────────────────────────────────────────────────

const hasSaved = ref(false)
const savedName = ref('')
const checkingLoad = ref(true)

saveStore.loadCharacter().then((found) => {
  if (found && characterStore.character) {
    hasSaved.value = true
    savedName.value = characterStore.character.name
  }
  checkingLoad.value = false
})

function continueAdventure() {
  router.push('/game')
}

// ── Class definitions for the UI ─────────────────────────────────────────────

interface ClassCard {
  id: ClassId
  label: string
  flavor: string
  passive: string
}

const CLASS_CARDS: ClassCard[] = [
  {
    id: 'warrior',
    label: 'Warrior',
    flavor: 'A battle-hardened fighter who excels in close combat and endures punishment.',
    passive: '+10% armor effectiveness · 40% regen on kill · Crit on natural 20',
  },
  {
    id: 'rogue',
    label: 'Rogue',
    flavor: 'A swift assassin who strikes fast and crits often.',
    passive: 'Crit on roll ≥ 17 or DEX ≥ 12 · 30% regen on kill',
  },
  {
    id: 'mage',
    label: 'Mage',
    flavor: 'A wielder of arcane power who ignores enemy defenses.',
    passive: 'Ignore 20% enemy DEF · 30% regen on kill · Crit on natural 20',
  },
]

// ── Form state ────────────────────────────────────────────────────────────────

const name = ref('')
const selectedClass = ref<ClassId | null>(null)

const canBegin = computed(() => name.value.trim().length > 0 && selectedClass.value !== null)

function selectClass(id: ClassId) {
  selectedClass.value = id
}

function getBaseStats(id: ClassId) {
  return getStatsAtLevel(id, 1)
}

function begin() {
  if (!canBegin.value || !selectedClass.value) return
  characterStore.createCharacter(name.value.trim(), selectedClass.value)
  router.push('/game')
}

async function signOut() {
  await authStore.signOut()
  hasSaved.value = false
  savedName.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-12" style="font-size: 10px">

    <!-- Auth bar -->
    <div class="w-full max-w-lg mb-4 flex justify-end items-center gap-3 text-xs">
      <template v-if="!authStore.isGuest">
        <span class="text-gray-500">{{ authStore.session?.user.email }}</span>
        <button @click="signOut" class="text-gray-500 hover:text-gray-300 transition-colors">Sign out</button>
      </template>
      <button
        v-else-if="supabaseAvailable"
        @click="showAuthModal = true"
        class="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
      >
        Sign in to sync saves
      </button>
    </div>

    <!-- Title -->
    <h1 class="text-2xl sm:text-4xl font-black tracking-wide sm:tracking-widest text-amber-400 mb-2 uppercase text-center">
      Autodungeon
    </h1>
    <p class="text-gray-500 text-xs sm:text-sm tracking-wider mb-6 sm:mb-10">An idle fantasy adventure</p>

    <!-- Continue banner -->
    <div v-if="!checkingLoad && hasSaved" class="mb-5 sm:mb-8 w-full max-w-lg">
      <div class="bg-amber-900/30 border border-amber-700/50 rounded-xl p-5 flex items-center justify-between gap-4">
        <div>
          <p class="text-amber-300 font-semibold">Continue as {{ savedName }}</p>
          <p class="text-gray-400 text-xs mt-0.5">
            {{ authStore.isGuest ? 'Saved in this browser' : 'Cloud save' }}
          </p>
        </div>
        <button
          @click="continueAdventure"
          class="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-5 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
        >
          Continue ▶
        </button>
      </div>
    </div>

    <!-- Creation card -->
    <div class="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-8 shadow-2xl">
      <h2 class="text-sm sm:text-lg font-semibold text-gray-200 mb-4 sm:mb-6">Create a new character</h2>

      <!-- Name input -->
      <div class="mb-4 sm:mb-6">
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Name
        </label>
        <input
          v-model="name"
          type="text"
          maxlength="20"
          placeholder="Enter your name..."
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      <!-- Class selector -->
      <div class="mb-5 sm:mb-8">
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Class
        </label>
        <div class="flex flex-col gap-3">
          <button
            v-for="card in CLASS_CARDS"
            :key="card.id"
            @click="selectClass(card.id)"
            :class="[
              'text-left rounded-xl border p-3 sm:p-4 transition-all',
              selectedClass === card.id
                ? 'border-amber-500 bg-amber-900/20 ring-1 ring-amber-500/40'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600',
            ]"
          >
            <div class="flex items-start justify-between gap-2 sm:gap-4">
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-100">{{ card.label }}</p>
                <p class="text-gray-400 text-xs mt-1">{{ card.flavor }}</p>
                <p class="text-amber-600/80 text-xs mt-2 italic">{{ card.passive }}</p>
              </div>
              <div class="shrink-0 text-right">
                <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-400">
                  <span class="text-gray-500">HP</span>
                  <span class="text-gray-200 font-mono">{{ getBaseStats(card.id).maxHP }}</span>
                  <span class="text-gray-500">STR</span>
                  <span class="text-gray-200 font-mono">{{ getBaseStats(card.id).str }}</span>
                  <span class="text-gray-500">DEX</span>
                  <span class="text-gray-200 font-mono">{{ getBaseStats(card.id).dex }}</span>
                  <span class="text-gray-500">INT</span>
                  <span class="text-gray-200 font-mono">{{ getBaseStats(card.id).int }}</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Submit -->
      <button
        @click="begin"
        :disabled="!canBegin"
        :class="[
          'w-full py-3 rounded-xl font-bold text-base transition-all',
          canBegin
            ? 'bg-amber-500 hover:bg-amber-400 text-gray-950 cursor-pointer'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed',
        ]"
      >
        Begin Adventure
      </button>
    </div>
  </div>

  <!-- Auth modal -->
  <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />
</template>
