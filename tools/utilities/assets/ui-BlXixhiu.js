import{r as j,j as t}from"./toolbox-C1bqIItI.js";import{T as N}from"./text-tool-DKzwReiD.js";import{F as g}from"./panel-BS_kjOg7.js";import{T,a as y,b as S}from"./tabs-BR_HzUSj.js";import{I as L}from"./input-BQFgluN1.js";import{S as M,a as V,b as k,c as I,d as $}from"./select-CybKzMZs.js";import"./product-controls-DefmGwRs.js";import"./textarea-CvYfK1Ma.js";import"./index-N7Nfcwyv.js";import"./ContextIsolator-9GaOU_7w.js";import"./SearchOutlined-BqroMpgS.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./useId-CzaMCTks.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";import"./CloseOutlined-BO7eRoZi.js";import"./index-DBUEnVox.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-D4e4PvxS.js";import"./useLocale-DuzSycax.js";import"./useZIndex-Dli3NBiq.js";const C=`:root {
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
}`;function A(a){return a.replace(/\/\*[\s\S]*?\*\//g,"")}function F(a){const x=A(a),l=[];let v=0;const i=/([^{}]*)\{([^{}]*)\}/g;let h;const r=/(--[\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/g;for(;(h=i.exec(x))!==null;){const m=(h[1]??"").trim().replace(/\s+/g," ")||"(unknown)",c=h[2]??"";let n;for(r.lastIndex=0;(n=r.exec(c))!==null;){const o=n[1],u=n[2];o===void 0||u===void 0||l.push({name:o,value:u.trim(),scope:m,order:v++})}}const f=x.replace(i,"");r.lastIndex=0;let p;for(;(p=r.exec(f))!==null;){const m=p[1],c=p[2];m===void 0||c===void 0||l.push({name:m,value:c.trim(),scope:"(top-level)",order:v++})}return l}function ue(){const[a,x]=j.useState("table"),[l,v]=j.useState("name"),[i,h]=j.useState("");return t.jsx(N,{deps:[a,l,i],transform:r=>{if(!r.trim())return"";const f=F(r);if(f.length===0)throw new Error("未找到 CSS 自定义属性（--名称：值）。");const p=i.trim().toLowerCase(),m=p?f.filter(e=>e.name.toLowerCase().includes(p)):f,c=new Map,n=new Map;for(const e of m)n.set(e.name,(n.get(e.name)??0)+1),c.set(e.name,e);let o=[...c.values()];if(o.length===0)return`No variables match filter "${i.trim()}".`;if(l==="name"?o=o.sort((e,s)=>e.name.localeCompare(s.name)):o=o.sort((e,s)=>e.order-s.order),a==="json"){const e={};for(const s of o)e[s.name]=s.value;return JSON.stringify(e,null,2)}if(a==="root")return`:root {
${o.map(s=>`  ${s.name}: ${s.value};`).join(`
`)}
}`;const u=Math.max(...o.map(e=>e.name.length),4),b=Math.max(...o.map(e=>e.value.length),5),d=[];d.push(`${"NAME".padEnd(u)}  ${"VALUE".padEnd(b)}  SCOPE`),d.push("-".repeat(u+b+12));for(const e of o){const s=n.get(e.name)??1,E=s>1?` (×${s})`:"";d.push(`${e.name.padEnd(u)}  ${e.value.padEnd(b)}  ${e.scope}${E}`)}const w=[...n.entries()].filter(([,e])=>e>1).length;return d.push(""),d.push(`${o.length} unique variable(s)${w?`, ${w} with duplicate definitions`:""}.`),d.join(`
`)},inputLabel:"CSS",outputLabel:"提取的变量",inputPlaceholder:C,sample:C,downloadName:a==="json"?"variables.json":a==="root"?"variables.css":"variables.txt",downloadMime:a==="json"?"application/json":"text/plain",options:t.jsxs(t.Fragment,{children:[t.jsx(g,{label:"输出",children:t.jsx(T,{value:a,onValueChange:r=>x(r),children:t.jsxs(y,{children:[t.jsx(S,{value:"table",children:"表"}),t.jsx(S,{value:"root",children:"：根"}),t.jsx(S,{value:"json",children:"JSON"})]})})}),t.jsx(g,{label:"排序依据",children:t.jsxs(M,{value:l,onValueChange:r=>v(r),children:[t.jsx(V,{className:"w-36",children:t.jsx(k,{})}),t.jsxs(I,{children:[t.jsx($,{value:"name",children:"姓名（A→Z）"}),t.jsx($,{value:"source",children:"来源顺序"})]})]})}),t.jsx(g,{label:"按名称过滤",children:t.jsx(L,{value:i,onChange:r=>h(r.target.value),placeholder:"例如颜色",className:"w-40",spellCheck:!1})})]})})}export{ue as default};
