import {unzipSync,zipSync,strToU8,strFromU8}from'fflate';
import {decompress}from'fzstd';
import {baseCard,customCards,cardSides,textOnly,escapeHtml}from'./cards.mjs';
import {rows,one}from'./storage.mjs';
import {DAY,studyDay}from'./scheduler.mjs';
const uncompress=data=>data?.[0]===0x28&&data?.[1]===0xb5&&data?.[2]===0x2f&&data?.[3]===0xfd?decompress(data):data;
const parseJSON=(value,fallback={})=>{try{return JSON.parse(value);}catch{return fallback;}};
export function readProto(data){
 const fields=new Map();let p=0;
 const number=()=>{let n=0,m=1,b;do{if(p>=data.length||m>2**56)throw Error('数据包字段损坏。');b=data[p++];n+=(b&127)*m;m*=128;}while(b&128);return n;};
 while(p<data.length){const key=number(),field=Math.floor(key/8),wire=key%8;let value;
  if(wire===0)value=number();else if(wire===2){const n=number();if(p+n>data.length)throw Error('数据包长度错误。');value=data.slice(p,p+n);p+=n;}else if(wire===1||wire===5){const n=wire===1?8:4;value=data.slice(p,p+n);p+=n;}else throw Error('此数据包字段格式暂不支持。');
  if(!fields.has(field))fields.set(field,[]);fields.get(field).push(value);
 }return fields;
}
const protoText=(fields,n)=>strFromU8(fields.get(n)?.[0]||new Uint8Array());
export function parseDelimited(text){
 text=String(text).replace(/^\uFEFF/,'');const lines=text.split(/\r?\n/),directives={};
 while(lines[0]?.startsWith('#')){const [key,...value]=lines.shift().slice(1).split(':');directives[key.toLowerCase()]=value.join(':').trim();}
 text=lines.join('\n');const separator=directives.separator==='tab'?'\t':directives.separator==='semicolon'?';':text.split('\n')[0].includes('\t')?'\t':',';
 const result=[];let row=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(!field||quoted)quoted=!quoted;else field+=ch;}
  else if(ch===separator&&!quoted){row.push(field);field='';}
  else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))result.push(row);row=[];field='';}
  else field+=ch;
 }
 if(quoted)throw Error('CSV 引号未闭合。');row.push(field);if(row.some(v=>v.trim()))result.push(row);
 if(!result.length)return [];
 const names=result[0].map(v=>v.trim().toLowerCase()),known=names.some(v=>['front','正面','word','单词'].includes(v));
 const find=(keys,fallback)=>{const index=names.findIndex(v=>keys.includes(v));return index<0?fallback:index;};
 const cols=known?{front:find(['front','正面','word','单词'],0),back:find(['back','背面','meaning','释义'],1),reading:find(['reading','读音','phonetic','音标'],2),tags:find(['tags','标签'],3),extra:find(['extra','备注'],4)}:{front:0,back:1,reading:-1,tags:-1,extra:-1};
 return result.slice(known?1:0).map(values=>Object.fromEntries(Object.entries(cols).map(([key,i])=>[key,i<0?'':values[i]||'']))).filter(r=>r.front.trim());
}
export function exportDelimited(cards,separator=','){
 const quote=value=>{const text=String(value??'');return /["\r\n,\t]/.test(text)?'"'+text.replace(/"/g,'""')+'"':text;};
 return '\uFEFF'+[['正面','背面','读音','标签','备注'],...cards.map(c=>[c.front,c.back,c.reading,c.tags.join(' '),c.extra])].map(row=>row.map(quote).join(separator)).join('\r\n');
}
function readModels(db,col){
 const models=parseJSON(col.models);if(Object.keys(models).length)return Object.fromEntries(Object.entries(models).map(([id,m])=>[id,{id,name:m.name,type:m.type,fields:m.flds.map(f=>f.name),templates:m.tmpls.map(t=>({name:t.name,qfmt:t.qfmt,afmt:t.afmt})),css:m.css||''}]));
 if(!one(db,"SELECT name FROM sqlite_master WHERE name='notetypes'"))throw Error('牌组缺少卡片模板。');
 for(const type of rows(db,'SELECT * FROM notetypes')){
  const config=readProto(type.config),fields=rows(db,'SELECT * FROM fields WHERE ntid=? ORDER BY ord',[type.id]);
  const templates=rows(db,'SELECT * FROM templates WHERE ntid=? ORDER BY ord',[type.id]).map(t=>{const c=readProto(t.config);return{name:t.name,qfmt:protoText(c,1),afmt:protoText(c,2)};});
  models[type.id]={id:String(type.id),name:type.name,type:config.get(1)?.[0]||0,fields:fields.map(f=>f.name),templates,css:protoText(config,3)};
 }return models;
}
export function importAnki(SQL,bytes,{name='导入的牌组',now=Date.now(),withScheduling=true}={}){
 const files=unzipSync(bytes),collectionName=['collection.anki21b','collection.anki21','collection.anki2'].find(n=>files[n]);
 if(!collectionName)throw Error('文件中没有 Anki 集合数据库。');
 const database=uncompress(files[collectionName]);if(strFromU8(database.slice(0,15))!=='SQLite format 3')throw Error('Anki 数据库格式无效。');
 const db=new SQL.Database(database);
 try{
  const col=one(db,'SELECT * FROM col');if(!col)throw Error('牌组集合信息缺失。');
  const models=readModels(db,col);let sourceDecks=parseJSON(col.decks);
  if(!Object.keys(sourceDecks).length&&one(db,"SELECT name FROM sqlite_master WHERE name='decks'"))sourceDecks=Object.fromEntries(rows(db,'SELECT id,name FROM decks').map(d=>[d.id,d]));
  const prefix='apkg:',decks=Object.entries(sourceDecks).map(([id,d])=>({id:prefix+id+':'+(d.name||name),name:(d.name||name).replace(/\x1f/g,'::'),language:'en-US',builtin:0}));
  const deckMap=new Map(decks.map((d,i)=>[Object.keys(sourceDecks)[i],d.id]));
  if(!decks.length)decks.push({id:prefix+name,name,language:'en-US',builtin:0});
  const notes=new Map(rows(db,'SELECT * FROM notes').map(n=>[n.id,n])),cards=[],sourceIds=new Map();
  for(const c of rows(db,'SELECT * FROM cards')){
   const note=notes.get(c.nid),model=models[note?.mid];if(!note||!model)throw Error('牌组包含缺失的笔记或模板。');
   const fields=note.flds.split('\x1f'),id=`import:${note.guid}:${model.type===1?'c':''}${c.ord}`,state=withScheduling?Math.max(0,Math.min(3,c.type)):0,data=parseJSON(c.data);
   const sourceDue=c.odid&&c.odue>0?c.odue:c.due;
   const due=state===2||c.queue===3?(Number(col.crt)*1000+sourceDue*DAY):state?sourceDue*1000:0;
   const card=baseCard({id,noteId:`import:${note.guid}`,guid:note.guid,deck:deckMap.get(String(c.did))||decks[0].id,front:textOnly(fields[0]),back:textOnly(fields[1]||''),fields,model,ordinal:model.type===1?0:c.ord,clozeOrdinal:model.type===1?c.ord:undefined,tags:note.tags.trim().split(/\s+/).filter(Boolean),state,reps:withScheduling?c.reps:0,lapses:withScheduling?c.lapses:0,s:withScheduling?(Number(data.s)||Math.max(0,c.ivl)):0,d:withScheduling?(Number(data.d)||5):0,due:withScheduling?due:0,lastReview:withScheduling&&state===2?due-Math.max(1,c.ivl)*DAY:0,suspended:c.queue===-1,buriedUntil:c.queue<-1?studyDay(now)+DAY:0,flag:c.flags&7,language:'en-US'});
   cards.push(card);sourceIds.set(c.id,id);
  }
  const media=[];if(files.media){
   const mapData=uncompress(files.media);let entries;
   if(strFromU8(mapData.slice(0,1))==='{')entries=Object.entries(JSON.parse(strFromU8(mapData))).map(([index,name])=>({index,name}));
   else entries=(readProto(mapData).get(1)||[]).map((raw,index)=>{const f=readProto(raw);return{index:f.get(255)?.[0]??index,name:protoText(f,1),sha1:f.get(3)?.[0]};});
   for(const entry of entries){if(!entry.name||/[\x00-\x1f\/\\]/.test(entry.name))throw Error('媒体文件名无效。');if(!files[entry.index])throw Error('牌组媒体文件缺失：'+entry.name);media.push({...entry,bytes:uncompress(files[entry.index])});}
  }
  const cardDecks=new Map(cards.map(c=>[c.id,c.deck]));
  const reviews=withScheduling?rows(db,'SELECT * FROM revlog ORDER BY id').filter(r=>sourceIds.has(r.cid)&&r.ease>=1&&r.ease<=4).map(r=>({card:sourceIds.get(r.cid),time:r.id,rating:r.ease,duration:r.time,deck:cardDecks.get(sourceIds.get(r.cid)),wasNew:r.type===0?1:0,json:JSON.stringify(r)})):[];
  return{decks,cards,media,reviews,warnings:cards.some(c=>c.model?.templates.some(t=>/<script\b/i.test(t.qfmt+t.afmt)))?['卡片脚本已隔离，普通卡片、填空及媒体仍可使用。']:[]};
 }finally{db.close();}
}
export function exportAnki(SQL,cards,decks,reviewLog=[],media=[]){
 const db=new SQL.Database(),now=Date.now(),created=Math.floor(studyDay(now)/1000),models={},deckMap={},noteMap=new Map(),cardMap=new Map();let nid=now,mid=now+1000,cid=now+2000;
 db.run(`CREATE TABLE col(id integer primary key,crt integer,mod integer,scm integer,ver integer,dty integer,usn integer,ls integer,conf text,models text,decks text,dconf text,tags text);
 CREATE TABLE notes(id integer primary key,guid text,mid integer,mod integer,usn integer,tags text,flds text,sfld integer,csum integer,flags integer,data text);
 CREATE TABLE cards(id integer primary key,nid integer,did integer,ord integer,mod integer,usn integer,type integer,queue integer,due integer,ivl integer,factor integer,reps integer,lapses integer,left integer,odue integer,odid integer,flags integer,data text);
 CREATE TABLE revlog(id integer primary key,cid integer,usn integer,ease integer,ivl integer,lastIvl integer,factor integer,time integer,type integer);
 CREATE TABLE graves(usn integer,oid integer,type integer);
 CREATE INDEX ix_cards_nid ON cards(nid);CREATE INDEX ix_cards_sched ON cards(did,queue,due);CREATE INDEX ix_revlog_cid ON revlog(cid);CREATE INDEX ix_notes_csum ON notes(csum);`);
 const deckIds=new Map(decks.map((d,i)=>[d.id,i+1]));
 decks.forEach((d,i)=>{deckMap[i+1]={id:i+1,name:d.name,mod:Math.floor(now/1000),usn:-1,dyn:0,conf:1,extendNew:0,extendRev:0,collapsed:false,browserCollapsed:false,desc:'',newToday:[0,0],revToday:[0,0],lrnToday:[0,0],timeToday:[0,0]};});
 const modelIds=new Map();db.run('BEGIN');
 try{
  for(const card of cards){
   const templates=card.type==='cloze'?[{name:'填空',qfmt:'{{cloze:正面}}',afmt:'{{cloze:正面}}<hr>{{背面}}'}]:[{name:'正面',qfmt:'{{正面}}<br><small>{{读音}}</small>',afmt:'{{FrontSide}}<hr>{{背面}}<br>{{备注}}'},...(card.type==='reverse'?[{name:'反面',qfmt:'{{背面}}',afmt:'{{FrontSide}}<hr>{{正面}}'}]:[])];
   const ownModel=card.model||{name:card.type==='cloze'?'口袋填空卡':card.type==='reverse'?'口袋正反卡':'口袋词卡',type:card.type==='cloze'?1:0,fields:['正面','背面','读音','备注'],templates,css:'.card {font-family: sans-serif;font-size:24px;text-align:center;color:#242d3a;background:white;}'};
   const signature=JSON.stringify(ownModel);let modelId=modelIds.get(signature);
   if(!modelId){modelId=mid++;modelIds.set(signature,modelId);models[modelId]={id:modelId,name:ownModel.name||'导入词卡',type:ownModel.type||0,mod:Math.floor(now/1000),usn:-1,sortf:0,did:1,tmpls:ownModel.templates.map((t,i)=>({...t,ord:i,name:t.name||'卡片'+(i+1),bqfmt:'',bafmt:'',did:null})),flds:ownModel.fields.map((name,i)=>({name,ord:i,sticky:false,rtl:false,font:'Arial',size:20,media:[]})),css:ownModel.css||'',latexPre:'',latexPost:'',req:[[0,'any',[0]]]};}
   let noteId=noteMap.get(card.noteId||card.id);
   if(!noteId){noteId=nid++;noteMap.set(card.noteId||card.id,noteId);const reverse=card.type==='reverse'&&card.ordinal===1,fields=card.fields||[(card.type==='cloze'?card.front:escapeHtml(reverse?card.back:card.front)).replace(/\n/g,'<br>'),escapeHtml(reverse?card.front:card.back).replace(/\n/g,'<br>'),escapeHtml(card.reading),escapeHtml(card.extra)];
    db.run('INSERT INTO notes VALUES(?,?,?,?,?,?,?,?,?,?,?)',[noteId,card.guid||card.noteId||card.id,modelId,Math.floor(now/1000),-1,' '+card.tags.join(' ')+' ',fields.join('\x1f'),textOnly(fields[0]),0,0,'']);}
   const cardId=cid++;cardMap.set(card.id,cardId);const queue=card.suspended?-1:card.state===2?2:card.state?1:0;
   const due=card.state===2?Math.round((card.due-created*1000)/DAY):card.state?Math.round(card.due/1000):card.builtinIndex||0;
   db.run('INSERT INTO cards VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[cardId,noteId,deckIds.get(card.deck)||1,card.clozeOrdinal??card.ordinal??0,Math.floor(now/1000),-1,card.state||0,queue,due,Math.max(0,Math.round(card.intervalDays||card.s||0)),2500,card.reps||0,card.lapses||0,0,0,0,card.flag||0,JSON.stringify({s:card.s||0,d:card.d||0})]);
  }
  let logId=0;for(const log of reviewLog){const mapped=cardMap.get(log.card);if(!mapped)continue;logId=Math.max(logId+1,Math.round(log.time));db.run('INSERT INTO revlog VALUES(?,?,?,?,?,?,?,?,?)',[logId,mapped,-1,log.rating,1,0,2500,Math.round(log.duration||0),log.was_new?0:1]);}
  db.run('INSERT INTO col VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',[1,created,now,now,11,0,-1,0,JSON.stringify({nextPos:cards.length+1,activeDecks:[1],curDeck:1,newSpread:0,collapseTime:1200,timeLim:0,estTimes:true,dueCounts:true,curModel:Object.keys(models)[0],schedVer:2}),JSON.stringify(models),JSON.stringify(deckMap),JSON.stringify({1:{id:1,name:'默认',mod:0,usn:0,maxTaken:60,autoplay:true,timer:0,replayq:true,new:{delays:[1,10],ints:[1,4],initialFactor:2500,perDay:20,order:1},rev:{perDay:200,ease4:1.3,fuzz:.05,ivlFct:1,maxIvl:36500,minSpace:1},lapse:{delays:[10],mult:0,minInt:1,leechFails:8,leechAction:0}}}),'{}']);
  db.run('COMMIT');const files={'collection.anki2':db.export()},map={};media.forEach(([name,bytes],i)=>{map[i]=name;files[String(i)]=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);});files.media=strToU8(JSON.stringify(map));return zipSync(files,{level:3});
 }finally{db.close();}
}
export function makeBackup(snapshot,media){const map={},files={'pocket.sqlite':snapshot,'backup.json':strToU8(JSON.stringify({format:'pocket-anki',version:1,created:new Date().toISOString()}))};media.forEach(([name,data],i)=>{map[i]=name;files['media/'+i]=data;});files['media.json']=strToU8(JSON.stringify(map));return zipSync(files,{level:3});}
export function readBackup(bytes){const files=unzipSync(bytes),info=parseJSON(strFromU8(files['backup.json']||new Uint8Array()));if(info.format!=='pocket-anki'||info.version!==1||!files['pocket.sqlite'])throw Error('不是有效的学习记录备份。');const map=parseJSON(strFromU8(files['media.json']||strToU8('{}')));return{snapshot:files['pocket.sqlite'],media:Object.entries(map).map(([i,name])=>{if(!files['media/'+i])throw Error('备份媒体缺失。');return[name,files['media/'+i]];})};}
