# CURRENT_REPO_HANDOFF.md — Beast Link Battle

Status: **Repository-local coding handoff**

## Current status — 2026-10-08

2026-10-09 Village mobile correction after owner screenshot: default camera now uses close cover scale (at least 0.65) rather than fitting the entire scene, eliminating empty side gutters and retaining resident touch width. Entire viewport is the map; safe-area-aware compact header, centered three-action dock, status pill and 44px zoom controls overlay it. Overview is an explicit toggle; zoom and resident-list selection return to close view, with resident focus using current position. Construction panel floats above dock. Fixed wrong missing-workplace copy for communal professions. Pure geometry checks cover portrait/landscape/small/wide viewport filling, pan bounds, overview fitting and resident touch width. Preserve slower travel rate. Check/build evidence is separate from pending live phone interaction/composition review.

2026-10-09 Village screenshot review correction: compact 44px header/navigation, Build/Residents/Diary footer and a contextual closable construction panel replace permanently expanded craft cards. Overview action fits/centers the complete map; initial camera now prefers fit rather than cover where possible. Garden enlarged, work/home anchors adjusted nearer stations, carrot/bath moved inside the clearing, activity labels shown on focus/hover. Travel uses distance at 85 world pixels/sec with 2s minimum shared by CSS and clock, rather than fixed 1.2s; work lasts 8s/rest 10s. Fishing faces water to the right. Pure movement regression checks distance/return/diagonal speed. Original assets/save costs preserved. Procedural motion and foreground/tool alignment remain subject to live mobile review, not authored profession-sheet completion.

2026-10-09 Owner Village asset integration: four supplied originals preserved under public/assets/ui/camp/village-owner-v1. Camp now mounts a fixed 1536x1024 world with owner map, left garden and owned forge prop on right, drag camera and click/drag threshold, one shared transform for all objects. Existing baked-in map pier is the fishing work area; extra dock PNG stored rather than superimposed. Garden/pier are communal scene facilities (no cost, no crafted save unlock), available to actually discovered Windstrider/Shadowclaw; anvil still requires existing ownership/placement. Resident controller has fixed work anchors, horizontal-facing tool handling, procedural watering/fishing cycles and disposable hidden-tab-paused RAF. World coordinates ignore camera scale to avoid anchor drift. Old v2 layout/catalog world coordinates remain data prototype and are not used by this renderer; align/migrate them before serialized world placement goes live. Checks/build evidence separate from live mobile composition/touch review. Work motion is procedural prototype, not new authored sheets.

2026-10-09 Village camera correction: owner selected top-down map with right/left-only units using the supplied fenced-island reference. Design/plan/asset prompts now specify orthographic map (no horizon/isometric), original cartoon unit silhouettes, RIGHT sheets + runtime reflection, side-access work anchors and no four/eight-direction production. Current autonomous Camp prototype flips only resident images toward horizontal movement/prop; vertical movement retains facing and labels remain upright. Existing background is unchanged and is not a final top-down map. Live placement/facing/art review remains open.

2026-10-09 Owner correction on Village props/work: asset brief now requires a fixed Master Scene, in-context station composition approval, same camera/scale/light and registered transparent layers; work sheets reference Beast + prop + working composite. Current Camp gained autonomous prototype cycles at placed favorite props (rest/approach/work/return) through one disposable RAF controller, pause while hidden and reduced-motion treatment. Tap reports activity rather than initiating work. Anchors derive from rendered prop bounds. Existing anvil work uses procedural transform motion, carrot/bath are leisure; no claim of final profession clips, new Village map or fishing assets. Prop matching and authored work animation remain open.

2026-10-09 Beast Village phase 1 foundation implemented: catalog for all ten professions and three MVP stations, 1800x1200 world layout with work/approach anchors and path graph, explicit test/preview fixture (not player unlock), and version-2 Camp save under beast-link-camp-v2. Loading prefers v2 and falls back to preserved v1 if absent/unreadable; migration keeps wood/residents/ownership/history and legacy slots. Unplaced items remain inventory, station placements require ownership and valid fixed anchors, duplicate legacy/world placement sanitized; stories dedupe by stable ID. Current Camp UI uses compatibility slots, no new world UI or simulation. New garden/fishing prices remain null; no purchase/unlock or Run buffs. Asset prompts: docs/BEAST-VILLAGE-ASSET-BRIEF-2026-10-09.md. Foundation checks cover migration/reload/idempotence, fallback/failed storage, ownership/placement, fixture isolation and layout anchors. Live storage/mobile/art review remains open.

2026-10-09 Beast Village documentation: owner requested a lived-in Camp with individual professions based on the supplied village reference. Design at docs/BEAST-VILLAGE-DESIGN-2026-10-09.md and phased plan at docs/BEAST-VILLAGE-IMPLEMENTATION-PLAN-2026-10-09.md. MVP proposes Ironclad forge, Windstrider garden, Shadowclaw fishing; camera/persistent migration/simulation/art/live gates specified. Existing Camp behavior is unchanged; proposed v2 save, careers and world layout are not implemented or adopted. New station pricing and final art remain open; no image generation in this documentation task.

2026-10-09 Battle facing correction: living players face their targetEnemyId and enemies face engagedTargetId/targetUnitId using packed presentation x positions. Missing targets default toward the opposing side. Enemy cutouts/fallback icons now support both directions and directional attack/hit displacement. Player facing changes cancel transform loops carrying stale scale signs before restarting idle; authored frame sprites inherit root reflection. KO facing remains frozen. Gameplay unchanged. Checks/build pass; live facing/animation review remains open.

2026-10-09 Battle silhouette readability: replaced independent team declumping with deterministic shared packing across living player/enemy bodies. Presentation candidates reserve 100px horizontal or 106px vertical separation within the arena; nearest available positions favor each team's side, with stable ID ordering. Initial tick retains Setup anchors. Bodies sort by feet, and independently owned HP overlays follow movement at depth 210 above character bodies and below projectiles/HUD. Actual combat coordinates, targeting, damage and timing unchanged. Pure regression covers a ten-body center pile, arena bounds and snapshot-order invariance. Check/build evidence separate from pending live mobile composition and movement review; no new art assets.

2026-10-09 Animation agent workflow recorded in docs/FRAME-ANIMATION-AGENT-WORKFLOW.md and routed from AGENTS.md / ART_AGENT_INSTRUCTIONS.md. Contains reference-locked generator prompt, six eight-pose sequences, 2048×1024 requested format versus actual 1774×887 source handling, alpha/foot QA, shared rig integration, preview/check/build/live evidence discipline and a ready-to-send agent brief. Documentation-only, no generation or runtime changes in this update.

2026-10-09 Ironclad frame animation integration: six owner sheets mapped in supplied order Idle/Walk/Attack/Skill/Hit/KO and copied unchanged to public/assets/characters/bear-hammer/animation_v01. All are transparent 1774×887, eight frames each. IroncladFrames.json uses alpha foot anchors from the central boot band to avoid anchoring on the hammer below the feet; no bitmap edits or regenerated poses. Existing frame player now accepts a per-character rig, with separate texture/animation namespaces for Snowguard and Ironclad. Both keep one-shot/locomotion/Skill priority and KO hold semantics, verified by the expanded fake-scene suite. Ironclad uses sheet playback in Setup/Battle; other characters/Camp remain cutouts. Preview /ironclad-animation-preview.html. No mechanics or damage timing changes. OWNER-SUPPLIED / INTEGRATED; live combat and owner visual review open.

2026-10-09 Snowguard frame animation integration: six owner-supplied transparent sheets copied unchanged to public/assets/characters/duck-guardian/animation_v01 (idle/walk/ko/hit/skill/attack). Actual resolution 1774×887, 4×2 cells with integer boundaries of 443/444 pixels. SnowguardFrames.json records frame windows and threshold-alpha foot anchors; per-sheet neutral-frame calibration keeps scale coherent and idle height variation is damped. Phaser Sprite playback replaces Snowguard transform motion in Setup/Battle only. Walk follows presentation movement, one-shots resume latest locomotion, Skill is protected from Attack/Hit interruption, KO overrides/holds last frame and revive returns Idle. Other units and Camp cutouts retain original motion. No combat timing changes: damage still resolves independently of visual animation. Pure fake-scene checks cover action/loop priority, KO hold/revive/disposal and frame bounds. Preview: /snowguard-animation-preview.html. OWNER-SUPPLIED / INTEGRATED; live combat timing and visual review remain open.

2026-10-09 Setup idle-motion fix: deployed player cutouts now mount inside a positioned parent container. BattleCharacterView.root stays at local origin, so its repeating idle y tween cannot interpolate between the formation's world-space y and zero. Character disposal remains owned by Setup before parent destruction. Formation/drop behavior and idle motion profiles unchanged. Check/build evidence separate from pending live drag/drop recheck.

Setup mobile footer refinement: dedicated reserve rendering replaces repeated large merge/copy panels with four portrait cards, stars, stack counts and an eligible-merge hint. Selected Beast role/HP appears in one contextual lower strip with a single eligible Merge action; consumption and controller callbacks unchanged. Previous/next use large full-height arrow hit regions, with page/deployed/KO counts in the heading. Empty bench remains a valid drop-back region. Upgrade/Start use two rounded 100px logical-height buttons with muted wooden edges; ready Start is warm gold and upgrade shows current shards versus cost. No neon treatment, resource duplication or changes to roster/capacity rules. Build/check evidence is separate from pending live mobile visual/touch review.

Owner Energy icon integration: original transparent 1254×1254 sheet preserved at public/assets/ui/energy/owner-icons-v1.png. Phaser texture frames use padded square windows (no raster edits): medical patch → energy-a/Mend; paw shield → energy-e/Guard; mallet/cracked armor → energy-c/Break; purple glove → energy-f/Disrupt. Shared createIconImage selects owner frames throughout Rush, inventory and Battle controls; generated icons remain the missing-texture fallback and legacy Rescue/Pierce are unchanged. No Energy behavior changes. OWNER-SUPPLIED / INTEGRATED; live mobile icon readability remains open.

Unified mobile Setup/Battle presentation: Setup renders the owner Battle background and the same full-body player/enemy cutouts in their actual model spawn positions. Shared createPlayerBattleLayout drives both phases; six lanes remain vertical and Front/Mid/Back horizontal. Ground ellipses replace boxed formation cells; enemy list rail removed. Reserve and compact upgrade/Start actions stay below the field, with a clear lower-left pause-button pocket. Mobile merge activates only for a selected eligible reserve card. Battle initial snapshot skips declumping offsets to preserve Setup anchors; normal combat declumping resumes after ticks. Formation IDs, limits, costs, targeting and combat semantics unchanged. Added regressions against actual PLAYER/ENEMY_SPAWN_X for all 18 positions and multiple mobile widths. Dense six-lane ground markers do not inherit the old rotated-grid 44px touch-target claim. Desktop override/harness retain their Setup presentation. Check/build evidence separate from pending live mobile touch/composition review.

Owner Camp art integration: original background and transparent furniture atlas copied unchanged to public/assets/ui/camp/owner-background-v1.png and owner-furniture-v1.png. Camp uses SVG viewBox windows for tub/carrot/toy workbench, scattered smaller residents, names on interaction and a compact craft toolbar. Quiet plus markers replace large empty station boxes; selection uses a small ground underline. Background uses aspect-preserving cover, so extreme viewport ratios crop edges. Existing save/craft/reward mechanics unchanged. Tub soaking remains a clipped cutout interaction; a separate front-rim layer has not been authored. OWNER-SUPPLIED / INTEGRATED; device composition and occlusion QA remain open.

Setup mobile readability follow-up: player board/tray expand to actual logical viewport width and right action rail anchors to screen edge, removing unused wide-screen space. Empty slots use quiet sage fill/strokes; rounded board/enemy surfaces reduce panel clutter. Reserve groups only same Beast/STAR/HP/status bodies into count-badged representative cards; deployment reveals next instance and merge operates on the unchanged roster. Injured bodies with different HP remain distinct. Added grouping and wide-board geometry regressions; live touch QA remains open.

Owner-supplied forest camp Battle background integrated: original PNG copied unchanged to public/assets/backgrounds/owner-camp-battle-v1.png, preloaded as owner-camp-battle and rendered at depth -10 behind characters/VFX/HUD in showcase Battle. Uses aspect-preserving cover scaling with canvas overflow clipping; widest phones crop image edges rather than stretching. Existing code-drawn arena remains a missing-texture fallback. Gameplay/positioning unchanged. OWNER-SUPPLIED / INTEGRATED; live phone composition QA open.

Vietnamese default player presentation: HTML lang=vi, centralized Vietnamese dictionary/formatting at DOM and Phaser Text display boundaries. Menu, level/deck, Camp, phase labels, skill controls and common dynamic counters/instructions translated. Proper Beast names and runtime IDs remain unchanged; source mechanics/catalog values and saved state are not translated. Harness bypasses display translation. Unmapped copy falls back to English. Regression checks cover proper-name boundaries, IDs, counters, craft costs and idempotent DOM translation; build/check evidence separate from live text-fitting review.

Camp & Dorm first prototype: menu entry, local-device residents discovered on actual recruitment, 25-wood welcome gift, +15 wood on full player Run victory with per-Run duplicate guard, three decor positions and craft/move controls. Existing cutouts provide resident motion and favorite tub/carrot/forge interactions; Diary stores arrival and favorite dialogue. No Camp Run buffs, crystals, slot expansion or photo export in this slice. See docs/CAMP-DORM-2026-10-08.md. Deterministic save/craft checks and build pass; live visual QA remains open.

Clean projectiles: Ranger/Mage resolved attacks now emit arrows/eyed magic orbs toward actual event targets. Support/control Signature events emit hearts/toy boxes/bubbles/bombs, replacing generic damaging shots. Legacy ranged beam/aura stacks and redundant ranged hit rings are suppressed. Persistent control props use bobbing ducks, larger bubbles and shorter humorous labels; toy shields use robot props and bomb fuse expiry produces a single smoke puff. No combat timing/targeting/balance changes. See docs/CLEAN-PROJECTILES-2026-10-08.md; build/check evidence remains separate from live QA.

Battle readability correction: HUD global visibility now preserves intentionally hidden HP/detail/hint elements (previously setVisible(true) revealed all, causing duplicate tooltips and hints over units). Mobile enemy header is 48px high; cast recap/detail share a reserved band above the dock. HUD depth is 500, target feedback 252; short target labels last less time, tactical pulse is smaller, signature notice uses the header/arena gap and mobile trails are thinner/less opaque. Arena and unit presentation bounds reserve the lower feedback/dock area. Cast icon colors remain, outer rings use neutral/suggested strokes. Gameplay unchanged. Check/build passes; screenshot/device validation remains open.

Level selection: Main Menu → region selection → six-unit deck → Run. Three freely selectable regions (Woodland Trail, Shadow Crossing, Beast Stronghold) use different three-Wave encounter sequences from existing enemy fixtures; no stat rebalance or artificial locks. Region selection is captured by the scene Run controller, and restart retains it. Final-Wave Run victory records a local-device cleared badge. Test harness keeps the original default Wave sequence. Checks cover selection validation, progression/reset boundaries, fixture isolation and harness compatibility; live UI QA remains open.

Mobile UI refresh: GAME now opens a standalone main menu, then Play opens a separate six-unit deck picker with Back, selected-unit strip and compact responsive cards. In-Run menu pauses/resumes or explicitly ends the Run; portrait gameplay displays a rotation notice. Setup uses a touch-oriented 6-lane by 3-depth player board with identical slot IDs, compact enemy summary, larger separate Reserve selection/merge regions and upgrade/Start controls. Rush inventory and shared colors use neutral sage/charcoal strokes. See docs/MOBILE-UI-REFRESH-2026-10-08.md. Check/build evidence is separate from live device review; browser initialization failed in this session.

Owner-authorized squad capacity experiment: Battle Setup can spend 2 Link Shards to expand deployment from 4 to 5 for the current Run. Purchase is one-time, persists across Waves and resets with RunRoster on new Run. Formation grid and recruitment are unchanged; no sixth slot. Controller click/drag caps, board summary, tray count and Start Battle gate use the Run-owned limit. Shard spending is recorded in metrics. Deterministic checks cover insufficient funds, exact consumption, duplicate purchase, fifth/sixth placement, movement at cap and reset. Live mobile QA and balance/adoption remain open.

Owner deck UI reference integration: transparent supplied atlas preserved at `public/assets/ui/deck/owner-atlas-v1.png`; composition reference stored alongside it. Deck picker uses CSS sprite windows for card frames, wooden title and Start button, existing character portraits, selected checks, upper-right count and fixed footer. Responsive 6/5/3-column card list scrolls independently of controls. Full-deck click now explains that a card must be unselected first. Selection/storage/pool rules unchanged. Build/check evidence separate from live visual review.

Owner-authorized strategic Energy prototype: player Rush/inventory/Cast slots now use MEND / GUARD / BREAK / DISRUPT. GUARD (`energy-e`) tops frontline temporary shield up to 60 for at least 3s, without healing; an active shield of at least 60 blocks wasteful recasting. DISRUPT (`energy-f`) prioritizes an enemy with an active windup, cancels that windup and blocks action/movement for 1s; already controlled enemies are excluded. Legacy RESCUE/PIERCE catalog entries remain callable for historical deterministic fixtures but are not generated in the player Rush. Charge persistence remains unchanged. Target-specific labels distinguish shield/interrupt from HP effects. Checks cover consumption, full-HP Guard, repeated-cast rejection, windup suggestion/cancellation, zero damage and control expiry. Balance, live timing and strategic value review remain open; RALLY and anti-knockback are not implemented in this pass.

Latest roster milestone: ten player units and fixed-six deck are implemented. Woolkeeper (heal), Hophex (bubble control), Gadgetduck (toy shield), Boomhog (timed bomb) use existing owner assets with distinct recipient/fuse markers. See `docs/DECK-ROSTER-EXPANSION-2026-10-08.md` for mechanics, current Mage movement/stat baseline and validation. This supersedes the earlier seven-unit milestone below; balance/adoption/live QA remain open.

Roster expansion milestone 1: Sheep Cleric / Woolkeeper (`beast-g`, Mage positioning with support behavior) is now selectable in the deck, recruited/merged/deployed through existing systems, and uses owner sheep assets. Instead of dealing attack damage it heals the lowest-HP-ratio living injured ally: 14 HP / 4s at 1★, 22 HP / 3s at 2★, 28 HP to up to two allies / 3s plus 18-point shields lasting 2s at 3★. Heart and wool-frame effects identify recipient and tier. Full-health and KO allies are excluded. Roster is now seven; the planned Frog/Engineer/Bomber units are not yet integrated, and fixed-six deck conversion remains pending the ten-unit milestone. Experimental balance/live review open.

Owner-authorized deck prototype: player GAME opens a pre-Run HTML deck picker for the six gameplay-ready Beasts. Choose 4–6 unique types, persist selection locally, then lock that pool for all Beast Rush Waves. New Run / Deck ends the current Run and reopens selection. Test harness bypasses the picker and retains the full default pool. No additional library units are gameplay-enabled. Deterministic deck checks cover malformed/duplicate/unavailable selections, pool locking and copy isolation. Smaller pools affect matching difficulty; balance and mobile live review remain open.

Setup/mobile and UI palette refinement: mobile Reserve pages show four wider cards; player/enemy formation slots are wider and the fixed STAR ladder is hidden on compact screens. Merge eligibility/cost remains on cards. Shared HUD surfaces use muted charcoal/sage and subdued accent borders; unselected Rush/Reserve cells use neutral strokes. Icon identity colors and selected/action feedback remain. Check/build evidence separate from pending owner/device visual QA.

Owner-authorized fun-skill experiment: 3★ Windstrider's first Focus activation adds a 2s carrot lure to one target; 3★ Starcaller's first Bloom adds 1.5s duck control to up to three surviving nearby targets. Timeline enemies stop attacks while controlled; carrot targets move toward the lure. Each is once per unit per Battle, with existing damage behavior retained. Flat carrot/duck markers replace layered 3★ Focus/Bloom FX while controlled. Deterministic checks cover 2★ exclusion, 3★ activation, bounded target count, no windup during control and expiry. Balance/adoption and live readability review remain open.

Battle ground presentation: a code-drawn flat chibi grass/dirt arena now renders behind showcase combat. Muted green/tan broad shapes, thick contours, sparse edge bushes/rocks and an open center follow the owner's simple cutout direction. Background is separate from fading formation guides and is disposed with BattleActionView. No gameplay changes. Checks/build evidence separate from pending owner visual review.

Setup UI: larger formation cells and clearer Reserve identity/STAR cards. Each Reserve card now exposes MERGE when `RunRoster.consolidationPreview` allows it, with 3-copy or 2-copy + 1-shard cost visible. The existing consolidation callback applies consumption, attrition HP, primary-ID preservation and metrics; no merge-rule changes. Disabled cards show copy requirements/max STAR. Deterministic merge suite remains the source for eligibility validation; live touch/layout QA is open.

Battle mobile refinement: side context is reduced to enemy count/HP/status. Skill descriptions and eligibility reason appear while pressing a circular skill; holding at least 350ms inspects without casting, quick release casts if eligible. Successful casts show −1 CHARGE near their slot; existing target heal/damage FX remain. Battlefield presentation expands horizontally on wider screens and reserves space above the dock. Gameplay rules unchanged. Automated checks pass; physical-mobile visual and touch QA remains open.

Battle Cast presentation: four fixed circular Tactical Energy buttons now sit bottom-center of the battlefield, with charge badges and READY / SUGGESTED / DISABLED states. Side rail retains battle context and catalog effect hints. Cast eligibility and callbacks are unchanged. Checks/build validation recorded; device-live visual QA remains open.

Latest presentation pass: compact mobile landscape shell, global HUD and Rush board/rail implemented; gameplay unchanged. Force QA using `?mobile=1`. Deterministic mobile board bounds/touch-target checks pass alongside gameplay suite; device-live QA open. See `docs/MOBILE-LANDSCAPE-UI-2026-10-08.md`. Setup/Battle-specific touch layout is not claimed complete.

### Latest owner art integration

Latest icon pass: all 27 library entries and 6 Beast / 3 enemy active slots now reference the owner's colored `icon_v02.png` portraits. Body sprites unchanged. Axe badge and alternate polar-bear portrait stored separately. See `docs/OWNER-PORTRAIT-UPDATE-2026-10-08.md`; live QA remains open.

Latest completion: **6/6 Beast + 3/3 enemy archetype art integrated**, with Starcaller now using purple badger mage and enemies using penguin knight / crow assassin / deer archer. A 27-character, 54-PNG asset library and JSON manifest have been exported from the owner's complete sheet. Remaining library characters have no new gameplay. See `docs/OWNER-ROSTER-COMPLETION-2026-10-08.md`. Owner live QA remains open; previous paragraph records the earlier five-character pass.

Owner requested direct use of a supplied five-character lineup and portrait sheet. Five Beast body/icon pairs now use `base_owner_v01.png` / `icon_owner_v01.png` by default (including the existing `?art=preview` URL): Snowguard = duck/shield, Ironclad = bear/hammer, Windstrider = rabbit/bow, Swiftwing = fox/bow, Shadowclaw = raccoon/sword. Starcaller and enemies retain V2 art. HP anchors/reference scales adjusted for normalized PNG canvases; gameplay unchanged. Source sheets/export script and analysis are recorded in `docs/OWNER-ART-INTEGRATION-2026-10-08.md`. Status: OWNER-SUPPLIED / INTEGRATED / LIVE QA OPEN. Earlier Snowguard candidates remain archived in-place; the query no longer opts into them.

- V14A: **OWNER STRUCTURAL PASS** / Experimental / not adopted.
- V14B.1/B.2: **CORE IMPLEMENTED**; owner-live evidence open.
- V14B.3: **IMPLEMENTED**; code review PASS; live hypothesis validation open.
- V14C.1: **IMPLEMENTED**; deterministic/build evidence PASS; owner-live open.
- V14C.2: **IMPLEMENTED / DETERMINISTIC PASS / EXPERIMENTAL**; live evidence open — `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`.
- V14C.1a: **IMPLEMENTED / DETERMINISTIC PASS / OWNER-LIVE OPEN** — First-Match Start Buffer. See `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`.
- V14C.1a.1: **IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED** — Timing State Hardening & Repo Closeout. Remote implementation: `1833f5a746cc414e5fdfc489b244c7969a61670c`.
- V14E: **IMPLEMENTED / DETERMINISTIC EVIDENCE HARDENED / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED** — remote baseline `33dbaa1f3ac684c5785c8b863383f4b6cad8cf47`.
- V14E.1: **IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED** — Policy Semantics & Evidence Hardening. See `docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`.
- P1-V14F.1: **IMPLEMENTED / DETERMINISTIC PASS / LIVE A–H OPEN / EXPERIMENTAL** — Energy cast reliability + initial Setup roster presentation. Remote main: `8666a5eeb27c6bc4ef0ef9fdc918d23524adc5f8`.
- P1-V14F.1c: **PLAYER-SURFACE VISUAL CLOSEOUT / FORMATION-BOARD IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED** — Battle Setup visual hierarchy remains a live screenshot gate. See `docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`.
- P1-V14G.1: **CORE IMPLEMENTED / DETERMINISTIC PASS / REMOTE VERIFIED / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED** — Tactical Energy Core at `1102a0771c1c086a2bc85b30bd57c449877aba7d`.
- P1-V14G.2: **PLAYER SURFACE IMPLEMENTED / G.2-SPECIFIC DETERMINISTIC PASS / CHECK-BUILD PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED** — evidence through `3659e75313c80b0910509050ac2979e028684470`.
- P1-V14G.2.3: **PRE-LIVE CLOSEOUT COMPLETE** — three-layer Battle Energy rows, canonical Beast feedback, canonical-name regression check.
- P1-V14G.3: **BATTLE SYSTEM OWNER-LIVE PASS / EXPERIMENTAL / NOT ADOPTED** — Battle-time tactical Energy communication accepted by owner.
- P1-V14G.4A: **CORE IDENTITY SURFACE IMPLEMENTED / DETERMINISTIC PASS / OWNER LIVE PASS / EXPERIMENTAL / NOT ADOPTED** — Energy Rush tactical names, complete zero-count inventory, and catalog effect hints are accepted live. G.4B NEXT THREAT remains deferred by default.
- P1-V14G.5: **REVIEW STILL OPEN / Tactical Energy remains Experimental / not adopted** — see `docs/P1-V14G5-TACTICAL-ENERGY-REVIEW-ADOPTION-GATE.md`.
- P1-V15A: **IMPLEMENTED / DETERMINISTIC PASS / BUILD PASS / LIVE VISUAL QA OPEN / EXPERIMENTAL** — six unique Beast Signatures + behavioral STAR evolution. See `docs/P1-V15A-UNIT-IDENTITY-STAR-EVOLUTION.md`.
- Squad Capacity Upgrade: **NOT STARTED**.

This file mirrors the current implementation priorities so coding agents can work **without querying Notion MCP**.

## Coding-agent source order

For gameplay/code tasks, use only repository-local sources unless the user explicitly requests a Notion sync:

1. `AI_INSTRUCTIONS.md`
2. this file
3. active V15A slice: `docs/P1-V15A-UNIT-IDENTITY-STAR-EVOLUTION.md`
4. unresolved Tactical Energy review gate: `docs/P1-V14G5-TACTICAL-ENERGY-REVIEW-ADOPTION-GATE.md`
4. completed Energy Rush identity slice: `docs/P1-V14G4-ENERGY-RUSH-TACTICAL-IDENTITY-CLOSEOUT.md`
4. parent V14G spec: `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md`
4. completed player-surface slice: `docs/P1-V14G2-TACTICAL-ENERGY-PLAYER-SURFACE.md`
5. completed pre-live closeout: `docs/P1-V14G23-LIVE-GATE-PREP-DOC-SYNC.md`
4. parent tactical Energy spec: `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md`
4. player-surface visual closeout: `docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`
4. implemented F.1 baseline: `docs/P1-V14F1-BATTLE-UX-ENERGY-CAST-RELIABILITY.md`
4. completed corrective validation slice: `docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`
5. integration baseline: `docs/P1-V14E-INTEGRATION-VALIDATION.md`
6. implemented gameplay slice: `docs/P1-V14D-PERSISTENT-ENERGY.md`
6. completed closeout slice: `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
7. previous corrective slice: `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
8. implemented reward slice: `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
9. previous timing slice: `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
10. `docs/P1-V14B3-STAR-POWER-DENSITY.md`
11. `docs/P1-V14B1-B2-RUN-ROSTER-ATTRITION.md`
12. `docs/P1-V14-MULTI-WAVE-RESOURCE-COMMITMENT.md`
13. relevant historical slice docs
14. current code/tests

If repository docs conflict with current code, inspect the code and report the conflict. Do not call Notion automatically.

### Active presentation gate — V2-M4

- **Simple Chibi Cutout V2** is the current art/presentation source of truth.
- 6 / 6 player Beasts and 3 / 3 enemy archetypes are integrated as authored cutouts.
- Attack / Hit / KO are transform-driven; Signature power remains VFX-driven.
- latest M4 scale / spacing / HP-anchor polish is implemented.
- M4 deterministic/readability gate passed at GitHub Actions run 163; repository is green through run 165.
- **Current blocker:** owner live re-QA of the latest 1280×720 Battle composition.
- **Next:** final portfolio capture only after live readability PASS.
- Gameplay remains frozen; Tactical Energy adoption is a separate open design decision.

## Current milestone

**FINAL ART PHASE V2 — Scale / Spacing / Readability Live Re-QA**

Status: **FULL CUTOUT ROSTER COMPLETE / READABILITY POLISH IMPLEMENTED / CI PASS**

Latest visual review found:
- characters were too small relative to the battlefield;
- clustered units overlapped too tightly;
- HP anchors needed retuning after cutout migration.

Implemented:
- player display heights: 112–124 px;
- enemy display heights: 108–116 px;
- HP/effect anchors retuned;
- wider vertical declumping;
- both teams pulled slightly toward battle center for stronger composition;
- deterministic minimum-scale guard added;
- GitHub Actions run 163 PASS.

Immediate owner QA:
1. refresh latest build;
2. press `L`;
3. capture one Battle frame;
4. verify larger readable silhouettes and reduced overlap.

After PASS:
**final portfolio capture + showcase documentation**.

Gameplay remains frozen.

## B.1/B.2 implementation baseline

Latest verified baseline commit:

`6d1f40b2b4fe97d0b4e0b74e65fc74048acec4b1` — `fix(run): clear wave deployment while preserving roster`

Implemented and regression-covered:
- persistent `RunRoster` with stable per-run instance IDs
- partial deployment with Experimental Active Squad cap = 4
- Battle spawn from persistent HP
- Battle-end HP / KO reconciliation by instance ID
- Wave transition preserves roster body state
- Wave transition clears deployment/slot assignments
- each new Battle Setup starts from `ACTIVE 0 / 4`
- living survivors return to Reserve
- new recruits join the same Reserve
- KO persists and remains unavailable
- board → Reserve frees an Active slot
- Reserve may remain non-empty when Battle starts

Owner-live A–H remains a separate evidence gate. Do **not** retroactively mark B.1/B.2 owner-live PASS unless explicitly verified.

## Implemented Slice History & Operational Status

### P1-V14B.1 / B.2 — Run Roster, Partial Deployment & Attrition
- Persistent `RunRoster` maintains stable unit instances across Waves.
- Partial deployment allows deploying 1–4 units (Active Squad cap = 4).
- Persistent HP and KO status reconcile back to Roster after Battle.
- Wave transition clears deployment slots (`ACTIVE 0 / 4` at each setup).
- Old living units and new recruits coexist in Reserve.
- Core implemented; deterministic checks pass; owner-live A–H open.

### P1-V14B.3 — STAR Consolidation / Power Density
- Automatic greedy conversion stopped: recruitment produces separate 1★ Run Unit instances.
- Optional manual Reserve-only consolidation (cost structure: 1 / 3 / 9).
- Aggregate health ratio preserved (no full-heal upon consolidation).
- KO and deployed units excluded from consolidation.
- Centralized STAR stat profile and signature scaling.
- Implemented; code review PASS; live hypothesis validation open.

### P1-V14C.1 — Combo Quality Signal
- Decoupled 12.0s phase timer from 1.5s Combo link window.
- Match count = Beast quantity; Combo streak = quality signal.
- Implemented; deterministic/build PASS; owner-live open.

### P1-V14C.2 — Link Shard Consolidation Efficiency
- Best streak in Beast Rush awards Link Shards (streak 4–6: 1, 7+: 2, max 2/rush, run cap 3).
- Shards persist across Waves and substitute for 1 missing copy in Reserve consolidation.
- Requires minimum 2 real Beast bodies; 0 phantom HP.
- Implemented / deterministic PASS / Experimental; live evidence open.

### P1-V14C.1a — First-Match Start Buffer
- Both Beast Rush and Energy Rush enter `READY 12.0s`.
- Player observes board freely; invalid input does not start timer.
- First valid match starts the timer exactly once.
- Implemented / deterministic PASS / owner-live open.

### P1-V14C.1a.1 — Timing State Hardening & Repo Closeout
- Terminal state rule enforced: `ENDED → start()` is a NO-OP; `ENDED → update()` is a NO-OP; `remainingSeconds` stays 0.
- Only `reset()` returns `ENDED → READY 12.0s`.
- Remote implementation verified at `1833f5a746cc414e5fdfc489b244c7969a61670c`.
- Deterministic/check/build evidence PASS per implementation report; live browser closeout not recorded.

### P1-V14D — Persistent Energy / Save-vs-Spend Across Waves
- Active gameplay slice.
- `EnergyQueue` is Run-scoped; unused charges persist across Waves.
- `resetWavePreparation()` preserves `energyQueue`.
- `restartRun()` clears `energyQueue` (0 cross-run leakage).
- No storage cap (charges may exceed 6 and 20).
- Implemented / deterministic PASS / Experimental.

## Active / Deferred Gameplay Slices

- **P1-V14E — Integration Validation**: IMPLEMENTED / DETERMINISTIC EVIDENCE HARDENED / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED.
- **P1-V14E.1 — Policy Semantics & Evidence Hardening**: IMPLEMENTED / DETERMINISTIC PASS / LIVE NOT RECORDED / EXPERIMENTAL / NOT ADOPTED.
- **Squad Capacity Upgrade**: Future experiment. NOT STARTED.
- **Still deferred**:
  - new Tactical Energy types
  - revive / resting recovery
  - post-Wave healing rewards
  - items / equipment / traits
  - economy / meta progression
  - procedural Waves
  - final STAR evolution art

## Open Earlier Evidence Gates

- B.1/B.2 owner-live A–H remains unclosed unless explicitly verified.
- P1-V13A full live signature A/B verification remains open.
- P1-V13A.1D Deployment Workspace UX remains not passed.
- These are not silently closed by V14 slices.

## Active Documentation
Read:
- `docs/P1-V14G2-TACTICAL-ENERGY-PLAYER-SURFACE.md`
- `docs/P1-V14G-ENERGY-IDENTITY-ACTIVATION-GRAMMAR.md`
- `docs/P1-V14F1C-BATTLE-SETUP-VISUAL-CLOSEOUT.md`
- `docs/P1-V14F1-BATTLE-UX-ENERGY-CAST-RELIABILITY.md`
- `docs/P1-V14E1-POLICY-EVIDENCE-HARDENING.md`
- `docs/P1-V14E-INTEGRATION-VALIDATION.md`
- `docs/P1-V14D-PERSISTENT-ENERGY.md`
- `docs/P1-V14C1A1-TIMING-STATE-HARDENING.md`
- `docs/P1-V14C1A-FIRST-MATCH-START-BUFFER.md`
- `docs/P1-V14C2-LINK-SHARD-CONSOLIDATION-EFFICIENCY.md`
- `docs/P1-V14C1-COMBO-QUALITY-SIGNAL.md`
- `docs/P1-V14B3-STAR-POWER-DENSITY.md`

## UI Validation Update — Beast Rush Right Rail — 2026-10-03

**Owner visual status: PASS.**

The Beast Rush right rail has been accepted as the correct information-hierarchy direction:
- right rail behaves as a **live resource HUD**, not an instruction panel
- Combo time + meter is the primary focal point
- MATCHES / RECRUITED are compact counters
- Beast Queue uses visual Beast stacks / copy counts
- queue copy count uses `×N` and does not imply automatic STAR consolidation
- event feedback is compact and transient
- paragraph-style persistent instructions were removed from the right rail

This PASS is for **visual hierarchy / presentation direction**, not final production-art quality.

The current project style still targets Cute Tactical Chibi; final Beast art / production asset polish remains a separate art gate.

Reported implementation SHA for the right-rail slice: `ec7a60acd6fb3a26cbc75ff05c5d9afdd85035bb`.
During documentation sync, that SHA was not visible on the connected GitHub remote, so record it as **owner-reported implementation evidence** rather than remote-verified commit evidence.

Do not apply the same redesign to Energy Rush automatically; Energy Rush remains a separate UI slice.

## Latest B.3 Repository Evidence — 2026-10-03

GitHub main now contains:

`603391e3181ec02ffb75f7ff76cd72f03f120433` — `feat(run): add player STAR consolidation`

Remote code evidence includes:
- recruitment path changed from greedy `bulk(...)` use to separate 1★ recruitment
- Reserve-only player STAR consolidation path
- deterministic primary instance preservation strategy
- aggregate-health-ratio consolidation handling
- shared STAR stat profile
- STAR-scaled existing signatures
- deterministic B.3 checks and breadth/density harness code

This means B.3 is no longer merely “implementation pending”.
However, command-run evidence and owner live B.3 validation must still be tracked separately before B.3 can be called PASS or adopted.
# Energy Rush presentation update (2026-10-08)

See `docs/ENERGY-RUSH-UI-2026-10-08.md`. Dedicated Energy HUD, visible tactical tile names, distinct glyphs, effect descriptions, and stored/carry/current-Rush totals are implemented. Automated checks and build pass; live mobile visual review remains outstanding.
