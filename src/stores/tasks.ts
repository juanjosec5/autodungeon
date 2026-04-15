import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TaskInstance, TaskTracker } from '../types/index'
import { generateDailyTasks, generateWeeklyTasks } from '../game/tasks'
import { useCharacterStore } from './character'
import { usePrestigeStore } from './prestige'

const LS_KEY = 'autodungeon_tasks'

const EMPTY_TRACKER = (): TaskTracker => ({
  kills: 0,
  bossKills: 0,
  damageDealt: 0,
  goldEarned: 0,
  crits: 0,
  prestigesDone: 0,
})

interface PersistedTasks {
  dailySeed: number
  weeklySeed: number
  dailyTracker: TaskTracker
  weeklyTracker: TaskTracker
  claimedDaily: string[]
  claimedWeekly: string[]
}

function daySeed(): number {
  return Math.floor(Date.now() / 86_400_000)
}

function weekSeed(): number {
  return Math.floor(Date.now() / (86_400_000 * 7))
}

export const useTaskStore = defineStore('tasks', () => {
  const characterStore = useCharacterStore()
  const prestigeStore = usePrestigeStore()

  // ── State ─────────────────────────────────────────────────────────────────

  const dailyTasks = ref<TaskInstance[]>([])
  const weeklyTasks = ref<TaskInstance[]>([])
  const dailyTracker = ref<TaskTracker>(EMPTY_TRACKER())
  const weeklyTracker = ref<TaskTracker>(EMPTY_TRACKER())
  const claimedDaily = ref<string[]>([])
  const claimedWeekly = ref<string[]>([])
  const lastDailySeed = ref(0)
  const lastWeeklySeed = ref(0)

  // ── Computed ──────────────────────────────────────────────────────────────

  const unclaimedCompletedCount = computed(() => {
    let count = 0
    for (const task of dailyTasks.value) {
      if (!claimedDaily.value.includes(task.id) && getProgress(task) >= task.target) count++
    }
    for (const task of weeklyTasks.value) {
      if (!claimedWeekly.value.includes(task.id) && getProgress(task) >= task.target) count++
    }
    return count
  })

  // ── Progress helper ───────────────────────────────────────────────────────

  function getProgress(task: TaskInstance): number {
    const tracker = task.period === 'daily' ? dailyTracker.value : weeklyTracker.value
    switch (task.type) {
      case 'kill_enemies':  return tracker.kills
      case 'kill_bosses':   return tracker.bossKills
      case 'deal_damage':   return tracker.damageDealt
      case 'earn_gold':     return tracker.goldEarned
      case 'land_crits':    return tracker.crits
      case 'prestige_run':  return tracker.prestigesDone
      case 'reach_level':
        return characterStore.character?.level ?? 0
    }
  }

  function isClaimed(task: TaskInstance): boolean {
    return task.period === 'daily'
      ? claimedDaily.value.includes(task.id)
      : claimedWeekly.value.includes(task.id)
  }

  // ── Reset check ───────────────────────────────────────────────────────────

  function checkResets(): void {
    const level = characterStore.character?.level ?? 1
    const currentDay = daySeed()
    const currentWeek = weekSeed()

    if (lastDailySeed.value !== currentDay) {
      dailyTasks.value = generateDailyTasks(level)
      dailyTracker.value = EMPTY_TRACKER()
      claimedDaily.value = []
      lastDailySeed.value = currentDay
    }
    if (lastWeeklySeed.value !== currentWeek) {
      weeklyTasks.value = generateWeeklyTasks(level)
      weeklyTracker.value = EMPTY_TRACKER()
      claimedWeekly.value = []
      lastWeeklySeed.value = currentWeek
    }
    _save()
  }

  // ── Tracker update ────────────────────────────────────────────────────────

  function updateTracker(delta: Partial<TaskTracker>): void {
    for (const key of Object.keys(delta) as (keyof TaskTracker)[]) {
      if (delta[key] !== undefined) {
        dailyTracker.value[key] += delta[key]!
        weeklyTracker.value[key] += delta[key]!
      }
    }
    _save()
  }

  // ── Claim ─────────────────────────────────────────────────────────────────

  function claimTask(taskId: string, period: 'daily' | 'weekly'): boolean {
    const tasks = period === 'daily' ? dailyTasks.value : weeklyTasks.value
    const claimed = period === 'daily' ? claimedDaily.value : claimedWeekly.value
    const task = tasks.find(t => t.id === taskId)
    if (!task) return false
    if (claimed.includes(taskId)) return false
    if (getProgress(task) < task.target) return false

    claimed.push(taskId)
    const char = characterStore.character
    if (char) {
      if (task.reward.gold > 0) char.gold += task.reward.gold
      if (task.reward.xp > 0) characterStore.applyXP(task.reward.xp)
      if (task.reward.tokens > 0) prestigeStore.addTokens(task.reward.tokens)
    }
    _save()
    return true
  }

  // ── Persistence ───────────────────────────────────────────────────────────

  function _save(): void {
    const data: PersistedTasks = {
      dailySeed: lastDailySeed.value,
      weeklySeed: lastWeeklySeed.value,
      dailyTracker: dailyTracker.value,
      weeklyTracker: weeklyTracker.value,
      claimedDaily: claimedDaily.value,
      claimedWeekly: claimedWeekly.value,
    }
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  }

  function loadTasks(): void {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw) as Partial<PersistedTasks>
        lastDailySeed.value = data.dailySeed ?? 0
        lastWeeklySeed.value = data.weeklySeed ?? 0
        dailyTracker.value = { ...EMPTY_TRACKER(), ...(data.dailyTracker ?? {}) }
        weeklyTracker.value = { ...EMPTY_TRACKER(), ...(data.weeklyTracker ?? {}) }
        claimedDaily.value = data.claimedDaily ?? []
        claimedWeekly.value = data.claimedWeekly ?? []
      } catch {
        // Corrupt — start fresh
      }
    }
    // Always run reset check after loading (handles resets that happened while offline)
    checkResets()
  }

  return {
    dailyTasks,
    weeklyTasks,
    dailyTracker,
    weeklyTracker,
    claimedDaily,
    claimedWeekly,
    unclaimedCompletedCount,
    getProgress,
    isClaimed,
    checkResets,
    updateTracker,
    claimTask,
    loadTasks,
  }
})
