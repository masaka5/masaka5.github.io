export const LOCAL_MODEL='mohdmahmodi/Spark-X2.6-4B-ONNX-WebGPU';
export const LOCAL_LABEL='Spark-X2.6 · 4B Q4';

export function splitThinking(value=''){
 const text=String(value),open=text.indexOf('<think>');
 if(open<0){
  // An assistant prefill may already have supplied the opening marker.
  const close=text.indexOf('</think>');
  if(close>=0){const after=splitThinking(text.slice(close+8));return{thinking:[text.slice(0,close).trim(),after.thinking].filter(Boolean).join('\n\n'),answer:after.answer,thinkingDone:!after.thinking||after.thinkingDone};}
  return{thinking:'',answer:text,thinkingDone:false};
 }
 const start=open+7,end=text.indexOf('</think>',start);
 if(end<0)return{thinking:text.slice(start),answer:text.slice(0,open),thinkingDone:false};
 // Some models emit more than one reasoning block when automatically resumed.
 const after=splitThinking(text.slice(end+8));
 return{thinking:[text.slice(start,end).trim(),after.thinking].filter(Boolean).join('\n\n'),answer:(text.slice(0,open)+after.answer).trim(),thinkingDone:!after.thinking||after.thinkingDone};
}

export function localPrompt(messages=[]){
 const lines=['你是一个中文助手。'];
 for(const message of messages){
  const role=message.role==='assistant'?'助手':'用户';
  lines.push(`${role}：${String(message.content||'')}`);
 }
 lines.push('助手：');return lines.join('\n');
}

export function localError(message){
 const value=String(message||'');
 if(/local-compaction/.test(value))return'上下文压缩未完成，原始对话已保留，请重试。';
 if(/local-empty/.test(value))return'模型没有返回答案，原始消息已保留，请重试。';
 if(/local-context-overflow/.test(value))return'模型窗口已满，上下文压缩未完成，请重试。';
 if(value==='local-webgpu-required')return'本地模型需要支持 WebGPU 的 Chrome 或 Edge，并开启硬件加速。';
 if(/out of memory|memory allocation|allocation failed|bad_alloc|内存不足/i.test(value))return'设备内存不足，请关闭其他标签页后重试。';
 if(/webgpu|gpu|shader|backend|onnx|wasm|session|out of bounds|broadcast/i.test(value))return'本地推理引擎运行失败，请重新加载模型或启用浏览器硬件加速。';
 if(/fetch|network|下载|download|failed to load model/i.test(value))return'模型下载失败，请检查网络后重试。模型会自动使用浏览器缓存。';
 return'本地模型运行失败，请重试或切换到接口模式。';
}
