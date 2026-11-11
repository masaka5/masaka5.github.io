import{r as p,j as c}from"./toolbox-V8Mb6zl3.js";import{T as f,a as m,b as a}from"./tabs-DhdYX72L.js";import{F as d}from"./panel-BVEEuXxF.js";import{T as h}from"./text-tool-BNJ1nLL1.js";import"./index-B5fXPDQ_.js";import"./index-CB5QEDM1.js";import"./index-DWeD1Tma.js";import"./index-dzWK0ZpZ.js";import"./index-C-nIdkMn.js";import"./button-yaYS2cEr.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";const E=`# App configuration
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
}`;function j(n){let t=n.trim();if(t.length===0)return"";const s=t[0];if(s==='"'||s==="'"){let o=1,e="";for(;o<t.length;){const i=t[o];if(i===void 0)break;if(i==="\\"&&s==='"'){const l=t[o+1];l==="n"?e+=`
`:l==="t"?e+="	":l==="r"?e+="\r":l!==void 0&&(e+=l),o+=2;continue}if(i===s)return e;e+=i,o+=1}return e}const r=t.indexOf(" #");return r!==-1&&(t=t.slice(0,r).trim()),t}function T(n){const t={},s=n.split(/\r?\n/);for(const r of s){const o=r.trim();if(o.length===0||o.startsWith("#"))continue;let e=o;e.startsWith("export ")&&(e=e.slice(7).trim());const i=e.indexOf("=");if(i===-1)continue;const l=e.slice(0,i).trim();if(l.length===0)continue;const u=e.slice(i+1);t[l]=j(u)}return JSON.stringify(t,null,2)}function g(n){return n.length===0||/\s/.test(n)||n.includes("#")||n.includes('"')||n.includes("'")||n.includes("=")}function v(n){let t;try{t=JSON.parse(n)}catch{throw new Error("输入不是有效的 JSON。")}if(typeof t!="object"||t===null||Array.isArray(t))throw new Error("JSON必须是键/值对的顶级对象。");const s=Object.entries(t),r=[];for(const[o,e]of s){let i;if(e==null?i="":typeof e=="object"?i=JSON.stringify(e):i=String(e),g(i)){const l=i.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t");r.push(`${o}="${l}"`)}else r.push(`${o}=${i}`)}return r.join(`
`)}function G(){const[n,t]=p.useState("env2json"),s=p.useCallback(o=>o.trim()?n==="env2json"?T(o):v(o):"",[n]),r=n==="env2json";return c.jsx(h,{transform:s,deps:[n],inputLabel:r?".env":"JSON",outputLabel:r?"JSON":".env",inputPlaceholder:r?`键=值
ANOTHER=“引用值”`:`{
  "KEY": "value"
}`,sample:r?E:A,downloadName:r?"env.json":".env",downloadMime:r?"application/json":"text/plain",options:c.jsx(d,{label:"方向",children:c.jsx(f,{value:n,onValueChange:o=>t(o),children:c.jsxs(m,{children:[c.jsx(a,{value:"env2json",children:".env → JSON"}),c.jsx(a,{value:"json2env",children:"JSON → .env"})]})})})})}export{G as default};
