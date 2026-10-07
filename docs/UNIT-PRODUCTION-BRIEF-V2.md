# Unit Production Brief V2 — Simple Chibi Cutout

Status: **READY FOR PRODUCTION**

Date: 2026-10-07

This document turns the V2 art direction into an executable asset checklist.

Source of truth:
- `docs/BATTLE-ART-DIRECTION-V2.md`

---

# 1. Shared production template

For each Beast:

## Required
- one transparent `base.png`;
- one `icon.png`;
- motion profile assignment;
- runtime anchor values;
- Signature VFX definition.

## Optional
- `signature.png`;
- `ko.png`.

## Acceptance
- readable at 1280×720 battle scale;
- recognizable without role/name labels;
- prop survives downscale;
- thick outline survives downscale;
- transform animation does not break ground anchor.

---

# 2. Snowguard

## Visual brief

Protector Tanker.

Shape:
- round/wide;
- compact legs;
- shield occupies 30–40% of silhouette width.

Palette:
- cream;
- gold;
- pale sky blue;
- dark outline.

Face:
- calm / dependable;
- simple eyes;
- minimal expression detail.

## Assets

Required:
- `base.png`
- `icon.png`

Optional:
- `signature.png` only if shield-brace silhouette needs extra clarity.
- `ko.png` optional.

## Motion

Profile: `TANK`

Idle:
- 2 px bob;
- 1.00→1.02 scale.

Attack:
- shield nudge;
- +10 px X;
- scaleX 1.06;
- return.

Hit:
- -6 px X;
- scale 0.95;
- white flash.

KO:
- rotate ~75°;
- drop 8 px.

## Signature FX

Guardian Brace:
- shield scale 1.0→1.18;
- blue ring;
- gold inner pulse;
- higher STAR can extend pulse to ally.

## Acceptance
- protection reads before damage;
- must not resemble Ironclad.

---

# 3. Ironclad

## Visual brief

Armored disruptor / frontline bruiser.

Shape:
- square/heavy;
- forward-loaded armor;
- stronger shoulders/gauntlet than Snowguard.

Palette:
- steel blue;
- cyan;
- dark navy;
- small gold accent.

## Assets
- `base.png`
- `icon.png`
- optional `signature.png`

## Motion

Profile: `BRUISER`

Idle:
- minimal bob.

Attack:
- 14 px forward;
- scaleX 1.08;
- small body rotation.

Hit:
- low displacement;
- heavier shake.

KO:
- rotate and sink.

## Signature FX

Iron Ram:
- anticipation squash;
- fast X dash;
- cyan shock;
- impact ring/crack.

## Acceptance
- reads as impact/disruption;
- must not read as shield-protector.

---

# 4. Starcaller

## Visual brief

Celestial Mage.

Shape:
- smaller body;
- robe/cape;
- floating orb/halo creates upper silhouette.

Palette:
- violet;
- lavender;
- pale gold;
- cream.

## Assets
- `base.png`
- `icon.png`
- optional `signature.png` if cast pose adds value.

## Motion

Profile: `MAGE`

Idle:
- float ±3 px;
- slow scale pulse;
- optional orb orbit transform.

Attack:
- small cast recoil;
- orb/projectile spawn.

Hit:
- float recoil;
- small rotation.

KO:
- body rotates/falls;
- optional tiny spirit effect.

## Signature FX

Arcane Bloom:
- source aura;
- multi-target violet blooms;
- purple link/trail;
- gold Echo at 3★.

## Acceptance
- reads as Mage without text;
- no bow/gun-like pose.

---

# 5. Swiftwing

## Visual brief

Fast Ranger.

Shape:
- narrow/light;
- angled body;
- twin projectile/feather identity.

Palette:
- magenta;
- pink;
- cream;
- small gold accent.

## Assets
- `base.png`
- `icon.png`
- optional `signature.png`

## Motion

Profile: `RANGER_FAST`

Idle:
- quick 2–3 px bounce.

Attack:
- fast 6–8 px recoil;
- short duration.

Hit:
- sharper rebound.

KO:
- small spin + fall.

## Signature FX

Twin Volley:
- two magenta trails;
- slightly staggered launch;
- visible split target path.

## Acceptance
- must visually feel faster than Windstrider.

---

# 6. Windstrider

## Visual brief

Precision Ranger.

Shape:
- upright;
- narrow;
- clear aim line;
- calm pose.

Palette:
- emerald;
- teal;
- cream;
- subtle gold.

## Assets
- `base.png`
- `icon.png`
- optional `signature.png`

## Motion

Profile: `RANGER_FOCUS`

Idle:
- very subtle motion.

Attack:
- short aim hold;
- single recoil.

Hit:
- controlled recoil.

KO:
- crouch/sink then fall.

## Signature FX

Focus Shot:
- charge line;
- narrow bright green beam/projectile;
- 3★ secondary pierce if behavior calls for it.

## Acceptance
- calm precision;
- must not look like Swiftwing recolor.

---

# 7. Shadowclaw

## Visual brief

Assassin / deep-strike burst.

Shape:
- low;
- angled;
- pointed ears/claws/blade.

Palette:
- orange;
- burnt coral;
- burgundy;
- cream.

## Assets
- `base.png`
- `icon.png`
- optional `signature.png`

## Motion

Profile: `ASSASSIN`

Idle:
- crouched slight lean.

Attack:
- fast short dash;
- 6–10° body rotation.

Hit:
- quick snap recoil.

KO:
- forward collapse / spin.

## Signature FX

Ambush Strike:
- dash trail;
- coral slash;
- deep-target impact;
- 3★ secondary slash if triggered.

## Acceptance
- must read as burst/deep-strike;
- no Tank silhouette.

---

# 8. Recommended production order

1. Snowguard base
2. Starcaller base
3. Swiftwing base
4. Windstrider base
5. Ironclad base
6. Shadowclaw base
7. enemy Frontliner
8. enemy Diver
9. enemy Ranged

Why:
- Snowguard establishes large-body readability;
- Starcaller validates Mage/VFX interaction;
- Swiftwing/Windstrider validate same-role contrast;
- Ironclad validates Tank contrast;
- Shadowclaw completes player-role spread.

---

# 9. Per-unit live QA

For each new base art:

1. load Battle fixture;
2. verify transparent render;
3. check ground anchor;
4. check HP anchor;
5. inspect idle motion;
6. trigger normal attack;
7. trigger Signature;
8. trigger hit;
9. observe KO;
10. confirm no combat rule changed.

Only then move to the next Beast.

---

# 10. Portfolio evidence

Final showcase should include:
- six-unit lineup;
- Setup STAR frame;
- Battle Signature frame;
- Tactical Energy frame;
- short GIF/video showing transform animation.

The portfolio should explain the production decision:

> We simplified the art language so character identity comes from silhouette and color, while animation is handled by reusable transform profiles and Signature VFX. This reduced asset cost and improved battle readability.
