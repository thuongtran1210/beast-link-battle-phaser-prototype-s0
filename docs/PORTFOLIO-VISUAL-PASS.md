# Portfolio Visual Pass — Runtime Vertical Slice

Status: **ACTIVE / PRESENTATION-ONLY / NO GAMEPLAY RULE CHANGES**

Date: 2026-10-07

## Goal

Bring the existing Phaser validation prototype to a portfolio-ready runtime state so screenshots/video can demonstrate the actual design rather than relying on Canva mockups.

The target is a clean five-screen vertical slice:

```text
Beast Rush
→ Energy Rush
→ Battle Setup
→ Tactical Battle
→ Wave Result
```

## Guardrail

This pass must not add new gameplay systems, rebalance V14 mechanics, or silently adopt Experimental rules.

```text
visual polish
≠ gameplay adoption
```

Procedural unit portraits and enemy silhouettes are **runtime placeholder art for portfolio readability**, not final production character art.

## Implemented in this pass

- Cute Tactical Chibi-aligned HUD palette tokens.
- Procedural Beast portraits replacing emblem-only unit badges.
- Procedural enemy archetype silhouettes for Frontliner / Diver / Ranged.
- Battle Setup now shows enemy archetype visuals alongside threat stats.
- Battle runtime now shows enemy silhouettes instead of text-only enemy boxes.
- Player Beast portraits enlarged in Setup/Battle for stronger unit identity.
- Beast puzzle tiles no longer expose internal A/B/C implementation letters.
- Beast Rush queue now uses canonical Beast display names.
- Energy Rush player copy simplified for capture/readability.
- Wave Result now exposes:
  - Fresh roster bodies;
  - Injured roster bodies;
  - KO bodies;
  - remaining HP;
  - STAR tier;
  - Energy carry-out;
  - Link Shard carry-out;
  - next threat.
- Top HUD includes Wave Result in the visible phase flow.
- GitHub Actions validation workflow added for `npm run check` + `npm run build`.

## Runtime capture controls

For portfolio capture:

- Press **O** to toggle Showcase Mode.
- Press **P** during Battle to pause/resume the simulation at a readable skill moment.
- Press **C** while Showcase Mode is active to hide/show the global top HUD.
- Press **K** in Battle Setup while Showcase Mode is active to load the deterministic **V15A capture fixture** (capture-only, not part of the normal run).
  - The fixture now also loads a capture enemy cluster with low damage and higher HP so Signature VFX have time to read.
  - Tactical Energy cast feedback is anchored below the right HUD instead of covering the battlefield.

Showcase Mode also suppresses Battle Setup harness controls so screenshots do not expose presets, fixture cycling or enemy-edit tools.

## Capture gate

Do not call the runtime showcase-ready until live QA confirms at 1280×720:

1. Beast Rush portrait readability and READY → first-match timer state.
2. Energy Rush tactical identity readability.
3. Battle Setup:
   - Active Squad vs Reserve;
   - Fresh/Injured/KO;
   - Enemy Frontliner/Diver/Ranged;
   - Stored Energy;
   - one clear START BATTLE CTA.
4. Tactical Battle:
   - Beast/enemy silhouettes remain readable during movement;
   - MEND / RESCUE / BREAK / PIERCE;
   - READY / SUGGESTED / DISABLED;
   - actual-target cast feedback.
5. Wave Result:
   - Fresh/Injured/KO consequence summary;
   - Energy carry;
   - next threat;
   - PREPARE NEXT WAVE.

## Still open

- Live browser visual QA after this code pass.
- Fix any overflow / overlap discovered at 1280×720.
- Decide whether procedural portraits are sufficient for final portfolio capture or whether 4 authored Beast master portraits should replace them.
- Capture final runtime screenshots/video only after live QA.
