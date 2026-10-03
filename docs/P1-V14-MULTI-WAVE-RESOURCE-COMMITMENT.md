# P1-V14 — Multi-Wave Resource Commitment

Status: **Experimental design direction / not adopted**.

## Problem statement

The original single-Battle loop did not give several existing systems enough strategic purpose.

Multi-Wave now provides a future horizon, but owner validation exposed the next blockers:
- Start Battle forces all available Beasts to be deployed.
- player units effectively return to later Waves at full HP.

Until those are fixed, the project still cannot prove hold-vs-deploy or injured-vs-fresh decisions.

## Core hypothesis

A multi-Wave run can support:

- commit now vs preserve Beast resources
- reuse injured Beast vs field fresh Reserve
- multiple 1★ bodies vs higher-STAR power density
- current-Wave Energy spend vs later-Wave conservation
- formation changes against different threats
- Combo quality as preparation efficiency

## Experimental roadmap

### P1-V14A — Multi-Wave Run Structure

**Owner status: structural flow PASS / Experimental / not adopted.**

The Wave-flow question is sufficiently proven to continue.

### P1-V14B.1 — Partial Deployment + Persistent Reserve

Goal:

```text
available Run Roster
→ deploy a legal subset
→ hold the rest in Reserve
```

Start Battle must not require Reserve to be empty.

A finite Active Squad limit may be used as an Experimental fixture to create slot pressure.

### P1-V14B.2 — Persistent Unit Identity + HP Attrition

Goal:

```text
same Run Unit
→ Battle
→ damaged HP reconciles
→ next Wave
→ same Run Unit, same remaining HP
```

Persist:
- identity
- STAR
- current HP
- KO

Reset:
- temporary Battle action/signature/shield/target state

Initial experiment:
- no free post-Wave heal
- 0 HP => KO / unavailable for later Wave

### P1-V14B.3 — STAR Consolidation / Power Density

Blocked until B.1/B.2 pass.

Hypothesis:

**Higher STAR = power density per active slot.**

Desired trade-off:
- several 1★ units = breadth / bodies / lane coverage / more attack instances
- one higher-STAR unit = concentration / durability / output / signature strength / slot efficiency

### P1-V14C — Combo Rework: Preparation Efficiency

Deferred until Run Roster foundation is stable.

Direction:

```text
match count
→ quantity

Combo quality
→ efficiency / quality
```

Exact rewards remain open.

### P1-V14D — Persistent Energy / Save-vs-Spend

Deferred.

Test later:

```text
spend this Wave
vs
save for later threat
```

Do not expand Energy effect variety before this question is isolated.

## Important model boundary

Beast Queue and Run Roster are different concepts.

```text
Beast Queue
= preparation/recruitment output

Run Roster / Reserve
= persistent player unit instances across Waves
```

Do not reconstruct damaged units from anonymous counts after Battle.

## Current active doc

Read:

`docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`

## Deferred complexity

Do not add during B.1/B.2:
- STAR redesign
- Combo redesign
- Energy persistence redesign
- revive/recovery
- items/traits/economy
- procedural Waves
- large Tactical Energy expansion

## Relationship to Current Gameplay Spec

Current canonical gameplay spec remains unchanged.

P1-V14 remains Experimental until evidence supports an explicit adoption decision.
