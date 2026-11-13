import initSqlJs from'sql.js';
import {baseCard,customCards,clozeNumbers,cardSides,textOnly}from'./cards.mjs';
import {createScheduler,DAY,studyDay}from'./scheduler.mjs';
import {openStorage,storageGet,storagePut,storageCommit,storageMedia,createDatabase,rows,one,getMeta,setMeta,saveCard,getCard}from'./storage.mjs';
import {vocabularyManifest,builtinCard,searchVocabulary,cacheVocabulary}from'./vocabulary.mjs';
import {parseDelimited,exportDelimited,importAnki,exportAnki,makeBackup,readBackup}from'./formats.mjs';
let SQL,db,storage,scheduler,vocabulary,revision=0,initializing;
const defaults={dailyNew:20,retention:.9,autoplay:false,typing:false,reverse:false,burySiblings:true,fontSize:32};
const notify=(id,data)=>self.postMessage({id,event:'progress',...data});
const settingsFor=deck=>({...defaults,...getMeta(db,'settings',{}),...JSON.parse(one(db,'SELECT settings FROM decks WHERE id=?',[deck])?.settings||'{}')});
async function initialize(){
 if(initializing)return initializing;
 initializing=(async()=>{
  [SQL,storage,vocabulary,scheduler]=await Promise.all([initSqlJs({locateFile:()=>new URL('./sql-wasm.wasm',import.meta.url).href}),openStorage(),vocabularyManifest(),fetch(new URL('./fsrs.wasm',import.meta.url)).then(r=>{if(!r.ok)throw Error('排程引擎加载失败。');return r.arrayBuffer();}).then(createScheduler)]);
  const setup=async()=>{await reload();if(!db)db=createDatabase(SQL);
  for(const dict of vocabulary.languages){db.run('INSERT OR IGNORE INTO decks(id,name,language,builtin) VALUES(?,?,?,1)',[dict.id,dict.name,dict.language]);}
  if(getMeta(db,'vocabularyRevision')!==vocabulary.revision){db.run('UPDATE decks SET cursor=0 WHERE builtin=1');setMeta(db,'vocabularyRevision',vocabulary.revision);await persist();}};
  if(navigator.locks)await navigator.locks.request('pocket-anki-collection',setup);else await setup();
 })();return initializing;
}
async function reload(){const state=await storageGet(storage,'state','collection');if(state&&state.revision!==revision){const loaded=new SQL.Database(state.bytes);db?.close();db=loaded;revision=state.revision;}}
async function persist(media=[]){const next={bytes:db.export(),revision:Math.max(Date.now(),revision+1)};await storageCommit(storage,next,media);revision=next.revision;}
async function mutate(fn){
 const perform=async()=>{await reload();const before=db.export();db.run('BEGIN');
  try{const context={media:[]},result=await fn(context);db.run('COMMIT');await persist(context.media);return result;}
  catch(error){try{db.run('ROLLBACK');}catch{}db.close();db=new SQL.Database(before);throw error;}
 };
 // Serialize writes across tabs as well as within this Worker.
 if(navigator.locks)return navigator.locks.request('pocket-anki-collection',perform);
 return perform();
}
function deckSummary(deck,now=Date.now()){
 const day=studyDay(now),today=one(db,'SELECT count(*) AS total,sum(was_new) AS new,sum(duration) AS duration,sum(CASE WHEN rating>1 THEN 1 ELSE 0 END) AS correct FROM reviews WHERE deck=? AND time>=?',[deck.id,day]);
 const counts=one(db,'SELECT count(*) AS count,sum(CASE WHEN state>0 THEN 1 ELSE 0 END) AS studied,sum(CASE WHEN due<=? AND state>0 AND suspended=0 AND buried<=? THEN 1 ELSE 0 END) AS due,sum(CASE WHEN state IN (1,3) AND suspended=0 THEN 1 ELSE 0 END) AS learning FROM cards WHERE deck=?',[now,now,deck.id]);
 const dict=vocabulary.languages.find(d=>d.id===deck.id),settings=settingsFor(deck.id);
 return{...deck,settings,total:dict?.count||counts.count,studied:counts.studied||0,due:counts.due||0,learning:counts.learning||0,today:today.total,newToday:today.new||0,duration:today.duration||0,correct:today.correct||0,availableNew:settings.dailyNew?Math.max(0,settings.dailyNew-(today.new||0)):Infinity};
}
function dashboard(){return{decks:rows(db,'SELECT * FROM decks ORDER BY builtin DESC,rowid').map(d=>deckSummary(d)),settings:{...defaults,...getMeta(db,'settings',{})},engine:scheduler.engine,vocabulary:vocabulary.languages.map(({id,count,source,sourceUrl,license,glossLanguage})=>({id,count,source,sourceUrl,license,glossLanguage})),canUndo:!!getMeta(db,'undo'),saved:revision};}
async function materialize(id){
 const stored=getCard(db,id);if(stored)return stored;
 const lang=id.split(':')[0];if(!['en','ja'].includes(lang))throw Error('卡片不存在。');
 const result=await searchVocabulary(lang,{allowed:new Set([id]),pageSize:1});if(!result.cards.length)throw Error('卡片不存在。');return result.cards[0];
}
async function nextCard({deck,practice=false}){
 const now=Date.now(),summary=deckSummary(one(db,'SELECT * FROM decks WHERE id=?',[deck]),now),settings=summary.settings;
 let record=one(db,'SELECT json FROM cards WHERE deck=? AND state>0 AND suspended=0 AND buried<=? AND due<=? ORDER BY CASE WHEN state IN(1,3) THEN 0 ELSE 1 END,due LIMIT 1',[deck,now,now]);
 let card=record?JSON.parse(record.json):null;
 if(!card&&(summary.availableNew>0||practice)){
  record=one(db,'SELECT json FROM cards WHERE deck=? AND state=0 AND suspended=0 AND buried<=? ORDER BY rowid LIMIT 1',[deck,now]);card=record?JSON.parse(record.json):null;
  if(!card&&summary.builtin){
   let cursor=summary.cursor,found=null;
   const dict=vocabulary.languages.find(d=>d.id===deck);
   while(cursor<dict.count){const candidate=await builtinCard(deck,cursor++);if(!getCard(db,candidate.id)){found=candidate;break;}}
   db.run('UPDATE decks SET cursor=? WHERE id=?',[cursor,deck]);if(found){saveCard(db,found);card=found;}
  }
 }
 if(!card&&practice){record=one(db,'SELECT json FROM cards WHERE deck=? AND state>0 AND suspended=0 AND buried<=? ORDER BY due LIMIT 1',[deck,now]);card=record?JSON.parse(record.json):null;}
 const upcoming=one(db,'SELECT min(due) AS time FROM cards WHERE deck=? AND state>0 AND suspended=0 AND buried<=?',[deck,now])?.time;
 if(card)card.language=summary.language;
 return{card,plans:card?scheduler.plan(card,settings,now):[],summary,upcoming,practice};
}
async function browse({deck,query='',filter='all',page=1,pageSize=25}){
 const builtin=one(db,'SELECT builtin FROM decks WHERE id=?',[deck])?.builtin,now=Date.now();let allowed=null;
 const clauses={studied:'state>0',due:'state>0 AND due<='+now,suspended:'suspended=1',flagged:'flag>0',new:'state=0'};
 if(filter!=='all'&&clauses[filter])allowed=new Set(rows(db,`SELECT id FROM cards WHERE deck=? AND ${clauses[filter]}`,[deck]).map(r=>r.id));
 if(builtin){
  const excluded=new Set(rows(db,'SELECT json FROM cards WHERE id LIKE ?',[deck+':%']).map(r=>JSON.parse(r.json)).filter(c=>c.deck!==deck||c.deleted).map(c=>c.builtinIndex));
  const extra=rows(db,'SELECT json FROM cards WHERE deck=?',[deck]).map(r=>JSON.parse(r.json)).filter(c=>!c.id.startsWith(deck+':')&&!c.deleted&&(!allowed||allowed.has(c.id))&&query.toLowerCase().trim().split(/\s+/).every(t=>[c.front,c.back,c.reading,c.tags.join(' ')].join(' ').toLowerCase().includes(t)));
  const start=(page-1)*pageSize,own=extra.slice(start,start+pageSize),remaining=pageSize-own.length,offset=Math.max(0,start-extra.length);
  const result=await searchVocabulary(deck,{query,page:1,pageSize:remaining,offset,allowed,excluded});
  return{total:result.total+extra.length,cards:[...own,...result.cards.map(c=>getCard(db,c.id)||c)]};
 }
 const values=rows(db,'SELECT json FROM cards WHERE deck=? ORDER BY rowid',[deck]).map(r=>JSON.parse(r.json));
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean),filtered=values.filter(c=>(!allowed||allowed.has(c.id))&&terms.every(t=>[c.front,c.back,c.reading,c.tags.join(' ')].join(' ').toLowerCase().includes(t)));
 return{total:filtered.length,cards:filtered.slice((page-1)*pageSize,page*pageSize)};
}
async function grade({id,rating,duration=0,expectedReps,practice=false}){
 const card=getCard(db,id);if(!card)throw Error('卡片记录不存在，请重新打开牌组。');
 if(!Number.isInteger(rating)||rating<1||rating>4)throw Error('评分无效。');
 if(expectedReps!==undefined&&card.reps!==expectedReps)throw Error('卡片已在另一个窗口复习，请刷新当前卡片。');
 const now=Date.now(),next=scheduler.plan(card,settingsFor(card.deck),now)[rating-1];saveCard(db,next);
 db.run('INSERT INTO reviews(card,deck,time,rating,duration,was_new,json) VALUES(?,?,?,?,?,?,?)',[id,card.deck,now,rating,Math.max(0,duration),card.state===0?1:0,JSON.stringify({before:card,after:next,practice})]);
 const log=one(db,'SELECT last_insert_rowid() AS id').id,siblings=[];
 if(settingsFor(card.deck).burySiblings){for(const row of rows(db,'SELECT json FROM cards WHERE note=? AND id<>?',[card.noteId||card.id,id])){const sibling=JSON.parse(row.json);siblings.push({...sibling});sibling.buriedUntil=studyDay(now)+DAY;saveCard(db,sibling);}}
 setMeta(db,'undo',{card,siblings,log});return{graded:next};
}
async function editCards({card,note,deck}){
 setMeta(db,'undo',null);
 if(card?.id){
  const previous=await materialize(card.id);
  if(previous.model){
   const updated={...previous,fields:note.fields||previous.fields,tags:String(note.tags||'').split(/\s+/).filter(Boolean),deck:deck||previous.deck};
   if(previous.model.type===1){
    const text=updated.fields.join('\n'),ordinals=new Set(clozeNumbers(text).map(n=>n-1));if(!ordinals.size)throw Error('填空卡片需要包含 {{c1::内容}}。');
    const existing=rows(db,'SELECT json FROM cards WHERE note=?',[previous.noteId]).map(r=>JSON.parse(r.json));
    for(const sibling of existing)if(!ordinals.has(sibling.clozeOrdinal))db.run('DELETE FROM cards WHERE id=?',[sibling.id]);
    for(const ordinal of ordinals){const old=existing.find(c=>c.clozeOrdinal===ordinal),fresh=baseCard({id:`${previous.noteId}:c${ordinal}`,noteId:previous.noteId,guid:previous.guid,model:previous.model,ordinal:0,clozeOrdinal:ordinal,language:previous.language});saveCard(db,{...(old||fresh),fields:updated.fields,tags:updated.tags,deck:updated.deck,front:textOnly(updated.fields[0]),back:textOnly(updated.fields[1]||'')});}return;
   }
   for(const row of rows(db,'SELECT json FROM cards WHERE note=?',[previous.noteId])){const sibling=JSON.parse(row.json);saveCard(db,{...sibling,fields:updated.fields,tags:updated.tags,deck:updated.deck,front:textOnly(updated.fields[0]),back:textOnly(updated.fields[1]||'')});}return;
  }
  if(previous.type==='cloze'){
   const updated={...note,tags:String(note.tags||'').split(/\s+/).filter(Boolean),language:previous.language,type:'cloze'},generated=customCards(updated,deck||previous.deck,previous.noteId),keep=new Set(generated.map(c=>c.id));
   for(const row of rows(db,'SELECT id FROM cards WHERE note=?',[previous.noteId]))if(!keep.has(row.id))db.run('DELETE FROM cards WHERE id=?',[row.id]);
   for(const candidate of generated){const old=getCard(db,candidate.id);saveCard(db,{...candidate,...old,...updated,clozeOrdinal:candidate.clozeOrdinal,deck:deck||previous.deck});}return;
  }
  const updated={...previous,...note,tags:String(note.tags||'').split(/\s+/).filter(Boolean),deck:deck||previous.deck};saveCard(db,updated);
  if(previous.type==='reverse')for(const row of rows(db,'SELECT json FROM cards WHERE note=? AND id<>?',[previous.noteId,previous.id])){const sibling=JSON.parse(row.json);saveCard(db,{...sibling,front:updated.back,back:updated.front,reading:updated.reading,extra:updated.extra,tags:updated.tags,deck:updated.deck});}return;
 }
 if(!one(db,'SELECT id FROM decks WHERE id=?',[deck]))throw Error('请选择有效牌组。');
 if(!note.front?.trim()||(note.type!=='cloze'&&!note.back?.trim()))throw Error('请填写正面和背面。');
 for(const value of customCards({...note,language:one(db,'SELECT language FROM decks WHERE id=?',[deck]).language},deck))saveCard(db,value);
}
async function bulk({ids,action,value}){
 for(const id of ids){const card=await materialize(id);
  if(action==='suspend')card.suspended=Boolean(value);
  else if(action==='bury')card.buriedUntil=value?studyDay()+DAY:0;
  else if(action==='flag')card.flag=value?1:0;
  else if(action==='tags')card.tags=[...new Set([...card.tags,...String(value).split(/\s+/).filter(Boolean)])];
  else if(action==='move'){if(!one(db,'SELECT id FROM decks WHERE id=?',[value]))throw Error('目标牌组不存在。');card.deck=value;}
  else if(action==='reset'){Object.assign(card,{state:0,due:0,lastReview:0,s:0,d:0,reps:0,lapses:0,step:0});}
  else if(action==='delete'){
   if(card.builtinIndex!==undefined){card.suspended=true;card.deleted=true;saveCard(db,card);}else db.run('DELETE FROM cards WHERE id=?',[id]);continue;
  }else throw Error('未知卡片操作。');saveCard(db,card);
 }setMeta(db,'undo',null);
}
function statistics({deck}){
 const day=studyDay(),logs=rows(db,'SELECT * FROM reviews WHERE deck=? ORDER BY time',[deck]),daily=new Map();
 for(const log of logs){const key=studyDay(log.time),value=daily.get(key)||{time:key,count:0,correct:0,duration:0};value.count++;value.correct+=log.rating>1?1:0;value.duration+=log.duration;daily.set(key,value);}
 let streak=0,cursor=daily.has(day)?day:day-DAY;while(daily.has(cursor)){streak++;const prev=new Date(cursor);prev.setDate(prev.getDate()-1);cursor=prev.getTime();}
 const cards=rows(db,'SELECT json FROM cards WHERE deck=?',[deck]).map(r=>JSON.parse(r.json)),mature=cards.filter(c=>c.s>=21).length;
 const nextDays=Array.from({length:14},(_,i)=>{const d=new Date(day);d.setDate(d.getDate()+i);const end=new Date(d);end.setDate(end.getDate()+1);return{time:d.getTime(),count:cards.filter(c=>c.state>0&&!c.suspended&&c.due>=d.getTime()&&c.due<end.getTime()).length};});
 return{summary:deckSummary(one(db,'SELECT * FROM decks WHERE id=?',[deck])),reviews:logs.length,correct:logs.filter(l=>l.rating>1).length,duration:logs.reduce((n,l)=>n+l.duration,0),mature,streak,daily:[...daily.values()],nextDays,recent:logs.slice(-30).reverse().map(l=>({...l,front:getCard(db,l.card)?.front||'已删除的卡片'}))};
}
async function importFile({bytes,name,targetDeck,withScheduling=true},id){
 const data=new Uint8Array(bytes);let imported;
 if(/\.apkg$|\.colpkg$/i.test(name))imported=importAnki(SQL,data,{name:name.replace(/\.(apkg|colpkg)$/i,''),withScheduling});
 else{
  const text=new TextDecoder('utf-8',{fatal:true}).decode(data),parsed=/\.json$/i.test(name)?JSON.parse(text):parseDelimited(text);
  const list=Array.isArray(parsed)?parsed:parsed.cards;if(!Array.isArray(list))throw Error('JSON 需要包含卡片数组。');
  const deck=targetDeck||'deck:'+crypto.randomUUID(),decks=targetDeck?[]:[{id:deck,name:name.replace(/\.[^.]+$/,''),language:'en-US',builtin:0}];
  if(parsed.format==='pocket-anki-cards'){
   for(const card of list)if(typeof card.id!=='string'||typeof card.front!=='string'||!Array.isArray(card.tags)||!Number.isFinite(card.due)||card.model&&(!Array.isArray(card.model.fields)||!Array.isArray(card.model.templates)))throw Error('JSON 卡片结构无效。');
   imported={decks,cards:list.map(card=>baseCard({...card,deck,builtinIndex:undefined})),media:[],reviews:[],warnings:[]};
  }else imported={decks,cards:list.flatMap(note=>customCards({...note,type:note.type||'basic'},deck)),media:[],reviews:[],warnings:[]};
 }
 if(!imported.cards.length)throw Error('文件中没有可导入的卡片。');
 for(const entry of imported.decks)db.run('INSERT OR IGNORE INTO decks(id,name,language,builtin) VALUES(?,?,?,0)',[entry.id,entry.name,entry.language]);
 // Validate all media before changing the collection; writes of additional media
 // are harmless if a later transaction is rolled back.
 const renames=new Map();
 for(const file of imported.media){
  if(file.sha1){const digest=new Uint8Array(await crypto.subtle.digest('SHA-1',file.bytes));if(file.sha1.length!==digest.length||digest.some((v,i)=>v!==file.sha1[i]))throw Error('媒体校验失败：'+file.name);}
  let mediaName=file.name;const old=await storageGet(storage,'media',mediaName);
  if(old&&!(old.length===file.bytes.length&&old.every((v,i)=>v===file.bytes[i]))){const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',file.bytes))].slice(0,6).map(n=>n.toString(16).padStart(2,'0')).join('');mediaName=digest+'-'+file.name;renames.set(file.name,mediaName);}
  await storagePut(storage,'media',mediaName,file.bytes);
 }
 let updated=0;
 for(let i=0;i<imported.cards.length;i++){
  let card=imported.cards[i];for(const [from,to]of renames){card.fields=card.fields?.map(value=>value.replaceAll(from,to));}
  const old=getCard(db,card.id);if(old){updated++;card={...old,front:card.front,back:card.back,fields:card.fields,model:card.model,tags:card.tags};}
  saveCard(db,card);if(i%500===0){notify(id,{label:'导入卡片',finished:i,total:imported.cards.length});await new Promise(r=>setTimeout(r,0));}
 }
 for(const r of imported.reviews){if(!one(db,'SELECT id FROM reviews WHERE card=? AND time=?',[r.card,r.time]))db.run('INSERT INTO reviews(card,deck,time,rating,duration,was_new,json) VALUES(?,?,?,?,?,?,?)',[r.card,r.deck,r.time,r.rating,r.duration,r.wasNew,r.json]);}
 setMeta(db,'undo',null);return{count:imported.cards.length,updated,decks:imported.decks,warnings:imported.warnings};
}
async function exportFile({deck,format='apkg',full=false},id){
 const decks=deck?rows(db,'SELECT * FROM decks WHERE id=?',[deck]):rows(db,'SELECT * FROM decks'),media=await storageMedia(storage);
 if(format==='backup')return{bytes:makeBackup(db.export(),media),name:'Anki-学习备份.zip',mime:'application/zip'};
 let cards=rows(db,deck?'SELECT json FROM cards WHERE deck=?':'SELECT json FROM cards',deck?[deck]:[]).map(r=>JSON.parse(r.json));
 if(full){for(const d of decks.filter(d=>d.builtin)){
  const dict=vocabulary.languages.find(v=>v.id===d.id),seen=new Set(cards.filter(c=>c.deck===d.id).map(c=>c.id));
  for(let i=0;i<dict.count;i++){const card=await builtinCard(d.id,i);if(!seen.has(card.id))cards.push(card);if(i%1500===0){notify(id,{label:'整理完整词库',finished:i,total:dict.count});await new Promise(r=>setTimeout(r,0));}}
 }}
 if(!cards.length)throw Error('尚无已学或自建卡片，可选择导出完整词库。');
 const filename=(decks.length===1?decks[0].name:'全部牌组').replace(/[\\/:*?"<>|]/g,'_');
 if(format==='csv'||format==='tsv')return{bytes:new TextEncoder().encode(exportDelimited(cards,format==='csv'?',':'\t')),name:filename+'.'+format,mime:'text/plain;charset=utf-8'};
 if(format==='json')return{bytes:new TextEncoder().encode(JSON.stringify({format:'pocket-anki-cards',cards},null,2)),name:filename+'.json',mime:'application/json'};
 const reviews=rows(db,deck?'SELECT * FROM reviews WHERE deck=?':'SELECT * FROM reviews',deck?[deck]:[]);
 notify(id,{label:'打包 Anki 牌组',finished:cards.length,total:cards.length});
 return{bytes:exportAnki(SQL,cards,decks,reviews,media),name:filename+'.apkg',mime:'application/octet-stream'};
}
const mutations=new Set(['next','grade','undo','edit','bulk','deck','settings','import','restore']);
async function dispatch(action,args,id){
 await initialize();if(!mutations.has(action))await reload();
 const perform=async(context)=>{
  if(action==='init'||action==='dashboard')return dashboard();
  if(action==='next')return nextCard(args);
  if(action==='grade')return grade(args);
  if(action==='undo'){const undo=getMeta(db,'undo');if(!undo)throw Error('没有可撤销的评分。');saveCard(db,undo.card);for(const c of undo.siblings)saveCard(db,c);db.run('DELETE FROM reviews WHERE id=?',[undo.log]);setMeta(db,'undo',null);return{card:undo.card,plans:scheduler.plan(undo.card,settingsFor(undo.card.deck))};}
  if(action==='browse')return browse(args);
  if(action==='card')return materialize(args.id);
  if(action==='edit')return editCards(args);
  if(action==='bulk')return bulk(args);
  if(action==='stats')return statistics(args);
  if(action==='deck'){
   setMeta(db,'undo',null);
   if(args.remove){if(one(db,'SELECT builtin FROM decks WHERE id=?',[args.id])?.builtin)throw Error('内置词库保留，可暂停学习。');db.run('DELETE FROM reviews WHERE deck=?',[args.id]);db.run('DELETE FROM cards WHERE deck=?',[args.id]);db.run('DELETE FROM decks WHERE id=?',[args.id]);}
   else if(args.id)db.run('UPDATE decks SET name=?,language=? WHERE id=?',[args.name,args.language,args.id]);
   else db.run('INSERT INTO decks(id,name,language) VALUES(?,?,?)',['deck:'+crypto.randomUUID(),args.name,args.language]);return dashboard();
  }
  if(action==='settings'){const values={...getMeta(db,'settings',{}),...args};if(values.retention<.7||values.retention>.99||values.dailyNew<0)throw Error('请检查学习设置。');setMeta(db,'settings',values);return dashboard();}
  if(action==='import')return importFile(args,id);
  if(action==='export')return exportFile(args,id);
  if(action==='media')return storageGet(storage,'media',args.name);
  if(action==='restore'){
   const backup=readBackup(new Uint8Array(args.bytes)),loaded=new SQL.Database(backup.snapshot);
   try{if(one(loaded,'PRAGMA quick_check')?.quick_check!=='ok'||!one(loaded,"SELECT name FROM sqlite_master WHERE name='reviews'"))throw Error('备份数据库校验失败。');}catch(error){loaded.close();throw error;}
   // Replace tables inside the existing transaction so rollback remains atomic.
   let exportRows;try{exportRows={decks:rows(loaded,'SELECT id,name,language,builtin,cursor,settings FROM decks'),cards:rows(loaded,'SELECT id,note,deck,due,state,suspended,buried,flag,json FROM cards'),reviews:rows(loaded,'SELECT id,card,deck,time,rating,duration,was_new,json FROM reviews'),meta:rows(loaded,'SELECT key,value FROM meta')};}finally{loaded.close();}
   for(const [table,values]of Object.entries(exportRows)){db.run(`DELETE FROM ${table}`);for(const row of values){const columns=Object.keys(row);db.run(`INSERT INTO ${table}(${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')})`,Object.values(row));}}
   context.media=backup.media;
   setMeta(db,'undo',null);return dashboard();
  }
  throw Error('未知操作。');
 };
 return mutations.has(action)?mutate(perform):perform();
}
let queue=Promise.resolve(),downloadController;
self.onmessage=({data:message})=>{
 const {id,action,args={}}=message;
 if(action==='cancel-cache'){downloadController?.abort();return;}
 if(action==='cache'){
  downloadController=new AbortController();initialize().then(()=>cacheVocabulary(args.language,p=>notify(id,{label:'缓存词库',...p}),downloadController.signal)).then(result=>self.postMessage({id,result})).catch(error=>self.postMessage({id,error:error.message}));return;
 }
 queue=queue.then(async()=>{
  try{const result=await dispatch(action,args,id);if(result?.bytes instanceof Uint8Array)self.postMessage({id,result},[result.bytes.buffer]);else self.postMessage({id,result});}
  catch(error){const message=/out of memory|allocation/i.test(error.message)?'设备内存不足，原有学习记录未更改。':/quota/i.test(error.message)?'浏览器存储空间不足，请导出备份后清理空间。':error.message;self.postMessage({id,error:message||'操作未完成，原有记录已保留。'});}
 });
};
