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
3. active implementation slice: `docs/P1-V14G2-TACTICAL-ENERGY-PLAYER-SURFACE.md`
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

- Current slice: **P1-V14G.2 — Tactical Energy Player Surface + G.1 Semantic Hardening**. ACTIVE IMPLEMENTATION / owner authorized / code not started / Experimental / not adopted. See `docs/P1-V14G2-TACTICAL-ENERGY-PLAYER-SURFACE.md`.
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

## Active implementation — P1-V14G.2 Tactical Energy Player Surface

Purpose:

**Make the G.1 tactical Energy model visible, understandable, and actually used by player gameplay.**

Required:
- harden RESCUE Diver-pressure suggestion so ANY Diver pressure on ANY Mid/Back body can suggest RESCUE;
- route player `castEnergy()` through `castTacticalEnergy()`;
- Setup shows MEND / RESCUE / BREAK / PIERCE names and one-line effect hints;
- Energy Rush player-facing HUD / match feedback uses tactical names;
- normal Battle and Showcase derive availability from `tacticalEnergyEligibility()`;
- surface `DISABLED / READY / SUGGESTED`;
- use compact deterministic reason labels;
- SUGGESTED remains guidance only;
- successful MEND/RESCUE display heal feedback on actual target;
- successful BREAK/PIERCE display Energy-damage feedback on actual enemy target;
- disabled controls consume 0 and do not invoke cast;
- no universal `CAST HEAL` text for damage Energy;
- internal A/B/C/D IDs are not primary player labels.

## G.2 non-goals

Do NOT implement:
- new Energy types;
- manual Energy target selection;
- Energy cooldown;
- Energy cap / decay;
- Energy Combo;
- crafting / rarity / upgrades;
- auto-cast;
- best/optimal Energy ranking;
- new Wave mechanics;
- final art.

## Required workflow

1. Read repo-local sources only.
2. Verify G.1 remote baseline and current player-surface mismatch.
3. Fix RESCUE suggestion semantics first.
4. Create one shared pure tactical Energy presentation helper.
5. Route player cast through tactical model result.
6. Update Setup / Energy Rush HUD / normal Battle / Showcase presentation.
7. Add target-correct heal/damage feedback.
8. Add deterministic G.2 checks.
9. Run all historical regressions.
10. Run `npm run check`.
11. Run `npm run build`.
12. Record Live A–H only if actually observed.
13. STOP for owner live review.

## Completion report

Report:
- final origin/main SHA
- files changed
- RESCUE hardening
- player cast routing
- Setup tactical identity
- Energy Rush tactical identity
- normal Battle states
- Showcase states
- READY/SUGGESTED/DISABLED grammar
- success feedback per kind
- failure reason mapping
- deterministic checks
- regressions
- check/build
- live status
- known limitations

Explicitly state:

```text
PLAYER GAMEPLAY NOW ROUTES TACTICAL ENERGY THROUGH CASTTACTICALENERGY.

MEND / RESCUE / BREAK / PIERCE ARE PRIMARY PLAYER-FACING IDENTITIES.

SUGGESTED IS GUIDANCE ONLY AND NEVER AUTO-CASTS.

SUCCESSFUL EFFECTIVE CAST CONSUMES EXACTLY 1 SELECTED CHARGE.

FAILED / DISABLED / STALE CAST CONSUMES 0.

V14G REMAINS EXPERIMENTAL / NOT ADOPTED.
```
