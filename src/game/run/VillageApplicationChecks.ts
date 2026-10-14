import { parseCamp, type CampState } from './CampState';
import { VillageApplication } from './VillageApplication';
import { resourceCount, tradeResource, awardRunWood } from './VillageEconomy';
import { VillageSimulation } from './VillageSimulation';

export function villageApplicationChecks(): void {
  const expect = (ok: boolean, message: string) => {
    if (!ok) throw Error(`Village application: ${message}`);
  };
  const state = parseCamp({ version: 2, wood: 10 });
  let allowSave = false;
  let persisted: CampState | undefined;
  const app = new VillageApplication(state, { save: candidate => {
    if (!allowSave) return false;
    persisted = parseCamp(candidate);
    return true;
  } });
  const before = JSON.stringify(state);
  const rejected = app.begin('garden');
  expect(!rejected.ok && rejected.block.code === 'persistence-failed' && JSON.stringify(state) === before,
    'failed start preserves wallet, inputs and job');
  allowSave = true;
  expect(app.begin('garden').ok, 'start persists before commit');
  const wallet = state.economy.wallet;
  app.advance('garden', 12);
  expect(app.advanceLife(1).saved && persisted?.economy.garden?.remaining === 48,
    'checkpoint stores paid remaining progress');
  const reload = parseCamp(persisted);
  const resumed = new VillageApplication(reload, { save: () => true });
  const remaining = resumed.begin('garden');
  expect(remaining.ok && remaining.value === 48 && reload.economy.wallet === wallet,
    'reload resumes without charging twice');
  const early = resumed.deliver('garden');
  expect(!early.ok && early.block.code === 'not-ready', 'incomplete job cannot deliver');
  app.advance('garden', 48);
  const ready = JSON.stringify(state);
  allowSave = false;
  expect(!app.deliver('garden').ok && JSON.stringify(state) === ready,
    'failed delivery retains job and inventory for retry');
  allowSave = true;
  const carrots = resourceCount(state, 'carrot');
  expect(app.deliver('garden').ok && resourceCount(state, 'carrot') === carrots + 5,
    'retry commits one batch');
  expect(!app.deliver('garden').ok && resourceCount(state, 'carrot') === carrots + 5,
    'duplicate delivery cannot grant twice');

  const poor = parseCamp({ version: 3, wood: 0 });
  const poorApp = new VillageApplication(poor, { save: () => { throw Error('unexpected write'); } });
  const funds = poorApp.begin('garden');
  const input = poorApp.begin('fishing');
  expect(!funds.ok && funds.block.code === 'missing-funds', 'funds have a typed reason');
  expect(!input.ok && input.block.code === 'missing-input', 'input has a distinct typed reason');
  const throwing = new VillageApplication(parseCamp({ version: 2 }), { save: () => { throw Error('disk'); } });
  expect(!throwing.begin('garden').ok, 'throwing storage becomes a retryable failure');

  const full = parseCamp({ version: 2, wood: 90 });
  full.economy.lots = [];
  const fullApp = new VillageApplication(full, { save: () => true });
  expect(fullApp.begin('anvil').ok, 'start before incoming overflow');
  fullApp.advance('anvil', 50);
  awardRunWood(full);
  const blocked = fullApp.deliver('anvil');
  expect(!blocked.ok && blocked.block.code === 'storage-full' && full.economy.anvil?.remaining === 0,
    'overflow retains ready output with distinct reason');
  tradeResource(full, 'wood', 5, 'sell');
  expect(fullApp.deliver('anvil').ok, 'freeing capacity permits pending delivery');

  const life = state.economy.life.seconds;
  app.advanceLife(NaN);
  app.advanceLife(-1);
  expect(state.economy.life.seconds === life, 'invalid time cannot advance life');
  allowSave = false;
  expect(!app.advanceLife(1).saved, 'checkpoint failure is observable');
  allowSave = true;
  app.advanceLife(0.1);
  expect(persisted?.economy.life.seconds !== state.economy.life.seconds,
    'failed checkpoint does not retry every frame');
  expect(app.advanceLife(0.9).saved && persisted?.economy.life.seconds === state.economy.life.seconds,
    'failed checkpoint retries at the next bounded interval');

  const sim = new VillageSimulation(() => {});
  sim.sync([{ id: 'a', stationId: 'garden', kind: 'garden', home: { x: 0, y: 0 }, work: { x: 85, y: 0 }, face: 1 }]);
  const snapshot = sim.snapshot();
  sim.step(2);
  expect(snapshot[0].phase === 'rest' && snapshot[0].x === 0 && sim.snapshot()[0].phase === 'walk',
    'snapshot remains detached as simulation advances');
  sim.dispose();
  expect(sim.snapshot().length === 0, 'disposed simulation exposes no stale residents');

  const working = parseCamp({ version: 2, wood: 10, residents: ['beast-c'] });
  let transaction: CampState | undefined;
  let writes = 0;
  let canPersist = true;
  const production = new VillageApplication(working, { save: candidate => {
    writes++;
    if (!canPersist) return false;
    transaction = parseCamp(candidate);
    return true;
  } }, () => 0);
  const started = production.begin('garden');
  const jobId = working.economy.garden!.id;
  expect(started.ok && started.events?.[0]?.type === 'production-started' && started.events[0].jobId === jobId,
    'start event identifies the committed persisted job');
  const resuming = production.begin('garden');
  expect(resuming.ok && resuming.events?.length === 0, 'resuming paid work emits no duplicate start event');
  const productionSnapshot = production.production('garden');
  production.advance('garden', 4);
  expect(productionSnapshot.remaining === 60 && production.production('garden').remaining === 56,
    'production snapshots are detached from authoritative progress');
  const stationJob = { id: 'beast-c', stationId: 'garden' as const, kind: 'garden' as const,
    home: { x: 0, y: 0 }, work: { x: 0, y: 0 }, face: 1 };
  let deliveredEvents = 0;
  const integrated = new VillageSimulation(kind => {
    if (kind !== 'garden') return false;
    const result = production.deliver(kind);
    if (result.ok) deliveredEvents += result.events?.filter(event => event.type === 'production-delivered').length ?? 0;
    return result.ok;
  }, {
    begin: kind => { if (kind !== 'garden') return false; const result = production.begin(kind); return result.ok ? result.value : false; },
    advance: (kind, seconds) => { if (kind === 'garden') production.advance(kind, seconds); },
    progress: kind => kind === 'garden' ? production.production(kind) : undefined,
    rate: id => production.workRate(id),
  });
  integrated.sync([stationJob]); integrated.step(3);
  integrated.step(5);
  const remainingWork = working.economy.garden!.remaining;
  integrated.sync([stationJob]); integrated.step(100, true);
  expect(remainingWork === 51 && integrated.snapshot()[0].remaining === 51 && integrated.snapshot()[0].jobId === jobId,
    'rebind/hidden preserve saved progress and job identity');
  working.economy.life.hungry = ['beast-c'];
  integrated.step(4);
  expect(working.economy.garden!.remaining === 48 && integrated.snapshot()[0].remaining === 48,
    'hunger advances exactly one authoritative work clock');
  // External progress changes are observed rather than overwritten by a stale mirror.
  production.advance('garden', 48);
  canPersist = false;
  const beforeFailure = JSON.stringify(working);
  integrated.step(.1);
  expect(JSON.stringify(working) === beforeFailure && deliveredEvents === 0 && integrated.snapshot()[0].remaining === 0,
    'failed ready delivery preserves zero work and emits no completion');
  expect(production.production('garden').block?.code === 'persistence-failed', 'snapshot exposes persistence failure');
  const attempts = writes;
  integrated.step(.1);
  expect(writes === attempts, 'pending output waits before retrying, without extra work');
  canPersist = true;
  integrated.step(1);
  expect(deliveredEvents === 1 && !working.economy.garden && transaction?.seenStoryIds.includes('garden.carrot-bite') === true,
    'delivery, story receipt and inventory share the successful transaction');
  expect(transaction?.diary.includes('Thỏ bị bắt quả tang gặm vụng cà rốt trong vườn.') === true,
    'incident diary is persisted with delivery, without a separate unsafe write');
  integrated.step(.1);
  expect(deliveredEvents === 1, 'finish replay cannot emit a second delivery');
  const empty = new VillageApplication(parseCamp({ version: 3 }), { save: () => true });
  expect(empty.production('fishing').block?.code === 'no-worker', 'missing worker is distinct from missing recipe inputs');
  const leisure = parseCamp({ version: 2 });
  const leisureApp = new VillageApplication(leisure, { save: () => false });
  const leisureBefore = JSON.stringify(leisure);
  expect(!leisureApp.completeActivity('bath').ok && JSON.stringify(leisure) === leisureBefore,
    'leisure diary also follows save-before-commit');
}
