import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { build } from 'esbuild';
import {validateStudioPng} from './studio-png.js';
export function unitEditorPlugin() {
    return { name: 'local-character-editor', handleHotUpdate(context) { if (context.file.endsWith('/CharacterProjects.json') || context.file.endsWith('\\CharacterProjects.json'))
            return []; }, configureServer(server) {
            const root = server.config.root, file = path.join(root, 'src/game/config/CharacterProjects.json');
            const schemaPromise = build({ entryPoints: [path.join(root, 'src/game/config/CharacterSchema.ts')], bundle: true, write: false, format: 'esm', platform: 'node' }).then(result => import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`));
            let queue = Promise.resolve();
            const digest = (value, schema) => createHash('sha256').update(schema.canonical(value)).digest('hex');
            async function readStore(schema) {
                const store = JSON.parse(await fs.readFile(file, 'utf8'));
                if (store.version !== 1 || !store.characters)
                    throw Error('Phiên bản cấu hình không hỗ trợ.');
                const legacy = JSON.parse(await fs.readFile(path.join(root, 'src/game/config/UnitOverrides.json'), 'utf8'));
                for (const id of schema.CHARACTER_IDS) {
                    if (!store.characters[id] && legacy[id])
                        store.characters[id] = { unit: legacy[id] };
                    if (store.characters[id])
                        schema.validateCharacterRecord(store.characters[id], id);
                }
                return store;
            }
            const revision = (record, s) => ({ unit: digest(record.unit ?? {}, s), animation: digest({ animation: record.animation ?? null, atlases: record.atlases ?? {} }, s), record: digest(record, s) });
            const historyDir = id => path.join(root, 'art/backups/character-studio', id);
            async function history(id) { try {
                return (await fs.readdir(historyDir(id))).filter(name => /^\d+-[a-f0-9-]+\.json$/.test(name)).sort().reverse().slice(0, 50);
            }
            catch (error) {
                if (error.code === 'ENOENT')
                    return [];
                throw error;
            } }
            async function asset(bytes, directory, prefix) { const name = `${prefix}-${createHash('sha256').update(bytes).digest('hex').slice(0, 16)}.png`, dir = path.join(root, 'public/assets', directory); await fs.mkdir(dir, { recursive: true }); await fs.writeFile(path.join(dir, name), bytes); return `/assets/${directory}/${name}`; }
            const middleware = async (req, res) => {
                const reply = (code, value) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(value)); };
                const host = req.headers.host ?? '';
                if (!/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(host))
                    return reply(403, { error: 'Chỉ dùng qua localhost.' });
                try {
                    const schema = await schemaPromise;
                    if (req.method === 'GET') {
                        const id = new URL(req.url, `http://${host}`).searchParams.get('id');
                        if (!schema.CHARACTER_IDS.includes(id))
                            throw Error('Nhân vật không hợp lệ.');
                        const record = (await readStore(schema)).characters[id] ?? {};
                        return reply(200, { record, revisions: revision(record, schema), history: await history(id) });
                    }
                    if (req.method !== 'POST')
                        return reply(405, { error: 'Thao tác không hỗ trợ.' });
                    if (req.headers.origin !== `http://${host}` || req.headers['content-type'] !== 'application/json')
                        return reply(403, { error: 'Yêu cầu lưu phải cùng origin.' });
                    const chunks = [];
                    let size = 0;
                    for await (const chunk of req) {
                        size += chunk.length;
                        if (size > 10000000)
                            throw Error('Dữ liệu vượt 10 MB.');
                        chunks.push(chunk);
                    }
                    const payload = JSON.parse(Buffer.concat(chunks).toString('utf8')), id = payload.id, section = payload.section;
                    if (!schema.CHARACTER_IDS.includes(id) || !['unit', 'animation', 'restore'].includes(section))
                        throw Error('Nhân vật/thao tác không hợp lệ.');
                    let unit, animation, avatar, atlases;
                    if (section === 'unit') {
                        unit = schema.validateUnitConfig(payload.value, id);
                        if (payload.avatarData)
                            avatar = validateStudioPng(payload.avatarData, 256, 256);
                    }
                    if (section === 'animation') {
                        animation = schema.validateAnimationConfig(payload.value);
                        if (animation.beastId !== id)
                            throw Error('Animation thuộc Beast khác.');
                        if (!payload.atlasData || Object.keys(payload.atlasData).length !== 6)
                            throw Error('Cần atlas của đủ 6 clip.');
                        atlases = Object.fromEntries(schema.CLIP_IDS.map(clip => [clip, validateStudioPng(payload.atlasData[clip], 2048, 1024)]));
                    }
                    if (section === 'restore' && (typeof payload.historyId !== 'string' || !/^\d+-[a-f0-9-]+\.json$/.test(payload.historyId)))
                        throw Error('Phiên bản lịch sử không hợp lệ.');
                    const task = async () => {
                        const store = await readStore(schema), before = store.characters[id] ?? {}, current = revision(before, schema);
                        if (payload.revision !== current[section === 'restore' ? 'record' : section]) {
                            const error = Error('Cấu hình đã thay đổi. Tải bản mới trước khi lưu.');
                            error.status = 409;
                            throw error;
                        }
                        let next = { ...before };
                        if (section === 'unit') {
                            if (avatar)
                                unit.avatar = await asset(avatar, 'unit-custom', id);
                            if (unit.avatar)
                                await fs.access(path.join(root, 'public', unit.avatar.slice(1)));
                            next.unit = unit;
                        }
                        if (section === 'animation') {
                            next.animation = animation;
                            next.atlases = {};
                            for (const clip of schema.CLIP_IDS)
                                next.atlases[clip] = await asset(atlases[clip], 'character-custom', `${id}-${clip}`);
                        }
                        if (section === 'restore') {
                            const snapshot = JSON.parse(await fs.readFile(path.join(historyDir(id), payload.historyId), 'utf8'));
                            if (snapshot.id !== id)
                                throw Error('Lịch sử thuộc Beast khác.');
                            next = schema.validateCharacterRecord(snapshot.before, id);
                            for (const assetPath of [next.unit?.avatar, ...Object.values(next.atlases ?? {})].filter(Boolean))
                                await fs.access(path.join(root, 'public', assetPath.slice(1)));
                        }
                        schema.validateCharacterRecord(next, id);
                        const dir = historyDir(id);
                        await fs.mkdir(dir, { recursive: true });
                        await fs.writeFile(path.join(dir, `${Date.now()}-${randomUUID()}.json`), JSON.stringify({ id, section, at: new Date().toISOString(), before }, null, 2) + '\n');
                        store.characters[id] = next;
                        const temp = `${file}.${randomUUID()}.tmp`;
                        try {
                            await fs.writeFile(temp, JSON.stringify(store, null, 2) + '\n');
                            await fs.rename(temp, file);
                        }
                        finally {
                            await fs.rm(temp, { force: true });
                        }
                        return { record: next, revisions: revision(next, schema), history: await history(id) };
                    };
                    const result = queue.then(task);
                    queue = result.catch(() => { });
                    reply(200, await result);
                }
                catch (error) {
                    reply(error.status ?? 400, { error: error.message ?? 'Không lưu được.' });
                }
            };
            server.middlewares.use('/__character-editor', middleware);
        } };
}
