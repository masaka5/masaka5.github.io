import{r as s,j as c}from"./toolbox-UanOk967.js";import{T as l}from"./text-tool-Ce2pfWJ7.js";import"./button-UgOWl7Pw.js";import"./panel-Dz7kmini.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";function f(r){return r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function u(r){return/^[a-zA-Z_][\w.-]*$/.test(r)?r:"item"}function a(r,e,t){const n="  ".repeat(t),o=u(e);if(r==null)return`${n}<${o}/>`;if(Array.isArray(r))return r.map(i=>a(i,e,t)).join(`
`);if(typeof r=="object"){const i=Object.entries(r).map(([m,p])=>a(p,m,t+1)).join(`
`);return`${n}<${o}>
${i}
${n}</${o}>`}return`${n}<${o}>${f(String(r))}</${o}>`}function X(){const r=s.useCallback(e=>{if(!e.trim())return"";let t;try{t=JSON.parse(e)}catch(o){throw new Error(o instanceof Error?o.message:"无效的 JSON")}return`<?xml version="1.0" encoding="UTF-8"?>
<root>
${typeof t=="object"&&t!==null&&!Array.isArray(t)?Object.entries(t).map(([o,i])=>a(i,o,1)).join(`
`):a(t,"item",1)}
</root>`},[]);return c.jsx(l,{transform:r,inputLabel:"JSON",outputLabel:"XML",sample:`{
  "user": { "id": 1, "name": "Ada", "roles": ["admin", "dev"] }
}`,downloadName:"data.xml",downloadMime:"application/xml"})}export{X as default};
