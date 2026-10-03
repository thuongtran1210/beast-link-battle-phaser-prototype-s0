# P1-V14E — Multi-Wave Resource Commitment Integration Validation

Status: **IMPLEMENTATION EXISTS / DETERMINISTIC HARNESS EXISTS / EVIDENCE HARDENING REQUIRED / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED**.

## Purpose

P1-V14A through P1-V14D now provide the pieces required for a meaningful multi-Wave commitment loop:

- Multi-Wave future horizon;
- persistent RunRoster identity;
- HP / KO attrition;
- manual STAR consolidation / power density;
- Combo quality as an independent execution signal;
- Link Shard consolidation efficiency;
- first-valid-match timer start;
- persistent Stored Energy with spend-now vs save-for-later.

P1-V14E does **not** add another resource mechanic.

It validates whether these systems create understandable, persistent consequences when combined across the existing deterministic three-Wave run.

## Core Question

> Do current preparation decisions change later-Wave options in a way the player can observe and understand?

The target is not to prove one strategy is best.

The target is to prove:

```text
choice now
→ persistent resource/body-state consequence
→ later-Wave option changes
→ readable reason for the difference
```

## Existing Three-Wave Horizon

Use the current V14A Wave sequence:

1. Wave 1 — Frontline Pressure
2. Wave 2 — Backline Dive
3. Wave 3 — Protected Ranged

Do not add procedural Waves or rebalance Wave fixtures in V14E unless required to repair a concrete deterministic defect.

## Decision Axes To Validate

### A. Bodies vs STAR Density

Player can preserve several separate bodies or consolidate same-Beast copies.

Validate consequences such as:
- number of living bodies;
- occupied Active slots;
- total available Reserve bodies;
- STAR distribution;
- HP concentration;
- role mix available for later Waves.

Do not declare breadth or density universally superior.

### B. Current Deployment vs Future Roster

Player may deploy only part of the living roster.

Validate:
- deployed units can become injured / KO;
- held Reserve bodies preserve their current state;
- after Battle, living survivors return to Reserve;
- next Battle Setup begins with deployment cleared;
- later-Wave squad selection differs because of earlier attrition.

### C. Combo Quality → Link Shard Efficiency

For equal Beast match quantity, different best streak quality can produce different Link Shard resources.

Validate:
- Beast quantity remains equal when match count is equal;
- high-quality Combo can produce Link Shards;
- Link Shards can reduce consolidation body cost;
- shard use changes later roster composition / available bodies;
- no direct Beast quantity bonus from Combo.

### D. Energy Spend vs Save

Persistent Energy already supports:
- cast now → lower carry-out, potentially better current HP;
- save → higher carry-out, potentially worse current HP.

Validate this across more than one Wave so later consequence is visible.

## Integration Principle

V14E must exercise systems together without inventing a new economy.

Preferred mental model:

```text
Wave 1 preparation
→ Battle consequence
→ persistent Run state

Wave 2 preparation
→ decision under inherited state
→ Battle consequence
→ persistent Run state

Wave 3 preparation
→ final consequence
```

## Required Deterministic Run Harness

Add a focused deterministic three-Wave harness.

Suggested file:

`src/game/run/MultiWaveCommitmentHarness.ts`

The harness must use existing gameplay-domain classes where practical:

- RunRoster;
- RunLinkShardPool;
- EnergyQueue;
- BattleFormation;
- AutonomousBattleModel;
- existing Wave fixtures;
- existing STAR profile;
- existing consolidation rules.

Do not create a parallel fake combat/economy implementation.

## Controlled Policy Traces

Implement at least two legal deterministic policy traces that begin from equivalent initial conditions.

The traces should differ in multiple commitment decisions while keeping fixed puzzle-output fixtures where possible.

### Policy CONSERVE

Representative behavior:
- preserve more separate 1★ bodies;
- hold at least one living unit in Reserve when legal;
- save Link Shard when there is a legal choice to defer;
- save Energy in an earlier Battle when legal.

### Policy COMMIT

Representative behavior:
- consolidate where legal to create STAR density;
- deploy a different legal subset / expose different bodies to attrition;
- spend Link Shard where legal to improve consolidation efficiency;
- spend Energy in an earlier Battle at a meaningful timing.

These names are neutral policy labels only.

Do not code "winner" semantics.

## Puzzle Fixture Boundary

V14E should not depend on random player puzzle skill.

Provide deterministic preparation inputs representing:
- Beast matches by ID;
- best Combo streak;
- Energy matches by ID.

For paired policy traces, keep total Beast match counts equal when testing Combo-quality consequences.

Where the scenario is meant to isolate another decision, keep puzzle outcomes identical.

## Required Per-Wave Snapshot

Record a compact structured snapshot after each major boundary.

At minimum:

### Preparation input
- Wave index;
- Beast matches by ID;
- Beast match total;
- best Combo streak;
- Link Shards carry-in;
- Link Shards earned;
- Link Shards spent;
- Energy carry-in;
- Energy collected.

### Pre-Battle roster
- total RunRoster instances;
- living count;
- KO count;
- STAR distribution;
- active deployed count;
- Reserve living count;
- total living HP;
- deployed instance IDs;
- Reserve instance IDs.

### Battle result
- Win / Lose;
- Energy spent;
- Energy carry-out;
- living count;
- KO count;
- total remaining Run HP;
- individual survivor HP by stable instance ID.

### Wave transition
- formation assignments cleared;
- roster bodies preserved;
- Energy preserved;
- Link Shards preserved;
- next Wave index.

## Required Integration Invariants

### Run-state ownership
1. RunRoster persists identity / STAR / HP / KO.
2. Formation deployment resets between Waves.
3. EnergyQueue persists across Waves and resets only on Restart/new Run.
4. RunLinkShardPool persists across Waves and resets only on Restart/new Run.
5. Battle runtime state does not leak across Waves.

### STAR / body commitment
6. Manual consolidation consumes the correct body ingredients.
7. Consolidation preserves deterministic primary instance identity.
8. Consolidation preserves aggregate health ratio.
9. 3-copy normal consolidation spends 0 shards.
10. 2-copy assisted consolidation spends exactly 1 shard.
11. Active Squad cap remains 4.

### Combo integration
12. Equal Beast match quantity produces equal recruited copy quantity.
13. Different best streak may produce different Link Shard reward.
14. Combo never directly grants extra Beast copies.
15. Combo never extends phase time.

### Energy integration
16. carried Energy is available in later Waves.
17. successful cast consumes exactly 1 selected charge.
18. saved Energy remains available later.
19. Restart clears Energy.

### Attrition integration
20. Battle damage reconciles to stable RunRoster instances.
21. KO persists and cannot deploy.
22. living Reserve not deployed in that Battle does not receive Battle damage.
23. no free post-Wave heal.
24. later-Wave legal squad options reflect earlier attrition.

## Cross-Policy Consequence Requirements

The two policy traces must produce at least **three** observable divergences from the same initial fixture set.

Valid divergence categories:

- different STAR distribution;
- different RunRoster body count;
- different living / KO count;
- different individual stable-instance HP;
- different Link Shard balance;
- different Energy carry balance;
- different legal Active squad choices in Wave 2 or Wave 3;
- different role availability;
- different Battle result or duration, if produced naturally.

Do not force a Battle outcome difference if the existing fixture does not naturally produce one.

## No Universal-Winner Assertion

The harness must not encode:

```text
policy A is better
policy B is worse
```

Instead report factual trace differences.

Acceptable:

```text
Policy COMMIT:
2★ Tanker retained, 2 Energy remaining, 3 living bodies

Policy CONSERVE:
four 1★ bodies retained, 4 Energy remaining, one Tanker at lower HP
```

The owner decides whether the trade-off is meaningful.

## Live Validation Targets

### Live A — Wave 1 Commitment Visibility

After Wave 1:
- show current roster body state;
- current STAR state;
- current Link Shards;
- Energy carried;
- injured / KO bodies.

The consequence should be inspectable before entering Wave 2 Battle Setup.

### Live B — Wave 2 Inherited Decision

Wave 2 Battle Setup must visibly reflect inherited state:
- injured veteran vs fresh body;
- prior STAR consolidation;
- current Link Shards;
- carried Energy;
- Active 0 / 4 deployment reset.

### Live C — Alternative Legal Squad

Player can choose a different legal Wave 2 squad based on inherited resources.

### Live D — Resource Spend Consequence

Spend either Energy or Link Shard and verify the resource decreases exactly once and changes the corresponding later option.

### Live E — Reserve / Attrition Consequence

Hold at least one living unit out of Battle.

After Battle:
- held body remains undamaged;
- deployed bodies reconcile actual HP/KO.

### Live F — Wave 3 Horizon

Before final Battle, earlier Wave choices remain visible in:
- roster composition;
- STAR distribution;
- HP / KO;
- Link Shards;
- Stored Energy.

### Live G — Restart

Restart after Run terminal state.

Expected:
- roster cleared;
- Energy 0;
- Link Shards 0;
- Wave 1;
- no previous-Run state leakage.

### Live H — Readability

A player-facing screenshot sequence should make the cause-and-effect understandable without a debug paragraph wall.

Prefer:
- counts;
- chips;
- HP values;
- STAR indicators;
- carry values;
- Active / Reserve state.

## UI Scope

V14E may add **small integration-readability UI only**.

Allowed:
- compact Wave Result resource summary;
- compact inherited-state summary in Battle Setup;
- small labels for Energy / Link / living roster / KO count;
- screenshot-friendly presentation.

Not allowed:
- full UI redesign;
- inventory system;
- economy screen;
- new meta progression panel.

## Metrics / Evidence Output

Add a compact harness report structure suitable for deterministic checks and owner review.

Suggested:

```ts
interface MultiWavePolicyTrace {
  policy: 'CONSERVE' | 'COMMIT';
  waves: WaveCommitmentSnapshot[];
  final: {
    status: 'Win' | 'Lose';
    waveReached: number;
    livingCount: number;
    koCount: number;
    energy: number;
    linkShards: number;
    starDistribution: Record<1 | 2 | 3, number>;
    totalRunHp: number;
  };
}
```

Exact type naming may follow repo conventions.

## Implementation Evidence & Deterministic Results

### Harness Implementation
- File: `src/game/run/MultiWaveCommitmentHarness.ts`
- Deterministic checks: `src/game/run/P1V14EChecks.ts`
- Wired in: `src/game/runChecks.ts`

### Deterministic Test Results
All 70 deterministic checks pass:
- Section 24 Invariants (Checks 1–10): PASS
- Section 25 STAR / Body (Checks 11–17): PASS
- Section 26 Combo / Link (Checks 18–23): PASS
- Section 27 Energy (Checks 24–29): PASS
- Section 28 Attrition (Checks 30–34): PASS
- E.1 Energy Policy Semantics (Checks 35–42): PASS
- E.1 Controlled SAVE vs SPEND (Checks 43–51): PASS
- E.1 Link Shard Accounting (Checks 52–60): PASS
- E.1 Divergences & Production Constants (Checks 61–70): PASS

### Cross-Policy Divergences Recorded (5)
1. **STAR Distribution Divergence**: CONSERVE has 0 2★ units; COMMIT has 2 2★ units (`run-1` Tanker 2★, `run-4` Assassin 2★).
2. **Roster Body Count Divergence**: CONSERVE retained 19 individual 1★ bodies; COMMIT consolidated into 15 bodies (4 ingredients consumed across Waves 1 and 2).
3. **Energy Balance Divergence**: CONSERVE saved Energy (spent 0 in Waves 1 & 2, ended with 10 charges); COMMIT spent 7 charges across Waves 2 & 3 and ended with 3 charges.
4. **Link Shard Balance Divergence**: CONSERVE earned 0 shards (best streak 2–3); COMMIT earned 3 shards (1 per wave), spent 1 on assisted consolidation, and ended with 2 shards.
5. **Run Status Divergence**: CONSERVE fell to Wave 3 protected ranged attrition (`Lose`); COMMIT survived Wave 3 with 2★ power density (`Win`).

### Wave-by-Wave Snapshot Summaries

#### CONSERVE Policy:
- **Wave 1 (Frontline Pressure)**: 8 beasts, 4 energy prep. Deployed 2 tanks (`run-1`, `run-2`) on outer lanes + 2 assassins (`run-4`, `run-5`), held 4 in Reserve. Battle Win, 0 heals cast (4 charges preserved), 5 living / 3 KO. Deployment cleared.
- **Wave 2 (Backline Dive)**: 6 beasts, 3 energy prep (7 total energy). Deployed 2 tanks (`front-3`, `back-3`) + assassin + ranger, held 7 in Reserve. Battle Win, 0 heals cast (7 charges preserved), 8 living / 6 KO. Deployment cleared.
- **Wave 3 (Protected Ranged)**: 5 beasts, 3 energy prep (10 total energy). Deployed 4 1★ living units, held 9 in Reserve. Battle Lose (1★ bodies collapsed under ranged pressure), 0 heals cast (10 charges preserved), 9 living / 10 KO. Final status: Lose.

#### COMMIT Policy:
- **Wave 1 (Frontline Pressure)**: 8 beasts, 4 energy prep. Consolidates 3 `beast-a` into 2★ Tanker `run-1` (0 shards spent). Deployed 2★ `run-1` + 3 1★ units, held 2 in Reserve. Battle Win, 0 heals cast (4 charges preserved), 1 shard earned (1 carry out), 5 living / 1 KO. Deployment cleared.
- **Wave 2 (Backline Dive)**: 6 beasts, 3 energy prep (7 total energy). Consolidates 2 `beast-b` + 1 Link Shard into 2★ Assassin `run-4` (spends exactly 1 shard). Deployed 2 2★ units + 2 1★ units, held 4 in Reserve. Battle Win, 3 heals cast (4 charges preserved), 1 shard earned, 1 spent (1 carry out), 7 living / 3 KO. Deployment cleared.
- **Wave 3 (Protected Ranged)**: 5 beasts, 3 energy prep (7 total energy). Deployed 2 2★ units + 2 1★ units, held 7 in Reserve. Battle Win (2★ power density survived ranged focus), 4 heals cast (3 charges preserved), 1 shard earned (2 carry out), 11 living / 4 KO. Final status: Win.

## Repo Hygiene Gate

Verified: repository docs contain no unresolved git merge conflict markers (`<` `<` `<` `<` `<` `<` `<`) across all `.md` files.

## Historical Local-Link Cleanup

Repository docs contain no machine-local file paths (`f` `i` `l` `e` `:` `/` `/`). Standard repository-relative paths (`src/game/...`, `docs/...`) are used throughout.

## Regression Boundary

Preserve all current implemented mechanics:

- V14A Wave structure;
- B.1/B.2 roster / attrition;
- B.3 STAR consolidation;
- C.1 Combo quality;
- C.2 Link Shard;
- C.1a first-match timer start;
- C.1a.1 terminal timer state;
- D persistent Energy.

Do not rebalance them in V14E.

## Non-Goals

Do NOT implement:

- Energy storage cap;
- Energy decay;
- new Energy spells;
- Energy Combo;
- Squad Capacity upgrade;
- revive / recovery;
- items / equipment;
- traits;
- economy;
- shop;
- procedural Waves;
- meta progression;
- final art;
- broad Battle Setup redesign.

## Exit Gate

Required:
- merge-marker repo hygiene checks pass;
- deterministic V14E integration checks pass;
- both policy traces complete deterministically;
- at least three factual cross-policy divergences recorded;
- historical regression suites remain green;
- `npm run check` exits 0;
- `npm run build` exits 0;
- live A–H remain OPEN unless actually recorded.

Then STOP for owner review.

V14E does not adopt V14 into canonical gameplay automatically.


## E.1 Corrective Review

Repository review after remote implementation `33dbaa1f3ac684c5785c8b863383f4b6cad8cf47` found evidence-quality issues that prevent treating the current V14E harness as fully validation-ready:

- CONSERVE and COMMIT currently share the same unconditional Energy auto-heal loop, so Energy divergence is not a controlled policy-semantic proof;
- Link Shard narrative text must reflect actual assisted-consolidation spend;
- documented divergence count must equal actual harness output;
- squad-cap evidence must use the production constant rather than an always-true helper;
- `SIMULATION_STEP = 0.1` must be described as 100 ms, and 6000 steps as 600 seconds if that bound remains.

Active correction:

`docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`

No V14 gameplay mechanic is changed by this correction.
