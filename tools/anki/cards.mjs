export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const textOnly=value=>String(value??'').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#31;/g,' ').trim();
export function clozeNumbers(text){return [...new Set([...String(text).matchAll(/\{\{c(\d+)::/g)].map(m=>Number(m[1])))].sort((a,b)=>a-b);}
export function renderTemplate(template,fields,{answer=false,ordinal=0,frontSide=''}={}){
 let html=String(template||'');
 // Anki's standard conditional field sections; nested sections are resolved inside-out.
 for(let pass=0;pass<20;pass++){
  const next=html.replace(/\{\{([#^])([^{}]+)\}\}((?:(?!\{\{[#^])[\s\S])*?)\{\{\/\2\}\}/g,(_,kind,name,body)=>Boolean(textOnly(fields[name]))===(kind==='#')?body:'');
  if(next===html)break;html=next;
 }
 return html.replace(/\{\{([^{}]+)\}\}/g,(_,key)=>{
  if(key==='FrontSide')return frontSide;
  const parts=key.split(':'),name=parts.pop(),filter=parts.join(':'),value=String(fields[name]??'');
  if(filter.includes('cloze'))return value.replace(/\{\{c(\d+)::([\s\S]*?)(?:::(.*?))?\}\}/g,(__,number,text,hint)=>Number(number)===ordinal+1?`<span class="cloze">${answer?text:'['+escapeHtml(hint||'…')+']'}</span>`:text);
  if(filter.startsWith('type'))return answer?value:'<span class="type-prompt">请输入答案</span>';
  if(filter.startsWith('tts '))return value;
  if(filter==='text')return escapeHtml(textOnly(value));
  if(filter==='furigana')return value.replace(/([^\s\[\]]+)\[([^\]]+)\]/g,'<ruby>$1<rt>$2</rt></ruby>');
  return value;
 });
}
export function cardSides(card){
 if(card.model){
  const fields=Object.fromEntries(card.model.fields.map((name,i)=>[name,card.fields?.[i]||'']));
  const template=card.model.templates[card.ordinal||0]||card.model.templates[0];
  const front=renderTemplate(template?.qfmt,fields,{ordinal:card.clozeOrdinal??card.ordinal??0});
  return {front,back:renderTemplate(template?.afmt,fields,{answer:true,ordinal:card.clozeOrdinal??card.ordinal??0,frontSide:front}),css:card.model.css||''};
 }
 if(card.type==='cloze'){
  const fields={Text:card.front,Extra:card.back},options={ordinal:card.clozeOrdinal||0};
  return{front:renderTemplate('{{cloze:Text}}',fields,options),back:renderTemplate('{{cloze:Text}}<br>{{Extra}}',fields,{...options,answer:true}),css:''};
 }
 return{front:escapeHtml(card.front).replace(/\n/g,'<br>'),back:escapeHtml(card.back).replace(/\n/g,'<br>'),css:''};
}
export function baseCard(input={}){
 const tags=Array.isArray(input.tags)?input.tags:String(input.tags||'').split(/[\s,，]+/).filter(Boolean);
 return {state:0,s:0,d:0,due:0,lastReview:0,reps:0,lapses:0,step:0,suspended:false,buriedUntil:0,flag:0,reading:'',extra:'',type:'basic',...input,tags};
}
export function customCards(note,deck,id=crypto.randomUUID()){
 const values={...note,deck,noteId:id};
 if(note.type==='cloze'){
  const numbers=clozeNumbers(note.front);if(!numbers.length)throw Error('填空卡片需要包含 {{c1::内容}}。');
  return numbers.map(n=>baseCard({...values,id:`${id}:c${n}`,clozeOrdinal:n-1}));
 }
 const cards=[baseCard({...values,id:`${id}:0`})];
 if(note.type==='reverse')cards.push(baseCard({...values,id:`${id}:1`,front:note.back,back:note.front,ordinal:1}));
 return cards;
}
