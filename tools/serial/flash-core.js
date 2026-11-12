export function validateImages(images){
 if(!Array.isArray(images)||!images.length||images.length>16)throw Error('请选择 1–16 个 BIN 固件');
 const result=images.map(({name,address,data})=>{if(!name||!(data instanceof Uint8Array)||!data.length)throw Error('请选择非空固件文件');if(!/^(?:0x[\da-f]+|\d+)$/i.test(String(address).trim()))throw Error('请填写写入地址，例如 0x1000');const offset=Number(String(address).trim());if(!Number.isSafeInteger(offset)||offset<0||offset+data.length>64*1024*1024)throw Error('固件超出 64 MB 地址范围');if(offset%4096!==0)throw Error('写入地址需按 4 KB 对齐');return {name,address:offset,data};}).sort((a,b)=>a.address-b.address);
 for(let i=1;i<result.length;i++){const p=result[i-1];if(p.address+Math.ceil(p.data.length/4096)*4096>result[i].address)throw Error('固件写入范围或擦除扇区重叠');}
 return result;
}
export function flashOptions(images,reportProgress,calculateMD5Hash){
 return {fileArray:images.map(({data,address})=>({data,address})),flashMode:'keep',flashFreq:'keep',flashSize:'keep',eraseAll:false,compress:true,reportProgress,calculateMD5Hash};
}
