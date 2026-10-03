# P1-V13A.1 — Enemy Scenario Test Harness

Status: **Internal validation tooling / Experimental / player-facing GAME must remain read-only**.

Implementation evidence:

- P1-V13A.1 Enemy Board & Level Harness: `e3b64a09520a20e2b0d48d6a2fb7532d923e7d81`
- P1-V13A.2 Drag & Drop Deployment UX: `b94ce842f1573253f9f60f4e799a77aebeb75a4c`

## Purpose

The Test Harness exists so a designer can create deterministic enemy scenarios without editing source for every validation case.

It is not a gameplay feature.

## Architecture boundary

The project uses only:

- **GAME**
- **TEST HARNESS**

GAME enemy formation is read-only.

TEST HARNESS may author scenarios, but must feed the same combat model.

## Required scenario-composer direction

- immutable `LevelDefinition`
- editable scenario copy
- stable unique enemy instance IDs
- add/remove enemies
- change archetype
- multiple instances of one archetype
- exact Front/Mid/Back × Lane 1–6 starting slots
- visible unplaced Enemy Bench
- deterministic custom scenario
- reset to original LevelDefinition
- actual `EnemyFixture[]` generated from edited state

Do not add arbitrary world-space X/Y placement.

## Current status

The existing Setup/Test Harness UI did not pass owner UX review.

Known issues include:

- debug-like enemy tokens
- weak formation hierarchy
- oversized Beast dock
- ambiguous deployment-state communication
- Stored Energy consuming too much Setup space
- test controls competing with GAME information

`P1-V13A1D-DEPLOYMENT-WORKSPACE-UX.md` records the redesign requirement.

That UX slice remains **not passed**, but it is temporarily deferred while P1-V14 tests the more fundamental multi-Wave resource horizon.

## V14 relationship

The Test Harness will still be useful for V14 because each Wave needs controlled deterministic enemy pressure.

However, V14A must not require the full composer redesign.

Use the smallest existing deterministic fixture path that can reliably create:

- Frontline Pressure
- Backline Dive
- Protected Ranged

Do not expand test-tool UI scope inside V14A unless necessary to run the Wave sequence.

## Test-only requirement

Enemy authoring remains **INTERNAL TEST** only.

Normal GAME must not expose add/remove/edit shortcuts or hidden scenario mutation.
