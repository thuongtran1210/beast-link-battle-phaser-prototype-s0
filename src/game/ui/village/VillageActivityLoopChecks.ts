import { VillageActivityLoop, type VillageFrameEnvironment } from './VillageActivityLoop';

export function villageActivityLoopChecks(): void {
  const expect = (ok: boolean, message: string) => { if (!ok) throw Error(`Village loop: ${message}`); };
  let id = 0;
  let hidden = false;
  const frames = new Map<number, (now: number) => void>();
  const visibility = new Set<() => void>();
  const pageHide = new Set<() => void>();
  const env: VillageFrameEnvironment = {
    requestFrame: callback => { frames.set(++id, callback); return id; },
    cancelFrame: frame => { frames.delete(frame); },
    hidden: () => hidden,
    onVisibility: callback => { visibility.add(callback); return () => { visibility.delete(callback); }; },
    onPageHide: callback => { pageHide.add(callback); return () => { pageHide.delete(callback); }; },
  };
  const fire = (now: number) => {
    const entry = frames.entries().next().value;
    if (!entry) throw Error('No pending village frame');
    frames.delete(entry[0]);
    entry[1](now);
  };
  let work = 0;
  let saves = 0;
  const loop = new VillageActivityLoop(env, seconds => { work += seconds; }, () => { saves++; });
  loop.start(); loop.start();
  expect(frames.size === 1 && visibility.size === 1 && pageHide.size === 1, 'repeated start owns one frame and listeners');
  fire(0); fire(100);
  expect(work === .1, 'zero timestamp is valid and first frame has no catchup');
  hidden = true;
  for (const callback of visibility) callback();
  fire(90000);
  expect(work === .1 && saves === 1, 'hidden time pauses work and checkpoints once');
  hidden = false;
  for (const callback of visibility) callback();
  fire(100000);
  expect(work === .1, 'resume resets elapsed origin even without background frames');
  fire(100100);
  expect(work === .2, 'next visible frame resumes active work');
  for (const callback of pageHide) callback();
  expect(saves === 2, 'page exit checkpoints before browser teardown');
  const queued = frames.values().next().value!;
  loop.dispose(); loop.dispose(); loop.start(); queued(100200);
  expect(frames.size === 0 && visibility.size === 0 && pageHide.size === 0 && work === .2,
    'dispose cancels pending frames/listeners and ignores stale callbacks/restart');
  const replacement = new VillageActivityLoop(env, () => replacement.dispose(), () => {});
  replacement.start(); fire(101000);
  expect(frames.size === 0 && visibility.size === 0, 'dispose during tick cannot schedule an orphan frame');
}
