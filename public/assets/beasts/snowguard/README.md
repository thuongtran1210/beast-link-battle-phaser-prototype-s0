# Snowguard Authored Battle Art

Status: **M3A IMPLEMENTED / LIVE VISUAL QA NEXT**

Runtime poses:
- `battle_idle.svg`
- `battle_attack.svg`
- `battle_signature.svg`
- `battle_hit.svg`
- `battle_ko.svg`

Additional source:
- `portrait.svg`

Art direction:
- casual 2D chibi Tanker;
- warm gold / cream / pale sky-blue palette;
- broad rounded protector silhouette;
- compact circular shield;
- friendly, dependable expression;
- Guardian Brace pose emphasizes protection rather than impact.

Runtime rules:
- authored sprite replaces fallback automatically when loaded;
- HP/effect anchors come from `BattleCharacterManifest.ts`;
- Guardian Brace gameplay semantics remain unchanged;
- Star level changes Signature behavior/VFX, not the base character identity.

The authored package is presentation-only.
