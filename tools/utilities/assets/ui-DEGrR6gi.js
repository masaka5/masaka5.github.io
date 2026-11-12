import{j as r}from"./toolbox-BAFlSbAu.js";import{u as p}from"./use-view-state-Buv1JcBh.js";import{T as N}from"./text-tool-DJbu6FIk.js";import{F as c}from"./panel-Bqi8iGiy.js";import{S as b}from"./switch-D_tqQ3u1.js";import{S as w}from"./slider-ZWvxkMkE.js";import"./product-controls-B1-Khcjt.js";import"./input-z_zqgJn8.js";import"./index-CLt5N8Xt.js";import"./ContextIsolator-DC_hgRVI.js";import"./SearchOutlined-avAJ2sSo.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./useId-CQJPC48K.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";import"./KeyCode-HJ8jGXz0.js";import"./index-CrsyJUrn.js";import"./useZIndex-w_p6zKCP.js";import"./colors-BySKpXQA.js";function j(e){return`"${e.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\t/g,"\\t")}"`}const A=/^[A-Za-z_][A-Za-z0-9_]*$/,T=`{
  "name": "Ada",
  "active": true,
  "score": 9.5,
  "tags": ["admin", "dev"],
  "meta": { "tier": 2, "note": null, "1invalid": "x" }
}`;function ot(){const[e,y]=p("tools/convert/json-to-ruby-hash/ui.tsx:symbolKeys",!0),[s,S]=p("tools/convert/json-to-ruby-hash/ui.tsx:shorthand",!0),[o,g]=p("tools/convert/json-to-ruby-hash/ui.tsx:indentSize",2);return r.jsx(N,{deps:[e,s,o],transform:n=>{if(!n.trim())return"";let l;try{l=JSON.parse(n)}catch(t){throw new Error(t instanceof Error?t.message:"无效的 JSON")}const u=" ".repeat(Math.max(0,o)),$=t=>e&&A.test(t)?s?`${t}: `:`:${t} => `:`${j(t)} => `,m=(t,i)=>{if(t==null)return"nil";if(typeof t=="boolean")return t?"true":"false";if(typeof t=="number")return Number.isFinite(t)?String(t):"nil";if(typeof t=="string")return j(t);const d=u.repeat(i+1),h=u.repeat(i);if(Array.isArray(t))return t.length===0?"[]":`[
${t.map(a=>`${d}${m(a,i+1)},`).join(`
`)}
${h}]`;const f=Object.entries(t);return f.length===0?"{}":`{
${f.map(([x,a])=>`${d}${$(x)}${m(a,i+1)},`).join(`
`)}
${h}}`};return m(l,0)},inputLabel:"JSON",outputLabel:"红宝石哈希",sample:T,downloadName:"data.rb",options:r.jsxs(r.Fragment,{children:[r.jsx(c,{label:"符号键",children:r.jsx(b,{checked:e,onCheckedChange:y})}),r.jsx(c,{label:"1.9简写（重点：）",children:r.jsx(b,{checked:s,onCheckedChange:S})}),r.jsx(c,{label:`Indent: ${o}`,className:"min-w-[180px]",children:r.jsx(w,{value:[o],min:2,max:8,step:1,onValueChange:n=>g(n[0]??2)})})]})})}export{ot as default};
