export const MAX_BYTES = 256 * 1024 * 1024;
export const MAX_ENTRIES = 10000;
export const FORMATS = ['7z','zip','tar','gzip','bzip2','xz'];
export function checkBudget(n) {
  if (!Number.isSafeInteger(n) || n < 0 || n > MAX_BYTES) throw Error('本次处理超过 256 MiB 上限，请减少文件或使用桌面 7-Zip');
  return n;
}
export function safePath(path) {
  if (typeof path !== 'string' || !path || path.length > 2048 || path.split('/').length > 48 || /^[\/@]/.test(path) || /[\\:\x00-\x1f\x7f<>"|?*]/.test(path) || path.split('/').some(p => !p || p === '.' || p === '..' || /[ .]$/.test(p) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p))) throw Error('文件路径不安全或不兼容：'+String(path).slice(0,100));
  return path;
}
export function parseListing(text) {
  const index=text.indexOf('----------');
  if(index<0) throw Error('无法读取压缩包目录，文件可能损坏或密码不正确');
  const seen=new Set(), entries=[];
  for(const block of text.slice(index+10).trim().split(/\r?\n\r?\n/)) {
    if(!block.trim()) continue;
    const v=Object.create(null);
    for(const line of block.split(/\r?\n/)) {
      const m=/^([^=\r\n]+) =(?: (.*))?$/.exec(line);
      if(!m || Object.hasOwn(v,m[1])) throw Error('压缩包目录包含有歧义的记录');
      v[m[1]]=m[2]??'';
    }
    const path=safePath(v.Path), directory=v.Folder==='+' || /^D/.test(v.Attributes||''), size=Number(v.Size??(directory?0:NaN));
    const packed=v['Packed Size']!==undefined && v['Packed Size']!=='' ? Number(v['Packed Size']) : null;
    if(seen.has(path) || !Number.isSafeInteger(size) || size<0 || packed!==null && (!Number.isSafeInteger(packed)||packed<0)) throw Error('压缩包目录大小或路径无效');
    seen.add(path);
    entries.push({path,directory,size,packed,encrypted:v.Encrypted==='+',attributes:v.Attributes||'',modified:v.Modified||'',method:v.Method||'',symlink:!!(v['Symbolic Link']||v['Hard Link']||/(^|\s)l[rwx-]{9}/.test(v.Attributes||''))});
    if(entries.length>MAX_ENTRIES) throw Error('最多支持 10000 个条目');
  }
  for(const e of entries) if(entries.some(p=>!p.directory && e.path.startsWith(p.path+'/'))) throw Error('压缩包文件与目录路径冲突');
  return entries;
}
export function selectEntries(entries,paths) {
  if(!Array.isArray(paths)||!paths.length||paths.length>MAX_ENTRIES) throw Error('请选择文件或目录');
  for(const path of paths) {safePath(path);if(!entries.some(e=>e.path===path||e.path.startsWith(path+'/'))) throw Error('所选路径不存在');}
  const chosen=entries.filter(e=>paths.some(p=>e.path===p||e.path.startsWith(p+'/')));
  if(chosen.some(e=>e.symlink || entries.some(p=>p.symlink && e.path.startsWith(p.path+'/')))) throw Error('为保护本机，不提取符号链接或硬链接');
  checkBudget(chosen.reduce((n,e)=>n+e.size,0));
  return chosen;
}
