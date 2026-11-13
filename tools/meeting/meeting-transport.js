import {checkedInvite,cleanName,validChat,validMedia,randomID} from './meeting-core.js';
const errors={'room-full':'会议人数已满','peer-connect-failed':'有成员无法直连，可在设置中配置 TURN 中继后重新加入','relay-failed':'信令服务连接失败，请检查网络或切换连接方式','decrypt-failed':'邀请密钥不匹配，请重新复制完整链接','identity-failed':'浏览器无法创建参会身份','handshake-failed':'有成员连接验证失败'};
export class MeetingTransport extends EventTarget{
 constructor({invite,name,turn=[]}){super();this.invite=checkedInvite(invite);this.name=cleanName(name);this.turn=turn;this.members=new Map();this.local=new Map();this.remote=new Map();this.seen=new Set();this.rates=new Map();this.closed=false;}
 emit(type,detail){this.dispatchEvent(new CustomEvent(type,{detail}));}
 async connect(){
  const library=await import('../../vendor/meeting/'+this.invite.via+'.js');
  if(this.closed)return;
  this.library=library;
  const room=this.room=library.joinRoom({appId:'tools.manshii.asia/meeting/v1',identity:'none',password:this.invite.key,maxUsers:6,maxReceiveBytes:1024*1024,turnConfig:this.turn,relayConfig:{redundancy:4,warnOnRelayFailure:false}},this.invite.room);
  const profile=this.profileAction=room.makeAction('profile'),chat=this.chatAction=room.makeAction('chat'),stop=this.stopAction=room.makeAction('stop');
  const board=this.boardAction=room.makeAction('board-v1');
  board.onReceive(({byteLength})=>byteLength<=900*1024+1);
  board.onMessage((data,{peerId})=>{if(!this.closed&&this.members.has(peerId)&&data instanceof Uint8Array&&data.length<=900*1024+1)this.emit('board',{data,peerId});});
  for(const action of [profile,chat,stop])action.onReceive(({byteLength})=>byteLength<=12000);
  profile.onMessage((data,{peerId})=>{
   if(!this.members.has(peerId)||!data||typeof data.name!=='string'||data.name.length>80||!Array.isArray(data.streams)||data.streams.length>3||!data.streams.every(validMedia))return;
   this.members.set(peerId,{name:cleanName(data.name),mic:!!data.mic,camera:!!data.camera,sharing:!!data.sharing});
   const active=new Set(data.streams.map(e=>e.token));
   for(const [id,entry] of this.remote)if(entry.peerId===peerId&&!active.has(entry.token)){this.remote.delete(id);this.emit('streamremoved',entry);}
   this.emit('members');
  });
  chat.onMessage((data,{peerId})=>{
   if(!this.members.has(peerId)||!validChat(data))return;
   const now=Date.now(),rate=this.rates.get(peerId)||{at:now,count:0};if(now-rate.at>10000){rate.at=now;rate.count=0;}if(++rate.count>30)return;this.rates.set(peerId,rate);
   const id=peerId+':'+data.id;if(this.seen.has(id))return;this.seen.add(id);if(this.seen.size>2000)this.seen.delete(this.seen.values().next().value);
   this.emit('chat',{...data,name:this.members.get(peerId).name,peerId,local:false});
  });
  stop.onMessage((data,{peerId})=>{if(!validMedia(data))return;const id=peerId+':'+data.token,entry=this.remote.get(id);if(entry){this.remote.delete(id);this.emit('streamremoved',entry);}});
  room.onPeerJoin(({peerId})=>{
   if(this.closed)return;this.members.set(peerId,{name:'参会者',mic:false,camera:false,sharing:false});this.emit('members');
   this.emit('peerjoin',{peerId});
   this.sendProfile(peerId).catch(()=>{});
   for(const entry of this.local.values())if(entry.stream.getTracks().some(t=>t.readyState==='live'))room.addStream(entry.stream,{target:peerId,metadata:{kind:entry.kind,token:entry.token}}).catch(()=>this.emit('notice','向新成员发送媒体失败'));
  });
  room.onPeerLeave(({peerId})=>{this.members.delete(peerId);this.rates.delete(peerId);for(const [id,entry] of this.remote)if(entry.peerId===peerId){this.remote.delete(id);this.emit('streamremoved',entry);}this.emit('members');});
  room.onPeerStream((stream,{peerId,metadata})=>{
   if(this.closed||!validMedia(metadata)||!this.members.has(peerId))return;
   const same=[...this.remote.values()].find(e=>e.peerId===peerId&&e.kind===metadata.kind&&e.token!==metadata.token);
   if(same){this.remote.delete(same.id);this.emit('streamremoved',same);}
   const id=peerId+':'+metadata.token,entry={...metadata,id,peerId,stream,local:false};this.remote.set(id,entry);this.emit('stream',entry);
   for(const track of stream.getTracks())track.addEventListener('ended',()=>{if(stream.getTracks().every(t=>t.readyState==='ended')){this.remote.delete(id);this.emit('streamremoved',entry);}});
  });
  room.onError(error=>this.emit('notice',errors[error.code]||'有成员连接中断，正在等待重新连接'));
  let timer;
  try{await Promise.race([room.ready,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('连接超时，请检查网络或切换连接方式')),30000);})]);this.self=await room.getSelf();}
  catch(error){await this.leave();throw error;}finally{clearTimeout(timer);}
  if(this.closed)return;this.emit('ready');
 }
 sendProfile(target){return this.profileAction.send({name:this.name,mic:this.local.has('mic'),camera:this.local.has('camera'),sharing:this.local.has('screen'),streams:[...this.local.values()].map(({kind,token})=>({kind,token}))},{target});}
 async publish(entry){if(this.closed||!this.room)return;this.local.set(entry.kind,entry);await this.sendProfile();if(!this.closed&&this.local.get(entry.kind)===entry)await this.room.addStream(entry.stream,{metadata:{kind:entry.kind,token:entry.token}});}
 async unpublish(entry){if(this.local.get(entry.kind)===entry)this.local.delete(entry.kind);if(this.closed||!this.room)return;this.room.removeStream(entry.stream);await Promise.allSettled([this.stopAction.send({kind:entry.kind,token:entry.token}),this.sendProfile()]);}
 async sendChat(text){if(this.closed||!this.members.size)throw Error('等待其他成员加入后再发送');const data={id:randomID(),text:text.trim(),at:Date.now()};if(!validChat(data))throw Error('消息需为 1–2000 个字');await this.chatAction.send(data);return data;}
 async sendBoard(data,target){if(this.closed||!this.boardAction)return;if(!(data instanceof Uint8Array)||data.length>900*1024+1)throw Error('白板同步包超出限制');if(target&&!this.members.has(target))return;if(!target&&!this.members.size)return;await this.boardAction.send(data,{target});}
 diagnostics(){const sockets=this.library?.getRelaySockets()||{};return {strategy:this.invite.via,relays:Object.values(sockets).filter(s=>s.readyState===1).length,peers:this.members.size,turn:this.turn.length>0};}
 async leave(){if(this.closed)return;this.closed=true;this.local.clear();this.remote.clear();this.members.clear();await this.room?.leave();this.emit('closed');}
}
