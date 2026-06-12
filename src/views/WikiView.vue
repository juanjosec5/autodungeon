<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ENEMY_DEFINITIONS } from '../game/enemies'
import type { ZoneId } from '../types/index'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

type TabId = 'changelog' | 'classes' | 'zones' | 'combat' | 'items' | 'ascension'

const activeTab = ref<TabId>('changelog')

const tabs: { id: TabId; label: string }[] = [
  { id: 'changelog', label: 'Changelog' },
  { id: 'classes',   label: 'Classes'   },
  { id: 'zones',     label: 'Zones'     },
  { id: 'combat',    label: 'Combat'    },
  { id: 'items',     label: 'Items'     },
  { id: 'ascension', label: 'Ascension' },
]

// Zone table data — derived from ENEMY_DEFINITIONS so it can never go stale.
// HP shown is the in-combat value (normals ×2.2; boss HP is final).
const NORMAL_HP_MULT = 2.2

interface ZoneMeta { id: ZoneId; label: string; unlock: number; lootCap: string; capClass: string }
const ZONE_TABLE: ZoneMeta[] = [
  { id: 'forest',      label: '🌲 Forest',      unlock: 1,  lootCap: 'Rare',      capClass: 'rarity-rare' },
  { id: 'dungeon',     label: '🏰 Dungeon',     unlock: 8,  lootCap: 'Epic',      capClass: 'rarity-epic' },
  { id: 'volcano',     label: '🌋 Volcano',     unlock: 20, lootCap: 'Legendary', capClass: 'rarity-legendary' },
  { id: 'abyss',       label: '🌑 Abyss',       unlock: 35, lootCap: 'Legendary', capClass: 'rarity-legendary' },
  { id: 'shadowrealm', label: '👁 Shadowrealm', unlock: 50, lootCap: 'Legendary', capClass: 'rarity-legendary' },
  { id: 'celestial',   label: '✨ Celestial',   unlock: 65, lootCap: 'Legendary', capClass: 'rarity-legendary' },
  { id: 'void',        label: '🌀 Void',        unlock: 80, lootCap: 'Legendary', capClass: 'rarity-legendary' },
  { id: 'nightmare',   label: '💀 Nightmare',   unlock: 95, lootCap: 'Legendary', capClass: 'rarity-legendary' },
]

function bossNameFor(zone: ZoneId): string {
  return ENEMY_DEFINITIONS.find((e) => e.zone === zone && e.isBoss)?.name ?? ''
}

function enemyRowsFor(zone: ZoneId) {
  return ENEMY_DEFINITIONS
    .filter((e) => e.zone === zone)
    .map((e) => ({
      name: e.isBoss ? `★ ${e.name}` : e.name,
      hp: e.isBoss ? e.maxHp : Math.floor(e.maxHp * NORMAL_HP_MULT),
      atk: `${e.atk[0]}–${e.atk[1]}`,
      def: e.def,
      xp: e.xpReward,
      spd: e.attackSpeed,
      isBoss: e.isBoss ?? false,
    }))
}

// Zones collapse state
const expandedZones = ref<Set<string>>(new Set())
function toggleZone(zone: string) {
  if (expandedZones.value.has(zone)) {
    expandedZones.value.delete(zone)
  } else {
    expandedZones.value.add(zone)
  }
}
</script>

<template>
  <div class="wiki-wrap">
    <!-- Back button -->
    <button class="pixel-btn back-btn" @click="goBack">← Back</button>

    <!-- Title -->
    <h1 class="wiki-title">AUTODUNGEON WIKI</h1>

    <!-- Tab row -->
    <div class="tab-row">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { 'tab-active': activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
    </div>

    <!-- ═══════════════ CHANGELOG ═══════════════ -->
    <div v-if="activeTab === 'changelog'" class="pixel-panel tab-content">

      <div class="cl-entry">
        <div class="cl-header">
          <span class="cl-version">v2.0</span>
          <span class="cl-date">Jun 2026</span>
        </div>
        <ul class="cl-list">
          <li>Item stats reworked onto smooth zone/rarity curves — no more progression cliffs</li>
          <li>Enemy rescale: every class now hits reliably at zone level; boss fights last 15–120s</li>
          <li>Special effect caps (spellAmp 50%, defIgnore 60%, lifesteal 30%, dodge/block 40%)</li>
          <li>Drops rework: per-zone rarity odds, 45% drop chance, direct gold from kills</li>
          <li>Bad-luck protection: guaranteed Rare/Epic/BiS within fixed drop counts</li>
          <li>New loot for Forest, Dungeon &amp; Volcano — zone gear sets + 12 BiS legendaries per zone</li>
          <li>Prestige NG+: each prestige raises enemy difficulty and token rewards</li>
          <li>Class Mastery points — spend ascension bonuses on any class, respec anytime</li>
          <li>New token sinks: Transcend (+5 max level) and Loot Mastery (rarity floor)</li>
          <li>Priest regen rebalanced (45% chance, +50% power)</li>
        </ul>
      </div>

      <div class="cl-entry">
        <div class="cl-header">
          <span class="cl-version">v1.5</span>
          <span class="cl-date">Apr 2026</span>
        </div>
        <ul class="cl-list">
          <li>Wiki page added with game mechanics, zone data, class info &amp; changelog</li>
        </ul>
      </div>

      <div class="cl-entry">
        <div class="cl-header">
          <span class="cl-version">v1.4</span>
          <span class="cl-date">Apr 2026</span>
        </div>
        <ul class="cl-list">
          <li>Ascension panel stays unlocked after prestiging</li>
          <li>Prestige data now loads correctly on all entry paths</li>
          <li>Combat now correctly pauses when zone-unlock and level-up modals stack</li>
          <li>Head Start bonus now starts at level 5/10/15... (was off-by-one: 6/11/16)</li>
          <li>Vitality HP bonus now persists through all level-ups and armor swaps</li>
          <li>Head Start grants upgrade picks for each skipped level</li>
          <li>Prestige data no longer lost when loading from character selection screen</li>
        </ul>
      </div>

      <div class="cl-entry">
        <div class="cl-header">
          <span class="cl-version">v1.3</span>
          <span class="cl-date">Apr 2026</span>
        </div>
        <ul class="cl-list">
          <li>Progressive panel unlock (Zone@3, Shop/Log@5, Tasks@8, Enchant@10, Challenges@15, Ascend@50)</li>
          <li>Enemy HP buffed 2.2× (bosses 3×) for longer fights</li>
          <li>Level-up auto-pick: replaced countdown with persistent toggle</li>
          <li>Zone challenges: rewards now require manual claiming</li>
          <li>First-time tutorial hints in Items, Shop, and Enchant panels</li>
          <li>Stats clarity: lifesteal, def-ignore, spell-amp displayed when active</li>
          <li>Off-class warning (⚠ 30%) shown on gear in inventory and shop</li>
          <li>Zone indicator added to page header and enemy panel</li>
          <li>Zone unlock rebalance: Dungeon 8, Volcano 20, Abyss 35, Shadowrealm 50, Celestial 65, Void 80, Nightmare 95</li>
        </ul>
      </div>

      <div class="cl-entry">
        <div class="cl-header">
          <span class="cl-version">v1.2</span>
          <span class="cl-date">Apr 2026</span>
        </div>
        <ul class="cl-list">
          <li>Enchanted items sell for 30% of total enchant investment</li>
          <li>Fixed prestige full-reset (speed, zone, combat)</li>
          <li>Fixed zone challenges not resetting on prestige</li>
          <li>Fixed character ID preserved on prestige (no duplicate save slots)</li>
        </ul>
      </div>

      <div class="cl-entry">
        <div class="cl-header">
          <span class="cl-version">v1.1</span>
          <span class="cl-date">Apr 2026</span>
        </div>
        <ul class="cl-list">
          <li>Multi-slot character saves</li>
          <li>Vercel analytics</li>
        </ul>
      </div>

    </div>

    <!-- ═══════════════ CLASSES ═══════════════ -->
    <div v-else-if="activeTab === 'classes'" class="pixel-panel tab-content">

      <p class="section-label">Base Stats (Level 1)</p>
      <div class="tbl-wrap">
        <table class="wiki-table">
          <thead>
            <tr>
              <th>Class</th><th>HP</th><th>STR</th><th>DEX</th><th>INT</th><th>Atk Speed</th><th>Dmg Stat</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Warrior</td><td>120</td><td>8</td><td>4</td><td>2</td><td>1800 ms</td><td>STR</td></tr>
            <tr><td>Rogue</td><td>80</td><td>5</td><td>9</td><td>3</td><td>1100 ms</td><td>DEX</td></tr>
            <tr><td>Mage</td><td>70</td><td>2</td><td>5</td><td>10</td><td>1500 ms</td><td>INT</td></tr>
            <tr><td>Priest</td><td>90</td><td>3</td><td>4</td><td>9</td><td>1600 ms</td><td>INT</td></tr>
            <tr><td>Undead</td><td>100</td><td>9</td><td>4</td><td>3</td><td>1700 ms</td><td>STR</td></tr>
            <tr><td>Dragonkin</td><td>115</td><td>7</td><td>3</td><td>4</td><td>1900 ms</td><td>STR</td></tr>
          </tbody>
        </table>
      </div>

      <p class="section-label" style="margin-top:16px">Class Passives</p>
      <div class="class-grid">
        <div class="pixel-panel class-card">
          <p class="class-name">Warrior</p>
          <ul class="passive-list">
            <li>+10% armor effectiveness</li>
            <li>40% regen on kill</li>
            <li>Crit on natural 20</li>
          </ul>
        </div>
        <div class="pixel-panel class-card">
          <p class="class-name">Rogue</p>
          <ul class="passive-list">
            <li>Crit on roll ≥ 17</li>
            <li>100% crit when DEX ≥ 12</li>
            <li>30% regen on kill</li>
          </ul>
        </div>
        <div class="pixel-panel class-card">
          <p class="class-name">Mage</p>
          <ul class="passive-list">
            <li>Ignore 15% enemy DEF</li>
            <li>30% regen on kill</li>
            <li>Crit on natural 20</li>
          </ul>
        </div>
        <div class="pixel-panel class-card">
          <p class="class-name">Priest</p>
          <ul class="passive-list">
            <li>45% regen on kill</li>
            <li>+50% heal power</li>
            <li>Crit on natural 20</li>
          </ul>
        </div>
        <div class="pixel-panel class-card">
          <p class="class-name">Undead</p>
          <ul class="passive-list">
            <li>10% innate lifesteal</li>
            <li>Crit on roll ≥ 18</li>
            <li>No natural regen on kill</li>
          </ul>
        </div>
        <div class="pixel-panel class-card">
          <p class="class-name">Dragonkin</p>
          <ul class="passive-list">
            <li>+25% armor effectiveness</li>
            <li>30% regen on kill</li>
            <li>Crit on roll ≥ 19</li>
          </ul>
        </div>
      </div>

    </div>

    <!-- ═══════════════ ZONES ═══════════════ -->
    <div v-else-if="activeTab === 'zones'" class="pixel-panel tab-content">

      <p class="section-label">Zone Overview</p>
      <p class="footnote" style="margin-bottom:8px">Click any zone row to expand enemies. HP shown is the in-combat value (normals 2.2× base; boss HP as listed). NG+ tiers multiply HP/ATK further.</p>
      <div class="tbl-wrap">
        <table class="wiki-table">
          <thead>
            <tr><th>Zone</th><th>Unlock Lv</th><th>Loot Cap</th><th>Boss</th></tr>
          </thead>
          <tbody>
            <template v-for="z in ZONE_TABLE" :key="z.id">
              <tr @click="toggleZone(z.id)" class="zone-row" :class="{ 'zone-expanded': expandedZones.has(z.id) }">
                <td>{{ z.label }}</td><td>{{ z.unlock }}</td><td :class="z.capClass">{{ z.lootCap }}</td><td>{{ bossNameFor(z.id) }}</td>
              </tr>
              <tr v-if="expandedZones.has(z.id)" class="zone-detail">
                <td colspan="4">
                  <div class="tbl-wrap">
                    <table class="wiki-table enemy-table">
                      <thead><tr><th>Enemy</th><th>HP</th><th>ATK</th><th>DEF</th><th>XP</th><th>Spd (ms)</th></tr></thead>
                      <tbody>
                        <tr v-for="row in enemyRowsFor(z.id)" :key="row.name" :class="{ 'boss-row': row.isBoss }">
                          <td>{{ row.name }}</td><td>{{ row.hp }}</td><td>{{ row.atk }}</td><td>{{ row.def }}</td><td>{{ row.xp }}</td><td>{{ row.spd }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="pixel-panel loot-rules">
        <p class="section-label">Loot Rules</p>
        <ul class="passive-list">
          <li>Normal kills drop an item <span class="gold-text">45% of the time</span> — and always drop gold directly</li>
          <li>Rarity odds scale per zone: deeper zones drop fewer commons and more epics/legendaries (Nightmare: 8% legendary)</li>
          <li>Legendaries can drop from normal kills from Volcano onward; Forest caps at Rare, Dungeon at Epic</li>
          <li>Boss drops are guaranteed, with a rarity floor: Rare+ from Volcano, Epic+ from Celestial</li>
          <li><span class="gold-text">Bad-luck protection:</span> a Rare+ is guaranteed within 30 drops, an Epic+ within 120 (where the zone allows)</li>
          <li><span class="gold-text">BiS gear: 1/100 chance on every boss kill</span> for a zone-specific best-in-slot Legendary — guaranteed within 150 boss kills</li>
          <li>Click any zone row above to expand its enemy list</li>
        </ul>
      </div>

    </div>

    <!-- ═══════════════ COMBAT ═══════════════ -->
    <div v-else-if="activeTab === 'combat'" class="pixel-panel tab-content">

      <div class="combat-section">
        <p class="section-label">Player Attack Sequence</p>
        <ol class="combat-list">
          <li>Roll d20 + DEX vs enemy DEF → determines hit or miss (5% minimum hit chance)</li>
          <li>Class crit check: Warrior/Mage/Priest on natural 20; Dragonkin ≥ 19; Undead ≥ 18; Rogue ≥ 17 (or when DEX ≥ 12)</li>
          <li>Damage = random roll in weapon (min–max) range + primary damage stat</li>
          <li>Multiply by ×1.5 if critical hit</li>
          <li>Spell Amp applied (Mage only): final × (1 + spellAmp%)</li>
          <li>Subtract floor(enemyDEF × (1 − defIgnore%)), minimum 1 damage</li>
          <li>On-hit effects: lifesteal heals you, poison ticks applied, doublecast fires a second attack</li>
          <li>On-kill effects: class regen chance, regenOnKill item bonuses</li>
        </ol>
      </div>

      <div class="combat-section">
        <p class="section-label">Enemy Attack Sequence</p>
        <ol class="combat-list">
          <li>Dodge check, then block check: either fully negates the attack (each capped at 40%)</li>
          <li>Enemy rolls ATK in (min–max) range</li>
          <li>Subtract player DEF (minimum 1 damage)</li>
          <li>Deal remaining damage to player HP</li>
        </ol>
      </div>

      <div class="combat-section">
        <p class="section-label">Death &amp; Bosses</p>
        <ul class="passive-list">
          <li><span class="gold-text">Death penalty:</span> −10% current XP, −15% current gold, full HP restore</li>
          <li><span class="gold-text">Boss trigger:</span> every 10–15 normal kills spawns the zone boss</li>
          <li><span class="gold-text">Boss reward:</span> guaranteed loot drop with a rarity floor (Rare+ from Volcano, Epic+ from Celestial)</li>
        </ul>
      </div>

    </div>

    <!-- ═══════════════ ITEMS ═══════════════ -->
    <div v-else-if="activeTab === 'items'" class="pixel-panel tab-content">

      <p class="section-label">Rarity &amp; Prices</p>
      <div class="tbl-wrap">
        <table class="wiki-table">
          <thead>
            <tr><th>Rarity</th><th>Drop % (Forest → Nightmare)</th><th>Sell*</th><th>Buy (Shop)*</th></tr>
          </thead>
          <tbody>
            <tr>
              <td class="rarity-common">Common</td>
              <td>70% → 16%</td><td>5g</td><td>40g</td>
            </tr>
            <tr>
              <td class="rarity-uncommon">Uncommon</td>
              <td>24% → 24%</td><td>15g</td><td>120g</td>
            </tr>
            <tr>
              <td class="rarity-rare">Rare</td>
              <td>6% → 30%</td><td>40g</td><td>320g</td>
            </tr>
            <tr>
              <td class="rarity-epic">Epic</td>
              <td>0% → 22%</td><td>120g</td><td>960g</td>
            </tr>
            <tr>
              <td class="rarity-legendary">Legendary</td>
              <td>0% → 8%</td><td>500g</td><td>4000g</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="footnote">* Base prices at zone tier 0 — all prices scale ×1.5 per zone tier of the item. Rarity odds rise smoothly through the 8 zones; Legendary drops start in Volcano. BiS Legendaries drop only from bosses (1/100, guaranteed within 150 boss kills).</p>

      <p class="section-label" style="margin-top:16px">Off-Class Penalty</p>
      <div class="pixel-panel offclass-box">
        <ul class="passive-list">
          <li>Correct class or class-agnostic gear → no penalty (×1.0 stats)</li>
          <li>Wrong class gear → ×0.7 to all stats (shown with ⚠ in inventory)</li>
          <li>Legendary items from another class → cannot be equipped at all</li>
        </ul>
      </div>

      <p class="section-label" style="margin-top:16px">Special Effects</p>
      <div class="tbl-wrap">
        <table class="wiki-table">
          <thead>
            <tr><th>Effect</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td class="gold-text">Lifesteal</td><td>Heal for a % of damage dealt on each hit</td></tr>
            <tr><td class="gold-text">Poison</td><td>Apply a damage-over-time tick on hit</td></tr>
            <tr><td class="gold-text">Doublecast</td><td>Chance to fire a second attack immediately after hitting</td></tr>
            <tr><td class="gold-text">Spell Amp</td><td>Increase spell damage by % (Mage only)</td></tr>
            <tr><td class="gold-text">Def Ignore</td><td>Bypass a % of enemy defense when dealing damage</td></tr>
            <tr><td class="gold-text">Dodge</td><td>Chance to completely avoid an incoming enemy attack</td></tr>
            <tr><td class="gold-text">Regen on Kill</td><td>Restore a flat HP amount upon killing an enemy</td></tr>
            <tr><td class="gold-text">Crit Bonus</td><td>Increase the critical hit damage multiplier</td></tr>
            <tr><td class="gold-text">HP Boost</td><td>Add flat HP to your maximum health pool</td></tr>
            <tr><td class="gold-text">Gold Find</td><td>Increase gold gained from kills by a %</td></tr>
          </tbody>
        </table>
      </div>

      <div class="pixel-panel offclass-box" style="margin-top:12px">
        <p class="section-label">Enchanting</p>
        <ul class="passive-list">
          <li>Add or reroll a special effect on any item you own</li>
          <li>Enchant cost grows ×1.6 with each additional enchant, and scales with the item's zone tier</li>
          <li>Enchanted items sell for base value + 30% of total enchant investment</li>
          <li>Unlocked at level 10</li>
        </ul>
      </div>

    </div>

    <!-- ═══════════════ ASCENSION ═══════════════ -->
    <div v-else-if="activeTab === 'ascension'" class="pixel-panel tab-content">

      <div class="pixel-panel offclass-box">
        <p class="section-label">How Ascension Works</p>
        <ul class="passive-list">
          <li>Unlocked by reaching <span class="gold-text">level 50</span></li>
          <li>Tokens earned per prestige = <span class="gold-text">floor(level / 10 × (1 + 0.5 × NG+ tier))</span></li>
          <li>Each prestige raises the <span class="gold-text">NG+ tier</span>: enemies gain +12% HP and +10% ATK per tier (compounding), and XP/gold rewards rise +10% per tier to match</li>
          <li><span class="gold-text">NG+ Attunement</span>: you gain +10% damage and +10% max HP per NG+ tier, automatically</li>
          <li>Each prestige also grants 1 <span class="gold-text">Mastery Point</span> to spend on any class's mastery bonus</li>
          <li>Spend tokens on permanent bonuses that persist across all future runs — each stack costs ×1.5 more than the last</li>
          <li>Ascension panel stays unlocked permanently after your first prestige</li>
        </ul>
      </div>

      <p class="section-label" style="margin-top:16px">Ascension Bonuses</p>
      <div class="tbl-wrap">
        <table class="wiki-table">
          <thead>
            <tr><th>Bonus</th><th>Base Cost</th><th>Max Stacks</th><th>Effect</th></tr>
          </thead>
          <tbody>
            <tr><td class="gold-text">XP Boost</td><td>2 ⚡</td><td>8</td><td>+20% XP per stack</td></tr>
            <tr><td class="gold-text">Gold Boost</td><td>2 ⚡</td><td>8</td><td>+20% gold per stack</td></tr>
            <tr><td class="gold-text">Offline Efficiency</td><td>3 ⚡</td><td>10</td><td>+10% offline kill rate per stack</td></tr>
            <tr><td class="gold-text">Head Start</td><td>5 ⚡</td><td>5</td><td>Start new runs at level 5 / 10 / 15...</td></tr>
            <tr><td class="gold-text">Vitality</td><td>2 ⚡</td><td>12</td><td>+10% max HP per stack</td></tr>
            <tr><td class="gold-text">Fortune</td><td>4 ⚡</td><td>5</td><td>+10% item drop chance per stack</td></tr>
            <tr><td class="gold-text">Transcend</td><td>25 ⚡</td><td>5</td><td>+5 max level per stack (100 → 125)</td></tr>
            <tr><td class="gold-text">Loot Mastery</td><td>10 ⚡</td><td>2</td><td>Minimum drop rarity: uncommon, then rare</td></tr>
          </tbody>
        </table>
      </div>

      <div class="carry-grid" style="margin-top:16px">
        <div class="pixel-panel carry-box">
          <p class="section-label carry-title keep">Carries Over</p>
          <ul class="passive-list">
            <li>Ascension tokens, bonuses &amp; mastery points</li>
            <li>Stat upgrade picks (skill points)</li>
            <li>Lifetime stats (kills, time played, gold earned)</li>
            <li>Items Codex (discovered items log)</li>
            <li>Character name &amp; class</li>
          </ul>
        </div>
        <div class="pixel-panel carry-box">
          <p class="section-label carry-title reset">Resets</p>
          <ul class="passive-list">
            <li>Level, XP, gold</li>
            <li>Gear &amp; inventory</li>
            <li>Zone challenge progress</li>
            <li>Loot pity counters</li>
          </ul>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.wiki-wrap {
  min-height: 100vh;
  padding: 12px;
  max-width: 72rem;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-x: hidden;
}

.back-btn {
  margin-bottom: 12px;
}

.wiki-title {
  font-size: 12px;
  color: var(--gold);
  text-align: center;
  margin: 0 0 14px;
  letter-spacing: 1px;
}

/* Tabs */
.tab-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.tab-btn {
  font-family: inherit;
  font-size: 7px;
  padding: 5px 8px;
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text-dim);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn:hover {
  color: var(--gold);
  border-color: var(--gold);
}

.tab-active {
  color: var(--gold) !important;
  border-color: var(--gold) !important;
}

/* Content panel */
.tab-content {
  font-size: 7px;
  padding: 12px;
}

/* Section label */
.section-label {
  font-size: 7px;
  color: var(--gold);
  margin: 0 0 8px;
  letter-spacing: 0.5px;
}

/* ── Changelog ── */
.cl-entry {
  border-left: 3px solid var(--gold);
  padding-left: 10px;
  margin-bottom: 14px;
}

.cl-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 5px;
}

.cl-version {
  font-size: 8px;
  color: var(--gold);
}

.cl-date {
  font-size: 6px;
  color: var(--text-dim);
}

.cl-list {
  margin: 0;
  padding-left: 12px;
  list-style: disc;
}

.cl-list li {
  color: var(--text-dim);
  margin-bottom: 3px;
  line-height: 1.6;
}

/* ── Tables ── */
.tbl-wrap {
  overflow-x: auto;
}

.wiki-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 7px;
  min-width: 300px;
}

.wiki-table th {
  background: var(--panel);
  color: var(--gold);
  padding: 5px 7px;
  border: 1px solid var(--border);
  text-align: left;
  font-size: 7px;
}

.wiki-table td {
  border: 1px solid var(--border);
  padding: 4px 7px;
  line-height: 1.4;
}

.wiki-table tbody tr:nth-child(even) {
  background: var(--panel);
}

.wiki-table tbody tr:nth-child(odd) {
  background: #100e20;
}

/* ── Zone rows ── */
.zone-row {
  cursor: pointer;
}

.zone-row:hover td {
  color: var(--gold);
}

.zone-expanded td {
  color: var(--gold);
}

.zone-detail td {
  background: #0d0b18 !important;
  padding: 6px;
}

.enemy-table {
  min-width: 260px;
  margin: 4px 0;
}

.boss-row td {
  color: #987820;
  font-style: italic;
}

.coming-soon {
  color: var(--text-dim);
  font-style: italic;
}

.loot-rules {
  margin-top: 12px;
  font-size: 7px;
  padding: 10px;
}

/* ── Classes ── */
.class-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.class-card {
  padding: 10px;
}

.class-name {
  font-size: 7px;
  color: var(--gold);
  margin: 0 0 6px;
}

.passive-list {
  margin: 0;
  padding-left: 12px;
  list-style: disc;
}

.passive-list li {
  color: var(--text-dim);
  margin-bottom: 3px;
  line-height: 1.6;
}

/* ── Combat ── */
.combat-section {
  margin-bottom: 16px;
}

.combat-list {
  margin: 0;
  padding-left: 14px;
  list-style: decimal;
}

.combat-list li {
  color: var(--text-dim);
  margin-bottom: 4px;
  line-height: 1.7;
}

/* ── Items ── */
.footnote {
  font-size: 6px;
  color: var(--text-dim);
  margin: 4px 0 0;
  font-style: italic;
}

.offclass-box {
  padding: 10px;
  font-size: 7px;
}

/* ── Ascension ── */
.carry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.carry-box {
  padding: 10px;
}

.carry-title {
  margin-bottom: 6px;
}

.carry-title.keep {
  color: #4aab4a;
}

.carry-title.reset {
  color: #cc4444;
}

/* ── Rarity colors ── */
.rarity-common   { color: var(--text-dim); }
.rarity-uncommon { color: #2d7a30; }
.rarity-rare     { color: #2a5898; }
.rarity-epic     { color: #80306a; }
.rarity-legendary{ color: #987820; }

.gold-text { color: var(--gold); }

@media (max-width: 480px) {
  .class-grid,
  .carry-grid {
    grid-template-columns: 1fr;
  }

  .tab-row {
    gap: 3px;
  }

  .tab-btn {
    font-size: 6px;
    padding: 4px 6px;
  }
}
</style>
