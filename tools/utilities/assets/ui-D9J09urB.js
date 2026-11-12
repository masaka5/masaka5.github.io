import{r as e,j as i}from"./toolbox-BAFlSbAu.js";import{T as p}from"./text-tool-DJbu6FIk.js";import"./use-view-state-Buv1JcBh.js";import"./product-controls-B1-Khcjt.js";import"./input-z_zqgJn8.js";import"./index-CLt5N8Xt.js";import"./ContextIsolator-DC_hgRVI.js";import"./panel-Bqi8iGiy.js";import"./SearchOutlined-avAJ2sSo.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./useId-CQJPC48K.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";function m(t){if(!t)return"";if(typeof document>"u")return t;const r=new DOMParser().parseFromString(t,"text/html");return r.querySelectorAll("br").forEach(o=>o.replaceWith(`
`)),r.querySelectorAll("p, div, li, tr, h1, h2, h3, h4, h5, h6").forEach(o=>{o.append(`
`)}),(r.body.textContent??"").replace(/\n{3,}/g,`

`).replace(/[ \t]+\n/g,`
`).trim()}function O(){const t=e.useCallback(r=>m(r),[]);return i.jsx(p,{transform:t,inputLabel:"HTML",outputLabel:"文本",sample:`<h1>Title</h1>
<p>Hello <b>world</b> &amp; friends.</p>
<ul><li>One</li><li>Two</li></ul>`,downloadName:"text.txt"})}export{O as default};
