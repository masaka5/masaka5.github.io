// Shared bounds and binary helpers. Reading archives does not buffer the input image.
export const MAX_BYTES = 256 * 1024 * 1024;
export const MAX_ENTRIES = 10000;
export function checkBudget(bytes) {
  if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > MAX_BYTES) throw Error('镜像内存上限为 256 MiB');
  return bytes;
}
export function safePath(path) {
  if (typeof path !== 'string' || !path || path.length>4096 || path.split('/').length>64 || /[\\:\x00-\x1f\x7f]/.test(path) || path.startsWith('/') || path.startsWith('@') || path.split('/').some(p => !p || p === '.' || p === '..')) throw Error('不安全或不支持的文件路径');
  return path;
}
export function parseListing(text) {
  const separator = text.indexOf('----------');
  if (separator < 0) throw Error('无法读取镜像目录');
  const entries = [], seen = new Set();
  for (const block of text.slice(separator + 10).replace(/\n+Warnings: \d+\s*$/, '').trim().split(/\r?\n\r?\n/)) {
    if (!block.trim()) continue;
    const values = {};
    for (const line of block.split(/\r?\n/)) {
      const match = /^([^=\r\n]+) =(?: (.*))?$/.exec(line);
      if (!match || Object.hasOwn(values, match[1])) throw Error('目录包含有歧义的文件名: '+line.slice(0,160));
      values[match[1]] = match[2] ?? '';
    }
    const path = safePath(values.Path), directory = values.Folder === '+' || /^D/.test(values.Attributes || '');
    const size = Number(values.Size ?? (directory ? 0 : NaN));
    if (!Number.isSafeInteger(size) || size < 0 || seen.has(path)) throw Error('镜像目录记录无效');
    seen.add(path);
    entries.push({path, size, directory, symlink: !!(values['Symbolic Link'] || values['Hard Link'] || /(^|\s)l[rwx-]{9}/.test(values.Attributes || ''))});
    if (entries.length > MAX_ENTRIES) throw Error('镜像最多支持 10000 个条目');
  }
  return entries;
}
export function inspectVhd(footer, totalSize) {
  if (footer.length !== 512 || new TextDecoder().decode(footer.subarray(0,8)) !== 'conectix') return null;
  const view = new DataView(footer.buffer,footer.byteOffset,512), stored = view.getUint32(64);
  let sum = 0; for(let i=0;i<512;i++) if(i<64 || i>67) sum = (sum+footer[i])>>>0;
  if ((~sum>>>0) !== stored) throw Error('VHD 页脚校验失败');
  const diskType = view.getUint32(60), size = Number(view.getBigUint64(48));
  if (!Number.isSafeInteger(size) || (diskType === 2 && size !== totalSize-512)) throw Error('VHD 磁盘大小无效');
  return {diskType,diskBytes:size};
}
export function fixedVhd(disk) {
  checkBudget(disk.length);
  const output = new Uint8Array(disk.length+512); output.set(disk);
  const f=output.subarray(disk.length), v=new DataView(f.buffer,f.byteOffset,512), enc=new TextEncoder();
  f.set(enc.encode('conectix')); v.setUint32(8,2);v.setUint32(12,0x10000);v.setBigUint64(16,0xffffffffffffffffn);
  v.setUint32(24,Math.max(0,Math.floor(Date.now()/1000)-946684800));f.set(enc.encode('TBX '),28);v.setUint32(32,0x10000);f.set(enc.encode('Wi2k'),36);
  v.setBigUint64(40,BigInt(disk.length));v.setBigUint64(48,BigInt(disk.length));
  let sectors=disk.length/512, heads=4, spt=17, cylinders=Math.floor(sectors/(heads*spt));
  while(cylinders>65535 && heads<16){heads*=2;cylinders=Math.floor(sectors/(heads*spt));}
  if(cylinders>65535){spt=31;cylinders=Math.floor(sectors/(heads*spt));}if(cylinders>65535){spt=63;cylinders=Math.floor(sectors/(heads*spt));}
  v.setUint16(56,Math.min(cylinders,65535));f[58]=heads;f[59]=spt;v.setUint32(60,2);
  const id=new Uint8Array(16);globalThis.crypto?.getRandomValues(id);f.set(id,68);
  let sum=0;for(const n of f)sum=(sum+n)>>>0;v.setUint32(64,~sum>>>0);return output;
}
