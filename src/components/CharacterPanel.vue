<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useZoneStore } from '../stores/zone'
import { useCombatStore } from '../stores/combat'
import { usePrestigeStore } from '../stores/prestige'
import { CLASS_DEFINITIONS } from '../game/classes'
import { getUpgradeBonuses } from '../game/upgrades'
import { getActiveSet } from '../game/sets'
import { getSpecial } from '../game/formulas'
import { buildClassSpriteStyle } from '../game/class-sprites'
import { fmtNum } from '../utils/format'
import { LS_KEYS } from '../utils/storage'
import type { ZoneId } from '../types/index'

const characterStore = useCharacterStore()
const zoneStore = useZoneStore()
const combatStore = useCombatStore()
const prestigeStore = usePrestigeStore()
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

const activeSet = computed(() => {
  if (!char.value) return null
  return getActiveSet(char.value.gear.weapon, char.value.gear.armor)
})

const combatStats = computed(() => {
  if (!char.value) return null
  const { class: classId, stats } = char.value
  const passives = CLASS_DEFINITIONS[classId].passives
  const zone = zoneStore.activeZone
  const avgDef = ZONE_AVG_DEF[zone]
  const ub = getUpgradeBonuses(char.value.upgrades ?? {})
  const setBonus = activeSet.value?.bonus ?? null

  // Use current enemy's actual DEF when in combat, zone average otherwise
  const activeDef = combatStore.currentEnemy?.def ?? avgDef
  const vsEnemy = activeDef !== avgDef

  // Weapon
  const wep = characterStore.effectiveWeaponStats
  const weaponMin = wep?.minDmg ?? 1
  const weaponMax = wep?.maxDmg ?? 3
  const statBonus = CLASS_DEFINITIONS[classId].damageStat === 'int' ? stats.int : stats.str

  // DPS vs active target (no crit)
  const defIgnoreBase = passives.defIgnore ?? 0
  const defIgnore = Math.min(0.9, defIgnoreBase + ub.defIgnoreBonus)
  const effEnemyDef = Math.floor(activeDef * (1 - defIgnore))
  const minDPS = Math.max(1, weaponMin + statBonus - effEnemyDef)
  const maxDPS = Math.max(1, weaponMax + statBonus - effEnemyDef)

  // Crit chance
  const baseCritThreshold = passives.critThreshold ?? 20
  const effectiveCritThreshold = Math.max(2, baseCritThreshold - ub.critThresholdReduction)
  const critPct = Math.round((21 - effectiveCritThreshold) / 20 * 100)

  // Crit multiplier
  const setCritDamage = setBonus?.type === 'crit_damage' ? setBonus.value : 0
  const critMultiplier = 1.5 + ub.critDamageBonus + setCritDamage

  // Hit chance
  const hitPct = Math.min(95, Math.max(5, Math.round((21 - activeDef + stats.dex) / 20 * 100)))

  // Effective player DEF
  const baseArmorDef = characterStore.effectiveArmorStats?.defBonus ?? 0
  const armorEff = passives.armorEffectiveness ?? 1.0
  const setFlatDef = setBonus?.type === 'flat_def' ? setBonus.value : 0
  const effDef = Math.floor(baseArmorDef * armorEff) + ub.flatDef + setFlatDef

  // Dodge & block (weapon + armor specials + upgrade bonuses)
  const weapon = char.value.gear.weapon
  const armor = char.value.gear.armor
  const weaponDodge = getSpecial(weapon?.stats.special, 'dodge')?.chance ?? 0
  const weaponBlock = getSpecial(weapon?.stats.special, 'block')?.chance ?? 0
  const armorDodge = getSpecial(armor?.stats.special, 'dodge')?.chance ?? 0
  const armorBlock = getSpecial(armor?.stats.special, 'block')?.chance ?? 0
  const setDodge = setBonus?.type === 'dodge' ? setBonus.value : 0
  const effDodge = Math.round(Math.min(0.75, weaponDodge + armorDodge + ub.dodgeBonus + setDodge) * 100)
  const effBlock = Math.round(Math.min(0.75, weaponBlock + armorBlock + ub.blockBonus) * 100)

  // Lifesteal (weapon + armor specials + upgrades)
  const weaponLifesteal = getSpecial(weapon?.stats.special, 'lifesteal')?.value ?? 0
  const armorLifesteal  = getSpecial(armor?.stats.special,  'lifesteal')?.value ?? 0
  const setLifesteal = setBonus?.type === 'lifesteal' ? setBonus.value : 0
  const effLifesteal = Math.round((weaponLifesteal + armorLifesteal + ub.lifestealBonus + setLifesteal) * 100)

  // DEF ignore %
  const defIgnorePct = Math.round(defIgnore * 100)

  // Spell amp (mage/priest only)
  const isSpellClass = CLASS_DEFINITIONS[classId].damageStat === 'int'
  const setSpellAmp = setBonus?.type === 'spell_amp' ? setBonus.value : 0
  const weaponSpellAmp = getSpecial(weapon?.stats.special, 'spellAmp')?.percent ?? 0
  const armorSpellAmp  = getSpecial(armor?.stats.special,  'spellAmp')?.percent ?? 0
  const effSpellAmp = isSpellClass
    ? Math.round((weaponSpellAmp + armorSpellAmp + ub.spellAmpBonus + setSpellAmp) * 100)
    : 0

  return { minDPS, maxDPS, critPct, critMultiplier, hitPct, effDef, effDodge, effBlock, effLifesteal, defIgnorePct, effSpellAmp, vsEnemy }
})

// ── Upgrades summary pills ────────────────────────────────────────────────────

const upgradesSummary = computed(() => {
  if (!char.value) return [] as { label: string; tip: string }[]
  const ub = getUpgradeBonuses(char.value.upgrades ?? {})
  const pills: { label: string; tip: string }[] = []
  if (ub.flatDef > 0)               pills.push({ label: `+${ub.flatDef} DEF`,                               tip: 'Iron Skin: bonus flat DEF that reduces all incoming damage' })
  if (ub.critDamageBonus > 0)       pills.push({ label: `+${Math.round(ub.critDamageBonus * 100)}% crit`,   tip: 'Lucky Strike: crit damage multiplier bonus (base 1.5×)' })
  if (ub.lifestealBonus > 0)        pills.push({ label: `+${Math.round(ub.lifestealBonus * 100)}% lifesteal`, tip: 'Blood Drinker: % of damage dealt restored as HP' })
  if (ub.spellAmpBonus > 0)         pills.push({ label: `+${Math.round(ub.spellAmpBonus * 100)}% spell`,    tip: 'Spell Surge: bonus spell damage multiplier (Mage/Priest only)' })
  if (ub.dodgeBonus > 0)            pills.push({ label: `+${Math.round(ub.dodgeBonus * 100)}% dodge`,       tip: 'Shadow Step: chance to completely avoid an incoming attack' })
  if (ub.blockBonus > 0)            pills.push({ label: `+${Math.round(ub.blockBonus * 100)}% block`,       tip: 'Shield Wall: chance to reduce an incoming attack to 1 damage' })
  if (ub.defIgnoreBonus > 0)        pills.push({ label: `+${Math.round(ub.defIgnoreBonus * 100)}% pierce`,  tip: 'Armor Pierce: % of enemy DEF bypassed when dealing damage' })
  if (ub.regenOnKillBonus > 0)      pills.push({ label: `+${Math.round(ub.regenOnKillBonus * 100)}% regen`, tip: 'Predator: % chance to regenerate HP on each kill' })
  if (ub.attackSpeedReduction > 0)  pills.push({ label: `−${ub.attackSpeedReduction}ms atk`,                tip: 'Swift Strikes: attack speed reduction (lower is faster)' })
  return pills
})

// ── Set bonus label ───────────────────────────────────────────────────────────

const setBonusLabel = computed(() => {
  const s = activeSet.value
  if (!s) return null
  const b = s.bonus
  switch (b.type) {
    case 'damage_pct':   return `+${Math.round(b.value * 100)}% dmg`
    case 'flat_def':     return `+${b.value} DEF`
    case 'lifesteal':    return `+${Math.round(b.value * 100)}% lifesteal`
    case 'crit_damage':  return `+${Math.round(b.value * 100)}% crit mult`
    case 'dodge':        return `+${Math.round(b.value * 100)}% dodge`
    case 'atk_speed':    return `−${b.value}ms atk`
    case 'spell_amp':    return `+${Math.round(b.value * 100)}% spell amp`
    case 'hp_regen_pct': return `+${Math.round(b.value * 100)}% regen chance`
  }
})

const damageStat = computed(() =>
  char.value ? CLASS_DEFINITIONS[char.value.class].damageStat.toUpperCase() : '',
)

const collapsed = ref(localStorage.getItem(LS_KEYS.collapsed.character) === 'true')
function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem(LS_KEYS.collapsed.character, String(collapsed.value))
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
            <span v-if="prestigeStore.prestigeCount > 0" class="prestige-badge">⚡×{{ prestigeStore.prestigeCount }}</span>
            <div class="dmg-stat-label">Dmg stat: <span class="dmg-stat-hi">{{ damageStat }}</span></div>
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
            <span class="stat" data-tip="Physical damage bonus for Warrior, Rogue, Undead, Dragonkin">STR <b>{{ char.stats.str }}</b></span>
            <span class="stat" data-tip="Hit chance. Roll + DEX must meet enemy DEF to land an attack">DEX <b>{{ char.stats.dex }}</b></span>
            <span class="stat" data-tip="Spell damage bonus for Mage and Priest only">INT <b>{{ char.stats.int }}</b></span>
          </div>
          <span class="gold">{{ fmtNum(char.gold) }}g</span>
        </div>

        <!-- Upgrades summary -->
        <div v-if="upgradesSummary.length > 0" class="upgrades-summary">
          <span v-for="pill in upgradesSummary" :key="pill.label" class="upg-pill" :data-tip="pill.tip">{{ pill.label }}</span>
        </div>

      </div>

      <!-- Col 2: Combat Stats + Set Bonus -->
      <div v-if="combatStats" class="char-col char-combat-col">
        <div class="col-title">
          Combat Stats
          <span v-if="combatStats.vsEnemy" class="cs-live-badge">live</span>
        </div>
        <div class="cs-grid">
          <span class="cs-label" data-tip="Weapon damage range after stat bonuses and off-class penalty">DMG</span>
          <span class="cs-value">{{ combatStats.minDPS }}–{{ combatStats.maxDPS }}</span>
          <span class="cs-label" data-tip="You crit when your d20 roll meets or exceeds this number">CRIT</span>
          <span class="cs-value">{{ combatStats.critPct }}%</span>
          <span class="cs-label" data-tip="Crit damage multiplier (base 1.5×, stacks with upgrades)">CRIT MULT</span>
          <span class="cs-value">{{ combatStats.critMultiplier.toFixed(1) }}×</span>
          <span class="cs-label" data-tip="Hit chance. Roll + DEX must meet enemy DEF to land an attack">HIT</span>
          <span class="cs-value">{{ combatStats.hitPct }}%</span>
          <span class="cs-label" data-tip="Reduces incoming damage. Enemy raw damage − DEF, minimum 1">DEF</span>
          <span class="cs-value">{{ combatStats.effDef }}</span>
          <template v-if="combatStats.effDodge > 0">
            <span class="cs-label" data-tip="Chance to completely avoid an incoming attack">DODGE</span>
            <span class="cs-value">{{ combatStats.effDodge }}%</span>
          </template>
          <template v-if="combatStats.effBlock > 0">
            <span class="cs-label" data-tip="Chance to reduce an incoming attack to 1 damage">BLOCK</span>
            <span class="cs-value">{{ combatStats.effBlock }}%</span>
          </template>
          <template v-if="combatStats.effLifesteal > 0">
            <span class="cs-label" data-tip="% of damage dealt restored as HP on each hit">LIFESTEAL</span>
            <span class="cs-value">{{ combatStats.effLifesteal }}%</span>
          </template>
          <template v-if="combatStats.defIgnorePct > 0">
            <span class="cs-label" data-tip="% of enemy DEF bypassed when calculating your damage">DEF IGNORE</span>
            <span class="cs-value">{{ combatStats.defIgnorePct }}%</span>
          </template>
          <template v-if="combatStats.effSpellAmp > 0">
            <span class="cs-label" data-tip="Bonus damage multiplier on spells (Mage/Priest only)">SPELL AMP</span>
            <span class="cs-value">{{ combatStats.effSpellAmp }}%</span>
          </template>
        </div>

        <!-- Set Bonus -->
        <template v-if="activeSet && setBonusLabel">
          <div class="set-bonus-row">
            <span class="set-icon">✦</span>
            <span class="set-name">{{ activeSet.name }}</span>
            <span class="set-val">{{ setBonusLabel }}</span>
          </div>
        </template>
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

/* Wide: 2-column — identity gets more room */
@media (min-width: 640px) {
  .inner {
    grid-template-columns: 2fr 1.5fr;
    gap: 0;
  }
  .char-col {
    padding: 0 14px;
    min-width: 0;
  }
  .char-col:first-child { padding-left: 0; }
  .char-col:last-child  { padding-right: 0; }
  .char-combat-col {
    border-left: 1px solid var(--border);
  }
}

.char-col { display: flex; flex-direction: column; gap: 10px; }

/* Divider title for col 2 */
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

.char-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; justify-content: center; overflow: hidden; }
.char-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.char-name { font-size: 11px; color: var(--text-hi); line-height: 1.6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.char-level { font-size: 9px; color: var(--gold); white-space: nowrap; }
.prestige-badge { font-size: 7px; color: #b080ff; white-space: nowrap; }
.dmg-stat-label { font-size: 6px; color: var(--text-dim); white-space: nowrap; }
.dmg-stat-hi { color: var(--text); }
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
.bar-val { font-size: 8px; color: var(--text); min-width: 48px; text-align: right; flex-shrink: 0; white-space: nowrap; }
.stats-row { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border); }
.stats { display: flex; gap: 12px; flex-wrap: wrap; }
.stat { font-size: 8px; color: var(--text-dim); position: relative; }
.stat b { color: var(--text); font-weight: normal; }
.gold { font-size: 8px; color: var(--gold); }

/* Upgrades summary pills */
.upgrades-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}
.upg-pill {
  font-size: 6px;
  color: #80d0a0;
  background: rgba(80, 180, 100, 0.08);
  border: 1px solid rgba(80, 180, 100, 0.25);
  padding: 1px 4px;
  white-space: nowrap;
}

/* Combat stats */
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
.cs-label {
  font-size: 7px;
  color: var(--text-dim);
  position: relative;
  cursor: default;
}
.cs-value { font-size: 7px; color: var(--text); text-align: right; }

/* ── data-tip tooltip (shared by cs-label, .stat, .upg-pill) ─────────────── */
[data-tip] {
  position: relative;
  cursor: help;
}

[data-tip]::after {
  content: attr(data-tip);
  position: absolute;
  left: 0;
  bottom: calc(100% + 5px);
  z-index: 300;
  width: max-content;
  max-width: 200px;
  padding: 5px 8px;
  background: #1a1830;
  border: 1px solid var(--border-hi, #4a4060);
  color: var(--text, #d0c8e8);
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  line-height: 1.6;
  white-space: normal;
  word-break: break-word;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.1s;
  box-shadow: 2px 2px 0 #000;
}

[data-tip]:hover::after {
  opacity: 1;
}

/* Set bonus */
.set-bonus-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 6px;
  background: rgba(255, 200, 60, 0.06);
  border: 1px solid rgba(255, 200, 60, 0.22);
  margin-top: auto;
}
.set-icon { font-size: 8px; color: var(--gold); flex-shrink: 0; }
.set-name { font-size: 6px; color: var(--gold); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.set-val  { font-size: 6px; color: #80d0a0; flex-shrink: 0; white-space: nowrap; }

</style>
