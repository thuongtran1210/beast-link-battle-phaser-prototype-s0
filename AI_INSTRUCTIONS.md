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
3. active gameplay design spec: `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md`
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

- Current slice: **P1-V14G.1 — Tactical Energy Core**. CORE IMPLEMENTED / DETERMINISTIC PASS / player-surface G.2 pending / live not recorded / Experimental / not adopted. See `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md`.
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

## Active design — P1-V14G Energy Identity & Activation Grammar

Purpose:

**Make each Energy communicate what it does, what it targets, when it can be cast, and when it is contextually relevant.**

Implementation is owner-authorized. Follow the locked baseline and repo-only execution boundary.

Locked identities:
- `energy-a → MEND`: heal frontmost living ally up to 30 HP.
- `energy-b → RESCUE`: heal the most damaged living Mid/Back ally up to 30 HP.
- `energy-c → BREAK`: deal 30 direct Energy damage to a living Frontliner.
- `energy-d → PIERCE`: deal 30 direct Energy damage to a living Ranged enemy.

Activation grammar:
- Setup = preview only.
- Running Battle = `DISABLED / READY / SUGGESTED`.
- Paused / Win / Lose = disabled.
- player chooses when to cast; no auto-cast.
- successful effective result consumes exactly 1 selected charge.
- failed / ineffective result consumes 0.
- deterministic targeting remains model-owned.
- no manual target selection in baseline.
- V14G Energy Rush player pool uses A–D only.
- energy-e/f remain historical generic IDs.

Suggested conditions:
- MEND: frontline missing >=30 HP or <=60% HP.
- RESCUE: Diver pressure on Mid/Back or chosen target <=60% HP.
- BREAK: 2+ living Frontliners.
- PIERCE: living Ranged + living Frontliner.

Threat teaching relationship:
- Frontline Pressure → MEND / BREAK.
- Backline Dive → RESCUE.
- Protected Ranged → PIERCE.

## V14G non-goals

Do NOT implement:
- more than four active tactical Energy types;
- manual Energy target selection;
- Energy cooldown;
- Energy cap / decay;
- Energy Combo;
- Energy crafting / rarity / upgrades;
- Squad Capacity upgrade;
- revive / recovery;
- shop / meta progression.

## Workflow

1. Treat `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md` as the active design spec.
2. Do not implement until owner explicitly approves code.
3. Preserve V14D persistence and F.1 effective-result-first charge consumption.
4. Keep the tactical Energy catalog centralized.
5. Keep UI guidance descriptive, not automatic.
6. Keep deterministic and live evidence separate.

