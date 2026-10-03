# P1-V14B.3 — STAR Consolidation / Power Density

Status: **Active Experimental design/implementation slice / not adopted**

## Repository-only agent rule

Coding agents must work from repository-local sources for this slice.

Read:

1. `docs/CURRENT_REPO_HANDOFF.md`
2. `AI_INSTRUCTIONS.md`
3. this file
4. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
5. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
6. current code/tests

**Do not query Notion MCP during normal implementation work.**

## Owner authorization

The owner explicitly authorized starting P1-V14B.3 after establishing the V14B roster/attrition foundation.

This does **not** retroactively mark V14B.1/B.2 owner-live PASS.

Current known B.1/B.2 status:
- core RunRoster implementation exists
- Active Squad cap = 4 Experimental fixture
- HP / KO persistence exists
- per-Wave deployment reset exists
- automated checks/build have passed for the implemented path
- owner-live A–H remains a separate evidence gate

## Current code finding — before B.3 implementation

The repository still uses greedy STAR conversion during Battle Setup.

Current path:

```text
BattleQueue count
→ StarConverter.bulk(...)
→ highestAffordable(...)
→ automatic highest STAR
```

Examples under the current code:

```text
3 copies
→ automatically 1 × 2★

9 copies
→ automatically 1 × 3★
```

This means the player currently cannot choose:

```text
3 × 1★
vs
1 × 2★
```

That choice is the core blocker for the B.3 hypothesis.

## Core hypothesis

**Higher STAR = power density per Active slot.**

Desired trade-off:

### Breadth — several 1★ bodies
- more bodies
- wider lane coverage
- more independent attack instances
- more interception/engagement opportunities
- more Active slots consumed

### Density — higher STAR
- stronger individual body
- stronger durability/output per slot
- stronger existing signature per slot
- fewer bodies
- frees Active slots for other roles

Neither strategy should automatically dominate every relevant situation.

## Active Squad fixture

Keep:

```text
ACTIVE SQUAD CAP = 4
```

This remains an **Experimental validation fixture**, not an adopted final rule.

Do not implement Squad Capacity upgrades in B.3.

Important UX/system distinction:

```text
Run Roster size
≠ Active Squad capacity
≠ Formation Grid capacity
```

## STAR cost structure

Keep the existing conceptual costs:

```text
1★ = 1 copy
2★ = 3 × 1★
3★ = 3 × 2★ = 9 × 1★
```

Do not change 1 / 3 / 9 in this slice.

## Required recruitment change

Stop automatic greedy consolidation.

New Beast Rush recruitment should initially create separate 1★ Run Unit instances.

Example:

```text
beast-a ×3
→ run-11 beast-a 1★
→ run-12 beast-a 1★
→ run-13 beast-a 1★
```

The player may then choose whether to consolidate.

## Manual consolidation rule

Initial minimal rule:

### 1★ → 2★
Requires:
- 3 ready
- same beastId
- same STAR = 1
- all in Reserve / not deployed

### 2★ → 3★
Requires:
- 3 ready
- same beastId
- same STAR = 2
- all in Reserve / not deployed

### 3★
- max STAR
- cannot consolidate further

KO units cannot be ingredients.

Deployed units cannot be ingredients.

No split/downgrade in this experiment.

## Deterministic instance identity

Preferred strategy:
- keep one deterministic primary instance ID
- consume the other two
- unrelated Run Unit IDs never change

Example:

```text
run-11 1★
run-12 1★
run-13 1★

→ consolidate

run-11 2★
run-12 removed
run-13 removed
```

Use stable roster order / lowest run serial unless the current implementation has a safer deterministic convention.

## HP / attrition rule

Consolidation must not become a free heal.

Preserve aggregate health condition.

Conceptually:

```text
combinedCurrentHp = hpA + hpB + hpC
combinedMaxHp     = maxA + maxB + maxC
healthRatio       = combinedCurrentHp / combinedMaxHp

targetCurrentHp   = targetMaxHp × healthRatio
```

Clamp safely and use deterministic rounding.

KO cannot be converted into living HP.

## STAR stat profile

Current repo evidence shows duplicated STAR scaling:
- RunRoster uses 1.0 / 1.8 / 3.2
- AutonomousBattleModel also uses STAR scaling

B.3 should centralize STAR stat multipliers into one gameplay source of truth.

Initial Experimental values remain:

```text
1★ = 1.00
2★ = 1.80
3★ = 3.20
```

Do not jump to 3× / 9× raw stats.

Required principle:

```text
1 × 2★ raw body value
<
3 × 1★ aggregate raw body value
```

The 2★ advantage is slot density, not superior aggregate raw value.

## Signature scaling hypothesis

STAR should strengthen the existing signature without changing its identity.

Keep existing signature mapping:
- Tanker → Guardian Brace
- Assassin → Ambush Strike
- Ranger → Focus Shot
- Mage → Arcane Bloom

Suggested Experimental B.3 values:

### Guardian Brace
Shield scale:
- 1★ = 1.00
- 2★ = 1.30
- 3★ = 1.65

Keep duration unchanged.

### Ambush Strike
Damage multiplier:
- 1★ = 1.55
- 2★ = 1.75
- 3★ = 2.00

Keep targeting identity unchanged.

### Focus Shot
Damage multiplier:
- 1★ = 1.50
- 2★ = 1.70
- 3★ = 1.95

Keep hold threshold unchanged.

### Arcane Bloom
Splash multiplier:
- 1★ = 0.50
- 2★ = 0.65
- 3★ = 0.80

Keep radius and secondary target limit unchanged.

These values are Experimental fixtures, not adopted balance.

## Minimal Battle Setup UX

Use the selected-unit / inspector area.

For an eligible Reserve unit:

```text
Snowguard
TANKER
★

HP 80 / 80
SAME-COPY READY: 3

[CONSOLIDATE → ★★]
Requires 3 × ★
```

If insufficient:
- disabled action
- show missing-copy requirement

For 3★:
- show MAX STAR

Minimum trade-off preview:

```text
3 × ★
→
1 × ★★

Frees 2 Active Slots
```

Do not create final STAR evolution art yet.

## Validation fixtures

Compare controlled strategies against existing deterministic threats:

1. Frontline Pressure
2. Backline Dive
3. Protected Ranged

### Breadth example
```text
3 × Tanker 1★
+ Ranger 1★
= 4 / 4 Active
```

### Density example
```text
Tanker 2★
+ Ranger 1★
+ Mage 1★
+ Assassin 1★
= 4 / 4 Active
```

The goal is not to force one universal winner.

Pass signal:
- materially different strengths/trade-offs appear by threat/context

Fail signals:
- always consolidate immediately
- never consolidate

If one side dominates, report it instead of silently tuning around it.

## Required deterministic coverage

At minimum cover:

### Recruitment
- 1 copy → one 1★ instance
- 3 copies → three separate 1★ instances before manual consolidation
- 9 copies → nine separate 1★ instances before manual consolidation
- later Wave recruits do not auto-merge

### Consolidation
- insufficient copies rejected
- mixed beastId rejected
- mixed STAR rejected
- deployed ingredient rejected
- KO ingredient rejected
- 3 × 1★ → exactly one 2★
- 3 × 2★ → exactly one 3★
- 3★ cannot upgrade
- unrelated instances unchanged
- no duplicates / no stale formation references

### HP
- full-health inputs → full-health target
- injured inputs preserve aggregate health ratio
- no free heal
- upgraded HP persists across Waves
- Restart clears upgraded run state

### Power density
- one source of truth for STAR stat multiplier
- RunRoster/Battle max HP agree
- Battle damage uses the same STAR profile
- 2★ raw HP/damage < aggregate 3 × 1★
- 3★ raw HP/damage < aggregate 9 × 1★

### Signatures
- 2★ signature strength > 1★
- 3★ > 2★
- signature identity/timing conditions remain unchanged
- historical 1★ V13 behavior remains regression-protected

### Squad rules
- Active cap remains 4
- 2★ consumes one slot
- 3★ consumes one slot
- STAR never changes Formation Grid size
- Squad Capacity upgrade remains not started

## Live validation

Required live evidence:

### A — Player choice exists
Three identical copies appear as three 1★ units.
Player may leave separate or consolidate.

### B — Breadth
Deploy several 1★ bodies and verify independent bodies/coverage/actions.

### C — Density
Consolidate to 2★ and use freed slots for other roles.

### D — Injured consolidation
Verify health-ratio preservation and no heal exploit.

### E — STAR persists
Upgrade, Battle, finish injured, next Wave keeps same STAR + exact HP.

### F — Signature scaling
Compare controlled 1★ vs 2★ signature effect.

### G — Situationality
Run Breadth vs Density against Frontline / Dive / Protected Ranged and record metrics.

## Non-goals

Do not implement:
- Squad Capacity upgrade
- Combo redesign
- Link Shard
- Energy persistence
- new Tactical Energy types
- revive
- post-Wave recovery
- items / equipment / traits
- economy
- meta progression
- procedural Waves
- final STAR evolution art

## Exit gate

Required:
- deterministic B.3 checks pass
- historical relevant regressions pass
- `npm run check` exits 0
- `npm run build` exits 0
- Live A–G evidence recorded
- no silent scope expansion

Then stop.

Do not start V14C automatically.
