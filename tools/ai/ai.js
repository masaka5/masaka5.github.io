import {LocalAiClient,splitThinking,LOCAL_LABEL} from './local-ai-client.js?v=20261114-mobile3';
import {ContextHarness,summaryPrompt} from './local-ai-harness.mjs?v=20261114-mobile3';
import {shouldSend} from './chat-shortcuts.mjs?v=20261114-mobile3';
import {ConversationStore,createTask,finishTask,readTaskReply,taskContext} from './conversation-journal.mjs?v=20261114-mobile3';
import {estimateTextTokens} from './local-ai-harness.mjs?v=20261114-mobile3';
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const imageTypes=new Set(['image/png','image/jpeg','image/webp']);
  const textExtensions=/\.(txt|md|csv|json|log|xml|yaml|yml|html|css|js|ts|py|sh|ps1|sql|ini|conf)$/i;
  let config=null,history=[],localHistory=[],attachments=[],controller=null,reading=false,localBusy=false,localMode=true,localRaw='',localActive=null,apiCheckpoint=null,apiSessionId=crypto.randomUUID(),localLabel=LOCAL_LABEL;
  const localClient=new LocalAiClient({onProgress:info=>status(`${info.status} · ${Math.round(info.value*100)}%`),onReady:info=>{localLabel=info.label||LOCAL_LABEL;if(localMode){$('modelLabel').textContent=localLabel+' · WebGPU';$('cacheLabel').textContent=info.cacheStored?'已缓存':'未缓存';status(info.cacheStored?'模型已就绪':'模型已就绪，存储空间不足，缓存未完成');}},onToken:(id,text)=>{if(localActive?.id===id){localRaw+=text;renderLocal(localActive,localRaw);scheduleSave();}},onSnapshot:(id,text)=>{if(localActive?.id===id){localRaw=text;renderLocal(localActive,text);scheduleSave();}},onPhase:(id,phase)=>{if(localActive?.id===id)status(phase==='compacting'?'整理上下文…':'生成中…');},onContext:event=>contextEvent(event),onCheckpoint:()=>void persist(),onError:error=>status(error,true)});
  const status=(message,error=false)=>Ops.status($('chatStatus'),message,error);
  const store=new ConversationStore(),tasks={local:null,api:null},contexts={local:null,api:null},archivedTasks=[];
  let saveTimer=null,restoring=true,storageProblem=false,interrupted=null;
  const mode=()=>localMode?'local':'api';
  const currentTask=()=>tasks[mode()];
  function renderMemory(){
    const task=currentTask(),context=contexts[mode()];
    $('contextStrip').hidden=!task&&!context;
    $('taskStatus').hidden=!task;
    $('taskStatus').textContent=task?(task.status==='completed'?'任务已完成':task.status==='pending'?'任务待继续':'任务进行中'):'';
    $('taskStatus').dataset.state=task?.status||'';
    $('contextNotice').hidden=!context;
    $('contextNotice').dataset.state=context?.state||'';
    $('contextNotice').textContent=context?.state==='compacting'?'正在整理上下文…':context?.state==='error'?'整理未完成 · 原文已保留':context?'上下文已整理 · 原文已保留':'';
  }
  function contextEvent(event){
    const key=mode(),previous=contexts[key]||{};
    if(event.type==='compaction_start')contexts[key]={...previous,state:'compacting',before:event.tokensBefore};
    else if(event.type==='compaction_end')contexts[key]={...previous,state:'ready',before:event.tokensBefore,after:event.tokensAfter,count:(previous.count||0)+1};
    else if(event.type==='compaction_error')contexts[key]={...previous,state:'error'};
    renderMemory();if(event.type!=='compaction_summary'&&event.type!=='compaction_progress')void persist();
  }
  function beginTask(text){
    const key=mode(),task=tasks[key];
    if(!task||task.status==='completed'){if(task)archivedTasks.push(task);tasks[key]=createTask(text||'处理附件');}
    else tasks[key]={...task,status:'in_progress'};
    renderMemory();
  }
  function completeReply(value){
    const reply=readTaskReply(value);if(reply.completed)tasks[mode()]=finishTask(currentTask(),true);
    renderMemory();return reply.text;
  }
  function snapshot(){return {history,localHistory,localMode,sessionId:localClient.sessionId,checkpoint:localClient.checkpoint,apiSessionId,apiCheckpoint,tasks,contexts,archivedTasks,interrupted:localActive?{mode:'local',raw:localRaw}:interrupted,draft:$('prompt').value,shortcut:$('sendShortcut').value};}
  async function persist(){
    if(restoring)return false;clearTimeout(saveTimer);saveTimer=null;
    try{await store.save(snapshot());storageProblem=false;return true;}
    catch{if(!storageProblem)status('浏览器未能保存记录，请导出对话后再刷新。',true);storageProblem=true;return false;}
  }
  function scheduleSave(){if(!saveTimer)saveTimer=setTimeout(()=>void persist(),1000);}
  function renderTranscript(){
    $('chatFeed').replaceChildren($('chatEmpty'));$('chatEmpty').hidden=false;
    for(const item of localMode?localHistory:history){
      if(item.role==='assistant'){const reply=message('assistant',item.content);reply.card.dataset.state='complete';if(item.raw)renderLocal(reply,item.raw,true);}
      else message('user',item.display??(typeof item.content==='string'?item.content:item.content.filter(p=>p.type==='text').map(p=>p.text).join('\n')),item.files||[]);
    }
    if(interrupted?.mode===mode()){const reply=message('assistant','生成已中断，原始消息已保留。');reply.card.dataset.state='error';reply.label.textContent='未完成';if(interrupted.raw&&localMode)renderLocal(reply,interrupted.raw,true);else if(interrupted.raw)reply.body.textContent=interrupted.raw;}
    renderMemory();
  }
  let localSubmission=null;
  function controls(){
    const busy=!!controller||localBusy;
    for(const id of ['prompt','attach','files','newChat','clearChat','openSettings','localChat','useLocal','setupChat','taskStatus'])$(id).disabled=busy||reading;
    $('send').disabled=busy||reading;$('send').hidden=busy;$('stop').hidden=!busy;
    $('chatFeed').setAttribute('aria-busy',String(busy));
    document.querySelectorAll('.attachment button').forEach(button=>button.disabled=busy||reading);
  }
  function clearChat(){
    history=[];localHistory=[];attachments=[];localRaw='';localActive=null;localClient.resetContext();apiCheckpoint=null;apiSessionId=crypto.randomUUID();if(localMode)$('modelLabel').textContent=localLabel+(localClient.ready?' · WebGPU':' · 未加载');$('attachments').replaceChildren();$('chatFeed').replaceChildren($('chatEmpty'));
    tasks.local=null;tasks.api=null;contexts.local=null;contexts.api=null;archivedTasks.length=0;interrupted=null;
    $('chatEmpty').hidden=false;$('exportChat').disabled=true;$('prompt').value='';status('');renderMemory();void persist();
  }
  function endpoint(value){
    let url;try{url=new URL(value);}catch(_){throw Error('请填写完整的 API 地址。');}
    if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.hash)throw Error('请填写有效的 HTTP(S) API 地址。');
    const host=url.hostname.toLowerCase();
    if(/(^|\.)(chatgpt\.com|doubao\.com|chat\.openai\.com)$/.test(host))throw Error('这是网页版地址，不能用作 API；请使用右上方的网页版入口。');
    if(url.protocol==='http:'&&(location.protocol==='https:'||!['localhost','127.0.0.1','[::1]'].includes(host)))throw Error('请使用 HTTPS 接口，本地预览时可使用 localhost。');
    if(url.search)throw Error('请勿将密钥放在网址参数中，请填写下方密钥。');
    return url.href;
  }
  $('openSettings').onclick=$('setupChat').onclick=()=>{$('settingsStatus').textContent='';$('settings').showModal();};
  async function openLocal(){
    if(!localMode){localMode=true;renderTranscript();void persist();}$('modelLabel').textContent=LOCAL_LABEL+' · 准备中';status('正在准备模型…');
    try{await navigator.storage?.persist?.().catch(()=>false);await localClient.load();$('modelLabel').textContent=localLabel+' · WebGPU';}catch(error){$('modelLabel').textContent=localLabel+' · 未加载';status(error.message||'本地模型启动失败。',true);}
  }
  $('localChat').onclick=$('useLocal').onclick=()=>openLocal();
  $('closeSettings').onclick=()=>$('settings').close();
  $('settingsForm').onsubmit=event=>{
    event.preventDefault();try{
      const next={url:endpoint($('endpoint').value.trim()),model:$('model').value.trim(),key:$('apiKey').value.trim()};
      if(!next.model)throw Error('请填写模型名称。');
      if(/[\r\n]/.test(next.key))throw Error('密钥格式不正确。');
      if(config&&(config.url!==next.url||config.model!==next.model))clearChat();
      localMode=false;config=next;renderTranscript();void persist();$('modelLabel').textContent=next.model;$('modelLabel').title=new URL(next.url).host;
      $('settings').close();status('接口已配置，可发送消息。');$('prompt').focus();
    }catch(error){Ops.status($('settingsStatus'),error.message,true);}
  };
  $('forgetSettings').onclick=()=>{
    config=null;clearChat();for(const id of ['endpoint','model','apiKey'])$(id).value='';
    $('modelLabel').textContent='尚未配置接口';$('modelLabel').removeAttribute('title');$('settings').close();status('已清除接口配置。');
  };
  $('newChat').onclick=()=>{clearChat();$('prompt').focus();};
  $('clearChat').onclick=()=>{clearChat();$('prompt').focus();};
  $('attach').onclick=()=>$('files').click();
  function renderAttachments(){
    $('attachments').replaceChildren();
    attachments.forEach((file,index)=>{
      const card=Ops.node('div','attachment');
      if(file.image){const img=document.createElement('img');img.src=file.data;img.alt='';card.append(img);}
      const name=Ops.node('span','',file.name);name.title=file.name;
      const remove=Ops.node('button','','×');remove.type='button';remove.setAttribute('aria-label','移除 '+file.name);
      remove.onclick=()=>{attachments.splice(index,1);renderAttachments();};card.append(name,remove);$('attachments').append(card);
    });controls();
  }
  async function addFiles(files){
    if(controller||reading||!files.length)return;
    reading=true;controls();status('正在读取附件…');
    try{
      const added=[];
      for(const file of files){
        if(!file.size)throw Error(file.name+' 是空文件。');
        if(imageTypes.has(file.type)){
          const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('读取图片失败。'));reader.readAsDataURL(file);});
          added.push({name:file.name,size:file.size,image:true,data});
        }else{
          if(!textExtensions.test(file.name))throw Error('不支持此文件格式：'+file.name+'。PDF、Office 文件请到官方网页版上传。');
          let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());}catch(_){throw Error(file.name+' 需要保存为 UTF-8 文本。');}
          if(text.includes('\0'))throw Error(file.name+' 不是可读取的文本文件。');
          added.push({name:file.name,size:file.size,image:false,data:text});
        }
      }
      attachments.push(...added);renderAttachments();status('附件已就绪，点击发送后提交。');
    }catch(error){status(error.message,true);}finally{reading=false;$('files').value='';controls();}
  }
  $('files').onchange=()=>addFiles([...$('files').files]);
  $('prompt').addEventListener('paste',event=>{const files=[...event.clipboardData.files];if(files.length){event.preventDefault();addFiles(files);}});
  try{$('sendShortcut').value=localStorage.getItem('pocket-ai-send-shortcut')||'enter';}catch{}
  $('sendShortcut').onchange=()=>{try{localStorage.setItem('pocket-ai-send-shortcut',$('sendShortcut').value);}catch{}};
  $('prompt').addEventListener('keydown',event=>{if(shouldSend(event,$('sendShortcut').value)){event.preventDefault();if(!controller&&!reading&&!localBusy)$('chatForm').requestSubmit();}});
  function message(role,text,files=[]){
    $('chatEmpty').hidden=true;
    const card=Ops.node('article','message');card.dataset.role=role;
    const head=Ops.node('div','message-head'),label=Ops.node('strong','',role==='user'?'你':'助手');head.append(label);
    const body=Ops.node('div','message-body',text);card.append(head,body);
    if(role==='assistant'){
      const copy=Ops.node('button','text-button','复制');copy.type='button';copy.onclick=()=>Ops.copy(body.textContent,$('chatStatus'));head.append(copy);
    }
    const images=Ops.node('div','message-images');
    files.filter(file=>file.image).forEach(file=>{const img=document.createElement('img');img.src=file.data;img.alt=file.name;images.append(img);});
    if(images.childElementCount)card.append(images);
    if(files.length)card.append(Ops.node('p','message-files',files.map(file=>file.name).join(' · ')));
    $('chatFeed').append(card);$('chatFeed').scrollTop=$('chatFeed').scrollHeight;
    $('exportChat').disabled=false;return {card,body,label};
  }
  function renderLocal(reply,raw,finished=false){
    const feed=$('chatFeed'),follow=feed.scrollHeight-feed.scrollTop-feed.clientHeight<90;
    const parsed=splitThinking(raw);reply.body.textContent=readTaskReply(parsed.answer).text||(finished?'生成未完成，消息已保留。':parsed.thinking?'正在思考…':'正在生成…');
    let details=reply.card.querySelector('.thinking');
    if(!details){details=document.createElement('details');details.className='thinking';const summary=document.createElement('summary');summary.textContent='思考过程';details.append(summary,document.createElement('div'));reply.card.insertBefore(details,reply.body);}
    details.querySelector('div').textContent=parsed.thinking;details.hidden=!parsed.thinking;
    if(follow)feed.scrollTop=feed.scrollHeight;
  }
  function localAttachmentText(files){return files.filter(file=>!file.image).map(file=>`\n附件：${file.name}\n${file.data}`).join('');}
  async function submitLocal(text,files){
    if(files.some(file=>file.image)){status('Spark 模型支持文字，图片请使用接口模式。',true);return;}
    const submission=localSubmission={cancelled:false};localBusy=true;controls();
    if(!localClient.ready){await openLocal();if(submission.cancelled)return;if(!localClient.ready){localBusy=false;localSubmission=null;controls();return;}}
    const content=(text||'')+localAttachmentText(files),user={role:'user',content,display:text,files};
    if(localHistory.at(-1)?.role!=='user'||localHistory.at(-1).content!==content)localHistory.push(user);
    beginTask(text);interrupted={mode:'local',raw:''};await persist();
    const sent=message('user',text,files),reply=message('assistant','正在生成…');reply.id=crypto.randomUUID();reply.card.dataset.state='working';localRaw='';localActive=reply;status('生成中…');
    try{const answer=await localClient.ask(localHistory,{id:reply.id,task:currentTask()});localRaw=answer;const finalAnswer=completeReply(splitThinking(answer).answer);if(!finalAnswer.trim())throw Error('模型未返回答案，消息已保留。');renderLocal(reply,answer,true);localHistory.push({role:'assistant',content:finalAnswer,raw:answer});reply.card.dataset.state='complete';interrupted=null;$('prompt').value='';attachments=[];renderAttachments();status('');}
    catch(error){interrupted={mode:'local',raw:localRaw};tasks.local={...tasks.local,status:'pending'};renderMemory();reply.card.dataset.state='error';reply.label.textContent='未完成';if(!localRaw)reply.body.textContent=error.message||'本地生成失败，请重试。';else renderLocal(reply,localRaw,true);status(error.message||'本地生成失败。',true);}
    finally{localBusy=false;localActive=null;localSubmission=null;controls();await persist();$('prompt').focus();}
  }
  function content(text,files){
    const parts=[];if(text)parts.push({type:'text',text});
    for(const file of files){
      if(file.image)parts.push({type:'image_url',image_url:{url:file.data}});
      else parts.push({type:'text',text:`附件：${file.name}\n<file_content>\n${file.data}\n</file_content>`});
    }
    return files.length?parts:text;
  }
  async function responseText(response,onText){
    const reader=response.body?.getReader();if(!reader)throw Error('接口没有返回可读取的内容。');
    const decoder=new TextDecoder();let buffer='',answer='',done=false,finishReason='stop';
    const streaming=(response.headers.get('content-type')||'').includes('text/event-stream');
    function chunk(line){
      if(!line.startsWith('data:'))return;
      const data=line.slice(5).trim();if(!data)return;
      if(data==='[DONE]'){done=true;return;}
      let result;try{result=JSON.parse(data);}catch(_){throw Error('接口流式数据格式不正确。');}
      if(result.error)throw Error('接口返回错误，请检查模型名称、额度与图片支持。');
      const choice=result.choices?.[0],part=choice?.delta?.content;
      if(typeof part==='string'){answer+=part;onText(answer);}
      if(choice?.finish_reason){
        if(choice.finish_reason==='content_filter')throw Error('接口未能返回此内容，请调整问题后重试。');
        finishReason=choice.finish_reason;done=true;
      }
    }
    try{
      while(true){
        const next=await reader.read();
        if(next.done){buffer+=decoder.decode();break;}
        buffer+=decoder.decode(next.value,{stream:true});
        if(streaming){let end;while((end=buffer.indexOf('\n'))>=0){chunk(buffer.slice(0,end).replace(/\r$/,''));buffer=buffer.slice(end+1);}if(done)break;}
      }
      if(streaming){if(buffer.trim())chunk(buffer.trim());if(!done)throw Error('连接提前中断，请重试。');}
      else{
        let result;try{result=JSON.parse(buffer);}catch(_){throw Error('接口未返回对话数据，请检查 API 地址。');}
        if(result.error)throw Error('接口返回错误，请检查模型名称、额度与图片支持。');
        answer=result.choices?.[0]?.message?.content;
        finishReason=result.choices?.[0]?.finish_reason||'stop';
        if(typeof answer!=='string')throw Error('此接口返回格式不兼容 Chat Completions。');
        onText(answer);
      }
      if(!answer.trim())throw Error('接口没有返回文本，请检查模型设置。');return {text:answer,stopReason:finishReason==='length'?'length':'stop'};
    }finally{try{await reader.cancel();}catch(_){}reader.releaseLock();}
  }
  $('stop').onclick=()=>{if(localBusy){if(localSubmission)localSubmission.cancelled=true;localClient.stop();if(!localClient.pending.size){localBusy=false;localSubmission=null;controls();}status('已停止本地生成。');}else controller?.abort();};
  $('chatForm').onsubmit=async event=>{
    event.preventDefault();if(controller||reading||localBusy)return;
    const text=$('prompt').value.trim(),files=[...attachments];if(!text&&!files.length){status('请输入问题或添加附件。');return;}
    if(localMode){await submitLocal(text,files);return;}
    if(!config){$('settings').showModal();Ops.status($('settingsStatus'),'先配置接口，再发送消息。');return;}
    const user={role:'user',content:content(text,files),display:text,files};
    if(history.at(-1)?.role!=='user'||JSON.stringify(history.at(-1).content)!==JSON.stringify(user.content))history.push(user);
    const messages=[...history];beginTask(text);interrupted={mode:'api',raw:''};
    controller=new AbortController();const signal=controller.signal;
    controls();const sent=message('user',text,files),reply=message('assistant','正在等待回复…');reply.card.dataset.state='working';status('正在请求 '+new URL(config.url).host+'…');
    try{
      await persist();
      const request=async(items,onText=()=>{})=>{
       const headers={'Content-Type':'application/json'};if(config.key)headers.Authorization='Bearer '+config.key;
       const response=await fetch(config.url,{method:'POST',headers,body:JSON.stringify({model:config.model,messages:items.map(({role,content})=>({role,content})),stream:true}),signal,credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',cache:'no-store'});
       if(!response.ok){let detail='';try{detail=await response.text();}catch(_){}const overflow=/context|maximum.*token|too many token|上下文/i.test(detail);const hint={401:'API 密钥无效，请检查后重试。',403:'接口拒绝访问，请检查权限。',429:'请求频繁或额度不足，请稍后重试。'};const error=Error(overflow?'接口模型窗口已满。':hint[response.status]||`接口请求失败（${response.status}）。`);error.overflow=overflow;throw error;}
       return responseText(response,onText);
      };
      const asText=value=>typeof value==='string'?value:value.map(part=>part.type==='text'?part.text:'[图片附件]').join('\n');
      const originals=messages.map((m,index)=>({...m,sourceIndex:index}));
      const taskNote=taskContext(currentTask()),withTask=items=>taskNote?[taskNote,...items]:items;
      const contextHarness=new ContextHarness({window:config.contextWindow||32768,
       count:items=>withTask(items).reduce((n,m)=>n+estimateTextTokens(m.content)+8,0),onEvent:contextEvent,
       summarize:async({previous,messages,targetTokens})=>{status('整理上下文…');let response=await request([{role:'user',content:summaryPrompt(previous,messages,targetTokens)}]);while(response.stopReason==='length'){const follow=await request([{role:'user',content:summaryPrompt(previous,messages,targetTokens)},{role:'assistant',content:response.text},{role:'user',content:'继续完成摘要，不要重复。'}]);response={text:response.text+follow.text,stopReason:follow.stopReason};}return response;}
      });
      const project=async(items,force=false)=>{
       const prepared=await contextHarness.prepare(items.map(m=>({...m,content:asText(m.content)})),{checkpoint:apiCheckpoint,sessionId:apiSessionId,force,signal});apiCheckpoint=prepared.checkpoint;
       return prepared.messages.map(m=>{const original=originals[m.sourceIndex];return original&&asText(original.content)===m.content?original:m;});
      };
      let inference=await project(originals),answer='',reason='length',recover=false;
      while(reason==='length'){
       status('生成中…');
       let result;
       try{result=await request(withTask(inference),value=>{const feed=$('chatFeed'),follow=feed.scrollHeight-feed.scrollTop-feed.clientHeight<90;reply.body.textContent=readTaskReply(answer+value).text;interrupted={mode:'api',raw:answer+value};scheduleSave();if(follow)feed.scrollTop=feed.scrollHeight;});}
       catch(error){if(error.overflow&&!recover){recover=true;apiCheckpoint=null;inference=await project(inference,true);continue;}throw error;}
       answer+=result.text;reason=result.stopReason;
       if(reason==='length'){apiCheckpoint=null;inference=await project([...inference,{role:'assistant',content:result.text},{role:'user',content:'接着上文继续，不要重复已输出的内容。'}]);}
      }
      if(signal.aborted)throw new DOMException('Aborted','AbortError');
      answer=completeReply(answer);history.push({role:'assistant',content:answer});reply.body.textContent=answer;reply.card.dataset.state='complete';interrupted=null;
      $('prompt').value='';attachments=[];renderAttachments();status('');
    }catch(error){
      tasks.api={...tasks.api,status:'pending'};renderMemory();
      const explanation=signal.aborted?'已停止，消息和附件已保留。':error instanceof TypeError?'无法连接接口，请检查地址、网络及跨域设置。':error.message;
      sent.card.dataset.state='error';reply.card.dataset.state='error';reply.label.textContent='未完成';
      reply.body.textContent=(reply.body.textContent==='正在等待回复…'?'':reply.body.textContent+'\n\n')+explanation;status(explanation,true);
    }finally{controller=null;controls();await persist();$('prompt').focus();}
  };
  $('exportChat').onclick=()=>{
    const text=[...document.querySelectorAll('.message')].map(card=>(card.dataset.role==='user'?'你':'助手')+'\n'+card.querySelector('.message-body').textContent+(card.querySelector('.message-files')?'\n附件：'+card.querySelector('.message-files').textContent:'')).join('\n\n');
    Ops.save(text,'AI-对话.txt');
  };
  $('taskStatus').onclick=()=>{const task=currentTask();if(!task)return;$('taskGoal').value=task.goal;$('taskFacts').value=task.facts.join('\n');$('taskComplete').textContent=task.status==='completed'?'继续任务':'标记完成';$('taskDialog').showModal();};
  $('closeTask').onclick=()=>$('taskDialog').close();
  $('taskForm').onsubmit=event=>{event.preventDefault();const task=currentTask();if(!task)return;tasks[mode()]={...task,goal:$('taskGoal').value.trim()||task.goal,facts:$('taskFacts').value.split('\n').map(v=>v.trim()).filter(Boolean)};renderMemory();$('taskDialog').close();void persist();};
  $('taskComplete').onclick=()=>{tasks[mode()]=finishTask(currentTask(),currentTask().status!=='completed');renderMemory();$('taskDialog').close();void persist();};
  $('contextNotice').onclick=()=>{const checkpoint=localMode?localClient.checkpoint:apiCheckpoint;$('contextSummary').textContent=checkpoint?.summary||'本次整理尚未完成，原始对话保持不变。';$('contextDialog').showModal();};
  $('closeContext').onclick=()=>$('contextDialog').close();
  $('prompt').addEventListener('input',scheduleSave);
  window.addEventListener('pagehide',()=>void persist());
  async function restore(){
    reading=true;controls();
    try{const saved=await store.read();if(saved?.version===1){
      history=Array.isArray(saved.history)?saved.history:[];localHistory=Array.isArray(saved.localHistory)?saved.localHistory:[];
      localMode=saved.localMode!==false;localClient.sessionId=saved.sessionId||localClient.sessionId;localClient.checkpoint=saved.checkpoint||null;
      apiSessionId=saved.apiSessionId||apiSessionId;apiCheckpoint=saved.apiCheckpoint||null;
      Object.assign(tasks,saved.tasks||{});Object.assign(contexts,saved.contexts||{});archivedTasks.push(...(saved.archivedTasks||[]));
      for(const key of ['local','api'])if(contexts[key]?.state==='compacting')contexts[key].state='error';
      interrupted=saved.interrupted||null;$('prompt').value=saved.draft||'';
      if(saved.shortcut)$('sendShortcut').value=saved.shortcut;
      renderTranscript();if(!localMode)$('modelLabel').textContent='接口模式 · 需配置密钥';
    }}catch{status('无法读取浏览器会话记录。',true);}finally{restoring=false;reading=false;controls();}
  }
  void restore();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./ai-sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
})();
