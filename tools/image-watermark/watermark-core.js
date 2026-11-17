/*
 * Batch text-watermark flow adapted from unilei/image-watermark-tool (MIT).
 * Copyright (c) 2024 Lei. Permission is hereby granted, free of charge, to any
 * person obtaining a copy of this software to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies, subject to inclusion
 * of this notice. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */
export const MAX_FILES=40;
export const MAX_TOTAL_BYTES=220*1024*1024;
export const MAX_FILE_BYTES=40*1024*1024;
export const PREVIEW_EDGE=1400;
export const DEFAULT_SETTINGS=Object.freeze({text:'仅供授权验证使用',color:'#5b5bd6',opacity:.28,size:2.6,spacing:2.8,angle:28,repeat:true,positionX:.5,positionY:.5,format:'auto'});
const colorPattern=/^#[0-9a-f]{6}$/i;
const number=(value,min,max,fallback)=>Math.max(min,Math.min(max,Number.isFinite(Number(value))?Number(value):fallback));
export function normalizeSettings(input={}){
 const text=String(input.text??DEFAULT_SETTINGS.text).replace(/\r\n?/g,'\n').trim().slice(0,160)||DEFAULT_SETTINGS.text;
 return{text,color:colorPattern.test(String(input.color||''))?String(input.color).toLowerCase():DEFAULT_SETTINGS.color,opacity:number(input.opacity,.04,.92,DEFAULT_SETTINGS.opacity),size:number(input.size,.8,10,DEFAULT_SETTINGS.size),spacing:number(input.spacing,1.2,8,DEFAULT_SETTINGS.spacing),angle:number(input.angle,-90,90,DEFAULT_SETTINGS.angle),repeat:input.repeat!==false,positionX:number(input.positionX,.05,.95,DEFAULT_SETTINGS.positionX),positionY:number(input.positionY,.05,.95,DEFAULT_SETTINGS.positionY),format:['auto','jpeg','png','webp'].includes(input.format)?input.format:'auto'};
}
export function outputMime(format,inputType=''){
 if(format==='jpeg')return'image/jpeg';if(format==='png')return'image/png';if(format==='webp')return'image/webp';
 if(['image/png','image/gif','image/bmp','image/avif'].includes(inputType))return'image/png';if(inputType==='image/webp')return'image/webp';return'image/jpeg';
}
export function extensionFor(mime){return mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';}
export function outputName(name='image',mime='image/jpeg'){const base=String(name).replace(/\.[^.]+$/,'').replace(/[\\/:*?"<>|]+/g,'-').slice(0,120)||'image';return`${base}-watermark.${extensionFor(mime)}`;}
function drawBlock(ctx,lines,x,y,lineHeight){
 ctx.textAlign='center';ctx.textBaseline='middle';const start=-(lines.length-1)*lineHeight/2;lines.forEach((line,index)=>ctx.fillText(line,x,y+start+index*lineHeight));
}
export function drawWatermark(ctx,width,height,input){
 const settings=normalizeSettings(input);const min=Math.min(width,height),size=Math.max(10,Math.min(420,min*settings.size/100)),lineHeight=size*1.28,lines=settings.text.split('\n').slice(0,4),font=`700 ${size}px "Segoe UI","Microsoft YaHei","PingFang SC",sans-serif`;
 ctx.save();ctx.font=font;ctx.fillStyle=settings.color;ctx.globalAlpha=settings.opacity;ctx.textAlign='center';ctx.textBaseline='middle';
 if(settings.repeat){
  const margin=Math.max(size*.7,min*settings.spacing/100);const maxWidth=Math.max(...lines.map(line=>ctx.measureText(line).width));const stepX=Math.max(size*2,maxWidth+margin);const stepY=Math.max(lineHeight*2,lineHeight*Math.max(1.4,settings.spacing));const diagonal=Math.hypot(width,height)*1.15;
  ctx.translate(width/2,height/2);ctx.rotate(settings.angle*Math.PI/180);let row=0;for(let y=-diagonal;y<=diagonal;y+=stepY){const offset=row++%2?stepX/2:0;for(let x=-diagonal-offset;x<=diagonal;x+=stepX)drawBlock(ctx,lines,x,y,lineHeight);}
 }else{
  const x=width*settings.positionX,y=height*settings.positionY;ctx.translate(x,y);ctx.rotate(settings.angle*Math.PI/180);drawBlock(ctx,lines,0,0,lineHeight);
 }
 ctx.restore();return settings;
}
export async function renderImage(bitmap,settings,maxEdge=0,inputType=''){
 const naturalWidth=bitmap.width,naturalHeight=bitmap.height;const scale=maxEdge>0?Math.min(1,maxEdge/Math.max(naturalWidth,naturalHeight)):1;const width=Math.max(1,Math.round(naturalWidth*scale)),height=Math.max(1,Math.round(naturalHeight*scale)),mime=outputMime(settings.format,inputType);
 const canvas=new OffscreenCanvas(width,height),ctx=canvas.getContext('2d',{alpha:mime!=='image/jpeg'});if(!ctx)throw Error('无法创建图像画布');
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';if(mime==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);}ctx.drawImage(bitmap,0,0,width,height);drawWatermark(ctx,width,height,settings);const blob=await canvas.convertToBlob({type:mime,quality:.92});return{blob,width,height,naturalWidth,naturalHeight,mime};
}