import { AutonomousBattleModel, roleBaseStats } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
import { EnergyQueue } from '../energy/EnergyQueue';

export function runP1S3Checks(): void {
  expect(JSON.stringify(roleBaseStats('Tanker')) === JSON.stringify({ hp: 80, damage: 6 }) && JSON.stringify(roleBaseStats('Assassin')) === JSON.stringify({ hp: 35, damage: 14 }), 'role base stats are deterministic');
  const strongFormation = formation([{ contentId: 'beast-a', star: 3 }], ['front-1']); const battle = new AutonomousBattleModel(strongFormation);
  expect(battle.snapshot.status === 'Running' && battle.snapshot.enemyHp === 150, 'Battle starts Running with Enemy HP 150');
  expect(battle.snapshot.units[0].maxHp === 256 && closeTo(battle.snapshot.units[0].damage, 19.2), 'star multiplier applies to HP and Damage');
  const before = battle.snapshot.enemyHp; battle.tick(); expect(closeTo(battle.snapshot.enemyHp, before - 19.2), 'all alive player units attack every tick');
  while (battle.snapshot.status === 'Running') battle.tick(); expect(battle.snapshot.status === 'Win', 'strong fixture reaches Win without input');
  const frozenWin = JSON.stringify(battle.snapshot); battle.tick(); expect(JSON.stringify(battle.snapshot) === frozenWin, 'Win stops further HP changes');
  const priority = formation([{ contentId: 'beast-a', star: 1 }, { contentId: 'beast-c', star: 1 }, { contentId: 'beast-d', star: 1 }], ['mid-1', 'front-2', 'front-1']); const targets = new AutonomousBattleModel(priority); targets.tick();
  expect(targets.snapshot.units.find((unit) => unit.slotId === 'front-1')?.currentHp === 25, 'enemy targets Front before Mid and lowest column within row');
  const defeated = formation([{ contentId: 'beast-b', star: 1 }, { contentId: 'beast-a', star: 1 }], ['front-1', 'back-1']); const defeatModel = new AutonomousBattleModel(defeated); defeatModel.tick(); defeatModel.tick(); defeatModel.tick(); defeatModel.tick();
  expect(defeatModel.snapshot.units.find((unit) => unit.slotId === 'front-1')?.currentHp === 0 && defeatModel.snapshot.units.find((unit) => unit.slotId === 'back-1')?.currentHp === 65, 'defeated units stop being targeted and later targets advance');
  const weak = new AutonomousBattleModel(formation([{ contentId: 'beast-b', star: 1 }], ['front-1'])); while (weak.snapshot.status === 'Running') weak.tick(); expect(weak.snapshot.status === 'Lose', 'weak fixture reaches Lose without input');
  const frozenLose = JSON.stringify(weak.snapshot); weak.tick(); expect(JSON.stringify(weak.snapshot) === frozenLose, 'Lose stops further HP changes');
  const energy = new EnergyQueue(); energy.addCharge('energy-a', 2); const energyBefore = energy.getTotalCharges(); const formationBefore = JSON.stringify(strongFormation.units); battle.tick();
  expect(JSON.stringify(strongFormation.units) === formationBefore && energy.getTotalCharges() === energyBefore, 'formation is read-only and Energy remains unchanged during Battle');
}
function formation(units: Array<{ contentId: string; star: 1 | 2 | 3 }>, slots: string[]): BattleFormation { const formation = new BattleFormation(units); formation.units.forEach((unit, index) => formation.place(unit.unitId, slots[index])); return formation; }
function expect(value: boolean, label: string): void { if (!value) throw new Error(`P1-S3 check failed: ${label}`); }
function closeTo(value: number, expected: number): boolean { return Math.abs(value - expected) < 0.000001; }
