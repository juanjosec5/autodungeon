<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '../stores/tasks'
import { msUntilDailyReset, msUntilWeeklyReset } from '../game/tasks'
import type { TaskInstance } from '../types/index'

const taskStore = useTaskStore()

// ── Countdown timers ─────────────────────────────────────────────────────────

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSecs = Math.floor(ms / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

const dailyCountdown = ref(formatCountdown(msUntilDailyReset()))
const weeklyCountdown = ref(formatCountdown(msUntilWeeklyReset()))

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    dailyCountdown.value = formatCountdown(msUntilDailyReset())
    weeklyCountdown.value = formatCountdown(msUntilWeeklyReset())
  }, 1000)
})

onUnmounted(() => {
  if (timer !== null) clearInterval(timer)
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function barWidth(task: TaskInstance): string {
  const progress = taskStore.getProgress(task)
  return Math.min(100, Math.floor((progress / task.target) * 100)) + '%'
}

function isComplete(task: TaskInstance): boolean {
  return taskStore.getProgress(task) >= task.target
}

function formatProgress(task: TaskInstance): string {
  const p = taskStore.getProgress(task)
  const t = task.target
  if (t >= 1000) return `${p.toLocaleString()} / ${t.toLocaleString()}`
  return `${p} / ${t}`
}

function rewardLabel(task: TaskInstance): string {
  const parts: string[] = []
  if (task.reward.gold > 0) parts.push(`${task.reward.gold}g`)
  if (task.reward.xp > 0) parts.push(`${task.reward.xp.toLocaleString()} XP`)
  if (task.reward.tokens > 0) parts.push(`${task.reward.tokens} Token${task.reward.tokens > 1 ? 's' : ''}`)
  return parts.join(' · ')
}

function claim(task: TaskInstance) {
  taskStore.claimTask(task.id, task.period)
}
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title">Tasks</div>

    <!-- Daily section -->
    <div class="task-section">
      <div class="section-header">
        <span class="section-label">Daily</span>
        <span class="section-timer">Resets in {{ dailyCountdown }}</span>
      </div>

      <div class="task-list">
        <div
          v-for="task in taskStore.dailyTasks"
          :key="task.id"
          class="task-row"
          :class="{
            'task-complete': isComplete(task) && !taskStore.isClaimed(task),
            'task-claimed': taskStore.isClaimed(task),
          }"
        >
          <div class="task-top">
            <span class="task-desc">
              <span class="task-icon">
                {{ taskStore.isClaimed(task) ? '✓' : isComplete(task) ? '!' : '○' }}
              </span>
              {{ task.description }}
            </span>
            <span class="task-progress">{{ formatProgress(task) }}</span>
          </div>

          <div class="bar-track">
            <div
              class="bar-fill bar-task"
              :class="{
                'bar-done': taskStore.isClaimed(task),
                'bar-ready': isComplete(task) && !taskStore.isClaimed(task),
              }"
              :style="{ width: barWidth(task) }"
            ></div>
          </div>

          <div class="task-bottom">
            <span class="task-reward">{{ rewardLabel(task) }}</span>
            <button
              v-if="isComplete(task) && !taskStore.isClaimed(task)"
              class="pixel-btn claim-btn btn-gold"
              @click="claim(task)"
            >CLAIM</button>
            <span v-else-if="taskStore.isClaimed(task)" class="claimed-label">Claimed</span>
          </div>
        </div>

        <div v-if="taskStore.dailyTasks.length === 0" class="task-empty">
          Loading tasks…
        </div>
      </div>
    </div>

    <!-- Weekly section -->
    <div class="task-section">
      <div class="section-header">
        <span class="section-label">Weekly</span>
        <span class="section-timer">Resets in {{ weeklyCountdown }}</span>
      </div>

      <div class="task-list">
        <div
          v-for="task in taskStore.weeklyTasks"
          :key="task.id"
          class="task-row"
          :class="{
            'task-complete': isComplete(task) && !taskStore.isClaimed(task),
            'task-claimed': taskStore.isClaimed(task),
          }"
        >
          <div class="task-top">
            <span class="task-desc">
              <span class="task-icon">
                {{ taskStore.isClaimed(task) ? '✓' : isComplete(task) ? '!' : '○' }}
              </span>
              {{ task.description }}
            </span>
            <span class="task-progress">{{ formatProgress(task) }}</span>
          </div>

          <div class="bar-track">
            <div
              class="bar-fill bar-task"
              :class="{
                'bar-done': taskStore.isClaimed(task),
                'bar-ready': isComplete(task) && !taskStore.isClaimed(task),
              }"
              :style="{ width: barWidth(task) }"
            ></div>
          </div>

          <div class="task-bottom">
            <span class="task-reward">{{ rewardLabel(task) }}</span>
            <button
              v-if="isComplete(task) && !taskStore.isClaimed(task)"
              class="pixel-btn claim-btn btn-gold"
              @click="claim(task)"
            >CLAIM</button>
            <span v-else-if="taskStore.isClaimed(task)" class="claimed-label">Claimed</span>
          </div>
        </div>

        <div v-if="taskStore.weeklyTasks.length === 0" class="task-empty">
          Loading tasks…
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-section {
  margin-bottom: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}

.section-label {
  font-size: 8px;
  color: var(--gold);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.section-timer {
  font-size: 7px;
  color: var(--text-dim);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-row {
  background: #0e0c1c;
  border: 2px solid var(--border);
  padding: 8px;
}

.task-row.task-complete {
  border-color: var(--gold);
  background: #1a1608;
}

.task-row.task-claimed {
  border-color: var(--border);
  opacity: 0.55;
}

.task-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 5px;
}

.task-desc {
  font-size: 7px;
  color: var(--text);
  line-height: 1.4;
  flex: 1;
}

.task-icon {
  margin-right: 4px;
  color: var(--gold);
}

.task-row.task-claimed .task-icon {
  color: #4a6a4a;
}

.task-progress {
  font-size: 7px;
  color: var(--text-dim);
  white-space: nowrap;
  flex-shrink: 0;
}

/* progress bar */
.bar-track {
  width: 100%;
  height: 4px;
  background: #1a1630;
  border: 1px solid #2a2050;
  margin-bottom: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.bar-task {
  background: var(--text-dim);
}

.bar-ready {
  background: var(--gold);
}

.bar-done {
  background: #4a7a4a;
}

.task-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-reward {
  font-size: 6px;
  color: var(--text-dim);
}

.claim-btn {
  font-size: 6px;
  padding: 3px 8px;
}

.claimed-label {
  font-size: 6px;
  color: #4a7a4a;
}

.task-empty {
  font-size: 7px;
  color: var(--text-dim);
  padding: 10px 0;
  text-align: center;
}
</style>
