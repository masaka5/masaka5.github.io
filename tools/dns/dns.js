(() => {
 const $=id=>document.getElementById(id),providers=[
  ['阿里公共 DNS','https://dns.alidns.com/resolve','223.5.5.5 / 223.6.6.6',true],
  ['腾讯 DNSPod','https://doh.pub/dns-query','119.29.29.29 / 119.28.28.28',false],
  ['360 安全 DNS','https://doh.360.cn/dns-query','101.226.4.6 / 218.30.118.6',false],
  ['Google','https://dns.google/dns-query','8.8.8.8 / 8.8.4.4',true],
  ['Cloudflare','https://cloudflare-dns.com/dns-query','1.1.1.1 / 1.0.0.1',true],
  ['Quad9','https://dns.quad9.net/dns-query','9.9.9.9 / 149.112.112.112',false],
  ['AdGuard','https://dns.adguard-dns.com/dns-query','94.140.14.14 / 94.140.15.15',false],
  ['OpenDNS','https://doh.opendns.com/dns-query','208.67.222.222 / 208.67.220.220',false],
  ['DNS.SB','https://doh.dns.sb/dns-query','185.222.222.222 / 45.11.45.11',false],
  ['Control D','https://freedns.controld.com/p0','76.76.2.0 / 76.76.10.0',false],
  ['Mullvad','https://dns.mullvad.net/dns-query','194.242.2.2',false],
  ['NextDNS 公共','https://dns.nextdns.io/dns-query','45.90.28.0 / 45.90.30.0',false]
 ];
 let controller=null,results=[],run=0;const status=(message,error=false)=>Ops.status($('dnsStatus'),message,error);
 for(const [index,p] of providers.entries()){const label=Ops.node('label','check'),input=document.createElement('input');input.type='checkbox';input.value=index;input.checked=p[3];label.append(input,document.createTextNode(p[0]));$('dnsProviders').append(label);}
 const references=[...providers.map(p=>[p[0],p[2]]),['114 DNS','114.114.114.114 / 114.114.115.115'],['百度 DNS','180.76.76.76'],['CNNIC SDNS','1.2.4.8 / 210.2.4.8'],['Verisign','64.6.64.6 / 64.6.65.6'],['CleanBrowsing','185.228.168.9 / 185.228.169.9']];
 for(const [name,ip] of references){const p=Ops.node('p','dns-answer');p.append(Ops.node('strong','',name+'：'),document.createTextNode(ip));$('dnsReferenceList').append(p);}
 $('dnsReference').onclick=()=>$('dnsReferenceDialog').showModal();$('closeDNSReference').onclick=()=>$('dnsReferenceDialog').close();
 $('selectDNS').onclick=()=>{const boxes=[...$('dnsProviders').querySelectorAll('input')],all=boxes.every(b=>b.checked);boxes.forEach(b=>b.checked=!all);$('selectDNS').textContent=all?'全选':'取消全选';};
 function busy(value){for(const id of ['dnsName','dnsType','customDNS','queryDNS','selectDNS'])$(id).disabled=value;$('dnsProviders').querySelectorAll('input').forEach(i=>i.disabled=value);$('stopDNS').disabled=!value;}
 function render(){
  $('dnsResults').replaceChildren();for(const result of results){const card=Ops.node('article','dns-card');card.append(Ops.node('h3','',result.name));
   if(result.error){card.append(Ops.node('p','status',result.error));card.lastChild.dataset.tone='error';}
   else if(!result.response)card.append(Ops.node('p','status',result.state||'等待查询…'));
   else{const response=result.response,rcodes={0:'NOERROR',1:'格式错误',2:'SERVFAIL',3:'NXDOMAIN（域名不存在）',4:'不支持',5:'拒绝查询'};card.append(Ops.node('p','dns-meta',`${result.ms.toFixed(0)} ms · ${rcodes[response.status]||'RCODE '+response.status}${response.authenticated?' · AD 标志已设置':''}`));
    if(!response.answers.length)card.append(Ops.node('p','inline-note','无回答记录'+(response.authority.length?'，下方为权威记录。':'')));
    for(const record of [...response.answers,...(!response.answers.length?response.authority:[])]){const row=Ops.node('p','dns-answer');row.append(Ops.node('span','',`${record.name} · ${record.type} · TTL ${record.ttl}\n`),document.createTextNode(record.data));row.style.whiteSpace='pre-wrap';card.append(row);}
   }$('dnsResults').append(card);
  }
 }
 function records(items,name){return (items||[]).map(r=>({name:r.name||name,type:DNSCore.typeName(r.type),ttl:r.TTL??r.ttl??0,data:String(r.data??r.value??'')}));}
 $('queryDNS').onclick=async()=>{
  let name,targets,id,packet;try{const type=$('dnsType').value,raw=$('dnsName').value.trim();name=type==='PTR'&&/^[\da-fA-F:.]+$/.test(raw)?DNSCore.ptr(raw):DNSCore.domain(raw);id=crypto.getRandomValues(new Uint16Array(1))[0];packet=DNSCore.query(name,type,id);targets=[...$('dnsProviders').querySelectorAll('input:checked')].map(i=>providers[+i.value]);const custom=$('customDNS').value.trim();if(custom){const url=new URL(custom);if(url.protocol!=='https:'||url.username||url.password||url.hash)throw Error('自定义 DoH 需为 HTTPS 地址');targets.push(['自定义',url.href]);}if(!targets.length)throw Error('请至少选择一个 DNS 服务');}catch(error){status(error.message,true);return;}
  controller=new AbortController();const signal=controller.signal,token=++run;busy(true);results=targets.map(p=>({name:p[0],url:p[1]}));$('exportDNS').disabled=true;render();let position=0,complete=0;status('正在查询 '+name+'…');
  const encoded=btoa(String.fromCharCode(...packet)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  async function worker(){while(position<results.length&&!signal.aborted){const result=results[position++];result.state='查询中…';render();const abort=new AbortController(),onAbort=()=>abort.abort();signal.addEventListener('abort',onAbort,{once:true});const timer=setTimeout(()=>abort.abort(),7000),start=performance.now();try{const url=new URL(result.url);
    if(DNSCore.responseMode(url.href)==='json'){
     url.searchParams.set('name',name);url.searchParams.set('type',$('dnsType').value);if(url.hostname==='dns.alidns.com')url.searchParams.set('short','0');
     const response=await fetch(url,{signal:abort.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',headers:{Accept:'application/dns-json, application/json'}});if(!response.ok)throw Error('HTTP '+response.status);
     const json=await response.json();result.response={status:json.Status??json.status??0,authenticated:!!(json.AD??json.ad),answers:records(json.Answer||json.answer,name),authority:records(json.Authority||json.authority,name),additional:records(json.Additional||json.additional,name)};result.ms=performance.now()-start;
    }else{
     url.searchParams.set('dns',encoded);const response=await fetch(url,{headers:{Accept:'application/dns-message'},signal:abort.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
     const bytes=await response.arrayBuffer();if(bytes.byteLength>65535)throw Error('DNS 响应过大');result.response=DNSCore.parse(bytes,id);const question=result.response.questions[0];if(!question||question.name.toLowerCase()!==name.toLowerCase()||question.type!==DNSCore.types[$('dnsType').value])throw Error('DNS 响应问题不匹配');result.ms=performance.now()-start;
    }
   }catch(error){result.error=signal.aborted?'已停止':error.name==='AbortError'?'请求超时':error instanceof TypeError?'连接失败或服务不允许跨域':error.message;}
   finally{clearTimeout(timer);signal.removeEventListener('abort',onAbort);if(token===run){complete++;render();status(`${complete} / ${results.length} 个节点完成`);}}
  }}
  try{await Promise.all(Array.from({length:Math.min(4,results.length)},worker));}finally{if(token===run){for(const result of results)if(!result.response&&!result.error)result.error='已停止';render();busy(false);controller=null;$('exportDNS').disabled=false;status(signal.aborted?'已停止':'查询完成');}}
 };
 $('stopDNS').onclick=()=>controller?.abort();$('exportDNS').onclick=()=>Ops.save(JSON.stringify({domain:$('dnsName').value,type:$('dnsType').value,time:new Date().toISOString(),results},null,2),'DNS-查询.json','application/json');window.addEventListener('pagehide',()=>controller?.abort());
})();
