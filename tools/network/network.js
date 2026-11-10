(() => {
  const $=id=>document.getElementById(id),MiB=1024*1024;
  const presets=[
    ['中国电信','cloud','https://www.189.cn/favicon.ico'],['中国移动','cloud','https://www.10086.cn/favicon.ico'],['中国联通','cloud','https://www.10010.com/favicon.ico'],['阿里云','cloud','https://www.aliyun.com/favicon.ico'],['腾讯云','cloud','https://cloud.tencent.com/favicon.ico'],['华为云','cloud','https://www.huaweicloud.com/favicon.ico'],
    ['WeGame','games','https://www.wegame.com.cn/favicon.ico'],
    ['Steam 商店','games','https://store.steampowered.com/favicon.ico'],['Steam 社区','games','https://steamcommunity.com/favicon.ico'],
    ['Epic Games','games','https://store.epicgames.com/favicon.ico'],['战网','games','https://www.battle.net/favicon.ico'],
    ['EA','games','https://www.ea.com/favicon.ico'],['Ubisoft Connect','games','https://www.ubisoft.com/favicon.ico'],['Xbox','games','https://www.xbox.com/favicon.ico'],
    ['腾讯游戏','games','https://game.qq.com/favicon.ico'],['网易游戏','games','https://game.163.com/favicon.ico'],['米哈游','games','https://www.mihoyo.com/favicon.ico'],['完美世界','games','https://www.wanmei.com/favicon.ico'],['西山居','games','https://www.xishanju.com/favicon.ico'],
    ['百度','internet','https://www.baidu.com/favicon.ico'],['淘宝','internet','https://www.taobao.com/favicon.ico'],['京东','internet','https://www.jd.com/favicon.ico'],['哔哩哔哩','internet','https://www.bilibili.com/favicon.ico'],['抖音','internet','https://www.douyin.com/favicon.ico'],['美团','internet','https://www.meituan.com/favicon.ico']
  ];
  const targets=presets.map(([name,group,url])=>({name,group,url,samples:[],status:'待检测',median:null}));
  let speedController=null,latencyController=null,speedRun=0,latencyRun=0,targetPage=0;
  const filtered=()=>targets.filter(target=>$('targetGroup').value==='all'||target.group===$('targetGroup').value);
  function source(){const id=$('speedSource').value;if(id==='librespeed'){$('downloadUrl').value='LibreSpeed 自动选择测速节点';$('downloadUrl').readOnly=true;$('uploadUrl').value='LibreSpeed 自动测速';$('uploadUrl').readOnly=true;$('uploadField').hidden=false;return;}$('downloadUrl').value=id==='npm'?'https://registry.npmmirror.com/typescript/-/typescript-5.7.3.tgz':id==='cloudflare'?'https://speed.cloudflare.com/__down?bytes=25000000':'';$('downloadUrl').readOnly=id!=='custom';$('uploadUrl').value=id==='cloudflare'?'https://speed.cloudflare.com/__up':'';$('uploadUrl').readOnly=id!=='custom';$('uploadField').hidden=id==='npm';}
  function speedBusy(busy){for(const id of ['speedSource','downloadUrl','uploadUrl','speedSamples','startSpeed'])$(id).disabled=busy;$('stopSpeed').disabled=!busy;}
  function latencyBusy(busy){for(const id of ['targetGroup','probeSamples','customTarget','addTarget','startLatency'])$(id).disabled=busy;$('stopLatency').disabled=!busy;}
  function speedLine(text,error=false){const el=Ops.node('p','status',text);if(error)el.dataset.tone='error';$('speedLog').append(el);}
  $('speedSource').addEventListener('change',source);source();
  $('startSpeed').addEventListener('click',async()=>{
    if($('speedSource').value==='librespeed'){window.LibrespeedTest?.start();return;}
    let download,upload;try{download=NetworkCore.urlOf($('downloadUrl').value).href;upload=$('uploadUrl').value.trim()?NetworkCore.urlOf($('uploadUrl').value).href:null;}catch(error){Ops.status($('speedStatus'),error.message,true);return;}
    const run=++speedRun,controller=new AbortController();speedController=controller;speedBusy(true);Ops.result();
    $('downloadMetric').textContent=$('uploadMetric').textContent='—';$('speedProgress').value=0;$('speedLog').replaceChildren();Ops.status($('speedStatus'),'正在下载…');Ops.status($('speedResultStatus'),'');
    let bytes=0,ms=0,uploaded=0,uploadMs=0,failed=false;const count=Number($('speedSamples').value),total=count*(upload?2:1);let completed=0;
    try{
      for(let index=0;index<count;index++){
        const result=await NetworkCore.download(download,{signal:controller.signal,onProgress:sample=>{if(run===speedRun)Ops.status($('speedResultStatus'),`本次已下载 ${(sample.bytes/MiB).toFixed(1)} MB`);}});
        if(run!==speedRun)return;bytes+=result.bytes;ms+=result.ms;$('downloadMetric').textContent=(bytes*8/ms/1000).toFixed(2);speedLine(`下载 ${index+1}：${result.mbps.toFixed(2)} Mbps · ${(result.bytes/MiB).toFixed(1)} MB`);$('speedProgress').value=++completed/total*100;
      }
      if(upload){
        Ops.status($('speedStatus'),'正在上传…');
        for(let index=0;index<count;index++){
          const result=await NetworkCore.upload(upload,{signal:controller.signal});if(run!==speedRun)return;
          uploaded+=result.bytes;uploadMs+=result.ms;$('uploadMetric').textContent=(uploaded*8/uploadMs/1000).toFixed(2);speedLine(`上传 ${index+1}：${result.mbps.toFixed(2)} Mbps`);$('speedProgress').value=++completed/total*100;
        }
      }
      if(run===speedRun){Ops.status($('speedStatus'),'测速完成');Ops.status($('speedResultStatus'),`下载 ${(bytes/MiB).toFixed(1)} MB${upload?` · 上传 ${(uploaded/MiB).toFixed(1)} MB`:' · 此节点不支持上传测速'}`);}
    }catch(error){if(run===speedRun){failed=true;const message=error.name==='AbortError'?'已停止，显示已完成的采样':`测速失败：${error.message}。可更换节点或使用支持跨域的自定义地址。`;Ops.status($('speedStatus'),message,error.name!=='AbortError');Ops.status($('speedResultStatus'),message,error.name!=='AbortError');speedLine(message,error.name!=='AbortError');}}
    finally{if(run===speedRun){speedBusy(false);speedController=null;if(!failed)$('speedProgress').value=100;}}
  });
  $('stopSpeed').addEventListener('click',()=>{$('speedSource').value==='librespeed'?window.LibrespeedTest?.stop():speedController?.abort();});
  function renderTargets(){
    const list=filtered(),size=Math.max(1,Math.floor(($('latencyTable').clientHeight-35)/46)),pages=Math.max(1,Math.ceil(list.length/size));targetPage=Math.max(0,Math.min(targetPage,pages-1));$('latencyRows').replaceChildren();
    for(const target of list.slice(targetPage*size,(targetPage+1)*size)){
      const row=Ops.node('tr');row.title=target.url;
      const valid=target.samples.filter(sample=>sample.ok),delay=Ops.node('td','mono',target.median===null?'—':target.median.toFixed(1)+' ms');
      if(valid.length)delay.title=`最短 ${Math.min(...valid.map(v=>v.ms)).toFixed(1)} ms · 最长 ${Math.max(...valid.map(v=>v.ms)).toFixed(1)} ms`;
      const state=Ops.node('td','',target.status);state.dataset.state=target.status==='未响应'?'error':target.status==='已响应'?'ok':'';
      row.append(Ops.node('td','',target.name),delay,Ops.node('td','mono',target.samples.length?`${valid.length} / ${target.samples.length}`:'—'),state);$('latencyRows').append(row);
    }
    $('latencyCount').textContent=list.length+' 个目标';$('targetPage').textContent=`${targetPage+1} / ${pages}`;$('previousTargets').disabled=targetPage===0;$('nextTargets').disabled=targetPage===pages-1;$('latencyPager').dataset.single=String(pages===1);
  }
  $('targetGroup').addEventListener('change',()=>{targetPage=0;renderTargets();});$('previousTargets').addEventListener('click',()=>{targetPage--;renderTargets();});$('nextTargets').addEventListener('click',()=>{targetPage++;renderTargets();});new ResizeObserver(renderTargets).observe($('latencyTable'));
  $('addTarget').addEventListener('click',()=>{
    try{const url=NetworkCore.urlOf($('customTarget').value);if(url.protocol!=='https:')throw new Error('请输入 HTTPS 地址');if(targets.some(target=>target.url===url.href))throw new Error('目标已存在');targets.push({name:url.hostname,group:'custom',url:url.href,samples:[],status:'待检测',median:null});$('targetGroup').value='all';$('customTarget').value='';Ops.status($('latencyStatus'),'已添加 '+url.hostname);renderTargets();}catch(error){Ops.status($('latencyStatus'),error.message,true);}
  });
  $('startLatency').addEventListener('click',async()=>{
    const run=++latencyRun,controller=new AbortController();latencyController=controller;latencyBusy(true);Ops.result();
    const list=filtered(),count=Number($('probeSamples').value);let index=0,completed=0;
    for(const target of list){target.samples=[];target.median=null;target.status='等待中';}renderTargets();
    async function worker(){
      while(index<list.length&&!controller.signal.aborted){const target=list[index++];target.status='检测中';renderTargets();
        try{
          const result=await NetworkCore.latency(target.url,{signal:controller.signal,count,timeout:4000,onSample:samples=>{if(run===latencyRun){target.samples=samples;renderTargets();}}});
          if(run!==latencyRun)return;target.samples=result.samples;target.median=result.median;target.status=result.success?'已响应':'未响应';
        }catch(error){if(run!==latencyRun)return;target.status=error.name==='AbortError'?'已停止':'检测失败';}
        if(run===latencyRun){completed++;Ops.status($('latencyStatus'),`${completed} / ${list.length} 个目标完成`);renderTargets();}
      }
    }
    try{await Promise.all(Array.from({length:Math.min(3,list.length)},worker));}
    finally{if(run===latencyRun){for(const target of list)if(target.status==='等待中')target.status='已停止';latencyController=null;latencyBusy(false);Ops.status($('latencyStatus'),controller.signal.aborted?'已停止':'检测完成');renderTargets();}}
  });
  $('stopLatency').addEventListener('click',()=>latencyController?.abort());
  $('exportLatency').addEventListener('click',()=>Ops.save(Ops.csv([['目标','地址','HTTPS 中位耗时(ms)','已响应请求','已发起请求','状态'],...filtered().map(t=>[t.name,t.url,t.median===null?'':t.median.toFixed(2),t.samples.filter(s=>s.ok).length,t.samples.length,t.status])]),'https-latency.csv','text/csv;charset=utf-8'));
  document.querySelectorAll('[data-network-view]').forEach(button=>button.addEventListener('click',()=>{const view=button.dataset.networkView;document.querySelectorAll('[data-network-view]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));$('speedView').hidden=view!=='speed';$('latencyView').hidden=view!=='latency';Ops.show('input');renderTargets();}));
  renderTargets();window.addEventListener('pagehide',()=>{speedController?.abort();latencyController?.abort();});
  window.NetworkSpeedUI={busy:speedBusy,line:speedLine,status:(message,error=false)=>Ops.status($('speedStatus'),message,error),result:(message,error=false)=>Ops.status($('speedResultStatus'),message,error),metric:(id,value)=>$(id).textContent=value,progress:value=>$('speedProgress').value=value};
})();
