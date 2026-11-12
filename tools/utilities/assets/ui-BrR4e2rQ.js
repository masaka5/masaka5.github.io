import{r as h,j as e}from"./toolbox-CmtkVXqR.js";import{T as C}from"./text-tool-DEvyHdcP.js";import{F as d}from"./panel-DmElCoWv.js";import{I as E}from"./input-CQci13IV.js";import{S as g,a as $,b,c as v,d as m}from"./select-BtrkL6xQ.js";import"./product-controls-DM7ptYUH.js";import"./textarea-Cln-1zVs.js";import"./index-IMt1bn3i.js";import"./ContextIsolator-g3C8c1gr.js";import"./SearchOutlined-DekVZon5.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";import"./index-BOQNaMUu.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-ad_kj95Y.js";import"./useLocale-mwY0lCuK.js";import"./CloseOutlined-BbHBxdIs.js";import"./useZIndex-wYhMqhMY.js";function p(r){return r!==null&&typeof r=="object"&&!Array.isArray(r)}function A(r){return/[=;#]/.test(r)||r!==r.trim()}function I(r){return r==null?"":String(r)}const J=`{
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
}`;function ae(){const[r,N]=h.useState("="),[u,w]=h.useState("repeat"),[l,y]=h.useState(";");return e.jsx(C,{deps:[r,u,l],transform:n=>{if(!n.trim())return"";let c;try{c=JSON.parse(n)}catch(o){throw new Error(o instanceof Error?o.message:"无效的 JSON")}if(!p(c))throw new Error("顶级值必须是JSON对象。");const f=o=>{const t=I(o);return A(t)?`"${t.replace(/"/g,'\\"')}"`:t},j=o=>{const t=[];for(const[a,s]of Object.entries(o))if(!p(s))if(Array.isArray(s))if(u==="comma")t.push(`${a}${r}${s.map(f).join(",")}`);else for(const O of s)t.push(`${a}${r}${f(O)}`);else t.push(`${a}${r}${f(s)}`);return t},i=[];l.trim()&&i.push(`${l} Generated from JSON`,"");const x=j(c);x.length&&i.push(...x,"");const S=(o,t)=>{i.push(`[${o}]`),i.push(...j(t)),i.push("");for(const[a,s]of Object.entries(t))p(s)&&S(`${o}.${a}`,s)};for(const[o,t]of Object.entries(c))p(t)&&S(o,t);return i.join(`
`).replace(/\n{3,}/g,`

`).trimEnd()},inputLabel:"JSON",outputLabel:"INI",sample:J,downloadName:"config.ini",options:e.jsxs(e.Fragment,{children:[e.jsx(d,{label:"分隔符",children:e.jsxs(g,{value:r,onValueChange:n=>N(n),children:[e.jsx($,{className:"w-32",children:e.jsx(b,{})}),e.jsxs(v,{children:[e.jsx(m,{value:"=",children:"键=值"}),e.jsx(m,{value:" = ",children:"键=值"})]})]})}),e.jsx(d,{label:"阵列",children:e.jsxs(g,{value:u,onValueChange:n=>w(n),children:[e.jsx($,{className:"w-40",children:e.jsx(b,{})}),e.jsxs(v,{children:[e.jsx(m,{value:"repeat",children:"重复按键"}),e.jsx(m,{value:"comma",children:"逗号连接"})]})]})}),e.jsx(d,{label:"评论字符",children:e.jsx(E,{value:l,onChange:n=>y(n.target.value),placeholder:";或#",className:"w-20"})})]})})}export{ae as default};
