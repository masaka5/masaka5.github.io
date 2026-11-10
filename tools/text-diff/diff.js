(() => {
 const $=id=>document.getElementById(id),status=(message,error=false)=>Ops.status($('diffStatus'),message,error);let lastPatch='',hasCompared=false;
 const partsOf=(text)=>{const parts=text.split('\n');if(parts.at(-1)==='')parts.pop();return parts.length?parts:[''];};
 function cell(tag,className,text){return Ops.node(tag,className,text);}
 function wordText(target,oldLine,newLine,side){for(const part of Diff.diffWordsWithSpace(oldLine,newLine)){if((side==='old'&&part.added)||(side==='new'&&part.removed))continue;const span=cell('span',part.added?'word-added':part.removed?'word-removed':'',part.value);target.append(span);}}
 function renderSide(changes){const table=cell('table','diff-table side-table'),body=cell('tbody');let oldNo=1,newNo=1,index=0;
  function row(oldValue,newValue,state){const tr=cell('tr','diff-'+state),oldNumber=cell('td','line-number',oldValue===null?'':String(oldNo)),newNumber=cell('td','line-number',newValue===null?'':String(newNo)),oldCell=cell('td','diff-code'),newCell=cell('td','diff-code');
   if(state==='change'&&oldValue!==null&&newValue!==null){wordText(oldCell,oldValue,newValue,'old');wordText(newCell,oldValue,newValue,'new');}else{oldCell.textContent=oldValue??'';newCell.textContent=newValue??'';}
   if(oldValue!==null)oldNo++;if(newValue!==null)newNo++;tr.append(oldNumber,oldCell,newNumber,newCell);body.append(tr);
  }
  while(index<changes.length){if(!changes[index].added&&!changes[index].removed){for(const line of partsOf(changes[index++].value))row(line,line,'same');continue;}
   const removed=[],added=[];while(index<changes.length&&(changes[index].added||changes[index].removed)){const part=changes[index++],target=part.removed?removed:added;target.push(...partsOf(part.value));}
   for(let i=0;i<Math.max(removed.length,added.length);i++){
    const oldLine=removed[i]??null,newLine=added[i]??null;
    row(oldLine,newLine,oldLine===null?'added':newLine===null?'removed':'change');
   }
  }
  table.append(body);return table;
 }
 function renderUnified(changes){const table=cell('table','diff-table unified-table'),body=cell('tbody');let oldNo=1,newNo=1;
  for(const part of changes){const state=part.added?'added':part.removed?'removed':'same',prefix=part.added?'+':part.removed?'−':' ';
   for(const line of partsOf(part.value)){const tr=cell('tr','diff-'+state),old=cell('td','line-number',part.added?'':String(oldNo)),next=cell('td','line-number',part.removed?'':String(newNo)),sign=cell('td','diff-sign',prefix),code=cell('td','diff-code',line);if(!part.added)oldNo++;if(!part.removed)newNo++;tr.append(old,next,sign,code);body.append(tr);}
  }
  table.append(body);return table;
 }
 function compare(){const old=$('oldText').value,newer=$('newText').value,ignoreWhitespace=$('ignoreWhitespace').checked,comparable=value=>value&&!value.endsWith('\n')?value+'\n':value,changes=Diff.diffLines(comparable(old),comparable(newer),{ignoreWhitespace});
  const added=changes.filter(part=>part.added).reduce((sum,part)=>sum+partsOf(part.value).length,0),removed=changes.filter(part=>part.removed).reduce((sum,part)=>sum+partsOf(part.value).length,0),changed=added+removed>0;
  $('diffOutput').replaceChildren();$('diffOutput').append(changed?($('diffMode').value==='side'?renderSide(changes):renderUnified(changes)):cell('p','empty',old||newer?'两段文本一致':'请输入需要比较的文本'));
  $('diffSummary').textContent=changed?'有差异':'一致';$('diffCounts').textContent=`新增 ${added} 行 · 删除 ${removed} 行`;
  lastPatch=Diff.createTwoFilesPatch('原文','修改后',old,newer,'','',{context:3});hasCompared=true;$('downloadPatch').disabled=!changed;
  status(changed?'比较完成':'没有差异');
 }
 $('compareText').onclick=compare;$('diffMode').onchange=()=>{if(hasCompared)compare();};$('ignoreWhitespace').onchange=()=>{if(hasCompared)compare();};
 $('swapText').onclick=()=>{const old=$('oldText').value;$('oldText').value=$('newText').value;$('newText').value=old;compare();};
 $('sampleText').onclick=()=>{$('oldText').value='interface GigabitEthernet1/0/1\n switchport mode access\n switchport access vlan 10\n spanning-tree portfast';$('newText').value='interface GigabitEthernet1/0/1\n switchport mode access\n switchport access vlan 20\n spanning-tree portfast\n description User port';compare();};
 $('clearText').onclick=()=>{$('oldText').value='';$('newText').value='';$('diffOutput').replaceChildren(cell('p','empty','比较结果会显示在这里'));$('diffSummary').textContent='待比较';$('diffCounts').textContent='—';$('downloadPatch').disabled=true;lastPatch='';hasCompared=false;status('已清空');};
 $('downloadPatch').onclick=()=>{if(lastPatch)Ops.save(lastPatch,'文本差异.patch','text/plain;charset=utf-8');};
})();
