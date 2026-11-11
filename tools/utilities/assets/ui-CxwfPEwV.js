import{r as x,j as L}from"./toolbox-V8Mb6zl3.js";import{T as w}from"./text-tool-BNJ1nLL1.js";import"./button-yaYS2cEr.js";import"./panel-BVEEuXxF.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";function S(t){const r=[];for(const n of t.split(/\r?\n/)){if(/^\s*#/.test(n)||/^\s*---\s*$/.test(n)||/^\s*\.\.\.\s*$/.test(n)||n.trim()==="")continue;const e=n.length-n.replace(/^ +/,"").length;r.push({indent:e,content:n.slice(e)})}return r}function j(t){let r=null;for(let n=0;n<t.length;n++){const e=t[n]??"";if(r){e===r&&(r=null);continue}if(e==='"'||e==="'")r=e;else if(e==="#"&&(n===0||t[n-1]===" "))return t.slice(0,n)}return t}function m(t){let r=j(t).trim();if(r==="")return null;if(r.startsWith('"')&&r.endsWith('"')||r.startsWith("'")&&r.endsWith("'")){const n=r.slice(1,-1);return r[0]==='"'?n.replace(/\\"/g,'"').replace(/\\n/g,`
`):n}if(r.startsWith("[")||r.startsWith("{"))return N(r);if(r==="null"||r==="~")return null;if(r==="true"||r==="True")return!0;if(r==="false"||r==="False")return!1;if(/^[+-]?\d+$/.test(r)){const n=Number(r);if(Number.isFinite(n))return n}if(/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(r)){const n=Number(r);if(Number.isFinite(n))return n}return r}function N(t){const r=t[0],n=t.slice(1,t.lastIndexOf(r==="["?"]":"}")),e=O(n);if(r==="[")return e.map(l=>m(l.trim()));const s={};for(const l of e){const i=l.indexOf(":");if(i<0)continue;const o=m(l.slice(0,i).trim());s[String(o)]=m(l.slice(i+1).trim())}return s}function O(t){const r=[];let n=0,e="",s=null;for(let l=0;l<t.length;l++){const i=t[l]??"";if(s){e+=i,i===s&&(s=null);continue}if(i==='"'||i==="'"){s=i,e+=i;continue}if((i==="["||i==="{")&&n++,(i==="]"||i==="}")&&n--,i===","&&n===0){r.push(e),e="";continue}e+=i}return e.trim()!==""&&r.push(e),r}function b(t,r,n){let e=r;const s=t[e];if(!s)return[null,e];if(s.content.startsWith("- ")||s.content==="-"){const o=[];for(;e<t.length;){const c=t[e];if(!c||c.indent<n||c.indent>n||!(c.content.startsWith("- ")||c.content==="-"))break;const u=c.content==="-"?"":c.content.slice(2);if(e++,u.trim()===""){const[a,f]=b(t,e,n+1);o.push(a),e=f}else if(/^[^:\s][^:]*:(\s|$)/.test(u)||u.includes(": ")){const a=c.indent+2,p=[...[{indent:a,content:u}]];for(;e<t.length;){const h=t[e];if(!h||h.indent<=c.indent)break;p.push(h),e++}const[y]=b(p,0,a);o.push(y)}else o.push(m(u))}return[o,e]}const i={};for(;e<t.length;){const o=t[e];if(!o||o.indent<n||o.indent>n||o.content.startsWith("- "))break;const c=W(o.content);if(c<0){e++;continue}const u=m(o.content.slice(0,c).trim()),a=o.content.slice(c+1),f=j(a).trim();if(e++,f===""||f==="|"||f===">"){const p=t[e];if(p&&p.indent>n){const[y,h]=b(t,e,p.indent);i[String(u)]=y,e=h}else i[String(u)]=null}else i[String(u)]=m(f)}return[i,e]}function W(t){let r=null;for(let n=0;n<t.length;n++){const e=t[n]??"";if(r){e===r&&(r=null);continue}if(e==='"'||e==="'")r=e;else if(e===":"&&(n+1>=t.length||t[n+1]===" "))return n}return-1}function M(t){const r=S(t);if(r.length===0)return{};const n=r[0]?.indent??0,[e]=b(r,0,n);return e}function d(t){return t!==null&&typeof t=="object"&&!Array.isArray(t)}function F(t){return Array.isArray(t)&&t.length>0&&t.every(r=>d(r))}function g(t){return/^[A-Za-z0-9_-]+$/.test(t)?t:JSON.stringify(t)}function A(t){return t===null?'""':typeof t=="boolean"?t?"true":"false":typeof t=="number"?Number.isFinite(t)?String(t):t>0?"inf":Number.isNaN(t)?"nan":"-inf":typeof t=="string"&&/^\d{4}-\d{2}-\d{2}([Tt ]\d{2}:\d{2}:\d{2}(\.\d+)?([Zz]|[+-]\d{2}:\d{2})?)?$/.test(t)?t:JSON.stringify(t)}function T(t){return`[${t.map(n=>d(n)?k(n):Array.isArray(n)?T(n):A(n)).join(", ")}]`}function k(t){return`{ ${Object.entries(t).map(([n,e])=>{let s;return d(e)?s=k(e):Array.isArray(e)?s=T(e):s=A(e),`${g(n)} = ${s}`}).join(", ")} }`}function $(t,r){const n=[],e=[];for(const[l,i]of Object.entries(t)){const o=[...r,l],c=o.map(g).join(".");if(d(i)){const u=$(i,o);e.push(`[${c}]
${u}`.replace(/\n+$/,"")+`
`)}else if(F(i))for(const u of i){const a=$(u,o);e.push(`[[${c}]]
${a}`.replace(/\n+$/,"")+`
`)}else Array.isArray(i)?n.push(`${g(l)} = ${T(i)}`):n.push(`${g(l)} = ${A(i)}`)}return(n.length?n.join(`
`)+`
`:"")+(e.length?`
`+e.join(`
`):"")}function I(t){if(!d(t))throw new Error("顶级YAML必须是要转换为TOML的映射。");return $(t,[]).replace(/\n{3,}/g,`

`).trim()+`
`}function U(){const t=x.useCallback(r=>{if(!r.trim())return"";let n;try{n=M(r)}catch(e){throw new Error(`YAML parse error: ${e.message}`)}return I(n)},[]);return L.jsx(w,{transform:t,inputLabel:"YAML",outputLabel:"TOML",inputPlaceholder:`标题：示例
所有者：
  姓名：汤姆
  年龄：42`,sample:`title: TOML Demo
version: 1.0.0
active: true
port: 8080

database:
  server: 192.168.1.1
  ports: [8000, 8001, 8002]

servers:
  - name: alpha
    ip: 10.0.0.1
  - name: beta
    ip: 10.0.0.2
`,downloadName:"config.toml",downloadMime:"text/plain"})}export{U as default};
