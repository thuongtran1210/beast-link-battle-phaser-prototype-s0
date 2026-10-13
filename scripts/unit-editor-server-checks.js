import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {unitEditorPlugin} from './unit-editor-server.js';
const root=await fs.mkdtemp(path.join(os.tmpdir(),'beast-unit-editor-'));
await fs.mkdir(path.join(root,'src/game/config'),{recursive:true});
const file=path.join(root,'src/game/config/UnitOverrides.json');await fs.writeFile(file,'{}\n');
let middleware;unitEditorPlugin().configureServer({config:{root},middlewares:{use(_route,handler){middleware=handler;}}});
const server=http.createServer((req,res)=>middleware(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const send=async(data,origin=url)=>{const response=await fetch(url+'/__unit-editor',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:response.status,body:await response.json()};};
try{
 const payload={id:'beast-a',reset:false,value:{hp:321,damage:27},revision:digest({})};
 assert.equal((await send(payload,'https://invalid.example')).status,403);
 assert.equal((await send({...payload,id:'../outside'})).status,400);
 assert.equal((await send({...payload,value:{hp:-1}})).status,400);
 assert.equal(await fs.readFile(file,'utf8'),'{}\n');
 const saved=await send(payload);assert.equal(saved.status,200);assert.equal(JSON.parse(await fs.readFile(file,'utf8'))['beast-a'].hp,321);
 assert.equal((await send(payload)).status,400,'Stale revision must not overwrite');
 const restored=await send({...payload,reset:true,value:{},revision:saved.body.revision});assert.equal(restored.status,200);assert.deepEqual(JSON.parse(await fs.readFile(file,'utf8')),{});
 const backups=await fs.readdir(path.join(root,'art/backups/unit-editor'));assert.equal(backups.length,2);assert.ok((await Promise.all(backups.map(name=>fs.readFile(path.join(root,'art/backups/unit-editor',name),'utf8')))).some(text=>JSON.parse(text)['beast-a']?.hp===321));
 console.log('Unit editor local save, validation, conflict and backup checks passed.');
}finally{await new Promise(resolve=>server.close(resolve));await fs.rm(root,{recursive:true,force:true});}
