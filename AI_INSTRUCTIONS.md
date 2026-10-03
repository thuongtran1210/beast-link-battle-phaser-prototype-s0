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
6. `docs/P1-V14B3-STAR-POWER-DENSITY.md`
7. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
8. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
9. relevant historical docs
10. current code/tests

If repo docs and code conflict:
- inspect current code
- report the conflict
- do not invent missing behavior
- do not fetch Notion unless the user explicitly asks

## Current project state

- Current slice: **P1-V14C.1a.1 — Timing State Hardening & Repo Closeout**. ACTIVE / owner authorized. See `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`.
- C.1a First-Match Start Buffer is implemented / deterministic PASS / Experimental. The only active code change is terminal-state hardening: `ENDED → start()` must be a no-op for both puzzle timers; only `reset()` may return ENDED to READY.
- Corrective rule for both Beast Rush and Energy Rush: `READY → first valid match → ACTIVE 12.0s timer`. Invalid input does not start the timer. No READY safety timeout in this slice.
- P1-V14C.2 Link Shard is implemented / deterministic PASS / Experimental and remains intact.
- V14C.1 is implemented, deterministic/build PASS, Experimental / not adopted; owner live A–F open.
- V14B.3 is implemented, code-review PASS, Experimental / not adopted; live hypothesis validation open.
- V14B.1/B.2 remain implemented; their owner browser live gate remains open.
- V14D (Energy persistence) and Squad Capacity upgrades are not started.
- V14 remains Experimental / not adopted.

## Current implementation guardrails

- RunRoster persistence / HP / KO / deployment reset are implemented.
- B.3 manual STAR consolidation is implemented; do not reintroduce greedy automatic consolidation.
- C.1 Combo quality is implemented; do not restore +0.3 phase-time extension.
- C.2 Link Shard is implemented; preserve reward thresholds, cap, persistence, and assisted-consolidation rules.
- C.1a READY → first valid match → ACTIVE timing is implemented.
- C.1a.1 changes timer terminal-state safety only.
- V14D Persistent Energy is next and MUST NOT be implemented in this closeout.
- Active Squad cap remains 4.
- Formation Grid capacity remains distinct from squad capacity.

## Verification discipline

Keep these separate:

1. code exists
2. deterministic checks pass
3. npm run check passes
4. npm run build passes
5. live browser behavior passes
6. owner live verification passes
7. design is adopted

Never infer a later state from an earlier one.

## Active workflow — V14C.1a.1

1. Read repository-local sources only.
2. Inspect BeastRushPhaseTimer and EnergyRushTimer.
3. Make ENDED terminal against start().
4. Add deterministic ENDED → start() no-op checks for both timers.
5. Preserve C.1/C.2/B.3 behavior.
6. Clean stale repo-local status text if any remains.
7. Run npm run check.
8. Run npm run build.
9. Report live evidence only if browser verification was actually performed.
10. STOP before V14D.

## Completion report

Report:
- final commit SHA
- files changed
- Beast timer terminal-state behavior
- Energy timer terminal-state behavior
- deterministic checks added
- C.1/C.2/B.3 regressions
- npm run check
- npm run build
- live evidence status
- known limitations

Explicitly state:

```text
ENDED → start() IS A NO-OP
ONLY reset() RETURNS ENDED → READY
P1-V14D ENERGY PERSISTENCE NOT STARTED
SQUAD CAPACITY UPGRADE NOT STARTED
```
