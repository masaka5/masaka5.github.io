const ready=globalThis.ToolboxCatalogReady;
if(ready)await ready;
else await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('目录加载超时')),10000);addEventListener('toolbox:catalog-ready',()=>{clearTimeout(timer);resolve();},{once:true});addEventListener('toolbox:catalog-error',event=>{clearTimeout(timer);reject(event.detail);},{once:true});});
await import('./home-react/home.js?v=f97c81740a33c300d73a');
