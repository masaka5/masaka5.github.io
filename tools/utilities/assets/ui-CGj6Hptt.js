import{r as h,j as e}from"./toolbox-UanOk967.js";import{T as C}from"./text-tool-Ce2pfWJ7.js";import{F as d}from"./panel-Dz7kmini.js";import{I as E}from"./input-C-alCsST.js";import{S as g,a as $,b,c as v,d as m}from"./select-Bqhypqt4.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";import"./index-D17hSi50.js";import"./index-HQBJxcTJ.js";import"./index-DiK7AOdK.js";import"./index-C-pHolA0.js";import"./index-Bp6S2Opf.js";import"./chevron-down-Yc_stEQ5.js";function p(r){return r!==null&&typeof r=="object"&&!Array.isArray(r)}function A(r){return/[=;#]/.test(r)||r!==r.trim()}function I(r){return r==null?"":String(r)}const J=`{
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
}`;function te(){const[r,N]=h.useState("="),[u,w]=h.useState("repeat"),[l,y]=h.useState(";");return e.jsx(C,{deps:[r,u,l],transform:n=>{if(!n.trim())return"";let c;try{c=JSON.parse(n)}catch(o){throw new Error(o instanceof Error?o.message:"无效的 JSON")}if(!p(c))throw new Error("顶级值必须是JSON对象。");const f=o=>{const t=I(o);return A(t)?`"${t.replace(/"/g,'\\"')}"`:t},j=o=>{const t=[];for(const[i,s]of Object.entries(o))if(!p(s))if(Array.isArray(s))if(u==="comma")t.push(`${i}${r}${s.map(f).join(",")}`);else for(const O of s)t.push(`${i}${r}${f(O)}`);else t.push(`${i}${r}${f(s)}`);return t},a=[];l.trim()&&a.push(`${l} Generated from JSON`,"");const x=j(c);x.length&&a.push(...x,"");const S=(o,t)=>{a.push(`[${o}]`),a.push(...j(t)),a.push("");for(const[i,s]of Object.entries(t))p(s)&&S(`${o}.${i}`,s)};for(const[o,t]of Object.entries(c))p(t)&&S(o,t);return a.join(`
`).replace(/\n{3,}/g,`

`).trimEnd()},inputLabel:"JSON",outputLabel:"INI",sample:J,downloadName:"config.ini",options:e.jsxs(e.Fragment,{children:[e.jsx(d,{label:"分隔符",children:e.jsxs(g,{value:r,onValueChange:n=>N(n),children:[e.jsx($,{className:"w-32",children:e.jsx(b,{})}),e.jsxs(v,{children:[e.jsx(m,{value:"=",children:"键=值"}),e.jsx(m,{value:" = ",children:"键=值"})]})]})}),e.jsx(d,{label:"阵列",children:e.jsxs(g,{value:u,onValueChange:n=>w(n),children:[e.jsx($,{className:"w-40",children:e.jsx(b,{})}),e.jsxs(v,{children:[e.jsx(m,{value:"repeat",children:"重复按键"}),e.jsx(m,{value:"comma",children:"逗号连接"})]})]})}),e.jsx(d,{label:"评论字符",children:e.jsx(E,{value:l,onChange:n=>y(n.target.value),placeholder:";或#",className:"w-20"})})]})})}export{te as default};
