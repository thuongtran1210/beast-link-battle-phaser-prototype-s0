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

Current status:

**NONE APPROVED**

The repository does not yet contain an owner-approved image-level Master Reference.

Do not claim that a generated candidate is the Master Reference until the owner explicitly approves it.

## Planned directory convention

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
