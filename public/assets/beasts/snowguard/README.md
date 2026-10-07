# Snowguard Battle Art — V2 Simple Chibi Cutout

Status: **V2 BASE-ONLY IMPLEMENTED / CI PASS / LIVE VISUAL QA NEXT**

Current production assets:
- `base_v2.svg` — required battle cutout
- `icon_v2.svg` — required icon source

Motion:
- profile: `TANK`
- Idle / Attack / Hit / KO are transform-driven
- Guardian Brace uses transform + runtime VFX

Legacy V1 pose files remain in this folder only as historical/reference material:
- `battle_idle.svg`
- `battle_attack.svg`
- `battle_signature.svg`
- `battle_hit.svg`
- `battle_ko.svg`
- `portrait.svg`

They are no longer required by the Snowguard runtime manifest.

Art direction:
- simple chibi cutout;
- thick dark outline;
- flat gold / cream / pale-blue palette;
- broad friendly protector silhouette;
- large circular guardian shield;
- minimal facial detail;
- readability over illustration complexity.

Runtime contract:
- one base cutout carries Snowguard identity;
- attack/hit/KO do not require dedicated pose textures;
- Guardian Brace gameplay semantics remain unchanged;
- HP/effect anchors remain manifest-driven;
- STAR evolution remains VFX/behavior-first.

Evidence:
- final V2 Snowguard contract GitHub Actions run 133 PASS.
