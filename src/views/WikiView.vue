<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
            <li>70% regen on kill</li>
            <li>+40% heal power</li>
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
      <div class="tbl-wrap">
        <table class="wiki-table">
          <thead>
            <tr><th>Zone</th><th>Unlock Lv</th><th>Loot Cap</th><th>Boss</th></tr>
          </thead>
          <tbody>
            <tr @click="toggleZone('forest')" class="zone-row" :class="{ 'zone-expanded': expandedZones.has('forest') }">
              <td>🌲 Forest</td><td>1</td><td class="rarity-rare">Rare</td><td>—</td>
            </tr>
            <tr v-if="expandedZones.has('forest')" class="zone-detail">
              <td colspan="4">
                <div class="tbl-wrap">
                  <table class="wiki-table enemy-table">
                    <thead><tr><th>Enemy</th><th>HP</th><th>ATK</th><th>DEF</th><th>XP</th><th>Gold</th></tr></thead>
                    <tbody>
                      <tr><td>Goblin</td><td>22</td><td>2–5</td><td>1</td><td>8</td><td>3</td></tr>
                      <tr><td>Slime</td><td>16</td><td>1–3</td><td>0</td><td>5</td><td>2</td></tr>
                      <tr><td>Wolf</td><td>28</td><td>3–6</td><td>2</td><td>12</td><td>4</td></tr>
                      <tr><td>Bandit</td><td>35</td><td>4–8</td><td>3</td><td>15</td><td>6</td></tr>
                      <tr><td>Treant</td><td>55</td><td>5–10</td><td>4</td><td>22</td><td>8</td></tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>

            <tr @click="toggleZone('dungeon')" class="zone-row" :class="{ 'zone-expanded': expandedZones.has('dungeon') }">
              <td>🏰 Dungeon</td><td>8</td><td class="rarity-epic">Epic</td><td>—</td>
            </tr>
            <tr v-if="expandedZones.has('dungeon')" class="zone-detail">
              <td colspan="4">
                <div class="tbl-wrap">
                  <table class="wiki-table enemy-table">
                    <thead><tr><th>Enemy</th><th>HP</th><th>ATK</th><th>DEF</th><th>XP</th><th>Gold</th></tr></thead>
                    <tbody>
                      <tr><td>Skeleton</td><td>70</td><td>6–11</td><td>4</td><td>28</td><td>10</td></tr>
                      <tr><td>Zombie</td><td>88</td><td>7–13</td><td>5</td><td>34</td><td>12</td></tr>
                      <tr><td>Dark Knight</td><td>110</td><td>9–16</td><td>8</td><td>45</td><td>18</td></tr>
                      <tr><td>Gargoyle</td><td>130</td><td>10–18</td><td>10</td><td>52</td><td>22</td></tr>
                      <tr><td>Lich</td><td>165</td><td>12–22</td><td>12</td><td>68</td><td>28</td></tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>

            <tr @click="toggleZone('volcano')" class="zone-row" :class="{ 'zone-expanded': expandedZones.has('volcano') }">
              <td>🌋 Volcano</td><td>20</td><td class="rarity-legendary">Legendary</td><td>Dragon</td>
            </tr>
            <tr v-if="expandedZones.has('volcano')" class="zone-detail">
              <td colspan="4">
                <div class="tbl-wrap">
                  <table class="wiki-table enemy-table">
                    <thead><tr><th>Enemy</th><th>HP</th><th>ATK</th><th>DEF</th><th>XP</th><th>Gold</th></tr></thead>
                    <tbody>
                      <tr><td>Fire Imp</td><td>200</td><td>15–25</td><td>12</td><td>80</td><td>35</td></tr>
                      <tr><td>Lava Golem</td><td>260</td><td>18–30</td><td>16</td><td>100</td><td>44</td></tr>
                      <tr><td>Magma Troll</td><td>320</td><td>22–36</td><td>20</td><td>125</td><td>55</td></tr>
                      <tr><td>Phoenix</td><td>380</td><td>26–42</td><td>22</td><td>150</td><td>65</td></tr>
                      <tr><td>Dragon (Boss)</td><td>1200</td><td>40–65</td><td>35</td><td>500</td><td>200</td></tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>

            <tr @click="toggleZone('abyss')" class="zone-row" :class="{ 'zone-expanded': expandedZones.has('abyss') }">
              <td>🌑 Abyss</td><td>35</td><td class="rarity-legendary">Legendary</td><td>Abyssal Titan</td>
            </tr>
            <tr v-if="expandedZones.has('abyss')" class="zone-detail">
              <td colspan="4">
                <div class="tbl-wrap">
                  <table class="wiki-table enemy-table">
                    <thead><tr><th>Enemy</th><th>HP</th><th>ATK</th><th>DEF</th><th>XP</th><th>Gold</th></tr></thead>
                    <tbody>
                      <tr><td>Void Wraith</td><td>480</td><td>32–52</td><td>26</td><td>200</td><td>85</td></tr>
                      <tr><td>Shadow Demon</td><td>580</td><td>38–60</td><td>30</td><td>240</td><td>100</td></tr>
                      <tr><td>Abyss Crawler</td><td>700</td><td>45–72</td><td>36</td><td>290</td><td>120</td></tr>
                      <tr><td>Dark Leviathan</td><td>850</td><td>52–84</td><td>42</td><td>350</td><td>145</td></tr>
                      <tr><td>Abyssal Titan (Boss)</td><td>2800</td><td>80–120</td><td>60</td><td>1200</td><td>500</td></tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>

            <tr @click="toggleZone('shadowrealm')" class="zone-row" :class="{ 'zone-expanded': expandedZones.has('shadowrealm') }">
              <td>👁 Shadowrealm</td><td>50</td><td class="rarity-legendary">Legendary</td><td>—</td>
            </tr>
            <tr v-if="expandedZones.has('shadowrealm')" class="zone-detail">
              <td colspan="4"><span class="coming-soon">Coming soon</span></td>
            </tr>

            <tr @click="toggleZone('celestial')" class="zone-row" :class="{ 'zone-expanded': expandedZones.has('celestial') }">
              <td>✨ Celestial</td><td>65</td><td class="rarity-legendary">Legendary</td><td>—</td>
            </tr>
            <tr v-if="expandedZones.has('celestial')" class="zone-detail">
              <td colspan="4"><span class="coming-soon">Coming soon</span></td>
            </tr>

            <tr @click="toggleZone('void')" class="zone-row" :class="{ 'zone-expanded': expandedZones.has('void') }">
              <td>🌀 Void</td><td>80</td><td class="rarity-legendary">Legendary</td><td>—</td>
            </tr>
            <tr v-if="expandedZones.has('void')" class="zone-detail">
              <td colspan="4"><span class="coming-soon">Coming soon</span></td>
            </tr>

            <tr @click="toggleZone('nightmare')" class="zone-row" :class="{ 'zone-expanded': expandedZones.has('nightmare') }">
              <td>💀 Nightmare</td><td>95</td><td class="rarity-legendary">Legendary</td><td>—</td>
            </tr>
            <tr v-if="expandedZones.has('nightmare')" class="zone-detail">
              <td colspan="4"><span class="coming-soon">Coming soon</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pixel-panel loot-rules">
        <p class="section-label">Loot Rules</p>
        <ul class="passive-list">
          <li>Boss kill → guaranteed highest rarity for that zone</li>
          <li>Non-boss enemies cannot drop Legendary (demoted to Epic)</li>
          <li>Forest cap: Rare — Epic and Legendary never drop outside bosses</li>
          <li>Dungeon cap: Epic — Legendary never drops outside bosses</li>
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
          <li>Class crit check: Warrior/Mage on natural 20; Rogue on roll ≥ 17 or when DEX ≥ 12 (always crits)</li>
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
          <li>Enemy rolls ATK in (min–max) range</li>
          <li>Subtract player DEF (minimum 1 damage)</li>
          <li>Dodge check: if player has dodge chance, roll to fully negate damage</li>
          <li>Deal remaining damage to player HP</li>
        </ol>
      </div>

      <div class="combat-section">
        <p class="section-label">Death &amp; Bosses</p>
        <ul class="passive-list">
          <li><span class="gold-text">Death penalty:</span> −10% current XP, −15% current gold, full HP restore</li>
          <li><span class="gold-text">Boss trigger:</span> every 12 normal kills spawns the zone boss (if one exists)</li>
          <li><span class="gold-text">Boss reward:</span> guaranteed top-rarity loot drop for the zone</li>
        </ul>
      </div>

    </div>

    <!-- ═══════════════ ITEMS ═══════════════ -->
    <div v-else-if="activeTab === 'items'" class="pixel-panel tab-content">

      <p class="section-label">Rarity &amp; Prices</p>
      <div class="tbl-wrap">
        <table class="wiki-table">
          <thead>
            <tr><th>Rarity</th><th>Drop %</th><th>Sell</th><th>Buy (Shop)</th></tr>
          </thead>
          <tbody>
            <tr>
              <td class="rarity-common">Common</td>
              <td>60%</td><td>5g</td><td>15g</td>
            </tr>
            <tr>
              <td class="rarity-uncommon">Uncommon</td>
              <td>25%</td><td>15g</td><td>45g</td>
            </tr>
            <tr>
              <td class="rarity-rare">Rare</td>
              <td>12%</td><td>40g</td><td>120g</td>
            </tr>
            <tr>
              <td class="rarity-epic">Epic</td>
              <td>3%</td><td>120g</td><td>360g</td>
            </tr>
            <tr>
              <td class="rarity-legendary">Legendary</td>
              <td>0.01%*</td><td>500g</td><td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="footnote">* Boss drops only. Non-boss enemies cannot drop Legendary.</p>

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
          <li>Enchant cost doubles with each additional enchant on the same item</li>
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
          <li>Tokens earned per prestige = <span class="gold-text">floor(level / 10)</span></li>
          <li>Spend tokens on permanent bonuses that persist across all future runs</li>
          <li>Ascension panel stays unlocked permanently after your first prestige</li>
        </ul>
      </div>

      <p class="section-label" style="margin-top:16px">Ascension Bonuses</p>
      <div class="tbl-wrap">
        <table class="wiki-table">
          <thead>
            <tr><th>Bonus</th><th>Cost</th><th>Max Stacks</th><th>Effect</th></tr>
          </thead>
          <tbody>
            <tr><td class="gold-text">XP Boost</td><td>2 ⚡</td><td>5</td><td>+20% XP per stack</td></tr>
            <tr><td class="gold-text">Gold Boost</td><td>2 ⚡</td><td>5</td><td>+20% gold per stack</td></tr>
            <tr><td class="gold-text">Offline Efficiency</td><td>3 ⚡</td><td>10</td><td>+10% offline kill rate per stack</td></tr>
            <tr><td class="gold-text">Head Start</td><td>5 ⚡</td><td>5</td><td>Start new runs at level 5 / 10 / 15...</td></tr>
            <tr><td class="gold-text">Vitality</td><td>2 ⚡</td><td>10</td><td>+10% max HP per stack</td></tr>
            <tr><td class="gold-text">Fortune</td><td>4 ⚡</td><td>5</td><td>+10% item drop chance per stack</td></tr>
          </tbody>
        </table>
      </div>

      <div class="carry-grid" style="margin-top:16px">
        <div class="pixel-panel carry-box">
          <p class="section-label carry-title keep">Carries Over</p>
          <ul class="passive-list">
            <li>Ascension tokens &amp; bonuses</li>
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
            <li>Stat upgrade picks</li>
            <li>Zone challenge progress</li>
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
