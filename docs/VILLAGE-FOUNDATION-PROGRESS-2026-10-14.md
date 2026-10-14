# Village upgrade — first implementation slice

Date: 2026-10-14. Owner authorized beginning the upgrade after the six-milestone plan.
Scope: code foundation for V00–V03. No new art, profession balance, rescue rewards, housing or defense implementation.

## Baseline audit (V00, code portion)

- Camp save v3 owns economy jobs, residents, inventory, meals and expiry. Previous v2/v1 fallback remains in `CampState.ts`.
- `VillageEconomy.ts` owns garden/fishing/anvil recipes, reservations, FEFO and ledger. Rates, costs, quantities and expiry are preserved.
- `VillageSimulation.ts` owns rest/walk/work/return and station reservations. Its work countdown is a session mirror; saved economy job remaining is production truth. Rebind preserves matching workers; travel still uses straight lines.
- `CampView.ts` previously orchestrated production candidates/save, life updates and save cadence directly. `CampActivityController.ts` read mutable simulation workers.
- Canonical map is `VillageSceneLayout.ts`, 1536×1024. Route avoidance remains open.
- Existing checks: Camp/Foundation/Simulation/Economy/Life/Production/Goal/FirstJourney/Incidents in `runChecks.ts`.
- Owner station paths remain `/assets/ui/camp/village-owner-v1/`. No village character sheets were found by filename search under `public/assets/characters`; this is not a complete art/reference audit. V06 is pending.
- Pre-existing working changes in Battle/projectile presentation, art manifest, handoff and untracked FX/cutscene docs were preserved.

## Implemented

- `VillageActivity.ts`: typed worker phases, detached readonly worker snapshot, command result and block codes. Movement station/kind remain compatibility strings; closed profession/job/event contracts are pending V01 completion.
- `VillageSimulation.snapshot()`: copies only presentation fields; no live worker reference or nested position objects escape through this API. Legacy `workers` remains for compatibility/tests.
- `VillageEconomy.productionBlock()`: machine-readable funds/input/capacity codes; existing text helper remains compatible.
- `VillageApplication.ts`: injected storage port, candidate/save-before-commit begin and delivery, progress advancement, life/work rate, one-second active checkpoints and explicit exit checkpoint. Save exceptions become retryable failures. A failed checkpoint retries at the next bounded interval, avoiding frame-rate storage attempts. No offline clock was added.
- `CampView.ts`: production/life orchestration delegates to the service. Story/incident saves, inventory, construction and other dialogs retain their existing paths; V02 is partial.
- `CampActivityController.ts`: paints detached snapshots.
- Existing resident interaction manager is disposed before render/replacement and on exit, clearing bubble timers. Broader lifecycle checks and visual confirmation remain open under V03.

## Evidence and limits

- Baseline `npm run check`: exit 0.
- Baseline sandbox build encountered EPERM resolving Character Studio. Running the build with approved permissions succeeded; no Character Studio code was changed for this issue.
- Added `VillageApplicationChecks.ts` to the existing harness: failed/throwing save, resume without second charge, partial work checkpoint/reload, incomplete/duplicate delivery, pending capacity output and retry, invalid life time, bounded checkpoint retry, detached snapshot and disposed workers.
- Updated `npm run check` and `npm run build`: PASS (exit 0). Build retains existing large-chunk warning.
- Browser/device review: OPEN. No art generation/review or adoption claim.

## Next

1. Finish V01 with closed profession/job/station/event contracts, production snapshot and stable persisted job IDs; preserve legacy aliases such as anvil/forge.
2. Finish V02 transaction/story boundaries and clock ownership; exercise rebind/reload/hidden behavior through the service and simulation together.
3. Finish V03 lifecycle verification, then catalog and village animation player (V04–V05).
4. Read art routing for V06 and audit real full-body/station references before preparing the Windstrider sample. Owner art approval precedes expansion.

V00–V03 are partially implemented, not a completed M0. V04–V19 and defense remain pending.

## Continuation — M0 code foundation (2026-10-14)

The preceding entries describe the first slice. Current status supersedes them at code level: **V00 code baseline + V01–V05 IMPLEMENTED / CHECK PASS / OWNER UI REVIEW OPEN**. M0 is not owner-accepted; V06 reference approval remains pending.

- V01: closed profession/resident/activity/station/clip/socket types. Anvil maps to forge without changing saved recipe keys/CSS. Snapshots and committed events carry existing persisted job IDs; resume emits no duplicate start.
- V02: saved production remaining is authoritative through the simulation progress hook. Retry delay is separate; ready output stays at zero work and blocked arrivals no longer move backward. Delivery, story receipt, decor meme and optional incident diary share one candidate/save transaction. Life/checkpoints run after active work; no offline production. Inventory/build dialogs retain their existing validated transaction adapters.
- V03: internal workers are private, compatibility reads are detached, anchors are copied. One injected frame loop owns visibility/pagehide listeners, resets time origin, checkpoints at browser exit and cannot restart after dispose. Camp disposes bindings before rebind/leave, closes dialogs before root removal and removes its camera-state listener. Related dead imports removed.
- V04: labels, clips, resident activity selection and prototype tools are catalogs. Common resident rendering no longer selects work/tools through Beast-ID branches. Later patrol/flowers/delivery gameplay is not activated.
- V05: DOM sheet player with eight measured windows, pivots, neutral-height scale, loop/one-shot, socket cues, facing, pause/reduced motion and dispose. No extra RAF/timer; images cache per player. Missing/invalid/failed images retain cutouts; sheet tool ownership hides duplicate overlays. Optional enter/finish transitions cannot deliver goods or delay economic completion. No village sheets are registered yet.

New files: `VillageActivityLoop.ts` / checks, `VillagePresentationCatalog.ts`, `VillageAnimation.ts` / checks, `VillageSpritePlayer.ts`; development QA pages `/village-foundation-preview.html` and `/village-animation-preview.html`, excluded from production build inputs. Foundation fixture seeds only a fresh port-5180 origin and refuses overwrite. Animation preview uses a diagnostic SVG, not character art, and does not access saves.

Evidence: `npm run check` and `npm run build` exit 0; existing bundle-size warning remains. Tests cover hunger on one authoritative clock, rebind/hidden/external progress, pending-output retry, atomic story/receipt, detached workers, one-shot and frame-zero/crossing cues.

Limited browser smoke before the owner's manual-testing instruction observed three jobs, forge ID preserved across rebind, dialog/reload/reentry, RAF 2 in the village and RAF/Interval/Timeout all 0 after exit. Diagnostic loop/pause/facing/one-shot/missing-sheet fallback were observed. This is not device/art acceptance. Source-error fallback and final renderer catalog changes still need owner UI verification. Pier overlap reached the worker once; keyboard activation opened the panel. Touch review remains open.

**Owner workflow:** owner explicitly requested on 2026-10-14 that they run UI checks to save tokens. Do not continue browser UI automation; provide links/checklist and run only necessary code checks. [Owner checklist](VILLAGE-M0-OWNER-CHECKLIST-2026-10-14.md).

Next: owner checklist and fixes to reported failures; V06–V08 references/approval and real Windstrider+garden sheets. No raid/housing/unlock/mastery or art approval implied.
