(() => {
 const $=id=>document.getElementById(id),status=(message,error=false)=>Ops.status($('commandStatus'),message,error);
 for(const vendor of SwitchCommands.vendors){const option=Ops.node('option','',vendor.name);option.value=vendor.id;$('vendorFilter').append(option);}
 const categories=[...new Set(SwitchCommands.entries.map(entry=>entry.category))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
 for(const category of categories){const option=Ops.node('option','',category);option.value=category;$('categoryFilter').append(option);}
 Ops.restoreFields(Ops.readState(),['vendorFilter','categoryFilter','commandSearch']);
 function card(entry){
  const article=Ops.node('article','command-card'),head=Ops.node('div','command-card-head'),title=Ops.node('div','command-card-title');
  title.append(Ops.node('span','command-vendor',entry.vendorName+' · '+entry.category),Ops.node('h2','',entry.title));
  const copy=Ops.node('button','secondary','复制');copy.type='button';copy.setAttribute('aria-label',`复制${entry.vendorName}命令：${entry.title}`);copy.onclick=()=>Ops.copy(entry.command,$('commandStatus'));
  head.append(title,copy);const code=Ops.node('pre','command-code');code.append(Ops.node('code','',entry.command));article.append(head,code,Ops.node('p','inline-note',entry.description));return article;
 }
 function render(){Ops.saveState({...Ops.readState(),...Ops.fieldValues(['vendorFilter','categoryFilter','commandSearch'])});const matches=SwitchCommands.search($('commandSearch').value,$('vendorFilter').value,$('categoryFilter').value);$('commandResults').replaceChildren();$('commandCount').textContent=matches.length+' 条';if(!matches.length){$('commandResults').append(Ops.node('p','empty','没有匹配的命令'));status('试试缩短关键词或切换厂商。');return;}const fragment=document.createDocumentFragment();for(const item of matches)fragment.append(card(item));$('commandResults').append(fragment);status('已找到 '+matches.length+' 条命令');}
 $('vendorFilter').onchange=render;$('categoryFilter').onchange=render;$('commandSearch').oninput=render;$('clearCommandSearch').onclick=()=>{$('commandSearch').value='';$('vendorFilter').value='all';$('categoryFilter').value='all';render();$('commandSearch').focus();};render();
})();
