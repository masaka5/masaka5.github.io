import { formatCountdown } from './broadcast-core.js';

const VERTEX=`attribute vec2 position; attribute vec2 uv; varying vec2 texUV; void main(){gl_Position=vec4(position,0.,1.);texUV=uv;}`;
const FRAGMENT=`precision mediump float; varying vec2 texUV; uniform sampler2D image; uniform float opacity; uniform float keyed; uniform vec3 keyColor; uniform float tolerance; uniform float softness; uniform float scrollOffset; uniform float scrollSpan;uniform float atlasTiles;uniform float atlasSpan;
vec2 chroma(vec3 c){return vec2(-.168736*c.r-.331264*c.g+.5*c.b,.5*c.r-.418688*c.g-.081312*c.b);}
void main(){vec2 p=texUV;if(scrollSpan>0.){float position=fract(p.x*scrollSpan+scrollOffset)*atlasSpan;float tile=floor(position);p.x=fract(position);p.y=(atlasTiles-1.-tile+p.y)/atlasTiles;}vec4 c=texture2D(image,p);float a=1.;if(keyed>.5){float d=distance(chroma(c.rgb),chroma(keyColor));a=smoothstep(tolerance,tolerance+softness,d);float spill=(1.-a)*.7;c.g=min(c.g,mix(c.g,max(c.r,c.b),spill));}gl_FragColor=vec4(c.rgb,c.a*opacity*a);}`;

/** GPU composition: source textures are uploaded only when a decoded frame changes. */
export class Compositor {
  constructor(canvas,{onError=()=>{}}={}) {
    this.canvas=canvas; this.onError=onError; this.cache=new Map();
    const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,premultipliedAlpha:false});
    if(!gl) throw new Error('此浏览器无法创建 WebGL 合成画布，请启用硬件加速。');
    this.gl=gl;
    const shader=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh;};
    this.program=gl.createProgram(); const vs=shader(gl.VERTEX_SHADER,VERTEX),fs=shader(gl.FRAGMENT_SHADER,FRAGMENT);
    gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));
    gl.useProgram(this.program);this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
    for(const [name,offset] of [['position',0],['uv',8]]){const loc=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,16,offset);}
    this.uniforms=Object.fromEntries(['opacity','keyed','keyColor','tolerance','softness','scrollOffset','scrollSpan','atlasTiles','atlasSpan'].map(name=>[name,gl.getUniformLocation(this.program,name)]));
    gl.uniform1i(gl.getUniformLocation(this.program,'image'),0);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    this.lost=false;
    this.onLost=e=>{e.preventDefault();this.lost=true;this.onError(new Error('GPU 合成上下文丢失，请重新载入页面。'));};
    canvas.addEventListener('webglcontextlost',this.onLost);
  }
  textImage(source,time) {
    let entry=this.cache.get(source.id); if(!entry){entry={};this.cache.set(source.id,entry);}
    const text=source.type==='countdown'?formatCountdown(source.duration-(Date.now()-source.countdownStartedAt)/1000):source.text;
    const signature=JSON.stringify([text,source.width,source.height,source.fontSize,source.color,source.background,source.fontFamily,source.fontWeight,!!source.scrollSpeed]);
    if(entry.textSignature!==signature){
      const image=entry.textCanvas ||= document.createElement('canvas');
      const ctx=image.getContext('2d');const font=`${source.fontWeight} ${source.fontSize}px ${source.fontFamily}`;
      const lines=text.split('\n');ctx.font=font;
      const measured=Math.max(...lines.map(line=>ctx.measureText(line).width));
      const desired=source.scrollSpeed?Math.max(source.width,Math.ceil(measured)+Math.max(32,source.fontSize*2)):source.width;
      const textureLimit=this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
      // Extremely long text is packed into a texture atlas rather than truncated at GPU texture limits.
      entry.textSpan=desired;entry.tileWidth=Math.min(textureLimit,Math.max(8,Math.ceil(desired)));
      entry.tileCount=source.scrollSpeed?Math.ceil(desired/entry.tileWidth):1;
      const tileHeight=Math.max(1,Math.min(Math.ceil(source.height),Math.floor(textureLimit/entry.tileCount),Math.floor(8_000_000/(entry.tileWidth*entry.tileCount))));
      image.width=entry.tileWidth;image.height=Math.max(8,tileHeight*entry.tileCount);
      ctx.clearRect(0,0,image.width,image.height);
      if(source.background!=='transparent'){ctx.fillStyle=source.background;ctx.fillRect(0,0,image.width,image.height);}
      ctx.fillStyle=source.color;ctx.font=font;ctx.textBaseline='middle';const lineHeight=source.fontSize*1.25;
      for(let tile=0;tile<entry.tileCount;tile++){
        ctx.save();ctx.beginPath();ctx.rect(0,tile*tileHeight,image.width,tileHeight);ctx.clip();
        ctx.translate(0,tile*tileHeight);ctx.scale(1,tileHeight/source.height);
        lines.forEach((line,index)=>ctx.fillText(line,source.scrollSpeed?-tile*entry.tileWidth:12,source.height/2+(index-(lines.length-1)/2)*lineHeight));ctx.restore();
      }
      entry.textSignature=signature;entry.needsUpload=true;
    }
    if(source.scrollSpeed){
      // Marquee uses texture UV repeat inside a clipped source rectangle; no text re-rasterization per frame.
      entry.offset=((time/1000*source.scrollSpeed)/entry.textSpan)%1;
    } else entry.offset=0;
    return entry.textCanvas;
  }
  render(scene,runtimes,time=performance.now()) {
    if(this.lost)return false;const gl=this.gl;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(.025,.032,.045,1);gl.clear(gl.COLOR_BUFFER_BIT);
    for(const source of scene?.sources || []) {
      if(!source.visible || source.opacity<=0 || source.type==='microphone')continue;
      const runtime=runtimes.get(source.id);
      const image=['text','countdown'].includes(source.type)?this.textImage(source,time):runtime?.element;
      if(!image || (image instanceof HTMLVideoElement && image.readyState<2) || (image instanceof HTMLImageElement && !image.complete))continue;
      let entry=this.cache.get(source.id);if(!entry){entry={};this.cache.set(source.id,entry);}
      if(!entry.texture){entry.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,entry.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);entry.needsUpload=true;}
      gl.bindTexture(gl.TEXTURE_2D,entry.texture);
      if(entry.needsUpload || entry.image!==image || runtime?.dirty || (image instanceof HTMLVideoElement && !runtime?.frameCallback)) {
        try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);entry.needsUpload=false;entry.image=image;if(runtime)runtime.dirty=false;}
        catch(error){if(!entry.errorReported){entry.errorReported=true;this.onError(error);}continue;}
      }
      const iw=image.videoWidth||image.naturalWidth||image.width,ih=image.videoHeight||image.naturalHeight||image.height;
      let width=source.width,height=source.height,u0=0,v0=0,u1=1,v1=1;
      if(!['text','countdown'].includes(source.type)){
        const ratio=iw/ih,box=width/height;
        if(source.fit==='cover'){if(ratio>box){const crop=box/ratio;u0=(1-crop)/2;u1=1-u0;}else{const crop=ratio/box;v0=(1-crop)/2;v1=1-v0;}}
        else if(ratio>box)height=width/ratio;else width=height*ratio;
      }
      const radians=source.rotation*Math.PI/180,cos=Math.cos(radians),sin=Math.sin(radians),cx=source.x+source.width/2,cy=source.y+source.height/2;
      const corners=[[-width/2,-height/2,u0,v1],[width/2,-height/2,u1,v1],[-width/2,height/2,u0,v0],[width/2,height/2,u1,v0]];
      const vertices=new Float32Array(corners.flatMap(([x,y,u,v])=>[(cx+x*cos-y*sin)/this.canvas.width*2-1,1-(cy+x*sin+y*cos)/this.canvas.height*2,u,v]));
      gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);
      gl.uniform1f(this.uniforms.opacity,source.opacity);gl.uniform1f(this.uniforms.keyed,source.chromaKey?1:0);
      const hex=source.chromaColor.slice(1);gl.uniform3f(this.uniforms.keyColor,parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4,6),16)/255);
      gl.uniform1f(this.uniforms.tolerance,source.chromaTolerance);gl.uniform1f(this.uniforms.softness,source.chromaSoftness);
      gl.uniform1f(this.uniforms.scrollOffset,source.scrollSpeed?entry.offset||0:0);
      gl.uniform1f(this.uniforms.scrollSpan,source.scrollSpeed?source.width/entry.textSpan:0);
      gl.uniform1f(this.uniforms.atlasTiles,entry.tileCount||1);gl.uniform1f(this.uniforms.atlasSpan,entry.textSpan/entry.tileWidth||1);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
    return true;
  }
  remove(id){const entry=this.cache.get(id);if(entry?.texture)this.gl.deleteTexture(entry.texture);this.cache.delete(id);}
  dispose(){for(const id of this.cache.keys())this.remove(id);this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);this.canvas.removeEventListener('webglcontextlost',this.onLost);}
}
