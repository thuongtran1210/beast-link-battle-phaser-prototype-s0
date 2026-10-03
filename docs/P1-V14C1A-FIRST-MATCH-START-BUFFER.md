# P1-V14C.1a — First-Match Start Buffer

Status: **IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL (NOT ADOPTED)**.

## Why this slice exists

P1-V14C.1 correctly separated Beast Rush phase duration from Combo quality, but its fixed 12.0s phase timer currently starts immediately when the board appears. Energy Rush also starts its phase countdown immediately.

Owner review identified a UX/game-feel problem:

> the player loses timed execution budget while still visually reading a newly generated board.

This can make the measured result partly reflect board-reading latency instead of matching execution.

## Core principle

**Puzzle phase timing measures execution after commitment, not board-reading latency.**

Both timed puzzle phases use the same interaction grammar:

```text
ENTER PHASE
→ BOARD READY
→ observe freely
→ FIRST VALID MATCH
→ timed execution begins
→ timer reaches 0
→ phase ends
```

## Shared state model

Both Beast Rush and Energy Rush use:

```text
READY
→ first valid match
→ ACTIVE
→ timer reaches 0
→ END
```

### READY

- board is fully visible
- puzzle input is enabled
- phase timer is loaded to 12.0s but paused
- timer does not decrease
- invalid input does not start the timer
- there is no automatic safety countdown in this experiment

### ACTIVE

The first valid match:
- resolves normally
- grants its normal resource
- starts the 12.0s phase timer exactly once

Further valid matches do not restart or extend the phase timer.

### END

When the ACTIVE timer reaches 0:
- puzzle input disables
- existing transition flow continues
- end event fires once

## Beast Rush rule

Before the first valid Beast match:

```text
RUSH 12.0s
READY
COMBO ×0
BEST ×0
```

The first valid Beast match simultaneously:
- recruits exactly +1 Beast through the existing BattleQueue path
- changes phase timing READY → ACTIVE
- starts the fixed 12.0s Rush countdown
- starts Combo quality at streak 1
- starts the 1.5s Combo link window

C.1 remains true:

```text
MATCH COUNT = BEAST QUANTITY
COMBO = QUALITY SIGNAL
```

Combo still never extends phase time.

## Energy Rush rule

Before the first valid Energy match:

```text
ENERGY 12.0s
READY
```

The first valid Energy match simultaneously:
- grants the normal Energy charge
- changes READY → ACTIVE
- starts the fixed 12.0s Energy countdown

Invalid selections do not start the countdown.

Energy Rush does not inherit Beast Combo quality unless separately authorized later.

## Invalid input

During READY:
- invalid selection/link does not start the timer
- it may still produce existing invalid feedback/metrics

During ACTIVE:
- Beast Rush invalid input continues to follow the C.1 Combo-break rule
- it never changes phase timer ownership
- Energy Rush invalid input never changes phase timer duration

## Deadlock / auto-reshuffle

System-driven deadlock recovery is not player commitment.

Therefore:
- an automatic reshuffle by itself never starts a READY timer
- after a valid first match, any recovery caused by that resolved match does not cancel the ACTIVE timer
- existing C.1 rule remains: auto-reshuffle does not impersonate invalid player input

## No safety timeout yet

The player may remain in READY indefinitely in this experiment.

Do not add:
- 3-2-1 pre-countdown
- forced READY timeout
- hidden auto-start
- inactivity timer

Reason: adding a second timing pressure would mix another hypothesis into the current correction.

If later playtests show READY-state abuse, evaluate a separate safety-window experiment.

## HUD semantics

The player-facing HUD must distinguish paused readiness from active countdown without explanatory paragraphs.

Preferred READY presentation:

```text
RUSH
12.0s
████████████████
READY
```

or for Energy Rush:

```text
ENERGY
12.0s
████████████████
READY
```

When first valid match occurs:
- READY state clears
- meter begins decreasing
- a small GO/pulse is allowed
- no modal or prose instruction is required

Do not show `+0.3s`.

## C.2 Link Shard compatibility

P1-V14C.2 is already implemented as an Experimental slice.

This correction must preserve:
- Link Shard thresholds from Beast `bestStreak`
- one reward evaluation at Beast Rush end
- Match count remains Beast quantity
- Link Shard affects consolidation efficiency only

READY observation time must not increase or decrease Combo quality.

Combo quality begins only with the first valid Beast match.

## Reset rules

Entering a new Beast Rush:
- phase timer = 12.0s paused
- state = READY
- current Combo = 0
- best Combo = 0

Entering a new Energy Rush:
- Energy timer = 12.0s paused
- state = READY

Restart/new Run must not leak ACTIVE state.

## Deterministic validation

### Shared timing
1. Enter phase → state READY.
2. READY timer reports 12.0s.
3. Updating time while READY does not decrease timer.
4. Invalid input while READY does not start timer.
5. First valid match starts timer exactly once.
6. First valid match receives its normal resource.
7. Later valid matches do not restart timer.
8. Later valid matches do not extend timer.
9. ACTIVE timer reaches 0 and ends the phase exactly once.
10. Restart/new phase returns to READY.

### Beast Rush
11. First valid match gives +1 Beast and Combo streak 1.
12. Combo 1.5s window starts only after first valid match.
13. READY observation time does not affect current/best streak.
14. Invalid READY input does not create Combo.
15. C.1 quantity/quality decoupling still passes.
16. C.2 Link Shard reward thresholds still derive only from bestStreak.

### Energy Rush
17. First valid match gives its normal charge and starts timer.
18. Invalid READY input does not start Energy timer.
19. Waiting in READY does not consume Energy Rush time.
20. Energy Rush still ends normally after 12.0 ACTIVE seconds.

## Live validation

### A — Beast observation
Enter Beast Rush and wait several seconds without matching.

Expected:
- board remains interactive
- HUD remains READY
- timer stays 12.0s

### B — Beast first match
Make the first valid match.

Expected:
- +1 Beast
- Combo ×1
- timer starts from 12.0s
- no extra phase time is added afterward

### C — Beast invalid before start
Enter fresh Beast Rush, attempt an invalid link first.

Expected:
- timer remains paused
- no Beast gained
- first later valid match starts timing

### D — Energy observation
Enter Energy Rush and wait several seconds.

Expected:
- timer remains 12.0s
- board can be inspected freely

### E — Energy first match
Make first valid Energy match.

Expected:
- normal Energy charge gained
- countdown starts at 12.0s

### F — phase consistency
From screenshots/player behavior, both puzzle phases communicate the same grammar:

```text
READY → FIRST VALID MATCH → ACTIVE TIMER
```

## Non-goals

Do not change:
- board size
- Onet ≤2-turn rules
- Beast quantity per match
- Combo 1.5s link window
- C.2 Link Shard thresholds/cap
- STAR rules
- Energy reward quantity/effect
- Active Squad cap
- Formation Grid
- Energy persistence
- Squad Capacity upgrades

Do not add a READY safety timeout in this slice.

## Exit gate

Required:
- deterministic C.1a checks pass
- C.1 and C.2 regressions pass
- Energy Rush regressions pass
- `npm run check` exits 0
- `npm run build` exits 0
- live A–F recorded when browser surface exists

Then stop for owner review.

This slice remains Experimental and does not update Current Gameplay Spec v2 automatically.
