export const SOURCE_TYPES = ['camera','screen','window','microphone','image','video','text','countdown'];
export const clamp = (value,min,max,fallback=min) => Number.isFinite(Number(value)) ? Math.min(max,Math.max(min,Number(value))) : fallback;
export const uid = () => globalThis.crypto?.randomUUID?.() || `src-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
export function normalizeSource(input={}) {
  const s = input && typeof input === 'object' ? input : {};
  return {id:String(s.id || uid()),type:SOURCE_TYPES.includes(s.type)?s.type:'text',name:String(s.name || '新来源').slice(0,120),
    x:clamp(s.x,-7680,7680,0),y:clamp(s.y,-4320,4320,0),width:clamp(s.width,8,7680,640),height:clamp(s.height,8,4320,360),
    rotation:clamp(s.rotation,-3600,3600,0),opacity:clamp(s.opacity,0,1,1),visible:s.visible!==false,locked:!!s.locked,muted:!!s.muted,
    gain:clamp(s.gain,0,2,1),text:String(s.text ?? '输入文字').slice(0,10000),color:/^#[\da-f]{3,8}$/i.test(s.color)?s.color:'#ffffff',
    background:/^#[\da-f]{3,8}$/i.test(s.background)?s.background:'transparent',fontSize:clamp(s.fontSize,8,400,48),
    fontFamily:String(s.fontFamily || 'sans-serif').replace(/[;{}]/g,'').slice(0,100),fontWeight:s.fontWeight==='normal'?'normal':'bold',
    scrollSpeed:clamp(s.scrollSpeed,-600,600,0),chromaKey:!!s.chromaKey,chromaColor:/^#[\da-f]{6}$/i.test(s.chromaColor)?s.chromaColor:'#00ff00',
    chromaTolerance:clamp(s.chromaTolerance,0,1,.28),chromaSoftness:clamp(s.chromaSoftness,.001,.5,.08),
    duration:clamp(s.duration,0,86400,300),countdownStartedAt:clamp(s.countdownStartedAt,0,9e15,Date.now()),
    loop:s.loop!==false,paused:!!s.paused,assetId:s.assetId?String(s.assetId):null,fileName:String(s.fileName || '').slice(0,250),
    deviceId:s.deviceId?String(s.deviceId):null,fit:s.fit==='cover'?'cover':'contain'};
}
export function normalizeProject(input={}) {
  const s = input && typeof input === 'object' ? input : {};
  const sceneIds = new Set(); const sourceIds = new Set();
  const scenes=(Array.isArray(s.scenes)?s.scenes:[]).slice(0,16).map((scene,i)=>{
    let id=String(scene?.id || uid()); if(sceneIds.has(id)) id=uid(); sceneIds.add(id);
    return {id,name:String(scene?.name || `场景 ${i+1}`).slice(0,100),sources:(Array.isArray(scene?.sources)?scene.sources:[]).slice(0,32).map(input=>{
      const source=normalizeSource(input); if(sourceIds.has(source.id)) source.id=uid(); sourceIds.add(source.id); return source;
    })};
  });
  if(!scenes.length) scenes.push({id:uid(),name:'主场景',sources:[]});
  let width=Math.round(clamp(s.width,320,1920,1280)),height=Math.round(clamp(s.height,180,1920,720));
  if(width*height>1920*1080){const ratio=Math.sqrt(1920*1080/(width*height));width=Math.floor(width*ratio);height=Math.floor(height*ratio);}
  return {version:1,width,height,fps:Math.round(clamp(s.fps,10,60,30)),
    activeSceneId:scenes.some(scene=>scene.id===s.activeSceneId)?s.activeSceneId:scenes[0].id,scenes};
}
export function hitTestSource(source,x,y) {
  if(!source.visible || source.type==='microphone') return false;
  const radians=-source.rotation*Math.PI/180,dx=x-source.x-source.width/2,dy=y-source.y-source.height/2;
  return Math.abs(dx*Math.cos(radians)-dy*Math.sin(radians))<=source.width/2 && Math.abs(dx*Math.sin(radians)+dy*Math.cos(radians))<=source.height/2;
}
export function formatCountdown(seconds) {
  seconds=Math.max(0,Math.ceil(Number(seconds)||0));
  const parts=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60];
  if(!parts[0]) parts.shift(); return parts.map(n=>String(n).padStart(2,'0')).join(':');
}
