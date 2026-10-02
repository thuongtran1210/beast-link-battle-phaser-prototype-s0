# Beast Link Battle — Gameplay Validation Prototype

Lightweight Phaser prototype for validating the current **Puzzle → Queue → Resolution → Battle/Energy** gameplay loop.

This repository is intended for **design validation**, not as a replacement for the Unity implementation and not as a final visual target.

## Source of truth

Gameplay rules are defined outside this codebase in **Current Gameplay Spec v1**. This prototype maps those rules into a small web implementation.

Current baseline examples:

- `PUZ-001` — 6×6 board
- `MATCH-001` — Onet path with at most 2 turns
- `COMBO-002/003/004` — 5.0s initial / +0.3s / 5.0s cap
- `QUEUE-001` — Beast Match → +1 Queue
- `STAR-001` — 1 / 3 / 9 Queue → Star conversion
- `ENERGY-001/002` — +10 Energy / max 20

## Current milestone

### S0 — Project Shell

Implemented scaffold:

- Phaser + TypeScript + Vite project structure
- `ValidationScene`
- `RuleConfig`
- `GamePhase` + `PhaseController`
- placeholder 6×6 board shell
- baseline rule snapshot

No playable Onet matching exists yet.

## Run locally

```bash
npm install
npm run dev
```

## Next slice

**S1 — Onet Board**

- board model
- pair generation
- tile selection
- Straight / L / Z / U path validation
- logical outer border
- deadlock detection and reshuffle
