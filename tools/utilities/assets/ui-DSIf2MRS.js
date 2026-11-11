import{r as p,j as r}from"./toolbox-UanOk967.js";import{T as N}from"./text-tool-Ce2pfWJ7.js";import{F as c}from"./panel-Dz7kmini.js";import{S}from"./switch-DPt0k4tg.js";import{S as A}from"./slider-BmvT7n5R.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";import"./index-HQBJxcTJ.js";import"./index-D17hSi50.js";import"./index-DiK7AOdK.js";function g(e){return`"${e.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\t/g,"\\t")}"`}const E=/^[A-Za-z_][A-Za-z0-9_]*$/,T=`{
  "name": "Ada",
  "active": true,
  "score": 9.5,
  "tags": ["admin", "dev"],
  "meta": { "tier": 2, "note": null, "1invalid": "x" }
}`;function U(){const[e,$]=p.useState(!0),[s,b]=p.useState(!0),[n,j]=p.useState(2);return r.jsx(N,{deps:[e,s,n],transform:o=>{if(!o.trim())return"";let l;try{l=JSON.parse(o)}catch(t){throw new Error(t instanceof Error?t.message:"无效的 JSON")}const d=" ".repeat(Math.max(0,n)),y=t=>e&&E.test(t)?s?`${t}: `:`:${t} => `:`${g(t)} => `,a=(t,i)=>{if(t==null)return"nil";if(typeof t=="boolean")return t?"true":"false";if(typeof t=="number")return Number.isFinite(t)?String(t):"nil";if(typeof t=="string")return g(t);const u=d.repeat(i+1),f=d.repeat(i);if(Array.isArray(t))return t.length===0?"[]":`[
${t.map(m=>`${u}${a(m,i+1)},`).join(`
`)}
${f}]`;const h=Object.entries(t);return h.length===0?"{}":`{
${h.map(([x,m])=>`${u}${y(x)}${a(m,i+1)},`).join(`
`)}
${f}}`};return a(l,0)},inputLabel:"JSON",outputLabel:"红宝石哈希",sample:T,downloadName:"data.rb",options:r.jsxs(r.Fragment,{children:[r.jsx(c,{label:"符号键",children:r.jsx(S,{checked:e,onCheckedChange:$})}),r.jsx(c,{label:"1.9简写（重点：）",children:r.jsx(S,{checked:s,onCheckedChange:b})}),r.jsx(c,{label:`Indent: ${n}`,className:"min-w-[180px]",children:r.jsx(A,{value:[n],min:2,max:8,step:1,onValueChange:o=>j(o[0]??2)})})]})})}export{U as default};
