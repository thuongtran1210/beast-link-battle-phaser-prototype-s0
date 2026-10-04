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
3. active live-validation gate: `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md`
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

- Current slice: **P1-V14G.3 — Tactical Energy Live Validation Gate**. **BATTLE SYSTEM OWNER-LIVE PASS** / Energy Rush identity communication still open / Experimental / not adopted. No new Battle Energy implementation is authorized.
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

## Active validation — P1-V14G.3 Tactical Energy Live Validation Gate

Purpose:

**Validate whether the implemented tactical Energy system is understandable in live play.**

Current implementation evidence:
- G.1 core implemented.
- G.2 player surface implemented.
- normal and Showcase Battle rows present identity → effect → activation state.
- ally cast feedback uses canonical Beast display names.
- G.2 deterministic checks are wired into `npm run check`.
- separate G.2.3 regression proves `MEND → SNOWGUARD +30`.
- Owner live evidence records the **V14G Battle system PASS**. Energy Rush identity remains partially unresolved.

G.3 rules after owner Battle PASS:
- preserve current Battle tactical Energy mechanics;
- do not rebalance Battle Energy;
- do not add Energy types;
- do not add cooldown;
- do not add manual target selection;
- do not add auto-cast;
- do not add cap or decay;
- Battle owner PASS is scoped to the Battle system, not full V14G adoption;
- Energy Rush identity may receive a presentation-only follow-up after owner/spec authorization.

Owner live Battle answers:
- identify tactical Energy in Battle: PASS;
- understand effect: PASS;
- READY / SUGGESTED / DISABLED: PASS;
- understand SUGGESTED reason: PASS;
- cast feedback to actual target: PASS;
- SUGGESTED remains manual guidance: PASS.

Open: Energy Rush still emphasizes A/B/C/D + ENERGY, so collection-phase tactical identity is not yet fully passed. Cross-Wave save-vs-later remains an integration evidence question. V14G remains Experimental / not adopted.
