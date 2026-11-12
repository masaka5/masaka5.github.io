// Browser-facing HTTP options for the guest fetch bridge.
const APT_MIRRORS=new Set(['mirrors.sustech.edu.cn','mirrors.sdu.edu.cn']);
const FORBIDDEN=new Set(['host','user-agent','connection','accept-encoding','content-length','proxy-connection','transfer-encoding','origin','referer','cookie']);
export function browserRequest(address,request={},pageProtocol=globalThis.location?.protocol){
 const url=new URL(address),method=String(request.method||'GET').toUpperCase(),apt=APT_MIRRORS.has(url.hostname)&&url.pathname.startsWith('/ubuntu/');
 if(apt&&url.protocol==='http:'&&pageProtocol==='https:')url.protocol='https:';
 const headers={};for(const [key,value]of Object.entries(request.headers||{})){const name=key.toLowerCase();if(FORBIDDEN.has(name)||name.startsWith('sec-')||name.startsWith('proxy-'))continue;if(apt&&!['accept','accept-language','content-language','range'].includes(name))continue;if(name==='range'&&!/^bytes=\d+-\d*$/.test(value))continue;headers[name]=String(value);}
 return {url:url.href,options:{...request,method,headers,mode:'cors',credentials:'omit'}};
}
