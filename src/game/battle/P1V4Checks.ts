import type { AutonomousBattleSnapshot } from './AutonomousBattleModel';
import { deriveBattleHealPresentation, deriveBattleTickPresentation } from './BattlePresentation';

export function runP1V4Checks(): void {
  const before = snapshot({
    enemyHp: 100,
    units: [
      unit('u1', 'Tanker', 50, 80),
      unit('u2', 'Mage', 40, 40),
      unit('u3', 'Ranger', 0, 45),
    ],
  });
  const after = snapshot({
    enemyHp: 80,
    units: [
      unit('u1', 'Tanker', 35, 80),
      unit('u2', 'Mage', 40, 40),
      unit('u3', 'Ranger', 0, 45),
    ],
  });

  const tick = deriveBattleTickPresentation(before, after);
  expect(tick.attackers.length === 2, 'only living units present attack actions');
  expect(tick.attackers.some((attacker) => attacker.unitId === 'u1' && attacker.role === 'Tanker'), 'attacker role is preserved for animation selection');
  expect(tick.enemyDamage === 20, 'enemy damage presentation derives from model delta');
  expect(tick.enemyTargetId === 'u1' && tick.targetDamage === 15, 'enemy hit target derives from model delta');
  expect(tick.defeatedUnitIds.length === 0 && !tick.enemyDefeated, 'no false death presentation');

  const death = deriveBattleTickPresentation(
    snapshot({ enemyHp: 20, units: [unit('u1', 'Tanker', 10, 80)] }),
    snapshot({ enemyHp: 0, units: [unit('u1', 'Tanker', 0, 80)] }),
  );
  expect(death.enemyDefeated, 'enemy defeat presentation derives from HP reaching zero');
  expect(death.defeatedUnitIds.length === 1 && death.defeatedUnitIds[0] === 'u1', 'unit defeat presentation derives from HP reaching zero');

  const heal = deriveBattleHealPresentation(
    snapshot({ enemyHp: 80, units: [unit('u1', 'Tanker', 35, 80)] }),
    snapshot({ enemyHp: 80, units: [unit('u1', 'Tanker', 65, 80)] }),
  );
  expect(heal.unitId === 'u1' && heal.amount === 30, 'heal presentation derives exact model HP recovery');

  const capped = deriveBattleHealPresentation(
    snapshot({ enemyHp: 80, units: [unit('u1', 'Tanker', 80, 80)] }),
    snapshot({ enemyHp: 80, units: [unit('u1', 'Tanker', 80, 80)] }),
  );
  expect(capped.amount === 0 && capped.unitId === undefined, 'capped heal does not invent visible HP recovery');
}

function unit(
  unitId: string,
  role: 'Tanker' | 'Assassin' | 'Ranger' | 'Mage',
  currentHp: number,
  maxHp: number,
) {
  return {
    unitId,
    beastId: `beast-${unitId}`,
    role,
    star: 1 as const,
    slotId: 'front-1',
    row: 'Front' as const,
    column: 1,
    currentHp,
    maxHp,
    damage: 10,
  };
}

function snapshot(input: {
  enemyHp: number;
  units: AutonomousBattleSnapshot['units'];
}): AutonomousBattleSnapshot {
  return {
    status: input.enemyHp === 0 ? 'Win' : 'Running',
    enemyHp: input.enemyHp,
    enemyMaxHp: 100,
    enemyDamage: 15,
    elapsedTicks: 1,
    units: input.units,
  };
}

function expect(value: boolean, label: string): void {
  if (!value) throw new Error(`P1-V4 check failed: ${label}`);
}
