import{r as e,j as i}from"./toolbox-V8Mb6zl3.js";import{T as n}from"./text-tool-BNJ1nLL1.js";import"./button-yaYS2cEr.js";import"./panel-BVEEuXxF.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";function p(t){if(!t)return"";if(typeof document>"u")return t;const r=new DOMParser().parseFromString(t,"text/html");return r.querySelectorAll("br").forEach(o=>o.replaceWith(`
`)),r.querySelectorAll("p, div, li, tr, h1, h2, h3, h4, h5, h6").forEach(o=>{o.append(`
`)}),(r.body.textContent??"").replace(/\n{3,}/g,`

`).replace(/[ \t]+\n/g,`
`).trim()}function j(){const t=e.useCallback(r=>p(r),[]);return i.jsx(n,{transform:t,inputLabel:"HTML",outputLabel:"文本",sample:`<h1>Title</h1>
<p>Hello <b>world</b> &amp; friends.</p>
<ul><li>One</li><li>Two</li></ul>`,downloadName:"text.txt"})}export{j as default};
