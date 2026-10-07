# Starcaller Authored Battle Art

Status: **M2 IMPLEMENTED / LIVE VISUAL QA NEXT**

This directory contains the first authored Beast art package used by the battle-sprite integration.

Runtime poses:
- `battle_idle.svg`
- `battle_attack.svg`
- `battle_signature.svg`
- `battle_hit.svg`
- `battle_ko.svg`

Additional source:
- `portrait.svg`

Direction:
- casual 2D chibi;
- lavender / celestial Mage identity;
- thick outline;
- transparent background;
- readable at small battle scale;
- orb / halo / star motif;
- 3/4 right-facing player presentation.

Why SVG in this milestone:
- the repository connector can author/review UTF-8 vector source directly;
- SVG gives clean scale testing at 1280×720;
- Phaser loads it as a normal texture through `load.svg`;
- the same art can later be exported to PNG without changing the manifest contract.

The authored art is presentation-only. It must not change combat behavior, STAR rules or Arcane Bloom semantics.


## Runtime transparency compatibility

Live QA initially exposed an opaque black square around the authored SVG texture on the target runtime.

Compatibility fix:
- authored SVG files now declare explicit `width`, `height` and `preserveAspectRatio`;
- SVG files are loaded through Phaser's normal image pipeline rather than the SVG raster-loader path;
- pose paths and gameplay-facing art contract remain unchanged.

This is a rendering fix only. No Battle rule, STAR behavior or Arcane Bloom logic changed.
