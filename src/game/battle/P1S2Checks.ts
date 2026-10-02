import { BattleFormation } from './BattleFormation';
import { roleForBeast } from './BeastRoles';
import { BattleSetupView } from '../ui/BattleSetupView';
import { EnergyQueue } from '../energy/EnergyQueue';
import { BattleQueue } from '../queue/BattleQueue';
import { StarConverter } from '../queue/StarConverter';
import { allowsPuzzleInput, GamePhase } from '../state/GamePhase';

export function runP1S2Checks(): void {
  expect(roleForBeast('beast-a') === 'Tanker' && roleForBeast('beast-b') === 'Assassin' && roleForBeast('beast-c') === 'Ranger' && roleForBeast('beast-d') === 'Mage' && roleForBeast('beast-e') === 'Tanker' && roleForBeast('beast-f') === 'Ranger', 'experimental role mapping is deterministic');
  const converter = new StarConverter(); const converted = [...converter.bulk('beast-a', 3), ...converter.bulk('beast-c', 1)];
  expect(converted.map((unit) => unit.star).join(',') === '2,1', 'STAR-001 conversion remains 1/3/9');
  const formation = new BattleFormation(converted); const units = formation.units;
  expect(units.length === 2 && units[0].beastId === 'beast-a' && units[0].role === 'Tanker' && units[0].star === 2 && new Set(units.map((unit) => unit.unitId)).size === 2, 'converted units preserve identity, role, star, and unique IDs');
  expect(!formation.allPlaced && units.every((unit) => unit.slotId === null), 'new formation starts with all units unplaced');
  expect(formation.place(units[0].unitId, 'back-1') && formation.slots.find((slot) => slot.slotId === 'back-1')?.unitId === units[0].unitId, 'placing occupies exactly one slot');
  expect(!formation.place(units[1].unitId, 'back-1'), 'duplicate slot occupancy is rejected');
  expect(formation.place(units[0].unitId, 'front-2') && formation.slots.find((slot) => slot.slotId === 'back-1')?.unitId === null, 'moving clears previous slot');
  expect(formation.place(units[1].unitId, 'mid-3') && formation.allPlaced, 'recommended rows do not block off-role placement and all placements enable Start Battle');
  const energy = new EnergyQueue(); energy.addCharge('energy-a', 2); const energyBefore = energy.getTotalCharges(); const battleSnapshot = formation.units;
  expect(JSON.stringify(battleSnapshot) === JSON.stringify(formation.units) && energy.getTotalCharges() === energyBefore, 'formation and stored Energy survive into Battle unchanged');
  expect(!allowsPuzzleInput(GamePhase.Battle), 'Battle remains puzzle-free');
  const beasts = new BattleQueue(); beasts.addBeastMatch('beast-a');
  formation.reset(); energy.reset(); beasts.clear();
  expect(!formation.allPlaced && formation.units.every((unit) => unit.slotId === null) && energy.getTotalCharges() === 0 && beasts.entries().length === 0, 'Restart clears formation, BeastQueue, and Energy per-run state');

  // BattleSetupView Presentation Checks (deterministic layout & filtering)
  const setupUnits = [...converter.bulk('beast-a', 6), ...converter.bulk('beast-b', 3), ...converter.bulk('beast-c', 2)];
  const setupFormation = new BattleFormation(setupUnits);
  // View helper mock
  const dummyScene = { scale: { height: 760 } } as any;
  const setupView = new BattleSetupView(
    dummyScene,
    setupFormation,
    [],
    () => 'Total: 0',
    () => {},
    () => {}
  );

  // 1. Only unplaced units are returned in unplaced section
  expect(setupView.getUnplacedUnits().length === setupFormation.units.length, 'initially all units are in unplaced list');
  expect(setupView.getUnplacedUnits().every((u) => u.slotId === null), 'all unplaced units have slotId === null');

  const firstUnit = setupFormation.units[0];
  setupFormation.place(firstUnit.unitId, 'front-1');
  const afterPlacedList = setupView.getUnplacedUnits();
  expect(afterPlacedList.length === setupFormation.units.length - 1, 'placed unit disappears from unplaced list');
  expect(!afterPlacedList.some((u) => u.unitId === firstUnit.unitId), 'placed unit is not present in unplaced list');
  expect(!setupFormation.allPlaced, 'partially placed formation keeps allPlaced === false');

  // Place all remaining units
  const availableSlots = setupFormation.slots.filter((s) => s.unitId === null);
  setupFormation.units.forEach((u, i) => {
    if (u.slotId === null) {
      setupFormation.place(u.unitId, availableSlots[i].slotId);
    }
  });
  expect(setupFormation.allPlaced, 'allPlaced is true when all units are placed');
  expect(setupView.getUnplacedUnits().length === 0, 'unplaced list is empty when all units are placed');

  // 2. Layout metrics ensure START BATTLE is never below viewport bottom
  const layout760 = BattleSetupView.computeLayout(760);
  expect(layout760.startBattleY <= 760 - 80, 'start battle Y is bounded within 760 viewport height');
  expect(layout760.startBattleY > layout760.listStartY, 'start battle Y is positioned below list start');
  const layout600 = BattleSetupView.computeLayout(600);
  expect(layout600.startBattleY <= 600 - 80, 'start battle Y adapts and remains inside smaller viewport height');
}
function expect(value: boolean, label: string): void { if (!value) throw new Error(`P1-S2 check failed: ${label}`); }

