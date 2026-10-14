import { validBattleResult } from './BattleResultValidation';
import type { MatchEndMessage } from '../../network/protocol/NetworkMessages';
import { BattleUnitVisualManager, type UnitVisual } from '../ui/battle/BattleUnitVisualManager';

export function runBattleResultPresentationChecks(): void {
  const assert = (ok: boolean, message: string) => { if (!ok) throw new Error(message); };
  const result = { winnerTeamId: 'TeamA', snapshot: { status: 'Win', units: [{ currentHp: 10 }], enemies: [{ currentHp: 1 }] } } as MatchEndMessage;
  assert(!validBattleResult(result), 'Living defeated team must not lose a heart');
  result.snapshot!.enemies[0].currentHp = 0;
  assert(validBattleResult(result), 'Eliminated team allows round result');
  result.snapshot!.enemies[0].currentHp = 10;
  result.endReason = 'surrender';
  assert(validBattleResult(result), 'Explicit forfeit can end combat with living units');
  result.snapshot!.status = 'Lose';
  assert(!validBattleResult(result), 'Winner must agree with canonical status');

  const rectangle = () => ({ width: 48, scaleX: 1, setScale(x: number) { this.scaleX = x; return this; } });
  const hpFill = rectangle(), ghostFill = rectangle();
  const bar = { alpha: 1, setAlpha(x: number) { this.alpha = x; return this; } };
  let pending: { scaleX: number } | undefined;
  const scene = { tweens: { killTweensOf() { pending = undefined; }, add(config: { scaleX: number }) { pending = config; } } };
  const manager = new BattleUnitVisualManager(scene as never, {} as never, [], new Map(), new Map(), new Map(), new Map());
  const visual = { hpFill, ghostFill, hpBarContainer: bar, currentHpRatio: 1 } as unknown as UnitVisual;
  manager.updateHpBar(visual, 0.5, false);
  assert(hpFill.width * hpFill.scaleX === 24 && pending?.scaleX === 0.5, 'HP geometry and delayed damage must show half health');
  manager.updateHpBar(visual, 0.8, false);
  assert(!pending && ghostFill.scaleX === 0.8, 'Healing cancels delayed damage');
  manager.updateHpBar(visual, 0.2, false);
  manager.updateHpBar(visual, 0, true);
  assert(!pending && hpFill.scaleX === 0 && ghostFill.scaleX === 0 && bar.alpha === 0, 'KO cancels delayed bar and hides health');
  console.log('Battle result / HP presentation checks passed');
}
