# Beast Link Battle — Gameplay Development Build

Phaser + TypeScript gameplay validation build.

## Coding agents: repository-only workflow

To reduce Notion MCP usage, coding agents should **not query Notion during normal implementation work**.

Read:

1. `docs/CURRENT_REPO_HANDOFF.md`
2. `AI_INSTRUCTIONS.md`
3. active slice docs under `docs/`
4. current code/tests

Notion is synchronized separately when the project owner requests documentation updates.

## Current status

### P1-V14A

Multi-Wave flow is **owner-confirmed structurally correct enough to continue**.

This remains Experimental / not adopted.

### Active gate — P1-V14B.1/B.2

**Run Roster, Partial Deployment & Attrition**

Current implementation evidence:

- `RunRoster` persists stable unit instances.
- partial deployment supports 1–4 living Active units.
- Experimental Active Squad cap = 4.
- HP / KO reconcile back to the roster by instance ID.
- Wave transition preserves roster body state but clears all deployment assignments.
- each new Battle Setup begins `ACTIVE 0 / 4`.
- living survivors and new recruits coexist in Reserve.
- commit: `6d1f40b`.
- `npm run check` and `npm run build` pass.

The remaining gate is owner live verification of the full Reserve / injured / fresh / KO choice loop.

Read:

`docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`

## Current V14 roadmap

```text
V14A — Multi-Wave Structure
OWNER STRUCTURAL PASS
↓
V14B.1 — Partial Deployment + Persistent Reserve
ACTIVE
↓
V14B.2 — Persistent Unit Identity + HP Attrition
ACTIVE
↓
V14B.3 — STAR Consolidation / Power Density
BLOCKED
↓
V14C — Combo Rework
DEFERRED
↓
V14D — Persistent Energy
DEFERRED
```

## Important distinction

```text
Beast Queue
= preparation / recruitment output

Run Roster / Reserve
= persistent player unit instances across Waves
```

Do not reconstruct persistent units from anonymous counts after Battle.

## Still-open earlier work

- V13 signature full live A/B gate remains open.
- V13A.1D Battle Setup UX remains not passed.
- V14 does not silently close either.

## Art workflow

Art generation has a separate repo-local pipeline:

- `ART_AGENT_INSTRUCTIONS.md`
- `art/style/STYLE_BIBLE.md`
- `art/style/STYLE_LOCK_PROMPT.md`

Current art gate:

**Snowguard / Tanker Master Reference → owner STYLE APPROVAL**

## Run locally

```bash
npm install
npm run check
npm run build
npm run dev
```

## Development discipline

- Experimental code is not automatically adopted design.
- Do not use UI state as gameplay authority.
- Keep GAME and TEST HARNESS combat semantics shared.
- Work only on the active slice unless explicitly asked otherwise.
