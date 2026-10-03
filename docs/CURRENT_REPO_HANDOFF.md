# CURRENT_REPO_HANDOFF.md — Beast Link Battle

Status: **Repository-local coding handoff**

## Current status — 2026-10-03

- V14A: owner structural PASS / Experimental / not adopted.
- V14B.1/B.2: core implemented; owner-live evidence remains open.
- V14B.3: implemented; code review PASS; live hypothesis validation open; not adopted.
- V14C.1: implemented; deterministic/build PASS; owner live A–F open; Experimental / not adopted.
- V14C.2: **IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL** — `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`.
- V14C.1a: **IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL** — First-Match Start Buffer for Beast Rush + Energy Rush.
- V14C.1a.1: **ACTIVE CLOSEOUT SLICE / OWNER AUTHORIZED** — Timing State Hardening & Repo Closeout. See `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`.
- V14D: **NEXT GAMEPLAY SLICE / NOT STARTED**.
- Squad Capacity Upgrade: not started.

This file mirrors the current implementation priorities so coding agents can work **without querying Notion MCP**.

## Coding-agent source order

For gameplay/code tasks, use only repository-local sources unless the user explicitly requests a Notion sync:

1. `AI_INSTRUCTIONS.md`
2. this file
3. active closeout slice: `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
4. previous corrective slice: `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
5. implemented reward slice: `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
6. previous timing slice: `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
7. `docs/P1-V14B3-STAR-POWER-DENSITY.md`
8. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
9. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
10. relevant historical slice docs
11. current code/tests

If repository docs conflict with current code, inspect the code and report the conflict. Do not call Notion automatically.

## Current milestone

**P1-V14C.1a — First-Match Start Buffer (Corrective Timing Slice)**

Owner identified a UX/game-feel defect after C.1/C.2 implementation: Beast Rush and Energy Rush currently consume timed execution budget immediately when the board appears, before the player has time to read the board.

Approved corrective rule:

```text
READY
→ observe board freely
→ FIRST VALID MATCH
→ ACTIVE 12.0s timer
→ 0s → phase end
```

This applies to both Beast Rush and Energy Rush. Invalid input must not start the timer. No READY safety timeout is added in this experiment.

C.1 remains: MATCH COUNT = Beast quantity; COMBO = quality signal. C.2 Link Shard rules remain implemented and must be preserved. V14D Energy persistence remains not started.

P1-V14A multi-Wave flow is owner-confirmed structurally correct enough to continue.

## B.1/B.2 implementation baseline

Latest verified baseline commit:

`6d1f40b2b4fe97d0b4e0b74e65fc74048acec4b1` — `fix(run): clear wave deployment while preserving roster`

Implemented and regression-covered:
- persistent `RunRoster` with stable per-run instance IDs
- partial deployment with Experimental Active Squad cap = 4
- Battle spawn from persistent HP
- Battle-end HP / KO reconciliation by instance ID
- Wave transition preserves roster body state
- Wave transition clears deployment/slot assignments
- each new Battle Setup starts from `ACTIVE 0 / 4`
- living survivors return to Reserve
- new recruits join the same Reserve
- KO persists and remains unavailable
- board → Reserve frees an Active slot
- Reserve may remain non-empty when Battle starts

Owner-live A–H remains a separate evidence gate. Do **not** retroactively mark B.1/B.2 owner-live PASS unless explicitly verified.

## Current implementation truth

B.3 greedy auto-conversion is no longer the current blocker. Current remote implementation already supports separate 1★ recruitment plus manual Reserve-only STAR consolidation.

Current active closeout question:
- can either puzzle timer restart after reaching ENDED?
- repository review found that current `start()` can reload 12.0s after `remainingSeconds === 0`.

P1-V14C.1a.1 must harden both Beast Rush and Energy Rush timers so only `reset()` may move ENDED back to READY.

After that closeout, the next gameplay slice is P1-V14D Persistent Energy.

## Important model boundaries

```text
Beast Queue
= preparation / recruitment output

Run Roster / Reserve
= persistent player unit instances

BattleFormation
= per-Wave deployment state

AutonomousBattleModel
= one Battle simulation
```

Do not reconstruct persistent units from anonymous counts after Battle.

## Still deferred

Do not implement in B.3:
- Squad Capacity upgrade
Do not implement in B.1/B.2:
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

## Open earlier evidence gates

- B.1/B.2 owner-live A–H remains unclosed unless explicitly verified.
- P1-V13A full live signature A/B verification remains open.
- P1-V13A.1D Deployment Workspace UX remains not passed.
- These are not silently closed by B.3.

## Current active doc

Read:

`docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`

## UI Validation Update — Beast Rush Right Rail — 2026-10-03

**Owner visual status: PASS.**

The Beast Rush right rail has been accepted as the correct information-hierarchy direction:
- right rail behaves as a **live resource HUD**, not an instruction panel
- Combo time + meter is the primary focal point
- MATCHES / RECRUITED are compact counters
- Beast Queue uses visual Beast stacks / copy counts
- queue copy count uses `×N` and does not imply automatic STAR consolidation
- event feedback is compact and transient
- paragraph-style persistent instructions were removed from the right rail

This PASS is for **visual hierarchy / presentation direction**, not final production-art quality.

The current project style still targets Cute Tactical Chibi; final Beast art / production asset polish remains a separate art gate.

Reported implementation SHA for the right-rail slice: `ec7a60acd6fb3a26cbc75ff05c5d9afdd85035bb`.
During documentation sync, that SHA was not visible on the connected GitHub remote, so record it as **owner-reported implementation evidence** rather than remote-verified commit evidence.

Do not apply the same redesign to Energy Rush automatically; Energy Rush remains a separate UI slice.

## Latest B.3 Repository Evidence — 2026-10-03

GitHub main now contains:

`603391e3181ec02ffb75f7ff76cd72f03f120433` — `feat(run): add player STAR consolidation`

Remote code evidence includes:
- recruitment path changed from greedy `bulk(...)` use to separate 1★ recruitment
- Reserve-only player STAR consolidation path
- deterministic primary instance preservation strategy
- aggregate-health-ratio consolidation handling
- shared STAR stat profile
- STAR-scaled existing signatures
- deterministic B.3 checks and breadth/density harness code

This means B.3 is no longer merely “implementation pending”.
However, command-run evidence and owner live B.3 validation must still be tracked separately before B.3 can be called PASS or adopted.
