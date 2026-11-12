import{r as s,j as c}from"./toolbox-BAFlSbAu.js";import{T as l}from"./text-tool-DJbu6FIk.js";import"./use-view-state-Buv1JcBh.js";import"./product-controls-B1-Khcjt.js";import"./input-z_zqgJn8.js";import"./index-CLt5N8Xt.js";import"./ContextIsolator-DC_hgRVI.js";import"./panel-Bqi8iGiy.js";import"./SearchOutlined-avAJ2sSo.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./useId-CQJPC48K.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";function f(r){return r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function u(r){return/^[a-zA-Z_][\w.-]*$/.test(r)?r:"item"}function m(r,i,t){const e="  ".repeat(t),o=u(i);if(r==null)return`${e}<${o}/>`;if(Array.isArray(r))return r.map(n=>m(n,i,t)).join(`
`);if(typeof r=="object"){const n=Object.entries(r).map(([p,a])=>m(a,p,t+1)).join(`
`);return`${e}<${o}>
${n}
${e}</${o}>`}return`${e}<${o}>${f(String(r))}</${o}>`}function U(){const r=s.useCallback(i=>{if(!i.trim())return"";let t;try{t=JSON.parse(i)}catch(o){throw new Error(o instanceof Error?o.message:"无效的 JSON")}return`<?xml version="1.0" encoding="UTF-8"?>
<root>
${typeof t=="object"&&t!==null&&!Array.isArray(t)?Object.entries(t).map(([o,n])=>m(n,o,1)).join(`
`):m(t,"item",1)}
</root>`},[]);return c.jsx(l,{transform:r,inputLabel:"JSON",outputLabel:"XML",sample:`{
  "user": { "id": 1, "name": "Ada", "roles": ["admin", "dev"] }
}`,downloadName:"data.xml",downloadMime:"application/xml"})}export{U as default};
