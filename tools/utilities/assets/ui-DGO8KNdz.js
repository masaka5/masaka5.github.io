import{r as s,j as c}from"./toolbox-C1bqIItI.js";import{T as l}from"./text-tool-DKzwReiD.js";import"./product-controls-DefmGwRs.js";import"./input-BQFgluN1.js";import"./index-N7Nfcwyv.js";import"./ContextIsolator-9GaOU_7w.js";import"./panel-BS_kjOg7.js";import"./SearchOutlined-BqroMpgS.js";import"./textarea-CvYfK1Ma.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./useId-CzaMCTks.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";function f(r){return r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function u(r){return/^[a-zA-Z_][\w.-]*$/.test(r)?r:"item"}function m(r,i,t){const e="  ".repeat(t),o=u(i);if(r==null)return`${e}<${o}/>`;if(Array.isArray(r))return r.map(n=>m(n,i,t)).join(`
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
