import {parseDump} from './dump-core.js';
let running=false;
self.onmessage=async({data})=>{if(data?.type!=='start'||running)return;running=true;const {id,file}=data;try{const result=await parseDump(file,{onProgress:progress=>self.postMessage({type:'progress',id,...progress})});self.postMessage({type:'result',id,result});}catch(error){self.postMessage({type:'error',id,message:error.message,name:error.name});}finally{running=false;}};
self.postMessage({type:'ready'});
