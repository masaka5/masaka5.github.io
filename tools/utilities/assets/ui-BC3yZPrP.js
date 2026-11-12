import{r as u,j as r}from"./toolbox-CmtkVXqR.js";import{T as C}from"./text-tool-DEvyHdcP.js";import{F as d}from"./panel-DmElCoWv.js";import{S as g}from"./switch-mkCNf92t.js";import{S as E}from"./slider-CKfJ9rwn.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./ContextIsolator-g3C8c1gr.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";import"./KeyCode-HJ8jGXz0.js";import"./index-BOQNaMUu.js";import"./useZIndex-wYhMqhMY.js";import"./colors-D9_AbNpR.js";function y(e){return`'${e.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`}const P=`{
  "name": "Ada",
  "active": true,
  "score": 9.5,
  "roles": ["admin", "dev"],
  "meta": { "tier": 2, "note": null }
}`;function nt(){const[e,b]=u.useState(!0),[n,N]=u.useState(4),[a,w]=u.useState(!1);return r.jsx(C,{deps:[e,n,a],transform:o=>{if(!o.trim())return"";let f;try{f=JSON.parse(o)}catch(t){throw new Error(t instanceof Error?t.message:"无效的 JSON")}const i=e?"[":"array(",s=e?"]":")",S=" ".repeat(Math.max(0,n)),p=(t,m)=>{if(t==null)return"null";if(typeof t=="boolean")return t?"true":"false";if(typeof t=="number")return Number.isFinite(t)?String(t):"null";if(typeof t=="string")return y(t);const h=S.repeat(m+1),x=S.repeat(m);if(Array.isArray(t)){if(t.length===0)return`${i}${s}`;const c=t.map(l=>`${h}${p(l,m+1)},`);return`${i}
${c.join(`
`)}
${x}${s}`}const j=Object.entries(t);if(j.length===0)return`${i}${s}`;const A=j.map(([c,l])=>`${h}${y(c)} => ${p(l,m+1)},`);return`${i}
${A.join(`
`)}
${x}${s}`},$=p(f,0);return a?`return ${$};`:$},inputLabel:"JSON",outputLabel:"PHP数组",sample:P,downloadName:"data.php",options:r.jsxs(r.Fragment,{children:[r.jsx(d,{label:"短[]语法",children:r.jsx(g,{checked:e,onCheckedChange:b})}),r.jsx(d,{label:`Indent: ${n}`,className:"min-w-[180px]",children:r.jsx(E,{value:[n],min:2,max:8,step:1,onValueChange:o=>N(o[0]??4)})}),r.jsx(d,{label:"返回……；",children:r.jsx(g,{checked:a,onCheckedChange:w})})]})})}export{nt as default};
