(() => {
  const $=id=>document.getElementById(id),tool=document.body.dataset.tool;
  const ids=tool==='windows-errors'?['query','family']:tool==='ip-batch'?['inputValue','batchMode']:['inputValue'];
  const saved=Ops.readState();Ops.restoreFields(saved,ids);
  const remember=patch=>Ops.saveState({...Ops.readState(),...Ops.fieldValues(ids),...patch});
  let resultText='';
  function clear(message){resultText='';Ops.status($('toolStatus'),message,true);if($('resultFields'))$('resultFields').replaceChildren();if($('copyResult'))$('copyResult').disabled=true;}
  if(tool==='subnet'||tool==='mac'){
    function calculate(move=true){
      remember({calculated:true});
      try{
        let entries;
        if(tool==='subnet'){
          const n=NetCore.subnet($('inputValue').value);
          entries=[['规范地址',n.address],['网络地址 / CIDR',n.cidr],['子网掩码',n.mask],['地址总数',n.total],['可用地址数',n.usable],['广播地址',n.broadcast],['首个可用地址',n.firstHost],['最后可用地址',n.lastHost],['地址范围起点',n.first],['地址范围终点',n.last],['反掩码',n.wildcard],['协议',n.version]];
        }else{
          const m=NetCore.mac($('inputValue').value);
          entries=[['冒号格式',m.colon],['连字符格式',m.hyphen],['Cisco 格式',m.cisco],['无分隔符',m.plain],['地址类型',m.broadcast?'广播':m.multicast?'组播':'单播'],['管理方式',m.local?'本地管理':'全局管理'],['前 24 位 / OUI',m.oui],['Modified EUI-64',m.multicast?'不适用于组播／广播地址':m.eui64]];
        }
        Ops.fields($('resultFields'),entries);resultText=entries.map(([key,value])=>key+'：'+value).join('\n');$('copyResult').disabled=false;Ops.status($('toolStatus'),'');Ops.status($('copyStatus'),'');if(move)Ops.result();
      }catch(error){clear(error.message);}
    }
    $('toolForm').addEventListener('submit',event=>{event.preventDefault();calculate();});
    $('inputValue').addEventListener('input',()=>{remember({calculated:false});clear('');Ops.status($('copyStatus'),'');});
    $('copyResult').addEventListener('click',()=>Ops.copy(resultText,$('copyStatus')));
    if($('ipv6Example'))$('ipv6Example').addEventListener('click',()=>{$('inputValue').value='2001:db8:1:2::1234/64';calculate();});
    if(saved.calculated===false)clear('');else calculate(false);
  }
  if(tool==='ip-batch'){
    const invalidate=()=>{remember({processed:false});resultText='';$('outputValue').value='';$('resultCount').textContent='0 项';$('copyResult').disabled=$('downloadResult').disabled=true;Ops.status($('copyStatus'),'');};
    $('inputValue').addEventListener('input',invalidate);$('batchMode').addEventListener('change',invalidate);
    $('processBatch').addEventListener('click',()=>{
      invalidate();try{const result=NetCore.batch($('inputValue').value,$('batchMode').value);resultText=result.lines.join('\n');$('outputValue').value=resultText;$('resultCount').textContent=result.lines.length+' 项';$('copyResult').disabled=$('downloadResult').disabled=!resultText;Ops.status($('toolStatus'),`输入 ${result.input} 项，输出 ${result.lines.length} 项`);remember({processed:true});Ops.result();}catch(error){Ops.status($('toolStatus'),error.message,true);}
    });
    $('batchExample').addEventListener('click',()=>{$('inputValue').value='192.168.1.0/25\n192.168.1.128/25\n192.168.1.1\n2001:db8::/65\n2001:db8:0:0:8000::/65';$('batchMode').value='merge';invalidate();});
    $('copyResult').addEventListener('click',()=>Ops.copy(resultText,$('copyStatus')));$('downloadResult').addEventListener('click',()=>Ops.save(resultText,'ip-list.txt'));
    if(saved.processed===true){try{const result=NetCore.batch($('inputValue').value,$('batchMode').value);resultText=result.lines.join('\n');$('outputValue').value=resultText;$('resultCount').textContent=result.lines.length+' 项';$('copyResult').disabled=$('downloadResult').disabled=!resultText;}catch{invalidate();}}
  }
  if(tool==='windows-errors'){
    const pager=Ops.pager($('errorResults'),$('errorPager'),record=>{
      const card=Ops.node('article','record');card.append(Ops.node('h3','',record.name),Ops.node('div','record-code',`${record.family==='BugCheck'?'蓝屏':record.family} · ${record.hex} · ${record.decimal}`),Ops.node('p','',record.message),Ops.node('p','advice',record.advice));
      if(record.related)card.append(Ops.node('p','code-note',record.related));return card;
    },220);
    function search(move=true){remember({calculated:true});try{const result=WindowsErrors.lookup($('query').value,$('family').value);pager.set(result);$('resultCount').textContent=result.length+' 项';Ops.status($('toolStatus'),result.length?'':'未找到匹配的代码');if(move)Ops.result();}catch(error){pager.set([]);$('resultCount').textContent='0 项';Ops.status($('toolStatus'),error.message,true);}}
    $('toolForm').addEventListener('submit',event=>{event.preventDefault();search();});$('family').addEventListener('change',()=>search(false));
    document.querySelectorAll('[data-query]').forEach(button=>button.addEventListener('click',()=>{$('query').value=button.dataset.query;$('family').value=button.dataset.family||'all';search();}));
    $('query').addEventListener('input',()=>{remember({calculated:false});pager.set([]);$('resultCount').textContent='';Ops.status($('toolStatus'),'');});
    $('dataCount').textContent=`离线收录 ${WindowsErrors.count.toLocaleString()} 项`;if(saved.calculated!==false)search(false);
  }
})();
