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
3. active validation slice: `docs/P1-V14E-INTEGRATION-VALIDATION.md`
4. implemented gameplay slice: `docs/P1-V14D-PERSISTENT-ENERGY.md`
5. completed closeout slice: `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
6. previous corrective slice: `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
7. implemented reward slice: `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
8. previous timing slice: `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
9. `docs/P1-V14B3-STAR-POWER-DENSITY.md`
10. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
11. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
12. relevant historical docs
13. current code/tests

If repo docs and code conflict:
- inspect current code
- report the conflict
- do not invent missing behavior
- do not fetch Notion unless the user explicitly asks

## Current project state

- Current slice: **P1-V14E — Multi-Wave Resource Commitment Integration Validation**. IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL. See `docs/P1-V14E-INTEGRATION-VALIDATION.md`.
- V14E Integration Validation: 3-wave integration harness evaluating bodies vs STAR density, reserve vs attrition, combo to link shards, and energy spend vs save across `CONSERVE` and `COMMIT` policies without encoding winner semantics.
- V14D Persistent Energy: `EnergyQueue` is Run-scoped; unused stored Energy persists across Waves. Reset only on Restart / new Run. No storage cap.
- V14C.1a.1 Timing State Hardening: Enforces strict terminal state rule: `ENDED → start()` is a NO-OP; `ENDED → update()` is a NO-OP; `remainingSeconds` stays 0; only `reset()` returns `ENDED → READY 12.0s`.
- V14C.1a First-Match Start Buffer: `READY → first valid match → ACTIVE 12.0s timer`. Invalid input does not start timer.
- P1-V14C.2 Link Shard: IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL / LIVE EVIDENCE OPEN.
- V14C.1 Combo Quality Signal: IMPLEMENTED / DETERMINISTIC PASS / OWNER-LIVE OPEN.
- V14B.3 STAR Consolidation: IMPLEMENTED / CODE REVIEW PASS / LIVE HYPOTHESIS OPEN.
- V14B.1/B.2 Run Roster & Attrition: CORE IMPLEMENTED / OWNER-LIVE EVIDENCE OPEN.
- Squad Capacity upgrades: NOT STARTED.
- V14 remains Experimental / not adopted.

## Implemented architecture baselines

- RunRoster unit identity, HP / KO persistence, per-Wave deployment reset: implemented.
- B.3 manual STAR consolidation: implemented; do not restore greedy recruitment conversion.
- C.1 Combo quality: implemented; do not restore +0.3 phase-time extension.
- C.2 Link Shard: implemented; preserve threshold, cap, persistence, assisted consolidation, and zero-phantom-HP rules.
- C.1a first-match timer start: implemented.
- C.1a.1 terminal timer state: implemented; `ENDED → start()` is a no-op.
- Active Squad cap remains 4.
- Formation Grid capacity remains independent of squad capacity.

## Active validation — P1-V14E

Core question:

**Do current preparation decisions create persistent, understandable consequences across the existing three-Wave Run?**

Required direction:
- add no new economy/resource mechanic;
- use existing V14A–D systems together;
- build a deterministic three-Wave integration harness;
- compare at least two legal policy traces from equivalent starting fixtures;
- record factual state differences without ranking a winner;
- validate bodies vs STAR density;
- validate Reserve preservation vs deployed attrition;
- validate Combo quality → Link Shard efficiency;
- validate Energy spend vs save;
- preserve stable RunRoster IDs / HP / KO;
- keep Active Squad cap = 4;
- keep current Wave fixtures;
- clean repo conflict markers and local file:// links before/with implementation.

## V14E non-goals

Do NOT implement:
- Energy cap / decay;
- Energy Combo;
- new Energy spells;
- Squad Capacity upgrade;
- revive / recovery;
- items / economy / shop;
- procedural Waves;
- meta progression;
- broad UI redesign;
- balance rebalance.

## Verification discipline

Keep separate:
1. code exists
2. deterministic checks pass
3. `npm run check` passes
4. `npm run build` passes
5. live browser behavior passes
6. owner verification passes
7. design is adopted

## Required V14E workflow

1. Read repo-local sources only.
2. Verify repo docs contain no committed merge markers.
3. Verify active docs contain no machine-local file:/// links.
4. Build a focused three-Wave integration harness using existing domain classes.
5. Implement at least two legal policy traces from equivalent deterministic preparation fixtures.
6. Record per-Wave resource / roster / battle snapshots.
7. Require at least three factual cross-policy divergences.
8. Do not encode winner/rank semantics.
9. Add deterministic V14E checks.
10. Run historical regressions.
11. Run `npm run check`.
12. Run `npm run build`.
13. Record Live A–H only if actually observed in browser.
14. STOP after implementation report.

## Completion report

Report:
- final commit SHA
- files changed
- repo hygiene cleanup
- harness structure
- deterministic puzzle/preparation fixtures
- policy trace definitions
- per-Wave snapshots
- bodies vs STAR evidence
- Reserve vs attrition evidence
- Combo/Link evidence
- Energy spend/save evidence
- at least three cross-policy divergences
- no-winner semantics confirmation
- regressions
- `npm run check`
- `npm run build`
- Live A–H status
- known limitations

Explicitly state:

```text
P1-V14E ADDS NO NEW RESOURCE MECHANIC.
V14E VALIDATES EXISTING V14A–D SYSTEMS TOGETHER.
NO UNIVERSAL WINNER IS ENCODED.
ACTIVE SQUAD CAP REMAINS 4.
ENERGY CAP / DECAY NOT STARTED.
SQUAD CAPACITY UPGRADE NOT STARTED.
```
