import{u as p,j as r}from"./toolbox-X2JQkZJS.js";import{T as N}from"./text-tool-CVfCwMif.js";import{F as c}from"./panel-Bb9jn6HH.js";import{S as b}from"./switch-eAQxBvBb.js";import{S as w}from"./slider-BB--NcOB.js";import"./product-controls-DKzw6tMZ.js";import"./input-Cj95RvLc.js";import"./index-pWcJ1Cs1.js";import"./ContextIsolator-YulytHJS.js";import"./SearchOutlined-CdtN4l1l.js";import"./textarea-oe737Ggj.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./useId-Cj6lUCMN.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";import"./KeyCode-HJ8jGXz0.js";import"./index-xU3b9Pvt.js";import"./useZIndex-C91e3V47.js";import"./colors-4LexHp4k.js";function j(e){return`"${e.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\t/g,"\\t")}"`}const A=/^[A-Za-z_][A-Za-z0-9_]*$/,T=`{
  "name": "Ada",
  "active": true,
  "score": 9.5,
  "tags": ["admin", "dev"],
  "meta": { "tier": 2, "note": null, "1invalid": "x" }
}`;function et(){const[e,y]=p("tools/convert/json-to-ruby-hash/ui.tsx:symbolKeys",!0),[s,S]=p("tools/convert/json-to-ruby-hash/ui.tsx:shorthand",!0),[n,g]=p("tools/convert/json-to-ruby-hash/ui.tsx:indentSize",2);return r.jsx(N,{deps:[e,s,n],transform:o=>{if(!o.trim())return"";let l;try{l=JSON.parse(o)}catch(t){throw new Error(t instanceof Error?t.message:"无效的 JSON")}const u=" ".repeat(Math.max(0,n)),$=t=>e&&A.test(t)?s?`${t}: `:`:${t} => `:`${j(t)} => `,m=(t,i)=>{if(t==null)return"nil";if(typeof t=="boolean")return t?"true":"false";if(typeof t=="number")return Number.isFinite(t)?String(t):"nil";if(typeof t=="string")return j(t);const d=u.repeat(i+1),h=u.repeat(i);if(Array.isArray(t))return t.length===0?"[]":`[
${t.map(a=>`${d}${m(a,i+1)},`).join(`
`)}
${h}]`;const f=Object.entries(t);return f.length===0?"{}":`{
${f.map(([x,a])=>`${d}${$(x)}${m(a,i+1)},`).join(`
`)}
${h}}`};return m(l,0)},inputLabel:"JSON",outputLabel:"红宝石哈希",sample:T,downloadName:"data.rb",options:r.jsxs(r.Fragment,{children:[r.jsx(c,{label:"符号键",children:r.jsx(b,{checked:e,onCheckedChange:y})}),r.jsx(c,{label:"1.9简写（重点：）",children:r.jsx(b,{checked:s,onCheckedChange:S})}),r.jsx(c,{label:`Indent: ${n}`,className:"min-w-[180px]",children:r.jsx(w,{value:[n],min:2,max:8,step:1,onValueChange:o=>g(o[0]??2)})})]})})}export{et as default};
