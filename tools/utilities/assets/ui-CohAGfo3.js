import{r as a,j as e}from"./toolbox-UanOk967.js";import{S as i}from"./switch-DPt0k4tg.js";import{F as c}from"./panel-Dz7kmini.js";import{T as d}from"./text-tool-Ce2pfWJ7.js";import{s as x,d as f}from"./lines-lljRLmY1.js";import"./index-HQBJxcTJ.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";function q(){const[t,m]=a.useState(!1),[s,p]=a.useState(!1),n=a.useCallback(o=>{if(!o)return"";let r=x(o);return s&&(r=r.map(l=>l.trim())),f(r,t).join(`
`)},[t,s]);return e.jsx(d,{transform:n,deps:[t,s],sample:`apple
banana
Apple
apple
banana
cherry`,downloadName:"deduped.txt",options:e.jsx(c,{label:"选项",children:e.jsxs("div",{className:"flex h-8 items-center gap-3",children:[e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(i,{checked:t,onCheckedChange:m})," ","忽略大小写"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(i,{checked:s,onCheckedChange:p})," ","比较前修剪"]})]})})})}export{q as default};
