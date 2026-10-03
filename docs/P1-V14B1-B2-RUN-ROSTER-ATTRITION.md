# P1-V14B.1/B.2 — Run Roster, Partial Deployment & Attrition

Status: **Active Experimental implementation slice / not adopted**

## Read first — repository only

Coding agents must read:

1. `AI_INSTRUCTIONS.md`
2. `docs/CURRENT_REPO_HANDOFF.md`
3. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
4. this file
5. current code/tests

**Do not query Notion MCP for this implementation task.**

The repository docs have been synchronized for this slice.

## Implementation Evidence — 6d1f40b

GitHub main includes:

`6d1f40b2b4fe97d0b4e0b74e65fc74048acec4b1` — `fix(run): clear wave deployment while preserving roster`

Verified from the commit diff:
- Wave transition calls `formation.reset()` before rebuilding Setup.
- deployment slots are per-Wave only.
- Run Roster survives the Wave transition.
- deterministic checks cover:
  - deployment assignments cleared
  - roster count preserved
  - injured HP preserved
  - new recruit joins the same Reserve
  - placement-time rejection of a fifth active unit

Owner-reported command evidence:
- `npm run check` PASS
- `npm run build` PASS

**Status remains Active Experimental / not adopted.**
Live A–H are still required before B.1/B.2 can be marked owner-live PASS.

## Owner evidence

P1-V14A multi-Wave flow has been owner-confirmed as structurally correct enough to continue.

Two live blockers were observed:
1. Start Battle is locked until all available units are deployed.
2. units effectively return to the next Wave at full HP.

These prevent the intended resource-commitment experiment.

# Part A — V14B.1 Partial Deployment + Persistent Reserve

## Goal

Make `undeployed` a valid strategic state.

Battle Setup must allow the player to enter Battle with a legal subset of the available Run Roster.

## Readiness rule

Replace:
```text
all units deployed
→ Start Battle enabled
```

with:
```text
at least 1 legal, living unit deployed
AND formation state valid
AND active-squad limit not exceeded, if that fixture is enabled
→ Start Battle enabled
```

Do not require Reserve to be empty.

## Reserve behavior

Undeployed living units:
- stay in Run Reserve
- do not spawn in the current Battle
- remain available in the next Wave
- keep their stable instance identity and current HP

## Active Squad Limit

An Experimental finite limit may be introduced to create commitment pressure.

Preferred initial test fixture if the current architecture needs an explicit value:
```text
ACTIVE SQUAD LIMIT = 4
```

This is an **Experimental validation fixture**, not an adopted gameplay rule.

If the current implementation already has a cleaner finite-cap mechanism, reuse it and report the actual value.

## One source of truth

These must derive from the same run-roster/formation state:
- board occupancy
- Reserve contents
- active count
- Start Battle readiness
- KO availability

# Part B — V14B.2 Persistent Unit Identity + HP Attrition

## Goal

A Beast that fought in Wave N must remain the same Run Unit instance in Wave N+1.

Battle damage must create future opportunity cost.

## Required conceptual model

Adapt naming to current architecture, but the data boundary should be equivalent to:

```ts
interface RunUnitInstance {
  instanceId: string;
  beastId: string;
  star: number;
  maxHp: number;
  currentHp: number;
  status: "ready" | "ko";
}
```

## Stable deterministic IDs

Each Run Unit instance needs a deterministic stable `instanceId`.

Two units with the same beastId must still be individually distinguishable.

Do not key persistent HP only by `beastId`.

## Battle spawn

When a Run Unit is deployed:

```text
battle.currentHp = runUnit.currentHp
battle.maxHp     = runUnit.maxHp
```

Do NOT refill to maxHp at spawn.

## Battle reconciliation

When Battle ends, write surviving/defeated HP back to the correct Run Unit by stable instanceId.

```text
Run Unit
→ Battle Unit
→ battle resolves damage/heal
→ result reconciles by instanceId
→ Run Unit currentHp updated
```

Do not reconstruct the roster from role/beast counts after Battle.

## Cross-Wave persistence

Persist:
- stable instanceId
- beastId
- STAR
- maxHp
- currentHp
- KO status

## Per-Battle reset

Reset:
- target
- engaged target/by
- cooldowns
- windup/recovery
- current action state
- temporary shields
- Focus runtime charge
- Guardian Brace activation runtime
- Ambush used runtime
- Arcane Bloom cast/runtime state
- temporary buffs/debuffs
- battle metrics

## KO rule — initial experiment

If currentHp <= 0:
- status = KO
- currentHp = 0

KO units:
- remain visible in Run Roster/Reserve
- cannot be deployed
- do not spawn
- do not automatically revive at next Wave

No free post-Wave recovery in this experiment.

## Healing implication

Existing in-Battle Heal may affect future Wave value because the reconciled HP persists.

Do not add new Energy effects.
Do not add a post-Wave heal.

# Wave transition behavior

For non-final Wave clear:

```text
Battle ends
→ reconcile player unit HP into Run Roster
→ clear Battle-only runtime state
→ clear ALL deployment / formation slot assignments
→ Wave Result
→ next Beast Rush / preparation
→ preserve surviving Run Roster
→ add new recruits into the same Run Roster
→ Battle Setup starts ACTIVE 0 / 4
→ player deliberately selects the next Active Squad
```

Core rule:

```text
PERSIST UNIT BODY STATE
DO NOT PERSIST DEPLOYMENT STATE
```

Persist: instance ID, beast identity, STAR, current HP, KO.
Reset each Wave: active membership, formation slot, grid position.

V14A originally reset per-Wave Beast resources to isolate structure.

B.1/B.2 intentionally change **player Run Roster persistence** now.

Do not accidentally introduce unrelated Energy persistence.

# Recruitment integration

Inspect the current BeastQueue → StarConverter → BattleFormation path.

Do not duplicate conversion logic.

The new run-roster layer should sit at the smallest stable boundary after the current recruitment/conversion output.

If the current flow auto-converts queue counts into STAR units, preserve that behavior for now.

Do not redesign STAR conversion in B.1/B.2.

Newly created unit instances must get deterministic stable IDs.

# UI requirements — minimal but testable

Do not perform the deferred full V13A.1D redesign.

Add only what is necessary:
- Active Squad count
- Reserve remains visibly populated when Start Battle is enabled
- each Reserve/deployed unit shows current HP clearly enough to compare injured vs fresh
- KO units show `KO` and are not draggable/deployable
- Start Battle reason reflects actual legality, not “Deploy all Beasts”

# Deterministic checks

Minimum required coverage:

1. Start Battle disabled with 0 deployed living units.
2. Start Battle enabled with 1 legal deployed living unit.
3. Reserve may remain non-empty when Start Battle is enabled.
4. Active Squad Limit rejects an over-cap formation if cap is enabled.
5. Undeployed unit does not spawn in Battle.
6. Undeployed unit remains in Reserve after Wave.
7. Stable instance IDs are unique for duplicate beastIds.
8. Stable instance ID does not change across Wave transition.
9. Battle spawn uses persistent currentHp, not maxHp.
10. Damage reconciles to the correct Run Unit after Battle.
11. Heal reconciles to the correct Run Unit after Battle.
12. Two same-beast units may retain different HP values.
13. Living injured unit remains deployable next Wave.
14. KO unit remains in roster but is unavailable.
15. KO unit cannot be dragged/deployed.
16. KO unit does not spawn.
17. No automatic full heal occurs on Wave transition.
18. Temporary shield does not persist to next Battle.
19. target/engagement/cooldown/action state does not persist.
20. signature runtime flags reset for a fresh Battle.
21. Reserve/deployed movement never duplicates a unit instance.
22. Return-to-reserve happens exactly once.
23. Restart creates a fresh Run Roster with no prior HP/KO leakage.
24. V14A Wave sequence regression remains green.
25. V13 signature deterministic regressions remain green.
26. V11 tactical regressions remain green.
27. historical relevant checks remain green.
28. `npm run check` passes.

# Live validation

## Live A — partial deployment
Have more living Beasts available than deployed.
PASS if Reserve remains populated, Start Battle is enabled, and Battle starts.

## Live B — held unit
Keep a fresh Beast in Reserve for Wave 1.
PASS if it does not appear in Wave 1 Battle and is available next Wave.

## Live C — injured veteran
Deploy Beast A in Wave 1 and finish injured.
PASS if next Wave shows the same instance with the same remaining HP.

## Live D — injured vs fresh choice
Have one injured deployable Beast and one fresh Reserve Beast.
PASS if either can intentionally be chosen.

## Live E — KO
Let a deployed Beast reach 0 HP.
PASS if next Wave shows KO, blocks deployment, and does not revive it.

## Live F — temporary state reset
PASS if persistent HP remains but temporary Battle state is fresh.

## Live G — same Beast duplicates
Create two same-beast instances with different HP.
PASS if they remain distinct without HP cross-write.

## Live H — Restart
PASS if a fresh run has no prior HP/KO/instance state leakage.

# Strict non-goals

Do NOT implement:
- STAR stat rebalance
- manual STAR consolidation UI
- Link Shard
- Combo redesign
- Energy cross-Wave persistence redesign
- Barrier / Overcharge / Burst
- revive
- resting/recovery
- post-Wave healing reward
- items / traits / economy
- procedural Waves
- full Battle Setup visual redesign

# Exit gate

B.1/B.2 passes only when:
- partial deployment works
- non-empty Reserve can coexist with enabled Start Battle
- units have stable identity
- HP persists accurately
- injured vs fresh choice is visible
- KO persists and blocks deployment
- Battle-only runtime state resets
- no unit duplication/loss occurs
- Restart is clean
- deterministic checks pass
- `npm run check` exits 0
- `npm run build` exits 0
- Live A–H pass

Then stop.

**Do not start P1-V14B.3 STAR redesign automatically.**
