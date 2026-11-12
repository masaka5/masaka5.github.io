import{r as p,j as r}from"./toolbox-CmtkVXqR.js";import{T as N}from"./text-tool-DEvyHdcP.js";import{F as c}from"./panel-DmElCoWv.js";import{S}from"./switch-mkCNf92t.js";import{S as A}from"./slider-CKfJ9rwn.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./ContextIsolator-g3C8c1gr.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";import"./KeyCode-HJ8jGXz0.js";import"./index-BOQNaMUu.js";import"./useZIndex-wYhMqhMY.js";import"./colors-D9_AbNpR.js";function g(e){return`"${e.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\t/g,"\\t")}"`}const E=/^[A-Za-z_][A-Za-z0-9_]*$/,T=`{
  "name": "Ada",
  "active": true,
  "score": 9.5,
  "tags": ["admin", "dev"],
  "meta": { "tier": 2, "note": null, "1invalid": "x" }
}`;function et(){const[e,$]=p.useState(!0),[s,b]=p.useState(!0),[n,j]=p.useState(2);return r.jsx(N,{deps:[e,s,n],transform:o=>{if(!o.trim())return"";let l;try{l=JSON.parse(o)}catch(t){throw new Error(t instanceof Error?t.message:"无效的 JSON")}const d=" ".repeat(Math.max(0,n)),y=t=>e&&E.test(t)?s?`${t}: `:`:${t} => `:`${g(t)} => `,m=(t,i)=>{if(t==null)return"nil";if(typeof t=="boolean")return t?"true":"false";if(typeof t=="number")return Number.isFinite(t)?String(t):"nil";if(typeof t=="string")return g(t);const u=d.repeat(i+1),f=d.repeat(i);if(Array.isArray(t))return t.length===0?"[]":`[
${t.map(a=>`${u}${m(a,i+1)},`).join(`
`)}
${f}]`;const h=Object.entries(t);return h.length===0?"{}":`{
${h.map(([x,a])=>`${u}${y(x)}${m(a,i+1)},`).join(`
`)}
${f}}`};return m(l,0)},inputLabel:"JSON",outputLabel:"红宝石哈希",sample:T,downloadName:"data.rb",options:r.jsxs(r.Fragment,{children:[r.jsx(c,{label:"符号键",children:r.jsx(S,{checked:e,onCheckedChange:$})}),r.jsx(c,{label:"1.9简写（重点：）",children:r.jsx(S,{checked:s,onCheckedChange:b})}),r.jsx(c,{label:`Indent: ${n}`,className:"min-w-[180px]",children:r.jsx(A,{value:[n],min:2,max:8,step:1,onValueChange:o=>j(o[0]??2)})})]})})}export{et as default};
