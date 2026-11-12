import{r as a,j as i}from"./toolbox-CmtkVXqR.js";import{T as l,a as c,b as m}from"./tabs-CgjPmVkM.js";import{F as f}from"./panel-DmElCoWv.js";import{T as u}from"./text-tool-DEvyHdcP.js";import"./CloseOutlined-BbHBxdIs.js";import"./ContextIsolator-g3C8c1gr.js";import"./index-BOQNaMUu.js";import"./useId-Chs6QaAi.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-ad_kj95Y.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";function p(t){return t.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\s+/g," ").replace(/\s*([{}:;,>~+])\s*/g,"$1").replace(/;}/g,"}").trim()}function d(t){const o=p(t);let e="",r=0;for(let n=0;n<o.length;n++){const s=o[n];s==="{"?e+=` {
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
