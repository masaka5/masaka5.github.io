import{r as u,j as c}from"./toolbox-BAFlSbAu.js";import{u as m}from"./use-view-state-Buv1JcBh.js";import{T as f,a as d,b as p}from"./tabs-4oc-BJj3.js";import{F as h}from"./panel-Bqi8iGiy.js";import{T as E}from"./text-tool-DJbu6FIk.js";import"./CloseOutlined-DTTOE6cy.js";import"./ContextIsolator-DC_hgRVI.js";import"./index-CrsyJUrn.js";import"./useId-CQJPC48K.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-CXeRYAeu.js";import"./product-controls-B1-Khcjt.js";import"./input-z_zqgJn8.js";import"./index-CLt5N8Xt.js";import"./SearchOutlined-avAJ2sSo.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";const j=`# App configuration
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
}`;function v(o){let t=o.trim();if(t.length===0)return"";const s=t[0];if(s==='"'||s==="'"){let n=1,e="";for(;n<t.length;){const i=t[n];if(i===void 0)break;if(i==="\\"&&s==='"'){const l=t[n+1];l==="n"?e+=`
`:l==="t"?e+="	":l==="r"?e+="\r":l!==void 0&&(e+=l),n+=2;continue}if(i===s)return e;e+=i,n+=1}return e}const r=t.indexOf(" #");return r!==-1&&(t=t.slice(0,r).trim()),t}function T(o){const t={},s=o.split(/\r?\n/);for(const r of s){const n=r.trim();if(n.length===0||n.startsWith("#"))continue;let e=n;e.startsWith("export ")&&(e=e.slice(7).trim());const i=e.indexOf("=");if(i===-1)continue;const l=e.slice(0,i).trim();if(l.length===0)continue;const a=e.slice(i+1);t[l]=v(a)}return JSON.stringify(t,null,2)}function g(o){return o.length===0||/\s/.test(o)||o.includes("#")||o.includes('"')||o.includes("'")||o.includes("=")}function x(o){let t;try{t=JSON.parse(o)}catch{throw new Error("输入不是有效的 JSON。")}if(typeof t!="object"||t===null||Array.isArray(t))throw new Error("JSON必须是键/值对的顶级对象。");const s=Object.entries(t),r=[];for(const[n,e]of s){let i;if(e==null?i="":typeof e=="object"?i=JSON.stringify(e):i=String(e),g(i)){const l=i.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t");r.push(`${n}="${l}"`)}else r.push(`${n}=${i}`)}return r.join(`
`)}function z(){const[o,t]=m("tools/web/web-dotenv-to-json/ui.tsx:direction","env2json"),s=u.useCallback(n=>n.trim()?o==="env2json"?T(n):x(n):"",[o]),r=o==="env2json";return c.jsx(E,{transform:s,deps:[o],inputLabel:r?".env":"JSON",outputLabel:r?"JSON":".env",inputPlaceholder:r?`键=值
ANOTHER=“引用值”`:`{
  "KEY": "value"
}`,sample:r?j:A,downloadName:r?"env.json":".env",downloadMime:r?"application/json":"text/plain",options:c.jsx(h,{label:"方向",children:c.jsx(f,{value:o,onValueChange:n=>t(n),children:c.jsxs(d,{children:[c.jsx(p,{value:"env2json",children:".env → JSON"}),c.jsx(p,{value:"json2env",children:"JSON → .env"})]})})})})}export{z as default};
