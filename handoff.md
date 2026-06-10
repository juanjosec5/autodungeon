# AutoDungeon — Project Handoff

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 6.0 (strict mode) |
| Framework | Vue 3 + Composition API (`<script setup>`) |
| Build tool | Vite 8.0 |
| State management | Pinia 3.0 |
| Routing | Vue Router 5.0 (hash-based) |
| Styling | Tailwind CSS v4 (Vite plugin) |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Local persistence | localStorage (guest/fallback) |
| Testing | Vitest 4.1 + v8 coverage |
| Linting | ESLint 10.2 + TypeScript ESLint + Prettier 3.8 |
| Deployment | Vercel (auto-deploy on push to `main`) |
| Package manager | npm |

---

## Project Structure

```
src/
├── main.ts                  # Vue + Pinia + Router bootstrap
├── App.vue                  # Root component
├── types/index.ts           # All TypeScript interfaces & types
│
├── game/                    # Pure game logic (no Vue/Pinia imports)
│   ├── engine.ts            # CombatEngine — timers, event bus
│   ├── formulas.ts          # Hit/crit/damage math
│   ├── classes.ts           # Class definitions, stat scaling
│   ├── enemies.ts           # Enemy spawning, boss detection
│   ├── items.ts             # Loot rolling, pricing, enchanting helpers
│   ├── item-data.ts         # 700+ ITEM_DEFINITIONS
│   ├── upgrades.ts          # Skill point upgrades
│   ├── achievements.ts      # Zone challenge sets & rewards
│   ├── offline.ts           # Offline progress calculation
│   ├── sets.ts              # Set item bonus definitions
│   ├── shop.ts              # Consumable definitions & rotation
│   ├── tasks.ts             # Daily/weekly task generation
│   └── zones.ts             # Zone metadata & unlock levels
│
├── stores/                  # Pinia stores
│   ├── character.ts         # Character state, gear, inventory
│   ├── combat.ts            # Engine instance, combat log, event handling
│   ├── zone.ts              # Active/pending zone selection
│   ├── auth.ts              # Supabase session state
│   ├── save.ts              # Auto-save (30s) + load/restore
│   ├── prestige.ts          # Ascension tokens, prestige bonuses
│   ├── achievement.ts       # Zone challenge tracking
│   ├── progression.ts       # Panel unlocks, tutorial toasts
│   ├── shop.ts              # Active consumables, expiry
│   ├── tasks.ts             # Daily/weekly task state
│   └── loot.ts              # Last dropped item (UI)
│
├── components/              # Vue SFCs
│   ├── CharacterCreation.vue
│   ├── CharacterPanel.vue
│   ├── EnemyPanel.vue
│   ├── CombatLog.vue
│   ├── ItemsPanel.vue
│   ├── ZoneSelector.vue
│   ├── SpeedControl.vue
│   ├── ShopPanel.vue
│   ├── CodexPanel.vue
│   ├── EnchantPanel.vue
│   ├── SkillsPanel.vue
│   ├── AchievementsPanel.vue
│   ├── TasksPanel.vue
│   ├── PrestigePanel.vue
│   ├── DeathModal.vue
│   ├── OfflineRewardModal.vue
│   ├── UnlockModal.vue
│   ├── AuthModal.vue
│   └── TutorialToast.vue
│
├── views/
│   ├── GameView.vue         # Main combat layout (500+ LOC)
│   └── WikiView.vue         # In-game rules & item codex
│
├── router/index.ts          # Routes: /, /game, /wiki
├── lib/supabase.ts          # Supabase client init
└── utils/
    ├── storage.ts           # LS_KEYS constants
    └── format.ts            # Number formatting helpers
```

---

## Architecture

**Separation of concerns:**
- `src/game/*` — pure functions, zero framework imports; fully unit-testable
- `src/stores/*` — Pinia stores wrap game logic and manage reactive state
- `src/components/*` — Vue UI reads/writes only to stores

**CombatEngine** is instantiated once inside `useCombatStore`. It runs independent player and enemy attack timers and emits typed events (`player_hit`, `enemy_dead`, `loot_dropped`, `level_up`, `player_dead`, etc.). The store subscribes to those events and updates reactive state accordingly.

**Save strategy:**
1. Primary — Supabase upsert (requires auth session)
2. Fallback — localStorage (always written)
3. Auto-save triggers every 30s + on loot drop, level-up, and death

**Offline progress** is a pure function (`calcOfflineProgress`) — no server round-trip. Cap is 8 hours; yields ~1 item per 300 kills.

---

## Key Data Models (`src/types/index.ts`)

| Type | Key fields |
|---|---|
| `Character` | name, classId, level, xp, hp, stats, weapon, armor, inventory (50 slots), gold, zone, upgrades, skillPoints, lifetimeStats, zoneAchievements |
| `Item` | id, name, type, category, rarity, allowedClasses, minDmg/maxDmg, defBonus, hpBonus, special[], enchantCount |
| `SpecialEffect` | union: lifesteal, poison, dodge, block, defIgnore, spellAmp, critThreshold, doublecast, attackSpeedBonus, regenOnKill |
| `Enemy` | id, name, zone, hp, atk range, def, xpReward, attackSpeed, isBoss |
| `CombatLogEntry` | id, timestamp, message, type (hit/crit/miss/loot/levelup/death/regen/sell/zone) |
| `PrestigeState` | prestigeCount, tokens, bonuses (6 types), ascensionBonuses (class-specific) |
| `OfflineResult` | durationMs, kills, goldEarned, xpEarned, itemsFound |
| `TaskInstance` | type, target, description, reward, period (daily/weekly) |

---

## Implemented Features

- **6 classes:** warrior, rogue, mage, priest, undead, dragonkin — each with unique base stats, scaling, attack speed, damage stat, and class-specific ascension bonus
- **8 zones:** forest (lvl 1) → dungeon (8) → volcano (20) → abyss (35) → shadowrealm (50) → celestial (65) → void (80) → nightmare (95)
- **30+ enemies** with boss variants per zone; boss spawns every 10–15 normal kills
- **700+ items** with rarities (Common/Uncommon/Rare/Epic/Legendary), class restrictions, and 10 special effect types
- **Combat engine:** independent player/enemy attack timers; hit/crit/damage/DEF formulas; on-hit effects (lifesteal, poison, doublecast)
- **Gear system:** 2 slots (weapon + armor), 50-slot inventory, auto-equip, smart-scrap modes (smart/smart-c/smart-u/smart-r)
- **Off-class penalty:** 70% effective stats (legendaries fully blocked)
- **Enchanting:** add/reroll special effects; cost scales with rarity and existing enchant count
- **Set bonuses:** 20 weapon+armor pairs with damage, defense, lifesteal, spell amp bonuses
- **Shop:** 5 consumables (war-potion, iron-flask, swift-elixir, fortune-charm, xp-tome); rotation every 30min, zone-gated stock
- **Skill points:** 14 upgrades; one point per level-up; class-specific auto-pick priorities
- **Prestige system:** entry at level ≥50; rewards `floor(level/10)` ascension tokens; 6 global prestige bonuses + 1 class-specific ascension bonus per class
- **Offline progress:** pure calculation, max 8h, ~1 item per 300 kills
- **Zone challenges:** 3 per zone (kills, boss kills, crits, damage, enemy types); reward a unique weapon + armor pair
- **Daily/weekly tasks:** seeded per day/week (no per-session randomness); reward gold, XP, ascension tokens
- **Combat log:** filterable (All / Combat / Loot / System)
- **Speed control:** 0.5×, 1×, 2×, 4× (4× locked until prestige ≥3)
- **Supabase auth + save:** optional; guest mode via localStorage
- **Vercel deployment** with auto-deploy on push to `main`
- **Unit tests:** game logic (classes, formulas, items, skills) + character store actions

---

## Loot & Combat Formulas (quick reference)

**Rarity weights:** Common 60% / Uncommon 25% / Rare 12% / Epic 3% / Legendary 0.01%  
**Zone rarity caps:** Forest → Rare; Dungeon → Epic; Volcano+ → Legendary  
**Boss guaranteed drop:** top-rarity weapon for zone + 1/200 chance for zone BiS legendary  
**Prestige drop rate bonus:** +10% chance per stack to bump rarity one tier up

**Hit:** `d20 + DEX ≥ enemy.DEF` (natural 20 always hits)  
**Crit threshold by class:** warrior/mage 20, dragonkin 19, priest/undead 18, rogue 17 (or DEX ≥ 12)  
**Player damage:** `(weaponRoll + statBonus) × critMultiplier × spellAmp − enemyDEF` (min 1)  
**Death penalty:** −10% XP, −15% gold; full HP respawn after 2s

**XP to next level:** `floor(100 × 1.13^level)`; max level 100

---

## Running the Project

```bash
# Install dependencies
npm install

# Configure environment (Supabase optional — game runs in guest mode without it)
cp .env.example .env
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Tests
npm run test          # run once
npm run test:watch    # watch mode
npm run coverage      # v8 coverage report
```

**Routes:**
- `/` — character creation / load saved
- `/game` — main gameplay
- `/wiki` — in-game rules & item browser

---

## Pending / Future Work

No open TODOs or FIXMEs remain in the codebase as of the last audit. The following are natural next areas to build:

| Area | Description |
|---|---|
| Sound & music | SFX for hits, level-ups, loot drops; background ambient tracks per zone |
| Leaderboard | Supabase-backed global rankings (prestige count, highest zone, lifetime stats) |
| Boss unique mechanics | Per-boss special abilities (enrage, shields, phase transitions) |
| Hardcore mode | Permanent item loss on death |
| Active abilities | Hotbar with cooldown-based skills usable during combat |
| More special effects | Bleed, stun, mana shield, thorns, etc. |
| Consumable crafting | Combine drops into potions/flasks |
| Expanded skill trees | Secondary trees (gathering, crafting, exploration) |
| Mobile polish | Better touch targets, swipe navigation between panels |
| Achievements page | Global lifetime achievements beyond per-zone challenges |

---

## Recent Fixes (last audit)

- Skill point stat bonuses now preserved across level-ups
- Timer leaks cleaned up in `ShopPanel`, `EnchantPanel`, and shop store
- `autoPickUpgrade` error handling improved
- Null guards added to `rollLoot` / `rollBisLoot`
- Offline gold guaranteed ≥1 per kill
- localStorage keys centralized via `LS_KEYS` in `src/utils/storage.ts`
- `rollDamage` deduplication in formulas
- Item return types updated to `Item | null` with null guards in tests
