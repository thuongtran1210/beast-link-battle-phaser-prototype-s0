# P1-V14E.1 — Policy Semantics & Evidence Hardening

Status: **ACTIVE CORRECTIVE VALIDATION SLICE / OWNER AUTHORIZED / CODE NOT STARTED / EXPERIMENTAL / NOT ADOPTED**.

## Why E.1 Exists

P1-V14E integration harness exists on remote main at:

```text
33dbaa1f3ac684c5785c8b863383f4b6cad8cf47
test(run): add multi-wave commitment integration harness
```

The harness successfully combines V14A–D systems across the existing three-Wave run, but repository review found evidence-quality defects that must be corrected before V14E can be considered validation-ready.

This slice adds no gameplay mechanic.

It hardens:
- policy semantics;
- deterministic evidence;
- production-constant checks;
- harness/report consistency;
- documentation truth.

## Defect 1 — Energy Policy Is Not Actually Policy-Specific

Current harness runs the same automatic heal loop for both:

```text
CONSERVE
COMMIT
```

Therefore current Energy differences are partly consequences of different formation / STAR outcomes rather than a controlled save-vs-spend policy decision.

This conflicts with the intended policy descriptions.

### Required Fix

Energy behavior must be explicitly policy-owned.

At minimum:

```text
CONSERVE
→ intentionally preserves Energy under its defined policy

COMMIT
→ intentionally spends Energy under its defined policy
```

The main three-Wave trace must not silently route both policies through identical Energy-cast logic.

## Controlled Energy Evidence

Because the integrated policies differ on multiple axes, V14E.1 must also include a focused controlled Energy comparison using equivalent Battle conditions.

Required controlled pair:

```text
SAVE
→ same formation
→ same enemy fixture
→ same starting HP
→ same starting Energy
→ no casts

SPEND
→ same formation
→ same enemy fixture
→ same starting HP
→ same starting Energy
→ cast using the existing Frontline Heal rule at a deterministic damage threshold
```

Required factual evidence:

```text
SAVE.energyCarryOut > SPEND.energyCarryOut
```

and when a useful heal opportunity occurs:

```text
SPEND.rosterHpRemaining >= SAVE.rosterHpRemaining
```

Do not rank SAVE or SPEND.

The existing V14D harness may be reused if appropriate rather than duplicating logic.

## Defect 2 — Link Shard Evidence Text Is Inconsistent

Current integrated COMMIT trace performs an assisted consolidation in Wave 2:

```text
2 beast-b copies + 1 Link Shard
→ 2★ Assassin
→ exactly 1 shard spent
```

If the trace earns 1 shard per Wave across three Waves:

```text
total earned = 3
total spent = 1
final remaining = 2
```

Repository docs and final report must reflect those exact facts.

Do not state:

```text
earned 3
spent 0
final 2
```

because that is internally inconsistent.

## Defect 3 — Divergence Count Must Reflect Actual Harness Output

Current report mentioned a Run Status divergence, while the comparison helper does not necessarily add Run Status to its `divergences` array.

Required:

- divergence list is generated from actual trace outputs;
- documented divergence count equals `comparison.divergences.length`;
- if final run status differs, it may be added as a factual divergence;
- no manually inflated count;
- no winner semantics.

Potential factual categories:
- STAR distribution;
- roster body count;
- Energy balance;
- Link Shard balance;
- Run status;
- living / KO count;
- stable-instance HP;
- available role mix.

Require at least 3 actual divergences.

## Defect 4 — Squad Cap Check Must Read Production Truth

Current V14E check uses a helper equivalent to:

```ts
function rosterHasSquadCap4(): boolean {
  return true;
}
```

This is not evidence.

Required:
- import the production Experimental Active Squad cap constant;
- assert the production value is 4;
- where relevant, assert deployment behavior against that same constant;
- delete any always-true stand-in helper.

Preferred source:
`P1V14B_ACTIVE_SQUAD_LIMIT`
or the repository's current canonical production constant if renamed.

Do not create another cap constant.

## Defect 5 — Simulation Timing Wording Must Be Correct

Current production constant:

```ts
SIMULATION_STEP = 0.1
```

Therefore:
- one simulation step = 0.1 seconds = 100 ms;
- 6000 steps = 600 seconds, not 60 seconds;
- it is not a 10 ms step.

Correct comments / docs / report wording.

Do not rebalance combat merely to fix wording.

If changing the harness safety bound, derive it explicitly from a named maximum duration and `SIMULATION_STEP`, and ensure all historical outcomes remain deterministic.

Smallest safe fix is preferred.

## Policy Definitions After E.1

### CONSERVE

Neutral descriptive intent:
- preserve more separate 1★ bodies;
- preserve more Reserve flexibility;
- defer Link Shard consumption when possible;
- intentionally retain more Energy according to an explicit Energy policy.

### COMMIT

Neutral descriptive intent:
- consolidate when legal to create STAR density;
- spend Link Shard when legal for assisted consolidation;
- expose a different legal squad to Battle;
- intentionally spend Energy according to an explicit Energy policy.

The exact per-Wave Energy behavior must be encoded in one named policy function / strategy branch rather than emergent from identical hidden auto-heal logic.

## Recommended Policy API

Use a focused policy representation, for example:

```ts
interface MultiWavePolicyBehavior {
  kind: 'CONSERVE' | 'COMMIT';
  shouldCastEnergy(...): boolean;
}
```

or equivalent.

Do not build a strategy framework.

The goal is simply to make policy ownership explicit and testable.

## Required Snapshot Additions

If not already present, snapshots / final trace should make policy execution auditable.

At minimum record:
- energyCarryIn;
- energyCollected;
- energySpent;
- energyCarryOut;
- linkCarryIn;
- linkEarned;
- linkSpent;
- linkCarryOut or final Link balance.

This allows docs to be generated from actual trace facts rather than narrative assumptions.

## Required Deterministic Checks

### Energy Policy Semantics

1. CONSERVE and COMMIT do not share an unconditional identical auto-cast path.
2. CONSERVE Energy behavior is explicit.
3. COMMIT Energy behavior is explicit.
4. controlled SAVE and SPEND fixtures start from identical formation, enemy, HP, and Energy state.
5. SAVE spends 0 in the controlled fixture.
6. SPEND spends at least 1 when the heal threshold is reached.
7. SAVE carry-out is greater than SPEND carry-out.
8. successful SPEND casts consume exactly 1 each.
9. when healing is useful, SPEND ending roster HP is greater than or equal to SAVE.
10. neither result contains winner / score / ranking semantics.

### Link Evidence

11. COMMIT Wave 2 assisted consolidation spends exactly 1 Link Shard.
12. total Link earned across trace is derived from per-Wave rewards.
13. total Link spent is derived from actual consolidation results.
14. final Link balance satisfies:
    carry + earned - spent = remaining
    subject to Run cap clamping.
15. documentation values match actual trace output.

### Divergence Evidence

16. `comparison.divergences.length >= 3`.
17. documented divergence count equals actual array length.
18. if Run Status is listed as divergence, actual final statuses differ.
19. no duplicate divergence categories.
20. no winner semantics.

### Production Constants

21. imported production Active Squad cap equals 4.
22. harness active deployment never exceeds imported cap.
23. Formation Grid remains 18 positions.
24. no fake always-true cap helper remains.

### Simulation Timing

25. code/docs treat `SIMULATION_STEP = 0.1` as 100 ms.
26. any max-step comment is mathematically correct.
27. changing timing comments does not change deterministic Battle behavior.
28. historical V14E trace executes deterministically after hardening.

## Repo Documentation Truth

Update operational docs so current status is:

```text
P1-V14E
= implementation exists
= deterministic harness exists
= evidence hardening required

P1-V14E.1
= active corrective validation slice

Live A–H
= not recorded

V14
= Experimental / not adopted
```

Correct the V14E remote implementation SHA to:

```text
33dbaa1f3ac684c5785c8b863383f4b6cad8cf47
```

Do not preserve the incorrect full SHA from the prior report.

## Regression Boundary

Preserve all production gameplay mechanics:
- V14A Wave sequence;
- B.1/B.2 RunRoster / HP / KO / Reserve;
- B.3 STAR;
- C.1 Combo quality;
- C.2 Link Shard;
- C.1a first-match timing;
- C.1a.1 timer terminal state;
- D Persistent Energy.

Do not change:
- STAR multipliers;
- signature values;
- Energy heal amount;
- Link thresholds;
- Energy cap rules;
- enemy stats;
- Wave fixtures;
- Active Squad cap;
- Formation Grid;
- puzzle rules.

## Non-Goals

Do NOT implement:
- Energy storage cap;
- Energy decay;
- new Energy effects;
- Energy Combo;
- Squad Capacity upgrades;
- new Wave fixtures;
- difficulty rebalance;
- revive;
- items / equipment;
- economy / shop;
- meta progression;
- broad UI redesign.

## Live Validation

No new live scenarios are required before the deterministic correction lands.

After E.1 deterministic closeout, existing V14E Live A–H remain the owner browser gate.

If browser evidence is not available:
- report `LIVE A–H NOT RECORDED`;
- do not infer live PASS from harness output.

## Exit Gate

Required:
- explicit policy-owned Energy semantics;
- controlled SAVE vs SPEND evidence;
- exact Link earned/spent/final accounting;
- divergence docs match actual harness output;
- production squad cap check replaces fake helper;
- simulation timing wording is correct;
- `npm run check` exits 0;
- `npm run build` exits 0;
- Live A–H remain open unless actually observed.

Then STOP for owner review.

P1-V14E.1 adds no gameplay mechanic and does not adopt V14.
