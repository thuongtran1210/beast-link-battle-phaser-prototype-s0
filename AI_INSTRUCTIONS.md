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
3. active slice doc: `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
4. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
5. relevant historical docs
6. current code/tests

If repo docs and code conflict:
- inspect current code
- report the conflict
- do not invent missing behavior
- do not fetch Notion to resolve it unless the user explicitly requests that

## Current project state

- V11D tactical formation validation: owner live PASS for its tested ruleset.
- V13 signatures exist but full live A/B validation remains open.
- V13A.1D Deployment Workspace UX remains not passed.
- V14A multi-Wave flow is **owner-confirmed structurally correct enough to continue**.
- Active implementation: **P1-V14B.1/B.2 — Run Roster, Partial Deployment & Attrition**.
- V14 remains Experimental / not adopted.

## Active design blockers

### Forced full deployment

Current Start Battle gating prevents intentional Reserve play because it requires all available units to be deployed.

### Full HP reset

Current cross-Wave behavior effectively refills player units, preventing injured-vs-fresh roster choice.

## Required model direction

Use a persistent Run Roster layer.

Conceptually:

```text
Beast Rush / current STAR conversion
→ Run Unit instances
→ Reserve
→ Active Formation
→ Battle
→ reconcile current HP by stable instanceId
→ Reserve / next Wave
```

Do not treat surviving units as anonymous counts after Battle.

## V14B.1

Implement:
- partial legal deployment
- Start Battle with non-empty Reserve
- persistent Reserve across Waves
- at least one living deployed unit required
- optional Experimental Active Squad limit if needed for the test
- one source of truth for Reserve / deployed / readiness

## V14B.2

Implement:
- stable deterministic Run Unit instance IDs
- persistent current HP
- persistent KO state
- battle spawn from currentHp
- post-Battle HP reconciliation by instanceId
- no free post-Wave heal
- 0 HP => KO / unavailable
- reset all temporary Battle state between Waves

## Do not implement yet

- STAR redesign/balance
- STAR consolidation UI
- Combo redesign
- Link Shard
- Energy persistence redesign
- new Tactical Energy skills
- revive/resting recovery
- post-Wave heal rewards
- items/traits/economy
- procedural Waves
- full deferred Setup UI redesign

## Architecture guardrails

- Run state belongs outside presentation classes.
- Run Roster owns cross-Wave player unit identity.
- BattleFormation owns current deployment, not long-term HP truth.
- AutonomousBattleModel remains one Battle simulation.
- Reconcile Battle results back to Run Roster explicitly.
- UI must not become gameplay authority.
- GAME and TEST HARNESS must share combat semantics.
- Existing Beast signature mechanics remain unchanged.

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

## Required workflow

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
5. Implement B.1/B.2 only.
6. Add deterministic checks.
7. Run historical regressions.
8. Run `npm run check`.
9. Run `npm run build`.
10. Live verify partial deployment + HP/KO persistence.
11. Stop before B.3.

## Completion report

Report:
- commit SHA
- files changed
- Run Roster architecture
- stable ID strategy
- partial-deployment readiness rule
- actual Active Squad limit used, if any
- HP reconciliation path
- KO behavior
- per-Battle reset behavior
- deterministic checks
- historical regressions
- `npm run check`
- `npm run build`
- Live A–H
- known limitations

Explicitly state:

```text
P1-V14B.3 STAR REDESIGN NOT STARTED
P1-V14C COMBO REWORK NOT STARTED
P1-V14D ENERGY PERSISTENCE NOT STARTED
```
