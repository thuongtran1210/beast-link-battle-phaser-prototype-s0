# ASSET_MANIFEST.md

This manifest tracks art approval state.

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
