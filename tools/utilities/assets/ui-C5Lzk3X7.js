import{r as p,j as c}from"./toolbox-CmtkVXqR.js";import{T as m,a as f,b as a}from"./tabs-CgjPmVkM.js";import{F as d}from"./panel-DmElCoWv.js";import{T as h}from"./text-tool-DEvyHdcP.js";import"./CloseOutlined-BbHBxdIs.js";import"./ContextIsolator-g3C8c1gr.js";import"./index-BOQNaMUu.js";import"./useId-Chs6QaAi.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-ad_kj95Y.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";const E=`# App configuration
export NODE_ENV=production
PORT=3000
APP_NAME="My Cool App"
DATABASE_URL='postgres://user:pass@localhost:5432/db'
EMPTY=
FEATURE_FLAG=true # inline comment`,A=`{
  "NODE_ENV": "production",
  "PORT": "3000",
  "APP_NAME": "My Cool App",
  "DATABASE_URL": "postgres://user:pass@localhost:5432/db",
  "EMPTY": "",
  "FEATURE_FLAG": "true"
}`;function j(o){let t=o.trim();if(t.length===0)return"";const s=t[0];if(s==='"'||s==="'"){let n=1,e="";for(;n<t.length;){const i=t[n];if(i===void 0)break;if(i==="\\"&&s==='"'){const l=t[n+1];l==="n"?e+=`
`:l==="t"?e+="	":l==="r"?e+="\r":l!==void 0&&(e+=l),n+=2;continue}if(i===s)return e;e+=i,n+=1}return e}const r=t.indexOf(" #");return r!==-1&&(t=t.slice(0,r).trim()),t}function T(o){const t={},s=o.split(/\r?\n/);for(const r of s){const n=r.trim();if(n.length===0||n.startsWith("#"))continue;let e=n;e.startsWith("export ")&&(e=e.slice(7).trim());const i=e.indexOf("=");if(i===-1)continue;const l=e.slice(0,i).trim();if(l.length===0)continue;const u=e.slice(i+1);t[l]=j(u)}return JSON.stringify(t,null,2)}function g(o){return o.length===0||/\s/.test(o)||o.includes("#")||o.includes('"')||o.includes("'")||o.includes("=")}function v(o){let t;try{t=JSON.parse(o)}catch{throw new Error("输入不是有效的 JSON。")}if(typeof t!="object"||t===null||Array.isArray(t))throw new Error("JSON必须是键/值对的顶级对象。");const s=Object.entries(t),r=[];for(const[n,e]of s){let i;if(e==null?i="":typeof e=="object"?i=JSON.stringify(e):i=String(e),g(i)){const l=i.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t");r.push(`${n}="${l}"`)}else r.push(`${n}=${i}`)}return r.join(`
`)}function K(){const[o,t]=p.useState("env2json"),s=p.useCallback(n=>n.trim()?o==="env2json"?T(n):v(n):"",[o]),r=o==="env2json";return c.jsx(h,{transform:s,deps:[o],inputLabel:r?".env":"JSON",outputLabel:r?"JSON":".env",inputPlaceholder:r?`键=值
ANOTHER=“引用值”`:`{
  "KEY": "value"
}`,sample:r?E:A,downloadName:r?"env.json":".env",downloadMime:r?"application/json":"text/plain",options:c.jsx(d,{label:"方向",children:c.jsx(m,{value:o,onValueChange:n=>t(n),children:c.jsxs(f,{children:[c.jsx(a,{value:"env2json",children:".env → JSON"}),c.jsx(a,{value:"json2env",children:"JSON → .env"})]})})})})}export{K as default};
