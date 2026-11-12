import {createInvite,parseInvite,inviteURL,inviteCode,cleanName,turnConfig} from './meeting-core.js';
import {MeetingMedia,mediaError} from './meeting-media.js';
import {MeetingTransport} from './meeting-transport.js';
const $=id=>document.getElementById(id),icon=name=>ToolboxIcons.svg(name);
document.querySelectorAll('[data-icon]').forEach(el=>el.replaceWith(icon(el.dataset.icon)));
const app=window.meetingApp={transport:null,invite:null,turn:[],busy:false,leaving:false,joinedAt:0,tiles:new Map(),audio:new Map(),page:0,pinned:null,presentation:false,unread:0};
const media=app.media=new MeetingMedia((entry,active)=>{
 if(app.transport&&!app.transport.closed){const task=active?app.transport.publish(entry):app.transport.unpublish(entry);task.catch(()=>notice('媒体发送失败，请重新启用设备'));}
 if(active)addEntry({...entry,id:'self:'+entry.token,local:true,peerId:'self'});else removeEntry('self:'+entry.token);
 syncMedia();
});
function notice(text,tone=''){ $('meetingNotice').textContent=text;$('meetingNotice').dataset.tone=tone;}
function setStatus(text,state=''){ $('connectionStatus').textContent=text;$('connectionStatus').dataset.state=state;}
function showError(text){$('lobbyStatus').textContent=text;$('lobbyStatus').dataset.tone='error';}
function currentName(){return cleanName($('displayName').value);}
function replaceIcon(button,name){button.querySelector('svg')?.replaceWith(icon(name));}
function syncMedia(){
 for(const [kind,id,preview] of [['mic','toggleMic','previewMic'],['camera','toggleCamera','previewCamera'],['screen','shareScreen',null]]){
  const active=media.entries.has(kind),symbol=kind==='mic'?(active?'mic':'mic-off'):kind==='camera'?(active?'video':'video-off'):(active?'screen-share-off':'screen-share');
  for(const button of [$(id),preview&&$(preview)].filter(Boolean)){button.setAttribute('aria-pressed',String(active));replaceIcon(button,symbol);}
  if(preview)$(preview).querySelector('span').textContent=(kind==='mic'?'麦克风':'摄像头')+(active?'开启':'关闭');
 }
 const camera=media.entries.get('camera');$('localPreview').hidden=!camera;$('previewPlaceholder').hidden=!!camera;$('localPreview').srcObject=camera?.stream||null;
 $('localPreview').play().catch(()=>{});renderTiles();renderPeople();
}
async function toggle(kind){
 if(media.pending.has(kind))return;
 try{
  if(media.entries.has(kind)){media.stop(kind);if(kind==='screen')notice('已停止共享屏幕');}
  else{const entry=await media.start(kind,kind==='mic'?$('micDevice').value:$('cameraDevice').value);if(entry&&kind==='screen')notice(entry.audio?'正在共享屏幕和声音':'正在共享屏幕，未捕获声音。共享标签页时可勾选分享声音。');}
 }catch(error){const text=error.message?.includes('HTTPS')?error.message:mediaError(error);if($('meetingRoom').hidden)showError(text);else notice(text,'error');}
}
function updateName(){const name=currentName();$('previewName').textContent=name;$('previewAvatar').textContent=name.slice(0,1);}
$('displayName').addEventListener('input',updateName);
try{$('displayName').value=localStorage.getItem('meeting:name')||'';}catch{}
updateName();
function useInvite(invite){app.invite=invite;$('relayStrategy').value=invite.via;$('joinMeeting').hidden=false;$('createMeeting').hidden=true;$('lobbyTitle').textContent='加入会议';$('inviteInput').value=inviteCode(invite);}
if(location.hash){try{useInvite(parseInvite(location.href));}catch(error){showError(error.message);}}
function clearChat(){$('chatMessages').replaceChildren();const empty=document.createElement('p');empty.id='chatEmpty';empty.className='chat-empty';empty.textContent='消息仅在本次会议中显示';$('chatMessages').append(empty);$('chatStatus').textContent='';app.unread=0;$('unreadDot').hidden=true;}
async function enter(invite){
 if(app.busy)return;if(!isSecureContext||!window.RTCPeerConnection){showError('请使用支持 WebRTC 的 HTTPS 浏览器');return;}
 app.busy=true;$('createMeeting').disabled=$('joinMeeting').disabled=true;$('lobbyStatus').textContent='正在连接会议…';setStatus('正在连接');
 const transport=new MeetingTransport({invite,name:currentName(),turn:app.turn});app.transport=transport;app.invite=invite;
 try{
  try{localStorage.setItem('meeting:name',currentName());}catch{}
  transport.addEventListener('members',()=>{renderPeople();renderTiles();updateConnection();});
  transport.addEventListener('stream',e=>addEntry(e.detail));
  transport.addEventListener('streamremoved',e=>removeEntry(e.detail.id));
  transport.addEventListener('notice',e=>notice(e.detail,'error'));
  transport.addEventListener('chat',e=>{appendMessage(e.detail,'已接收');if($('conversationPanel').hidden||$('chatContent').hidden){app.unread++;$('unreadDot').hidden=false;}});
  await transport.connect();if(app.transport!==transport||transport.closed)return;
  history.replaceState(null,'',inviteURL(invite));app.joinedAt=Date.now();app.page=0;app.pinned=null;app.presentation=false;clearChat();
  $('meetingLobby').hidden=true;$('meetingRoom').hidden=false;$('lobbyStatus').textContent='';$('roomTitle').textContent='会议 · '+invite.room.slice(0,6);$('conversationPanel').hidden=true;
  const published=await Promise.allSettled([...media.entries.values()].map(entry=>transport.publish(entry)));
  renderPeople();renderTiles();updateConnection();
  notice(published.some(r=>r.status==='rejected')?'媒体发送失败，可重新开启设备；文字会议仍可使用':'');
 }catch(error){await transport.leave();if(app.transport===transport)app.transport=null;setStatus('连接失败','error');showError(error.message||'无法连接会议，请稍后重试');}
 finally{app.busy=false;$('createMeeting').disabled=$('joinMeeting').disabled=false;}
}
function updateConnection(){const t=app.transport;if(!t||t.closed)return;const n=t.members.size;$('participantCount').textContent=(n+1)+' 人';$('waitingHint').hidden=n>0;const d=t.diagnostics(),failed=!d.relays&&!n&&Date.now()-app.joinedAt>15000;setStatus(n?'已连接':d.relays?'等待成员':failed?'信令不可用':'正在连接',n||d.relays?'connected':failed?'error':'');}
$('createMeeting').onclick=()=>{const invite=createInvite();invite.via=$('relayStrategy').value;enter(invite);};
$('joinMeeting').onclick=()=>app.invite&&enter(app.invite);
$('joinForm').onsubmit=e=>{e.preventDefault();try{useInvite(parseInvite($('inviteInput').value));enter(app.invite);}catch(error){showError(error.message);}};
for(const [kind,id] of [['mic','toggleMic'],['mic','previewMic'],['camera','toggleCamera'],['camera','previewCamera'],['screen','shareScreen']])$(id).onclick=()=>toggle(kind);
if(!navigator.mediaDevices?.getDisplayMedia){$('shareScreen').disabled=true;$('shareScreen').title='当前浏览器不支持共享屏幕，可接收其他人的共享';}
function participantName(entry){return entry.local?currentName()+'（我）':app.transport?.members.get(entry.peerId)?.name||'参会者';}
function playAudio(audio){audio.play().catch(()=>{$('enableSound').hidden=false;});}
function addEntry(entry){
 // Sound remains independent of the paginated/hidden video grid. A shared
 // tab's audio must keep playing while its picture is on another page.
 if(!entry.local&&entry.stream.getAudioTracks().length){const audio=app.audio.get(entry.id)||document.createElement('audio');audio.autoplay=true;audio.srcObject=entry.stream;if(!audio.isConnected)$('remoteAudio').append(audio);app.audio.set(entry.id,audio);playAudio(audio);}
 if(entry.kind==='mic'){renderPeople();return;}
 const existing=app.tiles.get(entry.id);if(existing){existing.entry=entry;existing.video.srcObject=entry.stream;return;}
 const el=document.createElement('article');el.className='media-tile';el.dataset.kind=entry.kind;el.dataset.local=String(entry.local);el.dataset.stream=entry.id;
 const video=document.createElement('video');video.autoplay=true;video.playsInline=true;video.muted=true;video.srcObject=entry.stream;el.append(video);
 const footer=document.createElement('div');footer.className='tile-footer';const label=document.createElement('span'),name=document.createElement('span');name.className='tile-name';label.append(icon(entry.kind==='screen'?'screen-share':'video'),name);footer.append(label);
 const actions=document.createElement('div');actions.className='tile-actions';const pin=document.createElement('button');pin.className='icon-button';pin.setAttribute('aria-label','固定此画面');pin.title='固定画面';pin.append(icon('pin'));pin.onclick=()=>{app.pinned=app.pinned===entry.id?null:entry.id;app.page=0;renderTiles();};const full=document.createElement('button');full.className='icon-button';full.setAttribute('aria-label','全屏查看');full.title='全屏';full.append(icon('maximize'));full.onclick=()=>{const promise=el.requestFullscreen?.();promise?.catch(()=>notice('浏览器无法进入全屏'));};actions.append(pin,full);footer.append(actions);el.append(footer);app.tiles.set(entry.id,{el,video,entry,name,pin});
 video.play().catch(()=>{if(!entry.local)$('enableSound').hidden=false;});renderTiles();
}
function removeEntry(id){const tile=app.tiles.get(id);if(tile){tile.video.pause();tile.video.srcObject=null;tile.el.remove();app.tiles.delete(id);}const audio=app.audio.get(id);if(audio){audio.pause();audio.srcObject=null;audio.remove();app.audio.delete(id);}if(app.pinned===id)app.pinned=null;renderTiles();}
function avatarTile(peerId,name,local,mic){
 const el=document.createElement('article');el.className='media-tile';el.dataset.kind='participant';el.dataset.peer=peerId;const avatar=document.createElement('span');avatar.className='tile-avatar';avatar.textContent=name.slice(0,1);const footer=document.createElement('div');footer.className='tile-footer';const label=document.createElement('span'),text=document.createElement('span');text.className='tile-name';text.textContent=name+(local?'（我）':'');label.append(icon(mic?'mic':'mic-off'),text);footer.append(label);el.append(avatar,footer);return el;
}
function renderTiles(){
 if(!$('videoGrid'))return;
 const tiles=[...app.tiles.values()];for(const tile of tiles){tile.name.textContent=participantName(tile.entry)+(tile.entry.kind==='screen'?' · 屏幕':'');tile.pin.setAttribute('aria-pressed',String(tile.entry.id===app.pinned));}
 tiles.sort((a,b)=>(a.entry.id===app.pinned?-1:b.entry.id===app.pinned?1:0)||(a.entry.kind==='screen'?-1:0)-(b.entry.kind==='screen'?-1:0));
 const all=tiles.map(t=>t.el),participants=[['self',{name:currentName(),mic:media.entries.has('mic')}],...[...(app.transport?.members||[])]];
 for(const [id,p] of participants)if(!tiles.some(t=>t.entry.peerId===id&&t.entry.kind==='camera'))all.push(avatarTile(id,p.name,id==='self',p.mic));
 const present=(!!app.pinned||app.presentation)&&tiles.length>0,size=present?4:6,total=Math.max(1,present?Math.ceil((all.length-1)/(size-1)):Math.ceil(all.length/size));app.page=Math.max(0,Math.min(app.page,total-1));
 const selected=present?[all[0],...all.slice(1+app.page*(size-1),1+(app.page+1)*(size-1))]:all.slice(app.page*size,(app.page+1)*size);
 const grid=$('videoGrid'),wanted=new Set(selected);for(const child of [...grid.children])if(!wanted.has(child))child.remove();selected.forEach((el,i)=>{if(grid.children[i]!==el)grid.insertBefore(el,grid.children[i]||null);});
 grid.dataset.count=String(selected.length);grid.dataset.present=String(present);$('stagePagination').hidden=total<=1;$('tilePage').textContent=(app.page+1)+' / '+total;$('prevTile').disabled=app.page===0;$('nextTile').disabled=app.page===total-1;
 for(const tile of tiles)if(tile.el.isConnected&&tile.video.paused)tile.video.play().catch(()=>{if(!tile.entry.local)$('enableSound').hidden=false;});
}
function renderPeople(){const list=$('peopleList');list.replaceChildren();const people=[{name:currentName(),local:true,mic:media.entries.has('mic'),sharing:media.entries.has('screen')},...[...(app.transport?.members.values()||[])]];for(const p of people){const li=document.createElement('li'),avatar=document.createElement('span'),name=document.createElement('span'),state=document.createElement('span');avatar.className='person-avatar';avatar.textContent=p.name.slice(0,1);name.className='person-name';name.textContent=p.name+(p.local?'（我）':'');state.className='person-state';state.textContent=p.sharing?'共享中':p.mic?'麦克风开启':'已静音';li.append(avatar,name,state);list.append(li);}}
$('toggleLayout').onclick=()=>{app.presentation=!app.presentation;app.page=0;renderTiles();};$('prevTile').onclick=()=>{app.page--;renderTiles();};$('nextTile').onclick=()=>{app.page++;renderTiles();};
function panel(type){$('conversationPanel').hidden=false;const chat=type==='chat';$('chatContent').hidden=!chat;$('peopleContent').hidden=chat;$('chatTab').setAttribute('aria-selected',String(chat));$('peopleTab').setAttribute('aria-selected',String(!chat));$('openChat').setAttribute('aria-pressed',String(chat));if(chat){app.unread=0;$('unreadDot').hidden=true;$('chatMessages').scrollTop=$('chatMessages').scrollHeight;}}
$('openChat').onclick=()=>{$('conversationPanel').hidden||$('chatContent').hidden?panel('chat'):closePanel();};$('openPeople').onclick=()=>panel('people');$('chatTab').onclick=()=>panel('chat');$('peopleTab').onclick=()=>panel('people');
function closePanel(){$('conversationPanel').hidden=true;$('openChat').setAttribute('aria-pressed','false');}$('closePanel').onclick=closePanel;
function appendMessage(message,status){$('chatEmpty')?.remove();const row=document.createElement('div');row.className='chat-message';row.dataset.local=String(message.local);const head=document.createElement('small');head.textContent=message.name+' · '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});const text=document.createElement('p');text.textContent=message.text;const delivery=document.createElement('span');delivery.className='delivery';delivery.textContent=status;row.append(head,text,delivery);$('chatMessages').append(row);while($('chatMessages').children.length>300)$('chatMessages').firstElementChild.remove();$('chatMessages').scrollTop=$('chatMessages').scrollHeight;return delivery;}
let lastMessage=0;
$('chatForm').onsubmit=async e=>{e.preventDefault();const text=$('chatText').value.trim();if(!text)return;if(Date.now()-lastMessage<700){$('chatStatus').textContent='发送太快，请稍候';return;}lastMessage=Date.now();const t=app.transport;if(!t||t.closed)return;$('sendChat').disabled=true;const delivery=appendMessage({text,name:currentName(),local:true},'发送中');try{await t.sendChat(text);delivery.textContent='已发送';$('chatText').value='';$('chatStatus').textContent='';}catch(error){delivery.textContent='未发送';$('chatStatus').textContent=error.message;}finally{$('sendChat').disabled=false;}};
$('chatText').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('chatForm').requestSubmit();}});
async function copyInvite(){if(!app.invite)return;try{await navigator.clipboard.writeText(inviteURL(app.invite));notice('邀请链接已复制');}catch{notice('无法读取剪贴板，请复制地址栏中的完整链接');}}
$('copyInvite').onclick=$('inviteFromEmpty').onclick=copyInvite;
$('enableSound').onclick=async()=>{const targets=[...app.audio.values(),...[...app.tiles.values()].filter(t=>!t.entry.local).map(t=>t.video)];const results=await Promise.allSettled(targets.map(a=>a.play()));$('enableSound').hidden=results.every(r=>r.status==='fulfilled');};
async function leave(){if(app.leaving)return;app.leaving=true;const t=app.transport;app.transport=null;media.stopAll();for(const id of [...app.tiles.keys(),...app.audio.keys()])removeEntry(id);await t?.leave();app.joinedAt=0;$('meetingRoom').hidden=true;$('meetingLobby').hidden=false;setStatus('已离开');notice('已离开会议，麦克风和共享已关闭');if(app.invite)useInvite(app.invite);app.leaving=false;}
$('leaveMeeting').onclick=leave;
window.addEventListener('pagehide',()=>{media.stopAll();app.transport?.leave().catch(()=>{});});
for(const el of document.querySelectorAll('[data-close]'))el.onclick=()=>el.closest('dialog').close();
$('openSettings').onclick=async()=>{
 $('settingsStatus').textContent='';$('relayStrategy').disabled=!!app.transport&&!app.transport.closed;$('strategyNote').textContent=$('relayStrategy').disabled?'连接方式在离会后可修改。':'更换后需重新发送邀请链接。';
 for(const [id,kind] of [['micDevice','audioinput'],['cameraDevice','videoinput']]){const value=$(id).value;$(id).replaceChildren(new Option('默认设备',''));for(const d of await media.devices())if(d.kind===kind)$(id).append(new Option(d.label||'设备 '+($(id).options.length),d.deviceId));$(id).value=value;}
 $('settingsDialog').showModal();
};
$('settingsForm').onsubmit=e=>{e.preventDefault();try{app.turn=turnConfig($('turnURL').value,$('turnUser').value,$('turnPassword').value);if(!app.transport||app.transport.closed){if(app.invite){app.invite={...app.invite,via:$('relayStrategy').value};useInvite(app.invite);history.replaceState(null,'',inviteURL(app.invite));}}$('settingsDialog').close();if(app.transport)notice('设备选择下次启用时生效，中继设置需重新入会');}catch(error){$('settingsStatus').textContent=error.message;}};
function diagnostic(){const d=app.transport?.diagnostics();const rows=[['连接方式',d?d.strategy.toUpperCase():$('relayStrategy').value.toUpperCase()],['信令连接',d?d.relays+' 个':'未入会'],['参会人数',d?d.peers+1+' 人':'—'],['TURN 中继',d?.turn?'已配置':'未配置'],['屏幕声音',media.entries.get('screen')?(media.entries.get('screen').audio?'已捕获':'未捕获'):'未共享']];$('diagnosticsList').replaceChildren();for(const [name,value]of rows){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;row.append(dt,dd);$('diagnosticsList').append(row);}}
$('openDiagnostics').onclick=()=>{diagnostic();$('diagnosticsDialog').showModal();};
window.addEventListener('offline',()=>{if(app.transport)notice('网络已断开，正在等待恢复','error');});window.addEventListener('online',()=>{if(app.transport)notice('网络已恢复，正在重新连接');});
setInterval(()=>{if(!app.joinedAt)return;const elapsed=Math.floor((Date.now()-app.joinedAt)/1000);$('meetingTime').textContent=String(Math.floor(elapsed/60)).padStart(2,'0')+':'+String(elapsed%60).padStart(2,'0');updateConnection();if($('diagnosticsDialog').open)diagnostic();},1000);
