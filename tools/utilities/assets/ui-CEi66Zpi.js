import{r as a,j as i}from"./toolbox-V8Mb6zl3.js";import{T as l,a as c,b as m}from"./tabs-DhdYX72L.js";import{F as f}from"./panel-BVEEuXxF.js";import{T as u}from"./text-tool-BNJ1nLL1.js";import"./index-B5fXPDQ_.js";import"./index-CB5QEDM1.js";import"./index-DWeD1Tma.js";import"./index-dzWK0ZpZ.js";import"./index-C-nIdkMn.js";import"./button-yaYS2cEr.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";function p(r){return r.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\s+/g," ").replace(/\s*([{}:;,>~+])\s*/g,"$1").replace(/;}/g,"}").trim()}function d(r){const o=p(r);let t="",e=0;for(let n=0;n<o.length;n++){const s=o[n];s==="{"?t+=` {
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
