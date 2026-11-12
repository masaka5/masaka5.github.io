import{r as s,j as c}from"./toolbox-CmtkVXqR.js";import{T as l}from"./text-tool-DEvyHdcP.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./ContextIsolator-g3C8c1gr.js";import"./panel-DmElCoWv.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";function f(r){return r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function u(r){return/^[a-zA-Z_][\w.-]*$/.test(r)?r:"item"}function m(r,i,t){const e="  ".repeat(t),o=u(i);if(r==null)return`${e}<${o}/>`;if(Array.isArray(r))return r.map(n=>m(n,i,t)).join(`
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
