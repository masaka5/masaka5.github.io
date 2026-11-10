(() => {
 window.LIBRESPEED_WORKER_URL=new URL('../../vendor/librespeed/speedtest_worker.js',location.href).href;
 const servers=[
  ['东京 · A573','https://librespeed.a573.net/','backend/garbage.php','backend/empty.php','backend/empty.php','backend/getIP.php'],
  ['阿姆斯特丹 · Clouvider','https://ams.speedtest.clouvider.net/backend','garbage.php','empty.php','empty.php','getIP.php'],
  ['阿姆斯特丹 · Sharktech','https://amsspeed.sharktech.net','backend/garbage.php','backend/empty.php','backend/empty.php','backend/getIP.php'],
  ['赫尔辛基 · Hetzner','https://www.librespeed.fi/','backend/garbage.php','backend/empty.php','backend/empty.php','backend/getIP.php'],
  ['布拉格 · CESNET','https://speedtest.cesnet.cz','backend/garbage.php','backend/empty.php','backend/empty.php','backend/getIP.php']
 ].map(([name,server,dlURL,ulURL,pingURL,getIpURL])=>({name,server,dlURL,ulURL,pingURL,getIpURL}));
 let test=null,run=0,selected=null,failure='';
 function clear(){if(test?.getState()>=3)try{test.abort();}catch(_){}test=null;failure='';selected=null;run++;NetworkSpeedUI.busy(false);}
 function start(){
  if(test)return;
  if(typeof window.Speedtest!=='function'){NetworkSpeedUI.busy(false);NetworkSpeedUI.status('测速组件未加载，请重新发布完整工具包。',true);NetworkSpeedUI.result('请确认 vendor/librespeed 文件已随发布包上传。',true);return;}
  const current=++run,engine=new window.Speedtest();let settled=false;test=engine;selected=null;failure='';NetworkSpeedUI.busy(true);NetworkSpeedUI.progress(0);NetworkSpeedUI.metric('downloadMetric','—');NetworkSpeedUI.metric('uploadMetric','—');
  const workerFailure=()=>{if(current!==run||settled)return;settled=true;test=null;try{engine.worker?.terminate();}catch(_){}NetworkSpeedUI.busy(false);NetworkSpeedUI.status('LibreSpeed 工作线程未加载，请重新发布完整工具包。',true);NetworkSpeedUI.result('请确认测速 Worker 已包含在发布包中。',true);};
  document.getElementById('speedLog').replaceChildren();NetworkSpeedUI.status('正在筛选 LibreSpeed 节点…');NetworkSpeedUI.result('下载、延迟及上传按顺序测试');
  engine.setParameter('telemetry_level',0);engine.setParameter('time_dl_max',8);engine.setParameter('time_ul_max',8);engine.setParameter('time_auto',true);engine.setParameter('count_ping',6);engine.setParameter('getIp_ispInfo',false);engine.setParameter('garbagePhp_chunkSize',32);engine.setParameter('xhr_dlMultistream',4);engine.setParameter('xhr_ulMultistream',2);
  engine.onupdate=data=>{
   if(current!==run)return;
   const dl=Number(data.dlStatus),ul=Number(data.ulStatus),ping=Number(data.pingStatus);
   if(data.dlStatus!==''&&Number.isFinite(dl))NetworkSpeedUI.metric('downloadMetric',dl.toFixed(2));
   if(data.ulStatus!==''&&Number.isFinite(ul))NetworkSpeedUI.metric('uploadMetric',ul.toFixed(2));
   if(data.pingStatus!==''&&Number.isFinite(ping))NetworkSpeedUI.result(`延迟 ${ping.toFixed(1)} ms${data.jitterStatus?` · 抖动 ${data.jitterStatus} ms`:''}`);
   if(data.dlStatus==='Fail'){
    failure='下载失败：此节点未提供浏览器可读取的数据，请切换测速方式。';NetworkSpeedUI.metric('downloadMetric','失败');NetworkSpeedUI.status(failure,true);NetworkSpeedUI.result('所选节点无法完成下载测速。',true);engine.abort();return;
   }
   if(data.ulStatus==='Fail'){
    failure='上传失败：此节点未接受上传测速，请切换测速方式。';NetworkSpeedUI.metric('uploadMetric','失败');NetworkSpeedUI.status(failure,true);NetworkSpeedUI.result('下载结果保留；此节点无法完成上传测速。',true);engine.abort();return;
   }
   if(data.pingStatus==='Fail'){
    failure='延迟测试失败：所选节点未返回有效响应。';NetworkSpeedUI.status(failure,true);NetworkSpeedUI.result(failure,true);engine.abort();return;
   }
   const progress={0:2,1:Math.max(8,12+(data.dlProgress||0)*42),2:Math.max(56,58+(data.pingProgress||0)*12),3:Math.max(70,72+(data.ulProgress||0)*27),4:100};
   NetworkSpeedUI.progress(progress[data.testState]??document.getElementById('speedProgress').value);
   NetworkSpeedUI.status(({0:'连接测速节点…',1:`${selected||'测速节点'} · 正在下载…`,2:'正在测试延迟…',3:'正在测试上传…',4:'测速完成',5:'已停止'})[data.testState]||'正在测速…');
  };
  engine.onend=aborted=>{
   if(current!==run||settled)return;settled=true;const server=selected;test=null;NetworkSpeedUI.busy(false);
   if(failure){NetworkSpeedUI.status(failure,true);NetworkSpeedUI.result(failure,true);NetworkSpeedUI.line(`${server||'LibreSpeed'}：下载 ${document.getElementById('downloadMetric').textContent} Mbps · 上传 ${document.getElementById('uploadMetric').textContent} Mbps`,true);return;}
   if(aborted){NetworkSpeedUI.progress(document.getElementById('speedProgress').value);NetworkSpeedUI.status('已停止');NetworkSpeedUI.result('测速已停止，保留已完成采样。');return;}
   const download=Number(document.getElementById('downloadMetric').textContent),upload=Number(document.getElementById('uploadMetric').textContent);
   if(!Number.isFinite(download)||download<=0){failure='下载未得到有效结果：公共节点可能限制跨域，请切换测速方式。';NetworkSpeedUI.metric('downloadMetric','失败');NetworkSpeedUI.status(failure,true);NetworkSpeedUI.result(failure,true);NetworkSpeedUI.line(`${server||'LibreSpeed'}：未获得有效下载数据。`,true);return;}
   if(!Number.isFinite(upload)||upload<=0){NetworkSpeedUI.metric('uploadMetric','未测');NetworkSpeedUI.status('下载已完成 · 上传未返回有效数据');NetworkSpeedUI.result('该节点未完成上传测试，可切换 Cloudflare 或支持上传的自定义节点。',true);NetworkSpeedUI.line(`${server||'LibreSpeed'}：下载 ${download.toFixed(2)} Mbps · 上传未测`);NetworkSpeedUI.progress(100);return;}
   NetworkSpeedUI.progress(100);NetworkSpeedUI.status('测速完成');
   NetworkSpeedUI.line(`${server||'LibreSpeed'}：下载 ${document.getElementById('downloadMetric').textContent} Mbps · 上传 ${document.getElementById('uploadMetric').textContent} Mbps`);
  };
  try{
   engine.addTestPoints(servers);
   engine.selectServer(server=>{
    if(current!==run)return;
    if(!server){test=null;NetworkSpeedUI.busy(false);NetworkSpeedUI.status('当前网络无法连接 LibreSpeed 节点，请检查跨域或切换测速方式。',true);NetworkSpeedUI.result('所有公共节点连接失败。',true);return;}
    selected=server.name;document.getElementById('downloadUrl').value=server.name;NetworkSpeedUI.status('已选择 '+server.name+'，开始测速…');try{engine.start();engine.worker?.addEventListener('error',workerFailure,{once:true});engine.worker?.addEventListener('messageerror',workerFailure,{once:true});}catch(_){workerFailure();}
   });
  }catch(_){test=null;NetworkSpeedUI.busy(false);NetworkSpeedUI.status('LibreSpeed 初始化失败，请稍后重试。',true);}
 }
 function stop(){if(test?.getState()>=3)try{test.abort();}catch(_){}else{run++;test=null;NetworkSpeedUI.busy(false);NetworkSpeedUI.status('已停止');}}
 window.LibrespeedTest={start,stop};window.addEventListener('pagehide',clear);
})();
