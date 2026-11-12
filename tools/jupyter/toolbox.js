(() => {
 const header=document.createElement('header');header.id='toolbox-header';header.setAttribute('aria-label','工具箱导航');
 header.innerHTML='<a href="../../../">← 口袋工具箱</a><strong>在线 Jupyter</strong><span class="hint">Shift + Enter 运行 · 文件保存在此浏览器，请及时导出</span><a class="license" href="../../../licenses/jupyter.html">开源许可</a>';
 document.body.prepend(header);
 // JupyterLab attaches its application shell asynchronously.
 new MutationObserver((records,observer)=>{const shell=document.getElementById('main');if(shell){shell.style.top='44px';shell.style.bottom='0';shell.style.height='calc(100% - 44px)';window.dispatchEvent(new Event('resize'));observer.disconnect();}}).observe(document.body,{childList:true});
 let collapsedFor=null,lastWidth=innerWidth;
 const fitNotebook=()=>{
  if(innerWidth>600)return;
  const notebook=[...document.querySelectorAll('.jp-NotebookPanel')].find(panel=>panel.getBoundingClientRect().width>0);
  if(!notebook||collapsedFor===notebook)return;
  collapsedFor=notebook;
  const fileTab=document.querySelector('.jp-SideBar [data-id="filebrowser"][aria-selected="true"]');
  // Use the application's own sidebar action, preserving its keyboard behavior.
  if(fileTab){const rect=fileTab.getBoundingClientRect();fileTab.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:1,pointerType:'mouse',clientX:rect.x+rect.width/2,clientY:rect.y+rect.height/2}));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,pointerId:1,pointerType:'mouse'}));}
 };
 new MutationObserver(fitNotebook).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('resize',()=>{if(lastWidth!==innerWidth){lastWidth=innerWidth;collapsedFor=null;fitNotebook();}});
})();
