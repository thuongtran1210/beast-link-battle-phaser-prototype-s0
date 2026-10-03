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
3. active player-surface visual closeout: `docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`
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
13. relevant historical docs
14. current code/tests

If repo docs and code conflict:
- inspect current code
- report the conflict
- do not invent missing behavior
- do not fetch Notion unless the user explicitly asks

## Current project state

- Current slice: **P1-V14F.1c — Battle Setup Visual Closeout**. ACTIVE / owner authorized / code not started / Experimental / not adopted. See `docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`.
- F.1 baseline is implemented on remote main at `8666a5eeb27c6bc4ef0ef9fdc918d23524adc5f8`; Energy cast reliability is complete, but owner screenshot shows remaining Setup visual closeout work.
- V14E Multi-Wave Resource Commitment Integration Validation: IMPLEMENTED / DETERMINISTIC EVIDENCE HARDENED / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED. 70 deterministic checks pass. Controlled SAVE vs SPEND fixture verified; Energy policy ownership made explicit; Link Shard accounting corrected; divergence count aligned with harness output; production squad-cap constant verified.
- V14D Persistent Energy: `EnergyQueue` is Run-scoped; unused stored Energy persists across Waves. Reset only on Restart / new Run. No storage cap.
- V14C.1a.1 Timing State Hardening: Enforces strict terminal state rule: `ENDED → start()` is a NO-OP; `ENDED → update()` is a NO-OP; `remainingSeconds` stays 0; only `reset()` returns `ENDED → READY 12.0s`.
- V14C.1a First-Match Start Buffer: `READY → first valid match → ACTIVE 12.0s timer`. Invalid input does not start timer.
- P1-V14C.2 Link Shard: IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL / LIVE EVIDENCE OPEN.
- V14C.1 Combo Quality Signal: IMPLEMENTED / DETERMINISTIC PASS / OWNER-LIVE OPEN.
- V14B.3 STAR Consolidation: IMPLEMENTED / CODE REVIEW PASS / LIVE HYPOTHESIS OPEN.
- V14B.1/B.2 Run Roster & Attrition: CORE IMPLEMENTED / OWNER-LIVE EVIDENCE OPEN.
- Squad Capacity upgrades: NOT STARTED.
- V14 remains Experimental / not adopted.

## Implemented architecture baselines

- RunRoster unit identity, HP / KO persistence, per-Wave deployment reset: implemented.
- B.3 manual STAR consolidation: implemented; do not restore greedy recruitment conversion.
- C.1 Combo quality: implemented; do not restore +0.3 phase-time extension.
- C.2 Link Shard: implemented; preserve threshold, cap, persistence, assisted consolidation, and zero-phantom-HP rules.
- C.1a first-match timer start: implemented.
- C.1a.1 terminal timer state: implemented; `ENDED → start()` is a no-op.
- Active Squad cap remains 4.
- Formation Grid capacity remains independent of squad capacity.

## Active player-surface visual closeout — P1-V14F.1c

Purpose:

**Close Battle Setup visual hierarchy and normal-Battle cast-state presentation without changing gameplay rules.**

Required:
- render one primary Wave title and one Threat line;
- remove duplicate fixture/threat title rendering;
- show `ACTIVE x/4 · GRID 18` explicitly;
- when Active Squad is full, idle empty grid positions must look reposition-only, not deployable;
- simplify Reserve header and keep KO visually separate;
- replace Setup raw Energy text with structured icon/count chips from EnergyQueue entries;
- keep Setup Energy preview-only;
- remove default STAR-consolidation instruction from Stored Energy panel;
- show STAR consolidation only as contextual Reserve state;
- keep `◆ LINK ×N` separate from Energy rows;
- normal PrototypeFlowPanel Energy controls must use the same `castControlState` semantics as Showcase;
- disabled normal controls must not invoke casts;
- preserve all F.1b Energy-cast reliability rules.

## F.1c non-goals

Do NOT implement:
- new Energy mechanics;
- new targeting;
- Energy cap / decay;
- Energy Combo;
- Squad Capacity upgrade;
- STAR / Link rebalance;
- enemy rebalance;
- final art;
- scene architecture rewrite.

## Required F.1c workflow

1. Read repo-local docs only.
2. Inspect current BattleSetupView header, grid, Reserve tray, right CTA, consolidation inspector, ValidationScene BattleSetup constructor wiring, PrototypeFlowPanel, and EnergyQueue.
3. Add structured Setup Energy entries rather than parsing formatted text.
4. Implement the visual hierarchy cleanup.
5. Move consolidation out of Stored Energy card into Reserve context.
6. Add normal-Battle cast presentation parity.
7. Add deterministic presentation checks.
8. Run all historical regressions.
9. Run `npm run check`.
10. Run `npm run build`.
11. Record live screenshots only if actually observed.
12. STOP for owner screenshot review.

## Completion report

Report:
- final origin/main SHA
- files changed
- header cleanup
- Active/Grid treatment
- full-squad empty-cell treatment
- Reserve/KO surface changes
- Setup Energy structured inventory
- Link resource presentation
- consolidation contextual placement
- normal Battle cast parity
- deterministic checks
- regressions
- `npm run check`
- `npm run build`
- live status
- known limitations

Explicitly state:

```text
P1-V14F.1C ADDS NO GAMEPLAY MECHANIC.
SETUP ENERGY USES STRUCTURED ICON/COUNT PRESENTATION.
STAR CONSOLIDATION NO LONGER OCCUPIES THE ENERGY PANEL.
ACTIVE SQUAD CAP REMAINS 4.
FORMATION GRID REMAINS 18 POSITIONS.
NORMAL AND SHOWCASE CAST CONTROLS SHARE ELIGIBILITY SEMANTICS.
LIVE CLOSEOUT REMAINS OPEN UNLESS ACTUALLY RECORDED.
```
