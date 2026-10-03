# P1-V14D — Persistent Energy / Save-vs-Spend Across Waves

Status: **ACTIVE DESIGN SPEC / OWNER REVIEW REQUIRED / NOT IMPLEMENTED / EXPERIMENTAL / NOT ADOPTED**.

## Why V14D Exists

P1-V14 already gives Run persistence to:
- RunRoster unit identity;
- HP / KO attrition;
- STAR consolidation;
- Link Shards.

Energy is the remaining major preparation resource that is still cleared between Waves.

Current implementation in `ValidationScene.resetWavePreparation()` calls:

```ts
this.energyQueue.reset();
```

so unused Energy has no future value after a Wave.

V14D tests whether preserving unused Stored Energy creates a meaningful choice:

```text
spend now
→ protect current roster / reduce attrition

vs

save
→ carry tactical healing into a later threat
```

## Core Hypothesis

**Unused Stored Energy should remain a finite Run resource across Waves so current-Battle protection competes with future-Wave flexibility.**

The first V14D experiment changes Energy lifetime only.

Do not expand Energy effect variety yet.

## Run Ownership

`EnergyQueue` becomes a Run-scoped resource for the current Experimental multi-Wave run.

Persist across Wave transition:
- Energy ID;
- remaining charge count per ID;
- total remaining charges.

Reset only on:
- Restart;
- new Run.

Do not reset on:
- Wave Result;
- Continue to next Wave;
- Beast Rush entry;
- Energy Rush entry;
- Battle Setup entry.

## Wave Lifecycle

Target:

```text
Wave 1 Energy Rush
→ collect charges
→ Battle
→ optional casts consume charges
→ Wave Result
→ unused charges persist
↓
Wave 2 Beast Rush
→ Energy still owned by Run
↓
Wave 2 Energy Rush
→ existing charges + newly matched charges
→ Battle Setup
→ Battle
```

## Collection Rule

Preserve current P1 rule:

```text
1 valid Energy match
→ +1 charge of matched Energy ID
```

New charges add to existing carried charges.

Example:

```text
carry in:
energy-a ×2
energy-c ×1

Wave 2 Energy Rush:
match energy-a once
match energy-b once

after collection:
energy-a ×3
energy-b ×1
energy-c ×1
total = 5
```

## Spending Rule

Preserve current Battle rule:
- player may cast only while Battle status is Running;
- selected Energy ID must have at least 1 charge;
- successful cast consumes exactly 1 selected charge;
- existing Frontline Heal behavior remains +30 HP capped at target max HP;
- dead units are not revived;
- Battle continues autonomously.

No automatic Energy spending.

## No New Energy Capacity in V14D Baseline

**Do not add a new Energy storage cap in the first V14D experiment.**

Reason:
- V14D should isolate persistence / save-vs-spend first;
- adding a cap would introduce a second capacity-management hypothesis;
- the Run currently has only three deterministic Waves, so hoarding behavior can be observed directly.

Important:
- `RuleConfig.energyMax = 20` belongs to the historical P0 Energy gauge and must NOT be reused as a V14D cap;
- generated / visual-reference “Max 6” text is not gameplay truth and must not be adopted automatically.

If evidence later shows “save everything until final Wave” dominates, test a separate V14D.1 capacity experiment.

## No Decay / Free Refill

Between Waves:
- no Energy decay;
- no percentage loss;
- no automatic refill;
- no minimum refill;
- no conversion between Energy IDs.

The only ways charge count changes are:

```text
valid Energy match
→ +1

successful Battle cast
→ -1

Restart / new Run
→ 0
```

## First-Match Start Buffer Compatibility

Preserve P1-V14C.1a / C.1a.1:

Energy Rush still enters:

```text
READY 12.0s
→ first valid Energy match
→ ACTIVE timer
```

Carried Energy does not automatically start the timer.

The first valid Energy match:
- starts the timer exactly once;
- grants its normal +1 charge;
- adds to carried storage.

READY observation remains free.

## Combo Boundary

Do not add Energy Combo quality in V14D.

Beast Combo / Link Shard remains independent.

No:
- bonus Energy from Beast Combo;
- Link Shard → Energy conversion;
- Combo-based Energy efficiency.

## UI Requirements

### Energy Rush

The player must be able to distinguish prior carry from current total without a prose-heavy panel.

At phase entry, snapshot:

```text
carryIn = current EnergyQueue total
```

Compact presentation example:

```text
ENERGY
12.0s
READY

CARRY IN ×3
STORED ×3
```

After valid matches:

```text
STORED ×4
+1 <ENERGY ICON>
```

Existing per-ID rows / chips remain useful.

### Battle Setup

Stored Energy must reflect the same persistent queue.

Do not reconstruct or copy it into UI-owned state.

### Battle

Existing cast controls remain.

No redesign is required for the core V14D mechanics.

### Wave Result

Add a compact carry signal:

```text
ENERGY CARRIED ×N
```

This makes the save/spend consequence visible before the next Wave.

No loot/economy panel.

## Source of Truth

`EnergyQueue` remains the gameplay source of truth.

Do not create:
- a second persistent Energy store;
- UI-owned Energy state;
- separate per-Wave copy that later merges back.

Preferred ownership:

```text
ValidationScene / Run lifetime
→ EnergyQueue
→ Energy Rush adds
→ Battle consumes
→ Wave transition preserves
→ Restart resets
```

## Required Code Change Boundary

The central lifetime change should be minimal.

At Wave transition, `resetWavePreparation()` must continue to reset:
- Beast Rush timer;
- Combo quality;
- Energy Rush timer;
- BattleQueue;
- Formation/deployment state;
- Battle runtime;
- per-Wave metrics where appropriate.

But it must NOT clear the persistent EnergyQueue.

Restart/new Run still clears EnergyQueue.

## Deterministic Checks — Persistence

Required:

1. new Run starts with Energy total 0.
2. valid Energy match adds +1 selected ID.
3. Wave transition preserves unused Energy.
4. same-ID carried charge remains exact.
5. different-ID carried charges remain independent.
6. next Energy Rush begins with carried charges already present.
7. valid match in later Wave adds to carried count.
8. entering Beast Rush does not clear Energy.
9. entering Battle Setup does not clear Energy.
10. Start Battle does not clear Energy.

## Deterministic Checks — Spending

11. successful cast consumes exactly 1 selected charge.
12. other Energy IDs remain unchanged.
13. unused charges survive Battle end.
14. unused charges survive Wave Result.
15. carried charges are available in the next Battle.
16. failed cast consumes 0.
17. cast after Battle terminal state consumes 0.
18. no automatic spending occurs at Wave transition.

## Deterministic Checks — Reset

19. Restart clears all Energy charges.
20. new Run starts empty.
21. no previous-Run Energy leaks.
22. timer reset does not clear EnergyQueue.
23. Combo reset does not clear EnergyQueue.
24. formation reset does not clear EnergyQueue.

## Deterministic Checks — No New Cap

25. V14D does not clamp storage to P0 `energyMax = 20`.
26. V14D does not introduce generated “Max 6” gameplay behavior.
27. accumulation above 6 remains legal in this first persistence experiment.
28. accumulation remains integer and content-specific.

This is intentional Experimental behavior, not a final economy decision.

## Decision Harness

V14D should support a deterministic comparison between two legal policies.

### Policy A — Spend Now

Start Wave 1 with equivalent preparation.

During Battle:
- spend one or more Energy charges at a meaningful damage timing.

Expected:
- lower Energy carry-out;
- higher current roster HP / reduced immediate attrition when the heal is useful.

### Policy B — Save

Same starting preparation.

During Battle:
- do not cast.

Expected:
- higher Energy carry-out;
- potentially lower roster HP / greater current attrition.

Both policies must remain mechanically legal.

The experiment does NOT require one policy to be universally superior.

## Required Metrics

Keep instrumentation small.

At minimum record per Wave or in a V14D harness:
- energyCarryIn;
- energyCollected;
- energySpent;
- energyCarryOut;
- roster HP / KO result sufficient to compare spend vs save.

Do not create a new analytics framework.

## Live Validation

### Live A — Carry Forward

Wave 1:
- collect at least 3 charges;
- spend 0;
- win.

Wave 2 Energy Rush entry:
- prior charges are still present before the first new match.

### Live B — Partial Spend

Wave 1:
- collect at least 3;
- spend exactly 1;
- win.

Wave 2:
- carry count equals previous total minus 1.

### Live C — Add To Carried Energy

Wave 2:
- begin with carried Energy;
- make one valid match.

Expected:
- timer starts from READY;
- +1 charge is added to existing storage.

### Live D — Per-ID Persistence

Carry at least two different Energy IDs across Wave transition.

Expected:
- counts remain independent and exact.

### Live E — Save-vs-Spend Consequence

Compare two controlled runs:
- spend now;
- save.

Expected:
- spend path has lower carry-out;
- save path has higher carry-out;
- when heal timing is meaningful, roster HP / KO consequence may differ.

### Live F — No Free Refill

Spend all Energy in a Battle.

Next Wave:
- begin with 0 carried Energy;
- only new Energy Rush matches create charges.

### Live G — Restart

Finish or lose Run, then Restart.

Expected:
- Stored Energy = 0;
- no previous-Run leakage.

### Live H — UI Readability

Screenshots should make visible:
- carried amount entering Energy Rush;
- current Stored Energy;
- remaining Energy in Battle / Wave Result.

No prose-heavy instructions.

## Regression Requirements

Preserve:
- C.1a READY → first valid match timing;
- C.1a.1 terminal ENDED state;
- C.1 Combo quality behavior;
- C.2 Link Shard behavior;
- B.3 STAR behavior;
- RunRoster HP / KO persistence;
- Active Squad cap = 4;
- Formation Grid dimensions;
- autonomous Battle;
- existing +30 Frontline Heal fixture.

## Non-Goals

Do NOT implement:
- Energy storage cap;
- Energy decay;
- Energy Combo;
- bonus Energy from Combo;
- new Energy spell types;
- Catalyst;
- Energy crafting;
- Link Shard conversion;
- Squad Capacity upgrade;
- items / equipment;
- meta progression;
- account-level Energy;
- final balance tuning.

## Adoption Boundary

V14D remains Experimental.

Evidence levels remain separate:
1. code exists;
2. deterministic checks pass;
3. npm run check passes;
4. npm run build passes;
5. live browser flow;
6. owner verification;
7. real-player evidence;
8. adopted design.

Do not adopt Persistent Energy into Current Gameplay Spec v2 from implementation alone.