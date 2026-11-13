import {Compositor} from './compositor.js?v=20261113-stability1';
import {fadeValue} from './effects.js?v=20261113-effects1';
/** Direct canvas path avoids a GPU framebuffer readback for unfiltered camera/screen scenes. */
export class PublishCompositor{
 constructor(canvas,options={}){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});this.options=options;this.cache=new Map();this.textureLimit=16384;}
 render(scene,runtimes,time,fades,output){
  const complicated=scene?.sources.some(s=>{if(!(s.visible||fades.has(s.id))||s.type==='microphone')return false;const f=s.filters;return s.chromaKey||s.scrollSpeed||f&&(f.brightness!==1||f.contrast!==1||f.saturation!==1||f.hue||f.grayscale||f.sepia||f.invert||f.blur);});
  if(complicated){if(!this.gpu){const c=document.createElement('canvas');c.width=this.canvas.width;c.height=this.canvas.height;this.gpu=new Compositor(c,this.options);}this.gpu.render(scene,runtimes,time,fades,output);this.ctx.drawImage(this.gpu.canvas,0,0);return true;}
  const x=this.ctx;x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle='#06080b';x.fillRect(0,0,this.canvas.width,this.canvas.height);x.scale(this.canvas.width/output.width,this.canvas.height/output.height);
  for(const s of scene?.sources||[]){const alpha=fades.has(s.id)?fadeValue(fades.get(s.id),time):s.visible?1:0;if(!alpha||s.type==='microphone')continue;const text=['text','countdown'].includes(s.type),image=text?Compositor.prototype.textImage.call(this,s,time):runtimes.get(s.id)?.element;if(!image||image.readyState<2||image.complete===false)continue;const iw=image.videoWidth||image.naturalWidth||image.width,ih=image.videoHeight||image.naturalHeight||image.height;if(!iw||!ih)continue;let w=s.width,h=s.height,sx=0,sy=0,sw=iw,sh=ih;if(!text){const ratio=iw/ih,box=w/h;if(s.fit==='cover'){if(ratio>box){sw=ih*box;sx=(iw-sw)/2;}else{sh=iw/box;sy=(ih-sh)/2;}}else if(ratio>box)h=w/ratio;else w=h*ratio;}x.save();x.globalAlpha=s.opacity*alpha;x.translate(s.x+s.width/2,s.y+s.height/2);x.rotate(s.rotation*Math.PI/180);x.drawImage(image,sx,sy,sw,sh,-w/2,-h/2,w,h);x.restore();}
  x.restore();return true;
 }
 remove(id){this.gpu?.remove(id);this.cache.delete(id);}
 dispose(){this.gpu?.dispose();this.gpu=null;this.cache.clear();}
}
