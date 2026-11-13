import {resizeSource} from './transform.js?v=20261113-effects1';
import {hitTestSource} from './broadcast-core.js?v=20261113-effects1';
const direction={nw:[0,0],n:[50,0],ne:[100,0],e:[100,50],se:[100,100],s:[50,100],sw:[0,100],w:[0,50]};
const names={nw:'左上',n:'上',ne:'右上',e:'右',se:'右下',s:'下',sw:'左下',w:'左'};
export class TransformEditor{
 constructor({engine,getSelected,select,enabled=()=>true,onChange=()=>{},onFinish=()=>{}}){
  Object.assign(this,{engine,getSelected,select,enabled,onChange,onFinish});this.overlay=document.getElementById('selectionOverlay');this.outline=document.getElementById('sourceOutline');this.drag=null;
  this.outline.replaceChildren();
  for(const side of ['n','e','s','w']){const edge=document.createElement('span');edge.className='resize-edge edge-'+side;edge.dataset.handle=side;this.outline.append(edge);}
  for(const [handle,[x,y]]of Object.entries(direction)){const b=document.createElement('button');b.type='button';b.className='resize-point';b.dataset.handle=handle;b.style.left=x+'%';b.style.top=y+'%';b.setAttribute('aria-label',names[handle]+'缩放素材');b.title=names[handle]+'缩放 · Shift 自由拉伸';this.outline.append(b);}
  const rotate=document.createElement('button');rotate.type='button';rotate.className='rotate-handle';rotate.dataset.handle='rotate';rotate.setAttribute('aria-label','旋转素材');this.outline.append(rotate);
  this.metrics=document.createElement('output');this.metrics.id='transformMetrics';this.metrics.className='transform-metrics';this.metrics.setAttribute('aria-label','素材坐标与分辨率');document.getElementById('previewArea').append(this.metrics);
  this.overlay.addEventListener('pointerdown',e=>this.down(e));this.overlay.addEventListener('pointermove',e=>this.move(e));this.overlay.addEventListener('pointerup',e=>this.finish(e));this.overlay.addEventListener('pointercancel',e=>this.finish(e,true));this.overlay.addEventListener('lostpointercapture',e=>this.finish(e));
  this.outline.addEventListener('keydown',e=>{const handle=e.target.dataset.handle,s=this.getSelected();if(!s||s.locked||!direction[handle]||!e.key.startsWith('Arrow'))return;e.preventDefault();e.stopPropagation();const step=e.shiftKey?10:1;this.engine.updateSource(s.id,resizeSource(s,handle,{x:e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0,y:e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0},!e.altKey));});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.drag){e.preventDefault();this.finish({pointerId:this.drag.pointerId},true);}});
 }
 point(event,rect=this.rect()){return{x:(event.clientX-rect.left)*this.engine.project.width/rect.width,y:(event.clientY-rect.top)*this.engine.project.height/rect.height};}
 rect(){return document.getElementById('canvasWrap').getBoundingClientRect();}
 down(event){
  if(event.button!==0||this.drag||!this.enabled())return;
  const rect=this.rect(),point=this.point(event,rect),handle=event.target.closest('[data-handle]')?.dataset.handle;let source=this.getSelected();
  if(!handle){source=[...this.engine.activeScene.sources].reverse().find(s=>hitTestSource(s,point.x,point.y));this.select(source?.id||null);}
  if(!source||source.locked||source.type==='microphone'||!source.visible)return;
  event.preventDefault();const cx=source.x+source.width/2,cy=source.y+source.height/2;
  this.drag={id:source.id,mode:handle||'move',source:{...source},point,rect,pointerId:event.pointerId,cx,cy,angle:Math.atan2(point.y-cy,point.x-cx)};
  this.overlay.setPointerCapture(event.pointerId);this.overlay.classList.add('transforming');this.onChange();this.render();
 }
 move(event){
  const d=this.drag;if(!d||event.pointerId!==d.pointerId)return;const current=this.engine.getSource(d.id);if(!current||current.locked||this.getSelected()?.id!==d.id){this.finish(event);return;}
  const p=this.point(event,d.rect),delta={x:p.x-d.point.x,y:p.y-d.point.y};let patch;
  if(d.mode==='rotate'){let rotation=d.source.rotation+(Math.atan2(p.y-d.cy,p.x-d.cx)-d.angle)*180/Math.PI;if(event.shiftKey)rotation=Math.round(rotation/15)*15;patch={rotation};}
  else if(direction[d.mode])patch=resizeSource(d.source,d.mode,delta,!event.shiftKey);
  else patch={x:d.source.x+delta.x,y:d.source.y+delta.y};
  this.engine.updateSource(d.id,patch);this.onChange();this.render();
 }
 finish(event,cancel=false){const d=this.drag;if(!d||event.pointerId!==d.pointerId)return;this.drag=null;if(cancel&&this.engine.getSource(d.id))this.engine.updateSource(d.id,{x:d.source.x,y:d.source.y,width:d.source.width,height:d.source.height,rotation:d.source.rotation});if(this.overlay.hasPointerCapture(d.pointerId))this.overlay.releasePointerCapture(d.pointerId);this.overlay.classList.remove('transforming');this.onFinish();this.render();}
 render(){
  const s=this.getSelected(),show=!!s&&s.visible&&s.type!=='microphone'&&this.enabled();this.outline.hidden=this.metrics.hidden=!show;if(!show)return;
  const rect=this.drag?.rect||this.rect(),scaleX=rect.width/this.engine.project.width,scaleY=rect.height/this.engine.project.height;
  this.outline.style.cssText=`left:${s.x*scaleX}px;top:${s.y*scaleY}px;width:${s.width*scaleX}px;height:${s.height*scaleY}px;transform:rotate(${s.rotation}deg)`;
  this.outline.dataset.locked=String(s.locked);for(const n of this.outline.querySelectorAll('button,.resize-edge'))n.hidden=s.locked;
  const cursors=['ew-resize','nwse-resize','ns-resize','nesw-resize'];
  for(const n of this.outline.querySelectorAll('[data-handle]'))if(direction[n.dataset.handle]){const [x,y]=direction[n.dataset.handle],angle=Math.atan2(y-50,x-50)*180/Math.PI+s.rotation;n.style.cursor=cursors[((Math.round(angle/45)%4)+4)%4];}
  this.metrics.textContent=`X ${Math.round(s.x)}   Y ${Math.round(s.y)}   ·   ${Math.round(s.width)} × ${Math.round(s.height)} px`;
 }
}
