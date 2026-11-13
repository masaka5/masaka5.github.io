// DSH-style durable task state lives outside the model's compacted projection.
export function createTask(goal){return {id:crypto.randomUUID(),goal:String(goal),facts:[],status:'in_progress'};}
export function finishTask(task,completed){return task?{...task,status:completed?'completed':'in_progress'}:null;}
export function readTaskReply(value){
 const text=String(value),match=text.match(/(?:^|\n)<task-complete\s*\/>\s*$/);
 // Markers inside a fenced example are data, not a task transition.
 const completed=!!match&&!!text.slice(0,match.index).trim()&&((text.slice(0,match.index).match(/^```/gm)||[]).length%2===0);
 return {text:completed?text.slice(0,match.index).trimEnd():text,completed};
}
export function taskContext(task,{maxTokens=1024,textTokens=s=>Math.ceil(s.length/2)}={}){
 if(!task)return null;
 const heading=`任务状态：${task.status==='completed'?'已完成':'进行中'}。\n`,
  instructions='继续当前请求，保留已确认的重点；不要重做已完成工作。只有满足任务全部要求时，才可在最终回答末尾独立添加 <task-complete/>。需要用户操作、选择或验证时保持进行中。回答完整后结束本轮，不为继续生成而编造步骤。',
  facts=task.facts.length?'\n用户固定的重点（原文）：\n'+task.facts.join('\n'):'',
  full=heading+'原始目标：\n'+task.goal+facts+'\n'+instructions,
  compact=heading+'完整目标保存在原始对话和上下文检查点中。'+facts+'\n'+instructions;
 const wrap=value=>`<task-memory>\n${value}\n</task-memory>`;
 const content=textTokens(wrap(full))<=maxTokens?wrap(full):wrap(compact);
 if(textTokens(content)>maxTokens)throw Error('local-task-memory-too-large');
 return {role:'user',content};
}
function browserAdapter(){
 let opening;
 const db=()=>opening||=(new Promise((resolve,reject)=>{
  const request=indexedDB.open('pocket-ai-journal',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('conversations');
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>{opening=null;reject(request.error);};
  request.onblocked=()=>{opening=null;reject(Error('请关闭其他 AI 助手标签页后重试保存。'));};
 }));
 const transact=async(mode,value)=>{
  const database=await db();
  return new Promise((resolve,reject)=>{
   const transaction=database.transaction('conversations',mode),store=transaction.objectStore('conversations');
   const request=mode==='readonly'?store.get('current'):store.put(value,'current');
   transaction.oncomplete=()=>resolve(request.result);transaction.onerror=()=>reject(transaction.error||request.error);
   transaction.onabort=()=>reject(transaction.error||Error('会话保存已中断。'));
  });
 };
 return {read:()=>transact('readonly'),write:value=>transact('readwrite',value)};
}
export class ConversationStore{
 constructor({adapter}={}){this.adapter=adapter||browserAdapter();this.tail=Promise.resolve();}
 read(){return this.adapter.read();}
 save(state){
  const snapshot=structuredClone({...state,version:1,savedAt:Date.now()});
  const result=this.tail.catch(()=>{}).then(()=>this.adapter.write(snapshot));this.tail=result;return result;
 }
}
