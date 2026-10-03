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
3. active corrective validation slice: `docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`
4. integration baseline: `docs/P1-V14E-INTEGRATION-VALIDATION.md`
5. implemented gameplay slice: `docs/P1-V14D-PERSISTENT-ENERGY.md`
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

- Current slice: **P1-V14E.1 — Policy Semantics & Evidence Hardening**. IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED. See `docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`.
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

## Active corrective validation — P1-V14E.1

Purpose:

**Harden policy semantics and evidence quality without adding gameplay mechanics.**

Required:
- CONSERVE and COMMIT must not share one unconditional Energy auto-cast loop.
- Make Energy decision ownership explicit.
- Add / reuse a controlled same-fixture SAVE vs SPEND comparison.
- SAVE must spend 0; SPEND must spend at least 1 when heal threshold occurs.
- SAVE carry-out must exceed SPEND carry-out in the controlled fixture.
- Correct Link Shard accounting from actual earned / spent / remaining values.
- Documented divergence count must equal actual `comparison.divergences.length`.
- If Run Status is listed as a divergence, actual final statuses must differ.
- Import production Active Squad cap instead of using an always-true helper.
- `SIMULATION_STEP = 0.1` means 100 ms; comments/docs must use correct math.
- preserve all V14A–D production mechanics.
- Live A–H remain open unless browser evidence is actually recorded.

## E.1 non-goals

Do NOT implement:
- Energy cap / decay;
- Energy Combo;
- new Energy spells;
- Squad Capacity upgrade;
- new Wave fixtures;
- gameplay rebalance;
- revive / recovery;
- items / economy / shop;
- meta progression;
- broad UI redesign.

## Verification discipline

Keep separate:
1. code exists
2. deterministic checks pass
3. `npm run check` passes
4. `npm run build` passes
5. live browser behavior passes
6. owner verification passes
7. design is adopted

## Required E.1 workflow

1. Read repo-local sources only.
2. Reproduce / inspect the policy Energy branch defect.
3. Make Energy policy ownership explicit.
4. Add controlled SAVE vs SPEND evidence on identical Battle conditions.
5. Correct Link Shard accounting evidence.
6. Make divergence reporting derive from actual comparison output.
7. Replace fake squad-cap helper with production constant.
8. Correct simulation timing wording.
9. Add deterministic E.1 checks.
10. Run all historical regressions.
11. Run `npm run check`.
12. Run `npm run build`.
13. Do not claim Live A–H unless actually recorded.
14. STOP after E.1 implementation report.

## Completion report

Report:
- final commit SHA
- files changed
- exact Energy policy fix
- controlled SAVE / SPEND fixture
- Energy carry-out / HP evidence
- exact Link earned / spent / remaining accounting
- actual divergence list and count
- production squad-cap constant check
- corrected simulation timing
- E.1 deterministic checks
- historical regressions
- `npm run check`
- `npm run build`
- Live A–H status
- known limitations

Explicitly state:

```text
P1-V14E.1 ADDS NO GAMEPLAY MECHANIC.
ENERGY POLICY OWNERSHIP IS EXPLICIT.
CONTROLLED SAVE VS SPEND USES IDENTICAL BATTLE CONDITIONS.
DIVERGENCE COUNT COMES FROM ACTUAL HARNESS OUTPUT.
ACTIVE SQUAD CAP CHECK USES PRODUCTION TRUTH.
SIMULATION_STEP 0.1 = 100 MS.
LIVE A–H REMAIN OPEN UNLESS ACTUALLY RECORDED.
ENERGY CAP / DECAY NOT STARTED.
SQUAD CAPACITY UPGRADE NOT STARTED.
```
