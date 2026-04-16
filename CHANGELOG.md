# Changelog

All notable changes to AutoDungeon are documented here.

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
