# Snowguard production candidate — 2026-10-08

Status: DRAFT / owner direction review pending / live QA open.

## Deliverables

- `snowguard_concept_v02.png`: refined full-resolution generated source, 1254×1254 RGBA.
- `../../../public/assets/beasts/snowguard/base_candidate_v03.png`: 512×512 runtime cutout.
- `../../../public/assets/beasts/snowguard/icon_candidate_v03.png`: 256×256 portrait derived from the same source.
- `../../../scripts/prepare-snowguard-candidate.ps1`: reproducible technical export, no independent portrait redesign.

Built-in imagegen produced the artwork; System.Drawing performed technical resize and portrait crop. Original V2 SVGs remain available.

## Visual QA

- Protector silhouette: broad bear, substantial visible shield, grounded feet.
- Identity: gold/cream, sky-blue scarf and shield; facing right.
- Full-body completeness: ears, feet and shield fit canvas.
- Ornament control: refined version removes belt, clasp, wrist armor and crystals.
- Transparency: four source corners verified alpha 0; runtime export uses RGBA.
- Portrait: inspected after export; face, ears and scarf remain legible.
- Remaining issue: shading still includes gradients; exact strict V2 flat-color conformity remains open.
- No approved image-level Master Reference exists to compare against.
- At-scale live readability, HP clearance, tween motion, hit, Signature and KO still require runtime QA.

## Preview

Open `http://127.0.0.1:5173/?art=preview` to opt into the candidate sprite and portrait. Refresh after changing URL. Click canvas and press `L` for the Battle fixture. The default URL uses existing V2 art.

Compare the preview against the default at 1280×720, particularly silhouette size and ground/HP anchors. The sprite remains driven by the existing TANK transform animation and Guardian Brace VFX.

## Approval boundary

`ART_AGENT_INSTRUCTIONS.md` requires: “Until Snowguard is explicitly marked STYLE APPROVED: do not mass-generate the Beast roster.”

This pass supplies a concrete candidate for that decision. Do not infer approval from generation, technical export, passing checks or UI polish. If the owner prefers a richer shading family, record that explicitly as an update to the art direction before expanding it across units.

## UI work in the same pass

Rush board mat, populated tiles, empty cells and selected surfaces now use rounded code-drawn panels. The same full rectangular hit area and existing match feedback are preserved. Neutral raised edges replace always-on neon halos. This is a presentation pass; gameplay rules remain unchanged.
