# Autodungeon — Game Features Reference

## Overview

Autodungeon is an idle fantasy auto-battler. After creating a character, combat runs automatically while the player manages gear, levels up, and explores new zones. There is no manual combat input — only strategic decisions between fights (zone selection, gear equipping, shop purchases).

---

## Classes

| Class | HP (L1) | STR | DEX | INT | Atk Speed |
|-------|---------|-----|-----|-----|-----------|
| Warrior | 120 | 8 | 4 | 2 | 1800ms |
| Rogue | 80 | 5 | 9 | 3 | 1100ms |
| Mage | 70 | 2 | 5 | 10 | 1500ms |

**Per-level gains:**
- Warrior: +12 HP, +2 STR, +0.5 DEX, +0 INT
- Rogue: +7 HP, +1 STR, +2 DEX, +0.5 INT
- Mage: +5 HP, +0 STR, +1 DEX, +2.5 INT

### Class Passives

**Warrior**
- Armor effectiveness ×1.1 (equipped armor DEF ×10% bonus)
- 40% chance to regenerate HP on kill
- Crit on natural 20

**Rogue**
- Crit on roll ≥ 17 (threshold can be lowered by item specials) OR when DEX ≥ 12 (100% crit rate)
- 30% chance to regenerate HP on kill

**Mage**
- Ignore 20% of enemy DEF (applied before other armor-ignore effects stack)
- 30% chance to regenerate HP on kill
- Crit on natural 20

---

## Combat Engine

Each combat tick is driven by two independent timers — one for the player, one for the enemy. Attack speed is set by class (modified by `attackSpeedBonus` items).

### Player attack sequence (per tick):
1. **Roll d20** — determines hit, crit, and miss
2. **Hit check**: `d20() + DEX ≥ enemyDEF` — succeeds if true
3. **Crit check**: class-specific (see above)
4. **Damage**: `rollDamage(min, max) + statBonus`
   - Warrior/Rogue use STR; Mage uses INT
5. **Crit multiplier**: ×1.5 if crit
6. **SpellAmp** (Mage only): applied after crit, before DEF reduction
7. **DEF reduction**: `max(1, raw - floor(enemyDEF × (1 - defIgnorePercent)))`
8. **On-hit effects**: lifesteal, poison, doublecast trigger
9. **On-kill effects**: regen chance, regenOnKill items trigger

### Enemy attack sequence (per tick):
1. Roll damage: `max(1, rollDamage(atk[0], atk[1]) - playerDEF)`
2. Player dodge/block items check
3. Apply damage to player HP

### Death & respawn:
- On death: lose 10% current XP + 15% gold
- Respawn at full HP in the same zone

---

## Zones

| Zone | Unlock | Enemy DEF avg | Boss |
|------|--------|---------------|------|
| Forest | Level 1 | 4 | Forest Troll (HP 150, DEF 14) |
| Dungeon | Level 5 | 7 | Dark Knight (HP 330, DEF 26) |
| Volcano | Level 12 | 14 | Dragon (HP 900, DEF 40) |
| Abyss | Level 20 | 19 | Abyssal Titan (HP 1950, DEF 60) |

- Every 10 normal kills spawns the zone boss
- Boss kills award bonus XP and a guaranteed weapon loot drop
- Zone loot rarity cap: Forest → max Rare, Dungeon → max Epic, Volcano/Abyss → Legendary possible

---

## Loot System

### Roll rarity (normal enemies):
| Rarity | Weight |
|--------|--------|
| Common | 59.99% |
| Uncommon | 25% |
| Rare | 12% |
| Epic | 3% |
| Legendary | 0.01% (boss only) |

- Non-boss enemies cannot drop Legendary (rerolls to Epic)
- Forest cap: Epic/Legendary reroll to Rare
- Dungeon cap: Legendary rerolls to Epic

### Boss drops:
- Guaranteed weapon drop at top rarity for zone (Forest → Rare, Dungeon → Epic, Volcano/Abyss → Legendary)
- Legendary drop weight for bosses is 100% (via `rollBossLoot`)

---

## Inventory & Gear

- Max inventory: 20 slots
- Equipment slots: Weapon, Armor
- **Auto-scrap**: Enabled/disabled per session. When inventory is full, incoming items are auto-sold for gold instead of a full-inventory block
- **Auto-equip**: When enabled, better items (by rarity tier then primary stat) are auto-equipped on loot
- **Sort modes**: Default (acquisition order), Rarity, Type
- Hover an inventory item to preview stats and comparison deltas vs equipped gear (click to select for actions)

### Off-class penalty:
- Item with `allowedClasses: ['warrior']` worn by a mage → 70% stat effectiveness
- Legendary items: cannot be equipped at all by off-class (0% effectiveness)
- Items with `allowedClasses: 'any'` have no penalty

### Sell prices:
| Rarity | Sell | Buy |
|--------|------|-----|
| Common | 5g | 20g |
| Uncommon | 15g | 60g |
| Rare | 40g | 150g |
| Epic | 120g | 450g |
| Legendary | 500g | 2000g |

---

## Item Special Effects

| Effect | Description |
|--------|-------------|
| `lifesteal` | Heal for X% of damage dealt each hit |
| `poison` | Apply damage-over-time at X% of DPS each tick |
| `dodge` | X% chance to completely avoid an enemy attack |
| `block` | X% chance to negate damage (full block) |
| `defIgnore` | Ignore X% of enemy DEF when calculating damage |
| `spellAmp` | (Mage only) Multiply raw damage by (1 + X%) after crit, before DEF |
| `critThreshold` | Crit on d20 ≥ threshold (lower = more crits) |
| `doublecast` | X% chance to attack twice in one tick (Mage) |
| `attackSpeedBonus` | Reduce player attack interval by X% |
| `regenOnKill` | Restore X% of max HP on kill (independent of class regen) |

---

## Shop & Codex

- **Shop tab**: Buy items available for the current zone. Shows weapons and armor in accordion groups by rarity. Gold displayed at top; items dim if unaffordable.
- **Codex tab**: Browse all items in the game by zone, including locked zones. Locked zones show items but cannot be purchased.

---

## Combat Log

Filterable log with four views:
- **All** — every event
- **Combat** — hits, crits, misses
- **Loot** — item drops, auto-equips, sells
- **System** — level-ups, deaths, regen, zone changes

Session stats bar shows kill count, boss kills, items looted, and gold earned for the current session.

---

## Effective Stats Panel (CharacterPanel)

Displays computed combat performance vs the current zone's average enemy:

| Stat | How it's computed |
|------|-------------------|
| DPS range | `max(1, weaponMin+statBonus - effEnemyDef)` – `max(1, weaponMax+statBonus - effEnemyDef)` |
| Crit chance | Warrior/Mage: 5%. Rogue: 100% if DEX≥12, else `(21-threshold)/20×100%` |
| Hit chance | `clamp((21-avgZoneDEF+DEX)/20×100%, 5%, 100%)` |
| Eff. DEF | `floor(armorDEF × offClassPenalty × warriorBonus)` |

---

## Item Pool by Zone

### Forest (zone 0) — Common
| Name | Type | Dmg/DEF | Specials |
|------|------|---------|---------|
| Rusty Sword | Weapon (Warrior) | 3–7 | — |
| Club | Weapon (Warrior) | 2–6 | — |
| Shiv | Weapon (Any) | 2–5 | — |
| Hunting Knife | Weapon (Any) | 2–4 | — |
| Crooked Staff | Weapon (Any) | 4–8 | — |
| Apprentice Wand | Weapon (Mage) | 3–6 | — |
| Leather Scraps | Armor (Any) | DEF +1, HP +5 | — |
| Worn Tunic | Armor (Any) | DEF +0, HP +8 | — |

### Dungeon (zone 1) — Uncommon
| Name | Type | Dmg/DEF | Specials |
|------|------|---------|---------|
| Iron Sword | Weapon (Any) | 6–11 | — |
| War Hammer | Weapon (Warrior) | 8–15 | — |
| Bone Dagger | Weapon (Rogue) | 3–8 | — |
| Twin Daggers | Weapon (Any) | 4–9 | — |
| Steel Dagger | Weapon (Rogue) | 5–11 | — |
| Throwing Knives | Weapon (Any) | 3–8 | Atk speed +10% |
| Ember Rod | Weapon (Mage) | 9–16 | — |
| Arcane Wand | Weapon (Any) | 7–13 | — |
| Battle Staff | Weapon (Mage) | 10–18 | — |
| Chainmail | Armor (Any) | DEF +3, HP +10 | — |
| Padded Armor | Armor (Any) | DEF +2, HP +12 | — |
| Linen Robe | Armor (Any) | DEF +1, HP +15 | — |
| Iron Shield | Armor (Warrior) | DEF +5, HP +6 | — |
| Shadow Cloak | Armor (Any) | DEF +2, HP +8 | — |
| Mage Robes | Armor (Any) | DEF +1, HP +12 | — |

### Volcano (zone 2) — Rare
| Name | Type | Dmg/DEF | Specials |
|------|------|---------|---------|
| Broad Sword | Weapon (Any) | 10–17 | — |
| Battle Axe | Weapon (Any) | 12–20 | — |
| Executioner's Axe | Weapon (Any) | 13–22 | Crit on 19+ |
| Venomblade | Weapon (Any) | 7–14 | Poison 15% |
| Cursed Blade | Weapon (Any) | 8–16 | Poison 20% |
| Spirit Blade | Weapon (Rogue) | 9–17 | Lifesteal 10% |
| Shadowstep Blade | Weapon (Rogue) | 10–18 | Atk speed +15% |
| Spellbreaker | Weapon (Any) | 12–20 | — |
| Crystal Staff | Weapon (Any) | 14–23 | — |
| Lightning Rod | Weapon (Mage) | 13–21 | Armor ignore 15% |
| Plate Armor | Armor (Any) | DEF +6, HP +20 | — |
| Bone Plate | Armor (Any) | DEF +7, HP +22 | — |
| Assassin's Garb | Armor (Any) | DEF +4, HP +15 | — |
| Scale Mail | Armor (Any) | DEF +6, HP +18 | Block 5% |
| Arcane Vestment | Armor (Any) | DEF +3, HP +20 | Spell amp 10% |
| Cursed Vestments | Armor (Any) | DEF +3, HP +18 | Spell amp 8% |

### Abyss (zone 3) — Epic
| Name | Type | Dmg/DEF | Specials |
|------|------|---------|---------|
| Shadowblade | Weapon (Any) | 15–24 | Lifesteal 10% |
| Storm Cleaver | Weapon (Any) | 17–27 | Crit on 19+, Atk speed +10% |
| Berserker Axe | Weapon (Warrior) | 20–32 | Lifesteal 8%, Atk speed +12% |
| Deathwhisper | Weapon (Any) | 12–20 | Crit on 15+ |
| Soul Reaper | Weapon (Any) | 14–23 | Lifesteal 12%, Crit on 16+ |
| Wraith Dagger | Weapon (Rogue) | 13–21 | Poison 18%, Dodge 10% |
| Voidstaff | Weapon (Any) | 18–30 | Armor ignore 35% |
| Arcane Surge | Weapon (Any) | 22–36 | Armor ignore 30%, Spell amp 15% |
| Dragonscale Mail | Armor (Any) | DEF +10, HP +35 | — |
| Thornmail | Armor (Any) | DEF +12, HP +38 | Block 12% |
| Blood Plate | Armor (Any) | DEF +13, HP +42 | Regen on kill 10% |
| Phantom Shroud | Armor (Any) | DEF +7, HP +25 | Dodge 20% |
| Shadow Veil | Armor (Any) | DEF +8, HP +28 | Dodge 25% |
| Starweave Robe | Armor (Any) | DEF +5, HP +30 | Spell amp 15% |
| Arcane Barrier | Armor (Any) | DEF +7, HP +36 | Spell amp 20% |

### Codex (Legendary — drop only or late endgame)
| Name | Type | Dmg/DEF | Specials |
|------|------|---------|---------|
| Void Edge | Weapon (Warrior) | 35–55 | Armor ignore 25%, Crit on 17+, Lifesteal 15% |
| Godslayer | Weapon (Warrior) | 30–50 | Lifesteal 20%, Armor ignore 15%, Crit on 18+ |
| Titan's Fist | Weapon (Warrior) | 45–70 | Lifesteal 25%, Armor ignore 20%, Atk speed +15% |
| Shadowdancer | Weapon (Rogue) | 28–45 | Crit on 13+, Atk speed +30%, Poison 20% |
| Wraithfang | Weapon (Rogue) | 25–42 | Poison 25%, Crit on 14+, Atk speed +25% |
| Phantom Blades | Weapon (Rogue) | 30–50 | Crit on 12+, Poison 30%, Atk speed +35% |
| Celestial Tome | Weapon (Mage) | 38–60 | Spell amp 30%, Doublecast 25%, Armor ignore 40% |
| Eternum | Weapon (Mage) | 35–55 | Armor ignore 50%, Doublecast 30% |
| Abyssal Tome | Weapon (Mage) | 42–65 | Armor ignore 60%, Doublecast 35%, Spell amp 20% |
| Aegis of Eternity | Armor (Warrior) | DEF +18, HP +60 | Block 10% |
| Voidweave Shroud | Armor (Rogue) | DEF +12, HP +40 | Dodge 30% |
| Archmage's Mantle | Armor (Mage) | DEF +8, HP +50 | Spell amp 25%, Regen on kill 15% |
| Abyssal Plate | Armor (Warrior) | DEF +25, HP +90 | Block 15%, Regen on kill 20% |
| Void Shroud | Armor (Rogue) | DEF +16, HP +60 | Dodge 35%, Regen on kill 10% |
| Rift Mantle | Armor (Mage) | DEF +11, HP +75 | Spell amp 40%, Regen on kill 20% |
