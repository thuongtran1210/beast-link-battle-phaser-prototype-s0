# P1-V14D — Persistent Energy / Save-vs-Spend Across Waves

Status: **IMPLEMENTED / DETERMINISTIC PASS / LIVE A–H OPEN / EXPERIMENTAL / NOT ADOPTED**

## Why V14D Exists

P1-V14 already gives Run persistence to:
- RunRoster unit identity;
- HP / KO attrition;
- STAR consolidation;
- Link Shards.

Energy was the remaining major preparation resource that was still cleared between Waves.

In previous implementations, `ValidationScene.resetWavePreparation()` called:

```ts
this.energyQueue.reset();
```

which destroyed all unused Energy after every Wave. This prevented players from making meaningful strategic trade-offs between:
- **Spend Now**: Cast Frontline Heal in the current Battle to protect active units and reduce immediate roster attrition.
- **Save for Later**: Conserve Tactical Energy to accumulate multiple healing charges for subsequent, higher-threat Waves.

Under V14D:
- Unused stored Energy persists across Waves.
- `EnergyQueue` is Run-scoped, resetting only on `restartRun()` or when starting a new Run.
- No artificial storage cap is imposed: accumulation above 6 and above historical 20 charges is fully legal.
- `RuleConfig.energyMax = 20` remains isolated to historical P0 gauge semantics and does not cap P1 persistent charges.

## Core Hypothesis

```text
Unused Stored Energy becomes a persistent Run resource so that
spending now directly competes with saving for later threats.
```

The player can choose:

A.
```text
spend Energy now
→ protect current roster
→ reduce immediate attrition
```

or:

B.
```text
save Energy
→ carry tactical healing
→ preserve options for later Waves
```

Neither path is intended to universally dominate.

## Core Gameplay Rules & Invariants

### Single Source of Truth
`EnergyQueue` remains the single, authoritative gameplay store of Energy charges. No secondary store or UI-side caching is created.

### Wave Transition Lifetime
At Wave transition (`advanceToNextWave() → resetWavePreparation()`):
- Beast Rush timer, Combo quality tracker, and Energy Rush timer reset to `READY 12.0s`.
- `BattleQueue` clears (new recruitment per wave).
- `BattleFormation` and `AutonomousBattleModel` reset (deployment cleared to `ACTIVE 0 / 4`).
- **`energyQueue` is NOT reset**: All unused charges remain intact in the queue.

### Restart & New Run
`restartRun()` invokes `energyQueue.reset()`, ensuring that any new Run starts with exactly 0 Energy charges and zero cross-run leakage.

### Energy Collection Rule
- During Energy Rush, 1 valid match of an Energy pair adds exactly +1 charge of that specific Energy ID (`energy-a` through `energy-f`).
- Carried charges from previous Waves remain present; newly matched charges are added to the existing totals.
- Energy Rush timer enters `READY 12.0s`; board observation is free and carried Energy does NOT auto-start the countdown. Only the first valid match starts the timer (`READY → ACTIVE 12.0s`).

### Energy Spending Rule
- During Battle, clicking an available Energy button invokes `castFrontlineHeal(energyId, energyQueue)`.
- A successful cast consumes exactly 1 charge of the selected Energy ID, healing the frontmost living ally for +30 HP (clamped at unit max HP).
- Casts are only accepted while Battle `status === 'Running'`.
- Failed casts or casts after battle completion consume 0 charges.
- No automatic spending occurs at battle start, wave result, or phase transition.

### No Decay, No Free Refill, No Storage Cap
- **No decay**: Carried Energy does not expire, degrade, or suffer percentage loss between Waves.
- **No free refill**: Ending a Wave with 0 Energy results in starting the next Wave with 0 Energy.
- **No cap**: Stored charges may accumulate beyond 6 and beyond historical 20. Neither `RuleConfig.energyMax` nor visual mockup limits clamp persistent charges in this experiment.

## UI Presentation

### Energy Rush HUD
- At Energy Rush entry, `energyCarryIn` snapshots the existing total charges.
- The Right Rail queue card displays:
  - With carried Energy: `STORED ×${total} (CARRY IN ×${carryIn})`
  - Without carried Energy: `STORED ×${total}`
- Per-ID chips show individual energy counts (e.g., `energy-a (A) ×3`).
- Valid matches immediately increment the matched chip count and stored total.

### Battle Setup UI
- Battle Setup reads directly from `this.energyQueue.getAll()`, displaying all available charges (carried + freshly matched) in the `⚡ STORED ENERGY` panel before Battle starts.

### Battle UI
- Energy cast buttons display current available charges per ID.
- Successfully casting decrements the charge count live and updates the top HUD counter.

### Wave Result UI
- Upon clearing a Wave, the Result overlay prominently displays:
  ```text
  ENERGY CARRIED ×N
  ```
  making the save-vs-spend outcome immediately visible to the player before continuing to the next Wave.

## Metrics Tracking

`SessionMetrics` is extended with four lightweight tracking fields:
- `energyCarryIn`: Number of charges carried into Energy Rush.
- `energyCollected`: Number of new charges gained from puzzle matches during the Wave.
- `energySpent`: Number of charges successfully consumed via Battle casts.
- `energyCarryOut`: Number of unused charges remaining at Battle / Wave Result.

## Spend-vs-Save Decision Harness

File: `src/game/energy/PersistentEnergyHarness.ts`

A deterministic comparison harness evaluates two legal policies on identical starting conditions:
- **Policy A (SPEND NOW)**: Casts Frontline Heal when active units take damage >= 30 HP.
  - Consumes Energy charges (`energySpent > 0`, `energyCarryOut < energyCarryIn`).
  - Preserves frontline unit HP and reduces immediate roster attrition.
- **Policy B (SAVE)**: Holds all Energy charges throughout Battle without casting.
  - Preserves full Energy hoard (`energySpent === 0`, `energyCarryOut === energyCarryIn`).
  - Unit HP remains lower, accepting immediate attrition to store resources for future Waves.

Both policies execute deterministically and remain fully legal.

## Deterministic Verification

File: `src/game/energy/P1V14DChecks.ts`

Includes 28 checks plus Decision Harness verification:

### Persistence Checks (1–10)
1. New Run starts with Energy total 0.
2. Valid Energy match adds +1 to selected ID.
3. Wave transition preserves unused Energy (`resetWavePreparation` preserves queue).
4. Same-ID carried charge count remains exact.
5. Different-ID charges remain independent.
6. Next Energy Rush begins with carried charges present.
7. Later valid Energy match adds to carried count.
8. Entering Beast Rush does not clear Energy.
9. Entering Battle Setup does not clear Energy.
10. Start Battle does not clear Energy.

### Spending Checks (11–18)
11. Successful cast consumes exactly 1 selected charge.
12. Other Energy IDs remain unchanged.
13. Unused charges survive Battle end.
14. Unused charges survive Wave Result.
15. Carried charges are available in next Battle.
16. Failed cast consumes 0 charges.
17. Cast after Battle reaches terminal state consumes 0 charges.
18. Wave transition performs no automatic spending.

### Reset Checks (19–24)
19. Restart clears `EnergyQueue`.
20. New Run after Restart begins empty.
21. No previous-Run Energy leakage.
22. Energy timer reset does not clear queue.
23. Combo reset does not clear queue.
24. Formation reset does not clear queue.

### No Storage Cap Checks (25–28)
25. Accumulation above 6 is legal (verified with 7 charges).
26. Accumulation above historical 20 is legal (verified with 22 charges).
27. `RuleConfig.energyMax = 20` does not clamp P1 persistent charges.
28. Per-ID counts remain integer and content-specific.

### Harness Check (29)
29. Decision harness confirms Policy A (Spend Now) results in lower `energyCarryOut` and higher roster HP, while Policy B (Save) carries all charges forward.

## Preserved Regressions

- **P1-V14C.1a / C.1a.1**: Both puzzle timers start at `READY 12.0s`; first valid match starts countdown; `ENDED → start()` is a strict NO-OP; only `reset()` returns `ENDED → READY`.
- **P1-V14C.1**: Match count = Beast quantity; Combo = quality signal; 1.5s link window; invalid input does not alter phase timer.
- **P1-V14C.2**: Link Shards (streak 4–6: 1, 7+: 2, cap 3); Wave persistence; 2-copy + 1 shard assisted consolidation; minimum 2 real bodies; 0 phantom HP.
- **P1-V14B.3**: Separate 1★ recruitment; manual Reserve consolidation; STAR scaling; Active Squad cap = 4; Formation Grid unchanged.
- **P1-V14B.1 / B.2**: Persistent RunRoster; HP / KO attrition; per-Wave deployment reset (`ACTIVE 0 / 4` at each setup); living survivors + new recruits coexist in Reserve.
- **Squad Capacity Upgrade**: NOT STARTED.

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
