/* Format-aware reversible metadata markers. No image recompression or ZIP rewriting. */
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true}),MAGIC='TBWM1:',PDFMARK='\n%TBWM1:';
const text=b=>new TextDecoder('latin1').decode(b),bytes=s=>encoder.encode(s),join=(...parts)=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;};
function b64(b){let s='';for(const v of b)s+=String.fromCharCode(v);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function unb64(s){if(!/^[\w-]+$/.test(s)||s.length>50000)throw Error('标记编码无效');return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
const hex=b=>[...new Uint8Array(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
async function hash(b){return hex(await crypto.subtle.digest('SHA-256',b));}
async function key(password,salt){const k=await crypto.subtle.importKey('raw',bytes(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:unb64(salt),iterations:150000,hash:'SHA-256'},k,{name:'HMAC',hash:'SHA-256',length:256},false,['sign']);}
async function signature(record,password){const b=bytes(JSON.stringify(record));return record.auth==='HMAC-SHA256'?hex(await crypto.subtle.sign('HMAC',await key(password,record.salt),b)):hash(b);}
function checkRecord(envelope){const r=envelope?.record;if(!r||r.version!==1||typeof r.text!=='string'||r.text.length>2000||typeof r.name!=='string'||!Number.isSafeInteger(r.size)||r.size<0||!/^[a-f0-9]{64}$/.test(r.sha256)||!['SHA256','HMAC-SHA256'].includes(r.auth)||!/^[a-f0-9]{64}$/.test(envelope.signature)||r.auth==='HMAC-SHA256'&&!/^[\w-]{22}$/.test(r.salt))throw Error('水印记录无效');return envelope;}
function decodeMarker(b){const s=decoder.decode(b);if(!s.startsWith(MAGIC))return null;return checkRecord(JSON.parse(decoder.decode(unb64(s.slice(MAGIC.length)))));}
function marker(envelope){return bytes(MAGIC+b64(bytes(JSON.stringify(envelope))));}
function zipEnd(b){const v=new DataView(b.buffer,b.byteOffset,b.byteLength);for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(v.getUint32(i,true)===0x06054b50&&i+22+v.getUint16(i+20,true)===b.length)return i;throw Error('ZIP 目录无效');}
function typeOf(b){if(b.length>=8&&b.slice(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i]))return 'png';if(b[0]===255&&b[1]===216)return 'jpeg';if(text(b.slice(0,5))==='%PDF-')return 'pdf';if(b[0]===80&&b[1]===75){zipEnd(b);return 'zip';}throw Error('此格式请使用独立校验文件');}
function pngChunks(b){const chunks=[];const v=new DataView(b.buffer,b.byteOffset,b.byteLength);let p=8;while(p+12<=b.length){const n=v.getUint32(p),end=p+n+12;if(end>b.length)throw Error('PNG 数据不完整');const kind=text(b.slice(p+4,p+8));chunks.push({start:p,end,kind,data:b.slice(p+8,p+8+n)});p=end;if(kind==='IEND'){if(p!==b.length)throw Error('PNG 存在附加数据，请使用独立校验');return chunks;}}throw Error('PNG 缺少结束块');}
function jpegChunks(b){const chunks=[];let p=2;while(p+4<=b.length){if(b[p]!==255)throw Error('JPEG 标记无效');const kind=b[p+1];if(kind===218||kind===217)return {chunks,insert:p};const n=(b[p+2]<<8)|b[p+3],end=p+2+n;if(n<2||end>b.length)throw Error('JPEG 数据不完整');chunks.push({start:p,end,kind,data:b.slice(p+4,end)});p=end;}throw Error('JPEG 缺少图像数据');}
function crc32(b){let c=0xffffffff;for(const v of b){c^=v;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function pngChunk(data){const body=join(bytes('stEg'),data),out=new Uint8Array(body.length+8),v=new DataView(out.buffer);v.setUint32(0,data.length);out.set(body,4);v.setUint32(out.length-4,crc32(body));return out;}
export function extract(b,name=''){
 const type=typeOf(b);let envelope=null,original=b;
 if(type==='png'||type==='jpeg'){
  const chunks=type==='png'?pngChunks(b):jpegChunks(b).chunks,remove=[];
  for(const c of chunks)if((type==='png'?c.kind==='stEg':c.kind===254)&&text(c.data.slice(0,MAGIC.length))===MAGIC){if(envelope)throw Error('检测到重复水印');envelope=decodeMarker(c.data);remove.push(c);}
  if(remove.length){const c=remove[0];original=join(b.slice(0,c.start),b.slice(c.end));}
 }else if(type==='pdf'){
  const tail=text(b.slice(Math.max(0,b.length-60000))),i=tail.lastIndexOf(PDFMARK);
  if(i>=0){const absolute=Math.max(0,b.length-60000)+i,lineEnd=tail.indexOf('\n',i+PDFMARK.length);if(lineEnd<0)throw Error('PDF 水印不完整');const encoded=tail.slice(i+PDFMARK.length,lineEnd).trim();envelope=checkRecord(JSON.parse(decoder.decode(unb64(encoded))));original=join(b.slice(0,absolute),b.slice(Math.max(0,b.length-60000)+lineEnd+1));}
 }else{
  const end=zipEnd(b),comment=b.slice(end+22),s=text(comment),i=s.lastIndexOf('\n'+MAGIC);
  if(i>=0){envelope=decodeMarker(comment.slice(i+1));original=b.slice(0,end+22+i);new DataView(original.buffer).setUint16(end+20,i,true);}
 }
 return {type,envelope,original};
}
export async function certificate(b,name,label,password=''){
 if(!label.trim()||label.length>2000)throw Error('水印内容为 1–2000 字');
 const record={version:1,id:crypto.randomUUID(),name:String(name).slice(0,255),size:b.length,created:new Date().toISOString(),text:label,sha256:await hash(b),auth:password?'HMAC-SHA256':'SHA256'};
 if(password)record.salt=b64(crypto.getRandomValues(new Uint8Array(16)));
 return {record,signature:await signature(record,password)};
}
export async function embed(input,name,label,password=''){
 const {type,original:b}=extract(input,name);
 if(type==='pdf'&&/\/ByteRange\s*\[/.test(text(b)))throw Error('数字签名 PDF 请使用独立校验文件');
 if(type==='zip'&&text(b).includes('_xmlsignatures/'))throw Error('数字签名文档请使用独立校验文件');
 const m=marker(await certificate(b,name,label,password));if(m.length>50000)throw Error('水印记录过长');
 if(type==='png'){const at=pngChunks(b).find(c=>c.kind==='IEND').start;return join(b.slice(0,at),pngChunk(m),b.slice(at));}
 if(type==='jpeg'){const at=jpegChunks(b).insert,n=m.length+2;return join(b.slice(0,at),new Uint8Array([255,254,n>>8,n&255]),m,b.slice(at));}
 if(type==='pdf'){const eof=text(b).lastIndexOf('%%EOF');if(eof<0)throw Error('PDF 缺少结束标记');return join(b.slice(0,eof),bytes(PDFMARK+b64(bytes(JSON.stringify(decodeMarker(m))))+'\n'),b.slice(eof));}
 const end=zipEnd(b),comment=join(b.slice(end+22),bytes('\n'),m);if(comment.length>65535)throw Error('ZIP 注释空间不足，请使用独立校验文件');const out=join(b.slice(0,end+22),comment);new DataView(out.buffer).setUint16(end+20,comment.length,true);return out;
}
export async function verifyCertificate(b,envelope,password=''){
 checkRecord(envelope);const {record}=envelope;
 return {record,contentValid:b.length===record.size&&await hash(b)===record.sha256,markerValid:record.auth==='HMAC-SHA256'&&!password?null:await signature(record,password)===envelope.signature,requiresPassword:record.auth==='HMAC-SHA256'&&!password};
}
export async function verify(b,name,password=''){const {original,envelope}=extract(b,name);if(!envelope)throw Error('未发现本工具写入的水印');return verifyCertificate(original,envelope,password);}
