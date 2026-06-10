# Changelog

All notable changes to AutoDungeon are documented here.

## [v2.0] — Core Systems Rework (Jun 2026)

Three-part rework of item balancing, drops, and prestige (PRs #58–#60).

### Changed — Item Balance (#58)
- **Formula-generated item stats** — all item stats now derive from zone-tier + rarity curves in `src/game/item-curves.ts`; definitions are declarative (tune progression by editing curve constants, not 237 stat blocks)
- **Special effect caps** enforced at consumption sites: spellAmp 50%, defIgnore 60%, lifesteal 30%, dodge/block 40%, doublecast 35%, attack-speed 30%, crit threshold floor 14
- **Enemy rescale** — boss DEF now tracks at-level DEX so every class hits ≥70% at zone level (was: nat-20-only vs late bosses); boss HP retuned for 15–120s fights; top-3-zone normals tapered ~25%
- **Priest rebalance** — regen chance 70% → 45%, regen power 1.4× → 1.5×
- **Economy** — sell/buy/enchant prices scale ×1.5 per zone tier; enchant cost growth softened (×1.6 per enchant instead of ×2 on a ×3 base) so gold stays relevant late-game
- Saved characters are migrated automatically: item stats rehydrate from current templates on load (enchants preserved)

### Changed — Drop System (#59)
- **Per-zone rarity weights** replace the flat table — deeper zones drop meaningfully better loot (Nightmare: 8% legendary); non-boss legendaries possible from Volcano onward
- **45% drop chance** on normal kills (bosses always drop, with rarity floors: Rare+ from Volcano, Epic+ from Celestial); kills now drop gold directly (0.35 × XP)
- **Bad-luck protection** — Rare+ guaranteed within 30 drops, Epic+ within 120, BiS legendary within 150 boss kills (base BiS chance doubled to 1/100)
- **72 new items** — zone gear sets for Forest/Dungeon/Volcano and 12 zone-appropriate BiS legendaries per zone; drop pools are tier-windowed so deep zones stop dropping starter gear

### Added — Prestige NG+ (#60)
- **Difficulty tiers** — each prestige raises enemy HP ×1.25 / ATK ×1.18 per tier, with XP/gold rewards scaling ×1.15 to match
- **Tier-scaled tokens** — `floor(level/10 × (1 + 0.5 × tier))`; bonus costs escalate ×1.5 per stack
- **Class Mastery** — prestige grants a mastery point spendable on any class's ascension bonus; respec for 5 tokens; Overkill and Blessed Regen now scale with stacks; Death Pact 3 → 5 stacks
- **New token sinks** — Transcend (+5 max level per stack, cap 100 → 125) and Loot Mastery (minimum drop rarity floor)

### Removed
- Project doc files (`handoff.md`, `AUTODUNGEON_CONTEXT.md`, `DEPLOY.md`, `FEATURES.md`, `ITEMS.md`) and AI-assistant config no longer live in the repository

---

## [Unreleased]

### Fixed
- **Skill point stat bonuses lost on level-up** — `applyXP()` and `applyOfflineRewards()` now preserve str/dex/int upgrade bonuses across every level-up (previously overwritten with raw base stats)
- **DeathModal dead code** — removed stale character-state re-derivation of xp/gold losses that was immediately overwritten by regex parse
- **Timer leaks** — `ShopPanel` and `EnchantPanel` now clear their flash-message timeouts on unmount
- **setInterval leak in shop store** — prune-expired-consumables interval is now cleaned up via `onScopeDispose`
- **Non-null assertion in SkillsPanel** — replaced unsafe `!` on `.find()` with a type-narrowing filter predicate
- **localStorage magic strings** — all hardcoded keys centralised in `src/utils/storage.ts` (`LS_KEYS`)
- **Crash when loot pool is empty** — `rollLoot` and `rollBisLoot` now return `null` instead of crashing if no matching item definition is found; all callers guard against null
- **Offline gold always 0 for low-XP enemies** — offline gold-per-kill is now `Math.max(1, ...)` so weak enemies always award at least 1 gold
- **`autoPickUpgrade` silent undefined return** — throws a clear error if called with an empty choices array instead of returning `undefined` typed as `UpgradeDef`
- **Duplicate `rollDamage` in engine.ts** — removed local copy, now imports from `formulas.ts`

### Changed
- Zone unlock level labels synced with actual unlock thresholds

---

## [v0.10.x] — Shop Overhaul & Reddit Feedback Round 2

### Added
- Hover/click item detail popover in ShopPanel
- Zone-gated shop stock and buff buy prices
- Skill points panel (`SkillsPanel`) replaces inline level-up modal
- Ascension bonuses panel in PrestigePanel

### Fixed
- Active panel and tab selections preserved across kills and panel switches
- Skill upgrades preserved across prestige
- All panels remain unlocked after prestige
- Unlock modals restored; prestige tab hidden until first prestige is earned

---

## [v0.9.x] — Wiki, Codex & Zone Persistence

### Added
- In-game wiki/codex with real enemy data, loot rules, and boss drop rates

### Fixed
- Zone progression and active zone persist correctly across saves and prestige
- Ascension panel remains unlocked after prestige and loads on all paths

---

## [v0.8.x] — Prestige System

### Added
- Prestige system with ascension tokens and prestige bonuses (XP Boost, Gold Boost, Head Start, Vitality, Fortune, Offline Efficiency)
- Class-specific ascension bonuses earned on each prestige (Overkill, Ghost Strike, Arcane Surge, Blessed Regen, Death Pact, Dragon Scales)
- Prestige bonuses are global and carry over to all character classes

### Fixed
- Character ID preserved on prestige (no duplicate save slots)
- Zone challenges reset on prestige so set items can be re-earned
- Combat pauses correctly during overlapping modals

---

## [v0.7.x] — Enchanting & Items

### Added
- Item enchanting system
- Set item bonuses
- Offline progress rewards

### Changed
- Enchanted items sell for 30% of total investment
