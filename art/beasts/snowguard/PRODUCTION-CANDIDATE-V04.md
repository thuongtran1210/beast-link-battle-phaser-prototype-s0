# Snowguard V04 — owner simplicity reference

Status: DRAFT / owner review pending / live QA open.

Owner request: “Style phong cách đơn giản như thế này thôi”, accompanied by `owner-style-reference-2026-10-08.png`.

Built-in imagegen was used with that image as a style reference. The prompt requested one original cream/gold bear protector, sky-blue round shield and scarf, rightward mild 3/4 view, black thick outlines, small pill eye, compact pear-shaped body and stubby feet. It explicitly excluded fur texture, gradients, highlights, hats, belts, suspenders, jewelry, armor filigree, background, UI and VFX; it prohibited copying the reference's characters or costumes.

Outputs:
- `snowguard_concept_v04.png`: full-resolution RGBA source.
- `public/assets/beasts/snowguard/base_candidate_v04.png`: 512×512 runtime export.
- `public/assets/beasts/snowguard/icon_candidate_v04.png`: 256×256 portrait derived from the same source.

Technical export: `scripts/prepare-snowguard-candidate.ps1 -Source <generated path> -Version v04 -SourceVersion v04`.

Visual inspection: broad protector silhouette, complete feet/ears/shield, simple black contours, no extra ornaments, one eye, right-facing pose. Source alpha corners checked by export script. Subtle texture/tonal variation remains in the generated fill; strict pixel-uniform flat color is not claimed.

Open `http://127.0.0.1:5173/?art=preview`, refresh, click canvas and press `L` for Battle. Existing animation and gameplay remain unchanged. Default URL still uses established V2 art. V03 sources remain preserved.

Owner style approval, at-scale readability, HP/ground anchors and transform-animation live QA remain open. No full-roster generation is authorized by this candidate record.
