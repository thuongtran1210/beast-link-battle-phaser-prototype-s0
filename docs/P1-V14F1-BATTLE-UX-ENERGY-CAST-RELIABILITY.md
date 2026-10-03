# P1-V14F.1 — Battle Setup UX Clarity + Energy Cast Reliability

Status: **IMPLEMENTED BASELINE — Energy cast reliability complete; Reserve/KO grouping implemented; visual closeout continues in P1-V14F.1c / deterministic PASS / live evidence not recorded / Experimental / not adopted**.

## Why F.1 Exists

Owner live inspection of the current Battle Setup surface exposed two blocking issues before the V14 owner-live integration gate can be trusted:

1. Battle Setup is functionally dense but visually hard to scan.
2. Stored Energy is present, but player-facing cast reliability / feedback is not clear enough to verify live behavior.

This slice is not a new economy or balance experiment.

It improves:
- information hierarchy;
- Reserve / Deployed / KO readability;
- Active Squad vs Formation Grid clarity;
- Stored Energy presentation;
- manual Battle Energy cast reliability;
- success / failure feedback.

## Visual Direction

Use the existing Beast Link **Cute Tactical Chibi** UI language:
- deep navy tactical background;
- compact pastel role accents;
- clear card hierarchy;
- counts / icons / HP / STAR over prose;
- live resource HUD behavior rather than instruction-wall behavior;
- landscape-first 1280×720 reference layout.

Visual reference remains the accepted Beast Link UI Board direction.

This is **not final production art**.

## Current Screenshot Problems To Correct

Current Battle Setup surface shows:
- top title / phase / navigation information competing for the same visual area;
- Wave title and setup instructions visually colliding;
- player formation readable only after careful inspection;
- enemy cards too text-dense relative to their size;
- roster tray mixing living Reserve and KO bodies in one long card stream;
- KO cards consuming the same attention as deployable Reserve;
- Stored Energy displayed as raw ID text in a narrow panel;
- unrelated helper / consolidation copy crowding the Stored Energy panel;
- Active Squad cap 4 and 18-position grid still requiring explanation rather than being immediately obvious.

## Current Energy Cast Reliability Defect

Current production flow:

```text
ValidationScene.castEnergy()
→ battleModel.castFrontlineHeal(energyId, energyQueue)
→ success?
→ render + playHeal
```

Current `castFrontlineHeal()` consumes a charge before checking whether the selected frontline unit can actually gain HP.

Therefore a frontline unit at full HP can cause:

```text
charge consumed
→ HP remains unchanged
→ derived heal amount = 0
→ no heal presentation
```

This can look like “cast does not work”.

Current UI also silently returns on several invalid states, so the player cannot distinguish:
- Battle not Running;
- no charge;
- no living frontline;
- frontline already at full HP.

F.1 must make these states explicit.

## Locked Gameplay Boundary

Preserve the current Energy mechanic:

```text
manual cast
→ selected Energy ID
→ heal current frontmost living player unit
→ +30 HP max
→ clamp to max HP
→ exactly 1 charge consumed only on successful effective heal
```

Do NOT change target selection to arbitrary unit targeting in F.1.

Do NOT add new Energy effects.

Do NOT add Energy cap / decay.

## F.1a — Battle Setup UX Clarity

### 1. Header Hierarchy

Battle Setup header should prioritize:

```text
WAVE N / 3 — {WAVE NAME}
Threat: {THREAT LABEL}
```

Keep phase navigation / debug tooling secondary.

Avoid duplicated competing titles such as:
- game title;
- phase title;
- Wave title;
- fixture title

all fighting in the same row.

At 1280×720:
- no text overlap;
- no title clipping;
- no navigation label collision.

### 2. Active Squad vs Formation Grid

Make the distinction immediately visible:

```text
ACTIVE SQUAD   4 / 4
FORMATION GRID 18 POSITIONS
```

Compact helper copy is allowed once:

```text
18 positions • deploy max 4
```

Do not use a paragraph.

Production truth remains:

```text
P1V14B_ACTIVE_SQUAD_LIMIT = 4
Formation slots = 18
```

Grid capacity must not imply squad capacity.

### 3. Formation Board

Keep the existing 3×6 positional grammar.

Improve scan hierarchy:
- player side clearly blue / cool;
- enemy side clearly red / warm;
- Front / Mid / Back labels readable;
- lane labels secondary;
- occupied unit card stronger than empty slot;
- empty slots recede visually;
- when Active Squad is full, empty positional slots must not look like additional deploy capacity.

### 4. Enemy Cards

Enemy unit cards should prioritize:

```text
ARCHETYPE
HP
DMG
```

Archetype badge:
- FRONT
- DIVER
- RANGED

must be readable before numeric details.

Do not add new enemy mechanics.

### 5. Roster Tray Classification

The bottom roster area must separate three player states:

#### DEPLOYED
Living units currently placed on formation.

#### RESERVE
Living units not deployed and available to place.

#### KO
Persistent dead RunRoster bodies.

KO must:
- remain visible for attrition readability;
- be visually desaturated / disabled;
- have an unmistakable `KO` badge;
- be non-interactive for deployment;
- not be mixed into the main Reserve scan path.

If a dedicated DEPLOYED strip would duplicate the board excessively, a compact deployed summary is acceptable, but Reserve and KO must still be visually separated.

### 6. Reserve Cards

Living Reserve card priority:

```text
icon
name
role + STAR
HP
signature
```

Primary action:
- drag / click to deploy.

Manual STAR consolidation may remain available where currently legal, but its affordance must not overlap Stored Energy copy.

### 7. Pagination

Reserve pagination remains allowed.

Pagination must operate on the relevant Reserve set, not make KO bodies appear as if they are deployable Reserve.

### 8. Setup Stored Energy Card

Battle Setup Stored Energy is **preview only**.

Show:
- Energy icon / short ID;
- per-ID count;
- total count;
- Link Shard chip may remain visually adjacent but distinct.

Compact example:

```text
STORED ENERGY     ×8
A ×2   B ×2   E ×2   F ×1   ...
Cast during Battle
```

Do not display raw prose-heavy instructions.

Do not show a clickable cast action in Setup.

## F.1b — Battle Manual Energy Cast Reliability

### 9. Battle Cast Surface

During Battle, Stored Energy becomes an interactive action inventory.

Each available Energy ID row / chip shows:
- icon;
- short ID;
- current count;
- cast button / clickable card;
- current enabled / disabled state.

### 10. Cast Eligibility

A manual Frontline Heal cast is enabled only when:

```text
phase === Battle
battle model exists
battle status === Running
selected Energy ID charge > 0
frontmost living unit exists
frontmost living unit currentHp < maxHp
```

In showcase pause mode, disable manual cast while paused unless an existing explicit design rule says otherwise.

### 11. Effective-Heal-First Consumption

Critical invariant:

```text
if effective heal amount <= 0
→ consume 0 charge
→ return failure
```

Charge consumption must happen only after the model knows an effective heal is legal.

A full-HP frontline must not consume Energy.

### 12. Successful Cast

On success:
- exactly 1 selected-ID charge consumed;
- frontline HP increases by `min(30, missingHp)`;
- HP remains capped at max;
- Battle keeps running;
- UI count updates immediately;
- HP bar updates immediately;
- existing heal presentation plays;
- floating text shows actual amount, e.g. `+18` or `+30`;
- compact cast feedback is visible.

Suggested feedback:

```text
⚡ A → IRONCLAD +30
```

Use actual target / actual heal amount.

### 13. Failed Cast

Invalid cast consumes 0.

Player-facing feedback must identify the reason.

Minimum reason set:

```text
Battle not running
No charges
No living frontline
Frontline at full HP
Paused
```

No silent failure.

### 14. Structured Eligibility Preferred

Prefer one shared cast eligibility / result seam rather than duplicating reason logic in multiple UIs.

Acceptable direction:

```ts
type FrontlineHealCastReason =
  | 'ok'
  | 'battle-not-running'
  | 'no-charge'
  | 'no-target'
  | 'target-full-hp';

interface FrontlineHealCastResult {
  success: boolean;
  reason: FrontlineHealCastReason;
  energyId: string;
  targetUnitId?: string;
  healedAmount: number;
}
```

Exact shape may follow repo conventions.

A smaller `canCastFrontlineHeal(...)` + existing boolean cast is also acceptable if reason handling stays deterministic and single-sourced.

Do not build a generic spell framework.

### 15. Normal Battle + Showcase HUD

Both player-facing Battle surfaces must use the same cast rule:
- normal `PrototypeFlowPanel` Battle;
- `ShowcaseBattleHUDView`.

No surface may bypass effective-heal eligibility.

### 16. Button State

Button/chip state must communicate:
- enabled;
- no charge;
- full HP;
- battle ended;
- paused.

Do not display a blue active-looking button that will silently do nothing.

## Deterministic Checks

Add focused F.1 checks.

### Setup Classification

1. production squad cap remains 4.
2. formation grid remains 18 slots.
3. KO RunRoster bodies are classified non-deployable.
4. living Reserve is deployable.
5. deployed / Reserve / KO classification does not duplicate a body.
6. pagination does not turn KO into deployable Reserve.

### Cast Eligibility

7. Running + charge + damaged frontline => eligible.
8. Running + charge + full-HP frontline => ineligible.
9. Running + zero charge => ineligible.
10. terminal Battle => ineligible.
11. no living frontline => ineligible.

### Consumption / Heal

12. valid cast consumes exactly 1 charge.
13. valid cast heals at most 30.
14. valid cast clamps to max HP.
15. partial missing HP reports actual healed amount.
16. full-HP cast consumes 0.
17. terminal cast consumes 0.
18. invalid Energy ID consumes 0.

### UI / Presentation Seam

19. successful result can produce heal presentation with actual positive amount.
20. failed result has deterministic reason text/state.
21. normal Battle and Showcase Battle route through the same eligibility/cast semantics.

Historical checks must remain green.

## Live Validation

### Live A — Setup Hierarchy

At 1280×720 and owner screenshot resolution:
- no header overlap;
- Wave / Threat immediately readable;
- player vs enemy board hierarchy clear.

### Live B — Squad vs Grid

With Active 4/4:
- player can see positional slots still exist;
- UI clearly indicates no additional Active body may be deployed.

### Live C — Reserve vs KO

At least one KO body and several living Reserve bodies:
- KO visually separated;
- KO cannot deploy;
- Reserve remains easy to scan.

### Live D — Setup Energy Preview

Stored Energy counts readable.
No cast action available in Setup.

### Live E — Damaged Frontline Cast

During Running Battle:
- frontline loses HP;
- cast one Energy;
- charge decreases exactly 1;
- HP rises;
- visible +heal feedback plays.

### Live F — Full HP Cast Protection

With frontline at full HP:
- cast control disabled or fails visibly;
- 0 charge consumed.

### Live G — Terminal Protection

After Battle Win/Lose:
- cast disabled;
- 0 charge consumed;
- reason/state readable.

### Live H — Screenshot Readability

One Setup screenshot and one Battle screenshot should communicate:
- Active / Reserve / KO;
- Wave / Threat;
- enemy archetypes;
- Stored Energy;
- cast availability;

without debug prose walls.

## Regression Boundary

Preserve:
- V14A Wave flow;
- B.1/B.2 RunRoster identity / HP / KO / Reserve;
- B.3 STAR consolidation;
- C.1 Combo;
- C.2 Link Shards;
- C.1a / C.1a.1 timing;
- D Energy persistence;
- E / E.1 harness semantics;
- Energy +30 Frontline Heal fixture;
- Active Squad cap 4;
- 18 formation positions.

## Non-Goals

Do NOT implement:
- arbitrary Energy target selection;
- new Energy effects;
- Energy storage cap;
- Energy decay;
- Energy Combo;
- Squad Capacity upgrade;
- revive;
- post-Wave healing;
- items / equipment;
- shop / economy;
- meta progression;
- final character art;
- full scene rewrite.

## Suggested Implementation Split

Implement in two focused commits if useful:

### P1-V14F.1a
Battle Setup UX clarity:
- header;
- board hierarchy;
- Reserve / Deployed / KO;
- Stored Energy preview.

### P1-V14F.1b
Battle Energy Cast reliability:
- eligibility;
- effective-heal-first consumption;
- failure reason;
- action-state UI;
- feedback.

One combined feature commit is acceptable if the diff remains focused.

## Exit Gate

Required:
- Setup layout is readable without overlap;
- Reserve / KO distinction is explicit;
- squad cap vs grid capacity is explicit;
- full-HP cast cannot consume Energy;
- manual cast success is visible;
- manual cast failure is not silent;
- deterministic F.1 checks pass;
- historical regressions pass;
- `npm run check` exits 0;
- `npm run build` exits 0;
- live A–H stay OPEN unless actually recorded.

P1-V14F.1 remains Experimental / not adopted.


## F.1c Visual Closeout Continuation

Owner screenshot after remote baseline `8666a5eeb27c6bc4ef0ef9fdc918d23524adc5f8` shows the remaining Setup surface still requires visual closeout.

Active continuation:

`docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`

F.1c changes no gameplay mechanic.
