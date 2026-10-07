# CURRENT_REPO_HANDOFF.md — Beast Link Battle

Status: **Repository-local coding handoff**

## Current status — 2026-10-04

- V14A: **OWNER STRUCTURAL PASS** / Experimental / not adopted.
- V14B.1/B.2: **CORE IMPLEMENTED**; owner-live evidence open.
- V14B.3: **IMPLEMENTED**; code review PASS; live hypothesis validation open.
- V14C.1: **IMPLEMENTED**; deterministic/build evidence PASS; owner-live open.
- V14C.2: **IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL**; live evidence open — `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`.
- V14C.1a: **IMPLEMENTED / DETERMINISTIC PASS / OWNER-LIVE OPEN** — First-Match Start Buffer. See `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`.
- V14C.1a.1: **IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED** — Timing State Hardening & Repo Closeout. Remote implementation: `1833f5a746cc414e5fdfc489b244c7969a61670c`.
- V14E: **IMPLEMENTED / DETERMINISTIC EVIDENCE HARDENED / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED** — remote baseline `33dbaa1f3ac684c5785c8b863383f4b6cad8cf47`.
- V14E.1: **IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED** — Policy Semantics & Evidence Hardening. See `docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`.
- P1-V14F.1: **IMPLEMENTED / DETERMINISTIC PASS / LIVE A–H OPEN / EXPERIMENTAL** — Energy cast reliability + initial Setup roster presentation. Remote main: `8666a5eeb27c6bc4ef0ef9fdc918d23524adc5f8`.
- P1-V14F.1c: **PLAYER-SURFACE VISUAL CLOSEOUT / FORMATION-BOARD IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED** — Battle Setup visual hierarchy remains a live screenshot gate. See `docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`.
- P1-V14G.1: **CORE IMPLEMENTED / DETERMINISTIC PASS / REMOTE VERIFIED / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED** — Tactical Energy Core at `1102a0771c1c086a2bc85b30bd57c449877aba7d`.
- P1-V14G.2: **PLAYER SURFACE IMPLEMENTED / G.2-SPECIFIC DETERMINISTIC PASS / CHECK-BUILD PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED** — evidence through `3659e75313c80b0910509050ac2979e028684470`.
- P1-V14G.2.3: **PRE-LIVE CLOSEOUT COMPLETE** — three-layer Battle Energy rows, canonical Beast feedback, canonical-name regression check.
- P1-V14G.3: **BATTLE SYSTEM OWNER-LIVE PASS / EXPERIMENTAL / NOT ADOPTED** — Battle-time tactical Energy communication accepted by owner.
- P1-V14G.4A: **CORE IDENTITY SURFACE IMPLEMENTED / DETERMINISTIC PASS / OWNER LIVE PASS / EXPERIMENTAL / NOT ADOPTED** — Energy Rush tactical names, complete zero-count inventory, and catalog effect hints are accepted live. G.4B NEXT THREAT remains deferred by default.
- P1-V14G.5: **REVIEW STILL OPEN / Tactical Energy remains Experimental / not adopted** — see `docs/P1-V14G5-TACTICAL-ENERGY-REVIEW-ADOPTION-GATE.md`.
- P1-V15A: **IMPLEMENTED / DETERMINISTIC PASS / BUILD PASS / LIVE VISUAL QA OPEN / EXPERIMENTAL** — six unique Beast Signatures + behavioral STAR evolution. See `docs/P1-V15A-UNIT-IDENTITY-STAR-EVOLUTION.md`.
- Squad Capacity Upgrade: **NOT STARTED**.

This file mirrors the current implementation priorities so coding agents can work **without querying Notion MCP**.

## Coding-agent source order

For gameplay/code tasks, use only repository-local sources unless the user explicitly requests a Notion sync:

1. `AI_INSTRUCTIONS.md`
2. this file
3. active V15A slice: `docs/P1-V15A-UNIT-IDENTITY-STAR-EVOLUTION.md`
4. unresolved Tactical Energy review gate: `docs/P1-V14G5-TACTICAL-ENERGY-REVIEW-ADOPTION-GATE.md`
4. completed Energy Rush identity slice: `docs/P1-V14G4-ENERGY-RUSH-TACTICAL-IDENTITY-CLOSEOUT.md`
4. parent V14G spec: `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md`
4. completed player-surface slice: `docs/P1-V14G2-TACTICAL-ENERGY-PLAYER-SURFACE.md`
5. completed pre-live closeout: `docs/P1-V14G23-LIVE-GATE-PREP-DOC-SYNC.md`
4. parent tactical Energy spec: `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md`
4. player-surface visual closeout: `docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`
4. implemented F.1 baseline: `docs/P1-V14F1-BATTLE-UX-ENERGY-CAST-RELIABILITY.md`
4. completed corrective validation slice: `docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`
5. integration baseline: `docs/P1-V14E-INTEGRATION-VALIDATION.md`
6. implemented gameplay slice: `docs/P1-V14D-PERSISTENT-ENERGY.md`
6. completed closeout slice: `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
7. previous corrective slice: `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
8. implemented reward slice: `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
9. previous timing slice: `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
10. `docs/P1-V14B3-STAR-POWER-DENSITY.md`
11. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
12. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
13. relevant historical slice docs
14. current code/tests

If repository docs conflict with current code, inspect the code and report the conflict. Do not call Notion automatically.

## Current milestone

**FINAL ART PHASE V2 — Snowguard Base Cutout Live QA**

Status: **SNOWGUARD V2 BASE-ONLY MIGRATION COMPLETE / CI PASS / LIVE QA REQUIRED**

Primary sources:
1. `docs/BATTLE-ART-DIRECTION-V2.md`
2. `docs/UNIT-PRODUCTION-BRIEF-V2.md`
3. `docs/BATTLE-SPRITE-INTEGRATION-PLAN.md`

Snowguard V2 implemented:
- `base_v2.svg`;
- `icon_v2.svg`;
- manifest uses one base cutout;
- no V1 attack/hit/signature/KO pose dependency;
- `TANK` transform profile drives motion;
- Guardian Brace remains runtime VFX;
- final deterministic/build gate GitHub Actions run 133 PASS.

Immediate owner QA:
1. refresh build;
2. press `L`;
3. inspect Snowguard at idle;
4. watch attack + hit transform;
5. inspect Guardian Brace;
6. capture one representative frame.

After live PASS:
**V2-M2B — Starcaller simplified base-art migration**.

Gameplay remains frozen.

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

## Implemented Slice History & Operational Status

### P1-V14B.1 / B.2 — Run Roster, Partial Deployment & Attrition
- Persistent `RunRoster` maintains stable unit instances across Waves.
- Partial deployment allows deploying 1–4 units (Active Squad cap = 4).
- Persistent HP and KO status reconcile back to Roster after Battle.
- Wave transition clears deployment slots (`ACTIVE 0 / 4` at each setup).
- Old living units and new recruits coexist in Reserve.
- Core implemented; deterministic checks pass; owner-live A–H open.

### P1-V14B.3 — STAR Consolidation / Power Density
- Automatic greedy conversion stopped: recruitment produces separate 1★ Run Unit instances.
- Optional manual Reserve-only consolidation (cost structure: 1 / 3 / 9).
- Aggregate health ratio preserved (no full-heal upon consolidation).
- KO and deployed units excluded from consolidation.
- Centralized STAR stat profile and signature scaling.
- Implemented; code review PASS; live hypothesis validation open.

### P1-V14C.1 — Combo Quality Signal
- Decoupled 12.0s phase timer from 1.5s Combo link window.
- Match count = Beast quantity; Combo streak = quality signal.
- Implemented; deterministic/build PASS; owner-live open.

### P1-V14C.2 — Link Shard Consolidation Efficiency
- Best streak in Beast Rush awards Link Shards (streak 4–6: 1, 7+: 2, max 2/rush, run cap 3).
- Shards persist across Waves and substitute for 1 missing copy in Reserve consolidation.
- Requires minimum 2 real Beast bodies; 0 phantom HP.
- Implemented / deterministic PASS / Experimental; live evidence open.

### P1-V14C.1a — First-Match Start Buffer
- Both Beast Rush and Energy Rush enter `READY 12.0s`.
- Player observes board freely; invalid input does not start timer.
- First valid match starts the timer exactly once.
- Implemented / deterministic PASS / owner-live open.

### P1-V14C.1a.1 — Timing State Hardening & Repo Closeout
- Terminal state rule enforced: `ENDED → start()` is a NO-OP; `ENDED → update()` is a NO-OP; `remainingSeconds` stays 0.
- Only `reset()` returns `ENDED → READY 12.0s`.
- Remote implementation verified at `1833f5a746cc414e5fdfc489b244c7969a61670c`.
- Deterministic/check/build evidence PASS per implementation report; live browser closeout not recorded.

### P1-V14D — Persistent Energy / Save-vs-Spend Across Waves
- Active gameplay slice.
- `EnergyQueue` is Run-scoped; unused charges persist across Waves.
- `resetWavePreparation()` preserves `energyQueue`.
- `restartRun()` clears `energyQueue` (0 cross-run leakage).
- No storage cap (charges may exceed 6 and 20).
- Implemented / deterministic PASS / Experimental.

## Active / Deferred Gameplay Slices

- **P1-V14E — Integration Validation**: IMPLEMENTED / DETERMINISTIC EVIDENCE HARDENED / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED.
- **P1-V14E.1 — Policy Semantics & Evidence Hardening**: IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED.
- **Squad Capacity Upgrade**: Future experiment. NOT STARTED.
- **Still deferred**:
  - new Tactical Energy types
  - revive / resting recovery
  - post-Wave healing rewards
  - items / equipment / traits
  - economy / meta progression
  - procedural Waves
  - final STAR evolution art

## Open Earlier Evidence Gates

- B.1/B.2 owner-live A–H remains unclosed unless explicitly verified.
- P1-V13A full live signature A/B verification remains open.
- P1-V13A.1D Deployment Workspace UX remains not passed.
- These are not silently closed by V14 slices.

## Active Documentation
Read:
- `docs/P1-V14G2-TACTICAL-ENERGY-PLAYER-SURFACE.md`
- `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md`
- `docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`
- `docs/P1-V14F1-BATTLE-UX-ENERGY-CAST-RELIABILITY.md`
- `docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`
- `docs/P1-V14E-INTEGRATION-VALIDATION.md`
- `docs/P1-V14D-PERSISTENT-ENERGY.md`
- `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
- `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
- `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
- `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
- `docs/P1-V14B3-STAR-POWER-DENSITY.md`

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
