import saved from './CharacterProjects.json';
import { validateAnimationConfig, validateUnitConfig, CHARACTER_IDS, CHARACTER_SIGNATURES, canonical, type CharacterStore } from './CharacterSchema';
import { skillValue, characterRecord } from './CharacterProjects';
import { signatureForBeast } from '../battle/BeastRoles';
import { createAnimationProject, savedAnimationProject } from '../ui/art/AnimationProject';
import { AnimationClock } from '../ui/art/AnimationClock';
import { SnowguardAnimationPlayer } from '../ui/art/SnowguardAnimationPlayer';
import { BattleFormation } from '../battle/BattleFormation';
import { AutonomousBattleModel } from '../battle/AutonomousBattleModel';
import type Phaser from 'phaser';
export function characterStudioChecks() {
    const expect = (ok: boolean, label: string) => { if (!ok)
        throw Error(`Character Studio: ${label}`); };
    const rejects = (value: () => unknown, label: string) => { let rejected = false; try {
        value();
    }
    catch {
        rejected = true;
    } expect(rejected, label); };
    for (const id of CHARACTER_IDS)
        expect(signatureForBeast(id) === CHARACTER_SIGNATURES[id], 'signature catalogue matches gameplay');
    rejects(() => validateUnitConfig({ skills: { 2: { duration: NaN } } }, 'beast-a'), 'nonfinite skill');
    rejects(() => validateUnitConfig({ skills: { 1: { carrotDuration: 2 } } }, 'beast-c'), '1-star control remains locked');
    rejects(() => validateUnitConfig({ skills: { 2: { targets: 1.5 } } }, 'beast-h'), 'target count integer');
    rejects(() => validateUnitConfig({ avatar: '/assets/unit-custom/beast-b-0000000000000000.png' }, 'beast-a'), 'cross-unit avatar rejected');
    rejects(() => validateUnitConfig({ skills: { 2: { unknown: 1 } } }, 'beast-a'), 'unknown skill rejected');
    const project = createAnimationProject('beast-a');
    project.clips.attack.order.reverse();
    project.clips.attack.frames[7].durationMs = 500;
    project.clips.attack.frames[4].keepPolygon = [{ x: 0, y: 0 }, { x: 600, y: 0 }, { x: 600, y: 800 }];
    project.clips.attack.frames[4].eraseRects = [{ x: 500, y: 500, width: 30, height: 40 }];
    expect(validateAnimationConfig(project).clips.attack.frames[4].eraseRects?.length === 1, 'mask roundtrip');
    const malformed = JSON.parse(JSON.stringify(project));
    malformed.clips.attack.frames[4].keepPolygon = [{ x: 0, y: 0 }];
    rejects(() => validateAnimationConfig(malformed), 'incomplete polygon rejected');
    const clock = new AnimationClock(project);
    clock.play('attack', 550);
    expect(clock.frame === 7, 'runtime uses reordered first frame');
    clock.step(.549);
    expect(clock.clip === 'attack', 'action holds until gameplay duration');
    clock.step(.002);
    expect(clock.clip === 'idle', 'returns to locomotion at gameplay duration');
    clock.play('ko', 850);
    clock.step(10);
    expect(clock.frame === 7 && clock.clip === 'ko', 'KO holds terminal frame');
    clock.move(true);
    clock.play('attack', 550);
    expect(clock.clip === 'ko', 'KO ignores new action');
    clock.revive();
    expect(clock.clip === 'idle', 'revive');
    const store = saved as CharacterStore, before = store.characters['beast-a'];
    try {
        store.characters['beast-a'] = { unit: { hp: 100, damage: 10, skills: { 2: { strength: 222, duration: 4 } } }, animation: project, atlases: Object.fromEntries(Object.keys(project.clips).map(clip => [clip, `/assets/character-custom/beast-a-${clip}-0000000000000000.png`])) };
        expect(skillValue('GuardianBrace', 2, 'strength') === 222 && skillValue('GuardianBrace', 2, 'duration') === 4, 'runtime tuning accessors');
        const clone = savedAnimationProject('beast-a');
        clone.clips.attack.frames[0].offsetX = 99;
        expect(characterRecord('beast-a').animation!.clips.attack.frames[0].offsetX === 0, 'editor clone cannot mutate applied config');
        const formation = new BattleFormation([{ contentId: 'beast-a', star: 2, instanceId: 'test-custom' }]);
        formation.place('test-custom', 'front-1');
        const battle = new AutonomousBattleModel(formation);
        expect(battle.snapshot.units[0].maxHp === 180 && battle.snapshot.units[0].damage === 18, 'custom base stats use STAR in Battle');
        let frame = '', origin = 0, scale = 0, listener: ((time: number, delta: number) => void) | undefined;
        const windows: number[][] = [];
        const sprite = { setOrigin: (_x: number, y: number) => { origin = y; return sprite; }, setScale: (s: number) => { scale = s; return sprite; }, setTexture: (_key: string, f: string) => { frame = f; return sprite; }, stop: () => { }, removeAllListeners: () => { } };
        const scene = { textures: { get: () => ({ has: () => false, add: (_name: string, _source: number, ...rect: number[]) => windows.push(rect) }) }, add: { sprite: () => sprite }, events: { on: (_name: string, fn: typeof listener) => { listener = fn; }, off: () => { listener = undefined; } } } as unknown as Phaser.Scene;
        const player = new SnowguardAnimationPlayer(scene, 160, 38);
        player.play('attack', 550);
        expect(frame === '7' && origin === 440 / 512 && scale === .5 && windows[4][0] === 0 && windows[4][1] === 512, 'custom runtime atlas registration and order');
        listener!(0, 551);
        expect(frame === '0', 'custom renderer returns idle');
        player.dispose();
        expect(!listener, 'custom renderer unregisters update');
    }
    finally {
        if (before)
            store.characters['beast-a'] = before;
        else
            delete store.characters['beast-a'];
    }
    expect(canonical({ b: 2, a: 1 }) === canonical({ a: 1, b: 2 }), 'revision ignores property insertion order');
    console.log('Character Studio schema, tuning, masks, action clock and runtime checks passed.');
}
