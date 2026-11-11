(()=>{'use strict';const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),tool=ToolboxCatalog.tools.find(t=>t.id===params.get('id'));let current=-1;
if(!tool){$('error').hidden=false;$('error').textContent='未找到工具，请返回工具箱选择。';$('workspace').hidden=true;return;}
$('title').textContent=tool.name;document.title=tool.name+' · 工具箱';const variants=tool.variants||[];
for(const [i,v]of variants.entries()){const o=document.createElement('option');o.value=i;o.textContent=v.name;$('mode').append(o);}
$('modeLabel').hidden=variants.length<2;
function open(index){index=Math.max(0,Math.min(variants.length-1,index));if(index===current)return;const v=variants[index];if(!v)return;const url=new URL(v.href,location.href);if(url.origin!==location.origin)throw Error('工具地址无效');current=index;$('mode').value=index;$('workspace').src=url.href;const q=new URL(location.href);q.searchParams.set('mode',index);history.replaceState(null,'',q);}
$('mode').onchange=()=>open(Number($('mode').value));$('reload').onclick=()=>{$('workspace').src=$('workspace').src;};open(Number(params.get('mode'))||0);
$('workspace').onload=()=>{try{const doc=$('workspace').contentDocument;if(!doc)return;const style=doc.createElement('style');style.textContent='.toolbox-header,.toolbox-footer{display:none!important}.toolbox-shell{height:100dvh!important;grid-template-rows:minmax(0,1fr)!important;padding:0!important}.toolbox-workspace{padding:14px 0!important}';doc.head.append(style);}catch{}};
})();
