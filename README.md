# Beast Link Battle — Gameplay Development Build

Phaser + TypeScript gameplay validation build.

## Coding agents: repository-only workflow

To reduce Notion MCP usage, coding agents should **not query Notion during normal implementation work**.

Read:

1. `docs/CURRENT_REPO_HANDOFF.md`
2. `AI_INSTRUCTIONS.md`
3. active player-surface corrective slice: `docs/P1-V14F1-BATTLE-UX-ENERGY-CAST-RELIABILITY.md`
4. completed corrective validation slice: `docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`
5. integration baseline: `docs/P1-V14E-INTEGRATION-VALIDATION.md`
6. implemented gameplay slice: `docs/P1-V14D-PERSISTENT-ENERGY.md`
6. completed closeout slice: `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
7. previous corrective slice: `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
8. implemented reward slice: `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
9. previous timing slice: `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
10. supporting V14 docs
11. current code/tests

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

### Implemented gameplay slice — P1-V14D

**Persistent Energy / Save-vs-Spend Across Waves**

- `EnergyQueue` is Run-scoped; unused stored Energy persists across Waves.
- `resetWavePreparation()` preserves unused Energy charges intact.
- `restartRun()` clears `energyQueue`.
- No storage cap: charges may exceed 6 and 20.
- UI: Energy Rush shows `CARRY IN ×N` and `STORED ×N`; Wave Result shows `ENERGY CARRIED ×N`.
- Deterministic checks (28 checks + harness) pass.

Read:

`docs/P1-V14D-PERSISTENT-ENERGY.md`

### Active validation slice — P1-V14E

**Multi-Wave Resource Commitment Integration Validation**

Status: **IMPLEMENTED / DETERMINISTIC EVIDENCE HARDENED / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED**

V14E adds no new resource mechanic. It validates whether current V14 decisions create persistent, readable consequences across the existing three-Wave run.

Required evidence:
- bodies vs STAR density;
- Reserve preservation vs deployed attrition;
- Combo quality → Link Shard efficiency;
- Energy spend-now vs save-for-later;
- at least two deterministic legal policy traces;
- at least three factual cross-policy divergences;
- no encoded winner/ranking.

Read:

`docs/P1-V14E-INTEGRATION-VALIDATION.md`

### Implemented corrective validation slice — P1-V14E.1

**Policy Semantics & Evidence Hardening**

Status: **IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED**

V14E.1 hardens evidence quality without adding any gameplay mechanics:
- Energy policy ownership is explicit via `shouldCastEnergy` (CONSERVE preserves 100% in Waves 1 & 2; COMMIT spends when HP missing >= 30);
- controlled same-fixture SAVE vs SPEND proof added from identical battle conditions;
- Link Shard accounting matches actual trace events (COMMIT: earned 3, spent 1, balance 2);
- documented divergences equal actual harness comparison (5 unique categories);
- fake squad cap check removed; production constant `P1V14B_ACTIVE_SQUAD_LIMIT === 4` asserted;
- simulation timing math corrected (`SIMULATION_STEP = 0.1` is 100 ms; 6000 steps = 600s horizon);
- 70 deterministic checks pass.

Read:

`docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`

### Active player-surface corrective slice — P1-V14F.1

**Battle Setup UX Clarity + Energy Cast Reliability**

Owner live inspection identified Battle Setup readability problems and a manual Energy-cast reliability issue: a full-HP frontline can currently consume a charge and produce zero visible heal.

F.1 corrects:
- header / formation / enemy hierarchy;
- Reserve vs Deployed vs KO readability;
- Active Squad 4 vs Formation Grid 18 clarity;
- Setup Stored Energy preview;
- Battle cast eligibility / feedback;
- full-HP cast protection.

Read:

`docs/P1-V14F1-BATTLE-UX-ENERGY-CAST-RELIABILITY.md`

### Active visual closeout — P1-V14F.1c

**Battle Setup Visual Closeout**

Remote F.1 baseline `8666a5e` fixed Energy cast reliability and added Reserve/KO grouping, but owner screenshot still shows a debug-heavy Setup surface.

F.1c closes:
- duplicate header hierarchy;
- Active 4/4 vs Grid 18 clarity;
- full-squad empty-cell affordance;
- raw Stored Energy text;
- consolidation copy inside Energy panel;
- normal-Battle cast-control parity with Showcase.

Read:

`docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`

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
V14C.1a — First-Match Start Buffer
IMPLEMENTED / DETERMINISTIC PASS / OWNER-LIVE OPEN
↓
V14C.1a.1 — Timing State Hardening & Repo Closeout
IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED
↓
V14D — Persistent Energy
IMPLEMENTED / DETERMINISTIC PASS / LIVE A–H OPEN / EXPERIMENTAL
↓
V14E — Multi-Wave Resource Commitment Integration Validation
IMPLEMENTED / DETERMINISTIC EVIDENCE HARDENED / LIVE NOT RECORDED
↓
V14E.1 — Policy Semantics & Evidence Hardening
IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL
↓
V14F.1 — Battle Setup UX + Energy Cast Reliability
IMPLEMENTED / DETERMINISTIC PASS / LIVE OPEN
↓
V14F.1c — Battle Setup Visual Closeout
ACTIVE / OWNER AUTHORIZED / CODE NOT STARTED
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
