export function pcm16(samples){
 const bytes=new Uint8Array(samples.length*2),view=new DataView(bytes.buffer);
 for(let i=0;i<samples.length;i++){const value=Math.max(-1,Math.min(1,Number.isFinite(samples[i])?samples[i]:0));view.setInt16(i*2,value*(value<0?32768:32767),true);}
 return bytes;
}
export function wavBlob(chunks,sampleCount,rate=24000){
 const header=new ArrayBuffer(44),view=new DataView(header);
 const put=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};
 put(0,'RIFF');view.setUint32(4,36+sampleCount*2,true);put(8,'WAVE');put(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);put(36,'data');view.setUint32(40,sampleCount*2,true);
 return new Blob([header,...chunks],{type:'audio/wav'});
}
