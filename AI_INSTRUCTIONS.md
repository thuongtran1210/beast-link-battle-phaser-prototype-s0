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
4. previous closeout slice: `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
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

### V14D — Persistent Energy / Save-vs-Spend Across Waves
- `EnergyQueue` is Run-scoped as single source of truth.
- `resetWavePreparation()` preserves `energyQueue`.
- `restartRun()` resets `energyQueue`.
- Valid match adds +1 charge to matched ID without wiping carried charges.
- Successful Battle cast consumes exactly 1 selected charge; failed/post-end casts consume 0.
- No storage cap: charges may exceed 6 and 20.
- UI: Energy Rush shows `CARRY IN ×N` and `STORED ×N`; Wave Result shows `ENERGY CARRIED ×N`.

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
