const Ops=(()=>{
  const viewKey='pocket-ops-view-v1:'+location.pathname;
  function readState(){try{const saved=JSON.parse(sessionStorage.getItem(viewKey)||'{}');return saved?.schema===1&&saved.value&&typeof saved.value==='object'?saved.value:{};}catch{return {};}}
  function saveState(value){try{const text=JSON.stringify({schema:1,value});if(text.length>1048576){sessionStorage.removeItem(viewKey);return;}sessionStorage.setItem(viewKey,text);}catch{}}
  function restoreFields(saved,ids){for(const id of ids){const el=document.getElementById(id),value=saved[id];if(!el)continue;if(el.type==='checkbox'){if(typeof value==='boolean')el.checked=value;}else if(typeof value==='string'&&value.length<=524288){if(el.tagName!=='SELECT'||[...el.options].some(option=>option.value===value))el.value=value;}}}
  function fieldValues(ids){return Object.fromEntries(ids.map(id=>{const el=document.getElementById(id);return [id,el?.type==='checkbox'?el.checked:el?.value??''];}));}
  function safeURL(value){if(!value)return '';try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password&&![...url.searchParams.keys()].some(k=>/token|secret|password|credential|signature|api.?key|auth/i.test(k))&&!/token|secret|password|credential|signature|api.?key|auth/i.test(url.hash)?value:'';}catch{return '';}}
  function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function status(el,message,error=false){el.textContent=message;el.dataset.tone=error?'error':'';}
  async function copy(text,el){try{await navigator.clipboard.writeText(text);status(el,'已复制');}catch(_){status(el,'复制失败，请手动选择内容复制',true);}}
  function save(text,name,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type})),a=node('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function csv(rows){return '\ufeff'+rows.map(row=>row.map(value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');}
  function show(view){if(!['input','result'].includes(view))return;document.body.dataset.view=view;document.querySelectorAll('[data-view-target]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.viewTarget===view)));saveState({...readState(),view});}
  function fields(container,entries){container.replaceChildren();for(const [label,value] of entries){const item=node('div','result-item');item.append(node('dt','',label),node('dd','',value));container.append(item);}}
  function pager(list,controls,draw,rowHeight=150){
    const saved=readState().pagers?.[list.id];let entries=[],page=0,size=1,signature=null;
    const previous=node('button','','←'),label=node('span'),next=node('button','','→');
    previous.type=next.type='button';previous.setAttribute('aria-label','上一页');next.setAttribute('aria-label','下一页');controls.append(previous,label,next);
    function render(){size=Math.max(1,Math.floor(list.clientHeight/rowHeight));const count=Math.max(1,Math.ceil(entries.length/size));page=Math.max(0,Math.min(page,count-1));list.replaceChildren();if(!entries.length)list.append(node('p','empty','暂无结果'));else entries.slice(page*size,(page+1)*size).forEach(item=>list.append(draw(item)));label.textContent=`${page+1} / ${count}`;previous.disabled=page===0;next.disabled=page===count-1;controls.dataset.single=String(count===1);}
    function rememberPage(){if(!list.id||signature===null)return;const state=readState();saveState({...state,pagers:{...state.pagers,[list.id]:{signature,page}}});}
    previous.addEventListener('click',()=>{page--;render();rememberPage();});next.addEventListener('click',()=>{page++;render();rememberPage();});new ResizeObserver(render).observe(list);
    return {set(items){entries=items;const state=readState(),fields={...state};delete fields.pagers;const nextSignature=JSON.stringify(fields);page=signature===null&&saved?.signature===nextSignature&&Number.isSafeInteger(saved.page)&&saved.page>=0?saved.page:0;signature=nextSignature;render();rememberPage();},refresh:render};
  }
  document.querySelectorAll('[data-view-target]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.viewTarget)));
  const savedView=readState().view;if(savedView)show(savedView);
  return {node,status,copy,save,csv,show,fields,pager,readState,saveState,restoreFields,fieldValues,safeURL,result(){if(matchMedia('(max-width:760px)').matches)show('result');}};
})();
