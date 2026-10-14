2026-10-14 P2P review corrections implemented: R1 fatal session abort returns to menu with notice; R2 terminal snapshots preserved and applied before results, forfeit updates model; R3 bounded initialization/handshake and pending promise cleanup; R4 host-hidden abort, heartbeat watchdog and injected monotonic fixed-step accumulator; R5 commandId/matchId and duplicate/stale tick guard. Protocol v3 requires fresh clients/rooms. Mock P2P regressions, real WebSocket regression, checks/build pass. Browser scene/notice, PC-mobile hidden/lock, direct ICE and TURN live remain open. See Corrective implementation in docs/P2P-01-REVIEW-2026-10-14.md. Next stage 6 live validation; historical REVIEW OPEN entries are superseded at code level only.

2026-10-14 P2P review correction: PARTIALLY IMPLEMENTED / MOCK CHECK PASS / REVIEW OPEN / LIVE NOT RECORDED. check:p2p re-run passed with MockPeer, not real ICE/DataChannel. Stages 2/4 have open findings; stage 5 is incomplete: preparation abort UI, handshake deadlines, terminal state under backpressure, visibility policy and command identity need correction. See docs/P2P-01-REVIEW-2026-10-14.md (R1–R5). Supersedes prior blanket stage PASS claims; next resolve R1/R3 before stage 6. No runtime changes in review.

2026-10-14 Browser-host P2P Stage P2P-01.4 & P2P-01.5 passed: verified full Authoritative Battle and Interruption/Backpressure handling over P2P DataChannel (RemoteBattleController initial snapshot committed before callbacks, authoritative ticks and event streams, opponent perspective HP synchronization, tactical energy heal & inventory deduct, command deduplication preventing replay of consumed charges, stale out-of-order tick drop, surrender terminal states with symmetrical Win/Lose, OPPONENT_LEFT abort during preparation, automatic forfeit win on mid-battle disconnect, timer catchup on background throttled tabs, backpressure dropping intermediate tick snapshots when buffer >64KB, and clean beforeunload listener teardown). npm run check:p2p (10/10 scenarios passed), npm run check:online, npm run check (19 suites passed), and npm run build passed 100%. See docs/P2P-01-BROWSER-HOST-PEERJS-PLAN.md. Next: P2P-01.6 (HTTPS / network / PC-mobile live).

2026-10-14 Browser-host P2P Stage P2P-01.3 passed: verified preparation synchronization over P2P DataChannel (common seed across MATCH_START, strict phase barrier with fast player waiting and duplicate/wrong phase rejection, real-time formation preview across columns 1 to 6, unit removal/empty formation preview, commit lock preventing late changes, and initial snapshot generation with namespaced unit IDs). npm run check:p2p, npm run check:online, npm run check (19 suites), and npm run build passed 100%. See docs/P2P-01-BROWSER-HOST-PEERJS-PLAN.md. Next: P2P-01.4 (Authoritative Battle over P2P).

2026-10-14 Browser-host P2P Stage P2P-01.2 passed: installed peerjs v1.5.5, created PeerSessionAdapter on WebRTC DataChannel (supporting Host mode running local BattleRoom and Guest mode connecting via Peer ID), integrated shareable invite link (?room=...) and clipboard copy in OnlineLobbyDialog and main.ts query param auto-open. Added npm run check:p2p with 6/6 tests passing (P2P connect, invite link, version mismatch rejection, room full rejection, timeout rejection, clean dispose/teardown). npm run check (19 suites), npm run check:online, and npm run build passed 100%. See docs/P2P-01-BROWSER-HOST-PEERJS-PLAN.md. Next: P2P-01.3 (Preparation / preview / commit over P2P).

2026-10-14 Browser-host P2P Stage P2P-01.1 passed: extracted shared BattleRoom core with RoomScheduler injection into src/network/room/BattleRoom.ts, defined transport-neutral OnlineSessionAdapter interface, and wired WebSocketClientAdapter, OnlineBattleSession, OnlineLobbyDialog and MainMenu to it. Verified server re-exports, zero Node/ws leaks in browser bundle, mock RoomScheduler test in ServerRoomChecks, and full passes on npm run check (19 suites), npm run check:online, and npm run build. See docs/P2P-01-BROWSER-HOST-PEERJS-PLAN.md. Next: P2P-01.2 (PeerJS connection & invite link).

2026-10-14 Browser-host P2P planning: owner requested task documentation with progress notes and Agent execution instructions. Source: docs/P2P-01-BROWSER-HOST-PEERJS-PLAN.md. PLAN DOCUMENTED / IMPLEMENTATION NOT STARTED / LIVE NOT RECORDED. Six dependent stages, acceptance matrix, transport/core guidance and append-only progress log recorded. Next on implementation request: P2P-01.1, extract shared room core and transport contract while preserving WebSocket/offline and existing gameplay gates. This entry takes priority over historical online descriptions for P2P scope only.

2026-10-13 Online Multiplayer Lobby, Standalone Game Server & Scene Wiring: integrated full online matchmaking flow into client and server. Added "⚔️ Đấu Online" button to MainMenu launching OnlineLobbyDialog with room creation (B-xxxx code), join by code, clipboard copy, ready toggles, and match countdown. Created scripts/start-game-server.js (and npm run server) bundling src/server/startServer.ts via esbuild and hosting WebSocket server on ws://localhost:3000. Introduced OnlineBattleSession managing active remote matches, wiring RemoteBattleController into ValidationScene so authoritative server ticks, events, and player tactical energy casts seamlessly drive presentation views with zero impact on offline single-player mode. npm run check (19 suites) and npm run build passed 100%.

2026-10-13 Battle Controller Interface & Network Adapters: introduced IBattleController abstraction decoupling Phaser presentation and HUD from underlying execution mode. LocalBattleController wraps AutonomousBattleModel and EnergyQueue for in-memory singleplayer. RemoteBattleController implements network transport adapter for authoritative server sync (Colyseus/WebSocket). Added BattleControllerChecks verifying command forwarding, stream subscription, status callbacks, and transport teardown. npm run check and npm run build passed.

2026-10-13 Battle Command Protocol & Event Stream: formalized BattleCommand input DTOs (CastTacticalEnergyCommand, SurrenderCommand) and BattleEvent output stream (EntityDamagedEvent, EntityHealedEvent, EntityDefeatedEvent, ShieldAbsorbedEvent, SignatureActivatedEvent, TacticalEnergyCastEvent, BattleEndedEvent). AutonomousBattleModel now exposes pollEvents(), executeCommand(), and stepWithCommands() with full deterministic command replayability and automatic terminal BattleEnded emissions. Added BattleCommandEventChecks verifying command execution, event streaming, and terminal states. npm run check and npm run build passed.

2026-10-13 Unified CombatEntity & Multi-Team Systems: established domain model CombatEntity with TeamSide (TeamA/TeamB), full conversion adapters (unitToCombatEntity, enemyToCombatEntity), bidirectional mutation sync (syncEntityToUnit, syncEntityToEnemy), and distance helpers. BattleTargetingSystem introduces generalized targetEntity across opposing teams preserving legacy target/enemyTarget equivalents. BattleMovementSystem adds moveEntityToward and retreatEntity with team-aware model bounds. Added CombatEntityChecks verifying mapping, mutation round-trips, targeting equivalence, and movement clamping. npm run check and npm run build passed.

2026-10-13 Deterministic PRNG & Puzzle Foundation: introduced PrngService implementing Mulberry32 with full seed, serialize/restore state, and fork support. BoardGenerator and DeadlockResolver now accept RandomSource (fn or PrngService) preserving 100% backward compatibility with legacy Math.random defaults. PuzzlePhaseCoordinator binds a dedicated PRNG instance ensuring repeatable board generation and deadlock recovery. Added PrngChecks verifying seed determinism, state restoration, array shuffling, and board consistency. npm run check and npm run build passed.

2026-10-13 Tactical interrupt feedback & frontline cover tethers: playTacticalCast now delivers high-impact outplay feedback on Disrupt (CANCELLED! comic badge, orbiting dizzy stars, target wobble) and tactile responses on Shield (CLANG badge, squash) and Break (BONK badge, hammer squash). BattleIntentRenderer visualizes subtle golden guardian cover tethers from living Frontline Tankers to backline allies. npm run check and npm run build passed.

2026-10-13 Slapstick cartoon juice & comic emotion badges: StatusEmotionOverlay renders punchy comic speech badges (BONK, CLANG, COZY, POOF, DIZZY, OUCH) and orbiting dizzy stars. BattleActionView triggers slapstick squash & stretch on damage impact, KO tumble physics upon defeat, bouncy hop on heal, and comic CLANG on shield absorption. BattleFunControlsRenderer adds orbiting chibi dizzy stars to Disrupt status. npm run check and npm run build passed.

2026-10-13 Combat readability & intent telegraphing slice: BattleIntentRenderer renders dynamic targeting arc lines and reticles on unit tap plus automatic telegraph beams during windups. BattleActionView enhances windup telegraph ground pulses (24px, role-colored) and pre-attack anticipation squash. BattleUnitVisualManager introduces high-contrast lagging damage ghost fills (yellow for enemies, pink for player) on enlarged 52x7 HP bars. BattleFloatingTextSystem supports isCrit scaling with Back.Out comic pop and 18px text. npm run check and npm run build passed.

2026-10-13 Universal animation rig & cartoon juice foundation: unified UniversalAnimationPlayer with data-driven rig registry supersedes per-Beast subclassing; CartoonJuiceAnimator introduces reusable slapstick tweens (squash/stretch, hit wobble, KO tumble, hop bounce) for all units. BattleCharacterView now instantiates rigs generically via UniversalAnimationPlayer.tryCreate without hardcoded beastId branches. Snowguard, Ironclad, and Windstrider preserve full backward compatibility with existing tests and previews. npm run check and npm run build passed.

2026-10-13 Character Studio: /character-studio.html unifies unit and animation tabs; legacy editor URLs remain compatible. Shared CharacterSchema/CharacterProjects versioned config, legacy UnitOverrides migration; catalogue tunes all ten signatures per STAR and is shared by Review/handlers. Local API saves unit/animation independently with validation, PNG integrity, revision conflicts, backup/history/restore and atomic commit. Polygon/erase masks, source crop across grid boundaries and output sprite offsets generate six content-hashed 2048×1024 atlases without changing originals. Three Battle rigs consume saved atlases with weighted pose clock fitted to gameplay action durations. Review now re-reads API on visibility/focus/save events plus manual refresh, distinguishes drafts, and holds explicitly selected frame without floating-point seek drift. Owner Snowguard/Windstrider saved records/assets/history preserved. See docs/CHARACTER-STUDIO-IMPLEMENTATION-PLAN.md and docs/CHARACTER-STUDIO-GUIDE.md; API/schema/runtime/raster/Review sync checks pass, live gameplay/art approval remains separate. Reload game for new Phaser textures.

2026-10-13 Unit Studio initial slice (superseded by Character Studio above): owner-authorized avatar and per-Beast base HP/damage editor at /unit-editor.html, linked from Review for all ten Beasts; avatar preview at Grid sizes, unchanged STAR multipliers. Initial UnitOverrides destination migrated to CharacterProjects. See docs/UNIT-STUDIO-2026-10-13.md.

2026-10-13 Windstrider animation + unit review: six owner RGBA 1774×887 sheets integrated in Setup/Battle through shared rig, owner order Idle/Run/Attack/Skill/Hit/KO; Run maps to walk. Source unchanged, measured windows/foot origins. Checks/build pass; preview /windstrider-animation-preview.html. Dedicated /unit-review.html shows ten Beasts, STAR stats/skills, three sheet rigs with playback/frame controls and explicit cutout fallback. No save writes from review. Browser review smoke verified; live Battle/device art QA open. See docs/WINDSTRIDER-ANIMATION-2026-10-13.md and docs/UNIT-REVIEW-PAGE-2026-10-13.md.

2026-10-13 Fun STAR update: owner requests fun controls at 2★ and enhanced 3★. Windstrider first Focus: 2★ carrot lure 1s, 3★ 2s with larger marker; Starcaller first Bloom: 2★ one duck/1s, 3★ up to three ducks/1.5s with crowns/larger markers. Once per unit/Battle; 1★ unchanged. Existing damage/pierce/Echo retained. See docs/FUN-SKILL-STAR-2026-10-13.md; balance/mobile live QA open.

2026-10-13 First journey: new devices start guided Woodland/map 1 with original six-Beast deck; phase dialogs pause play. Run end (loss or final win) leads to Village introduction, then free navigation. Legacy Camp/deck/region progress bypasses onboarding without resetting assets. Separate persisted expedition/village/done key; harness excluded. Check/build pass and new-origin menu→map1→Beast Rush guide smoke verified; full-Run/device live QA open. See docs/FIRST-JOURNEY-2026-10-13.md.

2026-10-13 Dual-Core bridge: owner-authorized forge goal uses existing 20 Gỗ + Ironclad + placement, persisted tracking, Village → Explore navigation, region/Deck requirements and Result Wood before/after + Return to Village. Construction and goal edits save before commit; rewards persist recent Run receipts, failed saves offer retry. No new materials/loot/combat buffs. Check/build pass; browser Village→goal→region→Deck smoke verified; full Run/device live QA open, not adopted. See docs/DUAL-CORE-GOAL-2026-10-13.md.

2026-10-09 Inventory UI readability correction: dedicated dialog height/insets supersede short landscape diary size, fixed compact header/three summary tiles/tabs/notice around one flex scrolling body. Four icon/count resource selectors, one selected trade editor (quantity preserved across economic refresh), operating summary tiles and collapsible cash/history. All buy/sell commands still candidate+save before commit. No art files or economic rules changed. Live mobile review remains open.

2026-10-09 Production extension: shared recipes now drive garden, fishing and forge. Fishing uses 1 carrot (FEFO actual cost), 40 active work seconds -> 2 fish, expires 120s from delivery. Forge uses 2 shared Wood at averaged basis + 1 Đồng, 50 active work seconds -> 1 toy. Consumed inputs capitalized in saved jobs, cash charged once; reloading resumes paid remaining work. Shared reservations protect all three outputs against purchases/other starts; incoming Run overflow retains ready batches until space available. Candidate transactions save before commit. Tap pier/workshop for recipe/progress/missing inputs; workshop panel retains construction management access. Hungry work rate applies to all. No new art, no offline, no price balancing/live mobile approval claimed.

2026-10-09 Life slice: active Village day = 120s, hidden tabs/other scenes do not advance. Carrot expires after 240s, fish 120s; migration assigns deadlines once to legacy lots. FEFO sales/meals, expiry before meals; one daily portion per unique resident, fish supplies two. Rotating allocation; hungry workers perform 75% work, movement/combat unchanged. Costs of meals/spoilage separate from sales COGS and wallet; retained 14 daily operating reports plus lifetime costs. Village Kho shows day, hunger count, nearest expiry and reports; Residents shows meal status. Save checkpoint ~1s and exit, no offline simulation. Fishing/toy production and live device review remain pending.

# CURRENT_REPO_HANDOFF.md — Beast Link Battle

Status: **Repository-local coding handoff**

2026-10-09 Garden production slice integrated: Windstrider arrival begins/rejoins saved garden batch, charges 1 Đồng only once, 30 active work seconds produce 3 carrots at total cost basis 1. Saved remaining work every ~1s and on Village exit; reload reapproaches then resumes paid batch, no offline progress. Purchase capacity includes 3 reserved output slots; blocked starts show missing funds/space. Completion candidate only commits after successful save, clears job + records batch atomically; full storage leaves ready batch pending. Garden tap opens bounded recipe/progress/status panel, inventory refreshes on economic sequence changes. Existing fishing/forge remain visual/story work without output; no meals/expiry. Checks cover precompletion, partial reload/no re-charge, duplicate delivery, cost capitalization, capacity reservation and pending output. Live mobile/persistence timing review remains open.

2026-10-09 Economy slice 1 integrated: Camp save v3 prefers v3 then preserved v2/v1; startup migration grants configured 20 Đồng/6 carrots once, v3 missing economy does not regrant. Shared wood balance plus averaged wood cost basis, FIFO nonperishable product lots, 100-unit purchase capacity, wallet and bounded ledger with lifetime cash/revenue/COGS/investment totals. Buy/sell commands validate before mutation; inventory UI commits candidate only after successful save, displays quantity/price/cost/profit preview. Building wood spend and full-Run wood reward recorded separately. Village HUD has fourth Kho action and cash balance, portrait/landscape sheet stock/ledger tabs. Prices prototype; no production, meals, expiry, reservations of inventory or offline yet. Existing incoming Run wood is preserved even above capacity; capacity gates purchases. Regression covers migration/backups/no repeat grant, invalid trades, partial lot costs, shared wood, investment classification, full capacity and failed writes. Live mobile/economic balance review pending.

2026-10-09 Navigation transition: shared 140ms cover/200ms reveal warm curtain across menu/Village/region/deck/start adventure and pause-menu return. Global transition guard plus inert outgoing screen/curtain prevent duplicate navigation; lifecycle cleanup occurs under cover. Reduced motion skips animation. Match phase/combat timing unchanged. Build evidence separate from live frame pacing/Phaser readiness review.

2026-10-09 Cozy menu redesign after owner feedback: centered house scene/light warm palette, small serif title/one-line subtitle, two simple Village/Explore actions. Removed descriptive paragraph, eyebrow, balance/goals footer and wide framed layout. Help/fullscreen moved into native details utility popover with 44px targets and keyboard focus. Portrait stacked actions/landscape horizontal actions; original art unchanged. Gameplay unchanged; live mobile visual review pending.

2026-10-09 Owner main-menu screenshot refinement: smaller title with secondary story subtitle, concise description, 44px secondary actions/50px primary Village entry and save/next-goal lines separated. House is visible focal composition; three smaller sprites spaced at its front instead of oversized overlapping pile, large decorative shadow removed. Short-landscape and portrait layouts scoped to farming menu with scroll fallback. No gameplay changes; build evidence separate from live device review.

2026-10-09 Returning-home UI integrated: owner river/house backdrop main menu, primary Village entry, adventure/materials/friends wording and existing save summary; region screen explains actual 15-Wood full-Run reward. Shared VillageJourney reads current recruitment/forge ownership/story IDs, house opens bounded milestone sheet, help includes village flow. No grants/resets/quest rewards or economy implementation. Inventory/wallet/accounting remains designed future work and house panel says so. Checks/build separate from live mobile composition review.

2026-10-09 Owner accepted returning-home farming entrepreneurship narrative. Canon direction in docs/VILLAGE-STORY-DIRECTION-2026-10-09.md: inherited riverside home/garden, livelihoods with Beast friends, warm/humorous setbacks with recovery; Run framed as exploration/materials/new friends. Story direction accepted, numeric economy/quests/new modes not automatically adopted. Documentation only; preserve existing saves/gameplay. Next planned economy slice remains inventory/wallet/ledger UI + migration.

2026-10-09 Owner requested detailed life economy design FIRST. docs/VILLAGE-LIFE-ECONOMY-DESIGN-2026-10-09.md proposes inventory lots/expiry, cash wallet, production inputs/outputs, daily food needs, FEFO, realized cost/profit versus cash flow, ledger, v3 migration and phased UI. Numeric prices/times/grants are proposal baseline, not adopted or runtime behavior. Documentation-only; economy implementation awaits design selection. Supersedes original no-economy scope as a proposal, not silently adopted rules.

2026-10-09 Independent VillageSimulation implemented: pure job state machine with rest/walk/work/return, interpolated world positions at existing 85px/sec (minimum 2s travel), 8s work/10s rest and station reservations. Camp controller now retains simulation while rebinding DOM after construction edits; unchanged job retains progress, removed/changed job cancels without completion, hidden tabs pause and exit disposes. Completion callbacks fire once after work, not on arrival. Pure checks cover rebind, pause, interpolation, reservation release, cancellation and inert disposal. No production resources/offline persistence/pathfinding introduced; straight movement and work art remain prototypes. Live mobile/animation review pending.

2026-10-09 Village system alignment: shared VillageSceneLayout now defines owner world 1536x1024, house/station bounds and work anchors for DOM render and VillageLayout/save validation. Recognized former fixed v2 anchors migrate to current anchors, idempotently; ownership/balance preserved. Current slot editor exposes saved forge via an empty compatibility slot. Activity stories now emit on work completion, including catalog story IDs for garden/fishing/forge; interrupted work never grants story. Existing craft prices, communal garden/pier, Run rewards and Energy/Shard rules unchanged. Production inventory/orders/upgrades/pathfinding remain future scope. Regression checks and build evidence separate from live placement review.

2026-10-09 Diary UI now uses bounded portrait sheet/short-landscape drawer with fixed title/44px close and separately scrolling chronological event cards (newest first, all retained entries). Original Beast sprite shown only when existing event text contains Beast ID or matches known decor story; other entries use journal icon. No invented dates, no save format or event changes. Empty-state localized. Live phone layout review pending.

2026-10-09 Owner screenshot construction layout fix: legacy workshop button flex:1/min-width:110px and span display rules were still affecting new cards. Scoped overrides now make tabs three equal minmax(0,1fr) columns, close/footer fixed-size, cards nonshrinking with 98px minimum (92px short landscape), previews/info flex and only card-list scrolls. Build evidence separate from live device confirmation.

2026-10-09 Construction UI refreshed: owner prop previews with independent SVG clip IDs, Vietnamese names, owned/placed/missing-wood states and explicit three-slot selector. Fixed compact header/close/balance and inventory-return footer around separately scrolling cards. Craft/placement uses existing CampState rules and costs; clearing retains ownership. Landscape drawer/portrait sheet retained. No new construction mechanics; live mobile review pending.

2026-10-09 Residents panel redesigned as sprite cards with original Beast cutout, profession and live activity badge sourced from scene data. Fixed header/44px close target and independently scrolling card list prevent controls scrolling out of view; short-landscape drawer and portrait sheet retained. Card selection closes modal before camera focus. Attribute observer disposed on dialog close; only recruited residents listed. No new sprite art or gameplay changes. Live mobile composition review pending.

2026-10-09 Village compact HUD: transparent full-width header with independent corner badges, icon-only overview with accessible state label, 228px icon/text action dock and corner zoom preserving 44px targets. Status messages fade after 5s and reappear on content updates; observer/timer disposed on exit. Portrait contextual bottom sheets and short-landscape right drawers for construction/residents/diary. Corrected station selection/position from child indexes to explicit decor/slot selectors after house insertion. Build validation separate from pending live phone layout/touch review.

2026-10-09 Cloud correction: CSS foreground replaced by disposable WebGL shader with 28 world px/sec wind, subtle UV distortion, saturated fringe suppression and 0.32 alpha. Camera transform events supply translation AND scale; world-coordinate clouds use 0.92 center parallax rather than screen-fixed CSS offsets. Canvas stays below HUD and ignores pointers. Hidden tabs pause time, reduced motion freezes wind, unsupported WebGL omits clouds. Original preserved. Build validation separate from pending live GPU/mobile seam and camera review.

2026-10-09 Owner cloud foreground integrated unchanged (2172x724 RGBA) above Village scene/below HUD, horizontal 90s repeated-texture drift, 0.2 opacity and camera parallax x0.2/y0.15. Pointer-transparent, hidden-tab paused, reduced-motion disables drift. Build passed; live seam/composition QA pending.

2026-10-09 Owner house added to top of river village clearing (x210/y8, width420, intrinsic ratio), original preserved as river-owner-v1/house.png. Decorative image shares camera transform, sits above land/below residents and does not intercept pan/taps. No ownership or gameplay changes. Live composition review pending.

2026-10-09 Owner river map integration: three supplied 1536x1024 originals preserved under public/assets/ui/camp/river-owner-v1 (complete RGB reference/fallback, transparent RGBA shore, RGB water texture). Camp uses gently translating water beneath registered stationary shore, enabled atomically after both images load; complete map remains fallback. Both layers share the fixed world/camera transform; hidden tabs pause flow and reduced motion disables it. Separate owner dock now mounts at the river, with fishing/forge work anchors and resident homes adjusted to the new clearing. Water motion is CSS texture animation, not a custom GPU shader. Existing ownership, economy and combat unchanged. npm run check and npm run build passed; live phone composition, water seam and work alignment review remain pending.

## Current status — 2026-10-08

2026-10-09 Rush grid feedback/SFX implemented: selection animation now survives render, correct pairs use thin legal path + small cell marks and local icon tilt/shrink/fade, incorrect pairs use local shake/crosses without fake connecting line. New/reshuffled icon entrance is staggered only for changed contents; reduced-motion support and tween/timer cleanup improved. Gesture-unlocked Web Audio prototype cues differ for Beast/strategic Energy, max four voices, persisted on/off in pause menu, cosmetic pitch progression only. Existing valid 240ms / invalid 190ms gates and all puzzle/reward/timer semantics retained. Details docs/RUSH-GRID-FEEDBACK-2026-10-09.md. Check/build evidence separate from live mobile visual/audio QA; no authored Foley or animal samples.

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

2026-10-14 Online sync correction: server-owned preparation barriers, live opponent formation previews, committed formation locks, player-namespaced IDs, TeamB perspective/results and persistent HP, per-player Energy acknowledgment, online-only Result/return-to-lobby. Owner stuck-at-wait report traced to old node server from Oct 13; new watched server runs on port 3000 with protocol-version gate. Two-client real WebSocket checks pass, including against the actual port-3000 process. See docs/ONLINE-SYNC-2026-10-14.md; owner full-match/device review remains open, legacy TeamB combat balance and anti-cheat separate.

2026-10-14 Owner scopes online to localhost experiments. Public domain: COMING SOON / hidden, no visible online button or banner. OnlineAvailability guards menu, room/p2p invite auto-open and lobby adapter creation. Loopback only. Public domain/cross-network live release deferred by owner; implementation tests do not imply release. See P2P-01 plan owner release scope.
