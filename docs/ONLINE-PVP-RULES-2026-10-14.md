# Online PvP — Ready, Concealed Formation & Four Hearts (2026-10-14)

Source: owner screenshots/requests in this chat. These online rules supersede earlier live opponent preview / one-Battle final-result behavior. Localhost-only release gate stays in effect; offline Run rules unchanged.

## Implemented flow

- Online Setup CTA: Sẵn sàng; after commitment Đã sẵn sàng. Offline CTA unchanged.
- Owner screenshot correction: while arranging, OPPONENT_FORMATION_READY sends positions (row/column/slot) and count for generic shadows immediately. Opponent identity, STAR, HP and damage remain absent; actual units array stays empty. Placement/move/removal updates shadows before either side is ready. Host still owns the canonical room; concealment is not anti-cheat against a modified host.
- When both commit: host enters BattleCountdown, locks formations and sends only row/column/slot positions as generic gray markers. Host emits 5,4,3,2,1 on scheduled one-second steps. No simulation before zero. Real snapshot + beasts are revealed at Battle start. Disconnect/dispose cancels countdown. Scene fixes guard reentrant local host phase transitions to avoid a stale CHỜ ĐỐI THỦ overlay over Setup/countdown.
- Both start with four hearts. Natural Battle loser loses one, winner retains hearts. RoundResult remains connected; both acknowledge readiness for another round. Only zero hearts ends the match. Round number, hearts, outcome and fresh per-round match identity are authoritative.
- Owner-confirmed round policy (2026-10-14): new recruitment each round; roster, HP, Energy, shards, formation and metrics reset. No carryover rewards/offline recruitment/progression. If owner chooses attrition later, change explicitly and update tests.
- Existing surrender/disconnect-forfeit during Battle is whole-match forfeiture: loser hearts become zero. Disconnect before combat/between rounds aborts the session with notice. These are inherited session-exit exceptions, not normal one-heart round losses.
- Results label THẮNG/THUA VÒNG until terminal, THẮNG/THUA TRẬN at zero; HUD displays both heart counts. Ready next round uses same connection/controller, with Battle presentation listeners cleared between rounds. Result waits for authoritative round metadata, not just terminal snapshot.

Protocol v6: reload both clients and create fresh room. No automatic push/deploy in this implementation turn.

## Validation

- Core OnlineMatchRulesChecks: four natural victories/losses, 4→3→2→1→0, repeat terminal step cannot deduct twice; fresh inventory/round IDs; dual next-round barrier; zero blocks round five; hidden packets/countdown before combat.
- PeerSessionChecks: MockPeer/DataConnection four-round flow, both perspectives/results/heart score, same connection across rounds, preview cache reset; existing privacy/countdown and review regressions pass. Mock evidence is not real ICE or device QA.
- OnlineClientChecks: two real WebSocket clients use new hidden-preview protocol and countdown; existing HP/Energy/result tests pass.
- npm run check and npm run build are required final gates. Owner browser/device review remains OPEN.

## Owner local test

2026-10-14 Early round-result investigation: owner confirms round loss deducts one heart. Confirmed presentation defect: assigning Phaser Rectangle.width did not update its shape geometry. HP bars now scale fixed geometry, cancel stale damage tweens on healing/KO, and initialize from actual HP. Snapshot death stops character motion even without a defeat event; result presentation waits 1200ms for KO/fade completion. Natural MATCH_END is checked against authoritative defeated-team HP and canonical winner/status before hearts or result acceptance; explicit surrender/disconnect remain exceptions. Results show end reason. Regression checks cover living-team rejection and HP damage/heal/KO presentation; full checks, mock P2P, real two-client WebSocket and build pass. Exact owner live symptom has not been reproduced; browser recheck remains open.

npm run dev, two windows or browsers. Host creates room, guest joins link. Recruit and collect Energy, arrange privately; first ready must not launch Battle. Second ready begins visible five-second countdown with generic opponent shadows. At zero actual Beasts appear. Finish a round: loser loses one heart; both ready to recruit again. Match only concludes when one reaches zero. Check that remaining hearts/round label agree across windows and no stale waiting overlay hides Setup. Switching host tab/minimizing aborts by existing policy; use two visible windows for testing.

2026-10-14 Shadow preview correction: earlier version only displayed opponent shadows during countdown. Owner requests visibility during Setup. Position-only previews now drive generic gray markers in Setup and countdown; true identities remain hidden until Battle. Peer mock tests cover opposite columns and shadow removal/restoration with no identity/stat fields. Live visual QA remains open.

2026-10-14 Online heart HUD correction: compact HUD replaced secondaryTitle with phase name, hiding the prior heart string. Dedicated own/opponent score now displays filled/empty hearts plus remaining count (0–4), separate from phase/countdown labels. Uses authoritative roundResult/matchInfo and player's team perspective. Desktop phase markers hidden while online score is shown; offline restored. Production build checked; PC/mobile live composition review open.
