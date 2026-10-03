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

**Implemented / code review PASS / live hypothesis validation open.**

Hypothesis:

**Higher STAR = power density per active slot.**

Desired trade-off:
- several 1★ units = breadth / bodies / lane coverage / more attack instances
- one higher-STAR unit = concentration / durability / output / signature strength / slot efficiency

Implementation baseline:
- recruitment produces separate 1★ Run Unit instances (greedy bulk conversion stopped)
- optional manual Reserve-only consolidation (cost structure: 1 / 3 / 9)
- aggregate health ratio preserved (no full-heal upon consolidation)
- KO and deployed units excluded from ingredients
- centralized STAR stat profile and signature scaling
- Active Squad cap = 4; Formation Grid unchanged

Read:
`docs/P1-V14B3-STAR-POWER-DENSITY.md`

### P1-V14C — Combo Rework: Preparation Efficiency

- **P1-V14C.1 — Combo Quality Signal**: Implemented / deterministic PASS. Decoupled 12.0s phase timer and 1.5s Combo window. MATCH COUNT = Beast quantity; COMBO = independent quality signal. Owner live gate open.
- **P1-V14C.2 — Link Shard Consolidation Efficiency**: Implemented / deterministic PASS. Best streak awards Link Shards (up to 2, cap 3) which substitute for 1 missing copy in Reserve consolidation (min 2 real bodies, 0 phantom HP).
- **P1-V14C.1a — First-Match Start Buffer**: Implemented / deterministic PASS. Beast Rush and Energy Rush enter READY with their 12.0s phase timer paused; the first valid match starts the timer exactly once. Invalid input does not start it.
- **P1-V14C.1a.1 — Timing State Hardening & Repo Closeout**: Implemented / deterministic PASS / live not recorded. Enforces strict terminal state rule: `ENDED → start()` is a NO-OP; `ENDED → update()` is a NO-OP; `remainingSeconds` stays 0; only `reset()` returns `ENDED → READY 12.0s`.

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

**ACTIVE GAMEPLAY SLICE / IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL**.

Tested trade-off:

```text
spend this Wave (protect units / reduce attrition)
vs
save for later threat (hoard tactical heal for tough waves)
```

Implementation baseline:
- `EnergyQueue` is Run-scoped as single source of truth.
- `resetWavePreparation()` preserves `energyQueue` across Waves.
- `restartRun()` clears `energyQueue`.
- Valid Energy matches add +1 to selected ID without wiping carried charges.
- Successful Battle casts consume exactly 1 selected charge; failed/post-end casts consume 0.
- No storage cap: charges may exceed 6 and 20 (`RuleConfig.energyMax` does not cap persistent charges).
- UI displays `CARRY IN ×N` and `STORED ×N` in Energy Rush, and `ENERGY CARRIED ×N` at Wave Result.

Read:
`docs/P1-V14D-PERSISTENT-ENERGY.md`

### P1-V14E — Multi-Wave Resource Commitment Integration Validation

Status: **IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED**

Purpose:
- validate the current V14 systems together across the existing 3-Wave horizon;
- prove that player commitments create persistent, readable consequences;
- add no new resource mechanic or balance layer;
- do not rank strategies or require a universal winner.

Harness and check suite:
- `src/game/run/MultiWaveCommitmentHarness.ts`
- `src/game/run/P1V14EChecks.ts` (34 checks pass)

Read:
`docs/P1-V14E-INTEGRATION-VALIDATION.md`

### P1-V14E.1 — Policy Semantics & Evidence Hardening

**ACTIVE corrective validation slice / owner authorized / code not started.**

Purpose:
- make Energy decision semantics explicit and policy-owned;
- add controlled SAVE vs SPEND evidence on identical Battle conditions;
- correct Link Shard earned / spent / remaining accounting;
- make divergence documentation match actual harness output;
- replace fake squad-cap evidence with the production cap constant;
- correct `SIMULATION_STEP = 0.1` timing wording.

No gameplay rule or balance value changes in E.1.

Read:
`docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`

### Future — Squad Capacity Upgrade

Not started.

Keep current Experimental cap fixed at 4 so slot pressure remains measurable.

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

Still deferred outside the active V14 integration-validation work:
- Squad Capacity upgrades (not started)
- new Tactical Energy types
- revive / resting recovery
- post-Wave healing rewards
- items / equipment / traits
- economy / meta progression
- procedural Waves
- final STAR evolution art

## Relationship to Current Gameplay Spec

Current canonical Gameplay Spec v2 remains unchanged.

P1-V14 remains Experimental until evidence supports an explicit adoption decision.
