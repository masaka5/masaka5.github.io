export const MAX_CONTENT_BYTES=24*1024*1024;
export const MAX_TEXT_CHARS=200000;
export const TYPE_LABELS=Object.freeze({text:'文本',password:'密码',otp:'验证码',link:'链接',code:'代码',image:'图片'});
const TYPES=new Set(Object.keys(TYPE_LABELS)),SECRET=/^[A-Za-z0-9_-]{43}$/;
const encoder=new TextEncoder(),decoder=new TextDecoder();
export const bytesToB64u=bytes=>{let value='';for(const byte of new Uint8Array(bytes))value+=String.fromCharCode(byte);return btoa(value).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');};
export const b64uToBytes=value=>{if(typeof value!=='string'||!/^[A-Za-z0-9_-]+$/.test(value))throw Error('密钥格式无效');const padded=value.replaceAll('-','+').replaceAll('_','/')+'='.repeat((4-value.length%4)%4),raw=atob(padded);return Uint8Array.from(raw,char=>char.charCodeAt(0));};
export function randomSecret(){return bytesToB64u(crypto.getRandomValues(new Uint8Array(32)));}
export function validSecret(value){return typeof value==='string'&&SECRET.test(value);}
export function validType(value){return TYPES.has(value);}
export function detectType(value){
 const raw=String(value??'').replace(/\r\n?/g,'\n').trim();
 if(!raw)return 'text';
 if(/^(?:https?:\/\/|mailto:)[^\s]+$/i.test(raw)||/^www\.[^\s]+$/i.test(raw))return 'link';
 const compact=raw.replace(/[\s-]/g,'');
 if(/^\d{4,10}$/.test(compact)||(/^[A-Z0-9]{6,10}$/.test(compact)&&/\d/.test(compact)))return 'otp';
 if((raw.startsWith('{')&&raw.endsWith('}'))||(raw.startsWith('[')&&raw.endsWith(']'))){try{JSON.parse(raw);return 'code';}catch{}}
 const codePattern=/(?:^|\n)\s*(?:#!|#include\b|package\s+|import\s+|export\s+|const\s+|let\s+|var\s+|function\s+|class\s+|def\s+|from\s+|if\s*\(|for\s*\(|while\s*\(|switch\s*\(|SELECT\s+|INSERT\s+|UPDATE\s+|DELETE\s+|git\s+|docker\s+|kubectl\s+|curl\s+|Get-[A-Za-z]+|Set-[A-Za-z]+|New-[A-Za-z]+|Remove-[A-Za-z]+)/i;
 if(codePattern.test(raw)||/=>|<\/?[A-Za-z][^>]*>|\bconsole\.|\bprint\s*\(|\breturn\s+[^;\n]+;|;\s*(?:\n|$)/.test(raw))return 'code';
 if(!/\s/.test(raw)&&!/[\u3400-\u9fff]/.test(raw)&&raw.length>=4&&raw.length<=256)return 'password';
 return 'text';
}
export function shareURL(secret,via='mqtt'){if(!validSecret(secret))throw Error('分享密钥无效');const url=new URL(location.href);url.search='';url.hash=new URLSearchParams({s:secret,v:via==='nostr'?'nostr':'mqtt'}).toString();return url.href;}
export function parseShareURL(value=location.href){const url=new URL(value,location.href);if(url.origin!==location.origin||url.pathname.replace(/\/index\.html$/,'')!==location.pathname.replace(/\/index\.html$/,''))throw Error('不是本工具的阅焚链接');const params=new URLSearchParams(url.hash.slice(1)),secret=params.get('s');if(!validSecret(secret))throw Error('阅焚链接无效或已失效');return{secret,via:params.get('v')==='nostr'?'nostr':'mqtt',url};}
export async function digestHex(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),value=>value.toString(16).padStart(2,'0')).join('');}
export async function tokenForSecret(secret){return digestHex(encoder.encode('burn-content-v1:'+secret));}
async function aesKey(secret){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode('burn-aes-gcm-v1:'+secret)));const key=await crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['encrypt','decrypt']);bytes.fill(0);return key;}
export async function encryptBytes(secret,type,bytes){if(!validSecret(secret)||!validType(type))throw Error('加密参数无效');const input=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);if(!input.byteLength||input.byteLength>MAX_CONTENT_BYTES)throw Error('内容为空或超过 24 MB');const iv=crypto.getRandomValues(new Uint8Array(12)),key=await aesKey(secret),additionalData=encoder.encode('burn:'+type),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData},key,input));return{iv:bytesToB64u(iv),cipher,hash:await digestHex(cipher)};}
export async function decryptBytes(secret,type,iv,cipher){if(!validSecret(secret)||!validType(type)||typeof iv!=='string'||! /^[A-Za-z0-9_-]{16}$/.test(iv)||!(cipher instanceof Uint8Array))throw Error('加密内容无效');const key=await aesKey(secret);try{return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:b64uToBytes(iv),additionalData:encoder.encode('burn:'+type)},key,cipher));}catch{throw Error('内容校验失败或已被修改');}}
export function textBytes(value){const text=String(value??'').replace(/\r\n?/g,'\n');if(!text.trim())throw Error('请输入内容');if(text.length>MAX_TEXT_CHARS)throw Error('文本不能超过 200000 个字符');return encoder.encode(text);}
export function payloadText(bytes){return decoder.decode(bytes);}
export function safeMime(value){return typeof value==='string'&&/^image\/(png|jpeg|webp|gif|bmp|avif)$/i.test(value)?value.toLowerCase():'image/png';}
export function safeLabel(value){return String(value||'').replace(/[\x00-\x1f\x7f]/g,'').trim().slice(0,80);}
export function zero(bytes){if(bytes instanceof Uint8Array)bytes.fill(0);}
