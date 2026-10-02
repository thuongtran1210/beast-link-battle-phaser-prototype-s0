---
mirror_type: notion_snapshot
notion_page_id: "3ec2674d-32c3-811d-a2f7-dc1c6528cb9b"
notion_url: "https://app.notion.com/p/3ec2674d32c3811da2f7dc1c6528cb9b?pvs=204"
notion_title: "01 — Unity Implementation Audit"
notion_last_edited_at: "2026-10-01T08:28:36.912Z"
last_synced: "2026-10-02"
source_of_truth: "Notion"
---

> **Mirror notice:** Git snapshot of the Notion page above. Notion remains authoritative unless project policy changes. Notion-native tags are preserved for fidelity.

# 01 — Unity Implementation Audit

> **Design sync note — 2026-10-01:** Current Gameplay Spec is now v2 with the P1 dual-queue structure. This audit still records the current Unity repo truth. P0-style structural mappings are now **Needs Sync** until Unity is intentionally migrated; do not rewrite repo evidence to match the new design.
> **Unity Implementation Source of Truth (nguồn sự thật về triển khai Unity).** This page records what the Unity repository currently does and how it maps to the Current Gameplay Spec. It does not independently redefine gameplay design rules.
<mention-page url="https://app.notion.com/p/3ec2674d32c3812296a8de866c65c434"/>
**Repository:** [Match-Onet-Puzzle-Battle](https://github.com/thuongtran1210/Match-Onet-Puzzle-Battle)  
**Branch audited:** `main`  
**Audit date:** 2026-10-01  
**Scope:** gameplay flow, grid/Onet, battle, energy, game states, UI presenters, ScriptableObject configs, scene wiring, meta systems.
## Status Legend
- **Implemented** — logic exists and is connected to the current gameplay flow.
- **Partially Integrated** — code exists, but wiring or behavior is incomplete/inconsistent.
- **Configured Prototype** — active values exist in scene/ScriptableObject data; they are not treated as final balance.
- **Design Direction** — concept/hypothesis, not current implementation.
- **Needs Validation** — requires playtest or runtime evidence before making a design conclusion.
## Rule Mapping (ánh xạ rule)
<table fit-page-width="true" header-row="true">
<tr>
<td>Rule ID</td>
<td>Unity Evidence</td>
<td>Sync Status</td>
<td>Implementation Status</td>
</tr>
<tr>
<td>FLOW-001</td>
<td>GameBootstrapper, GameStateCoordinator, BattleFlowCoordinator, PlayingState, AutoBattleState</td>
<td>Needs Sync</td>
<td>Implemented</td>
</tr>
<tr>
<td>PUZ-001</td>
<td>Level_1.asset → Donot.asset 6×6 GridShape</td>
<td>Synced</td>
<td>Configured Prototype</td>
</tr>
<tr>
<td>PUZ-002</td>
<td>GridData runtime border</td>
<td>Synced</td>
<td>Implemented</td>
</tr>
<tr>
<td>PUZ-003</td>
<td>GridManager.FillGrid(), CreateRandomContentPair()</td>
<td>Synced</td>
<td>Implemented</td>
</tr>
<tr>
<td>MATCH-001</td>
<td>MatchService + StandardOnetMatchRule</td>
<td>Synced</td>
<td>Implemented</td>
</tr>
<tr>
<td>PHASE-001</td>
<td>PlayingState → SpawnMode.BeastOnly</td>
<td>Synced</td>
<td>Implemented</td>
</tr>
<tr>
<td>COMBO-001</td>
<td>ComboManager.RegisterMatch()</td>
<td>Synced</td>
<td>Implemented</td>
</tr>
<tr>
<td>COMBO-002</td>
<td>Combo Config.asset initialTime = 5</td>
<td>Synced</td>
<td>Configured Prototype</td>
</tr>
<tr>
<td>COMBO-003</td>
<td>Combo Config.asset bonusTimePerMatch = 0.3</td>
<td>Synced</td>
<td>Configured Prototype</td>
</tr>
<tr>
<td>COMBO-004</td>
<td>Combo Config.asset maxTimeLimit = 5</td>
<td>Synced</td>
<td>Configured Prototype</td>
</tr>
<tr>
<td>QUEUE-001</td>
<td>BattleManager.ProcessMatchedContent()</td>
<td>Synced</td>
<td>Implemented</td>
</tr>
<tr>
<td>RES-001</td>
<td>GameStateCoordinator → ResolutionState</td>
<td>Needs Sync</td>
<td>Implemented</td>
</tr>
<tr>
<td>RES-002</td>
<td>BattleQueuePresenter / BattleQueueView / ResolveSingleBeast()</td>
<td>Needs Sync</td>
<td>Implemented</td>
</tr>
<tr>
<td>STAR-001</td>
<td>Design baseline = 1 / 3 / 9. ResolveSingleBeast() matches the baseline; ResolveBattlePhase() still uses 2 / 6 / 18.</td>
<td>Needs Sync</td>
<td>Partially Integrated</td>
</tr>
<tr>
<td>PHASE-002</td>
<td>AutoBattleState → SpawnMode.EnergyOnly</td>
<td>Needs Sync</td>
<td>Implemented</td>
</tr>
<tr>
<td>ENERGY-001</td>
<td>Energy Config.asset energyPerMatch = 10</td>
<td>Needs Sync</td>
<td>Configured Prototype</td>
</tr>
<tr>
<td>ENERGY-002</td>
<td>Current Energy definitions maxEnergy = 20</td>
<td>Needs Sync</td>
<td>Configured Prototype</td>
</tr>
<tr>
<td>ENERGY-003</td>
<td>EnergyManager.TryConsume() + EnergyPresenter skill execution</td>
<td>Needs Sync</td>
<td>Partially Integrated UI wiring</td>
</tr>
<tr>
<td>ROLE-001</td>
<td>BattleSimulationService role-aware combat exists, but no P1 Battle Setup role-readable arrangement flow exists.</td>
<td>Needs Sync</td>
<td>Partially Integrated</td>
</tr>
<tr>
<td>BATTLE-001</td>
<td>BattleSimulationService advances combat autonomously.</td>
<td>Synced</td>
<td>Implemented</td>
</tr>
<tr>
<td>BATTLE-002</td>
<td>No pre-combat battlefield slot arrangement flow was found.</td>
<td>Needs Sync</td>
<td>Planned</td>
</tr>
<tr>
<td>WAVE-001</td>
<td>WaveTransitionState + EnemySpawnerService</td>
<td>Synced</td>
<td>Implemented / prototype content</td>
</tr>
<tr>
<td>FAIL-001</td>
<td>AutoBattleState player-wipeout check</td>
<td>Synced</td>
<td>Implemented</td>
</tr>
<tr>
<td>DEADLOCK-001</td>
<td>HasAnyMatch() + ShuffleService</td>
<td>Needs Sync</td>
<td>Partially Integrated</td>
</tr>
<tr>
<td>PET-001</td>
<td>BasePetDefinition + EntityFactory compatible-element buffs</td>
<td>Synced</td>
<td>Implemented</td>
</tr>
</table>
**Sync Status (trạng thái đồng bộ):**
- **Synced (đã đồng bộ):** Unity behavior matches the current design rule.
- **Needs Sync (cần đồng bộ):** the design rule exists, but Unity wiring/behavior does not fully satisfy it.
- **Conflict (xung đột):** Unity contains contradictory implementations and the design rule is still unresolved.
## Detailed Implementation Matrix
<table fit-page-width="true" header-row="true">
<tr>
<td>System</td>
<td>Repo Truth</td>
<td>Status</td>
<td>Evidence</td>
<td>Portfolio Use</td>
</tr>
<tr>
<td>Core Gameplay Flow</td>
<td>Deck Setup → Beast Puzzle + Combo → Battle Queue / Resolution → Auto Battle + Energy Puzzle → Wave Transition → next cycle.</td>
<td>Implemented</td>
<td>GameBootstrapper, GameStateCoordinator, BattleFlowCoordinator, PlayingState, AutoBattleState</td>
<td>Primary core-loop visual.</td>
</tr>
<tr>
<td>Onet Match Rule</td>
<td>Two different positions, matching content, valid path with up to 2 turns. Runtime grid includes an outer border used by pathfinding.</td>
<td>Implemented</td>
<td>MatchService, StandardOnetMatchRule, GridData</td>
<td>Show Straight / L / Z / U path logic.</td>
</tr>
<tr>
<td>Current Puzzle Shape</td>
<td>The current level references a 6×6 GridShape. GridData adds a one-cell border around the playable shape at runtime.</td>
<td>Configured Prototype</td>
<td>Level_1.asset, Donot.asset, GridData</td>
<td>Use 6×6 in mockups; label it current prototype configuration.</td>
</tr>
<tr>
<td>Initial Board Generation</td>
<td>Empty positions are shuffled and filled as matching pairs. If playable-cell count is odd, the last cell is blocked.</td>
<td>Implemented</td>
<td>GridManager.FillGrid(), TileFactory.CreateRandomContentPair()</td>
<td>Good edge-case / puzzle-system evidence.</td>
</tr>
<tr>
<td>Combo Window</td>
<td>The active Combo Config referenced by the current Menu scene is 5.0s initial, +0.3s per successful match, 5.0s cap.</td>
<td>Configured Prototype</td>
<td>Combo Config.asset + Menu.unity reference</td>
<td>Use these values when showing the current prototype; do not present them as final balance.</td>
</tr>
<tr>
<td>Beast Match Output</td>
<td>A successful Beast match adds one count for that BeastDefinition to the battle queue. It does not directly spawn a unit at match time.</td>
<td>Implemented</td>
<td>BattleManager.ProcessMatchedContent()</td>
<td>Show Match → Queue rather than Match → Spawn.</td>
</tr>
<tr>
<td>Resolution / Deployment</td>
<td>BattleQueueHUD exposes Start Battle and individual Beast icons. Player can resolve the full queue or deploy a Beast from the queue manually.</td>
<td>Implemented</td>
<td>BattleQueuePresenter, BattleQueueView, BattleManager.ResolveSingleBeast()</td>
<td>Give Resolution its own UX mockup; this is meaningful player agency.</td>
</tr>
<tr>
<td>Star Conversion</td>
<td>Current design baseline is 1 / 3 / 9. ResolveSingleBeast() follows this rule; ResolveBattlePhase() still uses the older 2 / 6 / 18 conversion and must be synchronized.</td>
<td>Partially Integrated</td>
<td>BattleManager.ResolveBattlePhase(), ResolveSingleBeast()</td>
<td>Present 1 / 3 / 9 as the current design rule, while clearly marking Unity full-queue resolution as Needs Sync.</td>
</tr>
<tr>
<td>Energy Phase</td>
<td>AutoBattleState switches tile generation to EnergyOnly, clears Beast content, enables puzzle input and starts battle simulation.</td>
<td>Implemented</td>
<td>AutoBattleState</td>
<td>Second gameplay UX frame.</td>
</tr>
<tr>
<td>Energy Gauge & Skill</td>
<td>Current config gives +10 Energy per matched pair and caps each configured Energy at 20. A full gauge can be consumed to execute the EnergyDefinition granted skill.</td>
<td>Configured Prototype</td>
<td>Energy Config.asset, EnergyManager, EnergyPresenter</td>
<td>Show Match → Gauge → Skill-ready interaction.</td>
</tr>
<tr>
<td>Energy UI Initialization</td>
<td>EnergyPresenter has StartBattle(activeEnergies) to create bars, but no call to this method was found in the current GameBootstrapper flow.</td>
<td>Partially Integrated</td>
<td>EnergyPresenter, GameBootstrapper</td>
<td>Do not claim the full Energy HUD flow is production-ready.</td>
</tr>
<tr>
<td>Deadlock Detection / Shuffle</td>
<td>HasAnyMatch() and ShuffleService exist, with up to 15 shuffle attempts. Automatic deadlock checking is not currently connected to the normal successful-match path.</td>
<td>Partially Integrated</td>
<td>MatchService, ShuffleService, BoardController</td>
<td>Present as implemented safety logic with remaining integration work.</td>
</tr>
<tr>
<td>Battle Simulation</td>
<td>Real-time simulation supports role-aware targeting, movement, attack cooldowns, ranged kiting, melee target limits, projectile/splash behaviors and status effects.</td>
<td>Implemented</td>
<td>BattleSimulationService, AttackBehavior classes, StatusEffect classes</td>
<td>Supporting depth; keep secondary to the puzzle case study.</td>
</tr>
<tr>
<td>Leader Pet</td>
<td>Leader Pet data provides element-filtered HP/Damage buffs and an active-skill reference. No Pet Base combat entity was found in the current battle model.</td>
<td>Implemented / Design Direction split</td>
<td>BasePetDefinition, EntityFactory, BattleSimulationService</td>
<td>Show Leader Pet/loadout support; move Pet Base combat anchor out of current implementation claims.</td>
</tr>
<tr>
<td>Wave System</td>
<td>Waves are data-driven through WaveData and EnemySpawnConfig, including count, spawn interval, star level and mini-boss flag.</td>
<td>Implemented</td>
<td>WaveData, EnemySpawnerService, current Wave assets</td>
<td>Useful as level/balance framework evidence.</td>
</tr>
<tr>
<td>Current Wave Content</td>
<td>The three current wave assets are still prototype content: repeated enemy references and simple counts/timing.</td>
<td>Configured Prototype</td>
<td>Wave Data 1/2/3 Map 1.asset</td>
<td>Do not present current wave content as finished level design.</td>
</tr>
<tr>
<td>Deck / Meta Support</td>
<td>Local inventory, deck selection, Pet/Beast/Energy loadout, currency, shop and level-selection systems exist.</td>
<td>Implemented</td>
<td>DeckSessionService, LocalInventoryService, LocalCurrencyService, UI presenters</td>
<td>Mention as supporting breadth, not the hero of this portfolio piece.</td>
</tr>
<tr>
<td>Scene / Build Wiring</td>
<td>Menu.unity contains serialization matching the current GameBootstrapper fields. EditorBuildSettings currently enables only Gameplay_match.unity, which still contains older serialized Bootstrapper fields.</td>
<td>Partially Integrated</td>
<td>Menu.unity, Gameplay_match.unity, EditorBuildSettings.asset</td>
<td>Stabilize before publishing a playable build claim.</td>
</tr>
<tr>
<td>Level Data Serialization</td>
<td>Current LevelData source uses levelId and no spawnConfig field, while existing Level_1 assets still serialize older fields such as levelNumber and spawnConfig.</td>
<td>Partially Integrated</td>
<td>LevelData.cs, Level_1.asset</td>
<td>Clean up before using level data as polished implementation evidence.</td>
</tr>
<tr>
<td>Playtest Evidence</td>
<td>No automated gameplay tests or player-test results are present in the repository.</td>
<td>Needs Validation</td>
<td>Repository tree + current playtest sheet</td>
<td>Do not claim validated readability, retention or balance outcomes.</td>
</tr>
</table>
## Portfolio Claim Rules
1. **Current Gameplay Spec defines current gameplay design. Unity repo/scene/config defines current Unity behavior.** When they differ, record the mismatch instead of silently choosing one.
2. Separate **code defaults** from **active ScriptableObject values**.
3. A system with code but incomplete wiring is **Partially Integrated**, not fully implemented.
4. Mockups are labeled **Gameplay UX Mockup — Design Visualization** and are never presented as Unity screenshots.
5. Playtest hypotheses stay hypotheses until real observation/data exists.
## Immediate Corrections Required
- [x] Replace the current core-loop wording with the Battle Queue / Deployment step included.
- [x] Correct Combo values from 5 / +2 / 10 to the active config 5 / +0.3 / 5.
- [x] Reframe Beast output as **Match → Battle Queue**, not Match → immediate spawn.
- [x] Reframe Merge as **Queue / Star Conversion** and note the current conversion inconsistency.
- [x] Move Pet Base combat behavior to **Design Direction**.
- [x] Change Deadlock status to **Partially Integrated**.
- [x] Keep mixed Beast + Energy board as a design alternative, not current implementation.
- [ ] Avoid “playable build” claims until scene/build wiring is stabilized.
## Visuals to Build from This Matrix
1. **Core Loop:** Deck Setup → Beast Puzzle + Combo → Battle Queue / Resolution → Auto Battle + Energy Puzzle → Wave Transition.
2. **Beast Puzzle UX:** 6×6 board + Onet path + Combo + Battle Queue.
3. **Resolution UX:** Queue counts + star conversion + manual deploy / Start Battle.
4. **Energy Battle UX:** Auto Battle + Energy board + gauge + skill-ready state.
5. **Design Evolution:** Mixed-resource concept vs current phase-separated prototype.
6. **Implementation Evidence:** compact version of this matrix, not code dumps.
---
This page is a working Unity audit. If Unity behavior changes, update this audit. If the gameplay design decision changes, update **Current Gameplay Spec** first, then mark Unity mappings as Synced / Needs Sync / Conflict as appropriate. Recruiter-facing material should be updated only after the relevant source documents are consistent.
<page url="https://app.notion.com/p/3ec2674d32c381919b1ae0725bf3483e">01.1 — Repo Stabilization Checklist</page>
