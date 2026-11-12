import{u as p,r as l,j as i}from"./toolbox-X2JQkZJS.js";import{T as c,a as f,b as a}from"./tabs-XdEyTQ47.js";import{F as u}from"./panel-Bb9jn6HH.js";import{T as d}from"./text-tool-CVfCwMif.js";import"./CloseOutlined-CadKeUxe.js";import"./ContextIsolator-YulytHJS.js";import"./index-xU3b9Pvt.js";import"./useId-Cj6lUCMN.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-gxE4pru3.js";import"./product-controls-DKzw6tMZ.js";import"./input-Cj95RvLc.js";import"./index-pWcJ1Cs1.js";import"./SearchOutlined-CdtN4l1l.js";import"./textarea-oe737Ggj.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";function m(t){return t.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\s+/g," ").replace(/\s*([{}:;,>~+])\s*/g,"$1").replace(/;}/g,"}").trim()}function x(t){const o=m(t);let r="",e=0;for(let n=0;n<o.length;n++){const s=o[n];s==="{"?r+=` {
`+"  ".repeat(++e):s==="}"?(e=Math.max(0,e-1),r=r.replace(/\s+$/,"")+`
`+"  ".repeat(e)+`}
`+"  ".repeat(e)):s===";"?r+=`;
`+"  ".repeat(e):r+=s}return r.replace(/\n\s*\n/g,`
`).replace(/[ \t]+\n/g,`
`).trim()+`
`}function J(){const[t,o]=p("tools/web/css-minify/ui.tsx:mode","minify",["minify","beautify"]),r=l.useCallback(e=>e.trim()?t==="minify"?m(e):x(e):"",[t]);return i.jsx(d,{transform:r,deps:[t],inputLabel:"CSS",outputLabel:t==="minify"?"缩小化":"美化",sample:`.btn {
  color: red;
  padding: 4px 8px;
}
.btn:hover { color: darkred; }`,downloadName:"styles.css",downloadMime:"text/css",options:i.jsx(u,{label:"模式",children:i.jsx(c,{value:t,onValueChange:e=>o(e),children:i.jsxs(f,{children:[i.jsx(a,{value:"minify",children:"缩小"}),i.jsx(a,{value:"beautify",children:"美化"})]})})})})}export{J as default};
