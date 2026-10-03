# Beast Link Battle — Gameplay Development Build

Phaser + TypeScript gameplay validation build.

## Coding agents: repository-only workflow

To reduce Notion MCP usage, coding agents should **not query Notion during normal implementation work**.

Read:

1. `docs/CURRENT_REPO_HANDOFF.md`
2. `AI_INSTRUCTIONS.md`
3. active slice: `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
4. previous slice: `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
5. supporting V14 docs
6. current code/tests

Notion is synchronized separately when the project owner requests documentation updates.

## Current status

### P1-V14A

Multi-Wave flow is **owner-confirmed structurally correct enough to continue**.

This remains Experimental / not adopted.

### P1-V14B.1/B.2 baseline

**Run Roster, Partial Deployment & Attrition**

Current implementation evidence:

- `RunRoster` persists stable unit instances.
- partial deployment supports 1–4 living Active units.
- Experimental Active Squad cap = 4.
- HP / KO reconcile back to the roster by instance ID.
- Wave transition preserves roster body state but clears deployment assignments.
- each new Battle Setup begins `ACTIVE 0 / 4`.
- living survivors and new recruits coexist in Reserve.
- Reserve may remain non-empty when Battle starts.
- baseline commit: `6d1f40b`.
- `npm run check` and `npm run build` were reported PASS for that baseline.

Owner-live A–H remains a separate evidence gate and must not be inferred as PASS.

### Active slice — P1-V14C.2

**Combo Quality → Consolidation Efficiency (Link Shard Experiment)**

- MATCH COUNT strictly controls Beast quantity (1 match = 1 recruited Beast).
- COMBO QUALITY (`bestStreak`) earns Link Shards (up to 2 per Beast Rush, cap 3).
- Link Shards substitute for 1 missing same-STAR copy in Reserve consolidation (min 2 real bodies, 0 phantom HP).
- Active Squad cap remains 4; Energy persistence (V14D) not started.

Read:

`docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`

## Current V14 roadmap

```text
V14A — Multi-Wave Structure
OWNER STRUCTURAL PASS
↓
V14B.1 / B.2 — Run Roster & Attrition
CORE IMPLEMENTED / OWNER-LIVE EVIDENCE OPEN
↓
V14B.3 — STAR Consolidation / Power Density
IMPLEMENTED / CODE REVIEW PASS / LIVE HYPOTHESIS OPEN
↓
V14C.1 — Combo Quality Signal
IMPLEMENTED / DETERMINISTIC PASS / OWNER-LIVE OPEN
↓
V14C.2 — Link Shard Consolidation Efficiency
IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL
↓
V14D — Persistent Energy
DEFERRED / NOT STARTED
↓
Future Experiment — Squad Capacity Upgrade
NOT STARTED
```

## Important distinctions

```text
Beast Queue
= preparation / recruitment output

Run Roster / Reserve
= persistent player unit instances

Active Squad
= up to 4 living deployed Beasts in the current Experimental fixture

Formation Grid
= tactical starting positions, not squad capacity
```

## Still-open earlier work

- B.1/B.2 owner-live A–H remains unclosed unless explicitly verified.
- V13 signature full live A/B gate remains open.
- V13A.1D Battle Setup UX remains not passed.
- V14 does not silently close these.

## Art workflow

Art generation has a separate repo-local pipeline:

- `ART_AGENT_INSTRUCTIONS.md`
- `art/style/STYLE_BIBLE.md`
- `art/style/STYLE_LOCK_PROMPT.md`

Current art gate:

**Snowguard / Tanker Master Reference → owner STYLE APPROVAL**

Do not create final STAR evolution art before B.3 mechanics are validated.

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

## Beast Rush UI validation

**Beast Rush right rail information hierarchy: OWNER VISUAL PASS (2026-10-03).**

Accepted direction:
- live resource HUD instead of instruction panel
- Combo meter/time first
- compact Matches / Recruited counters
- visual Beast Queue stacks with `×N` copy counts
- compact event strip
- no automatic-STAR implication in Beast Rush

This is a presentation-direction pass, not final Cute Tactical Chibi art/asset readiness.

Energy Rush has not yet inherited this right-rail redesign automatically.
