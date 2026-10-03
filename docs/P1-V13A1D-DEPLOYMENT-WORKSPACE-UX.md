# P1-V13A.1D — Deployment Workspace Redesign

Status: **Active UI/UX gate / not passed**.

This slice is a structural Battle Setup redesign. It does not change combat rules.

## Owner review result

Current Battle Setup screenshot review: **UI/UX FAIL**.

The problem is information architecture, not minor spacing.

## Primary goals

At Battle Setup, a tester/player should understand within seconds:

1. current Level / threat
2. My Formation
3. Enemy Formation
4. undeployed Beasts
5. Start Battle readiness

The formation boards must be the visual center.

## GAME layout direction

Target: 1280×720, no scrolling.

Recommended hierarchy:

- compact top bar: Level + threat
- large central My Formation vs Enemy Formation
- compact Beast dock
- compact Stored Energy summary
- always-visible Start Battle CTA
- one contextual inspector for selected player/enemy unit

Remove from GAME:

- validation presets
- enemy authoring controls
- large phase pipeline inside Setup
- oversized Stored Energy panel
- debug-style permanent enemy HP/damage blocks
- test terminology

## Player deployment state

There must be one source of truth for:

- board occupancy
- undeployed Beast dock
- remaining deployment count
- Start Battle gating

That source should be the actual formation state.

A Beast already deployed must not still look like an available undeployed Beast.

Primary interaction:

```text
Beast dock
→ drag
→ valid slots highlight
→ hover ghost
→ drop
→ formation updates
```

Placed units must also be draggable to reposition.

Click placement may remain as fallback.

## Enemy readability

Enemy board tokens must communicate archetype by more than color/text.

- Frontliner → shield / heavy silhouette + FRONT
- Diver → claw/dagger / sharp silhouette + DIVER
- Ranged → bow/crosshair / ranged silhouette + RANGED

Permanent board tokens should not be dominated by `180 HP / X10` style debug text.

Detailed stats belong in hover/select inspector.

Exact selected position should read clearly, for example:

- FRONT-3
- MID-5
- BACK-2

## Beast dock

Use compact draggable cards rather than large information cards.

Persistent card content should be limited to:

- Beast icon/name
- Role + star
- signature name

Recommended-row guidance and longer descriptions belong in contextual inspect/hover.

## Stored Energy

During Setup, Stored Energy is secondary information.

Prefer compact chips/tokens rather than a large standalone panel.

Full Energy interaction belongs to Battle.

## TEST HARNESS integration

GAME remains the canonical UI.

When Test Harness is explicitly active:

- show a persistent `INTERNAL TEST` marker
- attach a localized Enemy Scenario Composer to the Enemy Formation area
- do not move composer controls into the global header
- keep normal player deployment visuals identical to GAME

Composer direction:

- per-archetype counts with add/remove
- Enemy Bench for unplaced instances
- drag enemy to exact slot
- move/change/remove selected enemy
- clear/reset scenario
- factual composition summary

The Test Harness must not visually dominate the normal game workspace.

## Live UX gates

### A — 2-second read

Without explanation, tester can identify:

- my army
- enemy army
- undeployed Beasts
- Start Battle

### B — first deploy

Tester naturally tries to drag a Beast onto My Formation.

### C — state clarity

After deployment, that Beast no longer appears as an active undeployed card.

### D — reposition

Tester can quickly move an already deployed Beast.

### E — enemy role readability

Frontliner / Diver / Ranged are visually distinguishable without reading debug stats.

### F — internal composer

In Test Harness, tester can create and place custom enemy instances. In normal GAME, no composer control is present.

## Exit gate

Do not mark this slice PASS because the screen looks cleaner.

PASS requires:

- board-first hierarchy
- compact header
- compact Beast dock
- no deployed/undeployed ambiguity
- visually readable enemy archetypes
- discoverable drag/drop
- exact slot clarity
- always-visible Start Battle
- compact Stored Energy
- no test controls in GAME
- localized internal Test Harness composer
- 1280×720 fit without scrolling
- deterministic/regression checks remain green
- live UX A–F pass

Do not start P1-V13B Tactical Energy before this gate is closed.
