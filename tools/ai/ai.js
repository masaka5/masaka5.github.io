import {LocalAiClient,splitThinking,LOCAL_LABEL} from './local-ai-client.js?v=20261114-local4';
(() => {
  'use strict';
  const $=id=>document.getElementById(id),MB=1024*1024;
  const imageTypes=new Set(['image/png','image/jpeg','image/webp']);
  const textExtensions=/\.(txt|md|csv|json|log|xml|yaml|yml|html|css|js|ts|py|sh|ps1|sql|ini|conf)$/i;
  let config=null,history=[],localHistory=[],attachments=[],controller=null,reading=false,localBusy=false,localMode=true,localRaw='',localActive=null;
  const localClient=new LocalAiClient({onProgress:info=>status(`${info.status} · ${Math.round(info.value*100)}%`),onReady:info=>{localMode=true;$('modelLabel').textContent=info.label+` · ${info.device==='webgpu'?'WebGPU':'兼容模式'}`;status('模型已就绪');},onToken:(id,text)=>{if(localActive?.id===id){localRaw+=text;renderLocal(localActive,localRaw);}},onError:error=>status(error,true)});
  const status=(message,error=false)=>Ops.status($('chatStatus'),message,error);
  function controls(){
    const busy=!!controller||localBusy;
    for(const id of ['prompt','attach','files','newChat','openSettings','localChat','useLocal','setupChat'])$(id).disabled=busy||reading;
    $('send').disabled=busy||reading;$('send').hidden=busy;$('stop').hidden=!busy;
    $('chatFeed').setAttribute('aria-busy',String(busy));
    document.querySelectorAll('.attachment button').forEach(button=>button.disabled=busy||reading);
  }
  function clearChat(){
    history=[];localHistory=[];attachments=[];localRaw='';localActive=null;if(localMode)$('modelLabel').textContent=LOCAL_LABEL+(localClient.ready?' · '+(localClient.device==='webgpu'?'WebGPU':'兼容模式'):' · 未加载');$('attachments').replaceChildren();$('chatFeed').replaceChildren($('chatEmpty'));
    $('chatEmpty').hidden=false;$('exportChat').disabled=true;$('prompt').value='';status('');
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
    localMode=true;$('modelLabel').textContent=LOCAL_LABEL+' · 准备中';status('正在准备模型…');
    try{await localClient.load();$('modelLabel').textContent=LOCAL_LABEL+' · '+(localClient.device==='webgpu'?'WebGPU':'兼容模式');}catch(error){$('modelLabel').textContent=LOCAL_LABEL+' · 未加载';status(error.message||'本地模型启动失败。',true);}
  }
  $('localChat').onclick=$('useLocal').onclick=()=>openLocal();
  $('closeSettings').onclick=()=>$('settings').close();
  $('settingsForm').onsubmit=event=>{
    event.preventDefault();try{
      const next={url:endpoint($('endpoint').value.trim()),model:$('model').value.trim(),key:$('apiKey').value.trim()};
      if(!next.model)throw Error('请填写模型名称。');
      if(/[\r\n]/.test(next.key))throw Error('密钥格式不正确。');
      if(config&&(config.url!==next.url||config.model!==next.model))clearChat();
      localMode=false;config=next;$('modelLabel').textContent=next.model;$('modelLabel').title=new URL(next.url).host;
      $('settings').close();status('接口已配置，可发送消息。');$('prompt').focus();
    }catch(error){Ops.status($('settingsStatus'),error.message,true);}
  };
  $('forgetSettings').onclick=()=>{
    config=null;clearChat();for(const id of ['endpoint','model','apiKey'])$(id).value='';
    $('modelLabel').textContent='尚未配置接口';$('modelLabel').removeAttribute('title');$('settings').close();status('已清除接口配置。');
  };
  $('newChat').onclick=()=>{clearChat();$('prompt').focus();};
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
      if(attachments.length+files.length>5)throw Error('最多添加 5 个附件。');
      if([...attachments,...files].reduce((sum,file)=>sum+file.size,0)>10*MB)throw Error('附件合计不能超过 10 MB。');
      const added=[];
      for(const file of files){
        if(!file.size)throw Error(file.name+' 是空文件。');
        if(imageTypes.has(file.type)){
          if(file.size>5*MB)throw Error('单张图片不能超过 5 MB。');
          const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('读取图片失败。'));reader.readAsDataURL(file);});
          added.push({name:file.name,size:file.size,image:true,data});
        }else{
          if(!textExtensions.test(file.name))throw Error('不支持此文件格式：'+file.name+'。PDF、Office 文件请到官方网页版上传。');
          if(file.size>MB)throw Error('单个文本文件不能超过 1 MB。');
          let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());}catch(_){throw Error(file.name+' 需要保存为 UTF-8 文本。');}
          if(text.includes('\0'))throw Error(file.name+' 不是可读取的文本文件。');
          if(text.length>100000)throw Error('文本文件最多 10 万字符：'+file.name);
          added.push({name:file.name,size:file.size,image:false,data:text});
        }
      }
      attachments.push(...added);renderAttachments();status('附件已就绪，点击发送后提交。');
    }catch(error){status(error.message,true);}finally{reading=false;$('files').value='';controls();}
  }
  $('files').onchange=()=>addFiles([...$('files').files]);
  $('prompt').addEventListener('paste',event=>{const files=[...event.clipboardData.files];if(files.length){event.preventDefault();addFiles(files);}});
  $('prompt').addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)&&!event.isComposing){event.preventDefault();if(!controller&&!reading)$('chatForm').requestSubmit();}});
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
    const parsed=splitThinking(raw);reply.body.textContent=parsed.answer||(finished?'本次未生成最终回答，可缩短问题后重试。':parsed.thinking?'正在思考…':'正在生成…');
    let details=reply.card.querySelector('.thinking');
    if(!details){details=document.createElement('details');details.className='thinking';const summary=document.createElement('summary');summary.textContent='思考过程';details.append(summary,document.createElement('div'));reply.card.insertBefore(details,reply.body);}
    details.querySelector('div').textContent=parsed.thinking;details.hidden=!parsed.thinking;
  }
  function localAttachmentText(files){return files.filter(file=>!file.image).map(file=>`\n附件：${file.name}\n${file.data}`).join('');}
  async function submitLocal(text,files){
    if(files.some(file=>file.image)){status('本地 1.5B 模型只支持文字，请切换接口模式处理图片。',true);return;}
    localBusy=true;controls();
    if(!localClient.ready){await openLocal();if(!localClient.ready){localBusy=false;controls();return;}}
    const content=(text||'')+localAttachmentText(files),user={role:'user',content};localHistory.push(user);
    const sent=message('user',text,files),reply=message('assistant','正在生成…');reply.id=crypto.randomUUID();reply.card.dataset.state='working';localRaw='';localActive=reply;status('生成中…');
    try{const answer=await localClient.ask(localHistory,{id:reply.id,maxTokens:384});localRaw=answer;renderLocal(reply,answer,true);if(!answer.trim())throw Error('模型未输出文本，请重试。');const finalAnswer=splitThinking(answer).answer;if(finalAnswer)localHistory.push({role:'assistant',content:finalAnswer});else localHistory.pop();reply.card.dataset.state='complete';$('prompt').value='';attachments=[];renderAttachments();status('');}
    catch(error){localHistory.pop();reply.card.dataset.state='error';reply.label.textContent='未完成';if(!localRaw)reply.body.textContent=error.message||'本地生成失败，请重试。';else renderLocal(reply,localRaw,true);status(error.message||'本地生成失败。',true);}
    finally{localBusy=false;localActive=null;controls();$('prompt').focus();}
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
    const decoder=new TextDecoder();let buffer='',bytes=0,answer='',done=false;
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
        done=true;
      }
    }
    try{
      while(true){
        const next=await reader.read();
        if(next.done){buffer+=decoder.decode();break;}
        bytes+=next.value.byteLength;if(bytes>2*MB)throw Error('回复内容过大，请新建对话并缩小问题范围。');
        buffer+=decoder.decode(next.value,{stream:true});
        if(streaming){let end;while((end=buffer.indexOf('\n'))>=0){chunk(buffer.slice(0,end).replace(/\r$/,''));buffer=buffer.slice(end+1);}if(done)break;}
      }
      if(streaming){if(buffer.trim())chunk(buffer.trim());if(!done)throw Error('连接提前中断，请重试。');}
      else{
        let result;try{result=JSON.parse(buffer);}catch(_){throw Error('接口未返回对话数据，请检查 API 地址。');}
        if(result.error)throw Error('接口返回错误，请检查模型名称、额度与图片支持。');
        answer=result.choices?.[0]?.message?.content;
        if(typeof answer!=='string')throw Error('此接口返回格式不兼容 Chat Completions。');
        onText(answer);
      }
      if(!answer.trim())throw Error('接口没有返回文本，请检查模型设置。');return answer;
    }finally{try{await reader.cancel();}catch(_){}reader.releaseLock();}
  }
  $('stop').onclick=()=>{if(localBusy){localClient.stop();status('已停止本地生成。');}else controller?.abort();};
  $('chatForm').onsubmit=async event=>{
    event.preventDefault();if(controller||reading||localBusy)return;
    const text=$('prompt').value.trim(),files=[...attachments];if(!text&&!files.length){status('请输入问题或添加附件。');return;}
    if(localMode){await submitLocal(text,files);return;}
    if(!config){$('settings').showModal();Ops.status($('settingsStatus'),'先配置接口，再发送消息。');return;}
    const user={role:'user',content:content(text,files)},messages=[...history,user];
    if(history.length>=60||JSON.stringify(messages).length>20*MB){status('当前对话过长，请新建对话后继续。',true);return;}
    controller=new AbortController();const signal=controller.signal;let timedOut=false;
    const timer=setTimeout(()=>{timedOut=true;controller?.abort();},120000);
    controls();const sent=message('user',text,files),reply=message('assistant','正在等待回复…');reply.card.dataset.state='working';status('正在请求 '+new URL(config.url).host+'…');
    try{
      const headers={'Content-Type':'application/json'};if(config.key)headers.Authorization='Bearer '+config.key;
      const response=await fetch(config.url,{method:'POST',headers,body:JSON.stringify({model:config.model,messages,stream:true}),signal,credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',cache:'no-store'});
      if(!response.ok){try{await response.body?.cancel();}catch(_){}const hints={400:'请求被拒绝，请检查模型及附件支持。',401:'密钥无效或已失效，请检查接口设置。',403:'接口拒绝访问，请检查权限。',404:'接口或模型不存在，请检查完整请求地址。',413:'附件过大，请减少文件。',429:'请求过于频繁或额度不足，请稍后重试。'};throw Error(hints[response.status]||`接口请求失败（${response.status}），请稍后重试。`);}
      const answer=await responseText(response,value=>{const feed=$('chatFeed'),follow=feed.scrollHeight-feed.scrollTop-feed.clientHeight<90;reply.body.textContent=value;if(follow)feed.scrollTop=feed.scrollHeight;});
      if(signal.aborted)throw new DOMException('Aborted','AbortError');
      history.push(user,{role:'assistant',content:answer});reply.card.dataset.state='complete';
      $('prompt').value='';attachments=[];renderAttachments();status('');
    }catch(error){
      const explanation=signal.aborted?(timedOut?'请求超时，请重试。':'已停止，消息和附件已保留。'):error instanceof TypeError?'无法连接接口，请检查地址、网络及跨域设置。':error.message;
      sent.card.dataset.state='error';reply.card.dataset.state='error';reply.label.textContent='未完成';
      reply.body.textContent=(reply.body.textContent==='正在等待回复…'?'':reply.body.textContent+'\n\n')+explanation;status(explanation,true);
    }finally{clearTimeout(timer);controller=null;controls();$('prompt').focus();}
  };
  $('exportChat').onclick=()=>{
    const text=[...document.querySelectorAll('.message')].map(card=>(card.dataset.role==='user'?'你':'助手')+'\n'+card.querySelector('.message-body').textContent+(card.querySelector('.message-files')?'\n附件：'+card.querySelector('.message-files').textContent:'')).join('\n\n');
    Ops.save(text,'AI-对话.txt');
  };
})();
