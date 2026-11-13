export const RELEASE='20261114-qwen1';
export const MODEL_ROOT='https://huggingface.co/Serveurperso/Qwen3-TTS-GGUF/resolve/b7ee2e8c7459c3bea99da23e3d178125a7d1713c/';
export const MODES={
 customvoice:{label:'预设音色',file:'qwen-talker-1.7b-customvoice-Q4_K_M.gguf',size:1182631296},
 voicedesign:{label:'声音设计',file:'qwen-talker-1.7b-voicedesign-Q4_K_M.gguf',size:1182630816},
 base:{label:'音色克隆',file:'qwen-talker-1.7b-base-Q4_K_M.gguf',size:1219245248}
};
export const CODEC={file:'qwen-tokenizer-12hz-Q8_0.gguf',size:291150624};
export function modelEntries(mode,quality='standard'){
 if(!MODES[mode])throw Error('生成模式无效');
 if(quality!=='lite'||mode==='voicedesign')return [MODES[mode],CODEC];
 const file=`qwen-talker-0.6b-${mode}-Q4_K_M.gguf`;
 return [{...MODES[mode],file,size:mode==='base'?628905056:604878080},CODEC];
}
export const LANGUAGES=[['auto','自动'],['chinese','中文'],['english','英语'],['japanese','日语'],['korean','韩语'],['german','德语'],['french','法语'],['russian','俄语'],['portuguese','葡萄牙语'],['spanish','西班牙语'],['italian','意大利语']];
export const SPEAKERS=[['vivian','Vivian · 明亮女声'],['serena','Serena · 温柔女声'],['uncle_fu','福叔 · 低沉男声'],['dylan','Dylan · 北京男声'],['eric','Eric · 四川男声'],['ryan','Ryan · 活力男声'],['aiden','Aiden · 美式男声'],['ono_anna','小野杏 · 日语女声'],['sohee','Sohee · 韩语女声']];
export const DEFAULTS={seed:42,tokens:512,temperature:.9,topK:50,topP:1,repetition:1.05,subTemperature:.9,subTopK:50,subTopP:1};
export function validateRequest(request){
 if(!MODES[request.mode])throw Error('请选择生成模式。');
 if(!request.text?.trim())throw Error('请输入要朗读的文字。');
 if(request.mode==='customvoice'&&!SPEAKERS.some(([id])=>id===request.speaker))throw Error('请选择音色。');
 if(request.mode==='voicedesign'&&!request.instruction?.trim())throw Error('请描述需要的声音。');
 if(request.mode==='base'&&!request.hasReference)throw Error('请选择参考音频。');
 if(request.mode==='base'&&!request.xVectorOnly&&!request.refText?.trim())throw Error('请填写参考音频文字，或启用仅提取音色。');
 for(const [key,min,max]of [['seed',0,2147483647],['tokens',16,768],['temperature',0,2],['topK',0,2048],['topP',0.01,1],['repetition',1,2],['subTemperature',0,2],['subTopK',0,2048],['subTopP',.01,1]]){
  const value=request.options?.[key];if(!Number.isFinite(value)||value<min||value>max)throw Error('请检查高级参数。');
 }
 return request;
}
// Bound complete clauses as well as long unpunctuated input. A 1024-position
// browser KV cache then accommodates prompt, reference and generated frames.
export function splitText(text,budget=110){
 const parts=[];let current='';
 for(const char of text.trim()){
  current+=char;
  if(current.length>=budget||(/[。！？!?\n]/u.test(char)&&current.length>=12)){
   if(current.trim())parts.push(current.trim());current='';
  }
 }
 if(current.trim())parts.push(current.trim());return parts;
}
