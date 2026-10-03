# AI_INSTRUCTIONS.md — Beast Link Battle

## Purpose

This repository contains the Phaser + TypeScript gameplay development build for **Beast Link Battle**.

This file is an AI implementation guardrail. It is **not** a gameplay specification and must not redefine canonical rules from Notion.

## Canonical source priority

Before changing gameplay behavior, read:

1. **00.0 — Current Project Handoff — Beast Link Battle**
2. **00 — Beast Link Battle — Current Gameplay Spec v2**
3. **00.2 — Decision Record — P1 Dual-Queue Core Loop**
4. **02 — Phaser Validation Prototype Spec — P1 Transition**
5. **02.1 — Phaser Implementation Matrix**
6. **02.4 — P1 Technical Scaffold — Dual Queue + Tactical Battle**
7. **03 — Validation Log — Beast Link Battle**
8. Current code

Use P0 / Unity documents only as historical implementation evidence.

If Notion is unavailable or sources conflict, stop and report the conflict instead of inventing a rule.

## Current project state

- Current Gameplay Spec is **v2 / P1**.
- P1-S0 through P1-S5 are historical closed structural slices.
- V11 tactical combat introduced per-unit timing, engagement, role positioning, enemy archetypes and formation counterplay.
- **P1-V11D Tactical Formation Validation is owner-live PASS.**
- P1-V12A combat readability exists in code.
- **P1-V13A Beast Signature Identity** exists at `7f7af78598e99cb18bbabb76c9cadc9c95de470f`.
- **P1-V13A.1 Enemy Board / Level Harness** exists at `e3b64a09520a20e2b0d48d6a2fb7532d923e7d81`.
- **P1-V13A.2 Drag & Drop Deployment UX** exists at `b94ce842f1573253f9f60f4e799a77aebeb75a4c`.
- Current owner review marks the current Battle Setup **UI/UX FAIL**.
- **Active gate: P1-V13A.1D — Deployment Workspace Redesign.**
- Do not start P1-V13B Tactical Energy until Setup UX and V13A live signature-testability are closed.

## Current architecture: GAME + TEST HARNESS

Do not reintroduce separate Prototype / Showcase / Production runtime concepts.

There are only two useful contexts now:

### GAME

The real player-facing flow.

Includes:

- Level information
- read-only enemy formation
- player deployment
- Beast roles/signatures
- Stored Energy
- autonomous Battle
- Result

GAME must not expose enemy authoring.

### TEST HARNESS

Internal designer/developer tooling attached around the same GAME systems.

May include:

- level fixtures
- enemy scenario composer
- add/remove/change enemy
- exact enemy deployment slots
- validation metrics
- test presets

TEST HARNESS is **internal only**.

It must never be treated as:

- player feature
- sandbox mode
- custom battle mode
- production level editor
- portfolio-facing gameplay feature

Both contexts must eventually use the same:

```text
EnemyFixture[]
→ AutonomousBattleModel
```

Only the source of the fixtures differs.

## P1-V13A signatures

Signatures are Experimental and Beast-defined, not Role-defined.

Current implementation direction:

- beast-a / beast-e → Guardian Brace
- beast-b → Ambush Strike
- beast-c / beast-f → Focus Shot
- beast-d → Arcane Bloom

Do not infer future Beast kits from these mappings.

Do not add mana, ultimate buttons, generic ability frameworks, traits, items or economy while the current gate is open.

## Active task — P1-V13A.1D Deployment Workspace Redesign

The current Battle Setup must be structurally redesigned, not merely re-spaced.

Required priorities:

1. Formation boards are the visual center.
2. Header becomes minimal: Level + threat, plus internal marker when Test Harness is active.
3. Beast dock becomes compact and clearly represents only undeployed units.
4. Board occupancy, Beast dock, remaining deployment count and Start Battle gating derive from one source of truth.
5. Deployed units do not remain visually available as undeployed cards.
6. Enemy archetypes are readable by icon/silhouette + label, not text/color alone.
7. HP/damage debug stats do not permanently dominate enemy tokens.
8. Stored Energy becomes compact during Setup.
9. Exact deployment slot is Front/Mid/Back × Lane 1–6; do not add arbitrary world-space placement.
10. Internal Enemy Scenario Composer is localized to Test Harness and must not pollute GAME UI.

### Internal scenario authoring requirement

Test Harness needs to support eventually:

- enemy quantity increase/decrease
- multiple instances of the same archetype
- add/remove/change archetype
- exact grid placement
- custom deterministic scenarios
- reset to immutable LevelDefinition
- actual battle spawn state derived from the edited scenario

This authoring capability is testing infrastructure only.

## Verification discipline

Never collapse these into one status:

1. code exists
2. deterministic checks pass
3. `npm run check` passes
4. `npm run build` passes
5. live browser flow passes
6. owner live verification passes
7. real-player evidence exists
8. design is adopted

A later item must not be claimed because an earlier one is true.

## Mandatory guardrails

- Do not edit Current Gameplay Spec because code changed.
- Experimental values must remain labeled Experimental / not adopted.
- Do not use Unity implementation as Design Source of Truth.
- Keep deterministic combat logic in `AutonomousBattleModel`; UI must not become gameplay authority.
- Deployment grid defines starting position; combat movement remains autonomous after Start Battle.
- Do not add row/class damage bonuses to force tactical differentiation.
- Do not retune combat simply to make arbitrary Test Harness scenarios winnable.
- Do not fork combat logic between GAME and TEST HARNESS.
- Do not create a separate Showcase gameplay path.
- Clean screenshots should come from GAME UI.
- Work on one active gate at a time.

## Implementation workflow

For each slice:

1. Read canonical Notion sources.
2. Inspect current code before editing.
3. Identify implementation/design conflicts.
4. Change only the active slice.
5. Add or maintain deterministic checks.
6. Run relevant historical regressions.
7. Run `npm run check`.
8. Run `npm run build`.
9. Perform live verification for visible interaction changes.
10. Update Notion implementation/validation status.
11. Do not mark PASS until the required live gate is explicitly complete.

## Current stop condition

After P1-V13A.1D implementation:

- report the commit SHA
- report files changed
- report state-source audit results
- report deployment UX behavior
- report Test Harness boundary behavior
- report deterministic checks
- report historical regressions
- report `npm run check`
- report `npm run build`
- report live UX observations

Then stop.

Do not start Tactical Energy automatically.
