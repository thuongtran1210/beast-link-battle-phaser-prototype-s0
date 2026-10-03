# P1-V14C.1a.1 — Timing State Hardening & Repo Closeout

Status: **ACTIVE CLOSEOUT SLICE / OWNER AUTHORIZED / EXPERIMENTAL / NOT ADOPTED**.

## Purpose

P1-V14C.1a implemented the desired puzzle timing grammar:

```text
READY
→ first valid match
→ ACTIVE
→ timer reaches 0
→ ENDED
```

Remote implementation exists at:

`cbf94d1e7ab5a5b3899686781646baa02a92bcd6`

Deterministic checks, `npm run check`, and `npm run build` were reported PASS.

Repository review found one terminal-state defect in both phase timers:

```text
ENDED
→ start()
→ ACTIVE 12.0s again
```

because `start()` currently reloads the full duration whenever the timer is inactive with `remainingSeconds === 0`.

This closeout slice hardens the state machine before P1-V14D begins.

## Locked timer state machine

Both Beast Rush and Energy Rush must obey:

```text
READY
→ start()
→ ACTIVE
→ timer reaches 0
→ ENDED
```

Allowed transition from ENDED:

```text
ENDED
→ reset()
→ READY
```

Forbidden:

```text
ENDED
→ start()
→ ACTIVE
```

## Required timer behavior

For both `BeastRushPhaseTimer` and `EnergyRushTimer`:

### READY
- `remainingSeconds = 12.0`
- `isReady = true`
- `isActive = false`
- `isEnded = false`
- `start()` moves to ACTIVE
- `update(delta)` does not consume time

### ACTIVE
- `isReady = false`
- `isActive = true`
- `isEnded = false`
- repeated `start()` is a no-op
- `update(delta)` decrements time
- reaching 0 emits the end event exactly once

### ENDED
- `remainingSeconds = 0`
- `isReady = false`
- `isActive = false`
- `isEnded = true`
- `start()` is a no-op
- `update(delta)` is a no-op
- no duplicate end event may fire

### RESET
Only `reset()` may move ENDED back to READY.

```text
ENDED
→ reset()
→ READY 12.0s
```

## Implementation boundary

Make the smallest possible change.

Preferred guard:

```ts
if (this.state.active || this.isEnded) return this.snapshot;
```

or equivalent.

Do not add a new timer framework.

## Deterministic validation

Add or extend C.1a checks for both timers.

Required:

1. fresh timer = READY 12.0s.
2. READY `start()` → ACTIVE.
3. ACTIVE `start()` does not reset remaining time.
4. ACTIVE reaches 0 → ENDED.
5. end event fires exactly once.
6. ENDED `start()` remains ENDED at 0.
7. repeated ENDED `start()` remains ENDED at 0.
8. ENDED `update()` remains ENDED at 0.
9. ENDED `reset()` → READY 12.0s.
10. after reset, `start()` works normally again.

Run this for:
- `BeastRushPhaseTimer`
- `EnergyRushTimer`

## Gameplay regressions

Preserve P1-V14C.1a:
- READY observation time is free.
- first valid Beast match starts Beast Rush timer.
- first valid Energy match starts Energy Rush timer.
- invalid READY input does not start a timer.
- no READY safety timeout.
- no +0.3 phase extension.

Preserve P1-V14C.1:
- Match count = Beast quantity.
- Combo = independent quality signal.
- Combo link window = 1.5s.

Preserve P1-V14C.2:
- Link Shard thresholds and cap.
- reward evaluated once at Beast Rush end.
- Wave persistence.
- 2-copy + 1-shard assisted consolidation.
- minimum 2 real bodies.
- zero phantom HP.

Preserve P1-V14B.3:
- separate 1★ recruitment.
- manual Reserve-only consolidation.
- STAR stat/signature profiles.
- Active Squad cap = 4.

## Repo documentation cleanup

Repository-local coding docs currently contain stale B.3-era instructions.

Remove or correct statements that still claim:
- B.3 is the active implementation slice;
- `StarConverter.bulk(...)` is the current B.3 blocker;
- player cannot choose separate 1★ bodies vs manual consolidation;
- Combo redesign has not started;
- Link Shard has not started;
- V14C is deferred.

Current operational truth after this closeout starts:

- V14A = owner structural PASS / Experimental / not adopted.
- V14B.1/B.2 = core implemented / owner-live evidence open.
- V14B.3 = implemented / code review PASS / live hypothesis validation open.
- V14C.1 = implemented / deterministic-build evidence / owner-live open.
- V14C.2 = implemented / deterministic PASS / Experimental / live evidence open.
- V14C.1a = implemented / deterministic PASS / owner-live open.
- V14C.1a.1 = ACTIVE closeout slice.
- V14D = NEXT GAMEPLAY SLICE / NOT STARTED.
- Squad Capacity Upgrade = NOT STARTED.

Coding-agent source priority must point first to this file while C.1a.1 is active.

## Non-goals

Do not implement:
- Energy persistence;
- Energy capacity changes;
- new Energy effects;
- Energy Combo;
- new Link Shard behavior;
- STAR rebalance;
- Squad Capacity upgrade;
- READY timeout;
- UI redesign;
- art changes;
- V14D code.

## Validation commands

Run:

```bash
npm run check
npm run build
```

Both must exit 0.

## Live closeout gate

When browser evidence is available:

### Beast
1. enter Beast Rush;
2. remain READY for several seconds;
3. first valid match starts 12.0s timer;
4. allow timer to expire;
5. confirm no restart/re-entry into ACTIVE from late input/callback behavior.

### Energy
1. enter Energy Rush;
2. remain READY for several seconds;
3. first valid match starts 12.0s timer;
4. allow timer to expire;
5. confirm no timer restart after ENDED.

This live closeout is evidence only; it does not adopt V14C.

## Exit condition

After code + checks + build:
- mark C.1a.1 implementation evidence complete;
- keep owner-live evidence separate unless actually recorded;
- stop.

The next gameplay specification after this closeout is:

**P1-V14D — Persistent Energy / Save-vs-Spend Across Waves.**
