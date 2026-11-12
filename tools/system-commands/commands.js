(() => {
 const $=id=>document.getElementById(id),tabs=[...document.querySelectorAll('[data-platform]')];
 const saved=Ops.readState();let platform=SystemCommands.platforms.some(p=>p.id===saved.platform)?saved.platform:'cmd';
 Ops.restoreFields(saved,['commandSearch']);
 const status=(message,error=false)=>Ops.status($('commandStatus'),message,error);
 function updatePlatform(){
  const details=SystemCommands.platforms.find(item=>item.id===platform);
  for(const tab of tabs)tab.setAttribute('aria-pressed',String(tab.dataset.platform===platform));
  $('platformScope').textContent=details.version+' · '+details.scope;
  $('platformDocs').href=details.docs;
  $('categoryFilter').replaceChildren(Ops.node('option','','全部分类'));
  $('categoryFilter').firstChild.value='all';
  for(const category of SystemCommands.categories(platform)){const option=Ops.node('option','',category);option.value=category;$('categoryFilter').append(option);}
  render();
 }
 function card(item){
  const article=Ops.node('article','system-command-card'),head=Ops.node('div','system-command-head'),copy=Ops.node('button','secondary','复制');
  const title=Ops.node('h2','',item.title),meta=Ops.node('p','system-command-meta',item.type+' · '+item.category),risk=Ops.node('span','risk-tag risk-'+item.risk,item.risk==='danger'?'高风险':item.risk==='caution'?'谨慎':'');
  copy.type='button';copy.setAttribute('aria-label','复制命令：'+item.title);copy.addEventListener('click',()=>Ops.copy(item.command,$('commandStatus')));
  head.append(title,risk,copy);
  const code=Ops.node('pre','system-command-code');code.append(Ops.node('code','',item.command));
  article.append(meta,head,code,Ops.node('p','system-command-description',item.description));
  if(item.risk==='danger')article.dataset.risk='danger';
  return article;
 }
 function render(){
  Ops.saveState({...Ops.readState(),...Ops.fieldValues(['commandSearch','categoryFilter']),platform});
  const matches=SystemCommands.search($('commandSearch').value,platform,$('categoryFilter').value);
  $('commandResults').replaceChildren();$('commandCount').textContent=matches.length+' 条';
  if(!matches.length){$('commandResults').append(Ops.node('p','empty','没有匹配的命令'));status('试试缩短关键词或切换分类。');return;}
  const fragment=document.createDocumentFragment();for(const item of matches)fragment.append(card(item));$('commandResults').append(fragment);
  status('显示 '+matches.length+' 条');
 }
 tabs.forEach(tab=>tab.addEventListener('click',()=>{platform=tab.dataset.platform;updatePlatform();}));
 $('categoryFilter').addEventListener('change',render);$('commandSearch').addEventListener('input',render);
 $('clearCommandSearch').addEventListener('click',()=>{$('commandSearch').value='';$('categoryFilter').value='all';render();$('commandSearch').focus();});
 updatePlatform();if(saved.platform===platform){Ops.restoreFields(saved,['categoryFilter']);render();}
})();
