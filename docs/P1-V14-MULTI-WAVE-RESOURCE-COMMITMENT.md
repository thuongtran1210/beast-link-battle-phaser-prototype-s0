# P1-V14 — Multi-Wave Resource Commitment

Status: **Experimental design direction / not adopted**.

## Problem statement

The current single-Battle loop does not yet give several existing systems enough strategic purpose.

### Formation

When Beast matching produces many player units and enemy fixtures are weak, raw quantity can dominate the encounter and hide positional consequences.

### Beast Queue

With no later Battle, there is little reason to preserve resources.

### STAR

STAR 1 / 3 / 9 exists as conversion math, but the game has not demonstrated why one higher-STAR unit should sometimes be preferable to several 1★ units.

### Combo

Combo currently mainly increases matching opportunity / resource quantity.

It does not yet represent a separate preparation-quality decision.

### Energy

With one Battle horizon, saving Energy for later is weak or meaningless.

## Core hypothesis

A multi-Wave run creates a future horizon.

That future can support:

- commit now vs preserve Beast resources
- multiple 1★ bodies vs higher-STAR power density
- current Wave Energy spend vs later Wave conservation
- changing formation against different threats
- Combo quality as preparation efficiency rather than just more time

## Experimental roadmap

### P1-V14A — Multi-Wave Run Structure

Structure only.

```text
Wave 1
Beast Rush → Energy Rush → Battle Setup → Battle → Wave Result
↓
Wave 2
Beast Rush → Energy Rush → Battle Setup → Battle → Wave Result
↓
Wave 3
Beast Rush → Energy Rush → Battle Setup → Battle → Final Result
```

Initial deterministic pressure direction:

- Wave 1 — Frontline Pressure
- Wave 2 — Backline Dive
- Wave 3 — Protected Ranged

Three Waves are only the first validation fixture.

### P1-V14B — Beast Reserve, Active Squad Limit & STAR Consolidation

Hypothesis:

**Higher STAR = power density per active slot.**

Desired trade-off:

- several 1★ units
  - more bodies
  - more lanes covered
  - more attack instances
  - broader protection/pressure

- one higher-STAR unit
  - less slot usage
  - more concentrated durability/output
  - stronger signature expression
  - higher slot efficiency

The exact active-squad size is not locked.

The system should fail validation if:

- the player always prefers multiple 1★ units
- or the player always consolidates immediately

The target is situational preference.

### P1-V14C — Combo Rework: Preparation Efficiency

Direction:

```text
match count
→ quantity

Combo quality
→ efficiency / quality
```

Phase duration should become independent from Combo.

Combo should be tested as a streak/milestone mechanic rather than mainly extending total match time.

Candidate Beast rewards:

- upgrade efficiency
- flexible upgrade resource such as a Link Shard

Candidate Energy rewards:

- bonus charge
- future Catalyst-like efficiency

These are **candidate mechanisms only**.

Do not lock exact thresholds or rewards before the V14C slice.

### P1-V14D — Persistent Energy / Save-vs-Spend

Energy should persist across Waves so the player can choose:

```text
spend now
vs
save for later threat
```

Test persistence before adding many new Energy spell types.

## Deliberately deferred

Do not combine these into the first experiment:

- persistent unit HP
- permanent death attrition
- mana / ultimates
- traits
- items
- economy
- procedural Waves
- large Tactical Energy expansion

## Relationship to Current Gameplay Spec

Current Gameplay Spec v2 remains unchanged.

P1-V14 is an Experimental proposal until:

- implementation evidence exists
- required live validation passes
- player evidence supports it where applicable
- an explicit adoption decision is recorded
