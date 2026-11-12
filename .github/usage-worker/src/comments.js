const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function validateComment(value){
 if(!value||typeof value.id!=='string'||!UUID.test(value.id)||typeof value.name!=='string'||typeof value.body!=='string'||value.website)return null;
 const name=value.name.trim(),body=value.body.replace(/\r\n?/g,'\n').trim();
 if(!name||Array.from(name).length>32||/[\x00-\x1f\x7f]/.test(name)||Array.from(body).length<2||Array.from(body).length>2000||/[\x00-\x08\x0b-\x1f\x7f]/.test(body))return null;
 return {id:value.id,name,body};
}
export function parseCommentPage(url){
 const before=Number(url.searchParams.get('before')??Number.MAX_SAFE_INTEGER),limit=Number(url.searchParams.get('limit')??20);
 return Number.isSafeInteger(before)&&before>0&&Number.isInteger(limit)&&limit>=1&&limit<=50?{before,limit}:null;
}
async function readBody(request){
 if(Number(request.headers.get('Content-Length')||0)>12288)throw Error('size');
 const reader=request.body?.getReader();if(!reader)throw Error('body');
 const chunks=[];let length=0;
 while(true){const{value,done}=await reader.read();if(done)break;length+=value.length;if(length>12288){await reader.cancel();throw Error('size');}chunks.push(value);}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
export async function comments(request,env,url,json,headers){
 if(url.pathname==='/comments-export'){
  if(request.method!=='GET')return json({error:'method'},405,headers);
  if(!env.SNAPSHOT_TOKEN||request.headers.get('Authorization')!=='Bearer '+env.SNAPSHOT_TOKEN)return json({error:'unauthorized'},401,headers);
  const after=Number(url.searchParams.get('after')||0);if(!Number.isSafeInteger(after)||after<0)return json({error:'cursor'},400,headers);
  const{results}=await env.DB.prepare('SELECT seq,id,name,body,created,hidden FROM comments WHERE seq>? ORDER BY seq ASC LIMIT 100').bind(after).all();
  return json({schema:1,comments:results,next:results.length===100?results.at(-1).seq:null},200,{...headers,'Cache-Control':'no-store'});
 }
 if(request.method==='GET'){
  const page=parseCommentPage(url);if(!page)return json({error:'page'},400,headers);
  const{results}=await env.DB.prepare('SELECT seq,id,name,body,created FROM comments WHERE hidden=0 AND seq<? ORDER BY seq DESC LIMIT ?').bind(page.before,page.limit+1).all();
  const more=results.length>page.limit,items=results.slice(0,page.limit);
  return json({schema:1,comments:items,next:more?items.at(-1).seq:null},200,{...headers,'Cache-Control':'no-store'});
 }
 if(request.method!=='POST')return json({error:'method'},405,headers);
 if(!request.headers.get('Origin'))return json({error:'origin_required'},403,headers);
 let input;try{input=await readBody(request);}catch(error){return json({error:error.message==='size'?'size':'body'},error.message==='size'?413:400,headers);}
 const value=validateComment(input);if(!value)return json({error:'comment'},400,headers);
 if(!env.RATE_SALT)return json({error:'unconfigured'},503,headers);
 const now=Math.floor(Date.now()/1000),bucket=Math.floor(now/600),address=request.headers.get('CF-Connecting-IP')||'local';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.RATE_SALT+':comments:'+bucket+':'+address));
 const key='comments:'+Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
 const result=await env.DB.batch([
  env.DB.prepare('INSERT INTO limits(key,hits,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1').bind(key,now+1200),
  env.DB.prepare('INSERT OR IGNORE INTO comments(id,name,body,created) SELECT ?,?,?,? WHERE (SELECT hits FROM limits WHERE key=?)<=3').bind(value.id,value.name,value.body,now,key),
  env.DB.prepare('SELECT seq,id,name,body,created,hidden FROM comments WHERE id=?').bind(value.id)
 ]);
 const saved=result[2].results[0];
 if(!saved)return json({error:'rate_limit'},429,{...headers,'Retry-After':String(600-now%600),'Cache-Control':'no-store'});
 if(saved.name!==value.name||saved.body!==value.body||saved.hidden)return json({error:'conflict'},409,headers);
 const{hidden,...comment}=saved;return json({accepted:true,comment},200,{...headers,'Cache-Control':'no-store'});
}
