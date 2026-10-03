# STYLE_LOCK_PROMPT.md

The blocks below are immutable prompt components.

Do not paraphrase them per character.

## Immutable Style Lock

```text
BEAST LINK BATTLE — CUTE TACTICAL CHIBI STYLE LOCK:

2D semi-chibi tactical creature game asset, Gen Z-friendly but not childish, clean readable silhouette, head approximately 35–40% of total character height, compact full body, soft colored medium-weight outlines with a slightly stronger outer contour, simple flat base colors, one to two steps of cel shading, minimal controlled highlights, low-to-medium intentional detail density, pastel fantasy palette with one strong controlled accent, clear role-driven shape language, only two to three primary character motifs, mobile/gameplay readability at small scale, expressive face with simple eyes, handcrafted designed feeling, consistent stylized materials, full-body 3/4 front presentation, no extreme perspective.
```

## Immutable Negative Style Lock

```text
AVOID:

3D render, photorealism, painterly splash art, hyper-detailed fur, realistic material rendering, plastic glossy surfaces, complex fantasy armor filigree, random gold ornaments, random jewelry, excessive crystals, excessive bloom, rainbow lighting, multiple unrelated glow colors, giant baby eyes, oversized baby head proportions, generic anime human face, overcomplicated costume layers, unnecessary symbols, highly cinematic perspective, dramatic low-angle camera, busy background, decorative particles that reduce silhouette readability, random asymmetry with no design purpose, excessive symmetry decoration, AI detail spam.
```

## Prompt assembly template

```text
[IMMUTABLE STYLE LOCK]

[IMMUTABLE NEGATIVE STYLE LOCK]

ASSET:
<asset type and production purpose>

CHARACTER:
<name / species / identity>

ROLE:
<role>

ROLE SHAPE LANGUAGE:
<from visual grammar>

PRIMARY MOTIFS:
1. <motif>
2. <motif>
3. <optional motif>

SIGNATURE MOTIF:
<gameplay-linked motif if relevant>

PALETTE SUBSET:
<approved colors only>

POSE / FACING:
<exact requirement>

OUTPUT:
<transparent background / full body / icon / sheet etc.>
```

## Current rule

Until a Master Reference exists, generate only controlled candidates for Snowguard / Tanker.

After approval, add:
```text
REFERENCE PRIORITY:
Match the approved Beast Link Battle Master Reference for line weight, face language, shading depth, material simplification, camera, detail density and overall visual age.
```
