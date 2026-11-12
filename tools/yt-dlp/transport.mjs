export const RELAY='https://pocket-toolbox-media.pages.dev/fetch';
const domains=['bilibili.com','biliapi.net','biliapi.com','bilivideo.com','bilivideo.cn','hdslb.com','b23.tv'];
const forbidden=/^(cookie|host|origin|accept-encoding|connection|content-length|sec-.*|proxy-.*)$/i;
export function supportedHost(host){return domains.some(d=>host===d||host.endsWith('.'+d));}
export function requestPlan(url,init={},network={}){
 const source=new URL(url);if(!['http:','https:'].includes(source.protocol)||source.username||source.password)throw Error('媒体链接无效');
 const headers=Object.fromEntries([...new Headers(init.headers)].filter(([key])=>!forbidden.test(key)));
 const relay=network.mode!=='direct'&&supportedHost(source.hostname);
 if(network.mode==='relay'&&!relay)throw Error('跨域转发暂仅支持哔哩哔哩相关站点');
 if(relay)return {url:RELAY,init:{...init,method:'POST',headers:{'X-Media-URL':source.href,'X-Media-Method':init.method||'GET','X-Media-Headers':JSON.stringify(headers)},credentials:'omit',referrerPolicy:'no-referrer'}};
 delete headers.referer;delete headers['user-agent'];
 return{url:source.href,init:{...init,headers,credentials:'omit',referrerPolicy:'no-referrer'}};
}
export async function mediaFetch(url,init={},network={},fetcher=globalThis.fetch){
 init.signal?.throwIfAborted();const plan=requestPlan(url,init,network);
 const response=await fetcher(plan.url,plan.init);
 if(plan.url===RELAY){
  const failure=response.headers.get('X-Media-Error');if(failure){await response.body?.cancel();throw Error(decodeURIComponent(failure));}
  Object.defineProperty(response,'url',{value:response.headers.get('X-Media-URL')||String(url),configurable:true});
 }
 return response;
}
export function friendlyError(value){
 const text=String(value?.message||value);
 if(/跨域|Failed to fetch|Load failed|NetworkError/.test(text))return '无法连接媒体站点，请检查网络；哔哩哔哩请使用「自动」或「跨域转发」。';
 if(/HTTP Error 412|HTTP 412|HTTP Error 403|HTTP 403/.test(text))return '站点拒绝了访问，请稍后重试，或切换直连；转发无法解除站点风控和登录限制。';
 return text.replace(/^PythonError:\s*/,'');
}
