import{r as s,j as e}from"./toolbox-CmtkVXqR.js";import{S as l}from"./switch-mkCNf92t.js";import{F as u}from"./panel-DmElCoWv.js";import{T as k}from"./text-tool-DEvyHdcP.js";import"./ContextIsolator-g3C8c1gr.js";import"./KeyCode-HJ8jGXz0.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";function M(){const[r,x]=s.useState(!0),[o,h]=s.useState(!0),[n,d]=s.useState(!0),[c,f]=s.useState(!1),[i,g]=s.useState(!1),j=s.useCallback(m=>{if(!m)return"";let t=m.replace(/\r\n/g,`
`);c&&(t=t.replace(/\t/g,"  "));let a=t.split(`
`);return r&&(a=a.map(p=>p.replace(/[ \t]+$/g,"").replace(/^[ \t]+/g,""))),o&&(a=a.map(p=>p.replace(/[ \t]{2,}/g," "))),t=a.join(`
`),i?t=t.replace(/^\s*\n/gm,""):n&&(t=t.replace(/\n{3,}/g,`

`)),t.trim()},[r,o,n,c,i]);return e.jsx(k,{transform:j,deps:[r,o,n,c,i],sample:`  hello    world  



   foo	bar  
  `,downloadName:"cleaned.txt",options:e.jsx(u,{label:"清洁",children:e.jsxs("div",{className:"flex h-8 flex-wrap items-center gap-3",children:[e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:r,onCheckedChange:x})," ","修剪线"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:o,onCheckedChange:h})," ","塌陷空间"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:n,onCheckedChange:d})," ","折叠空白"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:i,onCheckedChange:g})," ","删除空白"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(l,{checked:c,onCheckedChange:f})," ","制表符→空格"]})]})})})}export{M as default};
