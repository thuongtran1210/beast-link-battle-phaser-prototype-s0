# P1-V14A — Multi-Wave Run Structure

Status: **Active Experimental implementation slice / not adopted**.

Read first:

- `AI_INSTRUCTIONS.md`
- `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`

## Goal

Add only the structural multi-Wave run needed for later resource-commitment experiments.

V14A does not prove Beast Reserve, STAR consolidation, Combo redesign or Energy persistence.

It creates the run skeleton required to test those later.

## Target flow

```text
RUN START

Wave 1
Beast Rush
→ Energy Rush
→ Battle Setup
→ Battle
→ Wave Result

Wave 2
Beast Rush
→ Energy Rush
→ Battle Setup
→ Battle
→ Wave Result

Wave 3
Beast Rush
→ Energy Rush
→ Battle Setup
→ Battle
→ Final Result

Restart
→ fresh Run / Wave 1
```

## Wave fixture direction

Use deterministic existing archetype behavior.

### Wave 1 — Frontline Pressure

Purpose:

- establish normal frontline pressure
- expose Tank/frontline formation behavior

### Wave 2 — Backline Dive

Purpose:

- make backline protection relevant
- expose Diver pressure

### Wave 3 — Protected Ranged

Purpose:

- make Assassin access / lane choice relevant
- provide a distinct final tactical shape

Do not add new enemy archetypes.

## State requirements

Add a run-level Wave state such as:

- currentWaveIndex
- totalWaves
- currentWaveDefinition

Exact architecture should follow the repository's existing PhaseController/run-state conventions.

Do not put Wave state inside presentation code.

## Transition requirements

Non-final Battle win:

```text
Battle
→ Wave Result
→ next Wave Beast Rush
```

Final Battle win:

```text
Battle
→ Final Result
```

Loss behavior should remain simple and deterministic.

Do not create revive/meta-progression systems.

## Wave Result

Wave Result is not the same as Final Result.

Minimum information:

- Wave cleared
- current Wave / total Waves
- next Wave transition / continue action if needed

Do not turn Wave Result into a reward economy in V14A.

## Resource behavior in V14A

Do not introduce new persistence semantics yet.

Keep current Beast/Energy behavior as close as possible to the existing implementation so the slice isolates **run structure**.

Any necessary reset/preserve choice required by existing architecture must be documented explicitly in the implementation report.

Do not silently invent V14B/V14D behavior.

## UI

Only add the minimum Wave identity needed for testing.

Examples:

- WAVE 1 / 3
- FRONTLINE PRESSURE
- WAVE CLEARED

Do not use V14A to redesign the entire Battle Setup.

P1-V13A.1D remains deferred UX debt.

## Deterministic checks

Add a dedicated V14A check suite.

Minimum coverage:

1. run starts at Wave 1
2. Wave 1 uses Frontline Pressure definition
3. Wave 1 win enters Wave Result
4. continue from Wave Result enters next Beast Rush
5. Wave index increments exactly once
6. Wave 2 uses Backline Dive definition
7. Wave 2 win enters Wave Result
8. Wave 3 uses Protected Ranged definition
9. final Wave win enters Final Result, not another Beast Rush
10. Restart returns to fresh Wave 1
11. no Wave state leaks across Restart
12. deterministic repeat produces identical Wave sequence
13. historical phase regressions still pass where applicable
14. V11/V13 combat behavior is unchanged by Wave structure
15. `npm run check` passes

## Live verification

### Live A — Full run

Complete:

Wave 1 → Wave 2 → Wave 3 → Final Result.

PASS if transitions are understandable and no manual source changes are required.

### Live B — Wave identity

Before each Battle, tester can identify which Wave is active and which enemy pressure is loaded.

### Live C — Different tactical pressure

Using the same general player squad, observe that the three Wave fixtures produce visibly different enemy behavior.

V14A does not need to prove reserve decisions yet.

### Live D — Restart

Final Result → Restart → fresh Wave 1.

No previous Wave state remains.

## Strict non-goals

Do not implement:

- persistent Beast Reserve
- Active Squad Limit
- STAR consolidation redesign
- STAR balance changes
- Combo redesign
- Link Shard
- Energy persistence
- Barrier / Overcharge / Burst
- persistent HP
- permanent death
- items
- traits
- economy
- procedural Wave generation

## Exit gate

V14A passes only when:

- Wave 1 → 2 → 3 flow works
- Wave Result and Final Result are distinct
- deterministic fixtures are correct
- Restart is clean
- existing combat logic is unchanged
- deterministic checks pass
- historical regressions remain valid
- `npm run check` passes
- `npm run build` passes
- Live A–D pass

After V14A, stop.

Do not start V14B automatically.
