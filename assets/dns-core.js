(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DNSCore=api;})(globalThis,()=>{
 const types={A:1,NS:2,CNAME:5,SOA:6,PTR:12,MX:15,TXT:16,AAAA:28,SRV:33,CAA:257,HTTPS:65};
 function typeName(value){if(typeof value==='string'&&types[value.toUpperCase()])return value.toUpperCase();const code=Number(value);return Object.keys(types).find(key=>types[key]===code)||String(value);}
 function responseMode(raw){const url=new URL(raw);if(url.protocol!=='https:')throw Error('DNS-over-HTTPS 地址必须使用 HTTPS');if(url.hostname==='doh.pub'&&url.pathname==='/dns-query')return 'json';if(['dns.alidns.com','dns.google'].includes(url.hostname)&&url.pathname==='/resolve')return 'json';return 'wire';}
 function domain(raw){let name=String(raw).trim().replace(/\.$/,'');if(!name||/[\s/:?#@]/.test(name))throw Error('请输入域名，不含协议或路径');try{name=new URL('https://'+name).hostname;}catch(_){throw Error('域名格式不正确');}const labels=name.split('.');if(name.length>253||labels.some(label=>!label||label.length>63||!/^[\w-]+$/.test(label)))throw Error('域名格式或长度不正确');return name.toLowerCase();}
 function query(raw,type='A',id=0){const name=domain(raw),code=types[type];if(!code)throw Error('记录类型不支持');const out=[id>>8,id&255,1,0,0,1,0,0,0,0,0,0];for(const label of name.split('.'))out.push(label.length,...new TextEncoder().encode(label));out.push(0,code>>8,code&255,0,1);return new Uint8Array(out);}
 function parse(input,id){const bytes=input instanceof Uint8Array?input:new Uint8Array(input),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const check=(offset,count)=>{if(offset<0||offset+count>bytes.length)throw Error('DNS 数据截断');};const u16=offset=>{check(offset,2);return view.getUint16(offset);};const u32=offset=>{check(offset,4);return view.getUint32(offset);};
  function name(offset){let end=null,labels=[],seen=new Set();while(true){check(offset,1);if(seen.has(offset)||seen.size>128)throw Error('DNS 名称压缩循环');seen.add(offset);const n=bytes[offset++];if(n===0)break;if((n&192)===192){check(offset,1);if(end===null)end=offset+1;offset=((n&63)<<8)|bytes[offset];continue;}if(n>63)throw Error('DNS 标签错误');check(offset,n);labels.push(new TextDecoder().decode(bytes.slice(offset,offset+n)));offset+=n;}return {value:labels.join('.'),end:end??offset};}
  check(0,12);if(id!==undefined&&u16(0)!==id)throw Error('DNS 响应标识不匹配');const flags=u16(2);if(!(flags&0x8000))throw Error('DNS 响应无效');if(flags&512)throw Error('DNS 响应被截断');let offset=12;const questions=[],answers=[],authority=[],additional=[];
  for(let i=0;i<u16(4);i++){const n=name(offset);offset=n.end;check(offset,4);questions.push({name:n.value,type:u16(offset)});offset+=4;}
  for(const [count,list] of [[u16(6),answers],[u16(8),authority],[u16(10),additional]])for(let i=0;i<count;i++){
   const n=name(offset);offset=n.end;check(offset,10);const type=u16(offset),ttl=u32(offset+4),length=u16(offset+8),start=offset+10,end=start+length;check(start,length);offset=end;let data;
   if(type===1&&length===4)data=[...bytes.slice(start,end)].join('.');
   else if(type===28&&length===16){const words=[];for(let j=start;j<end;j+=2)words.push(u16(j).toString(16));data=words.join(':');}
   else if([2,5,12].includes(type))data=name(start).value;
   else if(type===15){if(length<3)throw Error('DNS MX 数据截断');data=u16(start)+' '+name(start+2).value;}
   else if(type===16){const parts=[];let p=start;while(p<end){const len=bytes[p++];if(p+len>end)throw Error('DNS TXT 数据截断');parts.push(new TextDecoder().decode(bytes.slice(p,p+len)));p+=len;}data=parts.map(v=>JSON.stringify(v)).join(' ');}
   else if(type===6){const primary=name(start),mail=name(primary.end),p=mail.end;if(p+20>end)throw Error('DNS SOA 数据截断');data=[primary.value,mail.value,...[0,4,8,12,16].map(j=>u32(p+j))].join(' ');}
   else if(type===33){if(length<7)throw Error('DNS SRV 数据截断');data=[u16(start),u16(start+2),u16(start+4),name(start+6).value].join(' ');}
   else if(type===257&&length>=2){const len=bytes[start+1];if(start+2+len>end)throw Error('DNS CAA 数据截断');data=bytes[start]+' '+new TextDecoder().decode(bytes.slice(start+2,start+2+len))+' '+new TextDecoder().decode(bytes.slice(start+2+len,end));}
   else data=[...bytes.slice(start,end)].map(v=>v.toString(16).padStart(2,'0')).join(' ');
   list.push({name:n.value,type:Object.keys(types).find(key=>types[key]===type)||String(type),ttl,data});
  }
  return {status:flags&15,authenticated:!!(flags&32),questions,answers,authority,additional};
 }
 function ptr(ip){if(/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)){if(ip.split('.').some(n=>+n>255))throw Error('IP 格式错误');return ip.split('.').reverse().join('.')+'.in-addr.arpa';}let s=String(ip).toLowerCase();if(!/^[\da-f:]+$/.test(s)||!s.includes(':')||(s.match(/::/g)||[]).length>1)throw Error('IP 格式错误');const halves=s.split('::'),left=halves[0]?halves[0].split(':'):[],right=halves[1]?halves[1].split(':'):[];if([...left,...right].some(w=>!w||w.length>4)||left.length+right.length>8||(!s.includes('::')&&left.length!==8))throw Error('IP 格式错误');const words=s.includes('::')?[...left,...Array(8-left.length-right.length).fill('0'),...right]:left;return words.map(w=>w.padStart(4,'0')).join('').split('').reverse().join('.')+'.ip6.arpa';}
 return {types,typeName,responseMode,domain,query,parse,ptr};
});
