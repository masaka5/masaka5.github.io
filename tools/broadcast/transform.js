/** Resize in source-local axes, preserving the opposite handle in world coordinates. */
const directions={nw:[-1,-1],n:[0,-1],ne:[1,-1],e:[1,0],se:[1,1],s:[0,1],sw:[-1,1],w:[-1,0]};
function rotate(x,y,angle){const r=angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return{x:x*c-y*s,y:x*s+y*c};}
export function sourceHandlePoint(source,handle){const [x,y]=directions[handle]||[0,0],p=rotate(x*source.width/2,y*source.height/2,source.rotation);return{x:source.x+source.width/2+p.x,y:source.y+source.height/2+p.y};}
export function resizeSource(source,handle,delta,keepAspect=true){
 const [sx,sy]=directions[handle]||[0,0],d=rotate(delta.x,delta.y,-source.rotation),w=source.width,h=source.height;
 let width=w+(sx?sx*d.x:0),height=h+(sy?sy*d.y:0);
 if(keepAspect){let ratio=sx?width/w:height/h;if(sx&&sy&&Math.abs((height-h)/h)>Math.abs((width-w)/w))ratio=height/h;ratio=Math.max(Math.max(8/w,8/h),Math.min(Math.min(7680/w,4320/h),ratio));width=w*ratio;height=h*ratio;}
 else{width=Math.max(8,Math.min(7680,width));height=Math.max(8,Math.min(4320,height));}
 const shift=rotate(sx*(width-w)/2,sy*(height-h)/2,source.rotation),cx=source.x+w/2+shift.x,cy=source.y+h/2+shift.y;
 return{x:cx-width/2,y:cy-height/2,width,height};
}
