<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAchievementStore } from '../stores/achievement'
import { ZONE_CHALLENGE_SETS } from '../game/achievements'
import { getItemSpriteStyle } from '../game/item-sprites'
import { fmtNum } from '../utils/format'
import type { ZoneId } from '../types/index'

const achievementStore = useAchievementStore()

const collapsed = ref(localStorage.getItem('collapsed_achievements') === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('collapsed_achievements', String(collapsed.value))
}

const activeZone = ref<ZoneId>('forest')
const activeSet = computed(() => ZONE_CHALLENGE_SETS.find((s) => s.zone === activeZone.value)!)

const ZONE_ABBR: Record<ZoneId, string> = {
  forest: 'For',
  dungeon: 'Dun',
  volcano: 'Vol',
  abyss: 'Aby',
  shadowrealm: 'Sha',
  celestial: 'Cel',
  void: 'Voi',
  nightmare: 'Nig',
}

function isZoneDone(zone: ZoneId): boolean {
  return achievementStore.completedZones.includes(zone)
}

function barWidth(current: number, target: number): string {
  return Math.min(100, Math.floor((current / target) * 100)) + '%'
}

function doneCount(zone: ZoneId): number {
  const p = achievementStore.getProgress(zone)
  const set = ZONE_CHALLENGE_SETS.find((s) => s.zone === zone)
  if (!set) return 0
  return set.challenges.filter((c) => c.isDone(p)).length
}

function rewardSpriteStyle(defId: string): string {
  return getItemSpriteStyle(defId, 3)
}

function formatProgress(current: number, target: number): string {
  if (target >= 1000) return `${fmtNum(current)} / ${fmtNum(target)}`
  return `${current} / ${target}`
}
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title" @click="toggleCollapse">
      Challenges
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>

    <template v-if="!collapsed">
      <!-- Zone tabs -->
      <div class="zone-tabs">
        <button
          v-for="set in ZONE_CHALLENGE_SETS"
          :key="set.zone"
          class="zone-tab"
          :class="{
            active: activeZone === set.zone,
            done: isZoneDone(set.zone),
          }"
          @click="activeZone = set.zone"
        >
          {{ ZONE_ABBR[set.zone] }}
          <span v-if="isZoneDone(set.zone)" class="tab-check">✓</span>
        </button>
      </div>

      <!-- Active zone challenges -->
      <div class="zone-body">
        <div class="zone-header">
          <span class="zone-name">{{ activeSet.zoneName }}</span>
          <span class="zone-count" :class="{ 'zone-count-done': isZoneDone(activeZone) }">
            {{ isZoneDone(activeZone) ? 'COMPLETE' : `${doneCount(activeZone)} / ${activeSet.challenges.length}` }}
          </span>
        </div>

        <!-- Challenge list -->
        <div class="challenge-list">
          <div
            v-for="challenge in activeSet.challenges"
            :key="challenge.label"
            class="challenge-row"
            :class="{ done: challenge.isDone(achievementStore.getProgress(activeZone)) }"
          >
            <div class="challenge-top">
              <span class="challenge-label">
                <span class="check-icon">{{ challenge.isDone(achievementStore.getProgress(activeZone)) ? '✓' : '○' }}</span>
                {{ challenge.label }}
              </span>
              <span class="challenge-val">
                {{ formatProgress(challenge.progress(achievementStore.getProgress(activeZone)), challenge.target) }}
              </span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill bar-challenge"
                :class="{ 'bar-done': challenge.isDone(achievementStore.getProgress(activeZone)) }"
                :style="{ width: barWidth(challenge.progress(achievementStore.getProgress(activeZone)), challenge.target) }"
              ></div>
            </div>
            <div class="challenge-desc">{{ challenge.description }}</div>
          </div>
        </div>

        <!-- Reward section -->
        <div class="reward-section" :class="{ 'reward-unlocked': isZoneDone(activeZone) }">
          <div class="reward-title">
            {{ isZoneDone(activeZone) ? '🏆 Reward Unlocked' : '⚔ Completion Reward' }}
          </div>
          <div class="reward-items">
            <!-- Weapon -->
            <div class="reward-item">
              <div class="reward-sprite-wrap">
                <div
                  v-if="rewardSpriteStyle(activeSet.reward.weapon.defId)"
                  class="reward-sprite"
                  :style="{ boxShadow: rewardSpriteStyle(activeSet.reward.weapon.defId) }"
                ></div>
              </div>
              <div class="reward-info">
                <div class="reward-name" :class="activeSet.reward.weapon.rarity">{{ activeSet.reward.weapon.name }}</div>
                <div class="reward-stats">
                  {{ activeSet.reward.weapon.stats.minDmg }}–{{ activeSet.reward.weapon.stats.maxDmg }} ATK
                </div>
              </div>
            </div>
            <!-- Armor -->
            <div class="reward-item">
              <div class="reward-sprite-wrap">
                <div
                  v-if="rewardSpriteStyle(activeSet.reward.armor.defId)"
                  class="reward-sprite"
                  :style="{ boxShadow: rewardSpriteStyle(activeSet.reward.armor.defId) }"
                ></div>
              </div>
              <div class="reward-info">
                <div class="reward-name" :class="activeSet.reward.armor.rarity">{{ activeSet.reward.armor.name }}</div>
                <div class="reward-stats">
                  {{ activeSet.reward.armor.stats.defBonus }} DEF · +{{ activeSet.reward.armor.stats.hpBonus }} HP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Zone tabs */
.zone-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 8px 0;
  border-bottom: 1px solid var(--border);
}

.zone-tab {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  padding: 4px 6px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  transition: color 0.1s, background 0.1s;
}

.zone-tab:hover { color: var(--text); }
.zone-tab.active { background: var(--border); color: var(--text-hi); }
.zone-tab.done { color: var(--gold); border-color: var(--gold); }
.zone-tab.done.active { background: rgba(200, 160, 40, 0.12); }

.tab-check { font-size: 7px; }

/* Zone body */
.zone-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.zone-name { font-size: 10px; color: var(--text-hi); letter-spacing: 1px; }
.zone-count { font-size: 8px; color: var(--text-dim); }
.zone-count-done { color: var(--gold); }

/* Challenges */
.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.challenge-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.challenge-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4px;
}

.challenge-label {
  font-size: 8px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 4px;
}

.check-icon { font-size: 8px; color: var(--text-dim); }
.challenge-row.done .check-icon { color: #40c878; }
.challenge-row.done .challenge-label { color: #40c878; }

.challenge-val { font-size: 7px; color: var(--text-dim); white-space: nowrap; flex-shrink: 0; }

.bar-challenge {
  background: linear-gradient(90deg, #4040a0, #6060d8);
  transition: width 0.3s ease-out;
}
.bar-done {
  background: linear-gradient(90deg, #206840, #40c878);
}

.challenge-desc {
  font-size: 6px;
  color: var(--text-dim);
  line-height: 1.6;
  padding-left: 12px;
}

/* Reward section */
.reward-section {
  border-top: 1px solid var(--border);
  padding-top: 8px;
}

.reward-unlocked {
  border-color: var(--gold);
}

.reward-title {
  font-size: 7px;
  color: var(--text-dim);
  margin-bottom: 6px;
}
.reward-unlocked .reward-title { color: var(--gold); }

.reward-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reward-sprite-wrap {
  width: 24px;
  height: 28px;
  flex-shrink: 0;
  position: relative;
  overflow: visible;
}

.reward-sprite {
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 3px;
  image-rendering: pixelated;
}

.reward-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reward-name {
  font-size: 8px;
  color: var(--text);
}
.reward-name.epic { color: #a040e0; }
.reward-name.legendary { color: var(--gold); }

.reward-stats {
  font-size: 7px;
  color: var(--text-dim);
}
</style>
