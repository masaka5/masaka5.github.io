let opening;
function database(){return opening??=new Promise((resolve,reject)=>{
 const request=indexedDB.open('pocket-qwen-audio',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('records',{keyPath:'id'});
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>{opening=null;reject(request.error);};
});}
async function transact(mode,action){const db=await database();return new Promise((resolve,reject)=>{
 const tx=db.transaction('records',mode),request=action(tx.objectStore('records'));
 tx.oncomplete=()=>resolve(request.result);tx.onabort=tx.onerror=()=>reject(tx.error||request.error||Error('浏览器存储失败'));
});}
export const audioHistory={read:()=>transact('readonly',store=>store.getAll()),save:record=>transact('readwrite',store=>store.put(record)),remove:id=>transact('readwrite',store=>store.delete(id))};
