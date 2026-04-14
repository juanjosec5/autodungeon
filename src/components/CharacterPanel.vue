<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useZoneStore } from '../stores/zone'
import { useCombatStore } from '../stores/combat'
import { CLASS_DEFINITIONS } from '../game/classes'
import { SKILL_DEFINITIONS, getSkillBonuses } from '../game/skills'
import { getSpecial } from '../game/formulas'
import { buildClassSpriteStyle } from '../game/class-sprites'
import { fmtNum } from '../utils/format'
import type { ZoneId, SkillId } from '../types/index'

const characterStore = useCharacterStore()
const zoneStore = useZoneStore()
const combatStore = useCombatStore()
const char = computed(() => characterStore.character)

// ── Class sprite + animations ─────────────────────────────────────────────────

const spriteStyle = computed(() =>
  char.value ? { boxShadow: buildClassSpriteStyle(char.value.class) } : {},
)

const isAttacking = ref(false)
const isHit = ref(false)
let attackTimer: ReturnType<typeof setTimeout> | null = null
let hitTimer: ReturnType<typeof setTimeout> | null = null

watch(() => combatStore.enemyHitFlash, async () => {
  isAttacking.value = false
  await nextTick()
  isAttacking.value = true
  if (attackTimer) clearTimeout(attackTimer)
  attackTimer = setTimeout(() => { isAttacking.value = false }, 350)
})

watch(() => combatStore.enemyAttackShake, async () => {
  isHit.value = false
  await nextTick()
  isHit.value = true
  if (hitTimer) clearTimeout(hitTimer)
  hitTimer = setTimeout(() => { isHit.value = false }, 200)
})

const hpPercent = computed(() => {
  if (!char.value) return 0
  return Math.max(0, Math.min(100, (char.value.currentHP / char.value.maxHP) * 100))
})

const xpPercent = computed(() => {
  if (!char.value) return 0
  return Math.max(0, Math.min(100, (char.value.xp / char.value.xpToNext) * 100))
})

const ZONE_AVG_DEF: Record<ZoneId, number> = {
  forest: 4, dungeon: 7, volcano: 14, abyss: 19,
  shadowrealm: 25, celestial: 34, void: 43, nightmare: 60,
}

const combatStats = computed(() => {
  if (!char.value) return null
  const { class: classId, stats } = char.value
  const passives = CLASS_DEFINITIONS[classId].passives
  const zone = zoneStore.activeZone
  const avgDef = ZONE_AVG_DEF[zone]
  const sb = getSkillBonuses(char.value.skills ?? {})

  // Use current enemy's actual DEF when in combat, zone average otherwise
  const activeDef = combatStore.currentEnemy?.def ?? avgDef
  const vsEnemy = activeDef !== avgDef  // true when showing live enemy stats

  // Weapon
  const wep = characterStore.effectiveWeaponStats
  const weaponMin = wep?.minDmg ?? 1
  const weaponMax = wep?.maxDmg ?? 3
  const statBonus = CLASS_DEFINITIONS[classId].damageStat === 'int' ? stats.int : stats.str

  // DPS vs active target (no crit)
  const defIgnore = passives.defIgnore ?? 0
  const effEnemyDef = Math.floor(activeDef * (1 - defIgnore))
  const minDPS = Math.max(1, weaponMin + statBonus - effEnemyDef)
  const maxDPS = Math.max(1, weaponMax + statBonus - effEnemyDef)

  // Crit chance — class base threshold, reduced by killing-blow skill
  const baseCritThreshold = passives.critThreshold ?? 20
  const effectiveCritThreshold = Math.max(2, baseCritThreshold - sb.critThresholdReduction)
  const critPct = Math.round((21 - effectiveCritThreshold) / 20 * 100)

  // Crit multiplier — base 1.5× plus lucky-strike bonus
  const critMultiplier = 1.5 + sb.critDamageBonus

  // Hit chance: nat-20 always hits → 5% floor. nat-1 misses → 95% cap.
  const hitPct = Math.min(95, Math.max(5, Math.round((21 - activeDef + stats.dex) / 20 * 100)))

  // Effective player DEF — armor base × class armorEffectiveness + iron-skin flat bonus
  const baseArmorDef = characterStore.effectiveArmorStats?.defBonus ?? 0
  const armorEff = passives.armorEffectiveness ?? 1.0
  const effDef = Math.floor(baseArmorDef * armorEff) + sb.flatDef

  // Effective dodge & block (armor + skills, capped at 75%)
  const armor = char.value.gear.armor
  const armorDodge = getSpecial(armor?.stats.special, 'dodge')?.chance ?? 0
  const armorBlock = getSpecial(armor?.stats.special, 'block')?.chance ?? 0
  const effDodge = Math.round(Math.min(0.75, armorDodge + sb.dodgeBonus) * 100)
  const effBlock = Math.round(Math.min(0.75, armorBlock + sb.blockBonus) * 100)

  return { minDPS, maxDPS, critPct, critMultiplier, hitPct, effDef, effDodge, effBlock, vsEnemy }
})

const collapsed = ref(localStorage.getItem('collapsed_character') === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('collapsed_character', String(collapsed.value))
}

const skillFlash = ref<string | null>(null)
let skillFlashTimer: ReturnType<typeof setTimeout> | null = null
function spendSkill(skillId: SkillId) {
  const result = characterStore.spendSkillPoint(skillId)
  if (result === 'ok') {
    skillFlash.value = null
  } else if (result === 'no_points') {
    skillFlash.value = 'No skill points!'
    if (skillFlashTimer) clearTimeout(skillFlashTimer)
    skillFlashTimer = setTimeout(() => { skillFlash.value = null }, 1800)
  } else {
    skillFlash.value = 'Already maxed!'
    if (skillFlashTimer) clearTimeout(skillFlashTimer)
    skillFlashTimer = setTimeout(() => { skillFlash.value = null }, 1800)
  }
}

function skillLevel(skillId: SkillId): number {
  return (char.value?.skills ?? {})[skillId] ?? 0
}
</script>

<template>
  <div v-if="char" class="pixel-panel">
    <div class="panel-title" @click="toggleCollapse">
      Player
      <button class="collapse-btn">{{ collapsed ? '►' : '▾' }}</button>
    </div>
    <div v-if="!collapsed" class="inner">

      <!-- Col 1: Identity + bars + base stats -->
      <div class="char-col char-identity">
        <div class="char-header">
          <div :class="['player-sprite-wrap', { attacking: isAttacking, hit: isHit }]">
            <div class="pixel-sprite" :style="spriteStyle"></div>
          </div>
          <div class="char-info">
            <div class="char-name-row">
              <span class="char-name">{{ char.name }}</span>
              <span :class="['class-badge', `class-${char.class}`]">{{ char.class.toUpperCase() }}</span>
            </div>
            <span class="char-level">LV.{{ char.level }}</span>
          </div>
        </div>
        <div class="bars">
          <div class="bar-row">
            <span class="bar-lbl">HP</span>
            <div class="bar-track"><div class="bar-fill bar-hp" :style="{ width: hpPercent + '%' }"></div></div>
            <span class="bar-val">{{ fmtNum(char.currentHP) }}/{{ fmtNum(char.maxHP) }}</span>
          </div>
          <div class="bar-row">
            <span class="bar-lbl">XP</span>
            <div class="bar-track"><div class="bar-fill bar-xp" :style="{ width: xpPercent + '%' }"></div></div>
            <span class="bar-val">{{ fmtNum(char.xp) }}/{{ fmtNum(char.xpToNext) }}</span>
          </div>
        </div>
        <div class="stats-row">
          <div class="stats">
            <span class="stat">STR <b>{{ char.stats.str }}</b></span>
            <span class="stat">DEX <b>{{ char.stats.dex }}</b></span>
            <span class="stat">INT <b>{{ char.stats.int }}</b></span>
          </div>
          <span class="gold">{{ fmtNum(char.gold) }}g</span>
        </div>
      </div>

      <!-- Col 2: Combat Stats -->
      <div v-if="combatStats" class="char-col char-combat-col">
        <div class="col-title">
          Combat Stats
          <span v-if="combatStats.vsEnemy" class="cs-live-badge">live</span>
        </div>
        <div class="cs-grid">
          <span class="cs-label">DPS range</span>
          <span class="cs-value">{{ combatStats.minDPS }}–{{ combatStats.maxDPS }}</span>
          <span class="cs-label">Crit chance</span>
          <span class="cs-value">{{ combatStats.critPct }}%</span>
          <span class="cs-label">Crit mult</span>
          <span class="cs-value">{{ combatStats.critMultiplier.toFixed(1) }}×</span>
          <span class="cs-label">Hit chance</span>
          <span class="cs-value">{{ combatStats.hitPct }}%</span>
          <span class="cs-label">Eff. DEF</span>
          <span class="cs-value">{{ combatStats.effDef }}</span>
          <template v-if="combatStats.effDodge > 0">
            <span class="cs-label">Dodge</span>
            <span class="cs-value">{{ combatStats.effDodge }}%</span>
          </template>
          <template v-if="combatStats.effBlock > 0">
            <span class="cs-label">Block</span>
            <span class="cs-value">{{ combatStats.effBlock }}%</span>
          </template>
        </div>
      </div>

      <!-- Col 3: Skills -->
      <div class="char-col char-skills-col">
        <div class="col-title">
          Skills
          <span v-if="(char.skillPoints ?? 0) > 0" class="skill-pts-badge">
            {{ char.skillPoints }} pt{{ (char.skillPoints ?? 0) !== 1 ? 's' : '' }}
          </span>
        </div>
        <div class="skills-list">
          <span v-if="skillFlash" class="skill-flash">{{ skillFlash }}</span>
          <div v-for="skill in SKILL_DEFINITIONS" :key="skill.id" class="skill-row">
            <div class="skill-info">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-desc">{{ skill.description }}</span>
            </div>
            <div class="skill-right">
              <span class="skill-level">{{ skillLevel(skill.id) }}/{{ skill.maxLevel }}</span>
              <button
                class="skill-btn"
                :disabled="(char.skillPoints ?? 0) === 0 || skillLevel(skill.id) >= skill.maxLevel"
                @click="spendSkill(skill.id)"
              >+</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────────── */
.inner {
  padding: 10px 12px 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* Wide: 3-column side by side */
@media (min-width: 640px) {
  .inner {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
  }
  .char-col {
    padding: 0 14px;
  }
  .char-col:first-child { padding-left: 0; }
  .char-col:last-child  { padding-right: 0; }
  .char-combat-col,
  .char-skills-col {
    border-left: 1px solid var(--border);
  }
}

.char-col { display: flex; flex-direction: column; gap: 10px; }

/* Divider title for col 2 & 3 */
.col-title {
  font-size: 7px;
  color: var(--text-dim);
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}

.char-header { display: flex; align-items: flex-start; gap: 8px; }

/* Class sprite portrait */
.player-sprite-wrap {
  width: 48px;
  height: 52px;
  flex-shrink: 0;
  position: relative;
  overflow: visible;
}
.pixel-sprite {
  width: 4px;
  height: 4px;
  position: absolute;
  top: 0;
  left: 0;
  image-rendering: pixelated;
}
.player-sprite-wrap.attacking .pixel-sprite {
  animation: player-attack 320ms ease-out forwards;
}
.player-sprite-wrap.hit .pixel-sprite {
  animation: player-hit 180ms ease-out forwards;
}
@keyframes player-attack {
  0%   { transform: translateX(0)    translateY(0); }
  30%  { transform: translateX(8px)  translateY(-2px); }
  70%  { transform: translateX(-3px) translateY(0); }
  100% { transform: translateX(0)    translateY(0); }
}
@keyframes player-hit {
  0%, 100% { filter: brightness(1); }
  35%      { filter: brightness(8) saturate(0) sepia(1) hue-rotate(200deg); }
}

.char-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; justify-content: center; }
.char-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.char-name { font-size: 11px; color: var(--text-hi); line-height: 1.6; }
.char-level { font-size: 9px; color: var(--gold); white-space: nowrap; }
.class-badge {
  font-size: 7px;
  padding: 2px 4px;
  border: 1px solid;
  line-height: 1;
}
.class-warrior   { color: #e88040; border-color: #804020; background: rgba(80,30,0,0.4); }
.class-rogue     { color: #a060d8; border-color: #502880; background: rgba(40,10,60,0.4); }
.class-mage      { color: #4090e0; border-color: #204880; background: rgba(10,20,60,0.4); }
.class-priest    { color: #e0c060; border-color: #806020; background: rgba(80,60,0,0.4); }
.class-undead    { color: #60c040; border-color: #206010; background: rgba(10,40,5,0.4); }
.class-dragonkin { color: #e06030; border-color: #803010; background: rgba(80,20,5,0.4); }
.bars { display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: flex; align-items: center; gap: 8px; }
.bar-lbl { font-size: 8px; color: var(--text); width: 18px; flex-shrink: 0; }
.bar-val { font-size: 8px; color: var(--text); width: 64px; text-align: right; flex-shrink: 0; }
.stats-row { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border); }
.stats { display: flex; gap: 12px; flex-wrap: wrap; }
.stat { font-size: 8px; color: var(--text-dim); }
.stat b { color: var(--text); font-weight: normal; }
.gold { font-size: 8px; color: var(--gold); }

.cs-live-badge {
  background: #30a060;
  color: #000;
  font-size: 5px;
  padding: 1px 3px;
  display: inline-block;
  vertical-align: middle;
}
.cs-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 5px 10px;
}
.cs-label { font-size: 7px; color: var(--text-dim); }
.cs-value { font-size: 7px; color: var(--text); text-align: right; }

.skill-pts-badge {
  background: var(--gold);
  color: #000;
  font-size: 6px;
  padding: 1px 4px;
  display: inline-block;
}
.skills-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.skill-flash {
  font-size: 7px;
  color: #e06060;
  text-align: center;
  display: block;
}
.skill-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  padding: 5px 6px;
}
.skill-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.skill-name { font-size: 7px; color: var(--text-hi); }
.skill-desc { font-size: 6px; color: var(--text-dim); }
.skill-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.skill-level { font-size: 7px; color: var(--gold); white-space: nowrap; }
.skill-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  background: #2a2850;
  color: var(--gold);
  border: 2px solid var(--border);
  width: 22px;
  height: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 1px 1px 0 #000;
}
.skill-btn:hover:not(:disabled) { border-color: var(--gold); }
.skill-btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
