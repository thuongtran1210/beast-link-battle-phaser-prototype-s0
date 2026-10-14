import { BattleRoom, type RoomScheduler } from './BattleRoom';
import type { ServerMessage, DeployedFormationUnit } from '../protocol/NetworkMessages';

export function onlineMatchRulesChecks(): void {
  const expect = (condition: boolean, message: string) => { if (!condition) throw new Error(`Online rules: ${message}`); };
  let pending = () => {};
  const scheduler: RoomScheduler = { setTimeout: fn => { pending = fn; return 1; }, clearTimeout: () => {}, setInterval: () => 2, clearInterval: () => {} };
  const packets: ServerMessage[] = [];
  const room = new BattleRoom('hearts', 'HEARTS', 'pvp', scheduler);
  room.addPlayer('a', 'A', packet => packets.push(packet)); room.addPlayer('b', 'B', () => {});
  room.setPlayerReady('a', true); room.setPlayerReady('b', true); pending();
  let previousMatchId = '';
  for (let round = 1; round <= 4; round++) {
    const start = packets.filter(packet => packet.type === 'MATCH_START').at(-1)!;
    expect(start.type === 'MATCH_START' && start.round === round && start.hearts?.TeamB === 5 - round, 'Round start preserves hearts');
    if (start.type !== 'MATCH_START') throw new Error('Missing start');
    expect(start.matchId !== previousMatchId, 'Each round has fresh identity'); previousMatchId = start.matchId!;
    room.preparationReady('a', 'BeastRush'); room.preparationReady('b', 'BeastRush');
    room.preparationReady('a', 'EnergyRush'); room.preparationReady('b', 'EnergyRush');
    const unit: DeployedFormationUnit = { unitId: 'same-local-id', beastId: 'beast-a', role: 'Tanker', star: 1, slotId: 'front-1', row: 'Front', column: 1, maxHp: 240, currentHp: 100, damage: 10 };
    room.deployFormation('a', [unit], false); room.deployFormation('b', [{ ...unit, maxHp: 1, currentHp: 1, damage: 0 }], false);
    expect(packets.filter(packet => packet.type === 'OPPONENT_FORMATION_READY').every(packet => packet.type === 'OPPONENT_FORMATION_READY' && packet.units.length === 0 && packet.placements?.every(slot => Object.keys(slot).sort().join(',') === 'column,row,slotId')), 'Preparations expose only shadow positions, no opposing identities or stats');
    room.deployFormation('a', [unit], true, [{ energyId: 'energy-e', charges: 1 }]);
    room.deployFormation('b', [{ ...unit, maxHp: 1, currentHp: 1, damage: 0 }], true);
    expect(room.state === 'BattleCountdown' && room.step() === null, 'Both ready lock combat until reveal');
    for (let i = 0; i < 5; i++) pending();
    expect(String(room.state) === 'BATTLE', 'Exactly five scheduled seconds precede real units');
    expect(room.receiveCommand('a', { type: 'CastTacticalEnergy', energyId: 'energy-e', tick: 0, commandId: `heal-${round}`, matchId: start.matchId }), 'Fresh round inventory can be consumed');
    let limit = 500;
    while (room.state === 'BATTLE' && limit-- > 0) room.step();
    expect(limit > 0, 'Natural battle resolves');
    const result = packets.filter(packet => packet.type === 'MATCH_END').at(-1)!;
    expect(result.type === 'MATCH_END' && result.hearts?.TeamA === 4 && result.hearts?.TeamB === 4 - round, 'Only loser loses one heart');
    expect(result.type === 'MATCH_END' && result.matchFinished === (round === 4), 'One battle does not end whole match');
    expect(room.step() === null, 'Repeated terminal step cannot deduct more hearts');
    room.nextRoundReady('a'); room.nextRoundReady('a'); room.nextRoundReady('intruder');
    if (round < 4) {
      expect(String(room.state) === 'RoundResult', 'Fast ready player waits at round result');
      room.nextRoundReady('b'); expect(String(room.state) === 'BeastRush', 'Both ready start fresh recruitment');
    } else {
      room.nextRoundReady('b'); expect(String(room.state) === 'ENDED', 'Zero hearts blocks further rounds');
    }
  }
  room.dispose();
  console.log('Online privacy, five-second reveal and four-heart multi-round rules checks passed.');
}
