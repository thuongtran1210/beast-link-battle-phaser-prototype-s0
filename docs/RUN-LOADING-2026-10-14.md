# Lobby to Run loading

Owner requested a smooth loading screen when entering gameplay (2026-10-14).

Implemented in `RunLoadingScreen.ts`, `main.ts`, `ValidationScene.ts` and `prototype.css`.

- Cream/sage full-shell cover, three animated vector paw prints, Vietnamese preparation text, actual asset progress from Phaser Loader.
- All `startRun` paths covered: deck selection, first expedition and localhost online.
- Cover is mounted before Phaser construction. Scene CREATE signals readiness after setup; two animation frames allow a rendered scene before the 260ms reveal. No artificial percentage or fixed loading duration.
- Compact landscape spacing and reduced-motion support; blocks accidental input while loading. Exit/abort removes overlay and listeners. Startup failure rendering also reaches CREATE so the error view is revealed.
- Existing DOM navigation curtain remains in place. Gameplay mechanics and online release gate unchanged.

Validation: TypeScript and production build PASS. Browser/device appearance and slow-network transition QA OPEN. Suggested local check: enter an expedition with cache disabled, verify progress/reveal and input; repeat with cached assets, mobile landscape and reduced motion; verify localhost online entry and return to menu.

Owner follow-up: region selection to deck picker now uses the same cream/sage loading cover with region-specific text. Waits for portrait image decode (failures settled; 8s upper bound), holds 400ms for transition readability, then fades to deck picker. Reduced motion skips the hold/animation. No fabricated progress percentage. Production build checked; live device QA remains open.

2026-10-14 Lobby action clarity: always-visible title/description inside each action; Về làng (meet beasts/build), Đi thám hiểm (recruit/3 waves/Wood), Đấu bạn bè (1v1/four hearts, localhost only). Expedition gold primary, village cream secondary, online blue. Compact landscape typography, focus/hover character feedback with reduced-motion support; first-journey routing/copy preserved. Build verified; live composition QA open.

2026-10-14 Expedition journey map trial: replaces region card list with SVG landscape, curved route from village through three independently selectable region landmarks, completion flags and selected-point marker. Separate detail panel shows existing encounters and 15 Wood completion reward; explicit Prepare squad CTA retains loading to deck picker. Scrollable landscape map/mobile side panel and portrait stacked panel; forge objective note retained. No unlock/progression/encounter changes. Production build PASS; browser/device visual review OPEN.

2026-10-14 Owner rejects initial map appearance/landscape fit. Refined existing vector map with tree groves, soft shadows, framed landscape and existing region portraits. Desktop details no longer stretch into excessive empty space. Landscape <=500px: full route fits without forced 540px map minimum; 210–260px detail column, independently scrollable detail copy, persistent 44px CTA, safe-area padding. <=350px hides secondary story/header note for space. Build PASS; real phone appearance review remains OPEN.
