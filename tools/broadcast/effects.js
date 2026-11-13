const bound=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
export function normalizeEffects(value={}){
 const v=value&&typeof value==='object'?value:{};
 return{brightness:bound(v.brightness,0,2,1),contrast:bound(v.contrast,0,2,1),saturation:bound(v.saturation,0,2,1),hue:bound(v.hue,-180,180,0),grayscale:bound(v.grayscale,0,1,0),sepia:bound(v.sepia,0,1,0),invert:bound(v.invert,0,1,0),blur:bound(v.blur,0,16,0)};
}
export function normalizeAnimation(value={}){const v=value&&typeof value==='object'?value:{};return{type:v.type==='fade'?'fade':'none',duration:Math.round(bound(v.duration,100,5000,500))};}
export const FILTER_PRESETS=Object.freeze(Object.fromEntries(Object.entries({original:{},mono:{grayscale:1},vintage:{sepia:.65,saturation:.7,contrast:1.1},vivid:{saturation:1.45,contrast:1.12},cool:{hue:18,saturation:.9},warm:{sepia:.3,saturation:1.15},soft:{blur:2,contrast:.9,brightness:1.05},negative:{invert:1}}).map(([key,value])=>[key,Object.freeze(normalizeEffects(value))])));
export function makeFade(from,to,time,duration){return{from,to,start:time,duration:Math.max(0,duration*Math.abs(to-from))};}
export function fadeValue(fade,time){if(!fade)return 1;const progress=fade.duration?Math.max(0,Math.min(1,(time-fade.start)/fade.duration)):1;return fade.from+(fade.to-fade.from)*progress;}
