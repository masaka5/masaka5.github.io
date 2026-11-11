import{r as a,j as i}from"./toolbox-UanOk967.js";import{T as l,a as c,b as m}from"./tabs-DZAAdCmQ.js";import{F as f}from"./panel-Dz7kmini.js";import{T as u}from"./text-tool-Ce2pfWJ7.js";import"./index-HQBJxcTJ.js";import"./index-BSkAzB9Z.js";import"./index-DiK7AOdK.js";import"./index-C-pHolA0.js";import"./index-Bp6S2Opf.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";function p(r){return r.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\s+/g," ").replace(/\s*([{}:;,>~+])\s*/g,"$1").replace(/;}/g,"}").trim()}function d(r){const o=p(r);let t="",e=0;for(let n=0;n<o.length;n++){const s=o[n];s==="{"?t+=` {
`+"  ".repeat(++e):s==="}"?(e=Math.max(0,e-1),t=t.replace(/\s+$/,"")+`
`+"  ".repeat(e)+`}
`+"  ".repeat(e)):s===";"?t+=`;
`+"  ".repeat(e):t+=s}return t.replace(/\n\s*\n/g,`
`).replace(/[ \t]+\n/g,`
`).trim()+`
`}function A(){const[r,o]=a.useState("minify"),t=a.useCallback(e=>e.trim()?r==="minify"?p(e):d(e):"",[r]);return i.jsx(u,{transform:t,deps:[r],inputLabel:"CSS",outputLabel:r==="minify"?"缩小化":"美化",sample:`.btn {
  color: red;
  padding: 4px 8px;
}
.btn:hover { color: darkred; }`,downloadName:"styles.css",downloadMime:"text/css",options:i.jsx(f,{label:"模式",children:i.jsx(l,{value:r,onValueChange:e=>o(e),children:i.jsxs(c,{children:[i.jsx(m,{value:"minify",children:"缩小"}),i.jsx(m,{value:"beautify",children:"美化"})]})})})})}export{A as default};
