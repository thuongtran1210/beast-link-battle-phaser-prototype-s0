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

## Current blockers

### Forced full deployment

Battle Setup currently requires every available Beast to be placed before Start Battle becomes valid.

That prevents testing:
- deploy now
- hold this Beast in Reserve for later Wave

The active experiment must allow a legal non-empty subset to enter Battle.

### Free full heal between Waves

Units effectively return to later Waves at full HP.

That prevents testing:
- reuse injured Beast
- protect/save it
- deploy fresh Reserve Beast

The run therefore needs stable player-unit instances with persistent current HP.

## Active implementation sequence

### P1-V14B.1 — Partial Deployment + Persistent Reserve

Required:
- Start Battle does not require all available units to be deployed.
- Start Battle requires at least one legal deployed unit.
- Undeployed legal units remain in Run Reserve across Waves.
- Formation / Reserve / Start gating derive from one roster source of truth.
- An Active Squad Limit may be introduced as an Experimental fixture if required for the test; exact value is not adopted.

### P1-V14B.2 — Persistent Unit Identity + HP Attrition

Required:
- recruited/formed player units become stable Run Unit instances
- persist across Waves: instanceId, beastId, STAR, maxHp, currentHp, KO status
- reset each Battle: target, cooldowns, windup/recovery, temporary shield, engagement, temporary buffs/debuffs, signature runtime activation state
- no free post-Wave heal in the initial experiment
- currentHp <= 0 => KO / unavailable for later Waves

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
