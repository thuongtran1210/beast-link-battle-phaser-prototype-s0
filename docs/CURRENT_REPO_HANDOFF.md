# CURRENT_REPO_HANDOFF.md — Beast Link Battle

Status: **Repository-local coding handoff**

This file mirrors the current implementation priorities so coding agents can work **without querying Notion MCP**.

## Coding-agent source order

For gameplay/code tasks, use only repository-local sources unless the user explicitly requests a Notion sync:

1. `AI_INSTRUCTIONS.md`
2. this file
3. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
4. active slice: `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
5. relevant historical slice docs
6. current code/tests

If repository docs conflict with current code, inspect the code and report the conflict. Do not call Notion automatically.

## Current milestone

**P1-V14B — Run Roster, Partial Deployment & Attrition**

P1-V14A multi-Wave flow is **owner-confirmed structurally correct enough to continue**.

This is owner live evidence. It does not mean multi-Wave is adopted into the canonical gameplay spec.

## Latest implementation evidence

**GitHub main:** `6d1f40b2b4fe97d0b4e0b74e65fc74048acec4b1` — `fix(run): clear wave deployment while preserving roster`

Implemented and regression-covered:
- persistent `RunRoster` with stable per-run instance IDs
- partial deployment with Experimental Active Squad cap = 4
- Battle spawn from persistent HP
- Battle-end HP / KO reconciliation by instance ID
- Wave transition preserves roster body state
- Wave transition clears deployment/slot assignments
- every new Battle Setup starts from `ACTIVE 0 / 4`
- living survivors return to Reserve
- new recruits join the same Reserve
- KO persists and remains unavailable
- board → Reserve can free a slot for another unit
- `npm run check` PASS
- `npm run build` PASS

## Current blocker

The code path now matches the intended V14B.1/B.2 architecture. The remaining gate is **owner live validation**, not another core implementation rewrite.

Do not mark V14B.1/B.2 PASS until Live A–H are explicitly verified in browser, especially:
- Wave 2 begins `ACTIVE 0 / 4`
- injured survivor keeps exact remaining HP
- fresh recruit and injured survivor coexist in Reserve
- player can intentionally choose either
- KO remains visible/unavailable
- duplicate same-beast instances retain separate HP
- Restart has no roster leakage.

## Active implementation sequence

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
Beast Rush output
→ Run Roster / Reserve
→ Active Formation
→ Battle
→ surviving Run Unit instances return to Reserve with current HP
```

Beast Queue is preparation/recruitment output.

Run Roster owns cross-Wave unit identity and attrition.

## Still deferred

Do not implement in B.1/B.2:
- STAR balance/consolidation redesign
- Combo redesign
- Link Shard
- Energy persistence redesign
- Barrier / Overcharge / Burst
- resting recovery
- revive
- post-Wave healing rewards
- items
- traits
- economy
- procedural Waves

## Next slice after B.1/B.2

**P1-V14B.3 — STAR Consolidation / Power Density**

Only after Reserve + attrition are live-testable.

Target question:
When is several 1★ bodies better, and when is one higher-STAR slot-efficient Beast better?

## Other open debt

- P1-V13A signature live A/B verification remains open.
- P1-V13A.1D Deployment Workspace UX remains not passed.
- These are not silently closed by V14.
