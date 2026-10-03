# P1-V13A.1 — Enemy Scenario Test Harness

Status: **Internal validation tooling / Experimental / player-facing GAME must remain read-only**.

Implementation evidence:

- P1-V13A.1 Enemy Board & Level Harness: `e3b64a09520a20e2b0d48d6a2fb7532d923e7d81`
- P1-V13A.2 Drag & Drop Deployment UX: `b94ce842f1573253f9f60f4e799a77aebeb75a4c`

## Why it exists

Beast signature and formation testing requires repeatable enemy compositions and starting positions.

The tool exists so a designer/tester can author deterministic combat scenarios without editing TypeScript for every test.

It is not a gameplay feature.

## Architecture boundary

The project now uses only:

- **GAME**
- **TEST HARNESS**

Separate Prototype / Showcase runtime concepts are retired.

### GAME

Enemy formation is player-readable but **read-only**.

GAME may show:

- Level name
- enemy composition
- Frontliner / Diver / Ranged identity
- starting formation
- threat information

GAME must not expose:

- add enemy
- remove enemy
- change archetype
- enemy quantity authoring
- clear/reset fixture editor controls
- custom enemy deployment editing
- validation presets

### TEST HARNESS

May add internal authoring around the same Battle Setup/combat systems.

Required scenario-composer direction:

- immutable `LevelDefinition`
- editable scenario copy
- stable unique enemy instance IDs
- add/remove enemies
- change archetype
- multiple instances of the same archetype
- exact Front/Mid/Back × Lane 1–6 starting slots
- visible unplaced Enemy Bench
- deterministic custom scenario
- reset to original LevelDefinition
- actual `EnemyFixture[]` generated from edited state

Do not add arbitrary world-space X/Y placement. The grid is the exact deployment language; autonomous movement begins after Battle starts.

## Shared combat path

Both contexts must use the same combat implementation.

```text
GAME
LevelDefinition
→ EnemyFixture[]
→ AutonomousBattleModel

TEST HARNESS
LevelDefinition
→ EditableEnemyScenario
→ EnemyFixture[]
→ AutonomousBattleModel
```

Do not fork battle rules for test tooling.

## Current UX finding

The current implemented setup tooling is not sufficient for efficient live signature validation.

Owner screenshot review on 2026-10-03 identified:

- enemy tokens still feel like debug stat cards
- test controls compete with Battle Setup
- enemy authoring source/palette is not visually connected enough to Enemy Formation
- formation hierarchy is weak
- Beast dock is oversized
- deployed vs undeployed state communication needs auditing
- Stored Energy occupies too much Setup space

The next active UX slice is documented in `P1-V13A1D-DEPLOYMENT-WORKSPACE-UX.md`.

## Test-only requirement

Any future Enemy Scenario Composer must be clearly marked **INTERNAL TEST** and must disappear completely from normal GAME UI.

This includes keyboard shortcuts and invisible authoring affordances: non-test runs must not be able to mutate enemy scenarios through hidden controls.
