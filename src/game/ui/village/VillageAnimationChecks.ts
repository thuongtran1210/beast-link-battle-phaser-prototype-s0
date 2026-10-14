import { validVillageClip, VillageAnimationClock, VILLAGE_ANIMATIONS, type VillageAnimationClip } from './VillageAnimation';
import { villageActivityLabel, villageWorkerClip } from './VillagePresentationCatalog';

export function villageAnimationChecks(): void {
  const expect = (ok: boolean, message: string) => { if (!ok) throw Error(`Village animation: ${message}`); };
  const boat=VILLAGE_ANIMATIONS['beast-d']!['boat-row']!;expect(validVillageClip(boat)&&boat.loop&&boat.toolOwnership==='sheet'&&boat.cues.length===0,'rowing sheet preserves eight valid frames and owns its paddle without economy cues');
  const fishing=VILLAGE_ANIMATIONS['beast-b']!;
  expect(validVillageClip(fishing.enter!)&&validVillageClip(fishing.work!)&&validVillageClip(fishing.finish!)&&!fishing.enter!.loop&&fishing.work!.loop&&!fishing.finish!.loop,'fishing enter/work/finish preserve owner order and playback');
  const patrol=VILLAGE_ANIMATIONS['beast-a']!.walk!;
  expect(validVillageClip(patrol)&&patrol.loop&&patrol.cues.length===0,'owner patrol sheet is a valid eight-frame visual-only loop');
  const rabbit = VILLAGE_ANIMATIONS['beast-c']!.work!;
  expect(validVillageClip(rabbit) && !rabbit.loop && rabbit.toolOwnership === 'sheet', 'owner care sequence is valid and never loops pickup/release');
  const care = new VillageAnimationClock();
  care.play(rabbit);
  expect(care.advance(8 / rabbit.fps).completed && care.frameIndex === 7, 'care holds empty-handed final pose without replaying harvest');
  expect(!care.advance(30).completed && care.frameIndex === 7, 'job waiting cannot repeat the care sequence');
  const rebound = new VillageAnimationClock(); rebound.play(rabbit); rebound.seek(care.elapsedSeconds);
  expect(rebound.frameIndex === 7 && !rebound.advance(.1).completed, 'restored presentation holds final pose without redoing pickup');
  const pickup=VILLAGE_ANIMATIONS['beast-f']!.pickup!;
  const loaded=VILLAGE_ANIMATIONS['beast-f']!['loaded-walk']!,delivered=VILLAGE_ANIMATIONS['beast-f']!.finish!;
  expect(validVillageClip(loaded)&&validVillageClip(delivered)&&loaded.loop&&!delivered.loop&&!VILLAGE_ANIMATIONS['beast-f']!.greet,'loaded walk loops; finish one-shot; mislabeled greet remains unbound');
  const travel=new VillageAnimationClock();travel.play(loaded);expect(travel.advance(1).frame===0,'loaded walk wraps without completion');
  travel.play(delivered);expect(travel.advance(.5).cues[0]?.socket==='delivery','finish frame five emits visual release');
  expect(validVillageClip(pickup)&&!pickup.loop,'owner pickup is a one-shot with valid measured windows');
  const carrier=new VillageAnimationClock();carrier.play(pickup);
  const handoff=carrier.advance(3/pickup.fps);
  expect(handoff.frame===3&&handoff.cues.length===1&&handoff.cues[0].socket==='hand','frame four emits one visual handoff cue');
  expect(carrier.advance(5/pickup.fps).completed&&carrier.frameIndex===7&&!carrier.advance(2).completed,'pickup holds loaded final pose without replay');
  const frames = Array.from({ length: 8 }, (_, index) => ({ x: index % 4 * 512, y: Math.floor(index / 4) * 512,
    width: 512, height: 512, pivotX: 256, pivotY: 440 }));
  const clip: VillageAnimationClip = { assetId: 'diagnostic', source: '/diagnostic.png', referencePaths: [], actualWidth: 2048,
    actualHeight: 1024, neutralBodyHeight: 330, frames, fps: 8, loop: true, cues: [{ frame: 3, socket: 'work-contact', x: 330, y: 420 }],
    toolOwnership: 'sheet', status: 'test-only' };
  expect(validVillageClip(clip), 'measured frame windows and local pivots are valid');
  expect(!validVillageClip({ ...clip, frames: frames.slice(0, 7) }), 'missing frame fails validation');
  expect(!validVillageClip({ ...clip, actualWidth: 1700 }), 'window outside actual sheet fails validation');
  expect(!validVillageClip({ ...clip, fps: NaN }), 'invalid timing fails validation');
  const clock = new VillageAnimationClock();
  clock.play(clip);
  expect(clock.advance(.375).frame === 3, 'frame boundaries use authored fps');
  const paused = clock.advance(10, true);
  expect(paused.frame === 3 && paused.cues.length === 0, 'pause holds frame and emits no cue');
  clock.play(clip);
  expect(clock.frameIndex === 3, 'repeated play does not reset an active loop');
  expect(clock.advance(.625).frame === 0, 'loop wraps exactly at duration');
  const cue = clock.advance(.375);
  expect(cue.cues.length === 1 && cue.cues[0].socket === 'work-contact', 'cue repeats once on its next loop crossing');
  expect(clock.advance(.01).cues.length === 0, 'same frame cannot replay a cue');
  const oneShot = { ...clip, loop: false };
  clock.play(oneShot);
  const finished = clock.advance(1);
  expect(finished.completed && finished.frame === 7, 'one-shot holds its final pose');
  expect(!clock.advance(1).completed && clock.frameIndex === 7, 'one-shot completes only once');
  clock.play(oneShot, true);
  expect(clock.frameIndex === 0, 'explicit restart resets one-shot');
  clock.play({ ...oneShot, cues: [{ frame: 0, socket: 'hand', x: 20, y: 30 }] });
  expect(clock.advance(.01, true).cues.length === 0 && clock.advance(.01).cues.length === 1,
    'frame-zero cue fires once after activation, never while paused');
  expect(clock.advance(.01).cues.length === 0, 'frame-zero cue is not repeated within the first frame');
  clock.play(undefined);
  expect(clock.advance(10).cues.length === 0 && clock.frameIndex === 0, 'missing clip is inert fallback');
  clock.dispose(); clock.play(clip);
  expect(clock.advance(1).cues.length === 0, 'disposed player cannot restart');
  const worker = { id: 'beast-c', stationId: 'garden' as const, kind: 'garden' as const,
    phase: 'work' as const, remaining: 12, jobId: 4, x: 0, y: 0, facing: 1 };
  expect(villageActivityLabel(worker).includes('12s') && villageWorkerClip(worker) === 'work', 'presentation derives work state from snapshot');
  const blocked = { ...worker, remaining: 0, block: { code: 'storage-full' as const, message: 'Kho đầy' } };
  expect(villageActivityLabel(blocked) === 'Kho đầy' && villageWorkerClip(blocked) === 'idle', 'blocked output stops working visuals');
}
