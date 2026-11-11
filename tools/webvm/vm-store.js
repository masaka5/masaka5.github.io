/* Browser-local VM data. This database never clears another toolbox tool. */
globalThis.VMStore=(()=>{
 let opening;
 function open(){return opening??=new Promise((resolve,reject)=>{const request=indexedDB.open(WebVMCore.config.store,1);request.onupgradeneeded=()=>request.result.createObjectStore('data');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
 async function transact(mode,fn){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('data',mode),request=fn(tx.objectStore('data'));let result;request.onsuccess=()=>{result=request.result};tx.oncomplete=()=>resolve(result);tx.onabort=tx.onerror=()=>reject(tx.error||request.error||Error('浏览器存储失败'));});}
 return {get:key=>transact('readonly',s=>s.get(key)),put:(key,value)=>transact('readwrite',s=>s.put(value,key)),remove:key=>transact('readwrite',s=>s.delete(key)),keys:()=>transact('readonly',s=>s.getAllKeys())};
})();
