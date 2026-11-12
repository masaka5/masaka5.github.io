import{r as N,u as S,j as t}from"./toolbox-X2JQkZJS.js";import{T}from"./text-tool-CVfCwMif.js";import{F as j}from"./panel-Bb9jn6HH.js";import{T as y,a as L,b as g}from"./tabs-XdEyTQ47.js";import{I as M}from"./input-Cj95RvLc.js";import{S as V,a as k,b as I,c as A,d as $}from"./select-DBuFm9ly.js";import"./product-controls-DKzw6tMZ.js";import"./textarea-oe737Ggj.js";import"./index-pWcJ1Cs1.js";import"./ContextIsolator-YulytHJS.js";import"./SearchOutlined-CdtN4l1l.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./useId-Cj6lUCMN.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";import"./CloseOutlined-CadKeUxe.js";import"./index-xU3b9Pvt.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-gxE4pru3.js";import"./useLocale-JYelGi5A.js";import"./useZIndex-C91e3V47.js";const C=`:root {
  --color-primary: #3b82f6;
  --color-bg: #ffffff;
  --space-sm: 8px;
  --space-md: 16px; /* base spacing */
}

/* dark theme overrides */
.theme-dark {
  --color-bg: #0f172a;
  --color-primary: #60a5fa;
}

.button {
  --space-sm: 6px;
  padding: var(--space-sm) var(--space-md);
}`;function F(a){return a.replace(/\/\*[\s\S]*?\*\//g,"")}function O(a){const x=F(a),l=[];let b=0;const i=/([^{}]*)\{([^{}]*)\}/g;let f;const r=/(--[\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/g;for(;(f=i.exec(x))!==null;){const m=(f[1]??"").trim().replace(/\s+/g," ")||"(unknown)",c=f[2]??"";let n;for(r.lastIndex=0;(n=r.exec(c))!==null;){const o=n[1],u=n[2];o===void 0||u===void 0||l.push({name:o,value:u.trim(),scope:m,order:b++})}}const h=x.replace(i,"");r.lastIndex=0;let p;for(;(p=r.exec(h))!==null;){const m=p[1],c=p[2];m===void 0||c===void 0||l.push({name:m,value:c.trim(),scope:"(top-level)",order:b++})}return l}function de(){const[a,x]=N.useState("table"),[l,b]=S("tools/web/web-css-variable-extractor/ui.tsx:sort","name",["name","source"]),[i,f]=S("tools/web/web-css-variable-extractor/ui.tsx:filter","");return t.jsx(T,{deps:[a,l,i],transform:r=>{if(!r.trim())return"";const h=O(r);if(h.length===0)throw new Error("未找到 CSS 自定义属性（--名称：值）。");const p=i.trim().toLowerCase(),m=p?h.filter(e=>e.name.toLowerCase().includes(p)):h,c=new Map,n=new Map;for(const e of m)n.set(e.name,(n.get(e.name)??0)+1),c.set(e.name,e);let o=[...c.values()];if(o.length===0)return`No variables match filter "${i.trim()}".`;if(l==="name"?o=o.sort((e,s)=>e.name.localeCompare(s.name)):o=o.sort((e,s)=>e.order-s.order),a==="json"){const e={};for(const s of o)e[s.name]=s.value;return JSON.stringify(e,null,2)}if(a==="root")return`:root {
${o.map(s=>`  ${s.name}: ${s.value};`).join(`
`)}
}`;const u=Math.max(...o.map(e=>e.name.length),4),v=Math.max(...o.map(e=>e.value.length),5),d=[];d.push(`${"NAME".padEnd(u)}  ${"VALUE".padEnd(v)}  SCOPE`),d.push("-".repeat(u+v+12));for(const e of o){const s=n.get(e.name)??1,E=s>1?` (×${s})`:"";d.push(`${e.name.padEnd(u)}  ${e.value.padEnd(v)}  ${e.scope}${E}`)}const w=[...n.entries()].filter(([,e])=>e>1).length;return d.push(""),d.push(`${o.length} unique variable(s)${w?`, ${w} with duplicate definitions`:""}.`),d.join(`
`)},inputLabel:"CSS",outputLabel:"提取的变量",inputPlaceholder:C,sample:C,downloadName:a==="json"?"variables.json":a==="root"?"variables.css":"variables.txt",downloadMime:a==="json"?"application/json":"text/plain",options:t.jsxs(t.Fragment,{children:[t.jsx(j,{label:"输出",children:t.jsx(y,{value:a,onValueChange:r=>x(r),children:t.jsxs(L,{children:[t.jsx(g,{value:"table",children:"表"}),t.jsx(g,{value:"root",children:"：根"}),t.jsx(g,{value:"json",children:"JSON"})]})})}),t.jsx(j,{label:"排序依据",children:t.jsxs(V,{value:l,onValueChange:r=>b(r),children:[t.jsx(k,{className:"w-36",children:t.jsx(I,{})}),t.jsxs(A,{children:[t.jsx($,{value:"name",children:"姓名（A→Z）"}),t.jsx($,{value:"source",children:"来源顺序"})]})]})}),t.jsx(j,{label:"按名称过滤",children:t.jsx(M,{value:i,onChange:r=>f(r.target.value),placeholder:"例如颜色",className:"w-40",spellCheck:!1})})]})})}export{de as default};
