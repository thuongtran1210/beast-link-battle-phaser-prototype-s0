# P1-V13A.1D — Deployment Workspace Redesign

Status: **Deferred UX debt / not passed / not closed**.

This slice records a structural Battle Setup redesign requirement. It does not change combat rules.

## Owner review result

Current Battle Setup screenshot review: **UI/UX FAIL**.

The problem is information architecture, not minor spacing.

## Why it is deferred

The project owner identified a more fundamental core-loop issue after this UX review:

- single Battle provides little reason to hold Beast resources
- Energy has little reason to be saved for later
- STAR consolidation does not yet have a clear strategic advantage versus multiple 1★ bodies
- Combo does not yet have a distinct strategic role
- high match quantity can mask formation consequences

Therefore the active gameplay direction has moved to:

**P1-V14 — Multi-Wave Resource Commitment**

This does **not** mean V13A.1D passed.

It remains required UX work after the core loop direction becomes clearer.

## Preserved redesign requirements

When this slice resumes:

- formation boards must be the visual center
- header must be compact
- Beast dock must show undeployed units clearly
- deployed/undeployed state must share one source of truth
- enemy archetypes must read by icon/silhouette + label
- Stored Energy must be compact in Setup
- exact Front/Mid/Back × Lane 1–6 positions must be readable
- Start Battle must remain visible
- internal Test Harness controls must not pollute GAME

## GAME vs TEST HARNESS

GAME is the canonical player-facing UI.

TEST HARNESS may attach internal scenario authoring, but the composer must never become player-facing gameplay.

## Exit gate

The previous Live UX A–F gate remains valid when this work resumes.

Do not mark the slice PASS without owner live UX confirmation.
