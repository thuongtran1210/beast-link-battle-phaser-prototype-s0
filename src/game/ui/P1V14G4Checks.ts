import { V14G_ENERGY_RUSH_POOL } from '../energy/TacticalEnergyCatalog';
import { energyRushInventory, energyRushMatchLabel, energyRushTilePresentation } from './EnergyRushPresentation';

function ok(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`P1V14G4: ${message}`);
}

export function runP1V14G4Checks(): void {
  const ids = ['energy-a', 'energy-b', 'energy-c', 'energy-d'];
  const names = ['MEND', 'RESCUE', 'BREAK', 'PIERCE'];
  const descriptions = ['Heal frontline', 'Heal backline', 'Damage Frontliner', 'Damage Ranged'];
  const tiles = ids.map((id) => energyRushTilePresentation(id));
  tiles.forEach((tile, index) => {
    ok(tile?.displayName === names[index], `${ids[index]} has catalog tactical name`);
    ok(tile.showInternalLetter === false, `${ids[index]} hides its internal letter`);
    ok(tile.displayName !== 'ENERGY', `${ids[index]} does not use generic ENERGY`);
  });
  ok(energyRushTilePresentation('energy-e') === undefined, 'unknown Energy does not invent tactical identity');

  const fresh = energyRushInventory(() => 0);
  ok(fresh.length === 4, 'fresh tactical inventory has four entries');
  ok(fresh.map((entry) => entry.displayName).join('/') === names.join('/'), 'inventory has catalog order');
  fresh.forEach((entry, index) => {
    ok(entry.charges === 0, `${entry.displayName} zero count remains visible`);
    ok(entry.shortDescription === descriptions[index], `${entry.displayName} uses catalog description`);
  });
  const counts = { 'energy-a': 2, 'energy-b': 0, 'energy-c': 3, 'energy-d': 1, 'energy-e': 9, 'energy-f': 9 };
  const stored = energyRushInventory((id) => counts[id as keyof typeof counts] ?? 0);
  ok(stored.map((entry) => entry.charges).join('/') === '2/0/3/1', 'stored counts map to their tactical type');
  ok(!stored.some((entry) => entry.energyId === 'energy-e' || entry.energyId === 'energy-f'), 'E/F absent from inventory');

  ids.forEach((id, index) => ok(energyRushMatchLabel(id).includes(names[index]), `${id} match label uses tactical name`));
  ok(V14G_ENERGY_RUSH_POOL.join(',') === ids.join(','), 'active Energy Rush pool is exactly A-D');
  ok(!V14G_ENERGY_RUSH_POOL.includes('energy-e') && !V14G_ENERGY_RUSH_POOL.includes('energy-f'), 'active pool excludes E/F');
}
