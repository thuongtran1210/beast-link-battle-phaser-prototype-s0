# CURRENT_REPO_HANDOFF.md — Beast Link Battle

Status: **Repository-local coding handoff**

## Current status — 2026-10-03

- V14A: owner structural PASS / Experimental / not adopted.
- V14B.1/B.2: core implemented; owner-live evidence remains open.
- V14B.3: implemented; code review PASS; live hypothesis validation open; not adopted.
- V14C.1: implemented; deterministic/build PASS; owner live A–F open; Experimental / not adopted.
- V14C.2: **IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL** — `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`.
- V14C.1a: **IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL** — First-Match Start Buffer for Beast Rush + Energy Rush. See `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`.
- V14D and Squad Capacity Upgrade: not started.

This file mirrors the current implementation priorities so coding agents can work **without querying Notion MCP**.

## Coding-agent source order

For gameplay/code tasks, use only repository-local sources unless the user explicitly requests a Notion sync:

1. `AI_INSTRUCTIONS.md`
2. this file
3. active corrective slice: `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
4. implemented reward slice: `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
5. previous timing slice: `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
6. `docs/P1-V14B3-STAR-POWER-DENSITY.md`
7. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
8. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
9. relevant historical slice docs
10. current code/tests

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

## Current B.3 blocker discovered in code

Current Battle Setup still uses greedy STAR conversion:
Do not mark V14B.1/B.2 PASS until Live A–H are explicitly verified in browser, especially:
- Wave 2 begins `ACTIVE 0 / 4`
- injured survivor keeps exact remaining HP
- fresh recruit and injured survivor coexist in Reserve
- player can intentionally choose either
- KO remains visible/unavailable
- duplicate same-beast instances retain separate HP
- Restart has no roster leakage.

## Active implementation sequence

### P1-V14B.3 — STAR Consolidation / Power Density

**Implementation status:** active Experimental slice, explicitly owner-authorized. Recruitment creates separate 1-star Run Units, and optional consolidation is Reserve-only, preserves aggregate HP condition, excludes KO units, and keeps the Active Squad cap at 4.

### P1-V14B.1 — Partial Deployment + Persistent Reserve

**Implementation status:** coded + deterministic regression evidence present; owner live gate still open.

Current Experimental fixture:
- Start Battle accepts a legal subset.
- Active Squad cap = 4.
- Reserve may remain non-empty.
- deployment is per-Wave only.
- next Wave Setup starts `ACTIVE 0 / 4`.

### P1-V14B.2 — Persistent Unit Identity + HP Attrition

**Implementation status:** coded + deterministic regression evidence present; owner live gate still open.

Current behavior:
- stable Run Unit instances persist across Waves.
- HP / KO persist.
- Battle spawns from persistent HP.
- Battle result reconciles by instance ID.
- temporary Battle runtime state resets.
- no free post-Wave heal.
- KO remains unavailable.

## Model boundary

Do not model surviving units as anonymous counts returning to Beast Queue.

Use:

```text
BattleQueue count
→ StarConverter.bulk(...)
→ highestAffordable(...)
→ automatic highest STAR
```

Therefore the player cannot currently choose:

```text
3 × 1★
vs
1 × 2★
```

That is the active B.3 problem.

## Active B.3 target

Hypothesis:

**Higher STAR = power density per Active slot.**

Desired trade-off:
- several 1★ units = breadth / bodies / lane coverage / more independent actions
- one higher-STAR unit = concentration / stronger per-slot body / stronger signature / slot efficiency

Keep:
- Active Squad cap = 4
- STAR cost structure = 1 / 3 / 9
- Formation Grid unchanged
- `GRID CAPACITY ≠ SQUAD CAPACITY`

Do not implement Squad Capacity upgrades in this slice.

## Required B.3 direction

1. Stop automatic greedy consolidation during recruitment.
2. Recruit separate 1★ Run Unit instances.
3. Add optional manual Reserve-only consolidation.
4. Preserve one deterministic primary instance ID where practical.
5. Do not use KO or deployed units as ingredients.
6. Preserve attrition by health ratio; consolidation must not full-heal.
7. Centralize STAR stat scaling into one gameplay source of truth.
8. Scale existing signatures by STAR without changing signature identity.
9. Validate Breadth vs Density against existing deterministic threat fixtures.
10. Stop before V14C.

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

`docs/P1-V14B3-STAR-POWER-DENSITY.md`

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
