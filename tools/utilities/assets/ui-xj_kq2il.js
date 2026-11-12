import{r as u,j as r}from"./toolbox-C1bqIItI.js";import{T as C}from"./text-tool-DKzwReiD.js";import{F as d}from"./panel-BS_kjOg7.js";import{S as g}from"./switch-CtKsE6C3.js";import{S as E}from"./slider-DtwX-I6T.js";import"./product-controls-DefmGwRs.js";import"./input-BQFgluN1.js";import"./index-N7Nfcwyv.js";import"./ContextIsolator-9GaOU_7w.js";import"./SearchOutlined-BqroMpgS.js";import"./textarea-CvYfK1Ma.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./useId-CzaMCTks.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";import"./KeyCode-HJ8jGXz0.js";import"./index-DBUEnVox.js";import"./useZIndex-Dli3NBiq.js";import"./colors-CcXoeZ0i.js";function y(e){return`'${e.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`}const P=`{
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
