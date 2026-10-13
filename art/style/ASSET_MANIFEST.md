# ASSET_MANIFEST.md

This manifest tracks art approval state.

## Character Studio owner edits — 2026-10-13

Owner saves for Snowguard/Windstrider are preserved in CharacterProjects.json, with software-rendered content-hashed atlases under public/assets/character-custom and previous records under art/backups/character-studio. Editor source crop/mask/offset settings bake into registered 2048×1024 atlases; original animation_v01 PNGs remain unchanged. Shared Review/runtime integration and raster/PNG checks do not constitute STYLE APPROVED or GAME READY. Manual owner art/gameplay review remains open. See docs/CHARACTER-STUDIO-GUIDE.md.

## Windstrider owner animation — 2026-10-13

Six owner-supplied RGBA 1774×887 sheets (8 frames, 4×2), in requested order Idle / Run / Attack / Skill / Hit / KO, preserved unchanged at public/assets/characters/rabbit-archer/animation_v01. Run maps to walk.png for the shared rig. Measured alpha windows/foot origins in WindstriderFrames.json; Setup/Battle integration via shared animation state machine. Preview /windstrider-animation-preview.html. OWNER-SUPPLIED / INTEGRATED; live Battle/mobile review open, no STYLE APPROVED or GAME READY claim.

## Owner Village scene and props — 2026-10-09

Original files preserved unchanged in public/assets/ui/camp/village-owner-v1: map.png (1536x1024 RGB), forge/garden/dock.png (1254x1254 RGBA). Camp renders the map in one fixed-coordinate world/camera, garden on the left clearing, forge as the owned anvil replacement on the right. Dock source retained for alternate placement; current scene uses its already baked-in pier, avoiding double piers. World crop windows use threshold-alpha bounds without bitmap edits. Garden and existing pier are shared scene facilities, not purchased/unlocked save items; residents still require actual recruitment. Procedural watering/fishing and existing forge interaction are prototypes, not authored profession sheets. OWNER-SUPPLIED / INTEGRATED for map/garden/forge, dock STORED; no live composition or GAME READY claim.

## Owner frame animation sheets — 2026-10-09

Snowguard and Ironclad each have six original owner-supplied RGBA sheets under `public/assets/characters/duck-guardian/animation_v01` and `public/assets/characters/bear-hammer/animation_v01`. Each sheet is 1774×887 with eight frames in 4×2 order. Runtime texture windows and foot origins are recorded in SnowguardFrames.json / IroncladFrames.json; original PNGs are unmodified. Clips: Idle, Walk, Attack, Skill, Hit, KO. Status OWNER-SUPPLIED / INTEGRATED; live animation quality and combat readability review open, not formally STYLE APPROVED or GAME READY.

## Owner Energy icons — 2026-10-08

Owner supplied transparent sheet: `public/assets/ui/energy/owner-icons-v1.png`, 1254×1254. Runtime frame definitions: `src/game/ui/icons/OwnerEnergyArt.ts`. Four padded square frames: Mend blue medical patch, Guard coral paw shield, Break mint mallet/cracked armor, Disrupt purple stop glove. Source preserved unchanged; sprite windows avoid neighboring items. Status: OWNER-SUPPLIED / INTEGRATED, mobile readability review open; no new formal STYLE APPROVED or GAME READY claim.

## Style anchors

| Asset | Role / Type | Status | Version | Notes |
| --- | --- | --- | --- | --- |
| Snowguard | Tanker Beast | DRAFT — NOT YET GENERATED/APPROVED | — | First Master Reference target. Must be owner-approved before roster scaling. |
| Nightfang | Assassin Beast | BLOCKED BY MASTER REFERENCE | — | Generate after Snowguard STYLE APPROVED. |
| Starweaver | Mage Beast | BLOCKED BY MASTER REFERENCE | — | Generate after Snowguard; stress-test magical style. |
| Sparkshot | Ranger Beast | BLOCKED BY MASTER REFERENCE | — | Complete four-role anchor set. |
| Enemy Frontliner | Enemy archetype | BLOCKED BY PLAYER ANCHORS | — | Create after four player role anchors cohere. |
| Enemy Diver | Enemy archetype | BLOCKED BY PLAYER ANCHORS | — | Same enemy family. |
| Enemy Ranged | Enemy archetype | BLOCKED BY PLAYER ANCHORS | — | Same enemy family. |

## Master Reference

### Latest portrait update — 2026-10-08

Owner's colored portrait sheet is now exported as 27 `icon_v02.png` assets and active for all six Beast / three enemy slots and the gallery. Axe-only badge and alternate polar-bear portrait are retained separately. Body sprites unchanged. Status: OWNER-SUPPLIED / INTEGRATED / LIVE QA OPEN. Sources and extraction script recorded in `docs/OWNER-PORTRAIT-UPDATE-2026-10-08.md`.

### Owner-supplied full library — 2026-10-08

27 source characters now have 27 exported body/icon pairs under `public/assets/characters/`, indexed by `manifest.json`. Full source and extracted sheets plus small-scale QA sheet are preserved in `art/owner-supplied/2026-10-08/`.

Active completion: Starcaller = purple badger mage; enemy Frontliner = penguin knight, Diver = crow assassin, Ranged = deer archer. Existing five player mappings remain active. Status: **6/6 BEASTS + 3/3 ENEMY ARCHETYPES INTEGRATED / 27-CHARACTER ASSET LIBRARY EXPORTED / LIVE QA OPEN**. Unmapped library entries are art assets only. See `docs/OWNER-ROSTER-COMPLETION-2026-10-08.md`.

### Owner-supplied lineup integration — 2026-10-08

Owner explicitly requested analysis and use of the supplied five-character body/icon sheets. They are now the default presentation for Snowguard (duck), Ironclad (bear), Windstrider (rabbit), Swiftwing (fox), Shadowclaw (raccoon). Sources: `art/owner-supplied/2026-10-08/`; runtime: each Beast directory's `base_owner_v01.png` and `icon_owner_v01.png`.

Status: **OWNER-SUPPLIED / INTEGRATED / LIVE QA OPEN**. This supersedes the raster Snowguard preview candidate as the default displayed art. It does not approve generated extensions, Starcaller/enemy replacements, or GAME READY status. See `docs/OWNER-ART-INTEGRATION-2026-10-08.md`.

Current status:

**NONE APPROVED**

The repository does not yet contain an owner-approved image-level Master Reference.

Do not claim that a generated candidate is the Master Reference until the owner explicitly approves it.

## Planned directory convention

## Production candidate pass — 2026-10-08

| Asset | Status | Source / runtime export | Notes |
| --- | --- | --- | --- |
| Snowguard raster candidate | DRAFT / OWNER REVIEW PENDING | `art/beasts/snowguard/snowguard_concept_v02.png`; `public/assets/beasts/snowguard/base_candidate_v03.png`; `icon_candidate_v03.png` | Built-in imagegen, refined once to remove ornaments and simplify shading. Preview via `?art=preview`; existing V2 remains default. Alpha corners checked; runtime/live QA open. Some gradient shading remains, so strict flat-color V2 conformity is not claimed. |
| Snowguard simple candidate V04 | DRAFT / OWNER REVIEW PENDING | `art/beasts/snowguard/snowguard_concept_v04.png`; `public/assets/beasts/snowguard/base_candidate_v04.png`; `icon_candidate_v04.png` | Current preview. Generated from owner-supplied simplicity reference: black outline, pill eye, smooth body, round shield. Source alpha checked; live QA open. V03 is retained as an earlier richer candidate, no longer the preview. |

This candidate is not a Master Reference, STYLE APPROVED, or GAME READY. The existing V2 vector package and this new raster candidate have separate status records.

```text
art/
  style/
  beasts/
    snowguard/
    nightfang/
    starweaver/
    sparkshot/
  enemies/
    frontliner/
    diver/
    ranged/
  fx/
  energy/
```

Create production directories when real assets are added. Do not add empty placeholder binaries.

## Owner river village map — 2026-10-09

Cloud rendering correction supersedes CSS drift below: runtime WebGL UV shader, 28 world px/sec wind, 0.32 alpha, 0.92 world-center camera parallax including zoom and saturated fringe suppression. Original bitmap unchanged. GPU/live seam review pending.

Owner cloud original `river-owner-v1/clouds.png` preserved unchanged (2172x724 RGBA). Viewport foreground repeats horizontally at 1086x362, opacity 0.2, 90s drift period and camera translation factors x0.2/y0.15. Above scene/below HUD, ignores pointer input; hidden-tab pause and reduced-motion support. Live seam/composition review pending.

Owner house original integrated as `public/assets/ui/camp/river-owner-v1/house.png`, unchanged bitmap, at world x210/y8, width420 with intrinsic aspect ratio. Decorative scene object above shore and below residents, sharing camera pan/zoom. No purchase/save mechanic added; live composition review pending.

OWNER-SUPPLIED / INTEGRATED; live visual review pending, not STYLE APPROVED or GAME READY.

| Runtime original | Format | Use |
| --- | --- | --- |
| `public/assets/ui/camp/river-owner-v1/complete.png` | 1536x1024 RGB | Complete composition reference and loading/error fallback |
| `public/assets/ui/camp/river-owner-v1/shore.png` | 1536x1024 RGBA | Registered fixed land layer above water |
| `public/assets/ui/camp/river-owner-v1/water.png` | 1536x1024 RGB | Slowly moving texture beneath shore, reduced-motion/hidden-tab support |

Original bitmap files copied unchanged. Existing `village-owner-v1/dock.png` now supplies the separate river work prop through an SVG window. Props/residents remain above both map layers. No new character art or profession sheets generated; procedural work motion remains a prototype. Old map assets retained.
