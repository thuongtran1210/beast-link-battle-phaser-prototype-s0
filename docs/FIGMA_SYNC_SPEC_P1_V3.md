# Beast Link Battle — Figma Sync Spec — P1 Baseline + P1-V3 Boundary

> Status: Active sync target. Direct Figma canvas work is currently blocked by the Figma MCP Starter-plan tool-call limit.
> Target Figma file: `Yxh9JPjptanUgg65Ze7eSR`
> Source of truth remains Notion Current Gameplay Spec v2 + Phaser Implementation Matrix.

## Current structural baseline to visualize

```text
Beast Rush
→ Energy Rush
→ Battle Setup / Beast Arrangement
→ Autonomous Battle + Timed Energy Cast
→ Result
```

Figma is UX visualization only. It must not override the Current Gameplay Spec or present Experimental timing as adopted rules.

## Existing frame sync targets

### Gameplay UX Mockup — Beast Rush

Replace stale P0/Preparation meaning.

Required:
- phase label: `BEAST RUSH`
- Beast-only 6×6 board
- Beast Queue
- flow annotation: `Combo end → Energy Rush`
- Beast Rush builds Beast Queue; role meaning is realized later at Battle Setup

Do not present `Combo end → Resolution` as current.

### Gameplay UX Mockup — Battle Setup / Formation

Replace the old Resolution / individual-deploy meaning.

Required:
- STAR conversion: 1 / 3 / 9
- unit labels: Beast ID + Role + Star
- Front / Mid / Back formation rows
- Unplaced Units
- Stored Energy summary
- Start Battle disabled until all units are placed
- Start Battle locks formation and begins autonomous Battle

### Gameplay UX Mockup — Autonomous Battle + Timed Energy Cast

Replace the active-Battle Energy puzzle/gauge UI.

Required:
- no puzzle board during Battle
- Enemy HP
- locked formation
- Beast ID + Role + Star + current/max HP
- `CURRENT FRONTLINE`
- Stored Energy by Energy ID
- `CAST HEAL` actions for available charges
- autonomous battle status/tick
- Battle progresses with zero player input
- Frontline Heal only with an `Experimental` label

### Mechanic Visual — Onet Rules to Resource Output

Keep Straight / L / Z / U with ≤2 turns.

Current resource flow:
- Beast Rush valid match → +1 BeastQueue → Combo
- Energy Rush valid match → +1 EnergyQueue charge (Experimental conversion)
- Battle Setup → BeastQueue through STAR 1/3/9 → role-readable units → formation
- Active Battle → consume pre-collected Energy at a chosen moment
- no Energy matching during active Battle

### Design Evolution

Present:
- Earlier concept / P0: active-Battle Energy puzzle or mixed-resource direction
- Current P1 structural baseline: Beast Rush → Energy Rush → Battle Setup → Autonomous Battle + Timed Energy Cast
- evidence boundary: structure is implemented as a validation prototype; player evidence is still being collected

Do not claim P1 is superior.

## Experimental P1-V3 area

Create a separate frame/card:

**Experimental P1-V3 — Extended Pre-Battle Timing**

Show:
- Beast Rush: 12.0s initial / +0.3s per valid Beast match / 12.0s cap
- Energy transition cue: 1.0s, non-interactive
- Energy Rush: 12.0s countdown
- valid Energy pair → +1 stored charge
- timeout → automatic Battle Setup with Stored Energy preserved
- live-browser gate passed by project-owner confirmation
- ready for P03 real-player validation

Mandatory label:

**EXPERIMENTAL — live verified for P03 — not adopted into Current Gameplay Spec**

Do not merge the 12s/1s/12s timing into the main P1 baseline mockups as an adopted rule.

## Archive boundary

- Main P1 frames = current intended structural baseline
- P1-V3 = current Experimental validation build for P03
- P1-V1 / P1-V2 = historical experimental evidence only if clearly marked prior/archive
- P0 frames = Archive — P0 / historical
- no final-art, final-timing, or production-balance claims

## Completion gate

- [ ] Beast Rush no longer says Combo → Resolution
- [ ] Battle Setup shows role/star formation + Stored Energy
- [ ] Battle frame has no puzzle board / active Energy gauge loop
- [ ] Resource-flow visual uses pre-Battle EnergyQueue
- [ ] Design-evolution frame identifies P1 as current structural baseline
- [ ] P1-V3 appears separately and is labeled Experimental · Live Verified for P03 · Not Adopted
- [ ] Old P0 visuals are archived / marked historical
- [ ] Screenshots confirm no contradictory current-flow labels remain

## Current access blocker — 2026-10-02

Connected Figma team: WCDi · Full seat · Starter tier.

Direct canvas/metadata access was retried and blocked by the Figma MCP Starter-plan tool-call limit before any read/write could execute. No canvas mutation occurred.
