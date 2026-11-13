const $=id=>document.getElementById(id);
const help=[['方向键','移动 1 px'],['Shift + 方向键','移动 10 px'],['Alt + 方向键','调整宽高'],['Ctrl + ↑ / ↓','上移 / 下移图层'],['Ctrl + D','复制素材'],['L','锁定 / 解锁素材'],['H','显示 / 隐藏素材'],['F','适配画布'],['Ctrl + Shift + C','居中素材'],['Alt + [ / ]','旋转 −1° / +1°'],['Page Up / Down','选择上一 / 下一素材'],['Delete','删除素材'],['Alt + 1–9','切换场景'],['Alt + Shift + N','新建场景'],['Alt + Shift + D','复制场景'],['Alt + Page Up / Down','切换上一 / 下一场景'],['F2','重命名素材'],['Ctrl + Shift + F2','重命名场景'],['Escape','取消拖拽 / 取消选择'],['?','快捷键']];
export function shortcutAction(event){
 if(event.isComposing||event.defaultPrevented)return null;const t=event.target;if(t?.closest?.('input,textarea,select,[contenteditable=true]')||t?.isContentEditable)return null;
 const key=event.key.toLowerCase(),ctrl=event.ctrlKey||event.metaKey,shift=event.shiftKey,alt=event.altKey;
 if(key==='?'&&!ctrl&&!alt)return{type:'help'};
 if(alt&&!ctrl&&shift&&key==='n')return{type:'newScene'};
 if(alt&&!ctrl&&shift&&key==='d')return{type:'duplicateScene'};
 if(!ctrl&&!alt&&!shift&&({l:1,h:1,f:1})[key])return{type:({l:'lock',h:'visible',f:'fit'})[key]};
 if(ctrl&&shift&&key==='f2')return{type:'renameScene'};
 if(alt&&!ctrl&&/^[1-9]$/.test(key))return{type:'scene',index:Number(key)-1};
 if(alt&&!ctrl&&['pageup','pagedown'].includes(key))return{type:'sceneStep',step:key==='pageup'?-1:1};
 if(ctrl&&!alt){if(!shift&&key==='d')return{type:'duplicate'};if(shift&&key==='c')return{type:'center'};if(['arrowup','arrowdown'].includes(key))return{type:'layer',step:key==='arrowup'?1:-1};}
 if(!ctrl&&alt&&['[',']'].includes(key))return{type:'rotate',step:(key==='['?-1:1)*(shift?15:1)};
 if(!ctrl&&['arrowleft','arrowright','arrowup','arrowdown'].includes(key))return{type:alt?'resize':'move',x:key==='arrowleft'?-1:key==='arrowright'?1:0,y:key==='arrowup'?-1:key==='arrowdown'?1:0,step:shift?10:1};
 if(!ctrl&&!alt){if(key==='delete')return{type:'delete'};if(key==='escape')return{type:'clear'};if(key==='f2')return{type:'rename'};if(['pageup','pagedown'].includes(key))return{type:'sourceStep',step:key==='pageup'?-1:1};}
 return null;
}
export function setupShortcuts({engine,getSelected,select,notice}){
 const button=document.createElement('button');button.id='openShortcuts';button.className='icon-button';button.type='button';button.textContent='?';button.title='快捷键';button.setAttribute('aria-label','快捷键');document.querySelector('.top-actions').append(button);
 const dialog=document.createElement('dialog');dialog.id='shortcutsDialog';dialog.innerHTML=`<div class="dialog-head"><h2>快捷键</h2><button class="icon-button" aria-label="关闭快捷键">×</button></div><div class="shortcut-list">${help.map(([keys,label])=>`<div><span>${label}</span><kbd>${keys}</kbd></div>`).join('')}</div>`;document.body.append(dialog);button.onclick=()=>dialog.showModal();dialog.querySelector('button').onclick=()=>dialog.close();
 const execute=async action=>{
  const source=getSelected();
  if(action.type==='help'){dialog.showModal();return;}
  if(action.type==='newScene'){select(null);engine.createScene('场景 '+(engine.project.scenes.length+1));return;}
  if(action.type==='duplicateScene'){await engine.duplicateScene();select(null);return;}
  if(action.type==='renameScene'){const name=prompt('场景名称',engine.activeScene.name);if(name?.trim())engine.renameScene(engine.activeScene.id,name.trim());return;}
  if(action.type==='scene'||action.type==='sceneStep'){const scenes=engine.project.scenes,index=action.type==='scene'?action.index:(scenes.findIndex(s=>s.id===engine.activeScene.id)+action.step+scenes.length)%scenes.length;if(scenes[index]){select(null);engine.switchScene(scenes[index].id);}return;}
  if(action.type==='sourceStep'){const sources=[...engine.activeScene.sources].reverse(),index=sources.findIndex(s=>s.id===source?.id),next=index<0?0:(index+action.step+sources.length)%sources.length;if(sources[next])select(sources[next].id);return;}
  if(action.type==='clear'){select(null);return;}
  if(!source)return;
  if(action.type==='lock'){engine.updateSource(source.id,{locked:!source.locked});return;}
  if(action.type==='visible'){engine.updateSource(source.id,{visible:!source.visible});return;}
  if(action.type==='duplicate'){select((await engine.duplicateSource(source.id)).id);return;}
  if(action.type==='rename'){const name=prompt('素材名称',source.name);if(name?.trim())engine.updateSource(source.id,{name:name.trim()});return;}
  if(source.locked){notice('素材已锁定');return;}
  if(action.type==='delete'){select(null);engine.deleteSource(source.id);}
  else if(action.type==='move')engine.updateSource(source.id,{x:source.x+action.x*action.step,y:source.y+action.y*action.step});
  else if(action.type==='resize')engine.updateSource(source.id,{width:source.width+action.x*action.step,height:source.height+action.y*action.step});
  else if(action.type==='rotate')engine.updateSource(source.id,{rotation:source.rotation+action.step});
  else if(action.type==='layer')engine.moveSource(source.id,action.step);
  else if(action.type==='fit')engine.updateSource(source.id,{x:0,y:0,width:engine.project.width,height:engine.project.height,rotation:0});
  else if(action.type==='center')engine.updateSource(source.id,{x:(engine.project.width-source.width)/2,y:(engine.project.height-source.height)/2});
 };
 document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]')||event.target.closest?.('[data-handle]'))return;const action=shortcutAction(event);if(!action)return;event.preventDefault();if(event.repeat&&!['move','resize','rotate'].includes(action.type))return;execute(action).catch(error=>notice(error.message||'操作失败',true));});
}
