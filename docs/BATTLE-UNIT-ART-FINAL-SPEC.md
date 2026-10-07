# Battle Unit Art Final Spec — Casual Chibi Runtime

Status: **SUPERSEDED BY V2 / REFERENCE ONLY / GAMEPLAY FROZEN**

Date: 2026-10-07

> **V2 NOTE — 2026-10-07**
>
> The production target has moved to the simpler **Simple Chibi Cutout Battle Style**.
> Read `docs/BATTLE-ART-DIRECTION-V2.md` and `docs/UNIT-PRODUCTION-BRIEF-V2.md` first.
>
> This document is retained only for identity/fantasy reference. Its pose-heavy asset requirements are no longer the default production contract.

## Purpose

This document locks the final runtime character-art direction for the Beast Link Battle portfolio vertical slice.

The goal is not to copy any specific commercial game's characters or UI. The reference direction is used only for broad presentation qualities:

- small full-body combatants rather than battle cards;
- strong silhouettes at mobile scale;
- simple shapes and bold outlines;
- flat / lightly shaded colors;
- readable actions and effects;
- casual mobile-game clarity over detailed illustration.

## Core presentation rule

```text
BATTLE SETUP = tactical information / cards / roster decisions
BATTLE       = characters / movement / attacks / fantasy
```

Cards belong in Setup.

Characters belong on the battlefield.

The current portrait-card combat tokens are temporary portfolio placeholders and should be replaced by compact full-body character sprites.

---

## 1. Final visual target

### Style

**2D casual mobile chibi fantasy**

Target qualities:
- cute but tactically readable;
- head slightly oversized;
- compact body and limbs;
- clean dark outline;
- simple internal shapes;
- limited material detail;
- high color separation;
- readable at small runtime scale;
- character fantasy understandable without reading a role label.

Avoid:
- realistic anatomy;
- painterly texture noise;
- micro-detail;
- complicated armor segmentation;
- overly anime facial rendering;
- silhouettes that collapse into the same round mascot shape;
- battle characters presented as rectangular UI cards.

### Suggested proportion

Approximate chibi ratio:

```text
Head: ~40–45% of total character height
Torso: ~25–30%
Legs / lower mass: ~20–25%
Prop / signature shape: allowed to exceed silhouette
```

Exact proportions may vary by identity. Tankers should feel heavier; Assassin/Rangers may be narrower and more directional.

### View

Preferred:
- 3/4 side-facing battle pose;
- player characters visually face toward enemy side;
- enemies visually face toward player side.

Avoid straight front-facing portrait poses during Battle.

### Outline

- one consistent outer outline weight;
- slightly thinner inner-detail line;
- outline should survive sprite downscaling;
- no hairline details that disappear at runtime.

### Rendering

Preferred:
- flat base colors;
- one simple shadow family;
- one restrained highlight;
- optional small emissive accent for magic/signature identity.

Do not use heavy gradients as the main character rendering method.

---

## 2. Runtime scale & readability

A Battle unit should still be identifiable when viewed in a 1280×720 screenshot.

At normal combat zoom, the player should identify:
1. Beast identity;
2. broad role fantasy;
3. current STAR tier;
4. Signature activation.

Do not rely on text labels for the first two.

### Battlefield information hierarchy

Visible directly on the character:
- silhouette;
- identity color;
- prop / motif;
- attack or cast pose.

Small UI attached to unit:
- HP bar;
- STAR indicator if needed;
- temporary state marker only when relevant.

Avoid permanent labels such as:
- role name;
- internal ID;
- damage stat;
- movement policy;
- debug state.

---

## 3. STAR visual language

STAR evolution changes behavior in V15A. Art should reinforce that evolution without requiring three completely separate character designs.

### 1★
Base identity.

Use:
- clean base outfit / body;
- simplest Signature effect;
- minimal aura / ornament.

### 2★
Enhanced Signature.

Use one or two small upgrades:
- stronger accent trim;
- additional prop detail;
- brighter Signature core;
- small secondary shape or ornament.

### 3★
Capstone identity.

Use:
- stronger but still readable silhouette accent;
- upgraded Signature VFX;
- halo / crest / secondary trail / larger magical motif where appropriate.

Do not:
- redesign the Beast into an unrelated form;
- change primary identity color;
- make STAR tier impossible to recognize as the same character.

The strongest STAR distinction should come from **Signature behavior + effect**, not only costume complexity.

---

# 4. Beast Character Specifications

## SNOWGUARD

**Role:** Tanker  
**Signature:** Guardian Brace  
**Fantasy:** protective guardian  
**Primary color:** warm yellow / gold  
**Secondary:** cream / pale sky blue  
**Personality:** calm, dependable, reassuring

### Silhouette
- broad rounded torso;
- stable low center of gravity;
- strong front-facing defensive mass;
- soft rather than aggressive shape language.

### Signature prop / motif
- compact shield, forearm guard or guardian crest;
- circular barrier motif.

### Battle poses
**Idle:** planted stance, shield/guard slightly forward.  
**Basic attack:** short body-check / shield bump.  
**Guardian Brace:** brace stance with visible barrier around self.  
**3★:** barrier visually extends toward ally.

### Do
- make Snowguard look like a protector before reading the UI;
- preserve friendly expression.

### Don't
- make it look like Ironclad with a different color;
- give it an aggressive horn-first silhouette.

---

## IRONCLAD

**Role:** Tanker  
**Signature:** Iron Ram  
**Fantasy:** armored disruptor / formation breaker  
**Primary color:** cyan / steel blue  
**Secondary:** dark navy / pale metal  
**Personality:** stubborn, forceful, compact powerhouse

### Silhouette
- forward-loaded body;
- heavy forehead / horn / armored shoulder mass;
- sharper and more directional than Snowguard.

### Signature prop / motif
- horn plate;
- reinforced headpiece;
- ram-like forward armor.

### Battle poses
**Idle:** weight leaning slightly forward.  
**Basic attack:** heavy short strike.  
**Iron Ram:** clear forward charge.  
**2★:** impact/stagger punctuation.  
**3★:** wider impact arc / cleave.

### Do
- communicate impact and displacement;
- keep tank mass while visually separating from Snowguard.

### Don't
- use circular protection motifs as the main language;
- make it read as a defensive paladin.

---

## WINDSTRIDER

**Role:** Ranger  
**Signature:** Focus Shot  
**Fantasy:** patient precision hunter  
**Primary color:** vivid green  
**Secondary:** mint / dark forest tone  
**Personality:** composed, observant, disciplined

### Silhouette
- narrow and upright;
- clean directional weapon line;
- minimal flared shapes.

### Signature prop / motif
- small bow, dart launcher, focus crystal or precision emitter;
- one obvious aiming line.

### Battle poses
**Idle:** steady aim-ready stance.  
**Basic attack:** compact single shot.  
**Focus charge:** visible aim/charge posture.  
**Focus Shot:** strong single precision line.  
**3★:** line continues/pierces through secondary target.

### Do
- distinguish through deliberate, calm motion;
- emphasize one precise projectile line.

### Don't
- use rapid multi-shot animation as primary identity;
- give Swiftwing-style spread shots.

---

## SWIFTWING

**Role:** Ranger  
**Signature:** Twin Volley  
**Fantasy:** fast multi-shot pressure  
**Primary color:** magenta / hot pink  
**Secondary:** pale rose / dark plum  
**Personality:** lively, quick, mischievous

### Silhouette
- lighter and more angled than Windstrider;
- wing / feather / split-projectile shape language;
- slightly dynamic resting pose.

### Signature prop / motif
- paired emitters, twin feather shots or split bow mechanism.

### Battle poses
**Idle:** subtle bounce / ready motion.  
**Basic attack:** fast snap shot.  
**Twin Volley:** visible split lines to multiple targets.  
**2★:** Volley happens more frequently.  
**3★:** stronger multi-target spread.

### Do
- make the character feel active even when small;
- preserve magenta identity across projectile trails.

### Don't
- make it look like Windstrider recolored;
- use long aim-charge anticipation as its primary action.

---

## STARCALLER

**Role:** Mage  
**Signature:** Arcane Bloom  
**Fantasy:** celestial / arcane area caster  
**Primary color:** lavender / violet  
**Secondary:** pale gold / soft pink-white  
**Personality:** serene, mysterious, slightly otherworldly

### Silhouette
- softer floating shapes;
- visible magical focal point;
- least weapon-like silhouette of the six.

### Signature prop / motif
Preferred options:
- floating orb;
- small staff;
- halo;
- star/sigil;
- orbiting arcane fragments.

At least one magical object should remain visible during idle.

### Battle poses
**Idle:** subtle float / orbiting orb.  
**Basic attack:** small magic bolt or orb.  
**Arcane Bloom cast:** clear cast anticipation before impact.  
**Bloom:** multiple targets visibly linked to caster.  
**3★ Echo:** secondary gold arcane pulse after the purple Bloom.

### Critical readability rule

A player seeing Starcaller attack with no label must still say:

> “That unit is casting magic.”

This Beast must not visually behave like a purple Ranger.

### Do
- use source aura;
- use arcane link / bloom / sigil;
- emphasize multi-target magical consequence.

### Don't
- use gun/bow-like projectile pose;
- make the main magic effect a thin line only.

---

## SHADOWCLAW

**Role:** Assassin  
**Signature:** Ambush Strike  
**Fantasy:** deep-target execution / burst mobility  
**Primary color:** orange / burnt coral  
**Secondary:** dark burgundy / warm cream  
**Personality:** sharp, confident, dangerous but still stylized/cute

### Silhouette
- pointed ears/horns/claws;
- compact lean torso;
- forward diagonal shape.

### Signature prop / motif
- claw;
- short blade;
- shadow slash;
- red-orange motion streak.

### Battle poses
**Idle:** low, ready stance.  
**Basic attack:** quick slash.  
**Ambush:** short burst / leap / blink-like movement.  
**3★:** kill chain produces a second visible strike.

### Do
- show speed and direction;
- make deep-target burst visually obvious.

### Don't
- give it Tanker mass;
- rely only on dark colors to communicate Assassin.

---

# 5. Animation minimum viable set

The portfolio vertical slice does not require a production animation library.

Each Beast needs at minimum:

1. **Idle**
2. **Move**
3. **Basic Attack**
4. **Signature**
5. **Hit**
6. **KO**

These may be:
- small frame animations;
- bone/tween animation;
- pose swaps plus squash/stretch;
- hybrid sprite + Phaser effect.

Animation quality target:
- readable timing;
- distinct key poses;
- no requirement for high frame count.

Signature pose is more important than elaborate idle animation.

---

# 6. Signature VFX mapping

Character art and VFX must share the same visual identity.

| Beast | Signature | VFX language |
|---|---|---|
| Snowguard | Guardian Brace | blue/gold rounded barrier |
| Shadowclaw | Ambush Strike | coral slash / rapid burst |
| Windstrider | Focus Shot | narrow green precision beam |
| Starcaller | Arcane Bloom | purple caster aura → multi-target bloom → gold Echo at 3★ |
| Ironclad | Iron Ram | cyan charge / impact shock |
| Swiftwing | Twin Volley | magenta split projectile trails |

Do not reuse the same generic pulse for all six Signatures.

---

# 7. Enemy character direction

Enemies should use the same world/rendering language but a less friendly shape family.

## Frontliner
- heavy square/round body;
- large front-facing armor;
- red/coral accents;
- defensive threat.

## Diver
- sharp triangular silhouette;
- forward lean;
- violet/red accents;
- reads as mobile threat.

## Ranged
- tall/narrow silhouette;
- obvious ranged prop;
- cyan/blue hostile accent;
- stays visually lighter than Frontliner.

Enemy detail should stay below Beast detail so player characters remain the focal point.

---

# 8. Setup vs Battle asset usage

## Battle Setup

Use:
- polished portrait/bust or clean card crop;
- name;
- STAR;
- role;
- Signature tier;
- short Signature tagline;
- HP state.

Portrait may be more detailed than the battle sprite.

## Battle

Use:
- full-body chibi sprite;
- minimal attached UI;
- HP;
- optional small STAR mark;
- Signature conveyed through action/VFX.

Do not render the full Setup card as the Battle body.

---

# 9. Asset package per Beast

Final minimal deliverables:

```text
/beast-name/
  portrait.png
  battle_idle.png
  battle_move.png or move pose
  battle_attack.png or attack pose
  battle_signature.png or signature pose
  battle_hit.png
  battle_ko.png
```

If spritesheets are used, equivalent files are acceptable.

Preferred transparent background.

Keep:
- consistent canvas dimensions;
- consistent feet/ground anchor;
- safe margin for VFX.

---

# 10. Integration rules

When authored battle sprites exist:

1. Phaser should load authored sprite first.
2. Procedural portrait/icon remains fallback only.
3. Logic must not depend on art asset availability.
4. Existing role/Signature deterministic tests remain unchanged.
5. Character swap must not alter targeting, damage, timing or STAR behavior.
6. Battle sprite ground anchor must remain stable while animations change frames.
7. Capture mode should continue to use the same gameplay model as normal Battle.

---

# 11. Portfolio capture targets

After art integration, capture at least:

### Frame A — Unit Identity
A clean lineup/contact sheet of all six Beasts:
- names;
- roles;
- Signature names;
- 1★ baseline appearance.

### Frame B — STAR Evolution Setup
Battle Setup showing different STAR tiers:
- Starcaller 3★;
- Ironclad 2★;
- Swiftwing 2★;
- Snowguard 1★;
- Reserve examples.

### Frame C — Signature Hero
Battle frame focused on:
- Arcane Bloom III or
- Twin Volley II / Iron Ram II.

### Frame D — Tactical Energy
Separate Battle frame focused on:
- READY;
- SUGGESTED;
- DISABLED.

Do not try to communicate all systems in one screenshot.

---

# 12. Definition of Done

Art is portfolio-ready when:

- all six Beasts are distinguishable by silhouette at battle scale;
- Snowguard and Ironclad cannot be mistaken for each other;
- Windstrider and Swiftwing cannot be mistaken for each other;
- Starcaller reads as a Mage without a role label;
- Shadowclaw reads as a deep-strike unit;
- characters no longer look like rectangular Battle cards;
- Signature animations/VFX reinforce each Beast's identity;
- Setup cards remain readable;
- no authored art change alters deterministic combat behavior;
- final runtime screenshots look like a game vertical slice rather than a systems harness.

---

## Production priority

Recommended order:

1. **Starcaller**
2. **Snowguard**
3. **Ironclad**
4. **Windstrider**
5. **Swiftwing**
6. **Shadowclaw**
7. enemy Frontliner
8. enemy Diver
9. enemy Ranged

Starcaller is first because Mage readability is currently the clearest remaining art problem and is the strongest portfolio before/after opportunity.
