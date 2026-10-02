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
- **Live-browser verification for P1-V3 is the current gate.**
- Do **not** start P03 or expand gameplay scope until the P1-V3 live gate passes.

## P1-V3 Current Timing

These values are Experimental validation overrides, not canonical adopted design rules:

- Beast Rush: **12.0s initial / +0.3s per valid Beast match / 12.0s cap**
- Energy transition cue: **1.0s**, non-interactive
- Energy Rush: **12.0s countdown**
- Energy conversion: **+1 stored charge per valid Energy pair**

Canonical RuleConfig Combo baseline remains **5.0 / +0.3 / 5.0** unless the design source changes.

## Current Immediate Task

Perform **P1-V3 live-browser verification only**.

Verify:

1. Beast Rush uses the 12.0s Experimental window.
2. Valid Beast matches add exactly +0.3s without exceeding the 12.0s cap.
3. Beast Rush end locks puzzle input.
4. The 1.0s Energy transition cue remains intact and non-interactive.
5. Energy Rush begins with a 12.0s countdown.
6. Valid Energy matches still add +1 stored charge.
7. Energy timeout clamps at 0 and auto-enters BattleSetup exactly once.
8. Stored Energy persists into BattleSetup.
9. Formation, autonomous Battle, Frontline Heal, Result, metrics and Restart still function.
10. The full flow remains playable:
   **BeastRush → EnergyRush → BattleSetup → Battle → Result → Restart → BeastRush**

After the live gate passes, update the Phaser Implementation Matrix and Current Project Handoff before starting P03.

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
