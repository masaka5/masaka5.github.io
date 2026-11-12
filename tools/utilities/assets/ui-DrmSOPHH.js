import{r as L,j as e}from"./toolbox-BAFlSbAu.js";import{u as h}from"./use-view-state-Buv1JcBh.js";import{T,a as k,b as u}from"./tabs-4oc-BJj3.js";import{I as w}from"./input-z_zqgJn8.js";import{S as C}from"./switch-D_tqQ3u1.js";import{L as S}from"./label-nyDkStTX.js";import{F as x}from"./panel-Bqi8iGiy.js";import{T as E}from"./text-tool-DJbu6FIk.js";import"./CloseOutlined-DTTOE6cy.js";import"./ContextIsolator-DC_hgRVI.js";import"./index-CrsyJUrn.js";import"./useId-CQJPC48K.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-CXeRYAeu.js";import"./index-CLt5N8Xt.js";import"./SearchOutlined-avAJ2sSo.js";import"./product-controls-B1-Khcjt.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";const F=`The quick brown fox
jumps over the
lazy dog.


A second paragraph
wraps across
several lines.`;function ae(){const[o,f]=h("tools/text/remove-line-breaks/ui.tsx:mode","all"),[a,j]=h("tools/text/remove-line-breaks/ui.tsx:joiner"," "),[r,g]=h("tools/text/remove-line-breaks/ui.tsx:trimLines",!0),b=L.useCallback(s=>{if(!s)return"";const l=s.replace(/\r\n?/g,`
`);if(o==="all"){const i=l.split(`
`);return(r?i.map(m=>m.trim()):i).join(a)}if(o==="paragraphs")return l.split(/\n[ \t]*\n+/).map(m=>{const d=m.split(`
`);return(r?d.map(c=>c.trim()):d).filter(c=>c.length>0||!r).join(a)}).join(`

`);const v=l.split(`
`),t=[];let p=!1;for(const i of v){const n=r?i.trim():i;n.length===0?(p||t.push(""),p=!0):(t.push(n),p=!1)}for(;t.length>0&&t[0]==="";)t.shift();for(;t.length>0&&t[t.length-1]==="";)t.pop();return t.join(`
`)},[o,a,r]);return e.jsx(E,{transform:b,deps:[o,a,r],inputLabel:"文本",outputLabel:"结果",inputPlaceholder:"粘贴带有换行符的文本...",sample:F,downloadName:"no-line-breaks.txt",options:e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(x,{label:"模式",children:e.jsx(T,{value:o,onValueChange:s=>f(s),children:e.jsxs(k,{children:[e.jsx(u,{value:"all",children:"加入全部"}),e.jsx(u,{value:"paragraphs",children:"保留段落"}),e.jsx(u,{value:"collapse",children:"折叠空白"})]})})}),o!=="collapse"&&e.jsx(x,{label:"加入角色",hint:"插入到连接线之间。使用空格、逗号等。",children:e.jsx(w,{value:a,onChange:s=>j(s.target.value),placeholder:"(空格)"})}),e.jsx(x,{label:"修剪每行",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(C,{id:"rlb-trim",checked:r,onCheckedChange:g}),e.jsx(S,{htmlFor:"rlb-trim",children:"删除前导/尾随空格"})]})})]})})}export{ae as default};
