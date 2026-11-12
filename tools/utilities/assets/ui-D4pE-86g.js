import{r as s,j as c}from"./toolbox-X2JQkZJS.js";import{T as l}from"./text-tool-CVfCwMif.js";import"./product-controls-DKzw6tMZ.js";import"./input-Cj95RvLc.js";import"./index-pWcJ1Cs1.js";import"./ContextIsolator-YulytHJS.js";import"./panel-Bb9jn6HH.js";import"./SearchOutlined-CdtN4l1l.js";import"./textarea-oe737Ggj.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./useId-Cj6lUCMN.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";function f(r){return r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function u(r){return/^[a-zA-Z_][\w.-]*$/.test(r)?r:"item"}function m(r,i,t){const e="  ".repeat(t),o=u(i);if(r==null)return`${e}<${o}/>`;if(Array.isArray(r))return r.map(n=>m(n,i,t)).join(`
`);if(typeof r=="object"){const n=Object.entries(r).map(([p,a])=>m(a,p,t+1)).join(`
`);return`${e}<${o}>
${n}
${e}</${o}>`}return`${e}<${o}>${f(String(r))}</${o}>`}function R(){const r=s.useCallback(i=>{if(!i.trim())return"";let t;try{t=JSON.parse(i)}catch(o){throw new Error(o instanceof Error?o.message:"无效的 JSON")}return`<?xml version="1.0" encoding="UTF-8"?>
<root>
${typeof t=="object"&&t!==null&&!Array.isArray(t)?Object.entries(t).map(([o,n])=>m(n,o,1)).join(`
`):m(t,"item",1)}
</root>`},[]);return c.jsx(l,{transform:r,inputLabel:"JSON",outputLabel:"XML",sample:`{
  "user": { "id": 1, "name": "Ada", "roles": ["admin", "dev"] }
}`,downloadName:"data.xml",downloadMime:"application/xml"})}export{R as default};
