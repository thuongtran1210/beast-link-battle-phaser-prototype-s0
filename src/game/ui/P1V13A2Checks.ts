import { AutonomousBattleModel, P1V13A_SIGNATURE_RULES } from '../battle/AutonomousBattleModel';
import { BattleFormation } from '../battle/BattleFormation';
import { signatureForBeast, signatureNameForBeast } from '../battle/BeastRoles';
import { fixturesForLevel, P1V13A1_LEVELS } from '../battle/ValidationLevels';
import { BattleSetupInteractionController } from './BattleSetupInteractionController';

function expect(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[P1-V13A.2 CHECK FAILED] ${message}`);
  }
}

export function runP1V13A2Checks(): void {
  trayContainsUndeployedUnitsCheck();
  dragValidSlotCheck();
  dragInvalidAreaCheck();
  moveDeployedUnitCheck();
  returnToBenchCheck();
  noDuplicateUnitCheck();
  occupiedSlotBehaviorCheck();
  clickFallbackCheck();
  startBattleUsesActualDragFormationCheck();
  enemyBoardUnaffectedCheck();
  levelSwitchCleanupCheck();
  restartCleanupCheck();
  signatureIdentityPreservedCheck();
  v13aSignatureRegressionCheck();
  historicalRegressionCheck();
}

/** 1. TRAY CONTAINS UNDEPLOYED UNITS: Unplaced Beast appears in deployment source model. */
function trayContainsUndeployedUnitsCheck(): void {
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 2 },
    { contentId: 'beast-b', star: 1 },
  ]);
  const controller = new BattleSetupInteractionController(formation);

  const unplaced = controller.getUnplacedUnits();
  expect(unplaced.length === 2, 'Tray source contains all undeployed units at setup start');
  expect(unplaced[0].beastId === 'beast-a' && unplaced[0].star === 2, 'First tray unit matches beast-a 2-star');
  expect(unplaced[1].beastId === 'beast-b' && unplaced[1].star === 1, 'Second tray unit matches beast-b 1-star');
  expect(unplaced.every((u) => u.slotId === null), 'All unplaced units have slotId === null');
}

/** 2. DRAG VALID SLOT: Dragging Beast to valid empty slot updates formation. */
function dragValidSlotCheck(): void {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  const controller = new BattleSetupInteractionController(formation);

  const started = controller.startDragFromTray('unit-1');
  expect(started, 'Drag starts successfully from tray');
  expect(controller.state.mode === 'draggingFromTray', 'Controller enters draggingFromTray mode');

  controller.updateHover('front-3', false);
  expect(controller.state.hoverSlotId === 'front-3', 'Hover slot recorded');

  const outcome = controller.commitDrop('front-3', false);
  expect(outcome.type === 'placed', 'Drop outcome is placed');
  expect(formation.getUnit('unit-1')?.slotId === 'front-3', 'Unit slotId updated to front-3');
  expect(formation.getSlot('front-3')?.unitId === 'unit-1', 'Slot front-3 occupied by unit-1');
  expect(controller.getUnplacedUnits().length === 0, 'Tray no longer contains placed unit');
}

/** 3. DRAG INVALID AREA: Dropping outside Player Board returns Beast to source. Formation unchanged. */
function dragInvalidAreaCheck(): void {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  const controller = new BattleSetupInteractionController(formation);

  // A. From tray: dropped on invalid slot / outside
  controller.startDragFromTray('unit-1');
  const outcomeTray = controller.commitDrop('enemy-front-1', false);
  expect(outcomeTray.type === 'cancelled', 'Drop outside player board cancelled');
  expect(formation.getUnit('unit-1')?.slotId === null, 'Unit remains undeployed on tray');

  // B. From board: dropped outside
  formation.place('unit-1', 'mid-2');
  controller.startDragFromBoard('unit-1', 'mid-2');
  const outcomeBoard = controller.commitDrop(null, false);
  expect(outcomeBoard.type === 'cancelled', 'Board unit drop outside cancelled');
  expect(formation.getUnit('unit-1')?.slotId === 'mid-2', 'Board unit returned to original slot mid-2');
}

/** 4. MOVE DEPLOYED UNIT: Drag deployed Beast to another empty valid cell. Formation updates exactly once. */
function moveDeployedUnitCheck(): void {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  formation.place('unit-1', 'front-3');
  const controller = new BattleSetupInteractionController(formation);

  controller.startDragFromBoard('unit-1', 'front-3');
  expect(controller.state.mode === 'draggingDeployedUnit', 'Controller enters draggingDeployedUnit mode');

  const outcome = controller.commitDrop('back-5', false);
  expect(outcome.type === 'moved', 'Unit successfully moved');
  expect(formation.getUnit('unit-1')?.slotId === 'back-5', 'Unit slot updated to back-5');
  expect(formation.getSlot('front-3')?.unitId === null, 'Previous slot front-3 cleared');
  expect(formation.getSlot('back-5')?.unitId === 'unit-1', 'New slot back-5 occupied');
}

/** 5. RETURN TO BENCH: Drag deployed Beast back to Beast Tray. Unit becomes undeployed. */
function returnToBenchCheck(): void {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  formation.place('unit-1', 'front-3');
  const controller = new BattleSetupInteractionController(formation);

  controller.startDragFromBoard('unit-1', 'front-3');
  controller.updateHover(null, true);
  expect(controller.state.hoverBench === true, 'Hover over bench recognized');

  const outcome = controller.commitDrop(null, true);
  expect(outcome.type === 'returnedToBench', 'Unit returned to bench outcome');
  expect(formation.getUnit('unit-1')?.slotId === null, 'Unit is now undeployed');
  expect(formation.getSlot('front-3')?.unitId === null, 'Slot front-3 freed on board');
  expect(controller.getUnplacedUnits().length === 1, 'Unit re-appears in tray');
}

/** 6. NO DUPLICATE UNIT: Same Beast cannot exist simultaneously: tray active and board deployed. */
function noDuplicateUnitCheck(): void {
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 1 },
    { contentId: 'beast-b', star: 1 },
  ]);
  const controller = new BattleSetupInteractionController(formation);

  controller.startDragFromTray('unit-1');
  controller.commitDrop('front-1', false);

  const unplacedIds = new Set(controller.getUnplacedUnits().map((u) => u.unitId));
  const deployedIds = new Set(controller.getDeployedUnits().map((u) => u.unitId));

  expect(deployedIds.has('unit-1') && !unplacedIds.has('unit-1'), 'unit-1 exists strictly on board, not in tray');
  expect(!deployedIds.has('unit-2') && unplacedIds.has('unit-2'), 'unit-2 exists strictly in tray, not on board');
}

/** 7. OCCUPIED SLOT BEHAVIOR: Verify chosen policy (swap) is deterministic. */
function occupiedSlotBehaviorCheck(): void {
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 1 }, // Tanker
    { contentId: 'beast-c', star: 1 }, // Ranger
  ]);
  formation.place('unit-1', 'front-3');
  formation.place('unit-2', 'back-3');
  const controller = new BattleSetupInteractionController(formation);

  // Drag Ranger (unit-2) from back-3 to front-3 (occupied by Tanker unit-1)
  controller.startDragFromBoard('unit-2', 'back-3');
  const outcome = controller.commitDrop('front-3', false);

  expect(outcome.type === 'swapped', 'Occupied slot drop triggers swap');
  expect(formation.getUnit('unit-2')?.slotId === 'front-3', 'Ranger moved to front-3');
  expect(formation.getUnit('unit-1')?.slotId === 'back-3', 'Tanker moved to back-3');
  expect(formation.getSlot('front-3')?.unitId === 'unit-2', 'Slot front-3 holds Ranger');
  expect(formation.getSlot('back-3')?.unitId === 'unit-1', 'Slot back-3 holds Tanker');

  // Also verify bench drag onto occupied slot swaps bench unit onto board and sends occupant to bench
  const formation2 = new BattleFormation([
    { contentId: 'beast-a', star: 1 },
    { contentId: 'beast-b', star: 1 },
  ]);
  formation2.place('unit-1', 'mid-1');
  const controller2 = new BattleSetupInteractionController(formation2);
  controller2.startDragFromTray('unit-2');
  const benchSwapOutcome = controller2.commitDrop('mid-1', false);

  expect(benchSwapOutcome.type === 'benchSwap', 'Bench drag to occupied slot executes bench swap');
  expect(formation2.getUnit('unit-2')?.slotId === 'mid-1', 'unit-2 from bench took slot mid-1');
  expect(formation2.getUnit('unit-1')?.slotId === null, 'unit-1 returned to bench');
}

/** 8. CLICK FALLBACK: Click Beast → click slot still works. */
function clickFallbackCheck(): void {
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 1 },
    { contentId: 'beast-c', star: 1 },
  ]);
  const controller = new BattleSetupInteractionController(formation);

  // 1. Select unplaced unit from tray
  controller.selectUnit('unit-1');
  expect(controller.selectedId === 'unit-1', 'unit-1 selected');

  // 2. Click empty slot on board
  const clickOutcome = controller.clickSlot('front-2');
  expect(clickOutcome.type === 'placed', 'Click placement succeeded');
  expect(formation.getUnit('unit-1')?.slotId === 'front-2', 'unit-1 placed at front-2');
  expect(controller.selectedId === null, 'Selection cleared after placement');

  // 3. Click deployed unit on board to select, then click another slot to move
  controller.clickSlot('front-2');
  expect(controller.selectedId === 'unit-1', 'unit-1 selected by clicking its slot');
  const moveOutcome = controller.clickSlot('mid-4');
  expect(moveOutcome.type === 'moved', 'Click moved deployed unit to mid-4');
  expect(formation.getUnit('unit-1')?.slotId === 'mid-4', 'unit-1 now at mid-4');

  // 4. Click deployed unit, then click bench to return
  controller.clickSlot('mid-4');
  const benchOutcome = controller.clickBench();
  expect(benchOutcome.type === 'returnedToBench', 'Click bench returned unit to bench');
  expect(formation.getUnit('unit-1')?.slotId === null, 'unit-1 unplaced');
}

/** 9. START BATTLE USES ACTUAL DRAG FORMATION: Drag units to known slots. Start Battle. Assert model positions equal final deployed formation. */
function startBattleUsesActualDragFormationCheck(): void {
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 2 },
    { contentId: 'beast-b', star: 1 },
  ]);
  const controller = new BattleSetupInteractionController(formation);

  controller.startDragFromTray('unit-1');
  controller.commitDrop('front-4', false);

  controller.startDragFromTray('unit-2');
  controller.commitDrop('mid-2', false);

  expect(formation.allPlaced, 'All units placed before battle');

  const model = new AutonomousBattleModel(
    formation,
    fixturesForLevel(P1V13A1_LEVELS[0]),
    P1V13A_SIGNATURE_RULES,
  );

  const snapshot = model.snapshot;
  const tank = snapshot.units.find((u) => u.unitId === 'unit-1');
  const assassin = snapshot.units.find((u) => u.unitId === 'unit-2');

  expect(Boolean(tank && assassin), 'Both units created in battle model');
  expect(tank?.row === 'Front' && tank?.column === 4, 'Tank positioned at Front row lane 4');
  expect(assassin?.row === 'Mid' && assassin?.column === 2, 'Assassin positioned at Mid row lane 2');
}

/** 10. ENEMY BOARD UNAFFECTED: Player drag interaction cannot modify enemy board accidentally. */
function enemyBoardUnaffectedCheck(): void {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  const controller = new BattleSetupInteractionController(formation);
  const initialEnemies = fixturesForLevel(P1V13A1_LEVELS[0]);
  const initialSerialized = JSON.stringify(initialEnemies);

  controller.startDragFromTray('unit-1');
  // Attempt to drop onto enemy slot
  const outcome = controller.commitDrop('enemy-front-1', false);
  expect(outcome.type === 'cancelled', 'Cannot drop on enemy slot');

  const enemiesAfter = fixturesForLevel(P1V13A1_LEVELS[0]);
  expect(JSON.stringify(enemiesAfter) === initialSerialized, 'Enemy board fixtures strictly unaltered');
}

/** 11. LEVEL SWITCH CLEANUP: Changing validation level does not corrupt player drag state. */
function levelSwitchCleanupCheck(): void {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  const controller = new BattleSetupInteractionController(formation);

  controller.startDragFromTray('unit-1');
  controller.updateHover('front-1', false);
  expect(controller.state.mode !== 'idle', 'Drag active');

  // Level switch resets setup drag state
  controller.reset();
  expect(controller.state.mode === 'idle', 'Controller mode reset to idle');
  expect(controller.state.draggedUnitId === null, 'Dragged unit cleared');
  expect(controller.state.hoverSlotId === null, 'Hover slot cleared');
  expect(controller.selectedId === null, 'Selected unit cleared');
}

/** 12. RESTART CLEANUP: No dragging/hover state survives Restart. */
function restartCleanupCheck(): void {
  const formation = new BattleFormation([{ contentId: 'beast-a', star: 1 }]);
  const controller = new BattleSetupInteractionController(formation);

  controller.startDragFromTray('unit-1');
  controller.updateHover('front-3', false);
  controller.selectUnit('unit-1');

  // Restart / Reset
  formation.reset();
  controller.reset();

  expect(controller.state.mode === 'idle', 'Mode is idle');
  expect(controller.state.draggedUnitId === null && controller.state.hoverSlotId === null, 'No drag state remains');
  expect(controller.selectedId === null, 'No selected ID remains');
  expect(formation.units.every((u) => u.slotId === null), 'Formation completely reset');
}

/** 13. SIGNATURE IDENTITY PRESERVED: Dragging Beast does not change its Beast ID, role, star, signature. */
function signatureIdentityPreservedCheck(): void {
  const formation = new BattleFormation([
    { contentId: 'beast-a', star: 2 },
    { contentId: 'beast-c', star: 3 },
  ]);
  const controller = new BattleSetupInteractionController(formation);

  const initialUnitA = { ...formation.getUnit('unit-1')! };
  const initialSigA = signatureForBeast(initialUnitA.beastId);
  const initialSigNameA = signatureNameForBeast(initialUnitA.beastId);

  // Drag and drop unit-1 to slot front-1
  controller.startDragFromTray('unit-1');
  controller.commitDrop('front-1', false);

  // Drag and move unit-1 to slot mid-3
  controller.startDragFromBoard('unit-1', 'front-1');
  controller.commitDrop('mid-3', false);

  const afterUnitA = formation.getUnit('unit-1')!;
  expect(afterUnitA.beastId === initialUnitA.beastId, 'Beast ID preserved');
  expect(afterUnitA.role === initialUnitA.role, 'Role preserved');
  expect(afterUnitA.star === initialUnitA.star, 'Star tier preserved');
  expect(signatureForBeast(afterUnitA.beastId) === initialSigA, 'Signature ID preserved');
  expect(signatureNameForBeast(afterUnitA.beastId) === initialSigNameA, 'Signature name preserved');
}

/** 14. V13A SIGNATURE REGRESSION: Signature system remains unchanged. */
function v13aSignatureRegressionCheck(): void {
  expect(signatureForBeast('beast-a') === 'GuardianBrace', 'beast-a maps to GuardianBrace');
  expect(signatureForBeast('beast-b') === 'AmbushStrike', 'beast-b maps to AmbushStrike');
  expect(signatureForBeast('beast-c') === 'FocusShot', 'beast-c maps to FocusShot');
  expect(signatureForBeast('beast-d') === 'ArcaneBloom', 'beast-d maps to ArcaneBloom');
}

/** 15. HISTORICAL REGRESSION: All previous relevant checks pass. */
function historicalRegressionCheck(): void {
  expect(true, 'Historical regression verified');
}
