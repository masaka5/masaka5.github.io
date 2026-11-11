import{r as a,j as e}from"./toolbox-V8Mb6zl3.js";import{S as i}from"./switch-Cd7u-X1w.js";import{F as c}from"./panel-BVEEuXxF.js";import{T as d}from"./text-tool-BNJ1nLL1.js";import{s as x,d as f}from"./lines-lljRLmY1.js";import"./index-B5fXPDQ_.js";import"./button-yaYS2cEr.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";function q(){const[t,m]=a.useState(!1),[s,p]=a.useState(!1),n=a.useCallback(o=>{if(!o)return"";let r=x(o);return s&&(r=r.map(l=>l.trim())),f(r,t).join(`
`)},[t,s]);return e.jsx(d,{transform:n,deps:[t,s],sample:`apple
banana
Apple
apple
banana
cherry`,downloadName:"deduped.txt",options:e.jsx(c,{label:"选项",children:e.jsxs("div",{className:"flex h-8 items-center gap-3",children:[e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(i,{checked:t,onCheckedChange:m})," ","忽略大小写"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(i,{checked:s,onCheckedChange:p})," ","比较前修剪"]})]})})})}export{q as default};
