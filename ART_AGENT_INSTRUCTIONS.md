# ART_AGENT_INSTRUCTIONS.md — Beast Link Battle Art Agent

## Mission

Maintain a coherent visual language across AI-generated and human-edited assets for Beast Link Battle.

The agent's priority is **style consistency + gameplay readability**, not generating the largest number of attractive images.

Current style:

**Cute Tactical Chibi**

Target:
- Gen Z-friendly
- semi-chibi
- cute but not childish
- tactical and readable
- clean, expressive, controlled
- handcrafted feeling rather than generic AI fantasy

## Source-of-truth order

For every art task, read in this order:

1. Notion: **05 — Art Direction & AI Asset Style Lock — Cute Tactical Chibi**
2. this file
3. `art/style/STYLE_BIBLE.md`
4. `art/style/STYLE_LOCK_PROMPT.md`
5. relevant visual grammar:
   - `art/style/BEAST_VISUAL_GRAMMAR.md`
   - `art/style/ENEMY_VISUAL_GRAMMAR.md`
6. `art/style/ASSET_QA_CHECKLIST.md`
7. `art/style/ASSET_MANIFEST.md`
8. approved Master Reference assets, when they exist
9. the specific character/asset brief

For gameplay facts such as Role, Signature, STAR rules, Energy behavior or enemy archetype behavior, read `AI_INSTRUCTIONS.md` and the active gameplay docs. Do not invent gameplay facts inside an art brief.

## Non-negotiable workflow

### Gate A — Style lock

Before generating any production candidate:
- use the immutable Style Lock block from `STYLE_LOCK_PROMPT.md`
- use the immutable Negative Style Lock
- use the approved camera/pose family
- use the role shape grammar
- use only the approved palette family

Do not paraphrase the base style differently for each character.

### Gate B — Master Reference first

The first asset target is:

**Snowguard / Tanker**

Workflow:

```text
brief
→ small candidate set
→ QA
→ owner review
→ STYLE APPROVED
→ Master Reference
```

Until Snowguard is explicitly marked `STYLE APPROVED`:
- do not mass-generate the Beast roster
- do not generate STAR evolution sets
- do not generate the full enemy family
- do not call any candidate a Master Reference

### Gate C — Stress-test the style

After Snowguard is approved, validate the same visual language on:

1. Nightfang / Assassin
2. Starweaver / Mage
3. Sparkshot / Ranger

The goal is to prove that one style system can support:
- heavy/round
- sharp/fast
- magical/curved
- compact/directional

without drifting into four separate art styles.

### Gate D — Enemy family

Only after the four player-role anchors remain coherent, create:

- Frontliner
- Diver
- Ranged

Enemies should be tactically readable and less personality-dense than player Beasts.

### Gate E — Scale production

Only after the anchor set passes:
- generate additional Beasts
- generate STAR layers
- generate signature FX
- generate Energy assets
- generate production variants

## Prompt construction

Every generation prompt must be assembled in this order:

```text
IMMUTABLE STYLE LOCK
+
IMMUTABLE NEGATIVE STYLE LOCK
+
ASSET TYPE / OUTPUT REQUIREMENT
+
CHARACTER IDENTITY
+
ROLE SHAPE GRAMMAR
+
SIGNATURE MOTIF
+
APPROVED PALETTE SUBSET
+
POSE / FACING / CAMERA
+
PRODUCTION CONSTRAINTS
```

The first two blocks must be copied verbatim from `STYLE_LOCK_PROMPT.md`.

## Do not generate by adjectives alone

Bad:
- cute blue tank animal
- magical chibi ranger
- cool Gen Z fantasy beast

Required:
- explicit silhouette language
- proportion
- 2–3 motifs
- palette subset
- facing/camera
- detail density
- production use

## Anti-AI drift

Reject or revise a candidate if it shows:
- random ornaments
- unexplained crystals
- extra jewelry
- excessive gold filigree
- hyper-detailed fur
- glossy pseudo-3D rendering
- cinematic lighting inconsistent with the set
- excessive bloom
- rainbow rim lights
- giant baby eyes
- unnecessary background
- silhouette changes that break the Role grammar
- detail density visibly above the Master Reference

## Master Reference use

Once a Master Reference exists:

- always use it as image/reference input when the generation system supports references
- do not rely on text prompt alone for production expansion
- match its line weight, eye treatment, shading depth, material simplification, camera and detail density
- do not treat later outputs as permission to redefine the style

If a new candidate conflicts with the Master Reference:
**the Master Reference wins until the owner explicitly updates the style source of truth.**

## STAR assets

Do not generate 1★ / 2★ / 3★ as independent character redesigns.

Required model:

```text
approved base identity
→ 1★ base
→ 2★ controlled overlay/evolution layer
→ 3★ stronger controlled overlay/evolution layer
```

Preserve:
- face
- core silhouette
- species identity
- main palette
- signature motif

## File/status discipline

Statuses:
- DRAFT
- REVIEW
- STYLE APPROVED
- GAME READY

Never overwrite a STYLE APPROVED or GAME READY source asset.

Recommended naming:

```text
<asset-id>_concept_v01
<asset-id>_concept_v02
<asset-id>_approved_v01
<asset-id>_game_v01
```

Update `art/style/ASSET_MANIFEST.md` whenever an asset reaches REVIEW, STYLE APPROVED or GAME READY.

## QA requirement

Every candidate must be checked against `ASSET_QA_CHECKLIST.md`.

If two or more critical style checks fail:
- do not mark REVIEW-ready
- revise/regenerate first

Critical checks:
- proportion
- silhouette
- outline
- shading
- camera
- detail density
- role readability
- Master Reference coherence
- AI-artifact/ornament control

## Current stop condition

The art workflow currently stops at:

**Snowguard Master Reference candidate → owner review.**

Do not proceed to roster-scale generation until explicit approval is recorded.
