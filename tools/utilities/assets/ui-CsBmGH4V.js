import{r as s,j as e}from"./toolbox-UanOk967.js";import{S as l}from"./switch-DPt0k4tg.js";import{F as u}from"./panel-Dz7kmini.js";import{T as k}from"./text-tool-Ce2pfWJ7.js";import"./index-HQBJxcTJ.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";function D(){const[r,x]=s.useState(!0),[n,h]=s.useState(!0),[c,d]=s.useState(!0),[o,f]=s.useState(!1),[i,g]=s.useState(!1),j=s.useCallback(m=>{if(!m)return"";let t=m.replace(/\r\n/g,`
`);o&&(t=t.replace(/\t/g,"  "));let a=t.split(`
`);return r&&(a=a.map(p=>p.replace(/[ \t]+$/g,"").replace(/^[ \t]+/g,""))),n&&(a=a.map(p=>p.replace(/[ \t]{2,}/g," "))),t=a.join(`
`),i?t=t.replace(/^\s*\n/gm,""):c&&(t=t.replace(/\n{3,}/g,`

`)),t.trim()},[r,n,c,o,i]);return e.jsx(k,{transform:j,deps:[r,n,c,o,i],sample:`  hello    world  



   foo	bar  
  `,downloadName:"cleaned.txt",options:e.jsx(u,{label:"清洁",children:e.jsxs("div",{className:"flex h-8 flex-wrap items-center gap-3",children:[e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:r,onCheckedChange:x})," ","修剪线"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:n,onCheckedChange:h})," ","塌陷空间"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:c,onCheckedChange:d})," ","折叠空白"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:i,onCheckedChange:g})," ","删除空白"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:o,onCheckedChange:f})," ","制表符→空格"]})]})})})}export{D as default};
