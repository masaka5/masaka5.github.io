import{r as l,j as e}from"./toolbox-UanOk967.js";import{T,a as L,b as u}from"./tabs-DZAAdCmQ.js";import{I as k}from"./input-C-alCsST.js";import{S as w}from"./switch-DPt0k4tg.js";import{L as S}from"./label-CUtkP1Is.js";import{F as d}from"./panel-Dz7kmini.js";import{T as C}from"./text-tool-Ce2pfWJ7.js";import"./index-HQBJxcTJ.js";import"./index-BSkAzB9Z.js";import"./index-DiK7AOdK.js";import"./index-C-pHolA0.js";import"./index-Bp6S2Opf.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";const E=`The quick brown fox
jumps over the
lazy dog.


A second paragraph
wraps across
several lines.`;function ee(){const[s,x]=l.useState("all"),[i,j]=l.useState(" "),[r,g]=l.useState(!0),b=l.useCallback(o=>{if(!o)return"";const p=o.replace(/\r\n?/g,`
`);if(s==="all"){const a=p.split(`
`);return(r?a.map(c=>c.trim()):a).join(i)}if(s==="paragraphs")return p.split(/\n[ \t]*\n+/).map(c=>{const f=c.split(`
`);return(r?f.map(h=>h.trim()):f).filter(h=>h.length>0||!r).join(i)}).join(`

`);const v=p.split(`
`),t=[];let m=!1;for(const a of v){const n=r?a.trim():a;n.length===0?(m||t.push(""),m=!0):(t.push(n),m=!1)}for(;t.length>0&&t[0]==="";)t.shift();for(;t.length>0&&t[t.length-1]==="";)t.pop();return t.join(`
`)},[s,i,r]);return e.jsx(C,{transform:b,deps:[s,i,r],inputLabel:"文本",outputLabel:"结果",inputPlaceholder:"粘贴带有换行符的文本...",sample:E,downloadName:"no-line-breaks.txt",options:e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(d,{label:"模式",children:e.jsx(T,{value:s,onValueChange:o=>x(o),children:e.jsxs(L,{children:[e.jsx(u,{value:"all",children:"加入全部"}),e.jsx(u,{value:"paragraphs",children:"保留段落"}),e.jsx(u,{value:"collapse",children:"折叠空白"})]})})}),s!=="collapse"&&e.jsx(d,{label:"加入角色",hint:"插入到连接线之间。使用空格、逗号等。",children:e.jsx(k,{value:i,onChange:o=>j(o.target.value),placeholder:"(空格)"})}),e.jsx(d,{label:"修剪每行",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(w,{id:"rlb-trim",checked:r,onCheckedChange:g}),e.jsx(S,{htmlFor:"rlb-trim",children:"删除前导/尾随空格"})]})})]})})}export{ee as default};
