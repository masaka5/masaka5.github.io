import{j as r}from"./toolbox-BAFlSbAu.js";import{u}from"./use-view-state-Buv1JcBh.js";import{T as C}from"./text-tool-DJbu6FIk.js";import{F as d}from"./panel-Bqi8iGiy.js";import{S as y}from"./switch-D_tqQ3u1.js";import{S as P}from"./slider-ZWvxkMkE.js";import"./product-controls-B1-Khcjt.js";import"./input-z_zqgJn8.js";import"./index-CLt5N8Xt.js";import"./ContextIsolator-DC_hgRVI.js";import"./SearchOutlined-avAJ2sSo.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./useId-CQJPC48K.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";import"./KeyCode-HJ8jGXz0.js";import"./index-CrsyJUrn.js";import"./useZIndex-w_p6zKCP.js";import"./colors-BySKpXQA.js";function g(o){return`'${o.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`}const T=`{
  "name": "Ada",
  "active": true,
  "score": 9.5,
  "roles": ["admin", "dev"],
  "meta": { "tier": 2, "note": null }
}`;function nt(){const[o,b]=u("tools/convert/json-to-php-array/ui.tsx:shortSyntax",!0),[e,w]=u("tools/convert/json-to-php-array/ui.tsx:indentSize",4),[p,N]=u("tools/convert/json-to-php-array/ui.tsx:returnStmt",!1);return r.jsx(C,{deps:[o,e,p],transform:n=>{if(!n.trim())return"";let f;try{f=JSON.parse(n)}catch(t){throw new Error(t instanceof Error?t.message:"无效的 JSON")}const i=o?"[":"array(",s=o?"]":")",h=" ".repeat(Math.max(0,e)),a=(t,m)=>{if(t==null)return"null";if(typeof t=="boolean")return t?"true":"false";if(typeof t=="number")return Number.isFinite(t)?String(t):"null";if(typeof t=="string")return g(t);const S=h.repeat(m+1),$=h.repeat(m);if(Array.isArray(t)){if(t.length===0)return`${i}${s}`;const c=t.map(l=>`${S}${a(l,m+1)},`);return`${i}
${c.join(`
`)}
${$}${s}`}const j=Object.entries(t);if(j.length===0)return`${i}${s}`;const A=j.map(([c,l])=>`${S}${g(c)} => ${a(l,m+1)},`);return`${i}
${A.join(`
`)}
${$}${s}`},x=a(f,0);return p?`return ${x};`:x},inputLabel:"JSON",outputLabel:"PHP数组",sample:T,downloadName:"data.php",options:r.jsxs(r.Fragment,{children:[r.jsx(d,{label:"短[]语法",children:r.jsx(y,{checked:o,onCheckedChange:b})}),r.jsx(d,{label:`Indent: ${e}`,className:"min-w-[180px]",children:r.jsx(P,{value:[e],min:2,max:8,step:1,onValueChange:n=>w(n[0]??4)})}),r.jsx(d,{label:"返回……；",children:r.jsx(y,{checked:p,onCheckedChange:N})})]})})}export{nt as default};
