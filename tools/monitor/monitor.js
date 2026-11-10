/* 检测项目与交互参考 https://screen.bmcx.com/；全部图案由本地 Canvas 绘制。 */
(() => {
  const groups = [{id:'solids',name:'纯色'},{id:'lines',name:'线条'},{id:'grids',name:'网格'},{id:'tones',name:'色阶'},{id:'motion',name:'动态'}];
  const patterns = [];
  const add = (id,group,name,kind,options={}) => patterns.push({id,group,name,kind,...options});
  for (const [id,name,color] of [['red','红色','#ff0000'],['green','绿色','#00ff00'],['blue','蓝色','#0000ff'],['yellow','黄色','#ffff00'],['cyan','青色','#00ffff'],['magenta','洋红','#ff00ff'],['white','白色','#ffffff'],['black','黑色','#000000']]) {
    add('solid-'+id,'solids','纯'+name,'solid',{color,hint:id==='black'?'在暗处观察漏光、亮点和亮度不均。':id==='white'?'观察暗点、色斑和亮度是否均匀。':'观察固定的亮点、暗点或异色点。'});
  }
  for (const [kind,name] of [['horizontal','横线'],['vertical','竖线'],['diagonal','斜线'],['dots','点阵']]) {
    for (const size of [1,2]) add(kind+'-'+size,'lines',name+' '+size+'px','lines',{direction:kind,size,hint:'观察线条是否清晰、稳定；建议浏览器缩放为 100%。'});
  }
  add('grid','grids','方形网格','grid',{hint:'观察边缘、间距和几何形状是否均匀。'});
  add('rgb-grid','grids','彩色网格','grid',{rgb:true,hint:'观察三色线条是否清晰，边缘是否有错位。'});
  add('focus','grids','微型图案','focus',{hint:'观察四角和中心的细节是否同样清晰。'});
  add('contrast-dark','tones','暗部对比','contrast',{bright:false,hint:'观察黑底上的暗灰色块能否逐级分辨。'});
  add('contrast-light','tones','亮部对比','contrast',{bright:true,hint:'观察白底上的亮灰色块能否逐级分辨。'});
  for (const [channel,name] of [['white','灰阶渐变'],['red','红色渐变'],['green','绿色渐变'],['blue','蓝色渐变']]) add('gradient-'+channel,'tones',name,'gradient',{channel,hint:'观察渐变是否平滑，有无明显色带或断层。'});
  add('saturation','tones','饱和度','saturation',{hint:'观察各行色彩与饱和度过渡是否均匀。'});
  add('breathing','motion','呼吸方块','breathing',{hint:'观察方块亮度变化时，边缘和画面尺寸是否稳定。'});
  add('motion','motion','移动拖影','motion',{hint:'跟随移动方块，观察拖尾和过冲；结果由肉眼判断。'});

  const stage=document.getElementById('testStage');
  const canvas=document.getElementById('patternCanvas');
  const ctx=canvas.getContext('2d',{alpha:false});
  const tabs=document.getElementById('groupTabs');
  const options=document.getElementById('patternOptions');
  const overlay=document.getElementById('testOverlay');
  let current=0, testing=false, paused=false, animation=0, hideTimer=0, elapsed=0, lastTime=0;
  let previousFocus=null, nativeFullscreen=false, tile=null, tileId='';
  const dynamic=()=>['breathing','motion'].includes(patterns[current].kind);

  for (const group of groups) {
    const button=document.createElement('button');
    button.type='button';button.dataset.group=group.id;button.textContent=group.name;
    button.addEventListener('click',()=>select(patterns.findIndex(item=>item.group===group.id)));
    tabs.append(button);
  }

  function select(index) {
    current=(index+patterns.length)%patterns.length;
    elapsed=0;lastTime=0;paused=false;
    const pattern=patterns[current];
    stage.dataset.pattern=pattern.id;
    canvas.setAttribute('aria-label',pattern.name+'测试画面');
    for (const button of tabs.children) button.setAttribute('aria-pressed',String(button.dataset.group===pattern.group));
    options.replaceChildren();
    for (const item of patterns.filter(value=>value.group===pattern.group)) {
      const button=document.createElement('button');
      button.type='button';button.dataset.pattern=item.id;button.setAttribute('aria-pressed',String(item===pattern));
      if(item.color){const swatch=document.createElement('span');swatch.className='swatch';swatch.style.background=item.color;swatch.setAttribute('aria-hidden','true');button.append(swatch);}
      button.append(document.createTextNode(item.name.replace(/^纯/,'')));
      button.addEventListener('click',()=>select(patterns.indexOf(item)));
      options.append(button);
    }
    document.getElementById('patternHint').textContent=pattern.hint;
    document.getElementById('overlayTitle').textContent=pattern.name;
    document.getElementById('overlayCount').textContent=`${current+1} / ${patterns.length}`;
    document.getElementById('motionSettings').hidden=!dynamic();
    document.getElementById('motionRate').hidden=pattern.kind!=='motion';
    document.getElementById('motionSpeed').disabled=pattern.kind!=='motion';
    document.getElementById('overlayPause').hidden=!dynamic();
    syncPause();resize();showControls();
  }

  function resize() {
    const ratio=window.devicePixelRatio||1;
    const width=Math.max(1,Math.round(canvas.clientWidth*ratio));
    const height=Math.max(1,Math.round(canvas.clientHeight*ratio));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;tile=null;}
    document.getElementById('screenInfo').textContent=`屏幕 ${screen.width} × ${screen.height}（CSS） · 像素比 ${ratio}`;
    draw();schedule();
  }

  function draw() {
    const p=patterns[current],w=canvas.width,h=canvas.height,r=window.devicePixelRatio||1;
    ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
    if(p.kind==='solid'){ctx.fillStyle=p.color;ctx.fillRect(0,0,w,h);}
    if(p.kind==='lines'){
      if(!tile||tileId!==p.id){
        const size=p.size,side=size*2,source=document.createElement('canvas');
        source.width=source.height=side;
        const buffer=source.getContext('2d').createImageData(side,side);
        for(let y=0;y<side;y++)for(let x=0;x<side;x++){
          const white=p.direction==='horizontal'?y<size:p.direction==='vertical'?x<size:p.direction==='diagonal'?(x+y)%side<size:x<size&&y<size;
          const offset=(y*side+x)*4;
          buffer.data[offset]=buffer.data[offset+1]=buffer.data[offset+2]=white?255:0;buffer.data[offset+3]=255;
        }
        source.getContext('2d').putImageData(buffer,0,0);tile=ctx.createPattern(source,'repeat');tileId=p.id;
      }
      ctx.fillStyle=tile;ctx.fillRect(0,0,w,h);
    }
    if(p.kind==='grid'){
      const step=Math.max(12,Math.round(48*r)),colors=p.rgb?['#f00','#0f0','#00f']:['#fff'];
      colors.forEach((color,i)=>{ctx.fillStyle=color;for(let x=0;x<w;x+=step)ctx.fillRect(x+i,0,1,h);for(let y=0;y<h;y+=step)ctx.fillRect(0,y+i,w,1);});
    }
    if(p.kind==='focus'){
      const size=Math.min(100,Math.floor(Math.min(w,h)/3));
      for(const [left,top] of [[0,0],[w-size,0],[0,h-size],[w-size,h-size],[(w-size)/2,(h-size)/2]]){
        const x=Math.round(left),y=Math.round(top);
        ctx.fillStyle='#fff';
        for(let offset=0;offset<size;offset+=4){ctx.fillRect(x+offset,y,1,size);ctx.fillRect(x,y+offset,size,1);}
        ctx.fillStyle='#000';ctx.fillRect(x+size/3,y+size/3,size/3,size/3);
        ctx.fillStyle='#fff';ctx.fillRect(x+Math.floor(size/2),y+size/3,1,size/3);ctx.fillRect(x+size/3,y+Math.floor(size/2),size/3,1);
      }
    }
    if(p.kind==='contrast'){
      ctx.fillStyle=p.bright?'#fff':'#000';ctx.fillRect(0,0,w,h);
      const areaW=w*.92,areaH=h*.8,left=w*.04,top=h*.1,steps=p.bright?[8,4,2,1]:[1,2,4,8];
      for(let row=0;row<4;row++)for(let col=0;col<10;col++){
        const value=p.bright?255-(10-col)*steps[row]:(col+1)*steps[row];
        const x=Math.round(left+col*areaW/10),y=Math.round(top+row*areaH/4),cw=Math.ceil(areaW/10),ch=Math.floor(areaH/4*.78);
        ctx.fillStyle=`rgb(${value},${value},${value})`;ctx.fillRect(x,y,cw,ch);
        ctx.fillStyle=p.bright?'#777':'#aaa';ctx.font=`${Math.max(9,Math.round(10*r))}px monospace`;ctx.textAlign='center';ctx.fillText(String(value),x+cw/2,y+ch+Math.min(15*r,areaH/4*.18));
      }
    }
    if(p.kind==='gradient'){
      const gradient=ctx.createLinearGradient(0,0,w,0);
      gradient.addColorStop(0,'#000');gradient.addColorStop(1,p.channel==='white'?'#fff':p.channel==='red'?'#f00':p.channel==='green'?'#0f0':'#00f');
      ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    }
    if(p.kind==='saturation'){
      for(let row=0;row<7;row++){
        const gradient=ctx.createLinearGradient(0,0,w,0);
        for(let stop=0;stop<=6;stop++)gradient.addColorStop(stop/6,`hsl(${stop*60},${100-row*100/6}%,50%)`);
        ctx.fillStyle=gradient;ctx.fillRect(0,Math.floor(row*h/7),w,Math.ceil(h/7));
      }
    }
    if(p.kind==='breathing'){
      const value=Math.round(127.5+127.5*Math.sin(elapsed*Math.PI*2/4000));
      ctx.fillStyle='#fff';ctx.fillRect(0,0,w,2);ctx.fillRect(0,h-2,w,2);ctx.fillRect(0,0,2,h);ctx.fillRect(w-2,0,2,h);
      ctx.fillStyle=`rgb(${value},${value},${value})`;ctx.fillRect(w*.1,h*.1,w*.8,h*.8);
    }
    if(p.kind==='motion'){
      const size=Math.max(20,Math.round(Math.min(80*r,w/5))),speed=Number(document.getElementById('motionSpeed').value)*r;
      const x=(elapsed/1000*speed)%(w+size)-size;
      for(const [row,background,foreground] of [[0,'#000','#fff'],[1,'#888','#fff'],[2,'#fff','#000']]){
        const y=Math.floor(row*h/3);ctx.fillStyle=background;ctx.fillRect(0,y,w,Math.ceil(h/3));
        ctx.fillStyle=foreground;ctx.fillRect(Math.round(x),Math.round(y+(h/3-size)/2),size,size);
      }
    }
  }

  function frame(time){animation=0;if(!lastTime)lastTime=time;elapsed+=Math.min(80,time-lastTime);lastTime=time;draw();schedule();}
  function schedule(){cancelAnimationFrame(animation);animation=0;if(dynamic()&&!paused&&!document.hidden)animation=requestAnimationFrame(frame);}
  function syncPause(){for(const id of ['pauseMotion','overlayPause'])document.getElementById(id).textContent=paused?'继续':'暂停';}
  function togglePause(){paused=!paused;lastTime=0;syncPause();schedule();showControls();}
  function showControls(){
    clearTimeout(hideTimer);stage.classList.remove('controls-hidden');
    if(testing)hideTimer=setTimeout(()=>{if(!overlay.matches(':hover')&&!overlay.contains(document.activeElement))stage.classList.add('controls-hidden');},1800);
  }
  function syncFullscreen(){
    const active=document.fullscreenElement===stage;
    document.getElementById('fullscreenHint').textContent=active?'':'窗口模式';
    document.getElementById('retryFullscreen').hidden=active||!stage.requestFullscreen;
  }
  function restoreFocus(){if(!testing&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
  async function enterFullscreen(){
    try{if(stage.requestFullscreen){await stage.requestFullscreen();nativeFullscreen=document.fullscreenElement===stage;}}catch(_){nativeFullscreen=false;}
    if(!testing&&document.fullscreenElement===stage)await document.exitFullscreen();
    syncFullscreen();resize();if(!testing)requestAnimationFrame(restoreFocus);
  }
  function start(){
    previousFocus=document.activeElement;testing=true;nativeFullscreen=false;
    stage.classList.add('is-testing');overlay.hidden=false;stage.focus({preventScroll:true});
    showControls();resize();enterFullscreen();
  }
  function stop(){
    if(!testing)return;testing=false;nativeFullscreen=false;clearTimeout(hideTimer);
    stage.classList.remove('is-testing','controls-hidden');overlay.hidden=true;
    if(document.fullscreenElement===stage)document.exitFullscreen().catch(()=>{}).then(()=>requestAnimationFrame(restoreFocus));
    else requestAnimationFrame(restoreFocus);
    requestAnimationFrame(resize);
  }
  document.getElementById('startTest').addEventListener('click',start);
  document.getElementById('endTest').addEventListener('click',stop);
  document.getElementById('retryFullscreen').addEventListener('click',enterFullscreen);
  document.getElementById('previousPattern').addEventListener('click',()=>select(current-1));
  document.getElementById('nextPattern').addEventListener('click',()=>select(current+1));
  for(const id of ['pauseMotion','overlayPause'])document.getElementById(id).addEventListener('click',togglePause);
  document.getElementById('motionSpeed').addEventListener('input',event=>{document.getElementById('speedValue').textContent=event.target.value+' px/s';draw();});
  canvas.addEventListener('click',()=>{if(testing)select(current+1);});
  stage.addEventListener('pointermove',showControls);
  stage.addEventListener('focusin',showControls);
  overlay.addEventListener('pointerleave',showControls);
  document.addEventListener('keydown',event=>{
    if(!testing)return;
    if(event.key==='Escape'){event.preventDefault();stop();return;}
    if(event.key==='Tab'){showControls();return;}
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    if(['BUTTON','INPUT','SELECT'].includes(document.activeElement.tagName))return;
    if(['ArrowRight','ArrowDown',' ','Enter'].includes(event.key)){event.preventDefault();select(current+1);}
    if(['ArrowLeft','ArrowUp'].includes(event.key)){event.preventDefault();select(current-1);}
    if(event.key==='Home'){event.preventDefault();select(0);}
    if(event.key==='End'){event.preventDefault();select(patterns.length-1);}
  });
  document.addEventListener('fullscreenchange',()=>{
    if(testing&&nativeFullscreen&&document.fullscreenElement!==stage){stop();return;}
    if(document.fullscreenElement===stage)nativeFullscreen=true;
    syncFullscreen();resize();if(!testing)requestAnimationFrame(restoreFocus);
  });
  document.addEventListener('visibilitychange',()=>{lastTime=0;schedule();});
  let resizeFrame=0;
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(resize);}).observe(stage);
  window.addEventListener('resize',resize);
  select(0);
})();
