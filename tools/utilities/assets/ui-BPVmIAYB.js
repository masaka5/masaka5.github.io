import{u as c,j as s}from"./toolbox-X2JQkZJS.js";import{T as w}from"./text-tool-CVfCwMif.js";import{F as l}from"./panel-Bb9jn6HH.js";import{S as d}from"./switch-eAQxBvBb.js";import{S as j}from"./slider-BB--NcOB.js";import"./product-controls-DKzw6tMZ.js";import"./input-Cj95RvLc.js";import"./index-pWcJ1Cs1.js";import"./ContextIsolator-YulytHJS.js";import"./SearchOutlined-CdtN4l1l.js";import"./textarea-oe737Ggj.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./useId-Cj6lUCMN.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";import"./KeyCode-HJ8jGXz0.js";import"./index-xU3b9Pvt.js";import"./useZIndex-C91e3V47.js";import"./colors-4LexHp4k.js";const u=new TextEncoder,b=`<?xml version="1.0" encoding="UTF-8"?>
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
`).trim():(e=e.replace(/>\s+</g,"><"),e=e.replace(/\s{2,}/g," "),e=e.replace(/\s+\/>/g,"/>"),e=e.replace(/\s+>/g,">"),e=e.trim()),e}function ee(){const[i,r]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:precision",2),[e,n]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:roundNumbers",!0),[t,g]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:keepIds",!1),[o,f]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:keepViewBox",!0),[m,v]=c("tools/image/image-svg-optimizer-cleaner/ui.tsx:pretty",!1);return s.jsx(w,{deps:[i,e,t,o,m],transform:a=>{if(!a.trim())return"";if(!/<svg[\s>]/i.test(a))throw new Error("输入看起来不像 SVG 标记（未找到 <svg> 标记）。");const x=N(a,{precision:i,roundNumbers:e,keepIds:t,keepViewBox:o,pretty:m}),p=u.encode(a).length,h=u.encode(x).length,k=p>0?Math.round((p-h)/p*100):0;return`${`/* ${p.toLocaleString()} → ${h.toLocaleString()} bytes · ${k}% smaller */`}
${x}`},inputLabel:"SVG源",outputLabel:"已清理的 SVG",sample:b,accept:"image/svg+xml,.svg,text/*",downloadName:"cleaned.svg",downloadMime:"image/svg+xml",options:s.jsxs(s.Fragment,{children:[s.jsx(l,{label:"输出",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(d,{checked:m,onCheckedChange:v}),s.jsx("span",{className:"text-sm text-muted-foreground",children:m?"漂亮":"缩小化"})]})}),s.jsx(l,{label:"整数",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(d,{checked:e,onCheckedChange:n}),s.jsx("span",{className:"text-sm text-muted-foreground",children:e?"开":"关闭"})]})}),s.jsx(l,{label:`Precision: ${i}`,className:"min-w-[160px]",children:s.jsx(j,{min:0,max:6,step:1,value:[i],onValueChange:a=>r(a[0]??2)})}),s.jsx(l,{label:"保留 ID",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(d,{checked:t,onCheckedChange:g}),s.jsx("span",{className:"text-sm text-muted-foreground",children:t?"保留":"删除"})]})}),s.jsx(l,{label:"保留viewBox",children:s.jsxs("div",{className:"flex h-9 items-center gap-2",children:[s.jsx(d,{checked:o,onCheckedChange:f}),s.jsx("span",{className:"text-sm text-muted-foreground",children:o?"保留":"删除"})]})})]})})}export{ee as default};
