import{r as a,j as i}from"./toolbox-C1bqIItI.js";import{T as l,a as c,b as m}from"./tabs-BR_HzUSj.js";import{F as f}from"./panel-BS_kjOg7.js";import{T as u}from"./text-tool-DKzwReiD.js";import"./CloseOutlined-BO7eRoZi.js";import"./ContextIsolator-9GaOU_7w.js";import"./index-DBUEnVox.js";import"./useId-CzaMCTks.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-D4e4PvxS.js";import"./product-controls-DefmGwRs.js";import"./input-BQFgluN1.js";import"./index-N7Nfcwyv.js";import"./SearchOutlined-BqroMpgS.js";import"./textarea-CvYfK1Ma.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";function p(t){return t.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\s+/g," ").replace(/\s*([{}:;,>~+])\s*/g,"$1").replace(/;}/g,"}").trim()}function d(t){const o=p(t);let e="",r=0;for(let n=0;n<o.length;n++){const s=o[n];s==="{"?e+=` {
`+"  ".repeat(++r):s==="}"?(r=Math.max(0,r-1),e=e.replace(/\s+$/,"")+`
`+"  ".repeat(r)+`}
`+"  ".repeat(r)):s===";"?e+=`;
`+"  ".repeat(r):e+=s}return e.replace(/\n\s*\n/g,`
`).replace(/[ \t]+\n/g,`
`).trim()+`
`}function I(){const[t,o]=a.useState("minify"),e=a.useCallback(r=>r.trim()?t==="minify"?p(r):d(r):"",[t]);return i.jsx(u,{transform:e,deps:[t],inputLabel:"CSS",outputLabel:t==="minify"?"缩小化":"美化",sample:`.btn {
  color: red;
  padding: 4px 8px;
}
.btn:hover { color: darkred; }`,downloadName:"styles.css",downloadMime:"text/css",options:i.jsx(f,{label:"模式",children:i.jsx(l,{value:t,onValueChange:r=>o(r),children:i.jsxs(c,{children:[i.jsx(m,{value:"minify",children:"缩小"}),i.jsx(m,{value:"beautify",children:"美化"})]})})})})}export{I as default};
