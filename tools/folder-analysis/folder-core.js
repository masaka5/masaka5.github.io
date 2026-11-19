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

export function safeFileName(name){
  let value=String(name??'').normalize('NFC').replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g,'-').replace(/\s+/g,' ').trim();
  if(!value||value==='.'||value==='..')throw Error('文件名无效');
  if(/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(value))value='_'+value;
  value=value.replace(/[ .]+$/,'');
  if(value.length>180){const dot=value.lastIndexOf('.');value=dot>0?value.slice(0,dot).slice(0,180-5)+'...'+value.slice(dot):value.slice(0,180);}
  return value;
}
export function renameFileName(name,options={},index=0){
  const dot=name.lastIndexOf('.')>0?name.lastIndexOf('.'):name.length,base=name.slice(0,dot),extension=name.slice(dot);
  const find=String(options.find||''),replace=String(options.replace||'');
  let next=find?base.split(find).join(replace):base;
  next=String(options.prefix||'')+next+String(options.suffix||'');
  if(options.number&&options.number!=='off'){
    const number=String((Number(options.start)||0)+index).padStart(Math.max(1,Number(options.pad)||4),'0');
    next=options.number==='prefix'?number+'-'+next:next+'-'+number;
  }
  return safeFileName(next+extension);
}
export function parseCsv(text){
  const rows=[];let row=[],field='',quoted=false;const source=String(text).replace(/^\uFEFF/,'');
  for(let i=0;i<source.length;i++){const char=source[i];if(quoted){if(char==='"'&&source[i+1]==='"'){field+='"';i++;}else if(char==='"'){quoted=false;}else field+=char;}else if(char==='"'){quoted=true;}else if(char===','){row.push(field);field='';}else if(char==='\n'){row.push(field);rows.push(row);row=[];field='';}else if(char!=='\r')field+=char;}
  if(quoted)throw Error('CSV 引号未闭合');if(field||row.length){row.push(field);rows.push(row);}return rows;
}
export function csvFromRows(rows){return rows.map(row=>row.map(value=>{const s=String(value??'');return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;}).join(',')).join('\r\n');}
