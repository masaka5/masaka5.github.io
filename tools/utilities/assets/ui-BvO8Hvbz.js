import{r as s,j as e}from"./toolbox-C1bqIItI.js";import{S as l}from"./switch-CtKsE6C3.js";import{F as u}from"./panel-BS_kjOg7.js";import{T as k}from"./text-tool-DKzwReiD.js";import"./ContextIsolator-9GaOU_7w.js";import"./KeyCode-HJ8jGXz0.js";import"./product-controls-DefmGwRs.js";import"./input-BQFgluN1.js";import"./index-N7Nfcwyv.js";import"./SearchOutlined-BqroMpgS.js";import"./textarea-CvYfK1Ma.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./useId-CzaMCTks.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";function M(){const[r,x]=s.useState(!0),[o,h]=s.useState(!0),[n,d]=s.useState(!0),[c,f]=s.useState(!1),[i,g]=s.useState(!1),j=s.useCallback(m=>{if(!m)return"";let t=m.replace(/\r\n/g,`
`);c&&(t=t.replace(/\t/g,"  "));let a=t.split(`
`);return r&&(a=a.map(p=>p.replace(/[ \t]+$/g,"").replace(/^[ \t]+/g,""))),o&&(a=a.map(p=>p.replace(/[ \t]{2,}/g," "))),t=a.join(`
`),i?t=t.replace(/^\s*\n/gm,""):n&&(t=t.replace(/\n{3,}/g,`

`)),t.trim()},[r,o,n,c,i]);return e.jsx(k,{transform:j,deps:[r,o,n,c,i],sample:`  hello    world  



   foo	bar  
  `,downloadName:"cleaned.txt",options:e.jsx(u,{label:"清洁",children:e.jsxs("div",{className:"flex h-8 flex-wrap items-center gap-3",children:[e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:r,onCheckedChange:x})," ","修剪线"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:o,onCheckedChange:h})," ","塌陷空间"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:n,onCheckedChange:d})," ","折叠空白"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:i,onCheckedChange:g})," ","删除空白"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:c,onCheckedChange:f})," ","制表符→空格"]})]})})})}export{M as default};
