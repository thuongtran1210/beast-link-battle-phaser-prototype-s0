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
3. active gameplay slice: `docs/P1-V14D-PERSISTENT-ENERGY.md`
4. completed closeout slice: `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
5. previous corrective slice: `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
6. implemented reward slice: `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
7. previous timing slice: `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
8. `docs/P1-V14B3-STAR-POWER-DENSITY.md`
9. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
10. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
11. relevant historical docs
12. current code/tests

If repo docs and code conflict:
- inspect current code
- report the conflict
- do not invent missing behavior
- do not fetch Notion unless the user explicitly asks

## Current project state

- Current slice: **P1-V14D — Persistent Energy / Save-vs-Spend Across Waves**. ACTIVE GAMEPLAY SLICE / EXPERIMENTAL. See `docs/P1-V14D-PERSISTENT-ENERGY.md`.
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

## Active implementation — P1-V14D

Core hypothesis:

**Unused Stored Energy becomes a Run resource so spend-now competes with save-for-later.**

### V14D — Persistent Energy / Save-vs-Spend Across Waves
- `EnergyQueue` is Run-scoped as single source of truth.
- `resetWavePreparation()` preserves `energyQueue`.
- `restartRun()` resets `energyQueue`.
- Valid match adds +1 charge to matched ID without wiping carried charges.
- Successful Battle cast consumes exactly 1 selected charge; failed/post-end casts consume 0.
- No storage cap: charges may exceed 6 and 20.
- UI: Energy Rush shows `CARRY IN ×N` and `STORED ×N`; Wave Result shows `ENERGY CARRIED ×N`.

## V14D non-goals

Do NOT implement:
- Energy Combo;
- new Energy spell types;
- Energy storage cap;
- decay;
- crafting;
- Link Shard conversion;
- Squad Capacity upgrade;
- items/equipment;
- meta progression;
- final balance tuning.

## Verification discipline

Keep separate:
1. code exists
2. deterministic checks pass
3. `npm run check` passes
4. `npm run build` passes
5. live browser behavior passes
6. owner verification passes
7. design is adopted

Never infer a later state from an earlier one.

## Completion report

Report:
- final commit SHA
- files changed
- EnergyQueue lifetime before/after
- exact Wave transition change
- Restart behavior
- per-ID persistence
- later-Wave collection behavior
- Battle spending behavior
- no-cap behavior
- UI carry-in/current/carry-out behavior
- deterministic checks
- spend-vs-save harness
- C.1a/C.1a.1/C.1/C.2/B.3 regressions
- `npm run check`
- `npm run build`
- live A–H status
- known limitations

Explicitly state:

```text
UNUSED ENERGY PERSISTS ACROSS WAVES.
RESTART / NEW RUN CLEARS ENERGY.
VALID ENERGY MATCH STILL ADDS EXACTLY +1 CHARGE.
SUCCESSFUL BATTLE CAST STILL CONSUMES EXACTLY 1 SELECTED CHARGE.
V14D ADDS NO NEW ENERGY STORAGE CAP.
RULECONFIG.ENERGYMAX = 20 IS NOT USED AS A V14D CHARGE CAP.
SQUAD CAPACITY UPGRADE NOT STARTED.
```
