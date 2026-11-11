import{r as a,j as p}from"./toolbox-V8Mb6zl3.js";import{T as e}from"./text-tool-BNJ1nLL1.js";import{j as i}from"./yaml-DdbE6pca.js";import"./button-yaYS2cEr.js";import"./panel-BVEEuXxF.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";const n=`{
  "name": "app",
  "ports": [80, 443],
  "env": { "DEBUG": true }
}`;function M(){const m=a.useCallback(o=>{if(!o.trim())return"";let t;try{t=JSON.parse(o)}catch(r){throw new Error(r instanceof Error?r.message:"Invalid JSON")}return i(t)},[]);return p.jsx(e,{transform:m,inputLabel:"JSON",outputLabel:"YAML",sample:n,downloadName:"out.yaml",downloadMime:"text/yaml"})}export{M as default};
