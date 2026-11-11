import{r as a,j as p}from"./toolbox-UanOk967.js";import{T as e}from"./text-tool-Ce2pfWJ7.js";import{j as i}from"./yaml-DdbE6pca.js";import"./button-UgOWl7Pw.js";import"./panel-Dz7kmini.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";const n=`{
  "name": "app",
  "ports": [80, 443],
  "env": { "DEBUG": true }
}`;function M(){const m=a.useCallback(o=>{if(!o.trim())return"";let t;try{t=JSON.parse(o)}catch(r){throw new Error(r instanceof Error?r.message:"无效的 JSON")}return i(t)},[]);return p.jsx(e,{transform:m,inputLabel:"JSON",outputLabel:"YAML",sample:n,downloadName:"out.yaml",downloadMime:"text/yaml"})}export{M as default};
