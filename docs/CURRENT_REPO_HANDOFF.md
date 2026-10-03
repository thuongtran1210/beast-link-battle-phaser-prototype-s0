# CURRENT_REPO_HANDOFF.md — Beast Link Battle

Status: **Repository-local coding handoff**

This file mirrors the current implementation priorities so coding agents can work **without querying Notion MCP**.

## Coding-agent source order

For gameplay/code tasks, use only repository-local sources unless the user explicitly requests a Notion sync:

1. `AI_INSTRUCTIONS.md`
2. this file
3. active slice: `docs/P1-V14B3-STAR-POWER-DENSITY.md`
4. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
5. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
6. relevant historical slice docs
7. current code/tests
3. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
4. active slice: `docs/P1-V14B3-STAR-POWER-DENSITY.md`
5. relevant historical slice docs
6. current code/tests

If repository docs conflict with current code, inspect the code and report the conflict. Do not call Notion automatically.

## Current milestone

**P1-V14B.3 — STAR Consolidation / Power Density**
**Active Experimental slice: P1-V14B.3 — STAR Consolidation / Power Density.**

The owner explicitly authorized B.3. V14B.1/B.2 remain implemented and their owner browser live gate remains unrecorded; beginning B.3 does not mark that evidence PASS. Preserve persistent RunRoster identity, HP/KO attrition, per-Wave deployment reset, and the Experimental Active Squad cap of 4.

**P1-V14B — Run Roster, Partial Deployment & Attrition**

Owner explicitly authorized starting B.3.

V14 remains **Experimental / not adopted**.

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
