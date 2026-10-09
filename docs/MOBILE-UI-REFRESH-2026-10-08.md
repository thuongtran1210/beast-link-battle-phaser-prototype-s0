# Mobile UI refresh

Owner request: comprehensive mobile presentation and a main menu, with unit selection on a separate screen before the Run.

## Analysis

The old landing surface opened the deck directly. Long atlas-framed cards made selection scroll-heavy on short landscape phones; repeated CSS overrides and small text weakened hierarchy. Setup gave equal space to two mostly empty grids, with narrow cells and tiny enemy labels. Bright Energy outlines competed with the actual icon identities. Navigation ended a Run immediately rather than offering a paused menu.

## Implemented flow

Main menu → Play → dedicated six-type deck picker → Run. Back from the picker returns to the menu. The menu uses existing owner cutouts, an illustrated camp palette, Play, a gameplay guide and a real Fullscreen action. No new generated art or fake progression controls.

Mobile deck uses five columns in landscape, two in portrait, restrained selected outlines and a removable selected-unit strip. The card list scrolls independently from the header and Start control. Starting requires six selections and landscape orientation; portrait can still browse/select.

In-Run menu pauses active Phaser scenes. Continue resumes; the explicitly labeled End Run action destroys the Run and returns to the main menu. Portrait orientation during a Run pauses active scenes and displays a rotation notice. New Runs calculate the logical width from the current viewport.

Setup player positions display six lane columns and three depth rows (Front/Mid/Back). All 18 original slot IDs remain mapped to the same gameplay positions; click, drag, swap, cap and merge controller semantics are unchanged. Up to six enemy entries summarize lane, depth and HP alongside the board. Cell size is 132×100 logical pixels, at least 44 physical pixels in the tested landscape viewport matrix. Reserve moves to y460 with four 200px-high cards, separate 100px selection and merge targets. The right CTA rail provides 100px upgrade and 104px Start controls, with compact energy charge icons. Existing harness editable enemy grid remains available.

Rush surfaces, Energy inventory rows and Reserve use muted sage/charcoal surfaces and neutral strokes. Color remains on icons, urgency and selections. Battle circular cast controls and target feedback remain intact.

## Validation and limits

Run the complete deterministic checks and TypeScript/Vite build. Geometry checks cover all Setup positions, minimum cell touch dimensions and separation from Reserve/threat. Native browser tool initialization failed in this session, so no live screenshot or physical-device pass is claimed. Pager controls and small secondary text still require device review; this pass does not claim every element meets accessibility targets. Phaser resize within an existing Run still uses a stable logical reference with FIT scaling. Balance/adoption is unaffected.
