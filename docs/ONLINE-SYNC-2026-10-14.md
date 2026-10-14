# Online synchronization correction — 2026-10-14

## Implementation

- Server preparation states BeastRush / EnergyRush / BattleSetup replace premature BATTLE with placeholder units. Each phase advances only after both members finish; local first-valid-match timing and phase durations remain unchanged. Both boards receive the match seed; Energy board uses a separate deterministic seed so independent recruitment draws cannot diverge its initial board.
- Formation placement/removal previews send Beast, STAR, row and column to the peer. Only two committed formations launch combat. Committed formation controls lock; subsequent submissions cannot overwrite or restart combat. Server validates member/state, unique IDs/slots, known Beast/role, numeric attributes and all six formation columns. Unit IDs are namespaced by player to avoid collisions between local Run IDs.
- TeamB snapshots mirror units/enemies and positions; both sides retain canonical target IDs and receive relative Win/Lose. The real initial snapshot reaches the controller before the Battle-start callback. Remote snapshot differences now drive tick presentation. Setup renders opponent Beast assets, including on mobile.
- TeamB current HP is retained. Per-player Energy queues are submitted at commitment, consumed on the server, and acknowledged back to the owner. TeamB casts use its perspective, with shield and interrupt support on either team. Online Result ends the match rather than continuing local Waves; return-to-lobby avoids offline reward/restart and recruitment progression.
- Lobby countdown cancellation, stale membership, phase duplicates, late commits and server timer disposal are guarded.

## Owner live report: both clients stuck at CHỜ ĐỐI THỦ

Verified port 3000 was served by PID 25196, command `node dist/server.cjs`, created 2026-10-13 22:56:44 +07:00. That process predates PREPARATION_READY and continued serving the old in-memory server bundle. Client build cannot refresh an existing Node process; Vite also clears dist, removing the old on-disk server bundle without changing the running process.

The old listener stopped before the attempted restart. Started the new server on port 3000 with the revised launcher. Launcher now watches the server dependency graph, restarts after successful rebuilds, and stores its bundle in node_modules/.cache/beast-link independently of Vite dist. Source rebuild resets existing rooms. ROOM_JOINED carries protocol version 2; a new client rejects an old server immediately with a restart message instead of entering a dead preparation barrier. Existing stuck rooms cannot be resumed: reload both clients and create a new room.

## Validation and limits

- npm run check: deterministic regression including member/phase barriers, opponent previews, immutable commits, duplicate local IDs, mirrored HP/results and TeamB Energy.
- npm run check:online: two real WebSocket clients through GameServer and WebSocketClientAdapter, controller snapshot ordering, both preparation transitions, opponent Beast/placement, shared ticks/HP, Energy and opposite results. Includes rejection of an old server handshake.
- The same two-client test passed against the newly running ws://127.0.0.1:3000 process using ONLINE_CHECK_SERVER_URL.
- Production build and real-device/owner visual review are separate gates. Owner review of the newly restarted full match remains open.
- This fixes synchronization, not a competitive-balance adoption gate: the legacy combat model still uses player-role/signature rules for TeamA and enemy-archetype combat rules for TeamB. Submitted roster/Energy are validated structurally, not reconstructed from server-verified puzzle input; production anti-cheat is not implemented.
