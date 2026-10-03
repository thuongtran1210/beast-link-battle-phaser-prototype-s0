# Beast Link Battle — Gameplay Development Build

Phaser + TypeScript implementation used to develop and validate the current **Beast Link Battle** gameplay.

The project now uses one player-facing **GAME** flow plus an internal **TEST HARNESS**. Separate Prototype / Showcase runtime modes are no longer the project direction.

## Source of truth

Gameplay rules are defined in Notion. Read these before changing gameplay behavior:

1. **00.0 — Current Project Handoff — Beast Link Battle**
2. **00 — Beast Link Battle — Current Gameplay Spec v2**
3. **00.2 — Decision Record — P1 Dual-Queue Core Loop**
4. **02 — Phaser Validation Prototype Spec — P1 Transition**
5. **02.1 — Phaser Implementation Matrix**
6. **02.4 — P1 Technical Scaffold — Dual Queue + Tactical Battle**
7. **03 — Validation Log — Beast Link Battle**
8. Current code

See `AI_INSTRUCTIONS.md` for the current implementation gate.

## Current GAME flow

```text
Beast Rush
→ Energy Rush
→ Battle Setup / Beast Arrangement
→ Autonomous Battle + Timed Energy Cast
→ Result
→ Restart
```

The current build includes:

- 6×6 Onet matching with ≤2-turn routing
- Beast Queue + STAR **1 / 3 / 9**
- stored Energy carried into Battle
- Tanker / Assassin / Ranger / Mage roles
- 3×6 deployment grid used as starting formation
- autonomous model-space combat after Battle starts
- deterministic per-unit action timing
- Tank interception / engagement
- enemy Frontliner / Diver / Ranged archetypes
- formation counterplay validation
- combat readability feedback
- Experimental Beast signatures
- Battle Setup level/enemy validation tooling
- drag/reposition deployment interaction
- deterministic regression checks

## Current status

### Closed tactical milestone

**P1-V11D — Tactical Formation Validation** is recorded as owner live PASS.

The current ruleset demonstrated that:

- same enemy + different formation can create different battle trajectories
- different enemy compositions create different formation pressure
- Tank placement can protect or expose the backline
- Assassin access changes against protected Ranged enemies
- formation value can emerge spatially without row/class damage bonuses

### Experimental Beast identity

**P1-V13A — Beast Signature Identity**

Commit:

`7f7af78598e99cb18bbabb76c9cadc9c95de470f`

Experimental signatures:

- Guardian Brace
- Ambush Strike
- Focus Shot
- Arcane Bloom

The implementation exists and deterministic checks were reported passing. Manual Tank / Assassin / Ranger / Mage A/B live verification remains open.

### Setup / test tooling

**P1-V13A.1 — Enemy Board & Level Harness**

`e3b64a09520a20e2b0d48d6a2fb7532d923e7d81`

**P1-V13A.2 — Drag & Drop Deployment UX**

`b94ce842f1573253f9f60f4e799a77aebeb75a4c`

These are implemented, but the current Battle Setup **has not passed UI/UX review**.

Current problems include:

- formation boards do not dominate the screen strongly enough
- enemy archetypes still read too much like debug data
- Beast dock and deployed state are not clear enough
- Stored Energy uses too much Setup space
- validation controls compete with player-facing information
- enemy scenario authoring is not yet efficient enough for signature testing

## Current active gate

**P1-V13A.1D — Deployment Workspace Redesign**

Goals:

- formation-first visual hierarchy
- compact Beast dock
- readable enemy tokens
- obvious drag/drop deployment
- one source of truth for board / dock / remaining count / Start Battle gating
- exact Front/Mid/Back × Lane 1–6 deployment readability
- internal Enemy Scenario Composer localized to TEST HARNESS only

Do **not** start P1-V13B Tactical Energy until the Setup UX gate and V13A live signature-testability gate are closed.

## GAME vs TEST HARNESS

### GAME

Player-facing flow.

Enemy formation may be inspected, but is read-only.

GAME must not expose:

- add/remove enemy controls
- archetype editing
- custom enemy quantity
- enemy scenario reset/clear tools
- validation presets
- internal debug authoring controls

### TEST HARNESS

Internal designer/developer tooling around the same GAME systems.

It may provide:

- level fixtures
- editable enemy scenario copies
- add/remove/change enemy archetypes
- exact deployment-slot authoring
- deterministic custom scenarios
- validation metrics

TEST HARNESS must feed the same `EnemyFixture[] → AutonomousBattleModel` combat path as GAME.

It is not a player feature.

## Run locally

```bash
npm install
npm run check
npm run build
npm run dev
```

There is currently no documented separate `dev:test` npm script in `package.json`. If an explicit Test Harness launch path is added, document it only after it exists in code.

## Development discipline

- Current Gameplay Spec v2 remains the design source of truth.
- Experimental variants are not automatically adopted gameplay rules.
- Distinguish code existence, deterministic checks, build success, owner live verification, real-player evidence, and adopted design.
- Do not infer gameplay rules from this README.
- Do not expose internal Test Harness authoring as GAME functionality.
