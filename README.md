# Beast Link Battle — Gameplay Validation Prototype

Lightweight **Phaser + TypeScript** prototype used to validate the current Beast Link Battle gameplay structure.

This repository is a **design-validation sandbox**. It is not the production Unity implementation and is not the final visual target.

## Source of truth

Gameplay rules are defined in Notion. The current design source is:

- **00 — Beast Link Battle — Current Gameplay Spec v2**

Implementation truth is tracked separately in:

- **02.1 — Phaser Implementation Matrix**
- **00.0 — Current Project Handoff — Beast Link Battle**

See `AI_INSTRUCTIONS.md` before making gameplay changes.

## Current P1 flow

```text
Beast Rush
→ Energy Rush
→ Battle Setup / Beast Arrangement
→ Autonomous Battle + Timed Energy Cast
→ Result
→ Restart
```

The active validation build includes:

- 6×6 Onet matching with ≤2-turn routes and outer-border routing
- deadlock recovery
- Beast Queue + STAR **1 / 3 / 9**
- stored Energy Queue
- Tanker / Assassin / Ranger / Mage prototype role mapping
- 3×6 pre-combat formation
- autonomous deterministic battle
- finite stored-Energy casting
- Experimental Frontline Heal
- P1 validation metrics + Result summary
- deterministic regression checks for P0 history and P1 slices/variants

## Current milestone

### Experimental P1-V3 — Extended Pre-Battle Timing

Implemented validation override:

- Beast Rush: **12.0s initial / +0.3s per valid match / 12.0s cap**
- Energy transition cue: **1.0s**
- Energy Rush: **12.0s countdown**
- Energy pair: **+1 stored charge**

P1-V3 is **Experimental** and is **not adopted** into Current Gameplay Spec v2.

Deterministic checks and production build are recorded as passing in project documentation. **P1-V3 live-browser verification passed by project-owner confirmation on 2026-10-02.** The current project gate is **P03 real-player validation**.

## Run locally

```bash
npm install
npm run check
npm run build
npm run dev
```

The verified validation flow is:

```text
BeastRush → EnergyRush → BattleSetup → Battle → Result → Restart → BeastRush
```

## Development discipline

Do not infer gameplay rules from this README. Read `AI_INSTRUCTIONS.md` and the canonical Notion sources before changing behavior.
