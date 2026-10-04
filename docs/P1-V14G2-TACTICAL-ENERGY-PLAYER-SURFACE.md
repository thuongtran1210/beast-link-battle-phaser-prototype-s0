# P1-V14G.2 — Tactical Energy Player Surface + G.1 Semantic Hardening

Status: **IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED**.

## Implementation Evidence — 2026-10-04

- Shared tactical presentation derives names, effect hints, availability, reasons, and enabled state from the catalog plus model eligibility.
- Player casts route through `castTacticalEnergy()`; target-specific heal and Energy-damage feedback use the model result target IDs.
- RESCUE now detects Diver pressure on any living Mid/Back body, independently of the deterministic heal target.
- G.2 remains a player-surface implementation only; no auto-cast, ranking, cap, or decay was added.

## Why G.2 Exists

P1-V14G.1 successfully created the tactical Energy core:

```text
energy-a → MEND
energy-b → RESCUE
energy-c → BREAK
energy-d → PIERCE
```

The model now knows:
- what each Energy does;
- deterministic target selection;
- charge consumption;
- READY / SUGGESTED / DISABLED availability.

However the current player-facing Battle UI still routes all Energy through the old Frontline Heal path and still presents generic technical IDs / heal language.

Current player surface still contains patterns such as:

```text
ENERGY-A · 2 charges
CAST HEAL
Each Energy ID casts a Frontline Heal.
Cast instantly heals the frontline unit.
```

That no longer matches the V14G.1 model.

G.2 makes the tactical identities visible and understandable.

## G.1 Semantic Hardening Included

Before player-surface wiring, fix one confirmed G.1 semantic edge.

Current RESCUE suggestion implementation checks whether a Diver targets the exact unit chosen by `rescueTarget()`.

Locked V14G rule is broader:

```text
RESCUE is SUGGESTED if ANY living Diver currently targets / engages
ANY living Mid or Back player unit
OR the selected RESCUE heal target is <=60% HP.
```

Example:

```text
Diver attacks Back Mage
Mid Ranger has greater missing HP and is selected as RESCUE target
→ RESCUE is still SUGGESTED · DIVER PRESSURE
```

The heal target remains highest missing HP Mid/Back.

Do not change RESCUE target priority.

## Player-Surface Goal

A player should be able to answer in one glance:

```text
What Energy do I own?
What does each one do?
Can I use it right now?
Why is one being suggested?
What target will it affect?
```

without seeing or understanding internal IDs.

## Central Presentation Truth

Player-facing identity must derive from `TacticalEnergyCatalog`.

Do not independently remap:

```text
energy-a
energy-b
energy-c
energy-d
```

inside individual UI files.

Catalog remains the source for:
- displayName;
- shortDescription;
- kind.

If UI-specific icons/colors/reason labels need a presentation helper, create one small deterministic helper adjacent to Energy UI, for example:

```text
TacticalEnergyPresentation.ts
```

Do not duplicate gameplay eligibility.

## Player-Facing Identity

Normal player-facing labels:

```text
MEND
RESCUE
BREAK
PIERCE
```

Do not primarily display:

```text
ENERGY-A
ENERGY-B
ENERGY-C
ENERGY-D
```

The internal ID may appear only in developer/debug output if needed.

## Icon Direction

Reuse the existing Energy icon system for this slice.

Do not create final art.

Update A–D icon metadata if useful so their names no longer imply obsolete generic tokens.

Suggested semantic icon treatment using current available icon vocabulary:

```text
MEND    → shield / recovery cue
RESCUE  → supportive / backline cue using current compatible icon asset
BREAK   → aggressive impact cue
PIERCE  → ranged / precision cue
```

Do not block implementation on perfect icon art.

Identity is carried primarily by:
- tactical name;
- effect hint;
- availability state;
- reason.

## Setup Surface

Battle Setup remains preview-only.

Stored Energy should display tactical identity:

```text
⚡ STORED ENERGY ×6

[MEND icon]   MEND    ×2
              Heal frontline

[RESCUE icon] RESCUE  ×1
              Heal Mid / Back

[BREAK icon]  BREAK   ×1
              Damage Frontliner

[PIERCE icon] PIERCE  ×2
              Damage Ranged

Cast during Battle
```

Requirements:
- no CAST button;
- no READY/SUGGESTED state evaluation in Setup;
- no internal Energy ID as primary label;
- keep copy compact;
- use one-line effect hint only;
- hide zero-count entries.

## Energy Rush Surface

Energy Rush currently generates A–D only after G.1.

Player-facing HUD / queue should use tactical names.

Examples:

```text
MEND ×2
RESCUE ×1
BREAK ×0
PIERCE ×1
```

Do not show:
- detailed Battle target conditions;
- READY / SUGGESTED state;
- long tooltips during timed matching.

The timed puzzle remains focused on matching.

Board tiles may keep existing icon artwork but should expose the tactical name through accessible label / tooltip / selected feedback where practical.

Do not rewrite BoardView architecture solely for text-on-tile labels if current tile size cannot support it cleanly.

The minimum acceptable G.2 Energy Rush identity is:
- tactical icon identity;
- right-rail / resource HUD name;
- matched-event name.

## Battle Availability Grammar

Every tactical Energy with stored charges should derive from:

```text
battleModel.tacticalEnergyEligibility(energyId, energyQueue)
```

Then player-facing UI applies:

```text
paused
→ DISABLED · PAUSED

availability === disabled
→ DISABLED + deterministic reason

availability === ready
→ READY + CAST

availability === suggested
→ SUGGESTED + reason + CAST
```

Do not call `frontlineHealEligibility()` for generic tactical Energy UI.

## Battle Cast Path

Current `ValidationScene.castEnergy()` still calls:

```text
castFrontlineHealResult()
```

This must change for V14G player gameplay.

New player-facing Battle cast:

```text
castEnergy(energyId)
→ battleModel.castTacticalEnergy(energyId, energyQueue)
```

Historical Frontline Heal APIs remain for compatibility and tests.

Do not delete them.

## Successful Cast Feedback

Feedback differs by tactical kind.

### MEND

```text
MEND → IRONCLAD +30
```

Use existing heal presentation:
- target HP refresh;
- heal pulse;
- floating +actualAmount.

### RESCUE

```text
RESCUE → STARCALLER +18
```

Need heal presentation on the actual RESCUE target, not always frontline.

If current `deriveBattleHealPresentation()` assumes frontline-only, extend or add a small target-specific heal presentation seam.

Do not fake RESCUE feedback on frontline.

### BREAK

```text
BREAK → FRONT -30
```

Use direct Energy-damage feedback:
- target enemy hit flash / pulse;
- floating `-30`;
- enemy HP refresh.

### PIERCE

```text
PIERCE → RANGED -30
```

Use direct Energy-damage feedback on the actual Ranged target.

Do not attribute BREAK/PIERCE to a Beast attack.

## Damage Presentation

If `BattleActionView` lacks an Energy-damage presentation API, add a focused method such as:

```text
playEnergyDamage(targetEnemyId, amount, kind)
```

or a generic target-damage presentation helper.

Requirements:
- presentation only;
- no HP mutation;
- no gameplay result calculation;
- use actual `TacticalEnergyCastResult.amount`.

Keep visual effect restrained and readable.

## Failure Feedback

Map model reasons to tactical player language.

Baseline reason labels:

```text
battle-not-running → BATTLE ENDED
no-charge          → NO CHARGE
no-target          → NO VALID TARGET
target-full-hp     → TARGET FULL
no-frontliner      → NO FRONTLINER
no-ranged          → NO RANGED
unsupported-energy → UNAVAILABLE
paused             → PAUSED   // presentation-level state
```

For MEND, `target-full-hp` may display:

```text
FRONTLINE FULL
```

Use context-specific player language if it stays deterministic.

Do not silently fail.

## READY Presentation

READY means:

```text
legal cast
but no special tactical urgency signal
```

Example:

```text
PIERCE ×1
READY · Ranged target
[CAST]
```

READY visual:
- standard active border;
- no pulse;
- normal CAST button.

## SUGGESTED Presentation

SUGGESTED means:

```text
legal cast
AND current Battle state matches intended tactical purpose
```

Suggested reason labels from model:

```text
FRONT INJURED
DIVER PRESSURE
BACKLINE HIT
FRONTLINE PRESSURE
RANGED PROTECTED
```

Visual treatment:
- Butter Yellow / Mint accent;
- optional one-time pulse when transitioning into SUGGESTED;
- small `SUGGESTED` badge;
- reason visible.

Do not use:
- BEST;
- OPTIMAL;
- MUST USE;
- ranking number;
- giant flashing arrow.

## Multiple Suggested Energy Types

Multiple Energy types may be SUGGESTED simultaneously.

Example Wave 1:

```text
MEND
SUGGESTED · FRONT INJURED

BREAK
SUGGESTED · FRONTLINE PRESSURE
```

Both remain manually castable.

UI must not select a winner.

## Disabled Presentation

Disabled tactical Energy may remain visible if it has stored charges.

Examples:

```text
MEND ×2
DISABLED · FRONTLINE FULL

PIERCE ×1
DISABLED · NO RANGED
```

This visibility is important because it teaches activation conditions.

Do not hide a charged Energy solely because it is currently disabled.

Zero-charge tactical types do not need full Battle rows unless a compact empty-state design improves clarity.

## Showcase Battle HUD

Replace current generic Energy row:

```text
A · 2 charges
CAST
```

with tactical row.

Each row should include:
- icon;
- displayName;
- `×count`;
- READY / SUGGESTED / DISABLED;
- compact reason;
- action button only when legal.

Suggested row:

```text
[icon] MEND ×2
SUGGESTED · FRONT INJURED             [CAST]
```

Remove old universal hint:

```text
Cast instantly heals the frontline unit.
```

Replace with a neutral hint:

```text
Tactical Energy · 1 charge per effective cast
```

or no footer if rows are self-explanatory.

## Normal PrototypeFlowPanel Battle

Normal Battle must use the same tactical presentation semantics as Showcase.

Update `FlowPanelEnergyRow` as needed.

Suggested structure:

```ts
interface FlowPanelEnergyRow {
  energyId: string;
  displayName: string;
  charges: number;
  stateLabel: string;
  reasonLabel?: string;
  enabled: boolean;
  suggested: boolean;
  onAction: () => void;
}
```

Exact API may vary.

Important:
- do not parse energyId from a rendered label string;
- pass structured data;
- disabled row must not register pointer callbacks;
- use `CAST`, not `CAST HEAL`, because BREAK/PIERCE are damage effects.

## Shared Presentation Helper

Create one pure helper for tactical UI state.

Conceptual output:

```ts
interface TacticalEnergyControlPresentation {
  energyId: string;
  displayName: string;
  shortDescription: string;
  charges: number;
  availability: 'disabled' | 'ready' | 'suggested';
  stateLabel: 'DISABLED' | 'READY' | 'SUGGESTED';
  reasonLabel?: string;
  actionLabel: 'CAST' | string;
  enabled: boolean;
  suggested: boolean;
}
```

Input:
- catalog definition;
- model eligibility;
- charge count;
- paused.

Both:
- ShowcaseBattleHUDView;
- PrototypeFlowPanel;

must consume the same presentation semantics.

Do not duplicate reason maps.

## Setup Presentation Helper

Update `setupEnergyInventory()` so it can derive tactical identity from catalog rather than only:

```text
shortLabel = A / B / C / D
```

Preferred Setup presentation entry:

```text
energyId
displayName
shortDescription
charges
```

The old shortLabel may remain for debug compatibility but should not be the primary player label.

## Energy Rush HUD / Match Feedback

Locate Energy Rush resource HUD / recent-match text.

Change player-facing match feedback from internal IDs to tactical names.

Example:

```text
+1 MEND
+1 BREAK
```

Stored counts should use tactical display names.

Do not add full tactical instruction text inside the timed puzzle.

## G.1 Semantic Hardening — RESCUE Diver Pressure

Fix:

Current:

```text
Diver pressure only counts if Diver targets the exact RESCUE heal target.
```

Required:

```text
diverPressure =
  ANY living Diver
  targeting / engaging
  ANY living Mid or Back player unit
```

RESCUE target remains:
- highest missing HP Mid/Back;
- stable ID tie-break.

Suggested reason priority:

```text
if diverPressure
→ DIVER PRESSURE

else if target <=60%
→ BACKLINE HIT
```

## G.1 Additional Hardening Checks

Add deterministic checks for:

1. Diver targets Back unit A while RESCUE chooses more-damaged Mid unit B → SUGGESTED / DIVER PRESSURE.
2. Diver targets Front unit only → does not trigger Diver-pressure suggestion.
3. no Diver pressure + target >60% + damaged → READY.
4. zero charge → DISABLED / no-charge.
5. stale target disappearing before cast → 0 consumption.
6. eligibility evaluation does not consume.
7. multiple tactical Energy may independently be SUGGESTED.
8. no tactical Energy auto-casts.

Do not inflate tests by duplicating old assertions unnecessarily.

## G.2 Deterministic Checks — Catalog Presentation

9. A presents MEND.
10. B presents RESCUE.
11. C presents BREAK.
12. D presents PIERCE.
13. player presentation does not require internal ID text.
14. shortDescription comes from central catalog.
15. E/F do not produce normal V14G player controls.

## G.2 Deterministic Checks — Setup

16. Setup inventory MEND row shows correct charge.
17. Setup RESCUE row uses `Heal backline` or approved catalog copy.
18. BREAK uses `Damage Frontliner`.
19. PIERCE uses `Damage Ranged`.
20. zero-charge entries may be filtered.
21. Setup entries have no CAST action.
22. Setup presentation does not mutate EnergyQueue.

## G.2 Deterministic Checks — Battle State

23. MEND ready → READY + CAST.
24. MEND suggested → SUGGESTED + FRONT INJURED + CAST.
25. MEND full target → DISABLED + FRONTLINE FULL.
26. RESCUE no target → DISABLED + NO VALID TARGET.
27. BREAK no Frontliner → DISABLED + NO FRONTLINER.
28. PIERCE no Ranged → DISABLED + NO RANGED.
29. paused overrides otherwise-ready Energy → DISABLED + PAUSED.
30. terminal Battle → DISABLED + BATTLE ENDED.
31. disabled presentation has `enabled = false`.
32. READY has `enabled = true`.
33. SUGGESTED has `enabled = true`.
34. multiple SUGGESTED rows remain simultaneously enabled.

## G.2 Deterministic Checks — Cast Routing

35. player `castEnergy(energy-a)` routes through tactical cast result.
36. RESCUE player cast heals Mid/Back, not frontline.
37. BREAK player cast damages Frontliner.
38. PIERCE player cast damages Ranged.
39. failed tactical result consumes 0.
40. successful tactical result consumes exactly 1.
41. player UI no longer routes B/C/D through `castFrontlineHealResult()`.

If direct ValidationScene private-method testing is impractical, test the pure routing/presentation seam and model result, and inspect wiring carefully.

## G.2 Deterministic Checks — Normal/Showcase Parity

42. same eligibility produces same stateLabel in normal and Showcase presentation.
43. same eligibility produces same reasonLabel.
44. same availability produces same enabled flag.
45. disabled controls invoke no action.
46. both modes use generic `CAST`, not universal `CAST HEAL`.

## G.2 Deterministic Checks — Result Feedback

47. MEND success maps to heal feedback.
48. RESCUE success targets actual healed Mid/Back body.
49. BREAK success maps to enemy damage feedback.
50. PIERCE success maps to enemy damage feedback.
51. displayed amount equals actual result amount.
52. failed result has no heal/damage effect presentation.

## Metrics Boundary

Do not build a new analytics subsystem in G.2.

Minimum:
- existing successful cast metric may continue;
- if easy, add tactical kind / actual amount metadata.

Do not block G.2 on analytics expansion.

## Historical Harness Boundary

V14E / E.1 harnesses are historical validation.

Do not rewrite their narrative as if they used all four tactical Energy identities.

Keep historical direct Frontline Heal callers working where needed.

Player gameplay now uses V14G tactical cast path.

## Live Validation — G.2

### Live A — Setup Identity

Stored Energy contains multiple A–D charges.

Expected:
- MEND / RESCUE / BREAK / PIERCE visible;
- compact effect hints;
- no raw `energy-a` primary labels;
- no CAST buttons.

### Live B — Frontline Pressure

With 2+ Frontliners and damaged player frontline:

Expected:
- BREAK = SUGGESTED · FRONTLINE PRESSURE;
- MEND = SUGGESTED · FRONT INJURED;
- both may be cast.

### Live C — Backline Dive

Diver attacks a Mid/Back body.

Expected:
- RESCUE becomes SUGGESTED · DIVER PRESSURE;
- RESCUE heals deterministic damaged Mid/Back target;
- visible heal feedback appears on that target.

### Live D — Protected Ranged

Living Ranged + living Frontliner.

Expected:
- PIERCE = SUGGESTED · RANGED PROTECTED;
- cast damages the Ranged target;
- visible damage feedback.

### Live E — READY vs SUGGESTED

Create legal but non-urgent state.

Expected:
- READY and SUGGESTED visually distinct;
- both remain manually castable.

### Live F — Disabled Teaching

Examples:
- full frontline MEND;
- no Ranged PIERCE.

Expected:
- charged Energy remains visible;
- reason explains why it cannot activate;
- no charge lost.

### Live G — Pause / Terminal

Expected:
- all controls disabled;
- PAUSED or BATTLE ENDED reason;
- no cast.

### Live H — Readability

One Battle screenshot should allow owner to identify:
- all stored Energy types;
- each effect category;
- which ones can cast;
- which one is suggested and why;
- current charge counts.

No debug ID knowledge required.

## Regression Boundary

Preserve:
- V14G.1 catalog and model semantics;
- V14D Run-scoped persistence;
- F.1 effective-result-first consumption;
- Energy Rush 12s first-valid-match timing;
- Beast/STAR/Link systems;
- Active Squad cap 4;
- Formation Grid 18;
- autonomous Battle;
- F.1c visual work.

## Non-Goals

Do NOT add:
- new tactical Energy types;
- manual target selection;
- cooldown;
- Energy Combo;
- Energy cap;
- decay;
- crafting;
- rarity;
- upgrades;
- auto-cast;
- best/optimal ranking;
- new Wave fixtures;
- balance changes;
- final art.

## Exit Gate

Required:
- RESCUE Diver-pressure semantic hardening;
- player gameplay routes A–D through `castTacticalEnergy()`;
- Setup uses tactical names/effect hints;
- normal Battle uses tactical names/state/reasons;
- Showcase uses tactical names/state/reasons;
- READY / SUGGESTED / DISABLED visible and deterministic;
- heal/damage feedback targets actual tactical target;
- internal Energy IDs are no longer primary player labels;
- historical regressions pass;
- `npm run check` exits 0;
- `npm run build` exits 0;
- Live A–H remain open unless actually observed.

Then STOP for owner live review.

V14G remains Experimental / not adopted.
