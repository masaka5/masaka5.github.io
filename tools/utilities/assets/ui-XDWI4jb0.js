import{r as c,j as s}from"./toolbox-V8Mb6zl3.js";import{T as w}from"./text-tool-BNJ1nLL1.js";import{F as d}from"./panel-BVEEuXxF.js";import{S as m}from"./switch-Cd7u-X1w.js";import{S as j}from"./slider-CJpjz3zP.js";import"./button-yaYS2cEr.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";import"./index-B5fXPDQ_.js";import"./index-D17hSi50.js";import"./index-DWeD1Tma.js";const u=new TextEncoder,S=`<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with an editor -->
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.0.dtd"
   xmlns="http://www.w3.org/2000/svg"
   width="100"
   height="100"
   viewBox="0 0 100 100"
   version="1.1"
   id="svg1"
   inkscape:version="1.0">
  <metadata id="metadata1">
    <rdf:RDF></rdf:RDF>
  </metadata>
  <sodipodi:namedview id="view1" inkscape:zoom="2" />
  <g id="layer1" inkscape:label="Layer 1">
    <path
       d="M 12.34567,20.98765 C 30.000000,40.5 60.111111,10.222222 88,50.7654321"
       fill="#ff0000"
       stroke="none"
       stroke-width="1" />
    <g id="empty"></g>
  </g>
</svg>`;function b(r,i){const e=Number(r);return Number.isFinite(e)?e.toFixed(i).replace(/\.?0+$/,"")||"0":r}function N(r,i){let e=r;e=e.replace(/<\?xml[\s\S]*?\?>/g,""),e=e.replace(/<!DOCTYPE[\s\S]*?>/g,""),e=e.replace(/<!--[\s\S]*?-->/g,""),e=e.replace(/<metadata\b[\s\S]*?<\/metadata>/g,""),e=e.replace(/<sodipodi:[a-zA-Z-]+\b[^>]*?(?:\/>|>[\s\S]*?<\/sodipodi:[a-zA-Z-]+>)/g,""),e=e.replace(/<inkscape:[a-zA-Z-]+\b[^>]*?(?:\/>|>[\s\S]*?<\/inkscape:[a-zA-Z-]+>)/g,""),e=e.replace(/\s+xmlns:(?:inkscape|sodipodi|dc|cc|rdf)="[^"]*"/g,""),e=e.replace(/\s+(?:inkscape|sodipodi):[a-zA-Z-]+="[^"]*"/g,""),e=e.replace(/\s+version="[^"]*"/g,""),e=e.replace(/\s+stroke="none"/g,""),e=e.replace(/\s+(?:stroke-width|opacity|fill-opacity|stroke-opacity)="1(?:\.0+)?"/g,""),i.keepIds||(e=e.replace(/\s+id="[^"]*"/g,"")),i.keepViewBox||(e=e.replace(/\s+viewBox="[^"]*"/g,"")),i.roundNumbers&&(e=e.replace(/-?\d+\.\d+/g,t=>b(t,i.precision)));let n="";for(;n!==e;)n=e,e=e.replace(/<g\s*>\s*<\/g>/g,""),e=e.replace(/<g\s+([^>]*?)>\s*<\/g>/g,"");return i.pretty?e=e.split(`
`).map(t=>t.replace(/\s+$/,"")).filter((t,g,a)=>!(t.trim()===""&&(a[g-1]?.trim()??"")==="")).join(`
`).trim():(e=e.replace(/>\s+</g,"><"),e=e.replace(/\s{2,}/g," "),e=e.replace(/\s+\/>/g,"/>"),e=e.replace(/\s+>/g,">"),e=e.trim()),e}function q(){const[r,i]=c.useState(2),[e,n]=c.useState(!0),[t,g]=c.useState(!1),[a,f]=c.useState(!0),[l,v]=c.useState(!1);return s.jsx(w,{deps:[r,e,t,a,l],transform:o=>{if(!o.trim())return"";if(!/<svg[\s>]/i.test(o))throw new Error("输入看起来不像 SVG 标记（未找到 <svg> 标记）。");const x=N(o,{precision:r,roundNumbers:e,keepIds:t,keepViewBox:a,pretty:l}),p=u.encode(o).length,h=u.encode(x).length,k=p>0?Math.round((p-h)/p*100):0;return`${`/* ${p.toLocaleString()} → ${h.toLocaleString()} bytes · ${k}% smaller */`}
${x}`},inputLabel:"SVG源",outputLabel:"已清理的 SVG",sample:S,accept:"image/svg+xml,.svg,text/*",downloadName:"cleaned.svg",downloadMime:"image/svg+xml",options:s.jsxs(s.Fragment,{children:[s.jsx(d,{label:"输出",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(m,{checked:l,onCheckedChange:v}),s.jsx("span",{className:"text-sm text-muted-foreground",children:l?"漂亮":"缩小化"})]})}),s.jsx(d,{label:"整数",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(m,{checked:e,onCheckedChange:n}),s.jsx("span",{className:"text-sm text-muted-foreground",children:e?"开":"关闭"})]})}),s.jsx(d,{label:`Precision: ${r}`,className:"min-w-[160px]",children:s.jsx(j,{min:0,max:6,step:1,value:[r],onValueChange:o=>i(o[0]??2)})}),s.jsx(d,{label:"保留 ID",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(m,{checked:t,onCheckedChange:g}),s.jsx("span",{className:"text-sm text-muted-foreground",children:t?"保留":"删除"})]})}),s.jsx(d,{label:"保留viewBox",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(m,{checked:a,onCheckedChange:f}),s.jsx("span",{className:"text-sm text-muted-foreground",children:a?"保留":"删除"})]})})]})})}export{q as default};
