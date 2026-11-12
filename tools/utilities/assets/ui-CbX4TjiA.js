import{r as h,j as e}from"./toolbox-C1bqIItI.js";import{T as C}from"./text-tool-DKzwReiD.js";import{F as d}from"./panel-BS_kjOg7.js";import{I as E}from"./input-BQFgluN1.js";import{S as g,a as $,b,c as v,d as m}from"./select-CybKzMZs.js";import"./product-controls-DefmGwRs.js";import"./textarea-CvYfK1Ma.js";import"./index-N7Nfcwyv.js";import"./ContextIsolator-9GaOU_7w.js";import"./SearchOutlined-BqroMpgS.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./useId-CzaMCTks.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";import"./index-DBUEnVox.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-D4e4PvxS.js";import"./useLocale-DuzSycax.js";import"./CloseOutlined-BO7eRoZi.js";import"./useZIndex-Dli3NBiq.js";function p(r){return r!==null&&typeof r=="object"&&!Array.isArray(r)}function A(r){return/[=;#]/.test(r)||r!==r.trim()}function I(r){return r==null?"":String(r)}const J=`{
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
