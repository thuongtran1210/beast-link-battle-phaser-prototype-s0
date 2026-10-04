# P1-V14G.4 — Energy Rush Tactical Identity Closeout

Status: **IMPLEMENTATION AUTHORIZED / ACTIVE PRESENTATION SLICE / EXPERIMENTAL / NOT ADOPTED**.

## 1. Why G.4 Exists

The V14G Battle system has an **owner live PASS**.

In Battle, the player can already understand:
- MEND / RESCUE / BREAK / PIERCE;
- what each Energy affects;
- READY / SUGGESTED / DISABLED;
- why an Energy is suggested;
- what target a successful cast affected.

The remaining problem is **Energy Rush**.

Current live screenshot evidence still reads mainly as:

```text
A / B / C / D
ENERGY
```

The player should not need to memorize:

```text
A = MEND
B = RESCUE
C = BREAK
D = PIERCE
```

## 2. G.4 Goal

During Energy Rush, the player should immediately understand:

```text
I am matching MEND.
I am matching RESCUE.
I am matching BREAK.
I am matching PIERCE.
```

without learning internal A/B/C/D IDs.

## 3. Core Rule

**TACTICAL NAME IS THE PLAYER IDENTITY. INTERNAL LETTER IS NOT.**

Normal player-facing Energy Rush must prioritize:

```text
MEND
RESCUE
BREAK
PIERCE
```

Internal IDs remain unchanged in code:

```text
energy-a
energy-b
energy-c
energy-d
```

## 4. Locked Mapping

No mapping or gameplay change:

```text
energy-a → MEND
energy-b → RESCUE
energy-c → BREAK
energy-d → PIERCE
```

No new Energy type is introduced.

## 5. Energy Rush Tile — Required Player Layout

Each 6×6 Energy tile should communicate only:

1. tactical icon;
2. tactical name.

Example:

```text
┌──────────┐
│    ✚     │
│          │
│   MEND   │
└──────────┘
```

The current generic tile label `ENERGY` must not remain the primary identity.

Tile names:

```text
MEND
RESCUE
BREAK
PIERCE
```

All four names must fit without wrapping or truncation.

## 6. A/B/C/D Letter Rule

In normal player gameplay, do not require the visible A/B/C/D corner letter to identify an Energy.

Preferred:
- hide A/B/C/D on Energy Rush tiles in normal mode;
- allow internal letters only in developer/test-harness mode if useful.

Do not change Beast Rush letter behavior as part of G.4.

## 7. Tile Readability Rule

The board is still a fast timed matching puzzle.

Each tile should contain:

```text
ICON
TACTICAL NAME
```

Do NOT put on each tile:
- effect description;
- READY / SUGGESTED / DISABLED;
- target rules;
- charge count;
- Wave recommendation;
- paragraph instructions.

## 8. Color Is Secondary

Existing Energy colors may continue helping pair scanning.

But the player must not need color alone.

Identity should be readable through:
- icon;
- tactical name;
- color as secondary support.

## 9. Central Source of Truth

Use:

`src/game/energy/TacticalEnergyCatalog.ts`

for:
- displayName;
- shortDescription;
- tactical identity.

Do not create another A→MEND mapping inside BoardView, ValidationScene, or HUD code.

## 10. Preserve the Owner-Passed Battle Surface

G.4 is **Energy Rush presentation only**.

Do not change:
- Battle Energy mechanics;
- READY / SUGGESTED / DISABLED rules;
- cast logic;
- target logic;
- Energy effect values;
- Battle success feedback.

If changing shared icon metadata would alter the accepted Battle surface, prefer an Energy-Rush-specific presentation layer.

## 11. Energy Rush Tactical Inventory

The right rail should always show all four tactical identities.

Preferred structure:

```text
STORED ×5

✚ MEND    ×1
  Heal frontline

↩ RESCUE  ×2
  Heal backline

✦ BREAK   ×1
  Damage Frontliner

➶ PIERCE  ×1
  Damage Ranged
```

This is a compact tactical inventory, not a tutorial wall.

## 12. Zero Counts Are Visible in Energy Rush

Energy Rush is the collection phase, so all four types should remain visible even at zero:

```text
MEND    ×0
RESCUE  ×0
BREAK   ×0
PIERCE  ×0
```

This teaches the available vocabulary before the first match.

Battle Setup may continue hiding zero-count entries.

## 13. First-Match Buffer Helps Learning

Preserve the current rule:

```text
READY 12.0s
→ first valid match
→ timer starts
```

The free observation period should let the player read:
- tactical names;
- current per-type counts;
- compact effect hints;
- upcoming threat context.

Do not add another tutorial modal or countdown.

## 14. Compact Effect Hints

The right rail may use the existing catalog copy:

```text
MEND    — Heal frontline
RESCUE  — Heal backline
BREAK   — Damage Frontliner
PIERCE  — Damage Ranged
```

Do not place these effect lines inside puzzle cells.

## 15. Threat Context

Energy collection is easier to understand if the upcoming Battle context is visible.

Add one compact informational line:

```text
NEXT THREAT · FRONTLINE PRESSURE
```

using the current Wave threat label.

This is information only.

It must NOT:
- rank Energy;
- highlight a BEST choice;
- auto-suggest a pair;
- change Energy spawn distribution;
- change match rewards.

## 16. Do Not Use Battle Activation Grammar in Rush

Energy Rush answers:

```text
What am I collecting?
How many do I have?
What does it broadly affect?
What threat is coming?
```

Battle answers:

```text
Can I cast it now?
Why is it suggested?
```

Therefore do NOT show READY / SUGGESTED / DISABLED in Energy Rush.

## 17. Stored Count Semantics

Per-type Energy Rush counts represent the current Run-scoped stored charges.

Carried Energy must already appear when a later Wave enters Energy Rush.

One valid pair still means:

```text
+1 matching tactical Energy ID
```

## 18. Carry-In

Preserve V14D carry-in behavior.

If `CARRY IN ×N` already exists, it may remain as a small secondary counter.

Do not duplicate every type into separate carry-in and stored grids.

The tactical inventory should show the authoritative current stored count.

## 19. Match Feedback

Successful matches remain tactical-name based:

```text
+1 MEND
+1 RESCUE
+1 BREAK
+1 PIERCE
```

Do not fall back to `+1 ENERGY-A` or generic `+1 Charge` when the tactical definition is known.

## 20. Recent Action

Keep recent feedback compact.

Good:

```text
+1 BREAK
BREAK ×2 stored
```

Avoid long explanatory sentences.

## 21. Information Hierarchy

Energy Rush should read in this order:

```text
1. BOARD
   Find matching tactical Energy

2. TIMER
   READY / 12.0s

3. TACTICAL INVENTORY
   Types + counts + short effects

4. NEXT THREAT
   Upcoming Battle context

5. RECENT ACTION
   What I just collected
```

Instructional prose must not compete with the board.

## 22. Directional Right-Rail Example

```text
ENERGY RUSH
MATCH → STORE

RUSH
12.0s
READY

NEXT THREAT
FRONTLINE PRESSURE

STORED ×5

MEND    ×1
Heal frontline

RESCUE  ×2
Heal backline

BREAK   ×1
Damage Frontliner

PIERCE  ×1
Damage Ranged

RECENT
+1 BREAK
```

This is directional, not a pixel lock.

## 23. Player Learning Test

Before making the first match, a player should be able to answer:

1. What are the four Energy types?
2. Which tile is MEND?
3. Which tile is BREAK?
4. How many of each type do I already own?
5. What does each type broadly affect?
6. What threat is coming next?

They should not need to know what A/B/C/D means.

## 24. Matching-Speed Test

Identity clarity must not make the 6×6 board slower to scan.

A pair should still be easy to locate through:
- icon shape;
- stable color;
- short tactical name.

Failure examples:
- tactical names too small;
- names overlap icons;
- names wrap;
- too much text per cell;
- right rail becomes a tutorial wall.

## 25. Presentation Helper

If the generic board renderer cannot cleanly display tactical identity, create one small pure presentation seam.

Conceptual data:

```ts
interface EnergyRushTilePresentation {
  energyId: string;
  displayName: string;
  showInternalLetter: boolean;
}

interface EnergyRushInventoryEntry {
  energyId: string;
  displayName: string;
  shortDescription: string;
  charges: number;
}
```

Exact API may follow repo conventions.

Gameplay matching continues to use content IDs.

## 26. Deterministic Checks — Identity

Add checks proving:

1. energy-a player tile label = MEND.
2. energy-b = RESCUE.
3. energy-c = BREAK.
4. energy-d = PIERCE.
5. normal Energy Rush does not require A/B/C/D visibility.
6. A–D tiles do not use generic ENERGY as their primary label.
7. identity derives from TacticalEnergyCatalog.

## 27. Deterministic Checks — Tactical Inventory

8. inventory contains four entries in stable order.
9. zero-count MEND remains visible.
10. zero-count RESCUE remains visible.
11. zero-count BREAK remains visible.
12. zero-count PIERCE remains visible.
13. counts equal current EnergyQueue charges.
14. carried charges appear immediately on phase entry.
15. one valid pair increments exactly one matching Energy type.

## 28. Deterministic Checks — Copy

16. MEND uses catalog shortDescription.
17. RESCUE uses catalog shortDescription.
18. BREAK uses catalog shortDescription.
19. PIERCE uses catalog shortDescription.
20. recent match feedback uses tactical displayName.
21. normal player UI does not require historical names such as Shield Token / Blade Token / Leaf Token / Arcane Spark.
22. ENERGY-A/B/C/D is not the primary player identity.

## 29. Threat Context Checks

23. Energy Rush receives the current Wave threat label.
24. displaying the threat does not alter the A–D pool.
25. displaying the threat does not alter match rewards.
26. displaying the threat does not auto-select or rank an Energy.

Do not invent fake always-true assertions for source properties that are better verified by source inspection.

## 30. Regression Boundary

Preserve exactly:
- 6×6 Onet board;
- identical-pair rule;
- ≤2-turn connection rule;
- A–D player pool;
- first valid match starts 12.0s timer;
- invalid input does not start timer;
- one valid pair = +1 matching Energy;
- Run-scoped persistent Energy;
- no cap;
- no decay;
- no passive refill;
- no Energy Combo;
- no auto-cast;
- owner-passed Battle behavior.

## 31. Non-Goals

Do NOT add:
- new Energy mechanics;
- new Energy types;
- Battle balance changes;
- READY / SUGGESTED / DISABLED in Rush;
- pair recommendation;
- BEST Energy highlighting;
- threat-based spawn weighting;
- reroll;
- Energy crafting/upgrades/rarity;
- Energy cap/decay;
- final production art.

## 32. Live Validation A — First Look

Before the first valid match, PASS if the owner can immediately identify:

```text
MEND
RESCUE
BREAK
PIERCE
```

without interpreting A/B/C/D.

## 33. Live Validation B — Tile Identity

PASS if:
- each tile shows the tactical name;
- names fit cleanly;
- generic ENERGY is not dominant;
- internal letter is absent or clearly debug-only.

## 34. Live Validation C — Tactical Inventory

At STORED ×0 and STORED ×N, PASS if all four types are visible with:
- icon;
- name;
- per-type count;
- short effect.

## 35. Live Validation D — Match Event

Complete one valid pair.

PASS if:
- timer starts exactly once as before;
- correct type count increments;
- feedback says `+1 <TACTICAL NAME>`.

## 36. Live Validation E — Carry-In

Enter a later Wave with stored Energy.

PASS if:
- carried per-type counts are already visible;
- new matches add to the correct existing count;
- tactical identity survives Wave transition.

## 37. Live Validation F — Threat Context

PASS if:
- the Wave threat is visible;
- it helps orient collection;
- no BEST/optimal recommendation is shown.

## 38. Live Validation G — Scan Speed

PASS if the board still feels like a fast matching game.

## 39. Live Validation H — Battle Continuity

After Energy Rush → Setup → Battle, PASS if the same four names remain consistent:

```text
MEND
RESCUE
BREAK
PIERCE
```

There should be no translation step from A/B/C/D to tactical names.

## 40. Exit Gate

G.4 is complete only when:
- deterministic identity checks pass;
- `npm run check` passes;
- `npm run build` passes;
- owner screenshot confirms Energy Rush identity readability;
- the existing Battle owner-live PASS is preserved.

Then V14G can move to:

```text
V14G Review / Adoption Gate
```

## 41. Adoption Boundary

V14G remains **Experimental / not adopted** until an explicit owner decision after G.4 live validation.

G.4 implementation alone does not adopt V14G.