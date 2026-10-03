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


## F.1c-N — Reserve Duplicate Stack Grouping

Owner screenshot shows repeated identical Reserve bodies still occupy separate full-size cards, for example three `IRONCLAD ★` bodies displayed side-by-side.

This is a player-surface grouping problem, not a request to restore greedy automatic STAR conversion.

### Critical Rule

Do **not** automatically convert:

```text
3 × 1★
→ 1 × 2★
```

on recruitment or merely because three copies exist.

B.3 breadth-vs-density choice remains manual.

Instead, collapse duplicate Reserve presentation into a **stack card**.

### Stack Key

Group only ready, non-deployed Reserve bodies with the same:

```text
beastId
STAR level
status = ready
slotId = null
```

KO bodies never join a Reserve stack.

Different STAR levels never share a stack.

Example:

```text
IRONCLAD ★ ×3
```

is one Reserve stack presentation backed by three distinct stable RunRoster instance IDs.

### Stable Identity Is Preserved

Stacking is presentation-only.

Do not merge/delete RunRoster instances unless the player explicitly performs STAR consolidation.

A stack must retain access to its member instance IDs.

### HP-Aware Stack Summary

If all copies have equal HP:

```text
IRONCLAD ★ ×3
HP 80 / 80
```

If member HP differs:

```text
IRONCLAD ★ ×3
HP VARIED
```

and an expand/detail action must reveal per-body HP.

Do not hide materially different persistent HP behind one misleading value.

### Expand / Individual Body Selection

The player must still be able to deploy a specific persistent body.

Preferred interaction:

```text
collapsed stack
→ click/tap
→ expanded member row / mini-cards
→ drag/select a specific instance
```

A quick-deploy shortcut may choose the deterministic lowest run serial only if the UI clearly exposes which body was chosen, but explicit member selection is preferred.

Do not silently choose highest/lowest HP as a strategy decision.

### Consolidation CTA

For a same-Beast/same-STAR Reserve stack:

If real eligible copies >= 3:

```text
IRONCLAD ★ ×3
[CONSOLIDATE → ★★]
```

This action calls existing `RunRoster.consolidate(...)`.

It is still manual.

If eligible copies == 2 and Link Shard >= 1:

```text
IRONCLAD ★ ×2   ◆1
[CONSOLIDATE → ★★]
```

Preserve C.2 assisted consolidation.

If fewer than 2:
- no consolidation CTA.

### Stack Count After Consolidation

Example:

Before:

```text
IRONCLAD ★ ×3
```

Manual consolidate:

```text
IRONCLAD ★★ ×1
```

The two consumed 1★ instances disappear only because the existing gameplay consolidation actually consumed them.

If 4 copies existed:

Before:

```text
IRONCLAD ★ ×4
```

After normal 3-copy consolidation:

```text
IRONCLAD ★ ×1
IRONCLAD ★★ ×1
```

### Pagination

Reserve pagination must paginate **stack cards**, not every individual duplicate body.

This is a visual-density improvement.

Expanded stack members may use an inline member view and should not alter the main page count unless the implementation requires it.

### Counts

Important distinction:

```text
RESERVE 17
```

continues to mean **17 living Reserve bodies**, not 17 visual stack cards.

Optionally show:

```text
RESERVE 17 · 9 STACKS
```

if useful.

Do not redefine gameplay counts.

### Deterministic Checks — Duplicate Stacks

24. three same Beast + same STAR ready Reserve bodies create one stack with `count = 3`.
25. different Beast IDs create different stacks.
26. same Beast but different STAR creates different stacks.
27. KO bodies are excluded from Reserve stacks.
28. deployed bodies are excluded from Reserve stacks.
29. stack members preserve distinct instance IDs.
30. mixed HP stack reports non-uniform HP state.
31. stack count does not mutate RunRoster.
32. normal 3-copy consolidation from a stack consumes the existing correct three real bodies.
33. after 4-copy consolidation, presentation becomes one 1★ stack member plus one 2★ stack member.
34. 2-copy + 1 Link assisted consolidation remains legal and manual.
35. Reserve body count remains body count, while pagination uses stack count.

## F.1c-O — Single Owner for the Gameplay Header

Owner screenshot confirms the remaining header collision is architectural, not just typography.

Current code has two different views rendering into the same top ~70 px band:

1. `GameTopHUD`
   - draws the global dark header;
   - renders `BEAST LINK BATTLE`;
   - renders a second phase label such as `BATTLE SETUP`;
   - renders phase tabs;
   - renders Beast / Energy counters.

2. `BattleSetupView.renderHeader()`
   - also renders the Wave title at y≈20;
   - also renders Threat at y≈44;
   - also renders fixture-cycle / validation controls at the same vertical band.

This is the root cause of the current overlap.

### Locked Architecture

Only one component may own the player-facing top header band during Battle Setup.

Preferred implementation:

```text
GameTopHUD
= sole owner of y = 0..70 player-facing header

BattleSetupView
= begins player-facing content below the global header
= does NOT render a second primary Wave/Threat header in y = 0..70
```

### GameTopHUD Battle Setup Context

Extend `GameTopHUD` with an optional phase-context presentation input rather than creating another header.

Conceptual API:

```ts
interface GameTopHudContext {
  primaryTitle?: string;
  secondaryTitle?: string;
  linkShards?: number;
  hideBrand?: boolean;
}
```

Exact API may follow repo conventions.

During Battle Setup:

```text
primaryTitle:
WAVE 1 / 3 · FRONTLINE WALL

secondaryTitle:
Threat · FRONTLINE PRESSURE

phase tabs:
BEAST | ENERGY | SETUP | BATTLE | RESULT

resources:
BEAST 0 · ENERGY 9 · ◆ 2
```

The phase tab `SETUP` already communicates the current phase.

Therefore do not also render a large `BATTLE SETUP` label.

### Brand Rule

During active gameplay phases, `BEAST LINK BATTLE` is not required as a dominant header label on every screen.

For Battle Setup specifically:
- hide the brand from the primary title slot;
- use the Wave title as the primary player-facing title.

The brand may remain in menus / splash / non-gameplay surfaces.

If retained in the gameplay header, it must be visually tertiary and must not compete with Wave title.

### Resource Rule

Do not render duplicate resource counters in BattleSetupView.

GameTopHUD is the top-level resource owner for:
- Beast count;
- Energy total;
- Link Shards if added to top resource chips.

BattleSetupView right card still shows detailed Stored Energy inventory because it serves a different purpose:
- top HUD = compact run-state counter;
- right card = per-ID Energy inventory.

### Link Shard Top Chip

Add `◆ LINK ×N` or compact `◆ N` to the top-right gameplay resource group during Battle Setup if space allows.

### BattleSetupView Header Responsibility After Change

`BattleSetupView.renderHeader()` must no longer draw primary player-facing:
- Wave title;
- Threat line;
- `BATTLE SETUP` label.

It may render test-harness-only tools below the global header or inside a compact debug strip when appropriate.

Preferred player content start:

```text
y >= 78
```

No Battle Setup content should overlap the global top header band.

### Debug/Test Harness Controls

Current validation controls include:
- `[E] CYCLE FIXTURE`;
- presets;
- enemy tools;
- test harness label.

These are validation controls, not primary player information.

When test harness is enabled:
- place them in a compact muted debug strip;
- keep them below or to the far edge of the player header;
- do not repeat Wave / Threat text;
- use smaller typography than gameplay title.

When not test harness:
- do not reserve empty space for them.

### Single Representation Rule

For Battle Setup player-facing information:

```text
Wave title        → exactly one primary representation
Threat            → exactly one primary representation
Current phase     → phase tab only
Active capacity   → exactly one compact representation
Top Beast count   → one compact top resource counter
Top Energy total  → one compact top resource counter
Top Link count    → one compact top resource counter
```

Do not render the same semantic fact twice merely with different wording.

### Active Squad Header Deduplication

Current screenshot also shows:
- `ACTIVE SQUAD`;
- four dots;
- `4/4`;
- `ACTIVE SQUAD 4/4 · FULL · GRID 18`.

Replace all of that with one compact line under `MY FORMATION`:

```text
ACTIVE 4 / 4 · FULL · GRID 18
```

Optional:
- `FULL` in Butter Yellow;
- `GRID 18` muted.

Do not keep the dot meter unless it serves a unique interaction purpose.

### Header Layout Target

At 1280×720, target approximately:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ WAVE 1 / 3 · FRONTLINE WALL     BEAST  ENERGY [SETUP] BATTLE RESULT    │
│ Threat · FRONTLINE PRESSURE                         🐾0 ⚡9 ◆2           │
└──────────────────────────────────────────────────────────────────────────┘
```

Exact coordinates may follow the current Phaser layout, but:
- left title zone must not collide with center tabs;
- resource chips must remain inside the right safe area;
- top bar total height should remain around 64–72 px;
- BattleSetupView content begins below it.

### Deterministic / Presentation Checks — Header Ownership

36. Battle Setup has exactly one player-facing Wave title source.
37. Battle Setup has exactly one player-facing Threat source.
38. `GameTopHUD` owns Battle Setup primary header context.
39. `BattleSetupView` does not render primary Wave/Threat text in the global top band.
40. current phase is represented by the active phase tab, without a second large `BATTLE SETUP` title.
41. Active Squad state has one primary compact representation.
42. Battle Setup player content begins below the global header safe band.
43. test-harness controls do not duplicate Wave/Threat semantics.