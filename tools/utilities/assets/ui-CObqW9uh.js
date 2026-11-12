import{u,j as r}from"./toolbox-X2JQkZJS.js";import{T as C}from"./text-tool-CVfCwMif.js";import{F as d}from"./panel-Bb9jn6HH.js";import{S as y}from"./switch-eAQxBvBb.js";import{S as P}from"./slider-BB--NcOB.js";import"./product-controls-DKzw6tMZ.js";import"./input-Cj95RvLc.js";import"./index-pWcJ1Cs1.js";import"./ContextIsolator-YulytHJS.js";import"./SearchOutlined-CdtN4l1l.js";import"./textarea-oe737Ggj.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./useId-Cj6lUCMN.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";import"./KeyCode-HJ8jGXz0.js";import"./index-xU3b9Pvt.js";import"./useZIndex-C91e3V47.js";import"./colors-4LexHp4k.js";function g(o){return`'${o.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`}const T=`{
  "name": "Ada",
  "active": true,
  "score": 9.5,
  "roles": ["admin", "dev"],
  "meta": { "tier": 2, "note": null }
}`;function et(){const[o,b]=u("tools/convert/json-to-php-array/ui.tsx:shortSyntax",!0),[e,w]=u("tools/convert/json-to-php-array/ui.tsx:indentSize",4),[m,N]=u("tools/convert/json-to-php-array/ui.tsx:returnStmt",!1);return r.jsx(C,{deps:[o,e,m],transform:n=>{if(!n.trim())return"";let f;try{f=JSON.parse(n)}catch(t){throw new Error(t instanceof Error?t.message:"无效的 JSON")}const i=o?"[":"array(",s=o?"]":")",h=" ".repeat(Math.max(0,e)),p=(t,a)=>{if(t==null)return"null";if(typeof t=="boolean")return t?"true":"false";if(typeof t=="number")return Number.isFinite(t)?String(t):"null";if(typeof t=="string")return g(t);const S=h.repeat(a+1),$=h.repeat(a);if(Array.isArray(t)){if(t.length===0)return`${i}${s}`;const c=t.map(l=>`${S}${p(l,a+1)},`);return`${i}
${c.join(`
`)}
${$}${s}`}const j=Object.entries(t);if(j.length===0)return`${i}${s}`;const A=j.map(([c,l])=>`${S}${g(c)} => ${p(l,a+1)},`);return`${i}
${A.join(`
`)}
${$}${s}`},x=p(f,0);return m?`return ${x};`:x},inputLabel:"JSON",outputLabel:"PHP数组",sample:T,downloadName:"data.php",options:r.jsxs(r.Fragment,{children:[r.jsx(d,{label:"短[]语法",children:r.jsx(y,{checked:o,onCheckedChange:b})}),r.jsx(d,{label:`Indent: ${e}`,className:"min-w-[180px]",children:r.jsx(P,{value:[e],min:2,max:8,step:1,onValueChange:n=>w(n[0]??4)})}),r.jsx(d,{label:"返回……；",children:r.jsx(y,{checked:m,onCheckedChange:N})})]})})}export{et as default};
