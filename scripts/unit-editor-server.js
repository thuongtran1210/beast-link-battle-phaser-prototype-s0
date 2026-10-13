import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

// Only the local development server exposes writes. Paths never come from the client.
export function unitEditorPlugin(){return {name:'local-unit-editor',configureServer(server){
  let queue=Promise.resolve();
  server.middlewares.use('/__unit-editor',async(req,res)=>{
    const fail=(code,message)=>{res.statusCode=code;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:message}));};
    const host=req.headers.host??'';
    if(!/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(host))return fail(403,'Chỉ lưu qua localhost.');
    if(req.method!=='POST')return fail(405,'Dùng POST để lưu.');
    if(req.headers.origin!==`http://${host}`||req.headers['content-type']!=='application/json')return fail(403,'Yêu cầu lưu không hợp lệ.');
    try{
      let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>500000)throw Error('Dữ liệu quá lớn.');}
      const payload=JSON.parse(body),id=payload.id;
      if(!/^beast-[a-j]$/.test(id)||typeof payload.reset!=='boolean')throw Error('Nhân vật hoặc thao tác không hợp lệ.');
      const value=payload.value;if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['hp','damage','avatar'].includes(k)))throw Error('Cấu hình không hợp lệ.');
      for(const key of ['hp','damage'])if(value[key]!==undefined&&(typeof value[key]!=='number'||!Number.isFinite(value[key])||value[key]<1||value[key]>100000))throw Error('HP/sát thương phải từ 1 đến 100000.');
      if(value.avatar!==undefined&&!/^\/assets\/unit-custom\/beast-[a-j]-[a-f0-9]{16}\.png$/.test(value.avatar))throw Error('Avatar không hợp lệ.');
      let png;if(payload.avatarData){if(typeof payload.avatarData!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(payload.avatarData))throw Error('Chỉ nhận avatar PNG.');png=Buffer.from(payload.avatarData.split(',')[1],'base64');if(png.length<24||png.length>350000||png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||png.readUInt32BE(16)!==256||png.readUInt32BE(20)!==256)throw Error('Avatar phải là PNG 256×256.');}
      const root=server.config.root,file=path.join(root,'src/game/config/UnitOverrides.json');
      const task=async()=>{
        const old=await fs.readFile(file,'utf8'),all=JSON.parse(old);
        const token=createHash('sha256').update(JSON.stringify(all[id]??{})).digest('hex');
        if(payload.revision!==token)throw Error('Cấu hình đã thay đổi ở nơi khác. Tải lại trang trước khi lưu.');
        if(payload.reset)delete all[id];else{
          if(png){const name=`${id}-${createHash('sha256').update(png).digest('hex').slice(0,16)}.png`,dir=path.join(root,'public/assets/unit-custom');await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,name),png);value.avatar=`/assets/unit-custom/${name}`;}
          all[id]=value;
        }
        const backups=path.join(root,'art/backups/unit-editor');await fs.mkdir(backups,{recursive:true});await fs.writeFile(path.join(backups,`${Date.now()}-${randomUUID()}.json`),old);
        const temp=`${file}.${randomUUID()}.tmp`;try{await fs.writeFile(temp,JSON.stringify(all,null,2)+'\n');await fs.rename(temp,file);}finally{await fs.rm(temp,{force:true});}
        return {value:all[id]??{},revision:createHash('sha256').update(JSON.stringify(all[id]??{})).digest('hex')};
      };
      const result=queue.then(task);queue=result.catch(()=>{});const answer=await result;
      res.setHeader('Content-Type','application/json');res.end(JSON.stringify(answer));
    }catch(error){fail(400,error.message??'Không lưu được.');}
  });
}};}
