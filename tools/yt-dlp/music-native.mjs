const RELAY='https://pocket-toolbox-media.pages.dev/music/fetch';
const domains=['music.163.com','music.126.net','y.qq.com','music.qq.com','qqmusic.qq.com','ptlogin2.qq.com','graph.qq.com','open.weixin.qq.com','y.gtimg.cn','kugou.com','kugou.cn','kuwo.cn','kuwo.com','migu.cn','migu.com','bilibili.com','biliapi.net','biliapi.com','bilivideo.com','bilivideo.cn','hdslb.com','b23.tv','joox.com','91q.com','dmhmusic.com','jamendo.com','jamendo.net','music.apple.com','itunes.apple.com','applemarketingtools.com','marketingtools.apple.com','mzstatic.com','spotify.com','scdn.co','spotifycdn.com','kworb.net','lrclib.net','qishui.com','music.douyin.com','qishui.douyin.com','beta-luna.douyin.com','douyinpic.com','lf3-static.bytednsdoc.com'];
export const isMusicHost=value=>{try{const u=new URL(value);return /^https?:$/.test(u.protocol)&&!u.username&&!u.password&&!u.port&&domains.some(d=>u.hostname===d||u.hostname.endsWith('.'+d));}catch{return false;}};
let worker,sequence=0;const pending=new Map();
const emit=detail=>globalThis.dispatchEvent(new CustomEvent('music-engine-status',{detail}));
function dispose(error){worker?.terminate();worker=null;for(const p of pending.values()){p.cleanup();p.reject(error);}pending.clear();emit({type:'error',error:error.message});}
export function nativeCall(request,{signal,timeout=65000}={}){
 signal?.throwIfAborted();
 if(!worker){
  worker=new Worker(new URL('./runtime/music/engine-worker.js?v=20261123f',import.meta.url));
  worker.onerror=event=>{event.preventDefault();dispose(Error('音乐引擎运行中断，请重试'));};
  worker.onmessage=({data})=>{
   if(data.type==='fatal'){dispose(Error(data.error));return;}
   if(!data.id){emit(data);return;}
   const call=pending.get(data.id);if(!call)return;pending.delete(data.id);call.cleanup();
   if(data.error)call.reject(Error(data.error));else call.resolve(data.result);
  };
 }
 return new Promise((resolve,reject)=>{
  const id=++sequence;
  const cancel=()=>{pending.delete(id);cleanup();reject(signal?.reason||new DOMException('操作已取消','AbortError'));};
  const timer=setTimeout(()=>{pending.delete(id);cleanup();reject(new DOMException('音乐接口连接超时','TimeoutError'));},timeout);
  const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);};
  pending.set(id,{resolve,reject,cleanup});signal?.addEventListener('abort',cancel,{once:true});
  worker.postMessage({id,request});
 });
}
export async function nativeMediaFetch(url,init={}){
 let target=new URL(url);let headers=new Headers(init.headers);let method=init.method||'GET';let body=init.body;
 for(let hop=0;hop<6;hop++){
  init.signal?.throwIfAborted();
  if(!isMusicHost(target.href))throw Error('音乐来源地址不受支持');
  const response=await fetch(RELAY,{...init,method:'POST',body:method==='POST'?body:undefined,credentials:'omit',referrerPolicy:'no-referrer',headers:{'X-Media-URL':target.href,'X-Media-Method':method,'X-Media-Headers':JSON.stringify(Object.fromEntries(headers))}});
  if(!response.ok)throw Error(decodeURIComponent(response.headers.get('X-Media-Error')||`音乐接口 HTTP ${response.status}`));
  const status=Number(response.headers.get('X-Music-Status'))||200,metadata=JSON.parse(decodeURIComponent(response.headers.get('X-Music-Headers')||'%7B%7D'));
  const output=new Headers();for(const [key,values]of Object.entries(metadata))if(!/^(set-cookie|content-encoding|content-length)$/i.test(key))output.set(key,values.join(', '));
  if([301,302,303,307,308].includes(status)){
   await response.body?.cancel();const location=output.get('Location');if(!location)throw Error('音乐重定向地址缺失');
   target=new URL(location,target);headers.delete('Cookie');headers.delete('Authorization');
   if(status===303&&method!=='HEAD'||[301,302].includes(status)&&method==='POST'){method='GET';body=undefined;headers.delete('Content-Type');}continue;
  }
  const result=new Response(method==='HEAD'||[204,205,304].includes(status)?null:response.body,{status,headers:output});
  Object.defineProperty(result,'url',{value:target.href});return result;
 }
 throw Error('音乐重定向次数过多');
}
export function nativeSong(track){return track.nativeSong||{id:track.id,name:track.title,artist:track.artist,album:track.album,source:track.source==='5sing'?'fivesing':track.source,duration:track.duration||0,url:track.streamUrl||'',ext:track.ext||'',cover:track.cover||'',extra:track.extra||{}};}
