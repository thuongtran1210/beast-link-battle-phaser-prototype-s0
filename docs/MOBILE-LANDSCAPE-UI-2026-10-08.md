# Mobile landscape presentation — 2026-10-08

Implemented first pass for the existing GAME; gameplay unchanged.

## Changes

- Mobile/coarse-pointer or short landscape viewports select compact presentation. `?mobile=1` forces it for desktop QA.
- Outer prototype header is hidden; shell uses available viewport height (`100dvh`) and safe-area insets.
- Phaser controls canvas CSS size; removed forced 100% width/height that could distort its FIT aspect ratio.
- Reference height remains 720; phones wider than 16:9 receive additional logical width at startup.
- Compact global HUD shows Wave/current phase/resources instead of six small phase labels.
- Rush board omits duplicate title/subtitle, uses more available height, enlarges portraits and hides role sublabels/accent strips.
- Rush rail consolidates timer, Combo, counts and resource queue. Ready still waits for first valid match; 12-second timer and 1.5-second combo semantics unchanged.
- Energy remains a separate queue with tactical names and counts; Beast queue uses portrait/count stacks.
- Setup/Battle gameplay and existing visual controls remain unchanged beyond global header/shell. Further touch refinement for formation and Battle controls remains a separate pass.

## Validation

`MobileLayoutChecks` covers landscape viewports 568×320, 667×375, 740×360, 844×390 and 1024×600. Checks enforce board/header/rail bounds, effective tile hit area ≥44 CSS px without safe-area deductions, desktop board scale, and overflow protection for a short layout. Safe-area reductions/browser chrome/device behavior still require physical-device testing.

`npm run check` PASS, including existing gameplay checks. Build is run after presentation changes. No phone live PASS claimed.

## Try

- Phone: open local game in landscape; compact layout is selected automatically.
- Desktop QA: `http://127.0.0.1:5173/?mobile=1`.
- Desktop default remains `http://127.0.0.1:5173/`.

Logical viewport width is chosen at startup and kept stable during the run; browser resize/orientation changes use Phaser FIT scaling without restarting gameplay. Reload in landscape for the maximum available horizontal composition after starting in portrait.
