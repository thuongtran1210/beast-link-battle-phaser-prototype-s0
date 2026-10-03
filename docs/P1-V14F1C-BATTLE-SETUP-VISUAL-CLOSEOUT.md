# P1-V14F.1c — Battle Setup Visual Closeout

Status: **ACTIVE PLAYER-SURFACE VISUAL CLOSEOUT / OWNER AUTHORIZED / CODE NOT STARTED / EXPERIMENTAL / NOT ADOPTED**.

## Why F.1c Exists

P1-V14F.1b Energy Cast Reliability is implemented on remote main.

Verified remote baseline:
- `1a263692368232b3fc15b3812294a066339fd6a8` — full-HP Energy cast protection and authoritative eligibility/result seam.
- `8666a5eeb27c6bc4ef0ef9fdc918d23524adc5f8` — Setup roster grouping and Showcase cast-control presentation.

Owner live screenshot after that implementation still shows Battle Setup is not visually clean enough for the V14 live gate.

The remaining issue is not gameplay logic. It is information hierarchy and player-surface composition.

F.1c changes no gameplay rule.

## Owner Screenshot Findings

The current Setup screen still has:

1. Duplicate / competing header information.
   - game title, Wave title, phase label, fixture label, and Threat all compete in the same top area;
   - `fixtureName` is rendered more than once;
   - `threatSummary` is also effectively repeated.

2. Active Squad vs Formation Grid is still not explicit enough.
   - `MAX 4 · FULL` and `POSITION GRID` exist;
   - the UI does not state the production distinction in one readable status:
     `ACTIVE 4/4 · GRID 18`.

3. Empty formation slots still compete visually with deployed units.
   - when Active Squad is full, unused positions still look like deploy opportunities rather than reposition-only tactical positions.

4. The Reserve tray is functionally improved but still text-heavy.
   - `RESERVE`, drag instruction, deployed/KO summary, pagination, and card content compete in the same header line.

5. Stored Energy remains a raw text/debug list.
   - raw strings such as `energy-a:1` are still rendered through `storedEnergy()`;
   - the right card does not yet behave like a compact resource inventory.

6. STAR consolidation copy still occupies the Stored Energy panel.
   - `SELECT A RESERVE BEAST TO VIEW STAR CONSOLIDATION` competes with Energy counts;
   - this mixes two unrelated interaction concepts in one resource panel.

7. Enemy cards still read like debug fixtures.
   - bracketed archetype plus compact numeric text is less readable than a clear threat card hierarchy.

## Core Visual Principle

Battle Setup should answer these questions within one glance:

```text
Which Wave is this?
What threat am I facing?
Which 4 units are active?
Which bodies remain in Reserve?
Which bodies are KO?
What Energy / Link resources carry into Battle?
Can I start Battle?
```

The player should not need to parse debug text to answer them.

## Locked Information Architecture

Target landscape structure:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ WAVE 1 / 3 · FRONTLINE WALL              BEAST 0  ENERGY 6  LINK 1     │
│ Threat · FRONTLINE PRESSURE                                           │
├──────────────────────────────────────────────────────────────────────────┤
│ ACTIVE SQUAD 4 / 4 · GRID 18                                          │
│                                                                        │
│      MY FORMATION                       ENEMY FORMATION                  │
│      tactical position grid            threat cards                     │
│                                                                        │
├─────────────────────────────────────────────┬────────────────────────────┤
│ RESERVE 4               DEPLOYED 4 · KO 0   │ STORED ENERGY ×6          │
│                                             │ [A×1] [B×1] [C×1]         │
│ [unit] [unit] [unit] [unit]                │ [D×1] [E×1] [F×1]         │
│                                             │ ◆ LINK ×1                  │
│ contextual consolidation only when needed  │ Cast during Battle         │
│                                             │ [ START BATTLE ]           │
└─────────────────────────────────────────────┴────────────────────────────┘
```

Exact pixel layout may follow current Phaser architecture.

## F.1c-A — Header Cleanup

### Single Primary Wave Title

Render one primary Wave heading only:

```text
WAVE N / 3 · {WAVE NAME}
```

Threat is one secondary line:

```text
Threat · {THREAT SUMMARY}
```

Do not render `fixtureName` a second time elsewhere in the same header.

Do not render `threatSummary` twice.

### Phase Navigation

Existing phase navigation may remain, but it must be visually secondary.

The Setup screen must not show multiple equally dominant labels such as:
- Beast Link Battle;
- Battle Setup;
- Wave title;
- fixture cycle label;
- Setup phase tab;

all in the same visual row.

### Validation / Fixture Controls

Developer-only fixture-cycle / validation controls may remain available but should not be part of the primary player-facing title hierarchy.

Prefer:
- compact muted control;
- debug-only label;
- or a secondary corner position.

Do not remove necessary validation functionality.

## F.1c-B — Active Squad / Grid Status

Use production truth:

```text
P1V14B_ACTIVE_SQUAD_LIMIT = 4
Formation slots = 18
```

Show one compact status:

```text
ACTIVE SQUAD 4 / 4 · GRID 18
```

or equivalent.

When full:

```text
ACTIVE SQUAD 4 / 4 · FULL · GRID 18
```

Do not also show redundant:
- `MAX 4`;
- `MAX 4 · FULL`;
- another count badge;

unless needed for accessibility.

One clear grammar is preferred.

## F.1c-C — Reposition-Only Empty Slots

When Active Squad is full:

- all empty tactical positions remain visible;
- they must be visually recessed;
- remove the ordinary `+` deploy affordance;
- show no suggestion that a fifth body can be added;
- swapping / repositioning remains available.

Allowed treatment:
- muted empty cell;
- subtle `MOVE` / reposition affordance only while dragging from board;
- no lock text on every idle cell if that creates noise.

When Active Squad is not full:
- empty positions may show a subtle deploy affordance.

## F.1c-D — Player Formation Emphasis

Deployed unit cards must visually dominate empty slots.

Priority:
1. unit icon;
2. role accent;
3. STAR;
4. HP / relevant identity;
5. signature secondary.

Do not enlarge the entire board; improve contrast hierarchy.

## F.1c-E — Enemy Threat Card Hierarchy

Enemy card priority:

```text
FRONT / DIVER / RANGED
180 HP
DMG 10
```

Archetype is primary.

Do not use fixture/debug-style shorthand such as:

```text
[FRONT]
180 HP
×10
```

if `×10` is actually damage.

Use explicit `DMG 10`.

Keep current enemy stats and fixtures unchanged.

## F.1c-F — Reserve Header Simplification

The Reserve tray top row should contain only compact state:

```text
RESERVE 4
DEPLOYED 4 · KO 0
```

Drag instruction becomes a secondary hint, for example:

```text
Drag a card to deploy
```

Use smaller muted type.

Do not let instruction text compete with `RESERVE 4`.

## F.1c-G — KO Surface

Preserve the F.1 classification logic.

KO:
- stays outside deployable Reserve pagination;
- remains non-interactive for deployment;
- remains visually distinct.

When `KO 0`, do not reserve a large visual strip.

When KO exists:
- use compact KO strip/cards;
- desaturated body;
- coral/red KO marker.

## F.1c-H — Stored Energy Resource Inventory

Replace raw `storedEnergy()` text rendering inside Battle Setup with a compact presentation derived from the same `EnergyQueue` truth.

Preferred presentation:

```text
⚡ STORED ENERGY        ×6

[A icon] ×1   [B icon] ×1
[C icon] ×1   [D icon] ×1
[E icon] ×1   [F icon] ×1

Cast during Battle
```

Requirements:
- use existing Energy icons via current IconFactory / UnitIconRegistry;
- short ID label may be A–F;
- counts use `×N`;
- total is obvious;
- zero-count Energy IDs may be hidden;
- no raw `energy-a:1` strings;
- no cast action in Setup.

Do not create UI-owned Energy gameplay state.

The UI receives / derives entries from the existing `EnergyQueue`.

## F.1c-I — Stored Energy API

If current `BattleSetupView` only receives:

```ts
storedEnergy: () => string
```

replace or augment it with a structured read-only presentation input, for example:

```ts
storedEnergyEntries: () => ReadonlyArray<EnergyQueueEntry>
```

and derive total in the View or a pure presentation helper.

Do not parse gameplay truth back out of a formatted string.

If compatibility requires keeping `storedEnergy()`, stop using it for the redesigned Setup resource inventory once structured entries are available.

## F.1c-J — Link Shard Presentation

Keep Link separate:

```text
◆ LINK ×N
```

Place it adjacent to resource inventory, not inside an Energy ID line.

No Link mechanic change.

## F.1c-K — STAR Consolidation Placement

Remove default instructional consolidation text from the Stored Energy panel.

Specifically remove idle-state copy such as:

```text
SELECT A RESERVE BEAST
TO VIEW STAR CONSOLIDATION
```

from the resource panel.

Consolidation becomes contextual.

Preferred:
- when a Reserve unit is selected, show a compact consolidation strip in the Reserve tray near the selected card / tray footer;
- if no Reserve unit is selected, show no consolidation block;
- if selected unit cannot consolidate, use one compact state line;
- actionable button stays attached to the selected Reserve context.

Stored Energy and STAR consolidation must no longer compete in the same panel.

## F.1c-L — Start Battle Panel

Keep Start Battle as the strongest CTA.

Right card hierarchy:

1. Stored Energy total + chips;
2. Link chip;
3. one small `Cast during Battle` line;
4. Start Battle button;
5. one compact squad summary.

Suggested:

```text
START BATTLE ⚔
ACTIVE 4/4 · RESERVE 4 · KO 0
```

Do not put large helper text between resource inventory and CTA.

## F.1c-M — Normal Battle Cast Control Parity

Known F.1 limitation remains:

`PrototypeFlowPanel` still renders Energy controls as active-looking whenever a charge exists.

F.1c must close this.

Extend `FlowPanelEnergyRow` with presentation state such as:

```ts
enabled: boolean
stateLabel: string
```

or equivalent.

Normal Battle Energy rows must use the same:

`frontlineHealEligibility(...) → castControlState(...)`

semantics as Showcase.

For identical battle state:
- Showcase and normal Battle show equivalent enabled/disabled state;
- disabled normal-control must not invoke cast;
- state text can use:
  - CAST
  - FULL
  - NO CHARGE
  - NO FRONTLINE
  - ENDED

Normal mode has no Showcase pause state unless applicable.

Do not duplicate eligibility rules inside `PrototypeFlowPanel`.

## Pure Presentation Helpers

Prefer deterministic helpers for:
- roster groups;
- Energy Setup inventory entries / totals if helpful;
- cast-control state.

Do not create a second gameplay source of truth.

## Deterministic Checks — Header / Counts

1. Wave title presentation has one primary fixture/Wave label.
2. Threat has one primary presentation value.
3. Active Squad status uses production cap 4.
4. Grid count derives to 18.

Do not attempt pixel tests if a pure presentation state is sufficient.

## Deterministic Checks — Energy Inventory

5. structured Energy entries preserve per-ID counts.
6. total equals sum of entries.
7. zero-count entries are absent from visible inventory if using filtered design.
8. short labels map deterministically to IDs.
9. no gameplay mutation occurs during presentation derivation.

## Deterministic Checks — Consolidation Context

10. no selected Reserve => no default consolidation instruction block.
11. selected deployed unit => no Reserve consolidation action.
12. selected eligible Reserve => contextual consolidation state available.
13. Energy inventory state is independent from consolidation selection.

## Deterministic Checks — Normal Battle Cast Parity

14. damaged frontline + charge + Running => normal CAST enabled.
15. full HP => normal FULL disabled.
16. no charge => normal NO CHARGE disabled where row is represented.
17. no frontline => normal NO FRONTLINE disabled.
18. terminal => normal ENDED disabled.
19. disabled row invokes no action.
20. normal and Showcase derive from the same cast-control state helper / semantics.

## Regression Boundary

Preserve:
- F.1b full-HP cast protection;
- effective heal consumes exactly 1;
- V14D Energy persistence;
- E/E.1 harness semantics;
- Reserve / Deployed / KO classification;
- STAR consolidation mechanics;
- Link Shards;
- squad cap 4;
- Formation Grid 18;
- drag/reposition/swap;
- current Wave fixtures;
- enemy stats.

## Visual Target

Primary:
- 1280×720 landscape.

Also verify wider landscape scaling similar to owner screenshot.

No:
- title overlap;
- raw Energy ID debug wall;
- consolidation copy in Energy panel;
- empty slots visually competing with units.

## Live Closeout Targets

### Live A — Header
One Wave title, one Threat line, no overlap.

### Live B — Squad / Grid
`ACTIVE 4/4 · GRID 18` immediately readable.

### Live C — Full Squad Board
At 4/4, empty slots read as tactical reposition positions, not fifth-unit capacity.

### Live D — Reserve / KO
Reserve remains primary; KO remains separate.

### Live E — Stored Energy
Icon/chip inventory visible; no raw `energy-x:n` list.

### Live F — Consolidation Context
No default consolidation instruction in Energy panel. Selecting eligible Reserve reveals compact contextual consolidation.

### Live G — Normal Battle Cast Parity
Normal Battle shows disabled/full/ended controls consistently with Showcase.

### Live H — Screenshot Readability
Setup screenshot should look like a game UI rather than a debug panel.

## Non-Goals

Do NOT:
- change Energy mechanics;
- add Energy targeting;
- change Active Squad cap;
- change Formation size;
- change STAR rules;
- change Link rules;
- add new enemy archetypes;
- rebalance enemy stats;
- add revive / recovery;
- add Energy cap / decay;
- implement Squad Capacity upgrade;
- produce final art;
- rewrite Phaser scene architecture.

## Exit Gate

Required:
- one clean Wave/Threat header hierarchy;
- `ACTIVE x/4 · GRID 18` visible;
- full-squad empty slots are visually reposition-only;
- Reserve header simplified;
- Stored Energy uses structured icon/count inventory;
- consolidation is removed from Energy panel and becomes contextual;
- normal Battle disabled cast controls match Showcase semantics;
- deterministic F.1c checks pass;
- historical checks remain green;
- `npm run check` exits 0;
- `npm run build` exits 0;
- live status reported truthfully.

Then STOP for owner screenshot review.

F.1c adds no gameplay mechanic and does not adopt V14.
