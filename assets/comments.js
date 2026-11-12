(()=>{'use strict';
 const $=id=>document.getElementById(id),dialog=$('commentsDrawer');if(!dialog)return;
 const form=$('commentsForm'),name=$('commentName'),body=$('commentBody'),status=$('commentsStatus'),list=$('commentsList'),more=$('commentsMore');
 const draftKey='pocket-comments-draft-v1';let endpoint,loading=false,sending=false,next=null,loaded=false,requestId=null,lastPayload='',seen=new Set(),revision=0;
 const read=(key)=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}},saveDraft=()=>{try{localStorage.setItem(draftKey,JSON.stringify({name:name.value,body:body.value,id:requestId,payload:lastPayload}));}catch{}};
 const saved=read(draftKey);if(saved&&typeof saved.name==='string'&&typeof saved.body==='string'){name.value=saved.name.slice(0,32);body.value=saved.body.slice(0,2000);requestId=saved.id;lastPayload=saved.payload;}
 function message(text,error=false){status.textContent=text;status.dataset.error=String(error);}
 function updateCount(){$('commentLength').textContent=Array.from(body.value).length+' / 2000';saveDraft();}
 name.addEventListener('input',saveDraft);body.addEventListener('input',updateCount);updateCount();
 async function api(path,options={}){
  if(!endpoint){const response=await fetch('assets/usage-config.json',{credentials:'omit'});if(!response.ok)throw Error('评论服务暂不可用，请稍后重试');const config=await response.json(),url=new URL(config.endpoint);if(url.protocol!=='https:'&&url.hostname!=='127.0.0.1')throw Error('评论服务地址无效');endpoint=url.origin;}
  const response=await fetch(endpoint+path,{...options,credentials:'omit',signal:AbortSignal.timeout(15000)});let data;try{data=await response.json();}catch{throw Error('评论服务暂不可用，请稍后重试');}
  if(!response.ok)throw Error(response.status===429?'发表较频繁，请稍后再试':response.status===400?'请检查昵称和评论内容':response.status===409?'评论编号冲突，请修改内容后重试':'评论服务暂不可用，请稍后重试');return data;
 }
 function valid(item){return item&&typeof item.id==='string'&&typeof item.name==='string'&&typeof item.body==='string'&&item.name.length<=128&&item.body.length<=8000&&Number.isSafeInteger(item.created);}
 function card(item){const li=document.createElement('li');li.className='comment-card';const meta=document.createElement('div');meta.className='comment-meta';const author=document.createElement('strong');author.textContent=item.name;const time=document.createElement('time');const date=new Date(item.created*1000);time.dateTime=date.toISOString();time.textContent=new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(date);time.title=date.toLocaleString('zh-CN');meta.append(author,time);const text=document.createElement('p');text.className='comment-body';text.textContent=item.body;li.append(meta,text);return li;}
 async function load(reset=false){
  if(loading)return;loading=true;const started=revision;more.disabled=true;$('commentsRefresh').disabled=true;message('正在加载…');
  try{const data=await api('/comments'+(!reset&&next?'?before='+next:''));if(data.schema!==1||!Array.isArray(data.comments)||!data.comments.every(valid)||data.next!==null&&(!Number.isSafeInteger(data.next)||data.next<=0))throw Error('评论数据格式无效');
   if(started!==revision)return;
   if(reset){list.replaceChildren();seen=new Set();}for(const item of data.comments)if(!seen.has(item.id)){seen.add(item.id);list.append(card(item));}next=data.next;loaded=true;more.hidden=!next;$('commentsEmpty').hidden=!!seen.size;message('');
  }catch(error){message(error.message||'加载失败，请重试',true);}finally{loading=false;more.disabled=false;$('commentsRefresh').disabled=false;if(started!==revision)load(true);}
 }
 $('commentsOpen').onclick=()=>{dialog.showModal();$('commentsOpen').setAttribute('aria-expanded','true');if(!loaded)load(true);};
 $('commentsClose').onclick=()=>dialog.close();dialog.addEventListener('close',()=>$('commentsOpen').setAttribute('aria-expanded','false'));
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right)dialog.close();}});
 $('commentsRefresh').onclick=()=>load(true);more.onclick=()=>load(false);
 form.onsubmit=async event=>{
  event.preventDefault();if(sending)return;const text=body.value.replace(/\r\n?/g,'\n').trim(),author=name.value.trim();
  if(!author||Array.from(author).length>32||/[\x00-\x1f\x7f]/.test(author)||Array.from(text).length<2||Array.from(text).length>2000){message('昵称 1–32 字，评论 2–2000 字',true);return;}
  const payload=JSON.stringify({name:author,body:text});if(payload!==lastPayload||!requestId){requestId=crypto.randomUUID();lastPayload=payload;}saveDraft();
  const originalBody=body.value,originalName=name.value;sending=true;$('commentSubmit').disabled=true;message('正在发表…');
  try{const data=await api('/comments',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({id:requestId,name:author,body:text,website:$('commentWebsite').value})});if(!data.accepted||!valid(data.comment))throw Error('评论未确认保存，请重试');
   revision++;if(!seen.has(data.comment.id)){seen.add(data.comment.id);list.prepend(card(data.comment));}$('commentsEmpty').hidden=true;if(body.value===originalBody&&name.value===originalName){body.value='';requestId=null;lastPayload='';updateCount();}message('已发表');
  }catch(error){message(error.message||'发表失败，内容已保留，可重试',true);}finally{sending=false;$('commentSubmit').disabled=false;}
 };
})();
