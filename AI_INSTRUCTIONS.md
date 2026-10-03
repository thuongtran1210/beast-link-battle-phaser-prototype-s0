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

- Current Gameplay Spec is **v2 / P1** and remains authoritative.
- P1-V11D Tactical Formation Validation is owner-live PASS for the tested ruleset.
- P1-V12A combat readability exists in code.
- P1-V13A Beast Signature Identity exists at `7f7af78598e99cb18bbabb76c9cadc9c95de470f`.
- P1-V13A.1 Enemy Board / Level Harness exists at `e3b64a09520a20e2b0d48d6a2fb7532d923e7d81`.
- P1-V13A.2 Drag & Drop Deployment UX exists at `b94ce842f1573253f9f60f4e799a77aebeb75a4c`.
- P1-V13A full live signature A/B verification remains open.
- P1-V13A.1D Deployment Workspace Redesign remains **not passed** and is deferred as UX debt.
- **Active experimental direction: P1-V14 — Multi-Wave Resource Commitment.**
- **Active implementation slice: P1-V14A — Multi-Wave Run Structure.**

Do not treat V14 as adopted design.

## Why V14 is active

Owner review identified four connected core-loop gaps:

1. **Formation proof can be masked by quantity.**
   Strong matching can produce enough player bodies that enemy pressure becomes too weak to expose positional consequences.

2. **Beast Queue has no future horizon.**
   With only one Battle, using/deploying everything now is usually rational.

3. **STAR value is not yet a clear decision.**
   STAR 1 / 3 / 9 exists as conversion math, but the system has not shown why one higher-STAR unit should sometimes be preferable to several 1★ units.

4. **Combo lacks a distinct role.**
   Combo currently mainly extends matching opportunity / quantity rather than creating a separate efficiency/quality decision.

Multi-Wave is being tested because a later Wave may create real reasons to preserve resources.

## Current architecture: GAME + TEST HARNESS

Only two useful contexts remain:

### GAME

Player-facing flow.

### TEST HARNESS

Internal designer/developer tooling around the same GAME systems.

TEST HARNESS must never become:

- player feature
- sandbox mode
- custom battle mode
- production level editor
- portfolio-facing gameplay feature

Both contexts must use the same battle model.

## Active task — P1-V14A Multi-Wave Run Structure

### Goal

Implement the minimum structural run loop needed to test multiple Battle pressures in sequence.

Target Experimental flow:

```text
Wave 1
Beast Rush
→ Energy Rush
→ Battle Setup
→ Battle
→ Wave Result
→ Wave 2

Wave 2
Beast Rush
→ Energy Rush
→ Battle Setup
→ Battle
→ Wave Result
→ Wave 3

Wave 3
Beast Rush
→ Energy Rush
→ Battle Setup
→ Battle
→ Final Result
```

Three Waves are a validation fixture, not a canonical rule.

### Initial pressure fixtures

Use existing enemy archetype behavior where possible:

- Wave 1 → Frontline Pressure
- Wave 2 → Backline Dive
- Wave 3 → Protected Ranged

Do not create new enemy archetypes for V14A.

### V14A scope

Implement:

- run-level Wave index/state
- deterministic Wave definitions
- Wave Result distinct from Final Result
- non-final Battle win → next Beast Rush
- final Battle win → Final Result
- clean per-Wave battle/setup reset
- visible Wave identity in GAME/Test Harness where necessary
- deterministic transition checks
- Result/Restart compatibility

### Strict non-goals

Do NOT implement in V14A:

- persistent Beast Reserve
- Active Squad Limit
- STAR consolidation redesign
- new STAR multipliers
- Combo redesign
- Link Shard
- Energy persistence
- new Tactical Energy skills
- persistent unit HP
- permanent death attrition
- traits
- items
- economy
- procedural Waves
- enemy stat retuning purely to force difficulty
- V13A.1D UI redesign unless required to prevent V14A from functioning

Keep V14A structural.

## Planned later V14 slices

### V14B — Beast Reserve, Squad Limit & STAR Consolidation

Hypothesis:

Higher STAR should be **power density per active slot**.

Desired future trade-off:

- several 1★ units → breadth / bodies / lane coverage / more attack instances
- one higher-STAR unit → concentration / durability / output / signature strength / slot efficiency

The exact Active Squad limit is open and must be Experimental.

Do not make one side universally dominant.

### V14C — Combo Rework: Preparation Efficiency

Direction:

- phase duration independent from Combo
- match count → quantity
- Combo quality → efficiency/quality
- Combo becomes streak/milestone based rather than primarily extending total match time

Candidate mechanisms such as Link Shard, bonus Energy or Catalyst are **not locked**.

### V14D — Persistent Energy

Test:

```text
spend this Wave
vs
save for a later Wave
```

Validate persistence before expanding Energy into many new effects.

## P1-V13 status during V14

V13 is not retroactively passed.

- Beast signatures remain Experimental.
- full live A/B signature verification is still open.
- Deployment Workspace UX remains not passed.
- Test Harness boundary remains valid.

V14 may proceed because the owner has reprioritized the more fundamental core-loop horizon.

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

## Mandatory guardrails

- Do not edit Current Gameplay Spec because V14 code exists.
- Keep all V14 values Experimental.
- Do not use Unity implementation as Design Source of Truth.
- Keep deterministic combat logic shared.
- Do not add row/class damage bonuses to force formation value.
- Do not buff arbitrary enemy stats merely to manufacture a desired V14A result.
- Do not fork GAME and TEST HARNESS combat.
- Do not turn Test Harness scenario tooling into player gameplay.
- Work on one V14 slice at a time.

## V14A implementation workflow

1. Read canonical sources and `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`.
2. Read `docs/P1-V14A-MULTI-WAVE-RUN-STRUCTURE.md`.
3. Inspect PhaseController / run state / Battle result transitions before editing.
4. Report conflicts before implementing.
5. Add only Wave structure.
6. Add deterministic V14A checks.
7. Run historical regressions.
8. Run `npm run check`.
9. Run `npm run build`.
10. Live verify Wave 1 → 2 → 3 → Final Result.
11. Stop after V14A.

Do not start V14B automatically.
