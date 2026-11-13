export function shouldSend(event,mode='enter'){
 if(event.key!=='Enter'||event.isComposing||event.keyCode===229||event.shiftKey||event.altKey)return false;
 return !!(event.ctrlKey||event.metaKey||mode==='enter');
}
