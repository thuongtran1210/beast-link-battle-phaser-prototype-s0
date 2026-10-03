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
3. active closeout slice: `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
4. previous corrective slice: `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
5. implemented reward slice: `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
6. previous timing slice: `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
7. `docs/P1-V14B3-STAR-POWER-DENSITY.md`
8. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
9. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
10. relevant historical docs
11. current code/tests

If repo docs and code conflict:
- inspect current code
- report the conflict
- do not invent missing behavior
- do not fetch Notion unless the user explicitly asks

## Current project state

- Current slice: **P1-V14C.1a.1 — Timing State Hardening & Repo Closeout**. ACTIVE CLOSEOUT SLICE. See `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`.
- V14C.1a First-Match Start Buffer: IMPLEMENTED / DETERMINISTIC PASS / OWNER-LIVE OPEN. `READY → first valid match → ACTIVE 12.0s timer`. Invalid input does not start timer.
- V14C.1a.1 Timing State Hardening: Enforces strict terminal state rule: `ENDED → start()` is a NO-OP; `ENDED → update()` is a NO-OP; `remainingSeconds` stays 0; only `reset()` returns `ENDED → READY 12.0s`.
- P1-V14C.2 Link Shard: IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL / LIVE EVIDENCE OPEN.
- V14C.1 Combo Quality Signal: IMPLEMENTED / DETERMINISTIC PASS / OWNER-LIVE OPEN.
- V14B.3 STAR Consolidation: IMPLEMENTED / CODE REVIEW PASS / LIVE HYPOTHESIS OPEN.
- V14B.1/B.2 Run Roster & Attrition: CORE IMPLEMENTED / OWNER-LIVE EVIDENCE OPEN.
- V14D (Energy persistence) and Squad Capacity upgrades: NOT STARTED.
- V14 remains Experimental / not adopted.

## Implemented architecture baselines

### V14B.1/B.2 — Run Roster & Attrition
- Partial deployment (1–4 units, Active Squad cap = 4).
- Persistent `RunRoster` instance identity across Waves.
- HP / KO persistence; Battle reconciliation by instance ID.
- Wave deployment reset (`ACTIVE 0 / 4` at each setup).
- Old living units + new recruits coexist in Reserve.

### V14B.3 — STAR Consolidation / Power Density
- Recruitment produces separate 1★ Run Unit instances (no automatic greedy conversion).
- Optional Reserve-only consolidation (cost: 1 / 3 / 9).
- Aggregate health ratio preserved; KO and deployed units excluded.
- Centralized STAR stat profile and signature scaling.

### V14C.1 / V14C.2 — Combo Quality & Link Shards
- Decoupled 12.0s phase timer from 1.5s Combo window.
- Match count = Beast quantity; Combo streak = quality signal.
- Link Shards awarded from streak (streak 4–6: 1, 7+: 2, cap 3).
- Shards substitute 1 copy in Reserve consolidation (min 2 real bodies, 0 phantom HP).

### V14C.1a / V14C.1a.1 — Start Buffer & Timing State Hardening
- Both Beast and Energy Rush enter `READY 12.0s`.
- First valid match starts the timer.
- `ENDED` state is strictly terminal: `start()` and `update()` are NO-OPs.
- Only `reset()` returns `ENDED → READY 12.0s`.

## Next gameplay slice — P1-V14D (Persistent Energy)
- Not started.
- Do NOT change `resetWavePreparation()` or `energyQueue.reset()` in closeout slices.

## Non-goals / Still deferred
- Squad Capacity upgrade (NOT STARTED)
- New Tactical Energy types
- Revive / resting recovery
- Post-Wave healing rewards
- Items / equipment / traits
- Economy / meta progression
- Procedural Waves
- Final STAR evolution art

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
