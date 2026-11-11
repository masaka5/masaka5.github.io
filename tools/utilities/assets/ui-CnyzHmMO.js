import{r as f,j as e}from"./toolbox-V8Mb6zl3.js";import{T as C}from"./text-tool-BNJ1nLL1.js";import{F as h}from"./panel-BVEEuXxF.js";import{I as E}from"./input-oXBawGgZ.js";import{S as g,a as $,b,c as v,d as m}from"./select-C9GhWyKZ.js";import"./button-yaYS2cEr.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";import"./index-D17hSi50.js";import"./index-B5fXPDQ_.js";import"./index-DWeD1Tma.js";import"./index-dzWK0ZpZ.js";import"./index-C-nIdkMn.js";import"./chevron-down-HAgCO9F5.js";function p(r){return r!==null&&typeof r=="object"&&!Array.isArray(r)}function I(r){return/[=;#]/.test(r)||r!==r.trim()}function A(r){return r==null?"":String(r)}const J=`{
  "appName": "Demo",
  "debug": true,
  "server": {
    "host": "localhost",
    "port": 8080,
    "tags": ["web", "api"]
  },
  "server.tls": {
    "enabled": false
  }
}`;function te(){const[r,N]=f.useState("="),[u,w]=f.useState("repeat"),[l,y]=f.useState(";");return e.jsx(C,{deps:[r,u,l],transform:n=>{if(!n.trim())return"";let c;try{c=JSON.parse(n)}catch(o){throw new Error(o instanceof Error?o.message:"Invalid JSON")}if(!p(c))throw new Error("顶级值必须是JSON对象。");const d=o=>{const t=A(o);return I(t)?`"${t.replace(/"/g,'\\"')}"`:t},j=o=>{const t=[];for(const[i,s]of Object.entries(o))if(!p(s))if(Array.isArray(s))if(u==="comma")t.push(`${i}${r}${s.map(d).join(",")}`);else for(const O of s)t.push(`${i}${r}${d(O)}`);else t.push(`${i}${r}${d(s)}`);return t},a=[];l.trim()&&a.push(`${l} Generated from JSON`,"");const x=j(c);x.length&&a.push(...x,"");const S=(o,t)=>{a.push(`[${o}]`),a.push(...j(t)),a.push("");for(const[i,s]of Object.entries(t))p(s)&&S(`${o}.${i}`,s)};for(const[o,t]of Object.entries(c))p(t)&&S(o,t);return a.join(`
`).replace(/\n{3,}/g,`

`).trimEnd()},inputLabel:"JSON",outputLabel:"INI",sample:J,downloadName:"config.ini",options:e.jsxs(e.Fragment,{children:[e.jsx(h,{label:"分隔符",children:e.jsxs(g,{value:r,onValueChange:n=>N(n),children:[e.jsx($,{className:"w-32",children:e.jsx(b,{})}),e.jsxs(v,{children:[e.jsx(m,{value:"=",children:"键=值"}),e.jsx(m,{value:" = ",children:"键=值"})]})]})}),e.jsx(h,{label:"阵列",children:e.jsxs(g,{value:u,onValueChange:n=>w(n),children:[e.jsx($,{className:"w-40",children:e.jsx(b,{})}),e.jsxs(v,{children:[e.jsx(m,{value:"repeat",children:"重复按键"}),e.jsx(m,{value:"comma",children:"Comma-joined"})]})]})}),e.jsx(h,{label:"评论字符",children:e.jsx(E,{value:l,onChange:n=>y(n.target.value),placeholder:";或#",className:"w-20"})})]})})}export{te as default};
