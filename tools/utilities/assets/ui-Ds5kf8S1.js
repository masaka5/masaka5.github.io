import{r as e,j as i}from"./toolbox-UanOk967.js";import{T as n}from"./text-tool-Ce2pfWJ7.js";import"./button-UgOWl7Pw.js";import"./panel-Dz7kmini.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";function p(t){if(!t)return"";if(typeof document>"u")return t;const r=new DOMParser().parseFromString(t,"text/html");return r.querySelectorAll("br").forEach(o=>o.replaceWith(`
`)),r.querySelectorAll("p, div, li, tr, h1, h2, h3, h4, h5, h6").forEach(o=>{o.append(`
`)}),(r.body.textContent??"").replace(/\n{3,}/g,`

`).replace(/[ \t]+\n/g,`
`).trim()}function j(){const t=e.useCallback(r=>p(r),[]);return i.jsx(n,{transform:t,inputLabel:"HTML",outputLabel:"文本",sample:`<h1>Title</h1>
<p>Hello <b>world</b> &amp; friends.</p>
<ul><li>One</li><li>Two</li></ul>`,downloadName:"text.txt"})}export{j as default};
