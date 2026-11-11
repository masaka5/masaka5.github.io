"""Prototype a 4GiB shared-memory import; keep the original binary unchanged."""
from pathlib import Path
root=Path(__file__).resolve().parent
b=bytearray((root/'qemu-system-x86_64.wasm').read_bytes());p=8
def u():
 global p
 r=0;s=0
 while True:
  v=b[p];p+=1;r|=(v&127)<<s
  if v<128:return r
  s+=7
def name():
 global p
 n=u();t=b[p:p+n];p+=n;return t.decode()
while p<len(b):
 sid=u();size=u();end=p+size
 if sid==2:
  for _ in range(u()):
   module=name();field=name();kind=u()
   if kind==0:u()
   elif kind==1:
    u();flags=u();u()
    if flags&1:u()
   elif kind==2:
    flags=u();lo_start=p;lo=u();hi_start=p;hi=u()
    assert flags==3 and lo==hi==36800
    assert p-hi_start==hi_start-lo_start==3
    b[lo_start:hi_start]=b'\x80\xf8\x03'
    b[hi_start:p]=b'\x80\xf8\x03'
   elif kind==3:u();u()
  break
 p=end
(root/'qemu-4gb.wasm').write_bytes(b)
source=(root/'out.js').read_text()
# Upstream libffi's handwritten heap indexing uses signed shifts. At >2GiB
# pthread stacks receive high addresses, so use unsigned address shifts.
start=source.index('function instantiate_wasm(')
end=source.index('function remove_module_js(')
source=source[:start]+source[start:end].replace('getInt32','getUint32')+source[end:]
start=source.index('function unbox_small_structs(')
end=source.index('var UTF8Decoder')
source=source[:start]+source[start:end].replace(' >> ',' >>> ')+source[end:]
source=source.replace('getInt32(Module.__wasm32_tb.tb_ptr_ptr,','getUint32(Module.__wasm32_tb.tb_ptr_ptr >>> 0,')
source=source.replace('tb_ptr_ptr: tb_ptr_ptr,','tb_ptr_ptr: tb_ptr_ptr >>> 0,')
source=source.replace('to_remove_instance_ptr: to_remove_instance_ptr,','to_remove_instance_ptr: to_remove_instance_ptr >>> 0,')
source=source.replace('to_remove_instance_idx_ptr: to_remove_instance_idx_ptr,','to_remove_instance_idx_ptr: to_remove_instance_idx_ptr >>> 0,')
source=source.replace('instance_garbage_collected_ptr: instance_garbage_collected_ptr,','instance_garbage_collected_ptr: instance_garbage_collected_ptr >>> 0,')
source=source.replace('PTY_atomicIndex = _malloc(4) >> 2','PTY_atomicIndex = _malloc(4) >>> 2')
(root/'out-large.js').write_text(source)
print('Patched memory import; binary size',len(b))
