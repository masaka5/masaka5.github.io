const CLOSED_FENCE=/^[ \t]*```([^\r\n`]*)\r?\n([\s\S]*?)^[ \t]*```[ \t]*(?:\r?\n|$)/gm;

function pushText(blocks,text){
  if(!text)return;
  const previous=blocks.at(-1);
  if(previous?.type==='text')previous.text+=text;
  else blocks.push({type:'text',text,language:''});
}

export function parseMessageBlocks(value){
  const text=String(value??''),blocks=[];let cursor=0,match;
  CLOSED_FENCE.lastIndex=0;
  while((match=CLOSED_FENCE.exec(text))){
    pushText(blocks,text.slice(cursor,match.index));
    blocks.push({type:'code',text:match[2].replace(/\r?\n$/,''),language:match[1].trim()});
    cursor=match.index+match[0].length;
  }
  pushText(blocks,text.slice(cursor));
  return blocks.length?blocks:[{type:'text',text:'',language:''}];
}

export function renderMessageBody(container,value,{onCopy=()=>{}}={}){
  const blocks=parseMessageBlocks(value),detailsList=[];
  container.replaceChildren();
  for(const block of blocks){
    if(block.type==='text'){
      container.append(document.createTextNode(block.text));
      continue;
    }
    const details=document.createElement('details');details.className='code-block';details.open=true;
    const summary=document.createElement('summary');summary.className='code-summary';
    const label=document.createElement('span');label.className='code-language';label.textContent=block.language||'代码';
    const copy=document.createElement('button');copy.type='button';copy.className='text-button code-copy';copy.textContent='复制';copy.setAttribute('aria-label','复制代码');
    copy.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();onCopy(block.text,copy);});
    summary.append(label,copy);details.append(summary);
    const pre=document.createElement('pre');const code=document.createElement('code');code.textContent=block.text;pre.append(code);details.append(pre);
    container.append(details);detailsList.push(details);
  }
  const toggleAll=open=>detailsList.forEach(details=>{details.open=Boolean(open);});
  return {codeBlocks:detailsList.length,toggleAll:detailsList.length?toggleAll:null};
}
