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

The Battle runtime now uses **V2 simple chibi cutouts** for the full player and enemy roster. Legacy procedural/card visuals remain fallback-only.

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
- Press **K** from any phase to reset directly into the deterministic **V15A capture fixture** (capture-only, not part of the normal run).
- Press **L** from any phase to reset the same fixture and **start the V15A Hero Battle immediately** for capture.
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

## V15A runtime evidence checkpoint

Live screenshots now demonstrate real Signature execution rather than mockup-only intent:
- Focus Shot readable in Battle.
- Twin Volley II readable with multi-target trails.
- Arcane Bloom III trigger confirmed.
- Final Arcane Bloom hero-VFX pass implemented and CI-passed; one final live capture remains before freezing combat presentation.

Portfolio guidance:
- Use a **separate Signature hero frame** for unit identity.
- Use a **separate Tactical Energy frame** for READY / SUGGESTED / DISABLED. Do not force both systems to be perfectly readable in the same paused screenshot.

## Final art direction lock — V2

Runtime evidence has now demonstrated the gameplay systems and the Battle character layer has migrated to **Simple Chibi Cutout V2**.

Final production rule:
```text
Battle Setup = cards / tactical information
Battle       = simple full-body cutouts
Action       = transform motion
Signature    = VFX-driven readability
```

Authoritative sources:
- `docs/BATTLE-ART-DIRECTION-V2.md`
- `docs/UNIT-PRODUCTION-BRIEF-V2.md`
- `docs/BATTLE-SPRITE-INTEGRATION-PLAN.md`

Current runtime state:
- 6 / 6 Beast base cutouts integrated;
- 3 / 3 enemy archetype cutouts integrated;
- player rectangular Battle cards removed in authored mode;
- enemy card tokens removed in authored mode;
- Attack / Hit / KO use transform profiles;
- Signature presentation keeps existing gameplay events + VFX;
- display scale / HP anchors / showcase declumping retuned for readability;
- M4 code/readability guard passed CI at run 163;
- repository remains green through run 165.

## Current capture gate

**V2-M4 live re-QA is still open.**

Before freezing portfolio screenshots/video:
- verify latest scale at 1280×720;
- verify no unreadable player/enemy overlap clusters;
- verify HP bars remain visually attached;
- verify backline silhouettes remain readable;
- capture one clean Battle frame after the M4 spacing pass.

After owner live PASS:
1. freeze final Battle presentation;
2. capture Signature hero frame;
3. capture Tactical Energy frame;
4. capture Setup / Reserve / threat frame;
5. capture Wave consequence frame;
6. update recruiter-facing Notion case study with runtime evidence.

No gameplay rule should change during this closeout.
