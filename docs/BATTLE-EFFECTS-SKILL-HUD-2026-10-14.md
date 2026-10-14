# Battle — Clean effects and signature readiness HUD

2026-10-14. IMPLEMENTED / CHECK AND BUILD PASS / LIVE VISUAL QA OPEN.

Owner requested cleaner effects after a screenshot showed stacked BONK/DIZZY/POOF badges obscuring units, plus a visible indicator of skill activation readiness. Presentation-only change; combat rules and timing unchanged.

Changes:
- Removed routine hit/KO comic badges; KO uses one short label instead of killer attribution over the body. Hit rings reduced from radius 20 to 12.
- Smaller, shorter-lived damage numbers with viewport-relative bounds. Remaining status badges are smaller, higher and throttled by spatial cell (600ms); tactical status feedback remains.
- A thin blue skill strip and state label below friendly HP; gold highlights readiness. Focus reads actual hold progress; Volley reads attack count; support skills read authoritative cooldown. Brace/Ambush/Ram show conditional or spent states; Bloom explains cluster requirement rather than fabricating a timer. Bars hide on KO or when no signature exists.

Scope/limits: enemy archetypes have no signature; enemy-side Beast snapshots do not expose equivalent full signature progress, so no invented enemy meter is drawn. Conditional readiness is not a guaranteed next cast: target/range/interrupt conditions still apply. No networking protocol changes.

Validation: npm run check PASS, including new pure HUD checks for non-mutation, Focus reset/ready, KO, spent Brace and support snapshot time. npm run build PASS outside sandbox after the first sandbox Vite realpath EPERM. A local Vite server started on 127.0.0.1:5175; in-app browser navigation timed out, so animation composition, mobile readability and screenshot comparison have not been visually verified. No owner-live PASS claimed.
