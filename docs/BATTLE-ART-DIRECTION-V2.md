# Battle Art Direction V2 — Simple Chibi Cutout

Status: **NEW SOURCE OF TRUTH / GAMEPLAY FROZEN / PRODUCTION RESET**

Date: 2026-10-07

## Owner clarification — 2026-10-08

Owner supplied a flat cartoon animal lineup and requested that level of simplicity. Use thick black contours, simple pill eyes, compact bodies, broad flat color regions and one clear role prop. Avoid the richer fur, accessories and illustrative shading of the first raster Snowguard candidates. The supplied lineup is a style reference, not permission to copy its character designs.

Reference: `art/beasts/snowguard/owner-style-reference-2026-10-08.png`. Snowguard V04 is the new candidate in `?art=preview`; owner image-level approval and live QA remain open. This direction clarification does not approve an entire generated roster.

## Why V2 exists

Live battle QA showed that the previous authored-character direction was too expensive and visually overbuilt for the scale of this prototype.

The new direction is intentionally simpler:

```text
simple shapes
+ thick outline
+ flat colors
+ strong silhouette
+ tween / transform animation
+ Signature VFX
```

The goal is not illustration complexity.

The goal is:
- instant readability at battle scale;
- fast production across the whole roster;
- low animation cost;
- consistency across Beast Rush / Setup / Battle;
- a style that fits Phaser and mobile-casual presentation.

The reference style is used for broad production principles only. Do not copy specific commercial characters, costumes, props or compositions.

---

# 1. Final style name

**Simple Chibi Cutout Battle Style**

Core characteristics:
- oversized head;
- compact body;
- simple arms/legs;
- thick dark outer outline;
- minimal face details;
- flat colors;
- one restrained shadow family;
- very limited texture detail;
- one primary role prop;
- one primary identity color;
- readable silhouette at small size.

---

# 2. Production philosophy

## Character art should be cheap to animate

Character art is not the animation.

Character art provides:
- silhouette;
- identity;
- prop;
- role fantasy.

Motion is provided by:
- scale;
- x/y transform;
- rotation;
- squash/stretch;
- tint/flash;
- VFX overlays.

## Core rule

```text
BASE CHARACTER = identity
TRANSFORM MOTION = action
VFX = power / Signature readability
```

Do not bake every gameplay action into a unique high-detail pose unless clearly necessary.

---

# 3. Runtime asset model

## Required per Beast

```text
base.png
icon.png
```

## Optional

```text
signature.png
ko.png
```

## Skill FX

Separate from character art:

```text
fx_attack.*
fx_signature.*
fx_hit.*
```

A Beast must remain fully playable when optional art is absent.

---

# 4. Animation policy

## Idle

Use:
- vertical bob 2–4 px;
- scale 1.00 ↔ 1.025;
- slight rotation where personality allows.

Do not:
- require dedicated idle frame animation.

## Basic Attack

Use:
- anticipation;
- forward nudge/dash;
- small scale stretch;
- projectile or impact FX;
- return to anchor.

Typical duration:
- 180–320 ms.

## Hit

Use:
- 6–10 px recoil;
- 0.92–0.96 squash;
- white/red flash;
- short shake.

Typical duration:
- 120–220 ms.

## KO

Use:
- rotate 60–90°;
- drop Y slightly;
- squash;
- optional alpha fade or persistent defeated state.

Dedicated `ko.png` is optional.

## Signature

Signature gets the strongest presentation:
- larger scale anticipation;
- clearer pause;
- dedicated VFX;
- optional `signature.png` if a unique body pose materially improves readability.

Do not create extra art if VFX + transform already communicates the Signature.

---

# 5. Motion profiles

Instead of bespoke animation code per Beast, use reusable profiles.

## TANK

Used by:
- Snowguard

Language:
- slow bob;
- low recoil;
- short shield shove;
- stable ground anchor;
- defensive pulse.

## BRUISER

Used by:
- Ironclad

Language:
- heavy anticipation;
- stronger forward dash;
- larger impact shake;
- low-frequency idle motion.

## MAGE

Used by:
- Starcaller

Language:
- subtle float;
- low-amplitude rotation;
- cast anticipation;
- orb/aura movement;
- larger Signature VFX.

## RANGER_FAST

Used by:
- Swiftwing

Language:
- quick bob;
- short rapid recoil;
- quick attack snap;
- twin projectile FX.

## RANGER_FOCUS

Used by:
- Windstrider

Language:
- calm idle;
- small anticipation hold;
- precise forward shot;
- narrow charged projectile.

## ASSASSIN

Used by:
- Shadowclaw

Language:
- crouched/angled idle;
- fast dash;
- high rotation/lean;
- slash trail;
- fast return.

---

# 6. Unit identity rules

Each Beast must be distinguishable by:

1. silhouette;
2. primary color;
3. prop;
4. motion profile;
5. Signature VFX.

Do not rely on:
- name label;
- role label;
- card border;
- debug text.

---

# 7. Beast production direction

## Snowguard

Role: Tanker / Protector

Identity:
- wide body;
- large shield;
- friendly face;
- gold / cream / pale blue.

Primary prop:
- shield.

Motion:
- TANK.

Signature:
- Guardian Brace.

Signature presentation:
- shield scale-up;
- blue/gold barrier;
- brief body compression;
- ally-protection pulse at higher STAR.

---

## Ironclad

Role: Tanker / Disruptor

Identity:
- square/heavy body;
- forward-loaded helmet/armor;
- steel blue / cyan / dark navy.

Primary prop:
- heavy gauntlet / ram armor / impact plate.

Motion:
- BRUISER.

Signature:
- Iron Ram.

Signature presentation:
- lean forward;
- rapid short charge;
- cyan impact burst;
- screen/target shake.

Critical contrast:
- Ironclad must not look like Snowguard with different colors.

---

## Starcaller

Role: Mage

Identity:
- small body;
- halo/orb;
- lavender / violet / pale gold.

Primary prop:
- floating orb / star halo.

Motion:
- MAGE.

Signature:
- Arcane Bloom.

Signature presentation:
- source scale-up;
- caster aura;
- multi-target purple bloom;
- 3★ Echo gold pulse.

Critical rule:
- Starcaller must read as magic without a role label.

---

## Swiftwing

Role: Fast Ranger

Identity:
- light body;
- wing/feather accents;
- pink / magenta / cream.

Primary prop:
- twin darts / paired feather shots.

Motion:
- RANGER_FAST.

Signature:
- Twin Volley.

Signature presentation:
- quick double recoil;
- two magenta projectiles;
- multiple-target trail.

Critical contrast:
- motion must feel faster than Windstrider.

---

## Windstrider

Role: Precision Ranger

Identity:
- upright, narrow shape;
- emerald / teal / cream;
- ranged weapon / wind-arrow motif.

Primary prop:
- bow / focus emitter.

Motion:
- RANGER_FOCUS.

Signature:
- Focus Shot.

Signature presentation:
- short aim hold;
- narrow green charge line;
- strong single precision projectile.

Critical contrast:
- calm precision vs Swiftwing speed.

---

## Shadowclaw

Role: Assassin

Identity:
- angled/crouched silhouette;
- orange / dark coral / burgundy;
- claw / short blade.

Primary prop:
- claw / dagger.

Motion:
- ASSASSIN.

Signature:
- Ambush Strike.

Signature presentation:
- rapid forward/deep-target dash;
- coral slash trail;
- optional secondary strike at higher STAR.

---

# 8. STAR art rule

Do not build three separate character costumes.

STAR differences should primarily come from:
- VFX intensity;
- number of trails;
- aura size;
- secondary impact;
- Signature behavior.

Optional small art accents:
- 2★ small trim/glow;
- 3★ crest/halo enhancement.

Do not:
- change the Beast into a different character;
- change primary palette;
- multiply production workload by 3.

---

# 9. Setup vs Battle

## Setup

Use:
- portrait/card;
- role;
- STAR;
- Signature text;
- tactical information.

## Battle

Use:
- simple cutout character;
- compact HP;
- optional small STAR mark;
- transform motion;
- VFX.

No rectangular Battle card body in final showcase.

---

# 10. Enemy direction

Enemies use the same simple-cutout language.

## Frontliner
- wide;
- blocky;
- shield/armor;
- red/coral.

## Diver
- triangular;
- angled forward;
- violet/red.

## Ranged
- narrow;
- visible ranged prop;
- cyan/blue.

Enemy detail should remain below player Beast detail.

---

# 11. Technical art guardrails

- Transparent background.
- Keep a stable feet/ground anchor.
- Avoid baked shadows that fight runtime ground shadows.
- Avoid baked UI.
- Avoid text.
- Avoid very fine detail.
- Keep props readable when downscaled.
- Prefer one clean base image over a five-pose sheet.

---

# 12. Definition of Done

V2 art direction is successful when:

- all six Beasts read at battle scale;
- characters can animate convincingly using transforms;
- only Signature VFX carries high visual complexity;
- Snowguard/Ironclad are clearly different;
- Swiftwing/Windstrider are clearly different;
- Starcaller reads as Mage;
- Shadowclaw reads as Assassin;
- asset count per Beast is low;
- no gameplay semantics changed;
- battle looks like a coherent casual-mobile game rather than a test harness.

---

# 13. Superseded direction

The previous pose-heavy authored package remains useful as reference material but is no longer the production target.

Deprecated as default requirement:
- mandatory idle pose image;
- mandatory attack pose image;
- mandatory hit pose image;
- mandatory KO pose image;
- full five-pose sheet per Beast.

The preferred V2 target is:

```text
base
+ optional signature
+ optional ko
+ motion profile
+ VFX
```
