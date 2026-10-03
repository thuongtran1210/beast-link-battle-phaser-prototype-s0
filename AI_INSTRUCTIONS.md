# AI_INSTRUCTIONS.md — Beast Link Battle Coding Agent

## Critical operational rule — REPO ONLY

For normal coding/implementation tasks in this repository:

**DO NOT call Notion MCP.**

The project owner wants coding agents to avoid Notion MCP usage to reduce connector limits.

Repository-local documentation is the synchronized operational source for coding.

Only query/update Notion when the user explicitly asks for a Notion documentation sync.

## Repository source priority

Read in this order:

1. `docs/CURRENT_REPO_HANDOFF.md`
2. this file
3. active slice: `docs/P1-V14B3-STAR-POWER-DENSITY.md`
4. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
5. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
6. relevant historical docs
7. current code/tests
3. active slice doc: `docs/P1-V14B3-STAR-POWER-DENSITY.md`
4. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
5. relevant historical docs
6. current code/tests

If repo docs and code conflict:
- inspect current code
- report the conflict
- do not invent missing behavior
- do not fetch Notion unless the user explicitly asks

## Current project state

- Active implementation: **P1-V14C.1 — Combo Decoupling / Quality Signal**. See `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`.
- V14B.3 is implemented, code-review PASS, Experimental/not adopted; live hypothesis validation remains open.
- V14B.1/B.2 remain implemented; their owner browser live gate is unrecorded and is not retroactively PASS.

- V11D tactical formation validation: owner live PASS for its tested ruleset.
- V13 signatures exist but full live A/B verification remains open.
- V13A.1D Deployment Workspace UX remains not passed.
- V14A multi-Wave flow is owner-confirmed structurally correct enough to continue.
- V14B.1/B.2 core RunRoster / partial deployment / attrition implementation exists.
- Owner explicitly authorized starting **P1-V14B.3 — STAR Consolidation / Power Density**.
- V14 remains Experimental / not adopted.

## B.1/B.2 baseline

Verified implementation baseline:
P1-V14B.3 is explicitly owner-authorized. Implement player-chosen Reserve-only STAR consolidation only: recruitment produces separate 1-star instances; STAR/HP/KO persist; Active Squad cap remains 4; no V14C/D work.

P1-V14B.1/B.2 core code is implemented on main through commit `6d1f40b`.

Implemented:
- partial deployment
- Active Squad cap = 4 Experimental fixture
- persistent RunRoster instance identity
- Active Squad cap = 4 Experimental fixture
- HP / KO persistence
- Battle reconciliation by instance ID
- Wave deployment reset
- next Setup starts `ACTIVE 0 / 4`
- old living units + new recruits coexist in Reserve
- Reserve may remain non-empty when Battle starts

Do not rewrite this architecture unless a concrete defect is found.

Owner-live A–H remains a separate evidence gate. Do not mark it PASS without explicit verification.

## Active implementation — V14B.3

### Core hypothesis

**Higher STAR = power density per active slot.**

Desired trade-off:
- several 1★ bodies = breadth / coverage / more attack instances / more interception opportunities
- higher STAR = stronger individual unit / stronger signature / better slot efficiency

Neither option should be forced to win universally.

### Current code defect for B.3

Current Battle Setup still performs greedy automatic STAR conversion through `StarConverter.bulk(...)`.

This means the player cannot choose:

```text
3 × 1★
vs
1 × 2★
```

That decision must become explicit.

### Required B.3 direction

- stop automatic greedy consolidation during recruitment
- recruit separate 1★ Run Unit instances
- keep STAR cost structure 1 / 3 / 9
- add optional Reserve-only consolidation
- KO units cannot be ingredients
- deployed units cannot be ingredients
- preserve one deterministic primary instance ID where practical
- preserve health condition ratio so consolidation is not a free heal
- centralize STAR stat scaling
- keep initial stat multipliers 1.00 / 1.80 / 3.20
- scale existing Beast signatures by STAR without changing signature identity
- keep Active Squad cap = 4
- keep Formation Grid unchanged
- preserve `GRID CAPACITY ≠ SQUAD CAPACITY`
- validate Breadth vs Density against existing deterministic threat fixtures
Implement:
- partial legal deployment
- Start Battle with non-empty Reserve
- persistent Reserve across Waves
- at least one living deployed unit required
- optional Experimental Active Squad limit if needed for the test
- one source of truth for Reserve / deployed / readiness

## V14B.2

Implement:
- stable deterministic Run Unit instance IDs
- persistent current HP
- persistent KO state
- battle spawn from currentHp
- post-Battle HP reconciliation by instanceId
- no free post-Wave heal
- 0 HP => KO / unavailable
- reset all temporary Battle state between Waves

## Do not implement yet

- Combo redesign
- Link Shard
- Energy persistence redesign
- new Tactical Energy skills
- revive/resting recovery
- post-Wave heal rewards
- items/traits/economy
- procedural Waves
- full deferred Setup UI redesign

## Architecture guardrails

- Run state belongs outside presentation classes.
- RunRoster owns cross-Wave unit identity and attrition.
- BattleFormation owns current deployment, not long-term HP truth.
- AutonomousBattleModel remains one Battle simulation.
- Reconcile Battle results back to RunRoster explicitly.
- UI must not become gameplay authority.
- GAME and TEST HARNESS must share combat semantics.
- STAR stat scaling must have one gameplay source of truth.
- Existing signature identities remain unchanged.

## B.3 non-goals

Do NOT implement:
- Squad Capacity upgrade
- Combo redesign
- Link Shard
- Energy persistence redesign
- new Tactical Energy types
- revive / resting recovery
- post-Wave healing rewards
- items / equipment / traits
- economy / meta progression
- procedural Waves
- final STAR evolution art

## Verification discipline

Keep these separate:

1. code exists
2. deterministic checks pass
3. `npm run check` passes
4. `npm run build` passes
5. live browser behavior passes
6. owner live verification passes
7. design is adopted

Never infer a later state from an earlier one.

## Required B.3 workflow

1. Read repo-local sources only.
2. Inspect current recruitment / STAR / RunRoster / Battle code.
3. Remove auto-consolidation from recruitment.
4. Implement manual deterministic Reserve-only consolidation.
5. Preserve HP ratio and instance identity rules.
6. Centralize STAR profile.
7. Add STAR signature scaling fixture.
8. Add deterministic B.3 checks.
9. Run historical regressions.
10. Run `npm run check`.
11. Run `npm run build`.
12. Live validate Breadth vs Density.
13. Report if one strategy dominates.
14. STOP before V14C.
1. Read only repository-local docs listed above.
2. Inspect actual current V14A implementation before editing.
3. Identify current ownership of:
   - Wave state
   - Beast queue/conversion
   - formation
   - battle unit creation
   - Battle result
   - HP reset
   - Start Battle readiness
4. State conflicts briefly.
5. Implement the active B.3 STAR consolidation/power-density slice only.
6. Add deterministic checks.
7. Run historical regressions.
8. Run `npm run check`.
9. Run `npm run build`.
10. Live verify B.3 consolidation only when a browser surface is available.
11. Stop before V14C.

## Completion report

Report:
- final commit SHA
- files changed
- recruitment semantics
- consolidation API
- deterministic ingredient selection
- instance-ID rule
- HP-ratio rule
- centralized STAR profile
- exact stat multipliers
- exact signature STAR values
- consolidation UI behavior
- Breadth live result
- Density live result
- injured consolidation result
- cross-Wave STAR persistence
- signature scaling result
- multi-threat metrics
- whether either strategy universally dominated
- deterministic checks
- regressions
- `npm run check`
- `npm run build`
- known limitations

Explicitly state:

```text
ACTIVE SQUAD CAP REMAINS 4
SQUAD CAPACITY UPGRADE NOT STARTED
P1-V14C COMBO REWORK NOT STARTED
P1-V14D ENERGY PERSISTENCE NOT STARTED
```
