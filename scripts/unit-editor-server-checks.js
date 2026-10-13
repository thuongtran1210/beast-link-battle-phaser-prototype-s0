import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { deflateSync } from 'node:zlib';
import { build } from 'esbuild';
import { unitEditorPlugin } from './unit-editor-server.js';
const workspace = process.cwd(), root = await fs.mkdtemp(path.join(os.tmpdir(), 'beast-character-editor-'));
if (!path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(root).startsWith('beast-character-editor-'))
    throw Error('Unsafe test temp path');
await fs.mkdir(path.join(root, 'src/game/config'), { recursive: true });
await fs.copyFile(path.join(workspace, 'src/game/config/CharacterSchema.ts'), path.join(root, 'src/game/config/CharacterSchema.ts'));
const file = path.join(root, 'src/game/config/CharacterProjects.json');
await fs.writeFile(file, JSON.stringify({ version: 1, characters: {} }));
await fs.writeFile(path.join(root, 'src/game/config/UnitOverrides.json'), JSON.stringify({ 'beast-a': { hp: 42 } }));
const module = await build({ entryPoints: [path.join(workspace, 'src/game/ui/art/AnimationProject.ts')], bundle: true, write: false, format: 'esm', platform: 'node' });
const { createAnimationProject } = await import(`data:text/javascript;base64,${Buffer.from(module.outputFiles[0].text).toString('base64')}`);
let middleware;
unitEditorPlugin().configureServer({ config: { root }, middlewares: { use(_route, handler) { middleware = handler; } } });
const server = http.createServer((req, res) => middleware(req, res));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const send = async (data, origin = url) => { const response = await fetch(url + '/__character-editor', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return { status: response.status, body: await response.json() }; };
const read = async (id = 'beast-a') => (await fetch(`${url}/__character-editor?id=${id}`)).json();
function crc(bytes) { let n = 0xffffffff; for (const b of bytes) {
    n ^= b;
    for (let i = 0; i < 8; i++)
        n = (n >>> 1) ^ ((n & 1) ? 0xedb88320 : 0);
} return (n ^ 0xffffffff) >>> 0; }
function png(width, height) { const chunk = (type, data) => { const name = Buffer.from(type), length = Buffer.alloc(4), sum = Buffer.alloc(4); length.writeUInt32BE(data.length); sum.writeUInt32BE(crc(Buffer.concat([name, data]))); return Buffer.concat([length, name, data, sum]); }; const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6; return 'data:image/png;base64,' + Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.alloc(height * (1 + width * 4)))), chunk('IEND', Buffer.alloc(0))]).toString('base64'); }
try {
    const initial = await read();
    assert.equal(initial.record.unit.hp, 42, 'legacy preserved on read');
    const payload = { id: 'beast-a', section: 'unit', value: { hp: 321, damage: 27, skills: { 2: { strength: 222 } } }, revision: initial.revisions.unit };
    assert.equal((await send(payload, 'https://invalid.example')).status, 403);
    assert.equal((await send({ ...payload, id: '../outside' })).status, 400);
    assert.equal((await send({ ...payload, value: { hp: -1 } })).status, 400);
    assert.equal((await send({ ...payload, value: { skills: { 1: { unknown: 1 } } } })).status, 400);
    const broken=Buffer.from(png(256,256).split(',')[1],'base64');broken[broken.length-1]^=1;
    assert.equal((await send({...payload,avatarData:'data:image/png;base64,'+broken.toString('base64')})).status,400,'corrupt PNG rejected');
    const saved = await send({ ...payload, avatarData: png(256, 256) });
    assert.equal(saved.status, 200, saved.body.error);
    assert.equal(saved.body.record.unit.hp, 321);
    await fs.access(path.join(root, 'public', saved.body.record.unit.avatar.slice(1)));
    assert.equal((await send(payload)).status, 409, 'stale unit revision');
    const value = createAnimationProject('beast-a'), atlasData = Object.fromEntries(Object.keys(value.clips).map(c => [c, png(2048, 1024)]));
    const anim = { id: 'beast-a', section: 'animation', value, atlasData, revision: initial.revisions.animation };
    assert.equal((await send({ ...anim, atlasData: { idle: png(256, 256) } })).status, 400, 'all six atlas files required');
    const packed = await send(anim);
    assert.equal(packed.status, 200, packed.body.error);
    assert.equal(packed.body.record.unit.hp, 321, 'animation save preserves unit');
    assert.equal(Object.keys(packed.body.record.atlases).length, 6);
    const updated = await send({ ...payload, value: { hp: 321, damage: 29 }, revision: saved.body.revisions.unit });
    assert.equal(updated.status, 200, 'unit revision independent of animation');
    assert.deepEqual(updated.body.record.animation, value, 'unit save preserves animation');
    assert.equal((await send(anim)).status, 409, 'stale animation revision');
    const restored = await send({ id: 'beast-a', section: 'restore', value: {}, historyId: updated.body.history[0], revision: updated.body.revisions.record });
    assert.equal(restored.status, 200, restored.body.error);
    assert.equal(restored.body.record.unit.damage, 27);
    assert.ok(restored.body.record.animation);
    const other = await read('beast-b');
    const parallel = await Promise.all([send({ id: 'beast-b', section: 'unit', value: { hp: 50 }, revision: other.revisions.unit }), send({ ...payload, value: { hp: 333 }, revision: restored.body.revisions.unit })]);
    assert.ok(parallel.every(r => r.status === 200));
    const store = JSON.parse(await fs.readFile(file, 'utf8'));
    assert.equal(store.characters['beast-b'].unit.hp, 50);
    assert.equal(store.characters['beast-a'].unit.hp, 333);
    console.log('Character Studio API migration, avatar/atlas save, independent revisions, conflict, history restore and concurrent commit checks passed.');
}
finally {
    await new Promise(resolve => server.close(resolve));
    await fs.rm(root, { recursive: true, force: true });
}
