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
  <div class="pixel-panel flex flex-col">
    <div class="panel-title">Enemy</div>
    <template v-if="enemy">
      <div class="arena">
        <div class="arena-glow"></div>
        <div class="sprite-wrap">
          <div class="pixel-sprite" :style="spriteStyle"></div>
          <div class="sprite-name">{{ enemy.name }}</div>
        </div>
      </div>
      <div class="inner">
        <div class="bar-row">
          <span class="bar-lbl">HP</span>
          <div class="bar-track"><div class="bar-fill bar-hp" :style="{ width: hpPercent + '%' }"></div></div>
          <span class="bar-val">{{ enemy.hp }}/{{ enemy.maxHp }}</span>
        </div>
        <div class="enemy-stats">
          <span class="stat">ATK <b>{{ enemy.atk[0] }}–{{ enemy.atk[1] }}</b></span>
          <span class="stat">DEF <b>{{ enemy.def }}</b></span>
          <span class="stat">SPD <b>{{ (enemy.attackSpeed / 1000).toFixed(1) }}s</b></span>
        </div>
      </div>
    </template>
    <div v-else class="no-enemy">No enemy</div>
  </div>
</template>

<style scoped>
.arena {
  height: 120px;
  background: #0e0c1c;
  border-bottom: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
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
  width: 150px; height: 40px;
  background: radial-gradient(ellipse, rgba(120,40,220,0.5) 0%, transparent 70%);
  pointer-events: none;
}
.sprite-wrap {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.pixel-sprite {
  width: 5px;
  height: 5px;
  image-rendering: pixelated;
  animation: float 2.8s ease-in-out infinite;
}
.sprite-name {
  font-size: 8px;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 2px 2px 0 #000, 0 0 12px rgba(160,80,255,0.8);
  text-align: center;
}
.inner { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: flex; align-items: center; gap: 8px; }
.bar-lbl { font-size: 6px; color: var(--text); width: 18px; flex-shrink: 0; }
.bar-val { font-size: 6px; color: var(--text); width: 64px; text-align: right; flex-shrink: 0; }
.enemy-stats { display: flex; gap: 10px; padding-top: 6px; border-top: 1px solid var(--border); }
.stat { font-size: 6px; color: var(--text-dim); }
.stat b { color: var(--text); font-weight: normal; }
.no-enemy { padding: 20px; text-align: center; font-size: 7px; color: var(--text-dim); }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
</style>
