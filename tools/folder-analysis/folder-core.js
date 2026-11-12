export function aggregate(files, directories=[]) {
  const map=new Map([['',{path:'',name:'全部文件',kind:'directory',size:0,count:0}]]), ext=new Map();
  function dir(path){if(map.has(path))return map.get(path);const parent=path.split('/').slice(0,-1).join('/');dir(parent);const n={path,name:path.split('/').pop(),parent,kind:'directory',size:0,count:0};map.set(path,n);return n;}
  directories.forEach(dir);
  for(const f of files){const parts=f.path.split('/');parts.pop();const parent=parts.join('/');dir(parent);let p=parent;for(;;){const d=map.get(p);d.size+=f.size;d.count++;if(!p)break;p=p.split('/').slice(0,-1).join('/');}const name=f.path.split('/').pop();const suffix=name.includes('.')?'.'+name.split('.').pop().toLowerCase():'无扩展名';const e=ext.get(suffix)||{name:suffix,size:0,count:0,kind:'extension'};e.size+=f.size;e.count++;ext.set(suffix,e);}
  return {root:map.get(''),nodes:[...map.values()],extensions:[...ext.values()]};
}
export function sizeBuckets(files){const buckets=new Map(),empty=[];for(const f of files){if(!f.size){empty.push(f);continue;}if(!buckets.has(f.size))buckets.set(f.size,[]);buckets.get(f.size).push(f);}const candidates=[...buckets.values()].filter(a=>a.length>1).flat();return {candidates,empty,skipped:files.length-candidates.length-empty.length};}
export function csvCell(value){let s=String(value);if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function bytes(n){if(n<1024)return n+' B';const u=['KB','MB','GB','TB'];let i=-1;do{n/=1024;i++;}while(n>=1024&&i<u.length-1);return n.toFixed(1)+' '+u[i];}
