import{r as s,j as c}from"./toolbox-V8Mb6zl3.js";import{T as l}from"./text-tool-BNJ1nLL1.js";import"./button-yaYS2cEr.js";import"./panel-BVEEuXxF.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";function f(r){return r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function u(r){return/^[a-zA-Z_][\w.-]*$/.test(r)?r:"item"}function a(r,n,t){const e="  ".repeat(t),o=u(n);if(r==null)return`${e}<${o}/>`;if(Array.isArray(r))return r.map(i=>a(i,n,t)).join(`
`);if(typeof r=="object"){const i=Object.entries(r).map(([m,p])=>a(p,m,t+1)).join(`
`);return`${e}<${o}>
${i}
${e}</${o}>`}return`${e}<${o}>${f(String(r))}</${o}>`}function X(){const r=s.useCallback(n=>{if(!n.trim())return"";let t;try{t=JSON.parse(n)}catch(o){throw new Error(o instanceof Error?o.message:"Invalid JSON")}return`<?xml version="1.0" encoding="UTF-8"?>
<root>
${typeof t=="object"&&t!==null&&!Array.isArray(t)?Object.entries(t).map(([o,i])=>a(i,o,1)).join(`
`):a(t,"item",1)}
</root>`},[]);return c.jsx(l,{transform:r,inputLabel:"JSON",outputLabel:"XML",sample:`{
  "user": { "id": 1, "name": "Ada", "roles": ["admin", "dev"] }
}`,downloadName:"data.xml",downloadMime:"application/xml"})}export{X as default};
