import toolIds from './tool-ids.json';
import {comments} from './comments.js';
const allowedIds=new Set(toolIds),json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json;charset=utf-8','X-Content-Type-Options':'nosniff',...extra}});
function cors(request,env){const origin=request.headers.get('Origin');if(!origin)return{};if(!(env.ALLOWED_ORIGINS||'').split(',').includes(origin))return null;return{'Access-Control-Allow-Origin':origin,'Vary':'Origin'};}
async function snapshot(env){const{results}=await env.DB.prepare('SELECT tool,count FROM counts').all();const counts=Object.fromEntries(toolIds.map(id=>[id,0]));for(const row of results)if(allowedIds.has(row.tool))counts[row.tool]=row.count;return{schema:1,updatedAt:new Date().toISOString(),counts};}
export default{
 async fetch(request,env){const headers=cors(request,env);if(headers===null)return json({error:'origin'},403);const url=new URL(request.url),path=url.pathname;
  try{
   if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'}});
   if(path==='/comments'||path==='/comments-export')return await comments(request,env,url,json,headers);
   if(request.method==='GET'&&path==='/counts')return json(await snapshot(env),200,{...headers,'Cache-Control':'public,max-age=15'});
   if(request.method==='GET'&&path==='/snapshot'){if(!env.SNAPSHOT_TOKEN||request.headers.get('Authorization')!=='Bearer '+env.SNAPSHOT_TOKEN)return json({error:'unauthorized'},401);return json(await snapshot(env),200,{'Cache-Control':'no-store'});}
   if(request.method!=='POST'||path!=='/events')return json({error:'not_found'},404,headers);
   if(!request.headers.get('Origin'))return json({error:'origin_required'},403,headers);
   if(Number(request.headers.get('Content-Length')||0)>256)return json({error:'size'},413,headers);
   const reader=request.body?.getReader();if(!reader)return json({error:'body'},400,headers);let length=0,chunks=[];while(true){const{value,done}=await reader.read();if(done)break;length+=value.length;if(length>256){await reader.cancel();return json({error:'size'},413,headers);}chunks.push(value);}let bytes=new Uint8Array(length),offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   let event;try{event=JSON.parse(new TextDecoder().decode(bytes));}catch{return json({error:'json'},400,headers);}
   if(!allowedIds.has(event?.tool)||typeof event.id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(event.id))return json({error:'event'},400,headers);
   if(!env.RATE_SALT)return json({error:'unconfigured'},503,headers);
   const now=Math.floor(Date.now()/1000),minute=Math.floor(now/60),address=request.headers.get('CF-Connecting-IP')||'local',hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.RATE_SALT+':'+minute+':'+address)),key=Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');
   const result=await env.DB.batch([
    env.DB.prepare('INSERT INTO limits(key,hits,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1').bind(key,now+120),
    env.DB.prepare('INSERT OR IGNORE INTO events(id,tool,created) SELECT ?,?,? WHERE (SELECT hits FROM limits WHERE key=?)<=60').bind(event.id,event.tool,now,key),
    env.DB.prepare('INSERT INTO counts(tool,count) SELECT ?,1 WHERE changes()=1 ON CONFLICT(tool) DO UPDATE SET count=count+1').bind(event.tool),
    env.DB.prepare('SELECT tool FROM events WHERE id=?').bind(event.id),
    env.DB.prepare('SELECT count FROM counts WHERE tool=?').bind(event.tool)
   ]);
   const accepted=result[3].results[0]?.tool===event.tool;if(!accepted)return json({error:'rate_limit'},429,{...headers,'Retry-After':'60','Cache-Control':'no-store'});
   return json({accepted:true,count:result[4].results[0]?.count||0},200,{...headers,'Cache-Control':'no-store'});
  }catch{return json({error:'temporarily_unavailable'},503,headers);}
 },
 async scheduled(controller,env,ctx){ctx.waitUntil(env.DB.batch([env.DB.prepare('DELETE FROM events WHERE created<?').bind(Math.floor(Date.now()/1000)-8*86400),env.DB.prepare('DELETE FROM limits WHERE expires<?').bind(Math.floor(Date.now()/1000))]));}
};
