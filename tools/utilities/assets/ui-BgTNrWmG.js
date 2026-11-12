import{r as l,j as e}from"./toolbox-CmtkVXqR.js";import{T,a as L,b as u}from"./tabs-CgjPmVkM.js";import{I as k}from"./input-CQci13IV.js";import{S as w}from"./switch-mkCNf92t.js";import{L as S}from"./label-CvcSYlxW.js";import{F as d}from"./panel-DmElCoWv.js";import{T as C}from"./text-tool-DEvyHdcP.js";import"./CloseOutlined-BbHBxdIs.js";import"./ContextIsolator-g3C8c1gr.js";import"./index-BOQNaMUu.js";import"./useId-Chs6QaAi.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-ad_kj95Y.js";import"./index-IMt1bn3i.js";import"./SearchOutlined-DekVZon5.js";import"./product-controls-DM7ptYUH.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";const E=`The quick brown fox
jumps over the
lazy dog.


A second paragraph
wraps across
several lines.`;function oe(){const[s,x]=l.useState("all"),[a,j]=l.useState(" "),[r,g]=l.useState(!0),b=l.useCallback(o=>{if(!o)return"";const p=o.replace(/\r\n?/g,`
`);if(s==="all"){const i=p.split(`
`);return(r?i.map(c=>c.trim()):i).join(a)}if(s==="paragraphs")return p.split(/\n[ \t]*\n+/).map(c=>{const f=c.split(`
`);return(r?f.map(h=>h.trim()):f).filter(h=>h.length>0||!r).join(a)}).join(`

`);const v=p.split(`
`),t=[];let m=!1;for(const i of v){const n=r?i.trim():i;n.length===0?(m||t.push(""),m=!0):(t.push(n),m=!1)}for(;t.length>0&&t[0]==="";)t.shift();for(;t.length>0&&t[t.length-1]==="";)t.pop();return t.join(`
`)},[s,a,r]);return e.jsx(C,{transform:b,deps:[s,a,r],inputLabel:"文本",outputLabel:"结果",inputPlaceholder:"粘贴带有换行符的文本...",sample:E,downloadName:"no-line-breaks.txt",options:e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(d,{label:"模式",children:e.jsx(T,{value:s,onValueChange:o=>x(o),children:e.jsxs(L,{children:[e.jsx(u,{value:"all",children:"加入全部"}),e.jsx(u,{value:"paragraphs",children:"保留段落"}),e.jsx(u,{value:"collapse",children:"折叠空白"})]})})}),s!=="collapse"&&e.jsx(d,{label:"加入角色",hint:"插入到连接线之间。使用空格、逗号等。",children:e.jsx(k,{value:a,onChange:o=>j(o.target.value),placeholder:"(空格)"})}),e.jsx(d,{label:"修剪每行",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(w,{id:"rlb-trim",checked:r,onCheckedChange:g}),e.jsx(S,{htmlFor:"rlb-trim",children:"删除前导/尾随空格"})]})})]})})}export{oe as default};
