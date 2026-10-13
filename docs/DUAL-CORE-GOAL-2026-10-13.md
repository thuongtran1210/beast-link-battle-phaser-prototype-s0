# Dual-Core bridge — forge goal

Owner requested implementation after the GDD Dual-Core update. This authorizes this Village/Run bridge; no Battle balance or Energy adoption decision is implied.

## Scope

The first bridge uses existing 20-Wood forge ownership, Ironclad recruitment and placement. No new material or region loot is introduced: all regions retain the existing +15 Wood for a complete Run win. Goal hints do not guarantee Beast spawns. Free exploration remains available.

- Village header opens a goal sheet with actual wood, resident and placement progress.
- Follow/unfollow persists in v3 saves; missing/invalid goal values are sanitized. Old owned/placed forges require no repurchase.
- Goal sheet can build/place at an empty slot and directly leave for exploration. Village activity/camera/effects are disposed during navigation.
- Region and Deck screens explain the missing requirements; a Deck without Ironclad remains playable.
- Result reports actual persisted Wood before/after and tracked forge progress, with Return to Village. Failed reward save offers retry instead of claiming a grant.
- Run rewards use unique coordinator Run IDs, persisted with the award; the most recent 100 receipts are retained. The live coordinator also guards repeat Result entry. Restart creates a new ID.
- Goal edits, construction/placement and reward writes use candidate + save before live commit. Reward failure leaves the award retryable.

## Validation

`npm run check` passes including goal/save migration, failed writes, duplicate rewards after reload, new-Run award, loss/partial/harness isolation and Result retry integration. `npm run build` passes (Vite filesystem access requires execution outside the Windows sandbox here).

Browser smoke: Village → goal → follow → exploration → Deck displays the tracked objective and Ironclad hint. No full three-Wave live completion or physical mobile visual/touch PASS claimed. No design adoption implied.

## Deferred

Special materials, region-specific loot, orders, quest chains and Battle buffs. The first bridge is a refinement of current progression, not the full proposed GDD unlock economy. Existing forge can be built before Ironclad arrives; working forge completion requires resident + ownership + placement.
