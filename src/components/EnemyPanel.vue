<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useCombatStore } from '../stores/combat'
import { getSpriteForEnemy, buildSpriteStyle } from '../game/sprites'

const combatStore = useCombatStore()
const enemy = computed(() => combatStore.currentEnemy)
const isBossActive = computed(() => combatStore.isBossActive)
const killCount = computed(() => combatStore.killCount)
const killsToNextBoss = computed(() => combatStore.killsToNextBoss)
const bossProgress = computed(() => Math.min(100, (killCount.value / killsToNextBoss.value) * 100))

// ── HP bar ────────────────────────────────────────────────────────────────────

const hpPercent = computed(() => {
  if (!enemy.value) return 0
  return Math.max(0, Math.min(100, (enemy.value.hp / enemy.value.maxHp) * 100))
})

// Disable transition when a fresh enemy spawns so bar snaps to 100% instantly
const hpInstant = ref(false)
watch(() => combatStore.enemySpawnCounter, () => {
  hpInstant.value = true
  nextTick(() => { hpInstant.value = false })
})

// ── Sprite ────────────────────────────────────────────────────────────────────

const spriteStyle = computed(() => {
  const sprite = getSpriteForEnemy(enemy.value?.name ?? '')
  return { boxShadow: buildSpriteStyle(sprite) }
})

// ── Combat animations ─────────────────────────────────────────────────────────

const isFlashing = ref(false)
const isAttacking = ref(false)

watch(() => combatStore.enemyHitFlash, () => {
  isFlashing.value = false
  requestAnimationFrame(() => {
    isFlashing.value = true
    setTimeout(() => { isFlashing.value = false }, 180)
  })
})

watch(() => combatStore.enemyAttackShake, () => {
  isAttacking.value = false
  requestAnimationFrame(() => {
    isAttacking.value = true
    setTimeout(() => { isAttacking.value = false }, 300)
  })
})

// ── Floating damage numbers ───────────────────────────────────────────────────

interface DamageNumber {
  id: number
  value: number
  isCrit: boolean
  offsetX: number
}

const damageNumbers = ref<DamageNumber[]>([])
let dmgIdCounter = 0

watch(() => combatStore.enemyHitFlash, () => {
  const id = dmgIdCounter++
  damageNumbers.value.push({
    id,
    value: combatStore.lastEnemyDamage,
    isCrit: combatStore.lastEnemyCrit,
    offsetX: Math.round(Math.random() * 24 - 12), // -12 to +12px spread
  })
  setTimeout(() => {
    damageNumbers.value = damageNumbers.value.filter((d) => d.id !== id)
  }, 900)
})
</script>

<template>
  <div class="pixel-panel">
    <div class="panel-title">Enemy</div>
    <template v-if="enemy">
      <div class="enemy-body">
        <!-- Arena -->
        <div class="arena" :class="{ 'arena-boss': isBossActive }">
          <div class="arena-glow" :class="{ 'arena-glow-boss': isBossActive }"></div>
          <div v-if="isBossActive" class="boss-badge">BOSS</div>

          <!-- Sprite — margin centers the 60×60px box-shadow sprite -->
          <div class="float-wrap">
            <div class="sprite-wrap" :class="{ attacking: isAttacking }">
              <div class="pixel-sprite" :class="{ flashing: isFlashing }" :style="spriteStyle"></div>
            </div>
          </div>

          <!-- Floating damage numbers -->
          <div class="dmg-layer">
            <div
              v-for="dmg in damageNumbers"
              :key="dmg.id"
              class="dmg-number"
              :class="{ crit: dmg.isCrit }"
              :style="{ left: `calc(50% + ${dmg.offsetX}px)` }"
            >{{ dmg.value }}</div>
          </div>
        </div>

        <!-- Info -->
        <div class="info">
          <div class="enemy-name">{{ enemy.name }}</div>

          <div class="bar-row">
            <span class="bar-lbl">HP</span>
            <div class="bar-track">
              <div
                class="bar-fill bar-hp"
                :class="{ instant: hpInstant }"
                :style="{ width: hpPercent + '%' }"
              ></div>
            </div>
            <span class="bar-val">{{ Math.max(0, enemy.hp) }}/{{ enemy.maxHp }}</span>
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

          <!-- Boss progress / indicator -->
          <div class="boss-row">
            <template v-if="isBossActive">
              <span class="boss-label">⚔ BOSS BATTLE</span>
            </template>
            <template v-else>
              <span class="boss-lbl">Boss</span>
              <div class="bar-track">
                <div class="bar-fill bar-boss" :style="{ width: bossProgress + '%' }"></div>
              </div>
              <span class="boss-lbl">{{ killCount }}/{{ killsToNextBoss }}</span>
            </template>
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
  transition: background 0.4s;
}
.arena-glow-boss {
  background: radial-gradient(ellipse, rgba(220,60,20,0.7) 0%, transparent 70%);
}

.boss-badge {
  position: absolute;
  top: 6px; left: 50%;
  transform: translateX(-50%);
  font-size: 7px;
  color: #ff4422;
  letter-spacing: 2px;
  text-shadow: 0 0 8px rgba(255,60,20,0.8);
  animation: boss-pulse 1s ease-in-out infinite alternate;
  z-index: 15;
  white-space: nowrap;
}

/* Sprite centering:
   The box-shadow sprite is 12 cols × ~11 rows at 5px = 60×55px visual.
   Shift element left by 30px and up by 28px so the visual center
   lines up with the arena center. */
.float-wrap {
  position: relative;
  z-index: 5;
  margin-left: -30px;
  margin-top: -28px;
  animation: float 2.8s ease-in-out infinite;
}

.sprite-wrap {
  display: inline-block;
}
.sprite-wrap.attacking {
  animation: enemy-attack 0.3s ease-in-out forwards;
}

.pixel-sprite {
  width: 5px;
  height: 5px;
  image-rendering: pixelated;
  display: block;
}
.pixel-sprite.flashing {
  animation: hit-flash 0.18s ease-out forwards;
}

/* Floating damage numbers */
.dmg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}
.dmg-number {
  position: absolute;
  top: 38%;
  font-size: 11px;
  color: #ffffff;
  font-family: 'Press Start 2P', monospace;
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000;
  white-space: nowrap;
  transform: translateX(-50%);
  animation: float-dmg 0.9s ease-out forwards;
}
.dmg-number.crit {
  font-size: 13px;
  color: #ffcc00;
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

.bar-hp {
  transition: width 0.15s ease-out;
}
.bar-hp.instant {
  transition: none;
}
.bar-boss {
  background: linear-gradient(90deg, #cc2200, #ff6622);
  transition: width 0.3s ease-out;
}

.boss-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}
.boss-lbl { font-size: 7px; color: var(--text-dim); white-space: nowrap; }
.boss-label {
  font-size: 8px;
  color: #ff4422;
  text-shadow: 0 0 6px rgba(255,60,20,0.6);
  animation: boss-pulse 1s ease-in-out infinite alternate;
  white-space: nowrap;
}

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

@keyframes enemy-attack {
  0%   { transform: translateY(0) translateX(0); }
  30%  { transform: translateY(-3px) translateX(8px); }
  70%  { transform: translateY(0) translateX(-4px); }
  100% { transform: translateY(0) translateX(0); }
}

@keyframes hit-flash {
  0%   { filter: brightness(8) saturate(0) sepia(1) hue-rotate(-30deg); }
  100% { filter: brightness(1); }
}

@keyframes float-dmg {
  0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
  20%  { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50%) translateY(-36px); }
}

@keyframes boss-pulse {
  0%   { opacity: 0.7; }
  100% { opacity: 1; text-shadow: 0 0 12px rgba(255,60,20,1); }
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
