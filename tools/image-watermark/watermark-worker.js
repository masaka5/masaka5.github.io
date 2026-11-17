import {normalizeSettings,renderImage} from './watermark-core.js?v=20261118-watermark1';
self.onmessage=async event=>{
 const {id,file,settings,maxEdge=0,inputType=''}=event.data||{};
 try{
  let bitmap;
  try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{bitmap=await createImageBitmap(file);}
  const result=await renderImage(bitmap,normalizeSettings(settings),Number(maxEdge)||0,inputType);bitmap.close?.();
  self.postMessage({id,ok:true,...result});
 }catch(error){self.postMessage({id,ok:false,error:error.message||'图片处理失败'});}
};