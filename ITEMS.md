# Autodungeon — Item Reference

## Rarity

| Rarity    | Drop chance | Max zone  | Sell price | Buy price |
|-----------|-------------|-----------|------------|-----------|
| Common    | 60%         | Any       | 5g         | 15g       |
| Uncommon  | 25%         | Any       | 15g        | 45g       |
| Rare      | 12%         | Any       | 40g        | 120g      |
| Epic      | 3%          | Any       | 120g       | 360g      |
| Legendary | 0.01%*      | Volcano†  | 500g       | Not sold  |

> *Legendary rolls that land on a non-Dragon kill are demoted to Epic.  
> †Forest caps at Rare; Dungeon caps at Epic; Volcano allows Legendary.

---

## Off-Class Penalty

Items list one or more allowed classes. Equipping an item outside its class applies a **30% stat reduction** (penalty ×0.7). Legendaries **cannot** be equipped at all by off-class characters.

| Condition                  | Multiplier |
|----------------------------|------------|
| Correct class (or `any`)   | ×1.0       |
| Wrong class (non-legendary)| ×0.7       |
| Wrong class (legendary)    | Blocked    |

---

## Starter Gear

Each class begins with one weapon and leather scraps armor. Starter items are common rarity.

| Class   | Starting Weapon  |
|---------|------------------|
| Warrior | Rusty Sword      |
| Rogue   | Shiv             |
| Mage    | Crooked Staff    |

All classes start with **Leather Scraps** armor.

---

## Weapons

### Common

| Name         | Allowed Classes | DMG     | Special | Drop zones    | Shop  |
|--------------|-----------------|---------|---------|---------------|-------|
| Rusty Sword  | Warrior         | 3 – 7   | —       | All           | No    |
| Shiv         | Any             | 2 – 5   | —       | All           | No    |
| Crooked Staff| Any             | 4 – 8   | —       | All           | No    |

> Common weapons drop in all zones but are not sold in the shop (they are starter items).

---

### Uncommon

| Name         | Allowed Classes | DMG     | Special | Drop zones    | Shop unlocks |
|--------------|-----------------|---------|---------|---------------|--------------|
| Iron Sword   | Any             | 6 – 11  | —       | All           | Forest       |
| Twin Daggers | Any             | 4 – 9   | —       | All           | Forest       |
| Arcane Wand  | Any             | 7 – 13  | —       | All           | Forest       |

---

### Rare

| Name         | Allowed Classes | DMG     | Special                         | Drop zones         | Shop unlocks |
|--------------|-----------------|---------|---------------------------------|--------------------|--------------|
| Broad Sword  | Any             | 10 – 17 | —                               | Dungeon, Volcano   | Dungeon      |
| Venomblade   | Any             | 7 – 14  | Poison 15% DPS multiplier       | Dungeon, Volcano   | Dungeon      |
| Spellbreaker | Any             | 12 – 20 | —                               | Dungeon, Volcano   | Dungeon      |

---

### Epic

| Name        | Allowed Classes | DMG     | Special                         | Drop zones | Shop unlocks |
|-------------|-----------------|---------|---------------------------------|------------|--------------|
| Shadowblade | Any             | 15 – 24 | Lifesteal 10%                   | Volcano    | Volcano      |
| Deathwhisper| Any             | 12 – 20 | Crit threshold lowered to 15+   | Volcano    | Volcano      |
| Voidstaff   | Any             | 18 – 30 | Armor ignore 35%                | Volcano    | Volcano      |

---

### Legendary

| Name      | Allowed Classes | DMG     | Special                                                       | Drop zones | Shop |
|-----------|-----------------|---------|---------------------------------------------------------------|------------|------|
| Godslayer | Warrior only    | 30 – 50 | Lifesteal 20%, Armor ignore 15%, Crit threshold 18+           | Volcano†   | No   |
| Wraithfang| Rogue only      | 25 – 42 | Poison 25%, Crit threshold 14+, Attack speed +25%             | Volcano†   | No   |
| Eternum   | Mage only       | 35 – 55 | Armor ignore 50%, Doublecast 30%                              | Volcano†   | No   |

> †Legendary weapons only drop from the Dragon (boss-tier enemy) in the Volcano zone.

---

## Armor

### Common

| Name          | Allowed Classes | DEF | HP  | Special | Drop zones | Shop |
|---------------|-----------------|-----|-----|---------|------------|------|
| Leather Scraps| Any             | +1  | +5  | —       | All        | No   |

---

### Uncommon

| Name         | Allowed Classes | DEF | HP   | Special | Drop zones | Shop unlocks |
|--------------|-----------------|-----|------|---------|------------|--------------|
| Chainmail    | Any             | +3  | +10  | —       | All        | Forest       |
| Shadow Cloak | Any             | +2  | +8   | —       | All        | Forest       |
| Mage Robes   | Any             | +1  | +12  | —       | All        | Forest       |

---

### Rare

| Name             | Allowed Classes | DEF | HP   | Special             | Drop zones       | Shop unlocks |
|------------------|-----------------|-----|------|---------------------|------------------|--------------|
| Plate Armor      | Any             | +6  | +20  | —                   | Dungeon, Volcano | Dungeon      |
| Assassin's Garb  | Any             | +4  | +15  | —                   | Dungeon, Volcano | Dungeon      |
| Arcane Vestment  | Any             | +3  | +20  | Spell amp 10%       | Dungeon, Volcano | Dungeon      |

---

### Epic

| Name             | Allowed Classes | DEF | HP   | Special             | Drop zones | Shop unlocks |
|------------------|-----------------|-----|------|---------------------|------------|--------------|
| Dragonscale Mail | Any             | +10 | +35  | —                   | Volcano    | Volcano      |
| Phantom Shroud   | Any             | +7  | +25  | Dodge 20%           | Volcano    | Volcano      |
| Starweave Robe   | Any             | +5  | +30  | Spell amp 15%       | Volcano    | Volcano      |

---

### Legendary

| Name               | Allowed Classes | DEF | HP   | Special                                    | Drop zones | Shop |
|--------------------|-----------------|-----|------|--------------------------------------------|------------|------|
| Aegis of Eternity  | Warrior only    | +18 | +60  | Block 10%                                  | Volcano†   | No   |
| Voidweave Shroud   | Rogue only      | +12 | +40  | Dodge 30%                                  | Volcano†   | No   |
| Archmage's Mantle  | Mage only       | +8  | +50  | Spell amp 25%, Regen on kill 15%           | Volcano†   | No   |

> †Legendary armor only drops from the Dragon in the Volcano zone.

---

## Special Effects Reference

| Effect              | Description |
|---------------------|-------------|
| Lifesteal X%        | Heals the player for X% of damage dealt on each hit |
| Poison X%           | Applies a damage-over-time effect equal to X% of the weapon's DPS multiplier |
| Dodge X%            | X% chance to completely avoid an incoming enemy attack |
| Block X%            | X% chance to reduce incoming damage (warrior passive synergy) |
| Armor ignore X%     | Reduces effective enemy DEF by X% before damage is calculated |
| Spell amp X%        | Increases mage spell damage output by X% |
| Crit threshold N+   | Rogue crits on d20 roll of N or higher (default threshold is 17) |
| Doublecast X%       | X% chance to attack twice in one turn (mage only) |
| Attack speed +X%    | Reduces time between player attacks by X% |
| Regen on kill X%    | Restores X% of max HP when an enemy is slain |

---

## Zone Drop Summary

| Zone    | Unlock level | Max rarity | Enemies                               |
|---------|--------------|------------|---------------------------------------|
| Forest  | 1            | Rare       | Wolf, Goblin, Bandit                  |
| Dungeon | 5            | Epic       | Skeleton, Orc, Dark Knight            |
| Volcano | 12           | Legendary† | Fire Elemental, Wyvern, Dragon†       |

> †Only the Dragon can drop Legendary items.
