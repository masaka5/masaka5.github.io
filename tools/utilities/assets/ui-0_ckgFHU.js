import{r as e,j as i}from"./toolbox-CmtkVXqR.js";import{T as p}from"./text-tool-DEvyHdcP.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./ContextIsolator-g3C8c1gr.js";import"./panel-DmElCoWv.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";function n(t){if(!t)return"";if(typeof document>"u")return t;const r=new DOMParser().parseFromString(t,"text/html");return r.querySelectorAll("br").forEach(o=>o.replaceWith(`
`)),r.querySelectorAll("p, div, li, tr, h1, h2, h3, h4, h5, h6").forEach(o=>{o.append(`
`)}),(r.body.textContent??"").replace(/\n{3,}/g,`

`).replace(/[ \t]+\n/g,`
`).trim()}function M(){const t=e.useCallback(r=>n(r),[]);return i.jsx(p,{transform:t,inputLabel:"HTML",outputLabel:"文本",sample:`<h1>Title</h1>
<p>Hello <b>world</b> &amp; friends.</p>
<ul><li>One</li><li>Two</li></ul>`,downloadName:"text.txt"})}export{M as default};
