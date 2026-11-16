const STORE='pocket-countdown-overlay-v1';
const CHANNEL='pocket-countdown-overlay-channel';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
const uid=type=>`${type}-${Math.random().toString(36).slice(2,7)}`;
const icon=(name,size=16)=>{
 const paths={
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9 2h6"/>',
  play:'<path d="m8 5 11 7-11 7Z"/>',pause:'<path d="M9 5v14M15 5v14"/>',reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  pip:'<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="12" width="7" height="5" rx="1"/>',
  popout:'<path d="M15 3h6v6M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
  up:'<path d="m18 15-6-6-6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  alignLeft:'<path d="M4 3v18M8 7h10M8 12h7M8 17h12"/>',alignCenter:'<path d="M12 3v18M6 7h12M8 12h8M4 17h16"/>',alignRight:'<path d="M20 3v18M6 7h10M9 12h7M4 17h12"/>',
  type:'<path d="M5 5h14M12 5v14M7 19h10"/>',bar:'<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M3 12h13"/>',
 };
 return `<svg viewBox="0 0 24 24" aria-hidden="true" width="${size}" height="${size}">${paths[name]||''}</svg>`;
};
const defaultElements=()=>[
 {id:'time-main',type:'time',label:'倒计时',visible:true,x:5,y:9,w:90,h:56,fontSize:104,color:'#ffffff',bold:true,align:'center',alignV:'center',text:'{time}',showHours:false},
 {id:'text-caption',type:'text',label:'阶段名称',visible:true,x:24,y:67,w:52,h:13,fontSize:20,color:'#dbe4ef',bold:false,align:'center',alignV:'center',text:'{stage}'},
 {id:'transition-main',type:'transition',label:'衔接文字',visible:true,x:8,y:27,w:84,h:42,fontSize:42,color:'#ffffff',bold:true,align:'center',alignV:'center',text:'{transition}'},
 {id:'progress-main',type:'progress',label:'进度条',visible:true,x:7,y:88,w:86,h:4,color:'#6ee7b7',trackColor:'#ffffff',align:'center',alignV:'center',fontSize:12,bold:false},
];
const freshSettings=()=>({durationMs:25*60*1000,remainingMs:25*60*1000,status:'idle',phase:'timer',activeStageIndex:0,endAt:null,sound:true,opacity:100,stages:[{id:'stage-1',name:'专注时间',durationMs:25*60*1000,transitionText:'下一阶段即将开始',transitionMs:3000}],canvas:{width:760,height:220,transparent:true,background:'#111827',radius:24},elements:defaultElements()});
const validColor=value=>/^#[0-9a-f]{6}$/i.test(String(value))?value:'#ffffff';
function normalizeElement(element,index){
 const type=['time','text','transition','progress'].includes(element?.type)?element.type:'text';
 return{id:String(element?.id||uid(type)),type,label:String(element?.label||({time:'倒计时',text:'文字',transition:'衔接文字',progress:'进度条'}[type])),visible:element?.visible!==false,x:clamp(element?.x??10,0,99),y:clamp(element?.y??10,0,99),w:clamp(element?.w??40,2,100),h:clamp(element?.h??16,2,100),fontSize:clamp(element?.fontSize??24,8,240),color:validColor(element?.color||'#ffffff'),bold:element?.bold===true,align:['left','center','right'].includes(element?.align)?element.align:'center',alignV:['top','center','bottom'].includes(element?.alignV)?element.alignV:'center',text:String(element?.text??(type==='text'?'自定义文字':'{time}')),showHours:element?.showHours===true,trackColor:validColor(element?.trackColor||'#ffffff')};
}
function loadSettings(){
 try{
  const stored=JSON.parse(localStorage.getItem(STORE)||'null'),base=freshSettings();if(!stored)return base;
  const merged={...base,...stored,canvas:{...base.canvas,...stored.canvas},elements:(Array.isArray(stored.elements)&&stored.elements.length?stored.elements:base.elements).map(normalizeElement)};
  if(!Array.isArray(merged.stages)||!merged.stages.length){const seconds=Number(stored.durationMs||base.durationMs);merged.stages=[{id:'stage-1',name:'专注时间',durationMs:clamp(seconds,1000,359999000),transitionText:'下一阶段即将开始',transitionMs:3000}];}
  merged.stages=merged.stages.slice(0,20).map((stage,index)=>({id:String(stage?.id||`stage-${index+1}`),name:String(stage?.name||`阶段 ${index+1}`),durationMs:clamp(stage?.durationMs??1500000,1000,359999000),transitionText:String(stage?.transitionText??'下一阶段即将开始'),transitionMs:clamp(stage?.transitionMs??0,0,600000)}));
  merged.activeStageIndex=clamp(merged.activeStageIndex,0,merged.stages.length-1);merged.phase=merged.phase==='transition'?'transition':'timer';
  if(merged.status==='running'){
   if(merged.endAt){const left=merged.endAt-Date.now();if(left>0)merged.remainingMs=left;else{merged.status='idle';merged.activeStageIndex=0;merged.phase='timer';merged.remainingMs=merged.stages[0].durationMs;merged.endAt=null;}}else{merged.status='paused';}
  }
  if(merged.status==='idle'||merged.status==='finished'){merged.activeStageIndex=0;merged.phase='timer';merged.remainingMs=merged.stages[0].durationMs;merged.endAt=null;}
  return merged;
 }catch{return freshSettings();}
}

function formatTime(ms,showHours=false){
 const total=Math.max(0,Math.ceil(Number(ms||0)/1000)),hours=Math.floor(total/3600),minutes=Math.floor(total%3600/60),seconds=total%60;
 return showHours||hours>0?`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`:`${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}
function formatEditable(ms){const total=Math.max(0,Math.round(ms/1000)),h=Math.floor(total/3600),m=Math.floor(total%3600/60),s=total%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function parseDuration(value){
 const raw=String(value||'').trim();if(!raw)return NaN;const parts=raw.split(':').map(Number);if(parts.some(value=>!Number.isFinite(value)))return NaN;let seconds=0;
 if(parts.length===1)seconds=parts[0]*60;else if(parts.length===2)seconds=parts[0]*60+parts[1];else if(parts.length===3)seconds=parts[0]*3600+parts[1]*60+parts[2];else return NaN;
 return seconds<1||seconds>359999?NaN:Math.round(seconds*1000);
}
const statusText=status=>({idle:'待开始',running:'进行中',paused:'已暂停',finished:'已结束'}[status]||'待开始');
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let settings=loadSettings();
let selectedId=settings.elements.find(element=>element.type==='time')?.id||settings.elements[0]?.id||null;
let selectedStageId=settings.stages[settings.activeStageIndex]?.id||settings.stages[0]?.id;
let currentTab='time',mobilePane='settings',previewMode='edit',pipWindow=null,fallbackWindow=null,saveTimer=null,toastTimer=null,lastRenderedSecond=-1;
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel(CHANNEL):null;
const currentStage=(state=settings)=>state.stages[clamp(state.activeStageIndex,0,state.stages.length-1)]||state.stages[0];
const stageDuration=(state=settings)=>state.phase==='transition'?Number(currentStage(state)?.transitionMs||0):Number(currentStage(state)?.durationMs||0);
const currentRemaining=(now=Date.now())=>settings.status==='running'?Math.max(0,(settings.endAt||now)-now):Math.max(0,Number(settings.remainingMs)||0);
const progressRatio=()=>clamp(currentRemaining()/Math.max(1,stageDuration()),0,1);
const nextStage=()=>settings.stages[Math.min(settings.stages.length-1,settings.activeStageIndex+1)];
function templateValue(template){
 const stage=currentStage(),next=nextStage();
 return String(template||'').replace(/\{(time|remaining|duration|status|stage|stageIndex|stageCount|nextStage|phase|transition)\}/g,(_,key)=>({time:formatTime(currentRemaining()),remaining:formatTime(currentRemaining()),duration:formatTime(stageDuration()),status:statusText(settings.status),stage:stage?.name||'',stageIndex:String(settings.activeStageIndex+1),stageCount:String(settings.stages.length),nextStage:next?.name||'',phase:settings.phase==='transition'?'衔接':'计时',transition:stage?.transitionText||'阶段完成'}[key]));
}
function saveSoon(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(STORE,JSON.stringify(settings));}catch{showToast('浏览器存储空间不足');}},180);}
function snapshot(){return{...settings,remainingMs:currentRemaining(),stages:settings.stages.map(stage=>({...stage})),elements:settings.elements.map(element=>({...element})),canvas:{...settings.canvas}};}
function publish(){const value=snapshot();channel?.postMessage({type:'state',state:value});syncOverlay(value);}
function showToast(text){let node=$('#toast');if(!node){node=document.createElement('div');node.id='toast';node.className='toast';document.body.append(node);}node.textContent=text;requestAnimationFrame(()=>node.classList.add('show'));clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),1800);}
function beep(){
 if(!settings.sound)return;
 try{const context=new(window.AudioContext||window.webkitAudioContext)(),now=context.currentTime;[0,.2,.42].forEach((offset,index)=>{const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=660+index*120;gain.gain.setValueAtTime(.0001,now+offset);gain.gain.exponentialRampToValueAtTime(.18,now+offset+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+offset+.15);oscillator.connect(gain).connect(context.destination);oscillator.start(now+offset);oscillator.stop(now+offset+.17);});setTimeout(()=>context.close(),900);}catch{}
}

const OVERLAY_CSS=`
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent!important;color-scheme:dark}
#countdown-overlay-root{position:relative;width:100vw;height:100vh;overflow:hidden;box-sizing:border-box;font-family:"Segoe UI","Microsoft YaHei",system-ui,sans-serif;contain:layout paint style;pointer-events:none}
.ov-element{position:absolute;display:flex;align-items:center;justify-content:center;min-width:1px;min-height:1px;box-sizing:border-box}
.ov-time{width:100%;height:100%;display:flex;align-items:center;justify-content:center;white-space:nowrap;line-height:1;font-family:"Cascadia Code",Consolas,"Microsoft YaHei",monospace;font-variant-numeric:tabular-nums;text-shadow:0 3px 18px rgba(0,0,0,.26)}
.ov-text{width:100%;height:100%;display:flex;align-items:center;justify-content:center;white-space:pre-wrap;overflow:hidden;line-height:1.18;overflow-wrap:anywhere;text-shadow:0 2px 10px rgba(0,0,0,.2)}
.ov-track{width:100%;height:100%;overflow:hidden;border-radius:999px}.ov-fill{width:100%;height:100%;border-radius:inherit;transform-origin:left center;will-change:transform;transition:transform .08s linear}
`;
function stateRemaining(state,now=Date.now()){return state.status==='running'?Math.max(0,(state.endAt||now)-now):Math.max(0,Number(state.remainingMs)||0);}
function overlayTemplate(template,state){const stage=currentStage(state),next=state.stages[Math.min(state.stages.length-1,state.activeStageIndex+1)];return String(template||'').replace(/\{(time|remaining|duration|status|stage|stageIndex|stageCount|nextStage|phase|transition)\}/g,(_,key)=>({time:formatTime(stateRemaining(state)),remaining:formatTime(stateRemaining(state)),duration:formatTime(stageDuration(state)),status:statusText(state.status),stage:stage?.name||'',stageIndex:String(state.activeStageIndex+1),stageCount:String(state.stages.length),nextStage:next?.name||'',phase:state.phase==='transition'?'衔接':'计时',transition:stage?.transitionText||'阶段完成'}[key]));}
function buildOverlayElement(doc,element,state,scale){
 const node=doc.createElement('div');node.className='ov-element';node.dataset.id=element.id;node.dataset.type=element.type;
 node.style.left=`${element.x}%`;node.style.top=`${element.y}%`;node.style.width=`${element.w}%`;node.style.height=`${element.h}%`;
 if(element.type==='progress'){
  const track=doc.createElement('div');track.className='ov-track';track.style.background=`${element.trackColor}38`;
  const fill=doc.createElement('div');fill.className='ov-fill';fill.style.background=element.color;fill.style.transform=`scaleX(${clamp(stateRemaining(state)/Math.max(1,stageDuration(state)),0,1)})`;track.append(fill);node.append(track);
 }else{
  const value=element.type==='time'?formatTime(stateRemaining(state),element.showHours):overlayTemplate(element.text,state);
  const text=doc.createElement('div');text.className=element.type==='time'?'ov-time':'ov-text';text.dataset.time=element.type==='time'?'1':'';text.dataset.template=(element.type==='text'||element.type==='transition')?element.text:'';
  text.textContent=value;text.style.color=element.color;text.style.fontSize=`${element.fontSize*scale}px`;text.style.fontWeight=element.bold?'750':'400';text.style.justifyContent=element.align==='left'?'flex-start':element.align==='right'?'flex-end':'center';text.style.textAlign=element.align;node.append(text);
 }
 return node;
}
function renderOverlayDocument(doc,state){
 let root=$('#countdown-overlay-root',doc);
 if(!root){doc.body.innerHTML='<div id="countdown-overlay-root"></div>';root=$('#countdown-overlay-root',doc);}
 doc.documentElement.style.background='transparent';doc.body.style.background='transparent';doc.body.style.margin='0';doc.body.style.overflow='hidden';
 let style=$('#countdown-overlay-style',doc);if(!style){style=doc.createElement('style');style.id='countdown-overlay-style';doc.head.append(style);}style.textContent=OVERLAY_CSS;
 const width=Math.max(1,doc.defaultView.innerWidth||state.canvas.width),height=Math.max(1,doc.defaultView.innerHeight||state.canvas.height),scale=width/Math.max(1,state.canvas.width);
 root.style.opacity=String(clamp((state.opacity??100)/100,.05,1));root.style.borderRadius=`${state.canvas.radius*scale}px`;root.style.background=state.canvas.transparent?'transparent':state.canvas.background;
 root.innerHTML='';for(const element of state.elements||[]){if(element.visible!==false&&!(element.type==='transition'&&state.phase!=='transition'))root.append(buildOverlayElement(doc,element,state,scale));}
}
function updateOverlayDynamic(doc,state){
 if(!doc||doc.defaultView?.closed)return;const root=$('#countdown-overlay-root',doc);if(!root)return;
 for(const node of $$('[data-type=time] [data-time]',root)){const element=state.elements.find(item=>item.id===node.parentElement.dataset.id);node.textContent=formatTime(stateRemaining(state),element?.showHours);}
 for(const node of $$('[data-type=text] [data-template],[data-type=transition] [data-template]',root)){const element=state.elements.find(item=>item.id===node.parentElement.dataset.id);node.textContent=overlayTemplate(node.dataset.template,state);}
 for(const node of $$('.ov-fill',root))node.style.transform=`scaleX(${clamp(stateRemaining(state)/Math.max(1,stageDuration(state)),0,1)})`;
}
function activePipWindow(){if(pipWindow&&!pipWindow.closed)return pipWindow;try{const win=window.documentPictureInPicture?.window;return win&&!win.closed?win:null;}catch{return null;}}
function syncOverlay(state){const win=activePipWindow();if(win)renderOverlayDocument(win.document,state);}

function selectedStage(){return settings.stages.find(stage=>stage.id===selectedStageId)||currentStage();}
function timePanelMarkup(){
 const stage=selectedStage(),locked=settings.status==='running';
 return `<div class="control-body" id="time-panel">
  <div class="section-label">多段定时 <span>${settings.activeStageIndex+1} / ${settings.stages.length}</span></div>
  <div class="stage-list">${settings.stages.map((item,index)=>`<button type="button" class="stage-row ${item.id===selectedStageId?'active':''}" data-stage-select="${item.id}"><span class="stage-index">${index+1}</span><span class="stage-name">${escapeHtml(item.name)}</span><span class="stage-time">${formatTime(item.durationMs)}</span></button>`).join('')}</div>
  <div class="stage-actions"><button class="btn" data-action="add-stage">${icon('plus')}新增</button><button class="btn" data-action="stage-up">${icon('up')}</button><button class="btn" data-action="stage-down">${icon('down')}</button><button class="btn danger" data-action="delete-stage" ${settings.stages.length<2?'disabled':''}>${icon('trash')}</button></div>
  <div class="stage-editor"><div class="form-grid"><div class="field"><label>阶段名称</label><input data-stage-prop="name" value="${escapeHtml(stage.name)}" ${locked?'disabled':''}></div><div class="field"><label>时长</label><input id="duration-input" value="${formatEditable(stage.durationMs)}" inputmode="numeric" aria-label="阶段时长" ${locked?'disabled':''}></div></div><div class="field"><label>衔接文字</label><input data-stage-prop="transitionText" value="${escapeHtml(stage.transitionText)}" placeholder="下一阶段即将开始" ${locked?'disabled':''}></div><div class="field"><label>衔接停留（秒）</label><input data-stage-prop="transitionMs" type="number" min="0" max="600" value="${Math.round(stage.transitionMs/1000)}" ${locked?'disabled':''}></div></div>
  <div class="presets">${[1,5,10,25,45].map(min=>`<button class="preset" data-action="preset" data-minutes="${min}" ${locked?'disabled':''}>${min} 分</button>`).join('')}</div>
  <div class="time-status" id="time-status" data-status="${settings.status}"><span class="status-dot"></span><span id="status-label">${statusText(settings.status)}</span><span>·</span><span id="stage-status">${currentStage().name}${settings.phase==='transition'?' · 衔接':''}</span><span>·</span><span id="remaining-label">${formatTime(currentRemaining())}</span></div>
  <div class="primary-controls"><button class="btn primary" data-action="start" ${settings.status==='running'?'disabled':''}>${icon('play')}开始</button><button class="btn" data-action="pause" ${settings.status!=='running'?'disabled':''}>${icon('pause')}暂停</button><button class="btn" data-action="reset">${icon('reset')}重置</button></div>
  <div class="setting-list"><div class="setting-row"><span>阶段提示音</span><label class="switch"><input id="sound-input" type="checkbox" ${settings.sound?'checked':''}><span></span></label></div><div class="setting-row"><span>画面透明度</span><input id="opacity-input" type="range" min="10" max="100" value="${settings.opacity}"><strong id="opacity-value">${settings.opacity}%</strong></div></div>
  <div class="shortcuts"><div class="shortcut-row"><span><kbd>空格</kbd> 开始 / 暂停</span><span><kbd>R</kbd> 重置</span></div><div class="shortcut-row"><span><kbd>P</kbd> 画中画</span><span><kbd>↑</kbd><kbd>↓</kbd> 调整阶段</span></div><div class="shortcut-row"><span><kbd>S</kbd> 提示音</span><span><kbd>T</kbd> 透明背景</span></div></div>
  <div class="support-note">透明背景由页面控制，悬浮窗口外框由浏览器决定。</div>
 </div>`;
}
function canvasPanelMarkup(){
 return `<div class="control-body" id="canvas-panel" hidden>
  <div class="palette"><button class="btn" data-action="add" data-type="time">${icon('timer')}时间</button><button class="btn" data-action="add" data-type="text">${icon('type')}文字</button><button class="btn" data-action="add" data-type="transition">${icon('type')}衔接</button><button class="btn" data-action="add" data-type="progress">${icon('bar')}进度</button></div>
  <div class="canvas-settings"><div class="field"><label>画布宽</label><input id="canvas-width" type="number" min="160" max="1920" value="${settings.canvas.width}"></div><div class="field"><label>画布高</label><input id="canvas-height" type="number" min="80" max="1080" value="${settings.canvas.height}"></div><div class="field"><label>圆角</label><input id="canvas-radius" type="number" min="0" max="120" value="${settings.canvas.radius}"></div><div class="field"><label>背景色</label><input id="canvas-background" type="color" value="${settings.canvas.background}" ${settings.canvas.transparent?'disabled':''}></div><div class="field wide"><label class="checkline"><input id="canvas-transparent" type="checkbox" ${settings.canvas.transparent?'checked':''}>透明背景</label></div></div>
  <div class="section-label">图层 <span>${settings.elements.length}</span></div>
  <div class="layer-list">${settings.elements.map((element,index)=>`<div class="layer-row ${element.id===selectedId?'active':''}" data-select-id="${element.id}">${icon(element.type==='time'?'timer':element.type==='progress'?'bar':'type')}<span class="name">${escapeHtml(element.label)}</span><span>${index+1}</span><button data-action="visible" data-id="${element.id}" title="显示或隐藏">${icon('eye')}</button></div>`).join('')}</div>
  <div class="layer-actions"><button class="btn" data-action="layer-up" ${!selectedId?'disabled':''}>${icon('up')}上移</button><button class="btn" data-action="layer-down" ${!selectedId?'disabled':''}>${icon('down')}下移</button><button class="btn danger" data-action="delete" ${!selectedId?'disabled':''}>${icon('trash')}删除</button></div>
  <div id="inspector">${inspectorMarkup()}</div>
 </div>`;
}
function inspectorMarkup(){
 const element=settings.elements.find(item=>item.id===selectedId);if(!element)return '<div class="empty-inspector">选择画布元素</div>';
 return `<div class="inspector"><div class="section-label">${escapeHtml(element.label)} <span>${element.type==='time'?'时间':element.type==='progress'?'进度条':element.type==='transition'?'衔接文字':'文字'}</span></div><div class="field"><label>名称</label><input data-element-prop="label" value="${escapeHtml(element.label)}"></div>${element.type!=='progress'?`<div class="field"><label>${element.type==='time'?'时间格式':'内容'}</label>${element.type==='time'?`<label class="checkline"><input data-element-prop="showHours" type="checkbox" ${element.showHours?'checked':''}>始终显示小时</label>`:`<input data-element-prop="text" value="${escapeHtml(element.text)}" placeholder="支持 {time} {stage} {nextStage} {transition}">`}</div>`:''}<div class="form-grid form-grid-4"><div class="field"><label>X %</label><input type="number" min="0" max="100" data-element-prop="x" value="${Math.round(element.x)}"></div><div class="field"><label>Y %</label><input type="number" min="0" max="100" data-element-prop="y" value="${Math.round(element.y)}"></div><div class="field"><label>宽 %</label><input type="number" min="2" max="100" data-element-prop="w" value="${Math.round(element.w)}"></div><div class="field"><label>高 %</label><input type="number" min="2" max="100" data-element-prop="h" value="${Math.round(element.h)}"></div></div><div class="form-grid"><div class="field"><label>字号</label><input type="number" min="8" max="240" data-element-prop="fontSize" value="${element.fontSize}"></div><div class="field"><label>${element.type==='progress'?'填充色':'文字色'}</label><input type="color" data-element-prop="color" value="${element.color}"></div></div>${element.type==='progress'?`<div class="field"><label>轨道色</label><input type="color" data-element-prop="trackColor" value="${element.trackColor}"></div>`:`<div class="form-grid"><div class="field"><label>水平</label><select data-element-prop="align"><option value="left" ${element.align==='left'?'selected':''}>左</option><option value="center" ${element.align==='center'?'selected':''}>中</option><option value="right" ${element.align==='right'?'selected':''}>右</option></select></div><div class="field"><label>垂直</label><select data-element-prop="alignV"><option value="top" ${element.alignV==='top'?'selected':''}>上</option><option value="center" ${element.alignV==='center'?'selected':''}>中</option><option value="bottom" ${element.alignV==='bottom'?'selected':''}>下</option></select></div></div><label class="checkline"><input type="checkbox" data-element-prop="bold" ${element.bold?'checked':''}>粗体</label>`}</div>`;
}
function shellMarkup(){
 return `<div class="countdown-shell"><header><div class="brand"><span class="brand-mark">${icon('timer',19)}</span><div><h1>透明倒计时</h1><small>画中画 · 可视化画布</small></div></div><div class="header-actions"><button class="btn" data-action="popup" title="兼容窗口">${icon('popout')}<span class="label">悬浮窗口</span></button><button class="btn primary" data-action="pip" title="打开画中画">${icon('pip')}<span class="label">画中画</span></button></div></header><div class="mobile-switch"><div class="view-switch"><button data-mobile-pane="settings" class="active">设置</button><button data-mobile-pane="overlay">画面</button></div></div><main class="countdown-main" data-mobile="settings"><section class="control-card"><div class="control-tabs"><button class="control-tab active" data-tab="time">时间</button><button class="control-tab" data-tab="canvas">画布</button></div>${timePanelMarkup()}${canvasPanelMarkup()}</section><section class="stage-card"><div class="stage-toolbar"><div class="view-switch"><button data-view="edit" class="active">画布编辑</button><button data-view="preview">纯净预览</button></div><div class="align-tools"><button data-align="left" title="左对齐">${icon('alignLeft')}</button><button data-align="center" title="水平居中">${icon('alignCenter')}</button><button data-align="right" title="右对齐">${icon('alignRight')}</button><span class="tool-sep"></span><button data-align="top" title="顶部对齐">顶</button><button data-align="middle" title="垂直居中">中</button><button data-align="bottom" title="底部对齐">底</button></div></div><div class="stage" id="stage"><div class="canvas-wrap" id="canvas-wrap"><div class="design-canvas" id="design-canvas"></div></div></div><div class="stage-footer"><span id="canvas-size-label">${settings.canvas.width} × ${settings.canvas.height}</span><strong id="overlay-mode-label">透明 · 画中画</strong></div></section></main></div>`;
}

function elementContent(element,scale){
 if(element.type==='progress'){
  const track=document.createElement('div');track.className='progress-track';track.style.background=`${element.trackColor}38`;
  const fill=document.createElement('div');fill.className='progress-fill';fill.style.background=element.color;fill.style.transform=`scaleX(${progressRatio()})`;track.append(fill);return track;
 }
 const node=document.createElement('div');node.className=element.type==='time'?'time-value':'text-value';node.dataset.dynamic=element.type;
 node.textContent=element.type==='time'?formatTime(currentRemaining(),element.showHours):element.type==='transition'?(settings.phase==='transition'?currentStage().transitionText:`衔接：${currentStage().transitionText}`):templateValue(element.text);
 node.style.color=element.color;node.style.fontSize=`${element.fontSize*scale}px`;node.style.fontWeight=element.bold?'750':'400';node.style.justifyContent=element.align==='left'?'flex-start':element.align==='right'?'flex-end':'center';node.style.textAlign=element.align;
 return node;
}
function renderCanvas(){
 const canvas=$('#design-canvas'),wrap=$('#canvas-wrap'),stage=$('#stage');if(!canvas||!wrap||!stage)return;
 const ratio=settings.canvas.width/Math.max(1,settings.canvas.height),maxW=Math.max(180,stage.clientWidth-36),maxH=Math.max(100,stage.clientHeight-36),width=Math.min(maxW,maxH*ratio),height=width/ratio,scale=width/settings.canvas.width;
 wrap.style.width=`${width}px`;wrap.style.height=`${height}px`;wrap.style.borderRadius=`${settings.canvas.radius*scale}px`;
 canvas.style.borderRadius=`${settings.canvas.radius*scale}px`;canvas.style.backgroundColor=settings.canvas.transparent?'transparent':settings.canvas.background;canvas.style.opacity=String(clamp(settings.opacity/100,.05,1));wrap.style.background=previewMode==='preview'&&settings.canvas.transparent?'#1f2937':'transparent';
 canvas.className=`design-canvas ${settings.canvas.transparent?'transparent':''}`;canvas.dataset.mode=previewMode;canvas.dataset.scale=scale;
 canvas.innerHTML='';
 for(const element of settings.elements){if(element.visible===false)continue;if(previewMode==='preview'&&element.type==='transition'&&settings.phase!=='transition')continue;const node=document.createElement('div');node.className=`canvas-element ${element.type==='time'?'time-element':element.type==='progress'?'progress-element':'text-element'} ${element.id===selectedId&&previewMode==='edit'?'selected':''} ${element.type==='transition'&&settings.phase!=='transition'?'inactive-transition':''}`;node.dataset.id=element.id;node.dataset.type=element.type;node.style.left=`${element.x}%`;node.style.top=`${element.y}%`;node.style.width=`${element.w}%`;node.style.height=`${element.h}%`;node.append(elementContent(element,scale));const label=document.createElement('span');label.className='element-label';label.textContent=element.label;node.append(label);if(element.id===selectedId&&previewMode==='edit'){const handle=document.createElement('span');handle.className='resize-handle';handle.dataset.resize='1';node.append(handle);}canvas.append(node);}
 $('#canvas-size-label').textContent=`${settings.canvas.width} × ${settings.canvas.height}`;$('#overlay-mode-label').textContent=`${settings.canvas.transparent?'透明':'背景色'} · ${settings.opacity}%`;
}
function updateDynamic(){
 const seconds=Math.ceil(currentRemaining()/1000);
 if(seconds!==lastRenderedSecond){
  for(const node of $$('.canvas-element')){const element=settings.elements.find(item=>item.id===node.dataset.id);if(!element)continue;const text=$('.time-value,.text-value',node);if(text)text.textContent=element.type==='time'?formatTime(currentRemaining(),element.showHours):templateValue(element.text);}
  if(document.activeElement?.id!=='duration-input'){const remaining=$('#remaining-label');if(remaining)remaining.textContent=formatTime(currentRemaining());}
  lastRenderedSecond=seconds;
 }
 for(const fill of $$('.progress-fill'))fill.style.transform=`scaleX(${progressRatio()})`;
 const status=$('#time-status');if(status){status.dataset.status=settings.status;const label=$('#status-label');if(label)label.textContent=statusText(settings.status);}
 const pip=activePipWindow();if(pip)updateOverlayDynamic(pip.document,snapshot());
}
function updateControls(){
 const status=$('#time-status');if(status){status.dataset.status=settings.status;const label=$('#status-label');if(label)label.textContent=statusText(settings.status);const stage=$('#stage-status');if(stage)stage.textContent=`${currentStage().name}${settings.phase==='transition'?' · 衔接':''}`;const remaining=$('#remaining-label');if(remaining)remaining.textContent=formatTime(currentRemaining());}
 const start=$('[data-action=start]'),pause=$('[data-action=pause]');if(start)start.disabled=settings.status==='running';if(pause)pause.disabled=settings.status!=='running';
}

function selectElement(id){selectedId=id;refreshInspector();renderCanvas();}
function refreshInspector(){const node=$('#inspector');if(node)node.innerHTML=inspectorMarkup();$$('.layer-row').forEach(row=>row.classList.toggle('active',row.dataset.selectId===selectedId));}
function setDuration(ms){
 const stage=selectedStage();stage.durationMs=clamp(ms,1000,359999000);settings.durationMs=stage.durationMs;
 if(stage.id===currentStage().id&&settings.phase==='timer'&&settings.status!=='running'){settings.remainingMs=stage.durationMs;settings.status='idle';settings.endAt=null;}
 const input=$('#duration-input');if(input)input.value=formatEditable(stage.durationMs);saveSoon();publish();updateControls();renderCanvas();
}
function startTimer(){
 if(settings.status==='finished'){settings.activeStageIndex=0;settings.phase='timer';settings.remainingMs=settings.stages[0].durationMs;}
 else if(settings.status==='idle'){settings.activeStageIndex=0;settings.phase='timer';settings.remainingMs=settings.stages[0].durationMs;}
 const resumeMs=Math.max(1,Number(settings.remainingMs)||stageDuration());settings.status='running';settings.endAt=Date.now()+resumeMs;saveSoon();publish();updateControls();renderCanvas();showToast(`阶段 ${settings.activeStageIndex+1} 开始`);
}
function pauseTimer(){if(settings.status!=='running')return;settings.remainingMs=currentRemaining();settings.endAt=null;settings.status='paused';saveSoon();publish();updateControls();showToast('已暂停');}
function resetTimer(){settings.status='idle';settings.phase='timer';settings.activeStageIndex=0;settings.endAt=null;settings.remainingMs=settings.stages[0].durationMs;selectedStageId=settings.stages[0].id;lastRenderedSecond=-1;saveSoon();publish();updateControls();updateDynamic();renderCanvas();refreshTimePanel();showToast('已重置');}
function finishTimer(){settings.status='finished';settings.phase='timer';settings.endAt=null;settings.remainingMs=0;saveSoon();publish();updateControls();updateDynamic();renderCanvas();beep();showToast('全部阶段已完成');}
function advanceSegment(){
 const index=settings.activeStageIndex,stage=settings.stages[index],next=settings.stages[index+1],now=Date.now();
 if(settings.phase==='timer'&&next&&stage.transitionText.trim()&&stage.transitionMs>0){settings.phase='transition';settings.remainingMs=stage.transitionMs;settings.endAt=now+stage.transitionMs;settings.status='running';showToast(stage.transitionText);beep();}
 else if(next){settings.activeStageIndex=index+1;settings.phase='timer';settings.remainingMs=next.durationMs;settings.endAt=now+next.durationMs;settings.status='running';showToast(`阶段 ${index+2}：${next.name}`);}
 else{finishTimer();return;}
 lastRenderedSecond=-1;saveSoon();publish();updateControls();updateDynamic();renderCanvas();refreshTimePanel();
}
function toggleTimer(){if(settings.status==='running')pauseTimer();else startTimer();}
function updateElement(id,patch){const element=settings.elements.find(item=>item.id===id);if(!element)return;Object.assign(element,patch);saveSoon();publish();renderCanvas();}
function alignElement(mode){
 const element=settings.elements.find(item=>item.id===selectedId);if(!element)return;
 if(mode==='left')element.x=0;if(mode==='center')element.x=(100-element.w)/2;if(mode==='right')element.x=100-element.w;if(mode==='top')element.y=0;if(mode==='middle')element.y=(100-element.h)/2;if(mode==='bottom')element.y=100-element.h;
 const panel=$('#inspector');if(panel)panel.innerHTML=inspectorMarkup();saveSoon();publish();renderCanvas();
}
function refreshTimePanel(){const panel=$('#time-panel');if(!panel)return;const wrapper=document.createElement('div');wrapper.innerHTML=timePanelMarkup();const fresh=wrapper.firstElementChild;fresh.hidden=currentTab!=='time';panel.replaceWith(fresh);updateControls();}
function selectStage(id){if(settings.status==='running'){showToast('请先暂停再编辑阶段');return;}selectedStageId=id;refreshTimePanel();}
function addStage(){if(settings.status==='running'){showToast('请先暂停再编辑阶段');return;}if(settings.stages.length>=20){showToast('最多 20 个阶段');return;}const stage={id:uid('stage'),name:`阶段 ${settings.stages.length+1}`,durationMs:5*60*1000,transitionText:'下一阶段即将开始',transitionMs:3000};settings.stages.push(stage);selectedStageId=stage.id;settings.status='idle';refreshTimePanel();publish();saveSoon();}
function deleteStage(){if(settings.status==='running'){showToast('请先暂停再编辑阶段');return;}if(settings.stages.length<2)return;const index=settings.stages.findIndex(stage=>stage.id===selectedStageId);settings.stages.splice(index,1);selectedStageId=settings.stages[Math.max(0,index-1)].id;settings.status='idle';settings.activeStageIndex=0;settings.phase='timer';settings.remainingMs=settings.stages[0].durationMs;refreshTimePanel();publish();saveSoon();renderCanvas();updateControls();}
function moveStage(direction){if(settings.status==='running'){showToast('请先暂停再编辑阶段');return;}const index=settings.stages.findIndex(stage=>stage.id===selectedStageId),target=direction==='up'?Math.max(0,index-1):Math.min(settings.stages.length-1,index+1);if(index<0||index===target)return;[settings.stages[index],settings.stages[target]]=[settings.stages[target],settings.stages[index]];settings.status='idle';settings.activeStageIndex=0;settings.phase='timer';settings.remainingMs=settings.stages[0].durationMs;refreshTimePanel();publish();saveSoon();}
function addElement(type){
 const presets={time:{label:'倒计时',w:64,h:44,fontSize:82,color:'#ffffff',text:'{time}'},text:{label:'说明文字',w:50,h:14,fontSize:22,color:'#dbe4ef',text:'自定义文字'},transition:{label:'衔接文字',w:84,h:40,fontSize:42,color:'#ffffff',text:'{transition}'},progress:{label:'进度条',w:70,h:3,fontSize:12,color:'#6ee7b7',trackColor:'#ffffff'}};
 const element=normalizeElement({id:uid(type),type,...presets[type],x:12+(settings.elements.length*3)%35,y:12+(settings.elements.length*4)%50,visible:true},settings.elements.length);settings.elements.push(element);selectedId=element.id;refreshCanvasPanel();renderCanvas();saveSoon();publish();
}
function deleteElement(){if(!selectedId)return;settings.elements=settings.elements.filter(element=>element.id!==selectedId);selectedId=settings.elements[0]?.id||null;refreshCanvasPanel();renderCanvas();saveSoon();publish();}
function moveLayer(direction){const index=settings.elements.findIndex(element=>element.id===selectedId);if(index<0)return;const target=direction==='up'?Math.min(settings.elements.length-1,index+1):Math.max(0,index-1);if(index===target)return;[settings.elements[index],settings.elements[target]]=[settings.elements[target],settings.elements[index]];refreshCanvasPanel();renderCanvas();saveSoon();publish();}
function refreshCanvasPanel(){
 const panel=$('#canvas-panel');if(panel){const wrapper=document.createElement('div');wrapper.innerHTML=canvasPanelMarkup();const fresh=wrapper.firstElementChild;fresh.hidden=currentTab!=='canvas';panel.replaceWith(fresh);}
}
async function openPictureInPicture(){
 const existing=activePipWindow();if(existing){existing.focus?.();renderOverlayDocument(existing.document,snapshot());return;}
 if('documentPictureInPicture' in window&&typeof window.documentPictureInPicture.requestWindow==='function'){
  try{
   const win=await window.documentPictureInPicture.requestWindow({width:settings.canvas.width,height:settings.canvas.height,disallowReturnToOpener:false,preferInitialWindowPlacement:false});
   pipWindow=win;win.document.title='透明倒计时';win.document.documentElement.style.background='transparent';win.document.body.style.background='transparent';renderOverlayDocument(win.document,snapshot());
   win.addEventListener('resize',()=>renderOverlayDocument(win.document,snapshot()));win.addEventListener('pagehide',()=>{pipWindow=null;},{once:true});win.document.addEventListener('keydown',event=>{const action=overlayKeyAction(event);if(!action)return;event.preventDefault();performOverlayShortcut(action);});showToast('画中画已打开');
  }catch(error){showToast('画中画不可用，已切换到悬浮窗口');openFallbackWindow();}
 }else{openFallbackWindow();}
}
function openFallbackWindow(){
 if(fallbackWindow&&!fallbackWindow.closed){fallbackWindow.focus();publish();return;}
 const width=clamp(settings.canvas.width,260,1200),height=clamp(settings.canvas.height,120,800),left=Math.max(0,Math.round(screen.availWidth-width-30)),top=46;
 fallbackWindow=window.open(`${location.pathname}?overlay=1`,'pocket-countdown-overlay',`popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes`);if(!fallbackWindow){showToast('请允许弹出窗口');return;}showToast('悬浮窗口已打开');
}

function handleClick(event){
 const stageRow=event.target.closest('[data-stage-select]');if(stageRow){selectStage(stageRow.dataset.stageSelect);return;}
 const tab=event.target.closest('[data-tab]');if(tab){currentTab=tab.dataset.tab;$$('.control-tab').forEach(node=>node.classList.toggle('active',node===tab));$('#time-panel').hidden=currentTab!=='time';$('#canvas-panel').hidden=currentTab!=='canvas';return;}
 const mobile=event.target.closest('[data-mobile-pane]');if(mobile){mobilePane=mobile.dataset.mobilePane;$$('[data-mobile-pane]').forEach(node=>node.classList.toggle('active',node===mobile));$('.countdown-main').dataset.mobile=mobilePane;requestAnimationFrame(renderCanvas);return;}
 const view=event.target.closest('[data-view]');if(view){previewMode=view.dataset.view;$$('[data-view]').forEach(node=>node.classList.toggle('active',node===view));renderCanvas();return;}
 const align=event.target.closest('[data-align]');if(align){alignElement(align.dataset.align);return;}
 const row=event.target.closest('[data-select-id]');if(row&&!event.target.closest('button')){selectElement(row.dataset.selectId);return;}
 const action=event.target.closest('[data-action]');if(!action)return;
 const name=action.dataset.action;
 if(name==='preset')setDuration(Number(action.dataset.minutes)*60*1000);
 if(name==='start')startTimer();if(name==='pause')pauseTimer();if(name==='reset')resetTimer();if(name==='pip')openPictureInPicture();if(name==='popup')openFallbackWindow();
 if(name==='add')addElement(action.dataset.type);if(name==='add-stage')addStage();if(name==='delete-stage')deleteStage();if(name==='stage-up')moveStage('up');if(name==='stage-down')moveStage('down');if(name==='delete')deleteElement();if(name==='layer-up')moveLayer('up');if(name==='layer-down')moveLayer('down');
 if(name==='visible'){const element=settings.elements.find(item=>item.id===action.dataset.id);if(element){element.visible=!element.visible;refreshCanvasPanel();renderCanvas();saveSoon();publish();}}
}
function handleField(event){
 const target=event.target;
 if(target.id==='duration-input'){const ms=parseDuration(target.value);if(!ms){showToast('时间格式应为 25:00 或 1:00:00');target.value=formatEditable(selectedStage().durationMs);return;}setDuration(ms);return;}
 if(target.dataset.stageProp){const stage=selectedStage(),prop=target.dataset.stageProp;if(prop==='transitionMs')stage.transitionMs=clamp(Number(target.value)*1000,0,600000);else stage[prop]=target.value;if(prop==='name'){const row=$(`[data-stage-select="${stage.id}"] .stage-name`);if(row)row.textContent=stage.name;}if(stage.id===currentStage().id&&settings.status!=='running'){settings.remainingMs=settings.phase==='transition'?stage.transitionMs:stage.durationMs;}saveSoon();publish();renderCanvas();return;}
 if(target.id==='opacity-input'){settings.opacity=clamp(target.value,10,100);$('#opacity-value').textContent=`${settings.opacity}%`;renderCanvas();saveSoon();publish();return;}
 if(target.id==='sound-input'){settings.sound=target.checked;saveSoon();return;}
 if(target.id==='canvas-width'){settings.canvas.width=clamp(target.value,160,1920);renderCanvas();saveSoon();publish();return;}
 if(target.id==='canvas-height'){settings.canvas.height=clamp(target.value,80,1080);renderCanvas();saveSoon();publish();return;}
 if(target.id==='canvas-radius'){settings.canvas.radius=clamp(target.value,0,120);renderCanvas();saveSoon();publish();return;}
 if(target.id==='canvas-background'){settings.canvas.background=validColor(target.value);renderCanvas();saveSoon();publish();return;}
 if(target.id==='canvas-transparent'){settings.canvas.transparent=target.checked;$('#canvas-background').disabled=target.checked;renderCanvas();saveSoon();publish();return;}
 const prop=target.dataset.elementProp;if(!prop||!selectedId)return;const element=settings.elements.find(item=>item.id===selectedId);if(!element)return;
 if(['x','y','w','h','fontSize'].includes(prop)){
  let value=Number(target.value);if(prop==='x')value=clamp(value,0,100-element.w);if(prop==='y')value=clamp(value,0,100-element.h);if(prop==='w')value=clamp(value,2,100-element.x);if(prop==='h')value=clamp(value,2,100-element.y);if(prop==='fontSize')value=clamp(value,8,240);element[prop]=value;
 }else if(['bold','showHours'].includes(prop))element[prop]=target.checked;else element[prop]=target.value;
 if(prop==='label'){const row=$(`[data-select-id="${selectedId}"] .name`);if(row)row.textContent=element.label;}
 renderCanvas();saveSoon();publish();
}
function beginDrag(event){
 if(previewMode!=='edit')return;const target=event.target,canvas=$('#design-canvas'),elementNode=target.closest('.canvas-element');
 if(!elementNode){selectedId=null;refreshInspector();renderCanvas();return;}
 const id=elementNode.dataset.id,element=settings.elements.find(item=>item.id===id);if(!element)return;if(selectedId!==id){selectedId=id;refreshInspector();renderCanvas();}
 event.preventDefault();event.stopPropagation();const current=$(`.canvas-element[data-id="${id}"]`),rect=canvas.getBoundingClientRect(),startX=event.clientX,startY=event.clientY,origin={x:element.x,y:element.y,w:element.w,h:element.h},resize=!!target.closest('[data-resize]');
 const move=moveEvent=>{const dx=(moveEvent.clientX-startX)/rect.width*100,dy=(moveEvent.clientY-startY)/rect.height*100;if(resize){element.w=clamp(origin.w+dx,2,100-element.x);element.h=clamp(origin.h+dy,2,100-element.y);}else{element.x=clamp(origin.x+dx,0,100-element.w);element.y=clamp(origin.y+dy,0,100-element.h);}current.style.left=`${element.x}%`;current.style.top=`${element.y}%`;current.style.width=`${element.w}%`;current.style.height=`${element.h}%`;};
 const end=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);refreshInspector();renderCanvas();saveSoon();publish();};
 window.addEventListener('pointermove',move);window.addEventListener('pointerup',end,{once:true});
}
function adjustActiveDuration(delta){
 if(settings.status==='running'){showToast('请先暂停再调整时长');return;}
 const stage=currentStage();selectedStageId=stage.id;stage.durationMs=clamp(stage.durationMs+delta,1000,359999000);if(settings.phase==='timer')settings.remainingMs=stage.durationMs;settings.status='idle';refreshTimePanel();renderCanvas();updateControls();saveSoon();publish();
}
function closeOverlayWindows(){const pip=activePipWindow();if(pip){pip.close();pipWindow=null;}if(fallbackWindow&&!fallbackWindow.closed){fallbackWindow.close();fallbackWindow=null;}}
function performOverlayShortcut(action){
 if(action==='toggle')toggleTimer();else if(action==='reset')resetTimer();else if(action==='up')adjustActiveDuration(60000);else if(action==='down')adjustActiveDuration(-60000);else if(action==='sound'){settings.sound=!settings.sound;saveSoon();showToast(settings.sound?'提示音已开启':'提示音已关闭');}else if(action==='transparent'){settings.canvas.transparent=!settings.canvas.transparent;renderCanvas();saveSoon();publish();showToast(settings.canvas.transparent?'透明背景已开启':'透明背景已关闭');}else if(action==='close')closeOverlayWindows();
}
function overlayKeyAction(event){const key=event.key.toLowerCase();if(event.code==='Space')return'toggle';if(key==='r')return'reset';if(key==='p'||key==='escape')return'close';if(key==='s')return'sound';if(key==='t')return'transparent';if(event.key==='ArrowUp')return'up';if(event.key==='ArrowDown')return'down';return'';}
function handleKey(event){
 const target=event.target;if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target?.isContentEditable)return;
 if(event.code==='Space'){event.preventDefault();toggleTimer();return;}if(event.key.toLowerCase()==='r'){event.preventDefault();resetTimer();return;}if(event.key.toLowerCase()==='p'){event.preventDefault();openPictureInPicture();return;}
 if(event.key==='ArrowUp'||event.key==='ArrowDown'){
  if(event.ctrlKey&&selectedId){const element=settings.elements.find(item=>item.id===selectedId);if(element){element.y=clamp(element.y+(event.key==='ArrowDown'?1:-1),0,100-element.h);renderCanvas();refreshInspector();saveSoon();publish();}return;}
  if(settings.status!=='running')setDuration(selectedStage().durationMs+(event.key==='ArrowUp'?60000:-60000));
  return;
 }
 if((event.key==='Delete'||event.key==='Backspace')&&selectedId){event.preventDefault();deleteElement();return;}
 if(event.key==='Escape'){selectedId=null;refreshInspector();renderCanvas();}
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'&&selectedId){event.preventDefault();const source=settings.elements.find(item=>item.id===selectedId);if(source){const copy=normalizeElement({...source,id:uid(source.type),label:`${source.label}副本`,x:clamp(source.x+3,0,100-source.w),y:clamp(source.y+3,0,100-source.h)},settings.elements.length);settings.elements.push(copy);selectedId=copy.id;refreshCanvasPanel();renderCanvas();saveSoon();publish();}}
}
function bindMain(){
 document.addEventListener('click',handleClick);document.addEventListener('input',handleField);document.addEventListener('change',handleField);$('#stage').addEventListener('pointerdown',beginDrag);

 window.addEventListener('keydown',handleKey);new ResizeObserver(()=>renderCanvas()).observe($('#stage'));
 channel?.addEventListener('message',event=>{if(event.data?.type==='hello')publish();if(event.data?.type==='command'&&event.data.action)performOverlayShortcut(event.data.action);});
}

function startOverlayMode(){
 document.documentElement.classList.add('overlay-mode');document.documentElement.style.background='transparent';document.body.style.background='transparent';document.body.style.margin='0';document.body.style.overflow='hidden';document.body.innerHTML='<div id="countdown-overlay-root"></div>';
 let overlayState=loadSettings();if(overlayState.status==='running'&&!overlayState.endAt)overlayState.status='paused';
 renderOverlayDocument(document,overlayState);channel?.postMessage({type:'hello'});
 const receive=event=>{if(event.data?.type==='state'&&event.data.state){overlayState=event.data.state;renderOverlayDocument(document,overlayState);}};
 channel?.addEventListener('message',receive);
 window.addEventListener('message',event=>{if(event.data?.type==='countdown-state'){overlayState=event.data.state;renderOverlayDocument(document,overlayState);}});
 window.addEventListener('resize',()=>renderOverlayDocument(document,overlayState));
 document.addEventListener('keydown',event=>{const action=overlayKeyAction(event);if(!action)return;event.preventDefault();if(action==='close'){window.close();return;}channel?.postMessage({type:'command',action});});
 let last=-1;
 const frame=()=>{const second=Math.ceil(stateRemaining(overlayState)/1000);if(second!==last){updateOverlayDynamic(document,overlayState);last=second;}requestAnimationFrame(frame);};requestAnimationFrame(frame);
}
function startMain(){
 $('#root').innerHTML=shellMarkup();bindMain();renderCanvas();updateControls();updateDynamic();publish();
 const frame=()=>{if(settings.status==='running'){if(currentRemaining()<=0)advanceSegment();else updateDynamic();}else if(lastRenderedSecond!==Math.ceil(currentRemaining()/1000)){updateDynamic();}requestAnimationFrame(frame);};requestAnimationFrame(frame);
}
if(new URLSearchParams(location.search).get('overlay')==='1')startOverlayMode();else startMain();
