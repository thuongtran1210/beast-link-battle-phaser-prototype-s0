# UI_PRODUCTION_KIT_V1.md — Beast Link Battle

Status: **Active production specification**

This file mirrors the current UI Production Kit so implementation agents can work from the repository without querying Notion.

## Source references

- Visual board: Canva design `DAHW7bvUJsQ`
- Production Kit: Canva design `DAHW7ZdU5V0`
- Art direction: `STYLE_BIBLE.md`
- Style lock: `STYLE_LOCK_PROMPT.md`

## Readiness model

```text
CONCEPT
→ UI APPROVED
→ ASSET READY
→ GAME READY
```

Current assessment:
- art direction / palette / hierarchy: UI APPROVED candidate
- six-screen layout family: UI APPROVED candidate
- production asset package: NOT READY
- final Beast / Enemy art: blocked by Master Reference approval
- Energy Rush interaction visual: NOT READY
- STAR evolution art: blocked by V14B.3

## Code-driven UI

Implement these with Phaser / code, not raster screenshots:

- panel backgrounds
- card backgrounds
- buttons
- borders
- grid cells
- HP bars
- status chips
- typography
- spacing / layout
- Onet connection path
- Reserve pagination controls
- simple highlight / selected / disabled states

## Exported art assets

Export only the parts that need authored visual art:

- Beast portrait / icon
- Enemy archetype icon / silhouette
- Energy icon / crystal
- bespoke Role icon if retained
- signature FX textures when code primitives are insufficient
- unique decorative motifs

Do **not** export complete UI panels or full screens as raster assets.

## Blocked assets

Do not mark these ASSET READY yet:

- final Beast portraits before Snowguard / Tanker Master Reference is STYLE APPROVED
- final Enemy family before the player-role anchors cohere
- Energy Rush final visual until Energy-only I/L/U ≤2-turn behavior is corrected
- STAR evolution art before V14B.3 is validated

## Layout baseline

- Gameplay target: 1280×720
- Canva reference: 1920×1080
- Player-facing GAME: no scrolling
- Priority: gameplay surface → resources → decoration

Spacing scale:

```text
4 / 8 / 12 / 16 / 24 / 32
```

Suggested radii:

```text
small  8
medium 12
large  16
```

## Component states

### Primary button
- default
- hover
- pressed
- disabled

### Secondary button
- default
- hover
- pressed
- disabled

### Run Unit card
- Reserve / ready
- selected
- Active
- injured
- KO / disabled

### Status chips
- ACTIVE
- RESERVE
- KO
- WAVE
- THREAT

### HP bar
- full
- injured
- critical
- KO

### Reserve pagination
Required because V14B roster can exceed six visible cards:

- previous
- visible range, e.g. `1–6 / 13`
- next
- disabled previous / next state

Pagination is presentation-only. It must never truncate the underlying RunRoster.

### Stored Energy
- available
- selected / interactive when appropriate
- empty / zero state

## Production naming

Examples:

```text
ui/icon/role-tanker_v01.svg
ui/icon/energy-a_v01.png

beast/snowguard/portrait_v01.png
beast/nightfang/portrait_v01.png

enemy/frontliner/icon_v01.png
enemy/diver/icon_v01.png
enemy/ranged/icon_v01.png

fx/guardian-brace_v01.png
fx/ambush-strike_v01.png
```

Statuses:

```text
DRAFT
REVIEW
STYLE APPROVED
ASSET READY
GAME READY
```

## Export rules

- transparent background for character / icon assets
- stable bounding boxes
- no embedded gameplay text inside image assets
- no baked UI shadows that prevent layout reuse
- keep editable source
- never overwrite approved source
- raster assets should support appropriate 1x / 2x exports
- SVG only for clean vector UI icons where the runtime pipeline supports it

## Screen readiness

### Beast Rush
Close to UI APPROVED.

Still needs:
- final Beast art after Master Reference approval
- readable Onet connection path

### Energy Rush
**NOT READY.**

Must fix:
- Energy-only copy and icons
- orthogonal I / L / U-style paths
- ≤2 turns
- valid empty-cell / outer-border routing
- remove the current generated `Match beasts` copy

### Battle Setup
Close to UI APPROVED.

Must support:
- current V14B vocabulary
- Active Squad / Reserve / KO
- injured vs fresh readability
- Reserve pagination for roster > 6
- one visible primary START BATTLE CTA

### Tactical Battle
Visual reference only.

Must remove generated placeholder roles such as:
- Support
- Scout
- Bruiser
- Striker

Use current gameplay roles:
- Tanker
- Assassin
- Ranger
- Mage

### Wave Result
Close to UI APPROVED.

Keep:
- next threat
- Fresh / Injured / KO roster summary
- PREPARE NEXT WAVE CTA

## Known Canva cleanup

Before the current six-screen board can be called UI APPROVED:

1. Energy Rush: replace `Match beasts...` with Energy-only matching language.
2. Energy Rush: visually prove I/L/U-style orthogonal Onet routing with ≤2 turns.
3. Battle Setup: remove `Energy will be spent to start the battle.`
4. Tactical Battle: remove placeholder roles.
5. Style System: Shield / Regen / Burn remain sample components only.
6. Battle Setup: add Reserve pagination concept for roster > 6.

## Final production gate

```text
Owner UI APPROVED
→ export approved art assets only
→ Phaser integration
→ live visual QA at 1280×720
→ GAME READY
```

Do not label the current Canva board ASSET READY until these gates are complete.
