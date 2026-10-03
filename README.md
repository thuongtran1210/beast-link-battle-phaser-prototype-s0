# Beast Link Battle — Gameplay Development Build

Phaser + TypeScript implementation used to develop and validate the current **Beast Link Battle** gameplay.

The project uses one player-facing **GAME** flow plus an internal **TEST HARNESS**. Separate Prototype / Showcase runtime modes are no longer the project direction.

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

See `AI_INSTRUCTIONS.md` before implementation work.

For art / visual-asset work, use the separate art pipeline:

- Notion: **05 — Art Direction & AI Asset Style Lock — Cute Tactical Chibi**
- `ART_AGENT_INSTRUCTIONS.md`
- `art/style/STYLE_BIBLE.md`
- `art/style/STYLE_LOCK_PROMPT.md`
- `art/style/ASSET_QA_CHECKLIST.md`

The first art gate is **Snowguard / Tanker Master Reference → owner STYLE APPROVAL**. Do not mass-generate the roster before that gate.

## Current adopted structural flow

```text
Beast Rush
→ Energy Rush
→ Battle Setup / Beast Arrangement
→ Autonomous Battle + Timed Energy Cast
→ Result
→ Restart
```

Current Gameplay Spec v2 remains authoritative. Experimental variants do not change it automatically.

## Current implementation evidence

The build currently includes:

- 6×6 Onet matching
- Beast Queue + STAR **1 / 3 / 9**
- stored Energy
- Tanker / Assassin / Ranger / Mage roles
- 3×6 deployment grid used as starting formation
- autonomous model-space movement
- deterministic per-unit action timing
- Tank interception / engagement
- enemy Frontliner / Diver / Ranged archetypes
- formation counterplay validation
- combat readability feedback
- Experimental Beast signatures
- enemy-level validation tooling
- drag/reposition deployment interaction
- deterministic regression checks

### Closed tactical evidence

**P1-V11D — Tactical Formation Validation** is recorded as owner live PASS for the tested ruleset.

It demonstrated that formation can affect battle trajectory when enemy pressure and squad state are controlled.

### Still-open V13 work

**P1-V13A Beast Signature Identity**

Commit:

`7f7af78598e99cb18bbabb76c9cadc9c95de470f`

Experimental signatures:

- Guardian Brace
- Ambush Strike
- Focus Shot
- Arcane Bloom

Implementation exists; full manual signature A/B live validation is still open.

**P1-V13A.1D Deployment Workspace Redesign** remains **UI/UX FAIL / not passed**. It is currently deferred as UX debt rather than closed.

## New active direction — P1-V14

The next core-loop hypothesis is:

**P1-V14 — Multi-Wave Resource Commitment**

The current single-Battle loop exposes four strategic gaps:

1. Matching many Beast pairs can create enough player quantity to mask formation consequences.
2. Beast Queue has little reason to hold resources because there is no later Battle.
3. STAR 1 / 3 / 9 does not yet clearly show when one higher-STAR unit is preferable to several 1★ bodies.
4. Combo mainly increases matching opportunity / quantity and does not yet have a distinct strategic role.

### Experimental V14 roadmap

```text
V14A — Multi-Wave Run Structure
↓
V14B — Beast Reserve + Active Squad Limit + STAR Consolidation
↓
V14C — Combo Rework: Preparation Efficiency
↓
V14D — Persistent Energy / Save-vs-Spend
```

None of these are adopted gameplay rules yet.

## Active gate — P1-V14A

**P1-V14A — Multi-Wave Run Structure** is the next implementation slice.

Structure only:

```text
Wave 1
Beast Rush → Energy Rush → Battle Setup → Battle → Wave Result
↓
Wave 2
Beast Rush → Energy Rush → Battle Setup → Battle → Wave Result
↓
Wave 3
Beast Rush → Energy Rush → Battle Setup → Battle → Final Result
```

Initial validation pressure direction:

- Wave 1 — Frontline Pressure
- Wave 2 — Backline Dive
- Wave 3 — Protected Ranged

Do not implement V14B/V14C/V14D in the same slice.

Specifically defer:

- persistent Beast Reserve
- Active Squad Limit
- STAR consolidation redesign
- Combo reward redesign
- persistent Energy
- persistent HP / death attrition
- new Tactical Energy skills

## V14 design direction

### STAR

Higher STAR is being explored as **power density per active slot**.

Desired future trade-off:

- several 1★ units → breadth, bodies, lane coverage
- one higher-STAR unit → concentration, durability/output/signature strength, slot efficiency

Exact active-squad size is not locked.

### Combo

Future V14C direction:

- phase time independent from Combo
- match count → quantity
- Combo quality → efficiency / quality

Candidate Beast/Energy Combo rewards are intentionally not locked yet.

### Energy

Future V14D direction:

- preserve Energy across Waves
- create **spend now vs save for later**

This should be tested before adding many new Energy spell types.

## GAME vs TEST HARNESS

### GAME

Player-facing flow. Enemy formation is readable but read-only.

### TEST HARNESS

Internal designer/developer tooling around the same combat systems.

It may author deterministic enemy scenarios, but it must never become player-facing gameplay.

Both must feed the same `EnemyFixture[] → AutonomousBattleModel` path.

## Run locally

```bash
npm install
npm run check
npm run build
npm run dev
```

## Development discipline

- Current Gameplay Spec v2 remains the design source of truth.
- V14 is Experimental until evidence supports explicit adoption.
- Keep implementation evidence separate from live verification and design adoption.
- Do not infer gameplay rules from this README.
- Do not mark deferred V13 UX/signature gates as passed.
