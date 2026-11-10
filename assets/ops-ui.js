const Ops=(()=>{
  function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function status(el,message,error=false){el.textContent=message;el.dataset.tone=error?'error':'';}
  async function copy(text,el){try{await navigator.clipboard.writeText(text);status(el,'已复制');}catch(_){status(el,'复制失败，请手动选择内容复制',true);}}
  function save(text,name,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type})),a=node('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function csv(rows){return '\ufeff'+rows.map(row=>row.map(value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');}
  function show(view){document.body.dataset.view=view;document.querySelectorAll('[data-view-target]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.viewTarget===view)));}
  function fields(container,entries){container.replaceChildren();for(const [label,value] of entries){const item=node('div','result-item');item.append(node('dt','',label),node('dd','',value));container.append(item);}}
  function pager(list,controls,draw,rowHeight=150){
    let entries=[],page=0,size=1;
    const previous=node('button','','←'),label=node('span'),next=node('button','','→');
    previous.type=next.type='button';previous.setAttribute('aria-label','上一页');next.setAttribute('aria-label','下一页');controls.append(previous,label,next);
    function render(){size=Math.max(1,Math.floor(list.clientHeight/rowHeight));const count=Math.max(1,Math.ceil(entries.length/size));page=Math.max(0,Math.min(page,count-1));list.replaceChildren();if(!entries.length)list.append(node('p','empty','暂无结果'));else entries.slice(page*size,(page+1)*size).forEach(item=>list.append(draw(item)));label.textContent=`${page+1} / ${count}`;previous.disabled=page===0;next.disabled=page===count-1;controls.dataset.single=String(count===1);}
    previous.addEventListener('click',()=>{page--;render();});next.addEventListener('click',()=>{page++;render();});new ResizeObserver(render).observe(list);
    return {set(items){entries=items;page=0;render();},refresh:render};
  }
  document.querySelectorAll('[data-view-target]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.viewTarget)));
  return {node,status,copy,save,csv,show,fields,pager,result(){if(matchMedia('(max-width:760px)').matches)show('result');}};
})();
