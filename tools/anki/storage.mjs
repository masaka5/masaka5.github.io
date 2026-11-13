export function openStorage(){return new Promise((resolve,reject)=>{
 const request=indexedDB.open('pocket-anki',1);
 request.onupgradeneeded=()=>{request.result.createObjectStore('state');request.result.createObjectStore('media');};
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('无法打开本地学习记录，请检查浏览器存储权限。'));
 });}
export function storageGet(db,store,key){return new Promise((resolve,reject)=>{
 const tx=db.transaction(store,'readonly'),req=tx.objectStore(store).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });}
export function storagePut(db,store,key,value){return new Promise((resolve,reject)=>{
 const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value,key);tx.oncomplete=()=>resolve();tx.onabort=tx.onerror=()=>reject(tx.error||Error('保存失败，未改变原有记录。'));
 });}
export function storageCommit(db,state,media=[]){return new Promise((resolve,reject)=>{
 const tx=db.transaction(['state','media'],'readwrite');
 tx.oncomplete=()=>resolve();tx.onabort=tx.onerror=()=>reject(tx.error||Error('保存失败，原有记录和媒体已保留。'));
 try{tx.objectStore('state').put(state,'collection');for(const[name,bytes]of media)tx.objectStore('media').put(bytes,name);}catch(error){tx.abort();reject(error);}
 });}
export async function storageMedia(db){return new Promise((resolve,reject)=>{
 const tx=db.transaction('media','readonly'),store=tx.objectStore('media'),keys=store.getAllKeys(),values=store.getAll();
 tx.oncomplete=()=>resolve(keys.result.map((key,i)=>[key,values.result[i]]));tx.onerror=()=>reject(tx.error);
 });}
export function rows(db,sql,params=[]){
 const statement=db.prepare(sql);try{statement.bind(params);const values=[];while(statement.step())values.push(statement.getAsObject());return values;}finally{statement.free();}
}
export const one=(db,sql,params=[])=>rows(db,sql,params)[0];
export const getMeta=(db,key,fallback=null)=>{const value=one(db,'SELECT value FROM meta WHERE key=?',[key]);return value?JSON.parse(value.value):fallback;};
export function setMeta(db,key,value){db.run('INSERT OR REPLACE INTO meta(key,value) VALUES(?,?)',[key,JSON.stringify(value)]);}
export function createDatabase(SQL){
 const db=new SQL.Database();db.run(`
 CREATE TABLE meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE TABLE decks(id TEXT PRIMARY KEY,name TEXT NOT NULL,language TEXT NOT NULL,builtin INTEGER NOT NULL DEFAULT 0,cursor INTEGER NOT NULL DEFAULT 0,settings TEXT NOT NULL DEFAULT '{}');
 CREATE TABLE cards(id TEXT PRIMARY KEY,note TEXT,deck TEXT NOT NULL,due REAL NOT NULL,state INTEGER NOT NULL,suspended INTEGER NOT NULL,buried REAL NOT NULL,flag INTEGER NOT NULL,json TEXT NOT NULL);
 CREATE INDEX due_cards ON cards(deck,suspended,due);CREATE INDEX note_cards ON cards(note);
 CREATE TABLE reviews(id INTEGER PRIMARY KEY AUTOINCREMENT,card TEXT NOT NULL,deck TEXT NOT NULL,time REAL NOT NULL,rating INTEGER NOT NULL,duration REAL NOT NULL,was_new INTEGER NOT NULL,json TEXT NOT NULL);
 CREATE INDEX review_day ON reviews(deck,time);
 PRAGMA user_version=1;`);return db;
}
export function saveCard(db,card){db.run('INSERT INTO cards VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET note=excluded.note,deck=excluded.deck,due=excluded.due,state=excluded.state,suspended=excluded.suspended,buried=excluded.buried,flag=excluded.flag,json=excluded.json',[card.id,card.noteId||card.id,card.deck,card.due||0,card.state||0,card.suspended?1:0,card.buriedUntil||0,card.flag||0,JSON.stringify(card)]);}
export const getCard=(db,id)=>{const row=one(db,'SELECT json FROM cards WHERE id=?',[id]);return row?JSON.parse(row.json):null;};
