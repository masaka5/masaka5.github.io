export const LOCAL_MODEL='onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX';
export const LOCAL_LABEL='DeepSeek-R1 · Qwen 1.5B';

export function splitThinking(value=''){
 const text=String(value),open=text.indexOf('<think>');
 if(open<0)return{thinking:'',answer:text,thinkingDone:false};
 const start=open+7,end=text.indexOf('</think>',start);
 if(end<0)return{thinking:text.slice(start),answer:text.slice(0,open),thinkingDone:false};
 return{thinking:text.slice(start,end).trim(),answer:(text.slice(0,open)+text.slice(end+8)).trim(),thinkingDone:true};
}

export function localPrompt(messages=[]){
 const lines=['你是一个简洁、准确的中文助手。请先在 <think> 和 </think> 中进行简要分析，再给出清晰的最终答案。'];
 for(const message of messages){
  const role=message.role==='assistant'?'助手':'用户';
  lines.push(`${role}：${String(message.content||'').slice(0,12000)}`);
 }
 lines.push('助手：');return lines.join('\n');
}

export function localError(message){
 const value=String(message||'');
 if(/webgpu|gpu|shader/i.test(value))return'当前浏览器的 WebGPU 不可用，正在尝试 CPU/WASM 模式。';
 if(/memory|allocation|out of|内存/i.test(value))return'设备内存不足，请关闭其他标签页或减少上下文后重试。';
 if(/fetch|network|下载|model/i.test(value))return'模型下载失败，请检查网络后重试。模型会自动使用浏览器缓存。';
 return'本地模型运行失败，请重试或切换到接口模式。';
}
