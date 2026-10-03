# P1-V14G — Energy Identity & Activation Grammar

Status: **P1-V14G.1 CORE IMPLEMENTED / DETERMINISTIC PASS / PLAYER-SURFACE G.2 PENDING / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED**.

## P1-V14G.1 Implementation Evidence — 2026-10-03

- Central catalog: `src/game/energy/TacticalEnergyCatalog.ts`; new player Energy Rush generation uses A-D only.
- `AutonomousBattleModel` owns tactical eligibility and cast results, including stale-state re-evaluation and effective-result-first charge consumption.
- MEND delegates to the existing Frontline Heal semantics. RESCUE, BREAK, and PIERCE use deterministic target selection and share existing enemy aggregate/terminal synchronization.
- `energy-e` and `energy-f` remain valid generic `EnergyQueue` data but are unsupported tactical casts.
- G.2 is reserved for player-facing naming, readiness, and suggested-state presentation.

## Why V14G Exists

Persistent Energy now creates a real Run-level save-vs-spend decision, and F.1 hardened manual cast reliability.

However, the current player-facing Energy system still has a fundamental identity problem:

```text
energy-a
energy-b
energy-c
energy-d
energy-e
energy-f
```

all effectively communicate the same question:

```text
Do I spend one charge to Frontline Heal?
```

That means the player can understand:

```text
cast now
vs
save for later
```

but cannot meaningfully answer:

```text
Which Energy should I use?
Why this one?
What will it affect?
When is it useful?
```

V14G gives Energy explicit tactical identity and a clear activation grammar.

## Core Hypothesis

**Each Energy type should communicate one tactical purpose, one deterministic target rule, and one readable battle situation where it becomes relevant.**

The player remains the decision maker.

The UI may surface relevance, but must not auto-cast or prescribe a universal best action.

## Baseline Scope — Four Tactical Energy Types

V14G baseline uses four player-facing Energy identities.

Do not introduce six unique effects in the first experiment.

Mapping:

```text
energy-a → MEND
energy-b → RESCUE
energy-c → BREAK
energy-d → PIERCE
```

The existing `energy-e` and `energy-f` IDs remain repository compatibility / historical registry IDs but are **not generated as player-facing V14G tactical Energy** in a new Run.

`EnergyQueue` remains generic and may still store arbitrary IDs for historical deterministic tests.

Do not silently convert legacy IDs into another tactical type.

## Shared Tactical Energy Rule

All four tactical Energy types:

- are collected during Energy Rush;
- persist across Waves through the existing Run-scoped `EnergyQueue`;
- cost exactly 1 charge on a successful effective cast;
- cost 0 on failed / ineligible cast;
- are manually cast by the player;
- do not auto-cast;
- have deterministic automatic target selection in V14G baseline;
- do not require manual target picking yet;
- may be cast repeatedly if the player has charges and the ability remains eligible;
- add no new global cooldown in V14G baseline.

Finite charges remain the opportunity cost.

## Energy A — MEND

Player-facing name:

```text
MEND
```

Purpose:

```text
Keep the current frontline body alive.
```

Effect:

```text
Heal frontmost living player unit by up to 30 HP.
```

Target:
- current deterministic frontmost living player unit;
- reuse the existing F.1 frontline target rule.

Eligibility:
- Battle status is Running;
- MEND charge > 0;
- living frontline target exists;
- target current HP < max HP.

Success:
- actual heal = `min(30, missingHp)`;
- consume exactly 1 MEND charge.

Suggested state:
- target missing HP >= 30; OR
- target HP ratio <= 60%.

Suggested reason example:

```text
FRONT INJURED
```

This preserves the current Frontline Heal behavior as one named Energy identity.

## Energy B — RESCUE

Player-facing name:

```text
RESCUE
```

Purpose:

```text
Stabilize a damaged Mid / Back unit when pressure bypasses the frontline.
```

Effect:

```text
Heal one living damaged Mid / Back player unit by up to 30 HP.
```

Target priority:
1. living units whose formation row is Mid or Back;
2. highest missing HP first;
3. deterministic stable unit ID tie-break.

Do not target Front-row units with RESCUE.

Eligibility:
- Battle status is Running;
- RESCUE charge > 0;
- at least one living Mid / Back unit has missing HP.

Success:
- actual heal = `min(30, missingHp)`;
- consume exactly 1 RESCUE charge.

Suggested state:
- a living Diver is currently targeting / engaging a Mid or Back unit; OR
- the chosen RESCUE target HP ratio <= 60%.

Suggested reason examples:

```text
BACKLINE HIT
DIVER PRESSURE
```

RESCUE is the baseline anti-backline-pressure Energy.

## Energy C — BREAK

Player-facing name:

```text
BREAK
```

Purpose:

```text
Accelerate removal of frontline pressure.
```

Effect:

```text
Deal 30 direct Energy damage to one living enemy Frontliner.
```

Target priority:
1. living enemy with archetype `Frontliner`;
2. closest to the player by current model-space position;
3. deterministic enemy ID tie-break.

Eligibility:
- Battle status is Running;
- BREAK charge > 0;
- at least one living Frontliner exists.

Success:
- deal up to 30 HP damage, clamped at target current HP;
- consume exactly 1 BREAK charge if positive damage is applied.

Suggested state:
- 2 or more living Frontliners exist.

Suggested reason:

```text
FRONTLINE PRESSURE
```

BREAK does not change target aggro, movement, or engagement rules.

## Energy D — PIERCE

Player-facing name:

```text
PIERCE
```

Purpose:

```text
Reach a dangerous Ranged enemy that is protected behind the frontline.
```

Effect:

```text
Deal 30 direct Energy damage to one living enemy Ranged unit.
```

Target priority:
1. living enemy with archetype `Ranged`;
2. lowest current HP first;
3. deterministic enemy ID tie-break.

Eligibility:
- Battle status is Running;
- PIERCE charge > 0;
- at least one living Ranged enemy exists.

Success:
- deal up to 30 HP damage, clamped at target current HP;
- consume exactly 1 PIERCE charge if positive damage is applied.

Suggested state:
- at least one living Ranged enemy exists;
- and at least one living enemy Frontliner also exists.

Suggested reason:

```text
RANGED PROTECTED
```

PIERCE is allowed to bypass ordinary player targeting order by design.

It does not change autonomous Beast targeting.

## Why These Four

The four identities map directly to current threat grammar:

```text
WAVE 1 — FRONTLINE PRESSURE
→ MEND / BREAK can become relevant

WAVE 2 — BACKLINE DIVE
→ RESCUE can become relevant

WAVE 3 — PROTECTED RANGED
→ PIERCE can become relevant
```

This does not mean those Energy types may only be used in those Waves.

Eligibility is determined by actual Battle state, not Wave label.

The Wave structure merely creates readable situations where their identity can be learned.

## Activation Grammar

Player-facing Energy always follows this grammar:

```text
SETUP
→ PREVIEW ONLY
→ no cast

BATTLE / RUNNING
→ evaluate charge + target condition
→ DISABLED / READY / SUGGESTED
→ player chooses whether to cast

BATTLE / PAUSED
→ DISABLED

BATTLE / WIN / LOSE
→ DISABLED

WAVE RESULT
→ remaining Energy preview only
```

## Three Player-Facing States

### DISABLED

Meaning:

```text
This Energy cannot produce an effective legal result right now.
```

Examples:
- no charge;
- no valid target;
- relevant target at full HP;
- Battle not Running;
- paused.

Disabled must:
- look disabled;
- have no active pointer action;
- consume 0 charge.

### READY

Meaning:

```text
This Energy can legally be cast now.
```

READY does not imply the player should cast it.

### SUGGESTED

Meaning:

```text
This Energy is legal AND current Battle state matches its intended tactical use.
```

SUGGESTED is a recommendation signal only.

It must not:
- auto-cast;
- rank Energy types;
- prevent another READY Energy from being used;
- guarantee that casting is optimal.

## Suggested-State UI

Suggested state should use restrained emphasis.

Allowed:
- subtle Butter Yellow / Mint accent;
- one pulse on state transition;
- compact reason label.

Do not use:
- giant flashing arrows;
- “BEST”;
- “USE NOW”;
- ranking scores.

Examples:

```text
✚ MEND ×2
SUGGESTED · FRONT INJURED

↩ RESCUE ×1
READY

✦ BREAK ×1
SUGGESTED · FRONTLINE PRESSURE

➶ PIERCE ×2
DISABLED · NO RANGED
```

Exact icon may use existing project icon grammar.

## Setup Presentation

Battle Setup shows tactical identity but no action.

Example:

```text
STORED ENERGY ×6

✚ MEND    ×2
↩ RESCUE  ×1
✦ BREAK   ×1
➶ PIERCE  ×2

Cast during Battle
```

Do not show:
- CAST buttons;
- READY / SUGGESTED battle-state evaluation;
- long effect paragraphs.

A short one-line effect hint may appear on hover/select.

## Energy Rush Presentation

Energy Rush should collect tactical identities rather than anonymous A–F tokens.

New V14G player pool:

```text
energy-a
energy-b
energy-c
energy-d
```

Do not generate `energy-e` or `energy-f` in the V14G player Energy Rush board.

Valid pair behavior remains:

```text
1 valid pair
→ +1 matched tactical Energy charge
```

First-match timer semantics remain unchanged.

Suggested board labels / side rail:

```text
MEND ×2
RESCUE ×1
BREAK ×0
PIERCE ×1
```

Do not explain full Battle mechanics during the timed Rush.

## Battle Presentation

Each tactical Energy row/card should show:

- icon;
- tactical name;
- charge count;
- state: DISABLED / READY / SUGGESTED;
- compact state reason;
- CAST action only when eligible.

Examples:

```text
MEND ×2
FRONT INJURED
[CAST]

PIERCE ×1
NO RANGED
[DISABLED]
```

The effect should be understandable without internal ID text.

Do not expose `energy-a` etc as the primary player-facing label.

## Result Feedback

Successful cast must emit concise feedback.

MEND:

```text
✚ MEND → IRONCLAD +30
```

RESCUE:

```text
↩ RESCUE → STARCALLER +18
```

BREAK:

```text
✦ BREAK → FRONT -30
```

PIERCE:

```text
➶ PIERCE → RANGED -30
```

Use actual target identity / actual applied amount.

## Tactical Energy Catalog

Create one central catalog as the source of player-facing Energy identity.

Conceptual shape:

```ts
type TacticalEnergyKind =
  | 'Mend'
  | 'Rescue'
  | 'Break'
  | 'Pierce';

interface TacticalEnergyDefinition {
  energyId: string;
  kind: TacticalEnergyKind;
  displayName: string;
  shortDescription: string;
}
```

Exact naming may follow repo conventions.

Do not spread ID-to-effect mapping across multiple UI files.

## Battle Model Authority

Gameplay effect eligibility and resolution must remain deterministic and model-owned.

Preferred seam:

```text
tacticalEnergyEligibility(energyId, energyQueue)
→ reason / target / state

castTacticalEnergy(energyId, energyQueue)
→ result
```

Conceptual result:

```ts
interface TacticalEnergyCastResult {
  success: boolean;
  energyId: string;
  kind?: TacticalEnergyKind;
  reason: TacticalEnergyCastReason;
  targetUnitId?: string;
  targetEnemyId?: string;
  amount: number;
}
```

Do not let UI mutate HP or enemy HP directly.

## Compatibility With Frontline Heal

Keep the existing F.1 Frontline Heal seam available for historical callers / tests if removing it would create unnecessary regression risk.

MEND should use or delegate to the existing effective-heal-first Frontline Heal logic.

Do not duplicate MEND logic in UI.

## Direct Energy Damage Rule

BREAK and PIERCE apply deterministic direct Energy damage.

They:
- do not create a normal Beast attack action;
- do not alter Beast attack cooldown;
- do not alter engagement;
- do not trigger Beast signatures;
- do not count as Beast signature damage;
- may update enemy aggregate HP through the existing model sync path.

If direct-damage metrics are added, keep them Energy-specific.

Do not attribute Energy damage to a Beast unit.

## RESCUE Target Row

RESCUE uses the unit's formation row identity for baseline eligibility:

```text
Mid
Back
```

It does not chase current model-space movement classification.

This keeps the rule readable:

```text
This Energy protects the bodies I intentionally placed behind the frontline.
```

## Suggested-State Evaluation

Suggested state must be derived from actual battle snapshot.

MEND:
- target missing >= 30 OR HP <= 60%.

RESCUE:
- Diver targeting/engaging Mid/Back OR chosen target HP <= 60%.

BREAK:
- living Frontliner count >= 2.

PIERCE:
- living Ranged count >= 1 AND living Frontliner count >= 1.

No Wave-name check is required.

## Charge Consumption Invariant

For all tactical Energy:

```text
effective result amount > 0
→ consume exactly 1 selected charge

effective result amount <= 0
→ consume 0
```

No charge may disappear because:
- target vanished;
- target was full HP;
- wrong enemy archetype;
- Battle became terminal;
- button was stale.

## Legacy energy-e / energy-f Boundary

V14G player-facing catalog uses A–D only.

`energy-e` and `energy-f`:
- remain valid generic `EnergyQueue` IDs for historical checks;
- remain in icon registry until a separate cleanup;
- are not spawned by new V14G Energy Rush gameplay;
- are not shown as active tactical Energy buttons in a normal new V14G Run;
- do not require save migration because current prototype Run state is not an external persistent save contract.

Do not delete historical tests merely because they use generic queue IDs.

## Metrics

Extend metrics minimally.

Per Energy kind, if practical:
- collected;
- casts attempted;
- casts successful;
- amount applied;
- charges remaining.

Also useful:
- READY duration;
- SUGGESTED duration;
- cast while SUGGESTED vs cast while merely READY.

Do not build a new analytics framework.

## Decision Questions V14G Must Answer

1. Can the player explain what each Energy does without knowing A/B/C/D IDs?
2. Can the player tell whether an Energy can be cast now?
3. Can the player tell why an Energy is currently suggested?
4. Do different threat states make different Energy identities relevant?
5. Does manual choice remain meaningful rather than becoming auto-play?
6. Does persistence still create save-now-vs-later tension?

## Deterministic Checks — Catalog

1. `energy-a` maps to MEND.
2. `energy-b` maps to RESCUE.
3. `energy-c` maps to BREAK.
4. `energy-d` maps to PIERCE.
5. V14G player pool contains exactly four tactical Energy IDs.
6. EnergyQueue remains generic.
7. energy-e/f are not in new player Energy Rush generation.

## Deterministic Checks — MEND

8. damaged frontline => READY.
9. full-HP frontline => DISABLED.
10. no frontline => DISABLED.
11. successful MEND heals at most 30.
12. successful MEND consumes exactly 1.
13. ineffective MEND consumes 0.
14. missing >=30 or <=60% HP => SUGGESTED.

## Deterministic Checks — RESCUE

15. damaged Mid/Back => READY.
16. only damaged Front unit => RESCUE DISABLED.
17. highest missing-HP Mid/Back is targeted.
18. stable-ID tie-break is deterministic.
19. successful RESCUE heals at most 30.
20. successful RESCUE consumes exactly 1.
21. Diver pressure against Mid/Back => SUGGESTED.

## Deterministic Checks — BREAK

22. living Frontliner => READY.
23. no living Frontliner => DISABLED.
24. closest living Frontliner target is deterministic.
25. successful BREAK applies 30 or remaining target HP.
26. successful BREAK consumes exactly 1.
27. 2+ living Frontliners => SUGGESTED.
28. BREAK does not modify Beast cooldown / signature state.

## Deterministic Checks — PIERCE

29. living Ranged => READY.
30. no living Ranged => DISABLED.
31. lowest-HP living Ranged target is deterministic.
32. successful PIERCE applies 30 or remaining target HP.
33. successful PIERCE consumes exactly 1.
34. protected Ranged state => SUGGESTED.
35. PIERCE bypasses normal Beast target ordering without changing that ordering.

## Deterministic Checks — Shared Activation

36. Setup => all cast actions unavailable.
37. Running Battle => eligibility evaluated.
38. paused => all tactical Energy disabled.
39. Win/Lose => all tactical Energy disabled.
40. zero charge => selected Energy disabled.
41. failed cast consumes 0.
42. successful cast consumes exactly 1.
43. READY does not imply SUGGESTED.
44. SUGGESTED is still manually activated only.
45. no Energy auto-casts.

## Deterministic Checks — Persistence

46. unused tactical Energy persists to next Wave.
47. charge identity persists per ID.
48. later Energy Rush adds to existing tactical charge.
49. Restart clears all tactical Energy.
50. no storage cap is introduced.

## Live Validation

### Live A — Identity

Battle Setup with multiple Energy types.

Expected:
- player-facing names MEND / RESCUE / BREAK / PIERCE;
- no need to interpret `energy-a` IDs.

### Live B — Frontline Pressure

Wave with multiple Frontliners.

Expected:
- BREAK can become SUGGESTED;
- MEND becomes SUGGESTED when frontline takes meaningful damage.

### Live C — Backline Dive

Diver reaches / targets Mid or Back.

Expected:
- RESCUE becomes SUGGESTED;
- cast heals the deterministic damaged backline target.

### Live D — Protected Ranged

Ranged remains alive behind Frontliners.

Expected:
- PIERCE becomes SUGGESTED;
- cast damages Ranged directly.

### Live E — READY vs SUGGESTED

Create a state where two Energy types are legal but only one matches its suggested condition.

Expected:
- both may be cast;
- only the contextually relevant one gets SUGGESTED emphasis.

### Live F — Invalid Cast

Target condition disappears before click / Battle terminal / no charge.

Expected:
- 0 charge consumed;
- state updates to DISABLED.

### Live G — Persistence

Save at least one tactical Energy across Wave transition.

Expected:
- same named Energy / count available next Wave.

### Live H — Readability

Battle screenshot should allow a reviewer to answer:

```text
Which Energy are available?
What does each one do?
Which are usable now?
Why is one suggested?
```

without debug text.

## Regression Boundary

Preserve:
- Energy Rush first-match start buffer;
- persistent Energy across Waves;
- no Energy cap / decay;
- F.1 effective-result-first charge consumption;
- V14E/E.1 save-vs-spend evidence concept;
- Wave sequence;
- RunRoster / HP / KO;
- STAR;
- Link Shards;
- Active Squad cap 4;
- Formation Grid 18;
- autonomous Battle.

## Non-Goals

Do NOT implement in V14G baseline:
- manual Energy target selection;
- Energy cooldown;
- Energy Combo;
- Energy crafting;
- Energy upgrades;
- Energy rarity;
- random Energy effects;
- more than four active tactical types;
- squad-cap upgrades;
- revive;
- post-Wave recovery;
- shop / economy;
- meta progression.

## Adoption Boundary

V14G is Experimental.

Evidence levels remain separate:
1. design spec exists;
2. code exists;
3. deterministic checks pass;
4. check/build pass;
5. live browser evidence;
6. owner verification;
7. real-player evidence;
8. adoption.

Do not adopt Tactical Energy Identity into canonical gameplay from implementation alone.
