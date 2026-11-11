import{r as l,j as e}from"./toolbox-V8Mb6zl3.js";import{T,a as L,b as u}from"./tabs-DhdYX72L.js";import{I as k}from"./input-oXBawGgZ.js";import{S as w}from"./switch-Cd7u-X1w.js";import{L as S}from"./label-DAwskLzZ.js";import{F as d}from"./panel-BVEEuXxF.js";import{T as C}from"./text-tool-BNJ1nLL1.js";import"./index-B5fXPDQ_.js";import"./index-CB5QEDM1.js";import"./index-DWeD1Tma.js";import"./index-dzWK0ZpZ.js";import"./index-C-nIdkMn.js";import"./button-yaYS2cEr.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";const E=`The quick brown fox
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
