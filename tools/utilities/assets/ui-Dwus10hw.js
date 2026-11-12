import{r as p,j as i}from"./toolbox-BAFlSbAu.js";import{u as l}from"./use-view-state-Buv1JcBh.js";import{T as c,a as f,b as m}from"./tabs-4oc-BJj3.js";import{F as u}from"./panel-Bqi8iGiy.js";import{T as d}from"./text-tool-DJbu6FIk.js";import"./CloseOutlined-DTTOE6cy.js";import"./ContextIsolator-DC_hgRVI.js";import"./index-CrsyJUrn.js";import"./useId-CQJPC48K.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-CXeRYAeu.js";import"./product-controls-B1-Khcjt.js";import"./input-z_zqgJn8.js";import"./index-CLt5N8Xt.js";import"./SearchOutlined-avAJ2sSo.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";function a(e){return e.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\s+/g," ").replace(/\s*([{}:;,>~+])\s*/g,"$1").replace(/;}/g,"}").trim()}function x(e){const o=a(e);let r="",t=0;for(let n=0;n<o.length;n++){const s=o[n];s==="{"?r+=` {
`+"  ".repeat(++t):s==="}"?(t=Math.max(0,t-1),r=r.replace(/\s+$/,"")+`
`+"  ".repeat(t)+`}
`+"  ".repeat(t)):s===";"?r+=`;
`+"  ".repeat(t):r+=s}return r.replace(/\n\s*\n/g,`
`).replace(/[ \t]+\n/g,`
`).trim()+`
`}function K(){const[e,o]=l("tools/web/css-minify/ui.tsx:mode","minify"),r=p.useCallback(t=>t.trim()?e==="minify"?a(t):x(t):"",[e]);return i.jsx(d,{transform:r,deps:[e],inputLabel:"CSS",outputLabel:e==="minify"?"缩小化":"美化",sample:`.btn {
  color: red;
  padding: 4px 8px;
}
.btn:hover { color: darkred; }`,downloadName:"styles.css",downloadMime:"text/css",options:i.jsx(u,{label:"模式",children:i.jsx(c,{value:e,onValueChange:t=>o(t),children:i.jsxs(f,{children:[i.jsx(m,{value:"minify",children:"缩小"}),i.jsx(m,{value:"beautify",children:"美化"})]})})})})}export{K as default};
