export const MAX_MESSAGE=2000;
const ID=/^[A-Za-z0-9_-]{22}$/;
export function randomID(bytes=16){const b=crypto.getRandomValues(new Uint8Array(bytes));return btoa(String.fromCharCode(...b)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
export function createInvite(){return {room:randomID(),key:randomID(24),via:'mqtt'};}
export function checkedInvite(value){if(!value||!ID.test(value.room)||!/^[A-Za-z0-9_-]{32}$/.test(value.key)||!['mqtt','nostr'].includes(value.via))throw Error('邀请链接或房间码无效');return {room:value.room,key:value.key,via:value.via};}
export function parseInvite(input){
 const value=String(input||'').trim();let parts;
 if(value.includes('://')){let url;try{url=new URL(value);}catch{throw Error('邀请链接无效');}if(!['https:','http:'].includes(url.protocol))throw Error('邀请链接无效');const p=new URLSearchParams(url.hash.slice(1));parts={room:p.get('room'),key:p.get('key'),via:p.get('via')};}
 else{const [room,key,via,...rest]=value.split('.');if(rest.length)throw Error('房间码无效');parts={room,key,via};}
 return checkedInvite(parts);
}
export function inviteCode(invite){const p=checkedInvite(invite);return [p.room,p.key,p.via].join('.');}
export function inviteURL(invite,base=location.href){const p=checkedInvite(invite),url=new URL(base);url.search='';url.hash=new URLSearchParams(p).toString();return url.href;}
export function cleanName(name){return String(name||'').replace(/[\x00-\x1f\x7f]/g,'').trim().slice(0,24)||'访客';}
export function validChat(m){return !!m&&ID.test(m.id)&&typeof m.text==='string'&&m.text.trim().length>0&&m.text.length<=MAX_MESSAGE&&Number.isSafeInteger(m.at)&&m.at>=0;}
export function validMedia(m){return !!m&&['mic','camera','screen'].includes(m.kind)&&ID.test(m.token);}
export function turnConfig(raw,username,credential){
 if(!String(raw).trim())return [];
 const urls=String(raw).split(',').map(s=>s.trim());
 if(urls.length>4||urls.some(u=>!/^turns?:(?:[a-zA-Z0-9.-]+|\[[a-fA-F0-9:]+\])(?::\d{1,5})?(?:\?transport=(?:tcp|udp))?$/.test(u)))throw Error('请输入有效的 TURN 地址');
 if(!username?.trim()||!credential)throw Error('请填写中继用户名和密码');
 return [{urls,username:username.trim(),credential}];
}
