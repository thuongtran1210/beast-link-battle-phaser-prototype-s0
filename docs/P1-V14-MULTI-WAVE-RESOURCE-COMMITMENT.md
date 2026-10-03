# P1-V14 — Multi-Wave Resource Commitment

Status: **Experimental design direction / not adopted**.

## Problem statement

The original single-Battle loop did not give several existing systems enough strategic purpose.

Multi-Wave provides a future horizon so the project can test:
- deploy now vs preserve Beast resources
- injured veteran vs fresh Reserve
- several 1★ bodies vs higher-STAR power density
- spend Energy now vs later
- formation changes against different threats
- Combo quality as preparation efficiency

## Core hypothesis

A multi-Wave run can support meaningful resource commitment only if the player faces future opportunity cost.

## Experimental roadmap

### P1-V14A — Multi-Wave Run Structure

**Owner status: structural flow PASS / Experimental / not adopted.**

The Wave sequence is working correctly enough to continue.

### P1-V14B.1 — Partial Deployment + Persistent Reserve

Core implementation exists.

Goal:

```text
available Run Roster
→ deploy a legal subset
→ hold the rest in Reserve
```

Current Experimental Active Squad cap = 4.

Owner-live A–H remains a separate evidence gate.

### P1-V14B.2 — Persistent Unit Identity + HP Attrition

Core implementation exists.

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
- deployment membership / slot
- target / engagement
- cooldown / action state
- temporary shield
- temporary signature/buff runtime

Initial experiment:
- no free post-Wave heal
- 0 HP => KO / unavailable

Owner-live A–H remains a separate evidence gate.

### P1-V14B.3 — STAR Consolidation / Power Density

**Current active Experimental slice / owner authorized.**

Hypothesis:

**Higher STAR = power density per active slot.**

Desired trade-off:
- several 1★ units = breadth / bodies / lane coverage / more attack instances
- one higher-STAR unit = concentration / durability / output / signature strength / slot efficiency

Current code blocker:
- `StarConverter.bulk(...)` greedily converts BattleQueue counts into the highest affordable STAR
- therefore the player cannot currently choose `3 × 1★` versus `1 × 2★`

Required B.3 direction:
- stop automatic greedy consolidation
- recruit separate 1★ Run Unit instances
- keep STAR cost structure 1 / 3 / 9
- add manual Reserve-only consolidation
- do not use deployed or KO units as ingredients
- preserve health condition ratio
- centralize STAR stat scaling
- scale existing signatures by STAR without changing identity
- keep Active Squad cap = 4
- keep Formation Grid unchanged
- validate Breadth vs Density against deterministic threats

Read:
`docs/P1-V14B3-STAR-POWER-DENSITY.md`

### P1-V14C — Combo Rework: Preparation Efficiency

- **P1-V14C.1 — Combo Quality Signal**: Implemented / deterministic PASS. Decoupled 12.0s phase timer and 1.5s Combo window. MATCH COUNT = Beast quantity; COMBO = independent quality signal. Owner live gate open.
- **P1-V14C.2 — Link Shard Consolidation Efficiency**: Implemented / deterministic PASS. Best streak awards Link Shards (up to 2, cap 3) which substitute for 1 missing copy in Reserve consolidation (min 2 real bodies, 0 phantom HP).
- **P1-V14C.1a — First-Match Start Buffer**: Implemented / deterministic PASS. Beast Rush and Energy Rush enter READY with their 12.0s phase timer paused; the first valid match starts the timer exactly once. Invalid input does not start it. No READY safety timeout is included yet.
- **P1-V14C.1a.1 — Timing State Hardening & Repo Closeout**: Active / owner authorized. Hardens both puzzle timers so `ENDED → start()` is a no-op and only `reset()` can return the timer to READY. No gameplay economy/balance change.

Timing principle:

```text
puzzle phase timing measures execution after commitment,
not board-reading latency
```

Direction verified:

```text
match count
→ Beast quantity

Combo quality
→ consolidation efficiency (Link Shard)
```

### P1-V14D — Persistent Energy / Save-vs-Spend

**Next gameplay slice / not started.**

Test later:

```text
spend this Wave
vs
save for later threat
```

Do not expand Energy effect variety before this question is isolated.

### Future — Squad Capacity Upgrade

Not started.

Keep current Experimental cap fixed at 4 during B.3 so slot pressure remains measurable.

## Important model boundary

```text
Beast Queue
= preparation / recruitment output

Run Roster / Reserve
= persistent player unit instances

Active Squad
= current deployed subset, Experimental cap 4

Formation Grid
= tactical starting positions
```

Therefore:

```text
Run Roster size
≠ Squad capacity
≠ Grid capacity
```

Do not reconstruct damaged units from anonymous counts after Battle.

## Deferred complexity

Do not add during B.3:
- Squad Capacity upgrades
- Combo redesign
- Energy persistence redesign
- Link Shard
- revive/recovery
- items / equipment / traits
- economy / meta progression
- procedural Waves
- final STAR evolution art

## Relationship to Current Gameplay Spec

Current canonical Gameplay Spec v2 remains unchanged.

P1-V14 remains Experimental until evidence supports an explicit adoption decision.
