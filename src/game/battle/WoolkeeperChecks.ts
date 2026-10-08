import { AutonomousBattleModel, P1V13A_SIGNATURE_RULES, type AutonomousBattleSnapshot, type CombatUnit, type EnemyCombatUnit } from './AutonomousBattleModel';
import { BattleFormation } from './BattleFormation';
export function woolkeeperChecks(): void {
  for (const beast of ['beast-h', 'beast-i', 'beast-j']) {
    for (const level of [1, 3] as const) {
      const formation = new BattleFormation([{contentId: beast, star: level}, {contentId: 'beast-a', star: 1}]);
      formation.place('unit-1', 'back-3'); formation.place('unit-2', 'front-3');
      const fixtures = [1,2,3].map(n => ({enemyId: `e${n}`, row: 'Front' as const, column: 3, slotId: `enemy-front-${n}`, maxHp: 1000, damage: 0}));
      const model = new AutonomousBattleModel(formation, fixtures, P1V13A_SIGNATURE_RULES);
      const f = model as unknown as {state: AutonomousBattleSnapshot; resolvePlayerDamage(u: CombatUnit, e: EnemyCombatUnit): void; resolveTimelineEnemies(dt: number): void};
      const unit = f.state.units[0]; const enemy = f.state.enemies[0];
      f.state.enemies.forEach(e => {e.positionX = 0; e.positionLane = 3;});
      f.resolvePlayerDamage(unit, enemy);
      if (beast === 'beast-h') {
        const count = f.state.enemies.filter(e => e.funControlKind === 'Bubble').length;
        if (count !== (level === 3 ? 2 : 1)) throw new Error('Bubble target count');
        f.state.elapsedTime = 2; f.resolveTimelineEnemies(.1);
        if (f.state.enemies.some(e => e.funControlKind === 'Bubble')) throw new Error('Bubble must expire');
      } else if (beast === 'beast-i') {
        if (f.state.units.filter(u => (u.temporaryShieldHp ?? 0) > 0).length !== (level === 3 ? 2 : 1)) throw new Error('Toy shield target count');
        if (f.state.units.some(u => u.currentHp > u.maxHp)) throw new Error('Toy cannot overheal');
      } else {
        if (enemy.currentHp !== 1000 || enemy.bombAt === undefined) throw new Error('Bomb must wait for fuse');
        f.resolveTimelineEnemies(.1);
        if (enemy.currentHp !== 1000) throw new Error('Bomb exploded early');
        f.state.elapsedTime = 1.3; f.resolveTimelineEnemies(.1);
        if (f.state.enemies.filter(e => e.currentHp < 1000).length !== level || enemy.bombAt !== undefined) throw new Error('Bomb target count or fuse clearing');
      }
      const readyAt = unit.supportReadyAt;
      f.state.elapsedTime = 0; f.resolvePlayerDamage(unit, enemy);
      if (unit.supportReadyAt !== readyAt) throw new Error('New units must respect cooldown');
    }
  }
  for (const star of [1, 2, 3] as const) {
    const formation = new BattleFormation([{contentId: 'beast-g', star}, {contentId: 'beast-a', star: 1}, {contentId: 'beast-e', star: 1}]);
    formation.place('unit-1', 'back-3'); formation.place('unit-2', 'front-3'); formation.place('unit-3', 'front-4');
    const model = new AutonomousBattleModel(formation, [{enemyId: 'target', row: 'Front', column: 3, slotId: 'enemy-front-3', maxHp: 1000, damage: 0}], P1V13A_SIGNATURE_RULES);
    const fixture = model as unknown as { state: AutonomousBattleSnapshot; resolvePlayerDamage(unit: CombatUnit, target: EnemyCombatUnit): void };
    const [healer, first, second] = fixture.state.units;
    first.currentHp = 1; second.currentHp = second.maxHp / 2;
    const enemy = fixture.state.enemies[0]; const hp = enemy.currentHp;
    fixture.resolvePlayerDamage(healer, enemy);
    if (first.currentHp <= 1 || enemy.currentHp !== hp) throw new Error('Cleric must heal instead of dealing damage');
    if (star === 3 && (!(second.currentHp > second.maxHp / 2) || !(first.temporaryShieldHp! > 0))) throw new Error('3-star Cleric must heal two allies and shield');
    if (star < 3 && second.currentHp !== second.maxHp / 2) throw new Error('Lower-star Cleric heals one target');
    const healed = first.currentHp;
    fixture.resolvePlayerDamage(healer, enemy);
    if (first.currentHp !== healed) throw new Error('Cleric cooldown must prevent repeated healing');
    first.currentHp = 0; second.currentHp = second.maxHp; healer.currentHp = healer.maxHp;
    fixture.state.elapsedTime = 10;
    fixture.resolvePlayerDamage(healer, enemy);
    if (first.currentHp !== 0) throw new Error('Cleric cannot resurrect KO allies');
  }
}
