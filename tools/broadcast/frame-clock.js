// A dedicated worker continues scheduling while rAF is paused in an occluded tab.
let timer,period=1000/30,deadline=0,pending=false;
function tick(){const now=performance.now();if(!pending){pending=true;postMessage(null);}deadline+=Math.max(1,Math.floor((now-deadline)/period)+1)*period;timer=setTimeout(tick,Math.max(1,deadline-performance.now()));}
onmessage=event=>{if(event.data?.ack){pending=false;return;}clearTimeout(timer);pending=false;const fps=Number(event.data);if(!(fps>0))return;period=1000/Math.min(120,fps);deadline=performance.now()+period;timer=setTimeout(tick,period);};
