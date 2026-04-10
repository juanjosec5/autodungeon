# AUTODUNGEON — Full Project Context

> This file is the single source of truth for the autodungeon project.
> It contains the full game design, all decisions made, completed work,
> and all remaining build prompts. Pass this file to Claude Code and
> instruct it to continue from the next pending step.

---

## HOW TO USE THIS FILE

Tell Claude Code:
> "Read AUTODUNGEON_CONTEXT.md. Complete the next PENDING step in order.
> Mark it as DONE when finished. Do not skip steps or work ahead."

---

## TECH STACK

- Vite + Vue 3 + TypeScript (strict mode)
- Tailwind CSS v4 (vite plugin)
- Pinia (state management)
- Vue Router (hash mode)
- supabase-js
- Hosted on Vercel

---

## PROJECT STRUCTURE

```
src/
  game/         # Pure logic, no Vue/Pinia imports
    classes.ts
    enemies.ts
    items.ts
    formulas.ts
    engine.ts
  stores/       # Pinia stores
  components/   # Vue components
  views/        # Vue Router views
  types/        # Shared TS interfaces (index.ts)
  lib/          # Supabase client
  router/       # Vue Router config
```

---

## GAME DESIGN

### Classes

| Class   | HP  | STR | DEX | INT | Attack Speed |
|---------|-----|-----|-----|-----|--------------|
| Warrior | 120 | 8   | 4   | 2   | 1800ms/tick  |
| Rogue   | 80  | 5   | 9   | 3   | 1100ms/tick  |
| Mage    | 70  | 2   | 5   | 10  | 1500ms/tick  |

**Per-level gains:**

| Class   | HP  | STR | DEX | INT |
|---------|-----|-----|-----|-----|
| Warrior | +12 | +2  | +0.5| +0  |
| Rogue   | +7  | +1  | +2  | +0.5|
| Mage    | +5  | +0  | +1  | +2.5|

**Passives:**
- Warrior: +10% armor effectiveness, 40% regen chance on kill, crit on natural 20 only
- Rogue: crit on roll >= 17 OR DEX >= 12, 30% regen chance
- Mage: ignore 20% enemy DEF base, 30% regen chance, crit on natural 20 only

**XP Curve:** `floor(100 * (1.15 ^ level))` — level cap: 20

---

### Gear System

Two slots: **Weapon** + **Armor**

- Common → Epic: any class can equip, off-class = -30% stat effectiveness
- Legendary: hard class-locked, others cannot equip
- Inventory: 20 slots max
- Overflow: auto-sell for gold, logged in combat feed

**Sell prices by rarity:**
- Common: 5g | Uncommon: 15g | Rare: 40g | Epic: 120g | Legendary: 500g

---

### Rarity Weights

| Rarity    | Weight  |
|-----------|---------|
| Common    | 59.99%  |
| Uncommon  | 25%     |
| Rare      | 12%     |
| Epic      | 3%      |
| Legendary | 0.01%   |

Legendary only drops from Dragon (zone 3).
Forest: no epic or legendary. Dungeon: no legendary. Volcano: full pool.

---

### Weapons

| Name            | Rarity    | Classes   | Dmg       | Specials                                      |
|-----------------|-----------|-----------|-----------|-----------------------------------------------|
| Rusty Sword     | Common    | warrior   | 3–7       |                                               |
| Iron Sword      | Uncommon  | any       | 6–11      |                                               |
| Broad Sword     | Rare      | any       | 10–17     |                                               |
| Shadowblade     | Epic      | any       | 15–24     | lifesteal 10%                                 |
| Godslayer       | Legendary | warrior   | 30–50     | lifesteal 20%, defIgnore 15%, critThreshold 18|
| Shiv            | Common    | any       | 2–5       |                                               |
| Twin Daggers    | Uncommon  | any       | 4–9       |                                               |
| Venomblade      | Rare      | any       | 7–14      | poison dpsMultiplier 15%                      |
| Deathwhisper    | Epic      | any       | 12–20     | critThreshold rollsAt 15                      |
| Wraithfang      | Legendary | rogue     | 25–42     | poison 25%, critThreshold 14, atkSpeed +25%   |
| Crooked Staff   | Common    | any       | 4–8       |                                               |
| Arcane Wand     | Uncommon  | any       | 7–13      |                                               |
| Spellbreaker    | Rare      | any       | 12–20     |                                               |
| Voidstaff       | Epic      | any       | 18–30     | defIgnore 35%                                 |
| Eternum         | Legendary | mage      | 35–55     | defIgnore 50%, doublecast 30%                 |

### Armor

| Name                | Rarity    | Classes | DEF | HP  | Specials              |
|---------------------|-----------|---------|-----|-----|-----------------------|
| Leather Scraps      | Common    | any     | +1  | +5  |                       |
| Chainmail           | Uncommon  | any     | +3  | +10 |                       |
| Shadow Cloak        | Uncommon  | any     | +2  | +8  |                       |
| Mage Robes          | Uncommon  | any     | +1  | +12 |                       |
| Plate Armor         | Rare      | any     | +6  | +20 |                       |
| Assassin's Garb     | Rare      | any     | +4  | +15 |                       |
| Arcane Vestment     | Rare      | any     | +3  | +20 | spellAmp 10%          |
| Dragonscale Mail    | Epic      | any     | +10 | +35 |                       |
| Phantom Shroud      | Epic      | any     | +7  | +25 | dodge 20%             |
| Starweave Robe      | Epic      | any     | +5  | +30 | spellAmp 15%          |
| Aegis of Eternity   | Legendary | warrior | +18 | +60 | block 10%             |
| Voidweave Shroud    | Legendary | rogue   | +12 | +40 | dodge 30%             |
| Archmage's Mantle   | Legendary | mage    | +8  | +50 | spellAmp 25%, regenOnKill 15% |

---

### Enemies

**Forest (unlock: level 1)**

| Enemy  | HP  | ATK    | DEF | XP  | Speed  |
|--------|-----|--------|-----|-----|--------|
| Wolf   | 18  | 3–6    | 3   | 20  | 1400ms |
| Goblin | 22  | 4–7    | 4   | 28  | 1600ms |
| Bandit | 35  | 5–9    | 5   | 45  | 1800ms |

**Dungeon (unlock: level 5)**

| Enemy      | HP  | ATK   | DEF | XP  | Speed  |
|------------|-----|-------|-----|-----|--------|
| Skeleton   | 50  | 7–12  | 6   | 80  | 1500ms |
| Orc        | 75  | 9–15  | 9   | 120 | 2000ms |
| Dark Knight| 110 | 12–20 | 13  | 200 | 2200ms |

**Volcano (unlock: level 12)**

| Enemy          | HP  | ATK   | DEF | XP  | Speed  |
|----------------|-----|-------|-----|-----|--------|
| Fire Elemental | 130 | 15–25 | 10  | 280 | 1300ms |
| Wyvern         | 180 | 18–30 | 15  | 400 | 1800ms |
| Dragon         | 300 | 25–40 | 20  | 700 | 2500ms |

---

### Combat System

**Hit roll:** `d20() + DEX >= enemy.DEF`

**Damage:**
- Physical (Warrior/Rogue): `rand(minDmg, maxDmg) + STR`
- Magic (Mage): `rand(minDmg, maxDmg) + INT`
- Crit: `damage * 1.5` (floored)
- Final: `max(1, damage - effectiveDEF)`
- effectiveDEF: `floor(enemyDEF * (1 - defIgnorePercent))`

**Enemy damage:** always hits. `max(1, rand(atk[0], atk[1]) - playerDEF)`

**Off-class gear:** 70% effectiveness multiplier on stats. Legendary = cannot equip.

**HP Regen on kill:**
- Base 30% chance (Warrior: 40%)
- Heals 15–35% of maxHP
- regenOnKill armor special adds to chance (cap 90%)

**Death penalty:**
- Lose 10% of current XP bar progress (floors at 0, cannot de-level)
- Lose 15% of gold on hand
- Respawn at full HP, same zone

**Combat speed:** 0.5x / 1x / 2x / 4x multiplier on all tick intervals

---

### Save System

- Primary: Supabase (`characters` table, `data jsonb` column)
- Fallback: localStorage key `autodungeon_character`
- Auto-save: every 30s + on loot drop, level up, death events
- Guest play supported (no auth required, localStorage only)

**Supabase schema:**
```sql
create table characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  data jsonb not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

---

### UI Layout

```
┌─────────────────────────────────────────┐
│  [CharacterPanel]     [CombatLog]        │
│  Name, Class, Level   Scrolling feed     │
│  HP bar               of events         │
│  XP bar                                 │
├─────────────────────────────────────────┤
│  [GearPanel]          [EnemyPanel]      │
│  Weapon + Armor       Current enemy     │
│  equipped             HP bar, name      │
├─────────────────────────────────────────┤
│  [Inventory]          [ZoneSelector]    │
│  Loot grid            Forest/Dungeon/   │
│  click to equip       Volcano           │
├─────────────────────────────────────────┤
│  [SpeedControl]  ▶ ⏸  0.5x 1x 2x 4x   │
└─────────────────────────────────────────┘
```

---

## TYPE DEFINITIONS (src/types/index.ts)

```ts
interface Item {
  id: string
  name: string
  type: 'weapon' | 'armor'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  allowedClasses: ('warrior' | 'rogue' | 'mage')[] | 'any'
  stats: {
    minDmg?: number
    maxDmg?: number
    defBonus?: number
    hpBonus?: number
    special?: SpecialEffect[]
  }
}

type SpecialEffect =
  | { type: 'lifesteal'; value: number }
  | { type: 'poison'; dpsMultiplier: number }
  | { type: 'dodge'; chance: number }
  | { type: 'block'; chance: number }
  | { type: 'defIgnore'; percent: number }
  | { type: 'spellAmp'; percent: number }
  | { type: 'critThreshold'; rollsAt: number }
  | { type: 'doublecast'; chance: number }
  | { type: 'attackSpeedBonus'; percent: number }
  | { type: 'regenOnKill'; percent: number }

interface Character {
  id: string
  userId?: string
  name: string
  class: 'warrior' | 'rogue' | 'mage'
  level: number
  xp: number
  xpToNext: number
  currentHP: number
  maxHP: number
  stats: {
    str: number
    dex: number
    int: number
  }
  gear: {
    weapon: Item | null
    armor: Item | null
  }
  inventory: Item[]
  gold: number
  currentZone: 'forest' | 'dungeon' | 'volcano'
  createdAt: string
  lastSaved: string
}

interface Enemy {
  id: string
  name: string
  zone: 'forest' | 'dungeon' | 'volcano'
  hp: number
  maxHp: number
  atk: [number, number]
  def: number
  xpReward: number
  attackSpeed: number
}

interface CombatLogEntry {
  id: string
  timestamp: number
  message: string
  type: 'hit' | 'crit' | 'miss' | 'loot' | 'levelup' | 'death' | 'regen' | 'sell' | 'zone'
}

type ZoneId = 'forest' | 'dungeon' | 'volcano'
type ClassId = 'warrior' | 'rogue' | 'mage'
type RarityId = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
```

---

## BUILD STEPS

---

### [DONE] Step 1a — Project Scaffold

Vite + Vue 3 + TS + Tailwind v4 + Pinia + Vue Router + supabase-js installed.
src/types/index.ts created with all interfaces above.
Placeholder CharacterCreation.vue and GameView.vue created.
Router configured. vercel.json and .env.example added.

---

### [DONE] Step 1b — Game Data Layer

Files created:
- src/game/classes.ts — CLASS_DEFINITIONS, getStatsAtLevel(), getXPToNextLevel()
- src/game/enemies.ts — ENEMY_DEFINITIONS, getEnemiesForZone(), spawnEnemy()
- src/game/items.ts — ITEM_DEFINITIONS, rollLoot(), getSellPrice(), getItemById()
- src/game/formulas.ts — d20(), rollDamage(), calcHit(), calcCrit(),
  calcPlayerDamage(), calcEnemyDamage(), calcRegenAmount(), calcDeathPenalty(),
  getOffClassPenalty()

---

### [DONE] Step 1c — Combat Engine

File created: src/game/engine.ts

Exports:
- class CombatEngine (default export)
  - start(state), stop(), pause(), resume(), setSpeed(), updateCharacter(), on()
  - Private: playerTick(), enemyTick(), handleEnemyDeath(), schedulePlayerTick(),
    scheduleEnemyTick(), emit(), getPlayerAttackInterval(), getEnemyAttackInterval()
- Types: CombatState, CombatEvent, CombatEventType, CombatEventHandler

Engine is pure — no Vue or Pinia imports. Stores wrap it.

---

### [DONE] Step 2a — useCharacterStore

Create src/stores/character.ts as a Pinia store.

Responsibilities:
- Hold the reactive Character object
- Expose actions for: createCharacter, equipItem, unequipItem, addToInventory,
  applyXP (handles level up logic), applyDeathPenalty, setZone
- equipItem must enforce class restrictions and off-class penalty awareness
  (store getOffClassPenalty from formulas.ts and expose effectiveWeaponStats /
  effectiveArmorStats getters that apply the multiplier)
- applyXP: accumulates XP, checks if xp >= xpToNext, if so levels up:
    - increment level
    - recalculate stats using getStatsAtLevel()
    - recalculate maxHP (also heal difference on level up)
    - recalculate xpToNext using getXPToNextLevel()
    - carry over remainder XP
    - emit a 'levelup' flag (return value or store flag) so combat log can react
- addToInventory: if inventory.length >= 20, auto-sell (return { sold: true, gold })
  otherwise push item
- Expose a getter: unlockedZones — returns ZoneId[] based on character level
    forest: always, dungeon: level >= 5, volcano: level >= 12
- createCharacter(name, classId): builds a fresh Character object using
  getStatsAtLevel(classId, 1), sets starter gear per class:
    warrior → Rusty Sword + Leather Scraps
    rogue   → Shiv + Leather Scraps
    mage    → Crooked Staff + Leather Scraps
  Sets currentHP = maxHP, xp = 0, xpToNext = getXPToNextLevel(1),
  gold = 0, inventory = [], currentZone = 'forest'

---

### [DONE] Step 2b — useCombatStore + useZoneStore

Create src/stores/zone.ts:
- Holds activeZone: ZoneId (default 'forest')
- Action setZone(zone: ZoneId): validates zone is unlocked (check characterStore
  unlockedZones), updates activeZone, stops and restarts combat in new zone

Create src/stores/combat.ts:
- Holds:
    engine: CombatEngine instance (created once)
    currentEnemy: Enemy | null (reactive)
    combatLog: CombatLogEntry[] (max 100 entries, shift oldest when full)
    isRunning: boolean
    isPaused: boolean
    speed: 0.5 | 1 | 2 | 4 (default 1)
- On store init: instantiate CombatEngine, register event handlers via engine.on()
- Event handler map (CombatEventType → log message + side effects):
    player_hit   → '[Sword] You hit [Enemy] for [n] damage. ([hp]/[maxhp])'
    player_miss  → 'You missed [Enemy].'
    player_crit  → '⚡ CRIT! You hit [Enemy] for [n] damage!'
    enemy_hit    → '[Enemy] hits you for [n] damage. ([hp]/[maxhp])'
    enemy_dead   → '💀 [Enemy] has been slain!'
    player_dead  → '☠️ You were slain by [Enemy]! Lost [xp]xp and [gold]g.'
    loot_dropped → '🎁 Loot: [Item] ([rarity])'  — then call addToInventory
    loot_sold    → '💰 Inventory full — sold [Item] for [n]g'
    xp_gained    → '✨ +[n] XP'
    level_up     → '🎉 Level up! You are now level [n]!'
    hp_regen     → '💚 Recovered [n] HP. ([current]/[max])'
    zone_cleared → (reserved, unused in MVP)

  For player_dead specifically:
    - call characterStore.applyDeathPenalty()
    - after 2s delay, call restartCombat()

  For loot_dropped:
    - call characterStore.addToInventory(item)
    - if it returns { sold: true, gold }, push a loot_sold log entry instead

  For xp_gained:
    - call characterStore.applyXP(amount)
    - if level up occurred, push level_up log entry

- Actions:
    startCombat(): spawns first enemy from active zone, calls engine.start()
    stopCombat(): calls engine.stop(), isRunning = false
    pauseCombat() / resumeCombat(): delegates to engine
    setSpeed(s): updates speed, calls engine.setSpeed(s)
    restartCombat(): stopCombat() then startCombat() after short delay
    addLogEntry(entry: Omit<CombatLogEntry, 'id' | 'timestamp'>): pushes to log

- The store must keep currentEnemy reactive by updating it from engine state
  after each enemy_dead event (engine spawns next enemy internally, store
  should read engine.state.enemy after the event fires)

---

### [DONE] Step 2c — useLootStore

Create src/stores/loot.ts:
- Thin store, mostly delegates to items.ts helpers
- Holds: lastDroppedItem: Item | null
- Action: processLootDrop(zone, isDragon): calls rollLoot(), sets lastDroppedItem
- This store is mostly a reactive wrapper for UI to observe last loot drop
- May be merged into combatStore if it feels redundant during implementation —
  use judgment, keep it simple

---

### [DONE] Step 2d — useAuthStore + useSaveStore

Create src/lib/supabase.ts:
- Initialize supabase client using:
    import { createClient } from '@supabase/supabase-js'
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    export const supabase = createClient(supabaseUrl, supabaseKey)

Create src/stores/auth.ts:
- Holds: session (Supabase Session | null), isGuest: boolean
- On init: call supabase.auth.getSession(), set session
- Subscribe to supabase.auth.onAuthStateChange to keep session reactive
- Actions: signUp(email, password), signIn(email, password), signOut()
- isGuest = session === null

Create src/stores/save.ts:
- Holds: lastSaved: string | null, isSaving: boolean
- AUTO-SAVE: on store init, set an interval (every 30s) that calls saveCharacter()
- Action saveCharacter():
    - Sets isSaving = true
    - Serializes characterStore.character to JSON
    - If auth session exists: upsert to Supabase characters table
        { user_id: session.user.id, data: character, updated_at: now() }
    - Always: write to localStorage key 'autodungeon_character'
    - Sets lastSaved = new Date().toISOString()
    - Sets isSaving = false
- Action loadCharacter():
    - If auth session: try Supabase first (select where user_id = session.user.id)
    - Fallback: read from localStorage
    - If found: call characterStore.restoreCharacter(data) (add this action to
      characterStore — it just sets the character ref directly)
    - Returns boolean (found or not)
- saveCharacter() should also be called manually from combatStore on:
    loot drop, level up, death events

---

### [DONE] Step 3a — CharacterCreation.vue

Replace the placeholder at src/components/CharacterCreation.vue.

This is the first screen the user sees (route '/').

Layout:
- Centered card, dark fantasy aesthetic, Tailwind styling
- Title: "AUTODUNGEON" in large stylized text
- Name input field (text, required, max 20 chars)
- Class selector: 3 cards (Warrior / Rogue / Mage), clickable, shows:
    class name, flavor text, base stats (HP/STR/DEX/INT), passive description
- "Begin Adventure" button — disabled until name and class selected
- On submit: call characterStore.createCharacter(name, classId)
  then router.push('/game')
- If a saved character exists in localStorage or Supabase, show a
  "Continue as [Name]" button above the creation form that loads and
  routes to /game instead

---

### [DONE] Step 3b — CharacterPanel.vue

src/components/CharacterPanel.vue

Displays from characterStore:
- Character name + class badge
- Level (e.g. "Lv. 7")
- HP bar: current/max with color (green > 50%, yellow 25–50%, red < 25%)
- XP bar: current/xpToNext with level label
- Stats row: STR / DEX / INT values
- Gold amount

---

### [DONE] Step 3c — EnemyPanel.vue

src/components/EnemyPanel.vue

Displays from combatStore.currentEnemy:
- Enemy name
- Zone badge
- HP bar (red, shows hp/maxHp)
- ATK range and DEF stats
- Subtle "pulsing" animation to show it's alive

---

### [DONE] Step 3d — CombatLog.vue

src/components/CombatLog.vue

Displays combatStore.combatLog:
- Scrollable list, newest entries at bottom (auto-scroll)
- Color-coded by entry type:
    hit     → white
    crit    → yellow
    miss    → gray
    loot    → green
    levelup → gold/amber
    death   → red
    regen   → teal
    sell    → orange
- Max visible without scroll: ~10 entries
- Timestamp shown as relative (e.g. "2s ago") or just entry order

---

### [DONE] Step 3e — GearPanel.vue + Inventory.vue

src/components/GearPanel.vue:
- Shows equipped weapon and armor
- Each slot shows: item name, rarity color, key stats
- Off-class items show a warning badge "⚠ 70% effectiveness"
- Click slot to unequip (moves back to inventory)

src/components/Inventory.vue:
- 20-slot grid
- Each filled slot shows item icon area (colored by rarity), name on hover/tooltip
- Click item: if it's equippable (weapon → weapon slot, armor → armor slot),
  equip it (swaps current equipped item back to inventory if slot was full)
- Rarity border colors:
    common → gray, uncommon → blue, rare → yellow, epic → purple, legendary → orange/gold

---

### [DONE] Step 3f — ZoneSelector.vue + SpeedControl.vue

src/components/ZoneSelector.vue:
- 3 zone buttons: Forest / Dungeon / Volcano
- Locked zones shown as grayed out with unlock level requirement
- Active zone highlighted
- On click unlocked zone: zoneStore.setZone(zone)

src/components/SpeedControl.vue:
- Play/Pause toggle button
- Speed buttons: 0.5x / 1x / 2x / 4x
- Active speed highlighted
- Delegates to combatStore actions

---

### [DONE] Step 3g — DeathModal.vue

src/components/DeathModal.vue:
- Shows when player_dead event fires
- Displays: "You were slain by [enemy]"
- Shows XP lost and gold lost
- Auto-dismisses after 3s (combat auto-restarts after 2s, modal closes at 3s)
- Dark overlay, centered modal, red accent styling

---

### [DONE] Step 4a — GameView.vue + Full Wiring

Replace placeholder at src/views/GameView.vue.

Compose all components into the game layout:
- On mount: call saveStore.loadCharacter(), if no character found redirect to '/'
- Start combat automatically on mount (after character loaded)
- Layout matches the wireframe in the design section above
- DeathModal shown conditionally when combat store has death state
- Responsive: stack panels vertically on mobile

---

### [DONE] Step 4b — Supabase Auth UI + Save Sync

Add to CharacterCreation.vue or as a separate AuthModal.vue:
- Optional sign in / sign up form (email + password)
- "Play as guest" option that skips auth
- After sign in: attempt loadCharacter() from Supabase before showing creation form
- Show save status in UI (last saved timestamp or "Saving...")

---

### [DONE] Step 4c — Vercel Deploy Config

- Confirm vercel.json exists with SPA rewrite rule
- Add .env.example with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Confirm vite.config.ts has no hardcoded ports or broken config
- Run vite build and confirm zero errors before deploying
- Document in a DEPLOY.md:
    1. Create Supabase project
    2. Run the characters table SQL
    3. Set env vars in Vercel dashboard
    4. Push to main → auto-deploy

---

## POST-MVP BACKLOG

- Gold shop for buying gear
- Consumables (potions) as loot drops
- Enemy miss chance (player dodge without armor special)
- Boss fights with unique mechanics
- Hardcore mode (gear loss on death)
- Skill system (mining, fishing) à la RuneScape
- Multiplayer leaderboard via Supabase
- Prestige / reincarnation system
- Spell/ability hotbar for active play
- Sound effects and music

---

*Last updated: after Step 4c completion — MVP COMPLETE*
