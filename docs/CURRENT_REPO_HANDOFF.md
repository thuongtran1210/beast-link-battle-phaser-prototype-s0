# CURRENT_REPO_HANDOFF.md — Beast Link Battle

Status: **Repository-local coding handoff**

## Current status — 2026-10-08

Setup UI: larger formation cells and clearer Reserve identity/STAR cards. Each Reserve card now exposes MERGE when `RunRoster.consolidationPreview` allows it, with 3-copy or 2-copy + 1-shard cost visible. The existing consolidation callback applies consumption, attrition HP, primary-ID preservation and metrics; no merge-rule changes. Disabled cards show copy requirements/max STAR. Deterministic merge suite remains the source for eligibility validation; live touch/layout QA is open.

Battle mobile refinement: side context is reduced to enemy count/HP/status. Skill descriptions and eligibility reason appear while pressing a circular skill; holding at least 350ms inspects without casting, quick release casts if eligible. Successful casts show −1 CHARGE near their slot; existing target heal/damage FX remain. Battlefield presentation expands horizontally on wider screens and reserves space above the dock. Gameplay rules unchanged. Automated checks pass; physical-mobile visual and touch QA remains open.

Battle Cast presentation: four fixed circular Tactical Energy buttons now sit bottom-center of the battlefield, with charge badges and READY / SUGGESTED / DISABLED states. Side rail retains battle context and catalog effect hints. Cast eligibility and callbacks are unchanged. Checks/build validation recorded; device-live visual QA remains open.

Latest presentation pass: compact mobile landscape shell, global HUD and Rush board/rail implemented; gameplay unchanged. Force QA using `?mobile=1`. Deterministic mobile board bounds/touch-target checks pass alongside gameplay suite; device-live QA open. See `docs/MOBILE-LANDSCAPE-UI-2026-10-08.md`. Setup/Battle-specific touch layout is not claimed complete.

### Latest owner art integration

Latest icon pass: all 27 library entries and 6 Beast / 3 enemy active slots now reference the owner's colored `icon_v02.png` portraits. Body sprites unchanged. Axe badge and alternate polar-bear portrait stored separately. See `docs/OWNER-PORTRAIT-UPDATE-2026-10-08.md`; live QA remains open.

Latest completion: **6/6 Beast + 3/3 enemy archetype art integrated**, with Starcaller now using purple badger mage and enemies using penguin knight / crow assassin / deer archer. A 27-character, 54-PNG asset library and JSON manifest have been exported from the owner's complete sheet. Remaining library characters have no new gameplay. See `docs/OWNER-ROSTER-COMPLETION-2026-10-08.md`. Owner live QA remains open; previous paragraph records the earlier five-character pass.

Owner requested direct use of a supplied five-character lineup and portrait sheet. Five Beast body/icon pairs now use `base_owner_v01.png` / `icon_owner_v01.png` by default (including the existing `?art=preview` URL): Snowguard = duck/shield, Ironclad = bear/hammer, Windstrider = rabbit/bow, Swiftwing = fox/bow, Shadowclaw = raccoon/sword. Starcaller and enemies retain V2 art. HP anchors/reference scales adjusted for normalized PNG canvases; gameplay unchanged. Source sheets/export script and analysis are recorded in `docs/OWNER-ART-INTEGRATION-2026-10-08.md`. Status: OWNER-SUPPLIED / INTEGRATED / LIVE QA OPEN. Earlier Snowguard candidates remain archived in-place; the query no longer opts into them.

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

### Active presentation gate — V2-M4

- **Simple Chibi Cutout V2** is the current art/presentation source of truth.
- 6 / 6 player Beasts and 3 / 3 enemy archetypes are integrated as authored cutouts.
- Attack / Hit / KO are transform-driven; Signature power remains VFX-driven.
- latest M4 scale / spacing / HP-anchor polish is implemented.
- M4 deterministic/readability gate passed at GitHub Actions run 163; repository is green through run 165.
- **Current blocker:** owner live re-QA of the latest 1280×720 Battle composition.
- **Next:** final portfolio capture only after live readability PASS.
- Gameplay remains frozen; Tactical Energy adoption is a separate open design decision.

## Current milestone

**FINAL ART PHASE V2 — Scale / Spacing / Readability Live Re-QA**

Status: **FULL CUTOUT ROSTER COMPLETE / READABILITY POLISH IMPLEMENTED / CI PASS**

Latest visual review found:
- characters were too small relative to the battlefield;
- clustered units overlapped too tightly;
- HP anchors needed retuning after cutout migration.

Implemented:
- player display heights: 112–124 px;
- enemy display heights: 108–116 px;
- HP/effect anchors retuned;
- wider vertical declumping;
- both teams pulled slightly toward battle center for stronger composition;
- deterministic minimum-scale guard added;
- GitHub Actions run 163 PASS.

Immediate owner QA:
1. refresh latest build;
2. press `L`;
3. capture one Battle frame;
4. verify larger readable silhouettes and reduced overlap.

After PASS:
**final portfolio capture + showcase documentation**.

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
# Energy Rush presentation update (2026-10-08)

See `docs/ENERGY-RUSH-UI-2026-10-08.md`. Dedicated Energy HUD, visible tactical tile names, distinct glyphs, effect descriptions, and stored/carry/current-Rush totals are implemented. Automated checks and build pass; live mobile visual review remains outstanding.
