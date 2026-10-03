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
3. active player-surface corrective slice: `docs/P1-V14F1-BATTLE-UX-ENERGY-CAST-RELIABILITY.md`
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

- Current slice: **P1-V14F.1 — Battle Setup UX Clarity + Energy Cast Reliability**. ACTIVE / owner authorized / code not started / Experimental / not adopted. See `docs/P1-V14F1-BATTLE-UX-ENERGY-CAST-RELIABILITY.md`.
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

## Active player-surface correction — P1-V14F.1

Purpose:

**Make Battle Setup readable and manual Energy casting visibly reliable without adding a new gameplay mechanic.**

Required:
- separate Reserve / Deployed / KO presentation;
- KO stays visible but non-deployable and visually disabled;
- Active Squad cap 4 vs Formation Grid 18 must be explicit;
- simplify Battle Setup header and enemy-card hierarchy;
- Setup Stored Energy is preview-only;
- Battle Energy controls are interactive and stateful;
- manual cast is eligible only in Running Battle with charge, living frontline, and missing HP;
- full-HP frontline consumes 0 Energy;
- success consumes exactly 1 selected charge and shows actual +heal feedback;
- invalid casts expose deterministic reason text/state;
- normal Battle and Showcase HUD use the same eligibility/cast semantics;
- preserve V14A–E.1 mechanics and evidence.

## F.1 non-goals

Do NOT implement:
- arbitrary Energy target selection;
- new Energy effects;
- Energy cap / decay;
- Energy Combo;
- Squad Capacity upgrade;
- revive / recovery;
- economy / shop;
- meta progression;
- broad scene rewrite;
- final production art.

## Verification discipline

Keep separate:
1. code exists
2. deterministic checks pass
3. `npm run check` passes
4. `npm run build` passes
5. live browser behavior passes
6. owner verification passes
7. design is adopted

## Required F.1 workflow

1. Read repo-local sources only.
2. Inspect current BattleSetupView, ValidationScene.castEnergy, ShowcaseBattleHUDView, BattleActionView, and AutonomousBattleModel.castFrontlineHeal.
3. Implement Battle Setup hierarchy / Reserve / KO correction.
4. Introduce one shared deterministic Energy cast eligibility/result seam.
5. Prevent full-HP cast from consuming a charge.
6. Add visible success and failure feedback.
7. Route normal Battle and Showcase HUD through the same semantics.
8. Add deterministic F.1 checks.
9. Run historical regressions.
10. Run `npm run check`.
11. Run `npm run build`.
12. Record Live A–H only if browser evidence is actually available.
13. STOP after F.1 report.

## Completion report

Report:
- final commit SHA
- files changed
- Setup layout changes
- Reserve / Deployed / KO classification
- exact cast eligibility rules
- full-HP protection
- success/failure result behavior
- normal vs Showcase shared path
- deterministic F.1 checks
- regressions
- `npm run check`
- `npm run build`
- Live A–H status
- known limitations

Explicitly state:

```text
P1-V14F.1 ADDS NO NEW ENERGY MECHANIC.
FULL-HP FRONTLINE CAST CONSUMES 0 ENERGY.
SUCCESSFUL EFFECTIVE HEAL CONSUMES EXACTLY 1 SELECTED CHARGE.
SETUP ENERGY IS PREVIEW-ONLY.
ACTIVE SQUAD CAP REMAINS 4.
FORMATION GRID REMAINS 18 POSITIONS.
LIVE A–H REMAIN OPEN UNLESS ACTUALLY RECORDED.
ENERGY CAP / DECAY NOT STARTED.
SQUAD CAPACITY UPGRADE NOT STARTED.
```
