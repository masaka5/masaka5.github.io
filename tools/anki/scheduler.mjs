export const DAY=86400000;
export function studyDay(now=Date.now()){
 const date=new Date(now);date.setHours(4,0,0,0);if(date.getTime()>now)date.setDate(date.getDate()-1);return date.getTime();
}
export async function createScheduler(bytes){
 const {instance}=await WebAssembly.instantiate(bytes,{});
 return {engine:'FSRS 6.6 · Rust WASM',plan(card,settings={},now=Date.now()){
  const elapsed=card.lastReview?Math.max(0,Math.floor((now-card.lastReview)/DAY)):0;
  const stability=Number.isFinite(card.s)&&card.s>0?card.s:0,difficulty=Number.isFinite(card.d)?Math.max(1,Math.min(10,card.d)):5;
  const pointer=instance.exports.schedule(stability,difficulty,Number(settings.retention)||.9,elapsed);
  const values=new Float32Array(instance.exports.memory.buffer,pointer,12).slice();
  return [1,2,3,4].map((rating,index)=>{
   const result={...card,s:values[index*3],d:values[index*3+1],lastReview:now,reps:(card.reps||0)+1,lapses:(card.lapses||0)+(rating===1&&card.state===2?1:0),state:2,step:0};
   let delay=Math.max(1,Math.round(values[index*3+2]))*DAY;
   if(rating===1){delay=60000;result.state=card.state===2?3:1;}
   else if(card.state!==2&&rating!==4){
    if(rating===2){delay=(card.step?10:6)*60000;result.state=card.state===3?3:1;result.step=card.step||0;}
    else if(!card.step){delay=10*60000;result.state=card.state===3?3:1;result.step=1;}
   }
   result.due=now+delay;result.intervalDays=delay/DAY;return result;
  });
 }};
}
export function intervalLabel(ms){
 if(ms<3600000)return `${Math.max(1,Math.round(ms/60000))} 分钟`;
 if(ms<DAY)return `${Math.round(ms/3600000)} 小时`;
 const days=Math.round(ms/DAY);return days<365?`${days} 天`:`${+(days/365).toFixed(1)} 年`;
}
