<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ClassId, Character } from '../types/index'
import { useCharacterStore } from '../stores/character'
import { useSaveStore } from '../stores/save'
import { useCombatStore } from '../stores/combat'
import { useZoneStore } from '../stores/zone'
import { getStatsAtLevel } from '../game/classes'
import { buildClassSpriteStyle } from '../game/class-sprites'

const router = useRouter()
const characterStore = useCharacterStore()
const saveStore = useSaveStore()
const combatStore = useCombatStore()
const zoneStore = useZoneStore()

onMounted(() => {
  combatStore.stopCombat()
  combatStore.setSpeed(1)
  zoneStore.resetToForest()
  // Clear any in-memory character so slots are always loaded fresh from storage
  characterStore.character = null
  refreshSaves()
})

// ── Save slots ────────────────────────────────────────────────────────────────

const saves = ref<Character[]>([])
const checkingLoad = ref(true)

function refreshSaves() {
  saves.value = saveStore.loadAllSaves()
  checkingLoad.value = false
  // If no saves exist, open the creation form immediately
  if (saves.value.length === 0) creatingNew.value = true
}

async function continueAdventure(id: string) {
  await saveStore.loadCharacterById(id)
  router.push('/game')
}

const deletingId = ref<string | null>(null)

function confirmDelete(id: string) {
  deletingId.value = id
}

function doDelete(id: string) {
  saveStore.deleteCharacter(id)
  deletingId.value = null
  refreshSaves()
}

function formatLastSaved(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'just now'
  if (hours < 1)  return `${mins}m ago`
  if (days < 1)   return `${hours}h ago`
  return `${days}d ago`
}

function getSpriteStyle(id: ClassId): string {
  return buildClassSpriteStyle(id)
}

// ── Class definitions ─────────────────────────────────────────────────────────

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
    passive: 'Ignore 15% enemy DEF · 30% regen on kill · Crit on natural 20',
  },
  {
    id: 'priest',
    label: 'Priest',
    flavor: 'A divine caster who heals after nearly every kill. Built for long grinds.',
    passive: '70% regen on kill (+40% heal power) · Crit on natural 20',
  },
  {
    id: 'undead',
    label: 'Undead',
    flavor: 'A vampiric berserker with the highest STR ceiling. Sustains through lifesteal.',
    passive: '10% innate lifesteal · Crit on roll ≥ 18 · No natural regen',
  },
  {
    id: 'dragonkin',
    label: 'Dragonkin',
    flavor: 'A scale-armored brute. The hardest class to kill. Slow but relentless.',
    passive: '+25% armor effectiveness · 30% regen on kill · Crit on roll ≥ 19',
  },
]

// ── New character form ────────────────────────────────────────────────────────

const creatingNew = ref(false)
const name = ref('')
const selectedClass = ref<ClassId | null>(null)

const canBegin = computed(() => name.value.trim().length > 0 && selectedClass.value !== null)

function openCreationForm() {
  name.value = ''
  selectedClass.value = null
  creatingNew.value = true
}

function cancelCreation() {
  creatingNew.value = false
}

function selectClass(id: ClassId) {
  selectedClass.value = id
}

function getBaseStats(id: ClassId) {
  return getStatsAtLevel(id, 1)
}

async function begin() {
  if (!canBegin.value || !selectedClass.value) return
  characterStore.createCharacter(name.value.trim(), selectedClass.value)
  await saveStore.saveCharacter()
  router.push('/game')
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-12" style="font-size: 10px">

    <!-- Title -->
    <h1 class="text-2xl sm:text-4xl font-black tracking-wide sm:tracking-widest text-amber-400 mb-2 uppercase text-center">
      Autodungeon
    </h1>
    <p class="text-gray-500 text-xs sm:text-sm tracking-wider mb-6 sm:mb-10">An idle fantasy adventure</p>

    <div class="w-full max-w-lg flex flex-col gap-4">

      <!-- Save slots -->
      <template v-if="!checkingLoad">
        <div v-if="saves.length > 0" class="flex flex-col gap-2">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Your Adventures</p>

          <!-- Slot card -->
          <div
            v-for="save in saves"
            :key="save.id"
            class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
          >
            <!-- Class sprite -->
            <div class="save-sprite-wrap shrink-0">
              <div class="save-sprite-px" :style="{ boxShadow: getSpriteStyle(save.class) }"></div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-100 truncate">{{ save.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ save.class.toUpperCase() }} · LV.{{ save.level }}
              </p>
              <p class="text-xs text-gray-600 mt-0.5">{{ formatLastSaved(save.lastSaved) }}</p>
            </div>

            <!-- Actions: normal state -->
            <template v-if="deletingId !== save.id">
              <button
                @click="continueAdventure(save.id)"
                class="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-4 py-2 rounded-lg transition-colors text-xs whitespace-nowrap"
              >
                Continue ▶
              </button>
              <button
                @click="confirmDelete(save.id)"
                class="text-gray-600 hover:text-red-400 transition-colors text-sm px-1"
                title="Delete save"
              >🗑</button>
            </template>

            <!-- Actions: delete confirm -->
            <template v-else>
              <span class="text-xs text-red-400 whitespace-nowrap">Delete?</span>
              <button
                @click="doDelete(save.id)"
                class="bg-red-700 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors text-xs"
              >Yes</button>
              <button
                @click="deletingId = null"
                class="text-gray-500 hover:text-gray-300 text-xs px-2"
              >No</button>
            </template>
          </div>
        </div>

        <!-- New Character button / creation form -->
        <template v-if="!creatingNew">
          <div class="flex flex-col items-center gap-2">
            <button
              @click="openCreationForm"
              class="w-full border-2 border-dashed border-gray-700 hover:border-amber-600 text-gray-500 hover:text-amber-400 rounded-xl py-4 text-sm font-semibold transition-colors"
            >
              ＋ New Character
            </button>
            <button
              @click="router.push('/wiki')"
              class="text-amber-500/60 hover:text-amber-400 transition-colors text-xs"
            >
              📖 Wiki &amp; Changelog
            </button>
          </div>
        </template>

        <!-- Creation form (inline) -->
        <div v-else class="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-8 shadow-2xl">
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <h2 class="text-sm sm:text-lg font-semibold text-gray-200">Create a new character</h2>
            <button
              v-if="saves.length > 0"
              @click="cancelCreation"
              class="text-gray-600 hover:text-gray-400 text-xs transition-colors"
            >✕ Cancel</button>
          </div>

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
                <div class="flex items-start gap-3 sm:gap-4">
                  <div class="class-sprite-wrap">
                    <div class="class-sprite-px" :style="{ boxShadow: getSpriteStyle(card.id) }"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-100">{{ card.label }}</p>
                    <p class="text-gray-400 text-xs mt-1">{{ card.flavor }}</p>
                    <p class="text-amber-600/80 text-xs mt-2 italic">{{ card.passive }}</p>
                  </div>
                  <div class="shrink-0 text-right">
                    <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-400">
                      <span class="text-gray-500">HP</span>
                      <span class="text-gray-200">{{ getBaseStats(card.id).maxHP }}</span>
                      <span class="text-gray-500">STR</span>
                      <span class="text-gray-200">{{ getBaseStats(card.id).str }}</span>
                      <span class="text-gray-500">DEX</span>
                      <span class="text-gray-200">{{ getBaseStats(card.id).dex }}</span>
                      <span class="text-gray-500">INT</span>
                      <span class="text-gray-200">{{ getBaseStats(card.id).int }}</span>
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
      </template>

      <!-- Loading state -->
      <div v-else class="text-center text-gray-600 text-xs py-8">Loading...</div>

    </div>
  </div>
</template>

<style scoped>
.save-sprite-wrap {
  position: relative;
  width: 40px;
  height: 44px;
  flex-shrink: 0;
  overflow: visible;
}
.save-sprite-px {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 4px;
  image-rendering: pixelated;
}
.class-sprite-wrap {
  position: relative;
  width: 48px;
  height: 52px;
  flex-shrink: 0;
  overflow: visible;
}
.class-sprite-px {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 4px;
  image-rendering: pixelated;
}
</style>
