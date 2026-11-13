import {gunzipSync}from'fflate';
import {baseCard}from'./cards.mjs';
const chunkCache=new Map(),pending=new Map(),indices=new Map();
let manifest;
const dataUrl=file=>new URL('../data/'+file,import.meta.url);
export async function vocabularyManifest(){
 if(!manifest){const r=await fetch(dataUrl('manifest.json'));if(!r.ok)throw Error('词库索引载入失败，请重试。');manifest=await r.json();}return manifest;
}
async function cachedBytes(info){
 const url=dataUrl(info.file);url.searchParams.set('v',info.sha256.slice(0,12));
 const cache=await caches.open('pocket-anki-vocabulary-v1'),cached=await cache.match(url);let bytes;
 if(cached)bytes=new Uint8Array(await cached.arrayBuffer());
 else{const r=await fetch(url);if(!r.ok)throw Error('词库分片尚未缓存，请联网后重试。');bytes=new Uint8Array(await r.arrayBuffer());}
 const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
 if(digest!==info.sha256){await cache.delete(url);throw Error('词库校验失败，请重新下载。');}
 if(!cached)await cache.put(url,new Response(bytes,{headers:{'Content-Type':'application/gzip'}}));
 return bytes;
}
export async function chunk(language,index){
 const key=language+':'+index;if(chunkCache.has(key)){const v=chunkCache.get(key);chunkCache.delete(key);chunkCache.set(key,v);return v;}
 if(!pending.has(key))pending.set(key,(async()=>{
  const dict=(await vocabularyManifest()).languages.find(d=>d.id===language),info=dict.shards[index];if(!info)return [];
  const values=JSON.parse(new TextDecoder().decode(gunzipSync(await cachedBytes(info))));chunkCache.set(key,values);
  while(chunkCache.size>4)chunkCache.delete(chunkCache.keys().next().value);return values;
 })().finally(()=>pending.delete(key)));
 return pending.get(key);
}
export async function builtinCard(language,index){
 const dict=(await vocabularyManifest()).languages.find(d=>d.id===language);if(index>=dict.count)return null;
 const row=(await chunk(language,Math.floor(index/dict.chunkSize)))[index%dict.chunkSize];
 return baseCard({id:`${language}:${row[5]}`,noteId:`${language}:${row[5]}`,deck:language,builtinIndex:index,front:row[0],reading:row[1],back:row[2],tags:row[3].split(/\s+/).filter(Boolean),extra:row[4],language:dict.language});
}
async function wordIndex(language){
 if(indices.has(language))return indices.get(language);
 const dict=(await vocabularyManifest()).languages.find(d=>d.id===language);
 const values=JSON.parse(new TextDecoder().decode(gunzipSync(await cachedBytes(dict.index))));
 indices.clear();indices.set(language,values);return values;
}
export async function searchVocabulary(language,{query='',page=1,pageSize=25,offset,allowed=null,excluded=new Set()}={}){
 const dict=(await vocabularyManifest()).languages.find(d=>d.id===language),start=offset??(page-1)*pageSize;
 const terms=query.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean),matched=[];let total=0;
 if(!terms.length&&!allowed){
  total=dict.count-excluded.size;let position=0;
  for(let i=0;i<dict.count&&matched.length<pageSize;i++){if(excluded.has(i))continue;if(position++>=start)matched.push(i);}
 }else{
  const index=await wordIndex(language);
  for(let i=0;i<index.length;i++){
   if(excluded.has(i))continue;
   const item=index[i];if(allowed&&!allowed.has(`${language}:${item[3]}`))continue;
   if(terms.length){const text=item.slice(0,3).join(' ').normalize('NFKC').toLowerCase();if(!terms.every(t=>text.includes(t)))continue;}
   if(total>=start&&matched.length<pageSize)matched.push(i);total++;
  }
 }
 return{total,cards:await Promise.all(matched.map(i=>builtinCard(language,i)))};
}
export async function cacheVocabulary(language,onProgress,signal){
 const dict=(await vocabularyManifest()).languages.find(d=>d.id===language),items=[dict.index,...dict.shards];let cursor=0,finished=0;
 await Promise.all(Array.from({length:3},async()=>{
  while(cursor<items.length){if(signal?.aborted)return;const info=items[cursor++];await cachedBytes(info);finished++;onProgress({finished,total:items.length});}
 }));return{finished,total:items.length};
}
