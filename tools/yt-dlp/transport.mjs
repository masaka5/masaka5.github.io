export const RELAY='https://pocket-toolbox-media.pages.dev/fetch';
import {platformFor} from './platforms.mjs';
const forbidden=/^(cookie|host|origin|accept-encoding|connection|content-length|sec-.*|proxy-.*)$/i;
export function supportedHost(host){return!!platformFor(host);}
export function requestPlan(url,init={},network={}){
 const source=new URL(url);if(!['http:','https:'].includes(source.protocol)||source.username||source.password)throw Error('媒体链接无效');
 const headers=Object.fromEntries([...new Headers(init.headers)].filter(([key])=>!forbidden.test(key)));
 const relay=network.mode!=='direct'&&supportedHost(source.hostname);
 if(network.mode==='relay'&&!relay)throw Error('此域名暂未接入跨域转发，可切换自动或直连');
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
 if(/confirm.*not a bot|ログインして.*bot|Sign in|LOGIN_REQUIRED/i.test(text))return '站点要求登录或人机验证，当前云端出口无法读取此媒体；请稍后重试。';
 if(/HTTP(?: Error)? 401|Unauthorized|Authorization Required/i.test(text))return '站点认证失败，当前链接无法通过转发访问。';
 if(/Video unavailable|video is not available|not found|HTTP(?: Error)? 404/i.test(text))return '媒体已不可用或链接已失效，请检查原站链接。';
 if(/此加密协议不受支持|DRM/i.test(text))return '此媒体使用 DRM 或不受支持的加密方式，无法下载。';
 if(/HTTP(?: Error)? 429|Too Many Requests/i.test(text))return '站点请求频率受限，请稍后重试。';
 if(/impersonat.*(?:not available|none of these|no .*target)/is.test(text))return '此站点要求浏览器指纹校验，当前网页下载引擎无法完成。';
 if(/跨域|Failed to fetch|Load failed|NetworkError/.test(text))return '无法读取媒体站点，请使用「自动」或「跨域转发」；未接入的域名仍需允许浏览器跨域访问。';
 if(/HTTP Error 412|HTTP 412|HTTP Error 403|HTTP 403/.test(text))return '站点拒绝了访问，请稍后重试，或切换直连；转发无法解除站点风控和登录限制。';
 return text.replace(/^PythonError:\s*/,'');
}
