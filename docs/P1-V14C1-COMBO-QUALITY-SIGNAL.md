# P1-V14C.1 — Combo Decoupling / Quality Signal

Status: **Active / owner authorized / Experimental / not adopted**.

## Ownership

- `BeastRushPhaseTimer`: fixed 12.0s phase countdown, starts immediately and alone ends Beast Rush.
- `ComboQualityTracker`: 1.5s link window; tracks current/best streak and break count only.
- `BattleQueue`: one Beast per valid match; no multiplier or Combo reward.

Invalid player input breaks the current streak but never changes phase time. Automatic reshuffles do not break it. New Waves and restarts reset both timer and quality state. Historical `ComboSystem` and S2/P1-V2/P1-V3 checks remain historical fixtures.

## Non-goals

P1-V14C.2 Combo reward, P1-V14D Energy persistence, and Squad Capacity upgrades are not started.
