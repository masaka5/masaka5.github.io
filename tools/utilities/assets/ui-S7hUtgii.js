import{j as s}from"./toolbox-BAFlSbAu.js";import{u as c}from"./use-view-state-Buv1JcBh.js";import{T as w}from"./text-tool-DJbu6FIk.js";import{F as l}from"./panel-Bqi8iGiy.js";import{S as d}from"./switch-D_tqQ3u1.js";import{S as j}from"./slider-ZWvxkMkE.js";import"./product-controls-B1-Khcjt.js";import"./input-z_zqgJn8.js";import"./index-CLt5N8Xt.js";import"./ContextIsolator-DC_hgRVI.js";import"./SearchOutlined-avAJ2sSo.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./useId-CQJPC48K.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";import"./KeyCode-HJ8jGXz0.js";import"./index-CrsyJUrn.js";import"./useZIndex-w_p6zKCP.js";import"./colors-BySKpXQA.js";const u=new TextEncoder,b=`<?xml version="1.0" encoding="UTF-8"?>
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
</svg>`;function S(i,r){const e=Number(i);return Number.isFinite(e)?e.toFixed(r).replace(/\.?0+$/,"")||"0":i}function N(i,r){let e=i;e=e.replace(/<\?xml[\s\S]*?\?>/g,""),e=e.replace(/<!DOCTYPE[\s\S]*?>/g,""),e=e.replace(/<!--[\s\S]*?-->/g,""),e=e.replace(/<metadata\b[\s\S]*?<\/metadata>/g,""),e=e.replace(/<sodipodi:[a-zA-Z-]+\b[^>]*?(?:\/>|>[\s\S]*?<\/sodipodi:[a-zA-Z-]+>)/g,""),e=e.replace(/<inkscape:[a-zA-Z-]+\b[^>]*?(?:\/>|>[\s\S]*?<\/inkscape:[a-zA-Z-]+>)/g,""),e=e.replace(/\s+xmlns:(?:inkscape|sodipodi|dc|cc|rdf)="[^"]*"/g,""),e=e.replace(/\s+(?:inkscape|sodipodi):[a-zA-Z-]+="[^"]*"/g,""),e=e.replace(/\s+version="[^"]*"/g,""),e=e.replace(/\s+stroke="none"/g,""),e=e.replace(/\s+(?:stroke-width|opacity|fill-opacity|stroke-opacity)="1(?:\.0+)?"/g,""),r.keepIds||(e=e.replace(/\s+id="[^"]*"/g,"")),r.keepViewBox||(e=e.replace(/\s+viewBox="[^"]*"/g,"")),r.roundNumbers&&(e=e.replace(/-?\d+\.\d+/g,t=>S(t,r.precision)));let n="";for(;n!==e;)n=e,e=e.replace(/<g\s*>\s*<\/g>/g,""),e=e.replace(/<g\s+([^>]*?)>\s*<\/g>/g,"");return r.pretty?e=e.split(`
`).map(t=>t.replace(/\s+$/,"")).filter((t,g,o)=>!(t.trim()===""&&(o[g-1]?.trim()??"")==="")).join(`
`).trim():(e=e.replace(/>\s+</g,"><"),e=e.replace(/\s{2,}/g," "),e=e.replace(/\s+\/>/g,"/>"),e=e.replace(/\s+>/g,">"),e=e.trim()),e}function se(){const[i,r]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:precision",2),[e,n]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:roundNumbers",!0),[t,g]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:keepIds",!1),[o,f]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:keepViewBox",!0),[m,v]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:pretty",!1);return s.jsx(w,{deps:[i,e,t,o,m],transform:a=>{if(!a.trim())return"";if(!/<svg[\s>]/i.test(a))throw new Error("输入看起来不像 SVG 标记（未找到 <svg> 标记）。");const x=N(a,{precision:i,roundNumbers:e,keepIds:t,keepViewBox:o,pretty:m}),p=u.encode(a).length,h=u.encode(x).length,k=p>0?Math.round((p-h)/p*100):0;return`${`/* ${p.toLocaleString()} → ${h.toLocaleString()} bytes · ${k}% smaller */`}
${x}`},inputLabel:"SVG源",outputLabel:"已清理的 SVG",sample:b,accept:"image/svg+xml,.svg,text/*",downloadName:"cleaned.svg",downloadMime:"image/svg+xml",options:s.jsxs(s.Fragment,{children:[s.jsx(l,{label:"输出",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(d,{checked:m,onCheckedChange:v}),s.jsx("span",{className:"text-sm text-muted-foreground",children:m?"漂亮":"缩小化"})]})}),s.jsx(l,{label:"整数",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(d,{checked:e,onCheckedChange:n}),s.jsx("span",{className:"text-sm text-muted-foreground",children:e?"开":"关闭"})]})}),s.jsx(l,{label:`Precision: ${i}`,className:"min-w-[160px]",children:s.jsx(j,{min:0,max:6,step:1,value:[i],onValueChange:a=>r(a[0]??2)})}),s.jsx(l,{label:"保留 ID",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(d,{checked:t,onCheckedChange:g}),s.jsx("span",{className:"text-sm text-muted-foreground",children:t?"保留":"删除"})]})}),s.jsx(l,{label:"保留viewBox",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(d,{checked:o,onCheckedChange:f}),s.jsx("span",{className:"text-sm text-muted-foreground",children:o?"保留":"删除"})]})})]})})}export{se as default};
