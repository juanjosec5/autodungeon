<script setup lang="ts">
import { computed } from 'vue'
import { useCombatStore } from '../stores/combat'

const combatStore = useCombatStore()
const enemy = computed(() => combatStore.currentEnemy)

const hpPercent = computed(() => {
  if (!enemy.value) return 0
  return Math.max(0, Math.min(100, (enemy.value.hp / enemy.value.maxHp) * 100))
})

// Pixel sprite — 12×13 wraith, 5px per pixel, drawn via CSS box-shadow
const PX = 5
const B = '#6030b8'
const S = '#3d1a78'
const D = '#150a30'
const E = '#ee66ff'
const _ = null

const SPRITE = [
  [_,_,_,_,B,B,B,B,_,_,_,_],
  [_,_,_,B,B,B,B,B,B,_,_,_],
  [_,_,B,B,B,B,B,B,B,B,_,_],
  [_,B,B,B,B,B,B,B,B,B,B,_],
  [B,B,B,B,B,B,B,B,B,B,B,B],
  [B,B,S,S,B,B,B,B,S,S,B,B],
  [B,B,D,D,B,B,B,B,D,D,B,B],
  [B,B,E,E,B,B,B,B,E,E,B,B],
  [B,B,D,D,B,B,B,B,D,D,B,B],
  [B,B,B,B,B,B,B,B,B,B,B,B],
  [B,B,B,B,B,B,B,B,B,B,B,B],
  [B,B,B,B,B,B,B,B,B,B,B,B],
  [_,B,_,B,_,B,_,B,_,B,_,_],
]

const spriteStyle = computed(() => {
  const shadows: string[] = []
  for (let r = 0; r < SPRITE.length; r++) {
    for (let c = 0; c < SPRITE[r].length; c++) {
      const color = SPRITE[r][c]
      if (color) shadows.push(`${c * PX}px ${r * PX}px 0 0 ${color}`)
    }
  }
  return { boxShadow: shadows.join(',') }
})
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title">Enemy</div>
    <template v-if="enemy">
      <div class="enemy-body">
        <!-- Arena -->
        <div class="arena">
          <div class="arena-glow"></div>
          <div class="sprite-wrap">
            <div class="pixel-sprite" :style="spriteStyle"></div>
          </div>
          <!-- CRT scanlines -->
        </div>

        <!-- Info -->
        <div class="info">
          <div class="enemy-name">{{ enemy.name }}</div>

          <div class="bar-row">
            <span class="bar-lbl">HP</span>
            <div class="bar-track">
              <div class="bar-fill bar-hp" :style="{ width: hpPercent + '%' }"></div>
            </div>
            <span class="bar-val">{{ enemy.hp }}/{{ enemy.maxHp }}</span>
          </div>

          <div class="enemy-stats">
            <div class="stat-group">
              <span class="stat-label">ATK</span>
              <span class="stat-value">{{ enemy.atk[0] }}–{{ enemy.atk[1] }}</span>
            </div>
            <div class="stat-group">
              <span class="stat-label">DEF</span>
              <span class="stat-value">{{ enemy.def }}</span>
            </div>
            <div class="stat-group">
              <span class="stat-label">SPD</span>
              <span class="stat-value">{{ (enemy.attackSpeed / 1000).toFixed(1) }}s</span>
            </div>
            <div class="stat-group">
              <span class="stat-label">XP</span>
              <span class="stat-value">{{ enemy.xpReward }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="no-enemy">No enemy</div>
  </div>
</template>

<style scoped>
.enemy-body {
  display: flex;
  flex-direction: row;
}

.arena {
  width: 140px;
  flex-shrink: 0;
  background: #0e0c1c;
  border-right: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* CRT scanlines */
.arena::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0,0,0,0.18) 3px,
    rgba(0,0,0,0.18) 4px
  );
  pointer-events: none;
  z-index: 10;
}

.arena-glow {
  position: absolute;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 40px;
  background: radial-gradient(ellipse, rgba(120,40,220,0.5) 0%, transparent 70%);
  pointer-events: none;
}

.sprite-wrap {
  position: relative;
  z-index: 5;
}

.pixel-sprite {
  width: 5px;
  height: 5px;
  image-rendering: pixelated;
  animation: float 2.8s ease-in-out infinite;
}

/* Info panel */
.info {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.enemy-name {
  font-size: 11px;
  color: var(--text-hi);
  letter-spacing: 1px;
  text-shadow: 2px 2px 0 #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bar-lbl { font-size: 8px; color: var(--text); width: 18px; flex-shrink: 0; }
.bar-val { font-size: 8px; color: var(--text); min-width: 64px; text-align: right; flex-shrink: 0; }

.enemy-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.stat-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.stat-label { font-size: 7px; color: var(--text-dim); }
.stat-value { font-size: 9px; color: var(--text); }

.no-enemy { padding: 20px; text-align: center; font-size: 9px; color: var(--text-dim); }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}

/* Mobile: taller arena, stacked layout */
@media (max-width: 480px) {
  .enemy-body {
    flex-direction: column;
  }
  .arena {
    width: 100%;
    height: 110px;
    border-right: none;
    border-bottom: 2px solid var(--border);
  }
}
</style>
