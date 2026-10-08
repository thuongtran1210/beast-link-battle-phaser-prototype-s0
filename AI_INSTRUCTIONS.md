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
2. `docs/BATTLE-ART-DIRECTION-V2.md` when the task touches Battle presentation/art
3. `docs/UNIT-PRODUCTION-BRIEF-V2.md` for character production
4. `docs/BATTLE-SPRITE-INTEGRATION-PLAN.md` for the active visual integration gate
5. this file
3. active review gate: `docs/P1-V14G5-TACTICAL-ENERGY-REVIEW-ADOPTION-GATE.md`
4. completed Energy Rush identity slice: `docs/P1-V14G4-ENERGY-RUSH-TACTICAL-IDENTITY-CLOSEOUT.md`
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
13. relevant historical docs
14. current code/tests

If repo docs and code conflict:
- inspect current code
- report the conflict
- do not invent missing behavior
- do not fetch Notion unless the user explicitly asks

## Current project state

- Active implementation task: **V2-M4 — Simple Chibi Cutout scale / spacing / readability live re-QA**. This is presentation-only. 6/6 player Beast cutouts and 3/3 enemy cutouts are integrated; M4 scale/declumping code passed CI. Owner live re-QA is the current blocker before final portfolio capture.
- **Gameplay is frozen during V2-M4.** Do not use visual work to change damage, targeting, STAR, Energy, formation, Wave, or Signature semantics.
- P1-V14G.5 Tactical Energy Review / Adoption Gate remains an unresolved gameplay decision in parallel; visual work does not imply ADOPT.

- Current slice: **P1-V14G.5 — Tactical Energy Review / Adoption Gate**. ACTIVE REVIEW / owner adoption decision required / NO NEW GAMEPLAY IMPLEMENTATION / Experimental / not adopted. See `docs/P1-V14G5-TACTICAL-ENERGY-REVIEW-ADOPTION-GATE.md`.
- V14G.3 Battle system is OWNER-LIVE PASS.
- V14G.4A Energy Rush identity is OWNER-LIVE PASS.
- G.4B NEXT THREAT is deferred by default and must not be implemented without a demonstrated live need.
- G.1 core is remote verified at `1102a0771c1c086a2bc85b30bd57c449877aba7d`.
- F.1c player-surface visual closeout remains a separate live screenshot gate.
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

## Active review — P1-V14G.5 Tactical Energy Review / Adoption Gate

Purpose:

**Decide whether the complete Tactical Energy experiment should become baseline gameplay.**

This is a review/decision gate, not an implementation slice.

Current accepted evidence:
- G.1 tactical core implemented / deterministic pass;
- G.2 player surface implemented / deterministic pass;
- G.3 Battle owner-live PASS;
- G.4A Energy Rush identity owner-live PASS;
- V14D persistent Energy implemented;
- V14E deterministic SAVE vs SPEND evidence exists.

Valid owner outcomes:
- ADOPT;
- CONDITIONAL HOLD;
- DO NOT ADOPT.

Do not:
- add new Energy mechanics;
- add G.4B NEXT THREAT by default;
- rebalance Energy;
- add cooldown, cap, decay, rarity, upgrades, manual target selection, or auto-cast;
- start Squad Capacity work.

If the owner selects ADOPT, update repo-local docs to mark only V14G as adopted and record the exact baseline semantics.

If the owner selects CONDITIONAL HOLD, record exactly one unresolved adoption question and authorize only evidence work necessary to answer it.

If the owner selects DO NOT ADOPT, preserve working code until a separate cleanup/revert decision.

Read:
`docs/P1-V14G5-TACTICAL-ENERGY-REVIEW-ADOPTION-GATE.md`

V14G remains Experimental / not adopted until explicit owner decision.
