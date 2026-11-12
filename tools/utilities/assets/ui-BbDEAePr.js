import{r as p,j as c}from"./toolbox-C1bqIItI.js";import{T as m,a as f,b as a}from"./tabs-BR_HzUSj.js";import{F as d}from"./panel-BS_kjOg7.js";import{T as h}from"./text-tool-DKzwReiD.js";import"./CloseOutlined-BO7eRoZi.js";import"./ContextIsolator-9GaOU_7w.js";import"./index-DBUEnVox.js";import"./useId-CzaMCTks.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-D4e4PvxS.js";import"./product-controls-DefmGwRs.js";import"./input-BQFgluN1.js";import"./index-N7Nfcwyv.js";import"./SearchOutlined-BqroMpgS.js";import"./textarea-CvYfK1Ma.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";const E=`# App configuration
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
