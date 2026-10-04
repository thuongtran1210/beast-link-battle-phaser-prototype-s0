# P1-V14G.2.3 — Live Gate Prep & Documentation Sync

Status: **ACTIVE MICRO-CLOSEOUT / OWNER AUTHORIZED / CODE NOT STARTED / EXPERIMENTAL / NOT ADOPTED**.

## Purpose

Baseline: `0bb88cc780ae594d25a1eab3abf9ec4c8fd812c3`.

This micro-closeout adds no gameplay. It prepares P1-V14G.3 live validation.

## Required fixes

1. `tacticalEnergyCastFeedback()` must use existing `beastDisplayName(beastId)` for ally feedback. Expected examples: `MEND → SNOWGUARD +30`, `RESCUE → STARCALLER +18`.
2. Normal and Showcase Battle rows must render three non-overlapping lines: identity/count, effect description, activation state/reason.
3. Synchronize repo-local operational docs so G.2 is recorded as implemented and deterministic-pass, while G.3 is the next live-only gate.

## Evidence correction

`P1V14G2Checks.ts` currently executes 15 runtime `ok(...)` assertion calls, including four calls inside the catalog-identity loop. Do not report 13.

## Preserve

Preserve tactical effects, targeting, 30-point baseline, charge consumption, persistence, Energy Rush timing, Battle rules, STAR, Link, squad cap 4, and Formation Grid 18.

## Exit gate

Run `npm run check` and `npm run build`. Live evidence remains unrecorded unless actually observed. Then stop for P1-V14G.3 live validation. V14G remains Experimental / not adopted.