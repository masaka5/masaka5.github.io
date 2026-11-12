import{r as e,j as i}from"./toolbox-X2JQkZJS.js";import{T as p}from"./text-tool-CVfCwMif.js";import"./product-controls-DKzw6tMZ.js";import"./input-Cj95RvLc.js";import"./index-pWcJ1Cs1.js";import"./ContextIsolator-YulytHJS.js";import"./panel-Bb9jn6HH.js";import"./SearchOutlined-CdtN4l1l.js";import"./textarea-oe737Ggj.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./useId-Cj6lUCMN.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";function n(t){if(!t)return"";if(typeof document>"u")return t;const r=new DOMParser().parseFromString(t,"text/html");return r.querySelectorAll("br").forEach(o=>o.replaceWith(`
`)),r.querySelectorAll("p, div, li, tr, h1, h2, h3, h4, h5, h6").forEach(o=>{o.append(`
`)}),(r.body.textContent??"").replace(/\n{3,}/g,`

`).replace(/[ \t]+\n/g,`
`).trim()}function M(){const t=e.useCallback(r=>n(r),[]);return i.jsx(p,{transform:t,inputLabel:"HTML",outputLabel:"文本",sample:`<h1>Title</h1>
<p>Hello <b>world</b> &amp; friends.</p>
<ul><li>One</li><li>Two</li></ul>`,downloadName:"text.txt"})}export{M as default};
