const MAX_ROWS=1000,MAX_PAYLOAD=1600;
function clean(value){return String(value??'').replace(/^\uFEFF/,'');}
function jsonValue(value){if(value!==null&&typeof value==='object')return JSON.stringify(value);return String(value??'');}
export function parseRows(input,type='lines',options={}){
 const source=clean(input);if(!source.trim())return [];
 let rows;
 if(type==='json'){
  let parsed;try{parsed=JSON.parse(source);}catch{throw Error('JSON 格式不正确');}
  if(!Array.isArray(parsed))parsed=[parsed];
  if(parsed.some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw Error('JSON 每一项必须是对象');
  rows=parsed.map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,jsonValue(value)])));
 }else if(type==='csv'){
  const lines=[];let row=[],cell='',quoted=false;
  for(let i=0;i<source.length;i++){const ch=source[i],next=source[i+1];if(ch==='"'){if(quoted&&next==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){row.push(cell);cell='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&next==='\n')i++;row.push(cell);cell='';if(row.some(v=>v!==''))lines.push(row);row=[];}else cell+=ch;}
  if(quoted)throw Error('CSV 引号未闭合');row.push(cell);if(row.some(v=>v!==''))lines.push(row);
  if(!lines.length)return [];
  const headers=lines[0].map((h,i)=>clean(h).trim()||`字段${i+1}`);if(new Set(headers).size!==headers.length)throw Error('CSV 表头存在重复列');
  rows=lines.slice(1).map(values=>{if(values.length!==headers.length)throw Error('CSV 数据列数与表头不一致');return Object.fromEntries(headers.map((h,i)=>[h,values[i]]));});
 }else{
  const trim=options.trim!==false,dedupe=options.dedupe===true,seen=new Set();rows=source.split(/\r?\n/).map(value=>trim?value.trim():value).filter(value=>value!==''||!trim).map(value=>({内容:value})).filter(row=>{if(!dedupe)return true;if(seen.has(row.内容))return false;seen.add(row.内容);return true;});
 }
 if(rows.length>MAX_ROWS)throw Error(`最多支持 ${MAX_ROWS} 条数据`);return rows;
}
export function formatInput(input,type){if(type!=='json')return input;try{return JSON.stringify(JSON.parse(clean(input)),null,2);}catch{throw Error('JSON 格式不正确');}}
export function makeItems(rows,options={}){
 const content=String(options.content??'{{内容}}'),title=String(options.title??''),subtitle=String(options.subtitle??''),prefix=String(options.prefix??''),suffix=String(options.suffix??''),start=Number(options.start??1);if(!Number.isInteger(start)||start<0)throw Error('起始序号无效');
 const fields=new Set(rows.flatMap(row=>Object.keys(row)));const render=(template,row,index)=>String(template).replace(/{{\s*([^{}]+?)\s*}}/g,(_,field)=>{if(field==='序号')return String(start+index);if(!fields.has(field))throw Error(`模板字段不存在：${field}`);return row[field]??'';});
 return rows.map((row,index)=>{let value=render(content,row,index);if(options.format==='url')value=encodeURI(value);if(options.format==='base64')value=btoa(unescape(encodeURIComponent(value)));if(options.format==='json'){try{value=JSON.stringify(JSON.parse(value));}catch{throw Error('内容不是有效 JSON');}}value=prefix+value+suffix;if(!value.trim())throw Error('二维码内容不能为空');if(value.length>MAX_PAYLOAD)throw Error(`第 ${index+1} 条内容过长（最多 ${MAX_PAYLOAD} 字符）`);return{content:value,title:render(title,row,index),subtitle:render(subtitle,row,index),index:index+1};});
}
export function printLayout(options,count){const {paperWidth,paperHeight,width,height,margin,gap,copies}=options;if(![paperWidth,paperHeight,width,height,margin,gap].every(Number.isFinite)||width<=0||height<=0)throw Error('打印尺寸无效');if(!Number.isInteger(copies)||copies<1||copies>100)throw Error('份数需为 1–100');const columns=Math.floor((paperWidth-2*margin+gap)/(width+gap)),rows=Math.floor((paperHeight-2*margin+gap)/(height+gap));if(columns<1||rows<1)throw Error('当前标签尺寸在纸张上放不下');const perPage=columns*rows,total=count*copies;return{columns,rows,perPage,pages:Math.ceil(total/perPage),total};}
export const limits={MAX_ROWS,MAX_PAYLOAD};
