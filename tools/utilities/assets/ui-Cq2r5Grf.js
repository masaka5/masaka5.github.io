import{r as u,j as r}from"./toolbox-UanOk967.js";import{T as C}from"./text-tool-Ce2pfWJ7.js";import{F as d}from"./panel-Dz7kmini.js";import{S as g}from"./switch-DPt0k4tg.js";import{S as E}from"./slider-BmvT7n5R.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";import"./index-HQBJxcTJ.js";import"./index-D17hSi50.js";import"./index-DiK7AOdK.js";function y(e){return`'${e.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`}const P=`{
  "name": "Ada",
  "active": true,
  "score": 9.5,
  "roles": ["admin", "dev"],
  "meta": { "tier": 2, "note": null }
}`;function Y(){const[e,b]=u.useState(!0),[n,N]=u.useState(4),[m,w]=u.useState(!1);return r.jsx(C,{deps:[e,n,m],transform:o=>{if(!o.trim())return"";let f;try{f=JSON.parse(o)}catch(t){throw new Error(t instanceof Error?t.message:"无效的 JSON")}const i=e?"[":"array(",s=e?"]":")",S=" ".repeat(Math.max(0,n)),p=(t,a)=>{if(t==null)return"null";if(typeof t=="boolean")return t?"true":"false";if(typeof t=="number")return Number.isFinite(t)?String(t):"null";if(typeof t=="string")return y(t);const h=S.repeat(a+1),x=S.repeat(a);if(Array.isArray(t)){if(t.length===0)return`${i}${s}`;const c=t.map(l=>`${h}${p(l,a+1)},`);return`${i}
${c.join(`
`)}
${x}${s}`}const j=Object.entries(t);if(j.length===0)return`${i}${s}`;const A=j.map(([c,l])=>`${h}${y(c)} => ${p(l,a+1)},`);return`${i}
${A.join(`
`)}
${x}${s}`},$=p(f,0);return m?`return ${$};`:$},inputLabel:"JSON",outputLabel:"PHP数组",sample:P,downloadName:"data.php",options:r.jsxs(r.Fragment,{children:[r.jsx(d,{label:"短[]语法",children:r.jsx(g,{checked:e,onCheckedChange:b})}),r.jsx(d,{label:`Indent: ${n}`,className:"min-w-[180px]",children:r.jsx(E,{value:[n],min:2,max:8,step:1,onValueChange:o=>N(o[0]??4)})}),r.jsx(d,{label:"返回……；",children:r.jsx(g,{checked:m,onCheckedChange:w})})]})})}export{Y as default};
