# AI_INSTRUCTIONS.md — Beast Link Battle Phaser Prototype

## Purpose

This repository is the Phaser gameplay validation prototype for **Beast Link Battle**.

This file is only a bootstrap / guardrail for AI-assisted development. It is **not** a gameplay specification and must not duplicate or redefine canonical rules from Notion.

## Canonical Source Priority

Before changing gameplay behavior, read these Notion sources in this order:

1. **00.0 — Current Project Handoff — Beast Link Battle**
2. **00 — Beast Link Battle — Current Gameplay Spec v2**
3. **00.2 — Decision Record — P1 Dual-Queue Core Loop**
4. **02 — Phaser Validation Prototype Spec — P1 Transition**
5. **02.1 — Phaser Implementation Matrix**
6. **02.4 — P1 Technical Scaffold — Dual Queue + Tactical Battle**
7. **03 — Validation Log — Beast Link Battle**
8. Current code.

Use **02.2 — P0 Technical Scaffold** only as historical implementation context.

## Current Project State

- P0 is complete and verified as a historical baseline.
- Current Gameplay Spec is **v2 / P1**.
- P1 structural implementation slices **P1-S0 through P1-S5** are closed in project documentation.
- Experimental variants **P1-V1** and **P1-V2** have already been implemented; P1-V1 was live verified.
- **Current active variant: P1-V3 — Extended Pre-Battle Timing.**
- P1-V3 is implemented in code with deterministic checks and production build reported passing.
- P1-V3 remains **Experimental / not adopted into Current Gameplay Spec**.
- **P1-V3 live-browser gate passed by project-owner confirmation on 2026-10-02.**
- **Current gate: P03 real-player validation on P1-V3.**
- Do not retune or expand gameplay scope during P03 unless a severe blocker prevents completion.

## P1-V3 Current Timing

These values are Experimental validation overrides, not canonical adopted design rules:

- Beast Rush: **12.0s initial / +0.3s per valid Beast match / 12.0s cap**
- Energy transition cue: **1.0s**, non-interactive
- Energy Rush: **12.0s countdown**
- Energy conversion: **+1 stored charge per valid Energy pair**

Canonical RuleConfig Combo baseline remains **5.0 / +0.3 / 5.0** unless the design source changes.

## Current Immediate Task

**P1-V4 Battle Action Readability passed check/build/live verification by project-owner confirmation; P03 fresh retest is active on locked code build `bee6a98ac480fe15f2723e88a39cfa6e0db5e93e`.**

Run P03 as a fresh real-player retest on locked build `bee6a98ac480fe15f2723e88a39cfa6e0db5e93e`, using P1-V3 timing plus P1-V4 Battle Action Readability. Do not reuse Battle-feel conclusions from earlier interrupted or insufficient-presentation runs. Do not retune unless a new severe blocker prevents completion.

P03 must capture:

1. Beast Rush timing/readability under the 12.0s Experimental window.
2. Energy Rush timing/readability under the 12.0s Experimental window.
3. Whether the player understands that Energy is stored for later Battle use.
4. Role / STAR / formation comprehension.
5. Whether autonomous Battle is understood without puzzle input.
6. When and why the player chooses to cast finite stored Energy.
7. Observed behavior, player statements, prototype metrics, and designer interpretation as separate evidence.

Do not treat one P03 session as a cross-player conclusion. P1-V3 remains Experimental and not adopted until the evidence supports an explicit decision.

## Mandatory Guardrails

- If Notion is inaccessible, stop. Do not implement gameplay from memory.
- If canonical sources conflict, report the conflict. Do not silently choose one.
- Do not invent missing values, timings, conversion rates, role stats, skill effects, slot layouts, or other open design decisions.
- Temporary validation values must be labeled **Experimental / prototype-only / not adopted**.
- Do not edit Current Gameplay Spec from code.
- Do not treat Unity implementation as the Design Source of Truth.
- Do not copy Unity architecture into Phaser.
- Keep Phaser validation-oriented and small.
- Work on one validation slice/variant at a time.
- Do not expand into later work until the active verification gate is closed.
- Reuse historical P0 systems only when they still satisfy current canonical rules.
- Do not refactor unrelated working code without a requirement from the active task.

## Implementation Workflow

For every implementation or validation slice:

1. Read the canonical sources above.
2. State the exact Rule IDs / design requirements affected.
3. Inspect current code before editing.
4. Report any implementation → design conflict found.
5. Change only the active slice/variant.
6. Add or maintain deterministic checks.
7. Run all still-relevant regression checks.
8. Run the production build.
9. Perform live-browser verification when visible flow changes.
10. Update **02.1 — Phaser Implementation Matrix** with actual implementation/verification status.
11. Update **00.0 — Current Project Handoff** with only milestone, latest verified state, blocker and next action.

Do not mark a rule or variant verified merely because code exists. It must pass the required checks and, when applicable, the live validation flow.


## Active Experimental Gate — P1-V5 Enemy Squad Battle Grid

P03 is paused while P1-V5 is verified.

Experimental P1-V5 fixture:
- 4 enemies
- 65 HP / 6 damage each
- mirrored enemy formation grid opposite the player formation
- aggregate incoming damage decreases as enemies die
- player damage targets enemy Front → Mid → Back, then lower column priority
- historical single-enemy default remains for P1-S3/P1-S4 regression checks

Do not present P1-V5 as adopted Current Gameplay Spec.

Current immediate task:
- run regression checks and production build,
- live verify mirrored battle grid,
- verify 4 enemy pressure/death behavior,
- verify Result → Restart,
- resume P03 only after the gate passes.


## Active Experimental Gate — P1-V6 Integrated Battle Setup Preview

P03 is paused while P1-V6 is verified.

P1-V6 presentation direction:
- Keep GamePhase.BattleSetup logically separate.
- Render Battle Setup on the same mirrored battlefield layout used by Battle.
- Show player formation and P1-V5 enemy squad simultaneously during setup.
- Preserve placement/reposition and Start Battle gating.
- Preserve P1-V5 combat math/fixtures and all prior P1 rules.
- Do not present P1-V6 as adopted Current Gameplay Spec.

Current immediate task:
- run regression checks and production build,
- live verify setup/battle layout continuity,
- verify enemy preview, placement, gating, P1-V5 combat, and Result → Restart,
- resume P03 only after this gate passes.


## Active Validation Gate — P03 Fresh Retest

P1-V7 Combat Pressure Tuning passed check/build/live verification by project-owner confirmation on 2026-10-02.

Locked P03 build:
`7b6239aa49d055580f0ea78026726e602f90eca4`

This build combines:
- P1-V3 pre-Battle timing,
- P1-V4 Battle Action Readability,
- P1-V6 integrated mirrored Battle Setup/Battle field,
- P1-V7 6-enemy combat-pressure tuning.

All of these remain Experimental validation layers unless separately adopted into Current Gameplay Spec.

Current immediate task:
- run P03 as a completely fresh real-player retest,
- capture observed behavior, player statements, metrics, and designer interpretation separately,
- specifically evaluate formation/frontline readability and whether longer Battle duration creates meaningful Energy Heal timing,
- do not reuse conclusions from earlier blocked/insufficient builds,
- do not retune during the session unless a new severe blocker prevents completion.


## Active Experimental Gate — P1-V8 Role Identity & Positional Combat

P03 is paused while P1-V8 is verified.

P1-V8 rules are opt-in for the validation scene:
- Tanker: Guard Strike only from Front.
- Assassin: Dive from Front/Mid, prioritizing deepest living enemy row.
- Ranger: Snipe from all rows with output Front 60% / Mid 80% / Back 100%, preferring deep same-lane targets.
- Mage: Arcane Burst, Front 70% / Mid-Back 100%, with adjacent-lane secondary damage at 50%.
- Battle presentation must animate attacks toward actual model-selected targets.
- P1-V7 enemy fixture / duration pressure remains active.
- Historical aggregate-combat default remains unchanged for legacy P1-S3/S4/V7 regression.

Do not present P1-V8 as adopted Current Gameplay Spec.

Current immediate task:
- run full regression checks and production build,
- live verify role identity and positional consequences,
- confirm Assassin dive / Ranger target / Mage burst are visually readable,
- confirm P1-V7 battle duration and Result → Restart remain valid,
- resume P03 only after this gate passes.


## Active Validation Phase — Cross-Player Cohort

P1-V8 Role Identity & Positional Combat passed check/build/live verification by project-owner confirmation on 2026-10-02.

Locked P03 code build:
`dfbdee4ea7545fb86b3720cf354dd8a339cdb6a7`

Current immediate task:
- run P03 as a completely fresh real-player retest on the locked build,
- if no severe blocker appears, close P03,
- continue P04/P05 and further sessions on the same build,
- gather cross-player evidence before adopting or rejecting Experimental V3–V8 changes,
- do not retune between sessions unless a severe blocker prevents completion.

Do not present V3–V8 as adopted Current Gameplay Spec until the evidence decision is recorded.


## Active Experimental Gate — P1-V9 Autonomous Movement & Formation Deployment

P03 is paused while P1-V9 is verified.

P1-V9 validation rules:
- BattleSetup grid defines deployment/spawn positions only.
- Battle units/enemies use model-space movement after combat starts.
- Deployment grid fades after Battle begins.
- Tanker/Assassin close distance before melee attacks.
- Ranger/Mage use range movement; Back Ranger should gain natural attack uptime without row damage multipliers.
- Enemy squad moves toward the actual player frontline and attacks only in melee range.
- Frontline Heal targets the actual forward living unit in movement combat.
- P1-V7 enemy fixture remains active.
- Historical legacy/V8 combat modes remain available for regression.

Do not present P1-V9 as adopted Current Gameplay Spec.

Current immediate task:
- run full regression checks and production build,
- live verify deployment continuity, grid fade, movement/range behavior, actual-position Heal, battle duration, and Result → Restart,
- resume P03 only after P1-V9 passes.


## Active Presentation Gate — P1-V10 Showcase UI / Capture Mode

P03 remains paused while P1-V9 movement and P1-V10 showcase presentation are verified.

P1-V10 rules:
- Showcase Mode is presentation-only and OFF by default.
- F1 toggles Validation / Showcase Mode.
- Space pauses/resumes Battle model ticking only in Showcase Mode.
- H hides/shows capture controls for clean screenshots.
- Showcase Battle HUD is compact and must keep Stored Energy Heal controls visible/clickable.
- Existing P1-V9 movement/combat/state rules must remain unchanged.
- Validation Mode remains the evidence-collection baseline.

Current immediate task:
- run full regression checks and production build,
- live verify P1-V9 movement behavior,
- live verify V10 mode toggle, pause/resume, clean-frame and compact Energy HUD,
- confirm Result → Restart,
- resume P03 only after V9/V10 gates pass.
