# Energy Rush UI update — 2026-10-08

Implemented presentation changes for desktop and compact landscape:

- Dedicated rounded timer and inventory panels; urgent timer color below three seconds.
- Tactical names remain visible on compact Energy tiles.
- Distinct glyphs: Mend shield/cross, Rescue heart/cross, Break cracked shield, Pierce arrow/rings.
- Four inventory rows remain visible at zero, with catalog effect descriptions.
- Stored total, carry-in snapshot, and charges gained in this Rush are separate values.
- Ready state explains that the first valid pair starts the timer; collected charges carry into Battle and later Waves.

Gameplay rules, charge persistence, timer duration, and matching behavior are unchanged.

Validation: `npm run check`, `npm run build`, and `git diff --check` passed. Bank summary checks cover fresh runs, carried charges, and totals above 30. Browser automation is unavailable in this session; physical mobile and live visual review remain outstanding. These checks do not constitute owner design adoption.
