/* IPv4 / IPv6 calculations use BigInt; ranges are never expanded into hosts. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NetCore=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  const fail=message=>{throw new Error(message);};
  function parse(raw){
    const text=String(raw).trim();
    if(!text.includes(':')){
      if(!/^(?:0|[1-9]\d{0,2})(?:\.(?:0|[1-9]\d{0,2})){3}$/.test(text))return fail('IPv4 地址格式不正确');
      const parts=text.split('.').map(Number);if(parts.some(n=>n>255))return fail('IPv4 地址段应在 0–255 之间');
      return {bits:32,value:parts.reduce((value,n)=>(value<<8n)|BigInt(n),0n)};
    }
    if(!/^[0-9a-f:.]+$/i.test(text)||text.includes(':::')||(text.match(/::/g)||[]).length>1)return fail('IPv6 地址格式不正确');
    let ip=text.toLowerCase();
    if(ip.includes('.')){
      const index=ip.lastIndexOf(':'),v4=parse(ip.slice(index+1));
      if(v4.bits!==32)return fail('IPv6 内嵌 IPv4 不正确');
      ip=ip.slice(0,index+1)+(v4.value>>16n).toString(16)+':'+(v4.value&65535n).toString(16);
    }
    const halves=ip.split('::'),left=halves[0]?halves[0].split(':'):[],right=halves.length===2&&halves[1]?halves[1].split(':'):[];
    if([...left,...right].some(part=>!/^[0-9a-f]{1,4}$/.test(part)))return fail('IPv6 地址段不正确');
    const missing=8-left.length-right.length;
    if((halves.length===1&&missing!==0)||(halves.length===2&&missing<1))return fail('IPv6 地址段数量不正确');
    const parts=halves.length===2?[...left,...Array(missing).fill('0'),...right]:left;
    return {bits:128,value:parts.reduce((value,part)=>(value<<16n)|BigInt('0x'+part),0n)};
  }
  function format(value,bits){
    if(bits===32)return [24n,16n,8n,0n].map(shift=>String((value>>shift)&255n)).join('.');
    const parts=Array.from({length:8},(_,i)=>((value>>BigInt((7-i)*16))&65535n).toString(16));
    let best=-1,length=0;
    for(let i=0;i<8;){if(parts[i]!=='0'){i++;continue;}let end=i;while(end<8&&parts[end]==='0')end++;if(end-i>length){best=i;length=end-i;}i=end;}
    if(length<2)return parts.join(':');
    return parts.slice(0,best).join(':')+'::'+parts.slice(best+length).join(':');
  }
  function prefixOf(raw,bits){
    if(bits===32&&raw.includes('.')){
      const mask=parse(raw).value,inverse=((1n<<32n)-1n)^mask;
      if((inverse&(inverse+1n))!==0n)return fail('子网掩码必须由连续的 1 组成');
      return mask.toString(2).replace(/0/g,'').length;
    }
    if(!/^\d{1,3}$/.test(raw))return fail('前缀长度不正确');
    const prefix=Number(raw);if(prefix>bits)return fail(`前缀应在 0–${bits} 之间`);return prefix;
  }
  function network(raw){
    const parts=String(raw).trim().split('/');if(parts.length>2)return fail('网段格式不正确');
    const ip=parse(parts[0]),prefix=parts.length===2?prefixOf(parts[1],ip.bits):ip.bits;
    const size=1n<<BigInt(ip.bits-prefix),start=(ip.value/size)*size;
    return {...ip,prefix,start,end:start+size-1n,size};
  }
  function subnet(raw){
    const n=network(raw),reserved=n.bits===32&&n.prefix<31,first=n.start+(reserved?1n:0n),last=n.end-(reserved?1n:0n);
    const all=(1n<<BigInt(n.bits))-1n,mask=all^(n.size-1n);
    return {version:n.bits===32?'IPv4':'IPv6',address:format(n.value,n.bits),prefix:n.prefix,cidr:format(n.start,n.bits)+'/'+n.prefix,
      mask:format(mask,n.bits),wildcard:n.bits===32?format(n.size-1n,32):'不适用',first:format(n.start,n.bits),last:format(n.end,n.bits),
      firstHost:format(first,n.bits),lastHost:format(last,n.bits),broadcast:n.bits===32?format(n.end,32):'IPv6 无广播地址',
      total:String(n.size),usable:String(n.size-(reserved?2n:0n))};
  }
  function rangeToCIDR(start,end,bits){
    const result=[];
    while(start<=end){
      let hostBits=0;while(hostBits<bits&&start%(1n<<BigInt(hostBits+1))===0n&&(1n<<BigInt(hostBits+1))<=end-start+1n)hostBits++;
      result.push(format(start,bits)+'/'+(bits-hostBits));start+=1n<<BigInt(hostBits);
    }
    return result;
  }
  function batch(text,mode='sort'){
    const lines=String(text).split(/\r?\n/),entries=[],errors=[];
    if(lines.length>20000)return fail('每次最多处理 20,000 行');
    lines.forEach((line,index)=>{
      const value=line.trim();if(!value)return;
      try{
        if(value.includes('-')){
          const pair=value.split('-');if(pair.length!==2)return fail('地址范围格式不正确');
          const a=parse(pair[0]),b=parse(pair[1]);if(a.bits!==b.bits||a.value>b.value)return fail('地址范围的协议或顺序不正确');
          entries.push({bits:a.bits,start:a.value,end:b.value,key:format(a.value,a.bits)+'-'+format(b.value,b.bits)});
        }else{
          const n=network(value);entries.push({...n,key:value.includes('/')?format(n.start,n.bits)+'/'+n.prefix:format(n.value,n.bits)});
        }
      }catch(error){if(errors.length<5)errors.push(`第 ${index+1} 行：${error.message}`);}
    });
    if(errors.length)return fail(errors.join('；'));
    entries.sort((a,b)=>a.bits-b.bits||(a.start<b.start?-1:a.start>b.start?1:a.end<b.end?-1:a.end>b.end?1:0));
    if(mode==='sort')return {input:entries.length,lines:[...new Set(entries.map(item=>item.key))]};
    const merged=[];
    for(const item of entries){const previous=merged[merged.length-1];if(previous&&previous.bits===item.bits&&item.start<=previous.end+1n){if(item.end>previous.end)previous.end=item.end;}else merged.push({bits:item.bits,start:item.start,end:item.end});}
    return {input:entries.length,lines:merged.flatMap(item=>rangeToCIDR(item.start,item.end,item.bits))};
  }
  function mac(raw){
    const value=String(raw).trim();
    if(!/^(?:[\da-f]{12}|(?:[\da-f]{2}:){5}[\da-f]{2}|(?:[\da-f]{2}-){5}[\da-f]{2}|(?:[\da-f]{4}\.){2}[\da-f]{4})$/i.test(value))return fail('请输入完整的 48 位 MAC 地址');
    const hex=value.replace(/[:-]|\./g,'').toUpperCase(),pairs=hex.match(/../g),first=parseInt(pairs[0],16);
    const eui=[(first^2).toString(16).padStart(2,'0'),...pairs.slice(1,3),'FF','FE',...pairs.slice(3)].join('');
    return {colon:pairs.join(':'),hyphen:pairs.join('-'),cisco:hex.match(/.{4}/g).join('.').toLowerCase(),plain:hex,
      binary:pairs.map(p=>parseInt(p,16).toString(2).padStart(8,'0')).join(' '),oui:pairs.slice(0,3).join(':'),
      multicast:!!(first&1),local:!!(first&2),broadcast:hex==='FFFFFFFFFFFF',
      eui64:eui.match(/.{4}/g).join(':').toLowerCase()};
  }
  return {parse,format,subnet,batch,mac};
});
