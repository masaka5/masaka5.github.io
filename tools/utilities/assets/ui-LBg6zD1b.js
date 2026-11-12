import{u as h,r as L,j as e}from"./toolbox-X2JQkZJS.js";import{T,a as k,b as u}from"./tabs-XdEyTQ47.js";import{I as w}from"./input-Cj95RvLc.js";import{S as C}from"./switch-eAQxBvBb.js";import{L as S}from"./label-mUO-Ps5t.js";import{F as x}from"./panel-Bb9jn6HH.js";import{T as E}from"./text-tool-CVfCwMif.js";import"./CloseOutlined-CadKeUxe.js";import"./ContextIsolator-YulytHJS.js";import"./index-xU3b9Pvt.js";import"./useId-Cj6lUCMN.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-gxE4pru3.js";import"./index-pWcJ1Cs1.js";import"./SearchOutlined-CdtN4l1l.js";import"./product-controls-DKzw6tMZ.js";import"./textarea-oe737Ggj.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";const F=`The quick brown fox
jumps over the
lazy dog.


A second paragraph
wraps across
several lines.`;function ie(){const[s,f]=h("tools/text/remove-line-breaks/ui.tsx:mode","all",["all","paragraphs","collapse"]),[a,j]=h("tools/text/remove-line-breaks/ui.tsx:joiner"," "),[r,g]=h("tools/text/remove-line-breaks/ui.tsx:trimLines",!0),b=L.useCallback(o=>{if(!o)return"";const n=o.replace(/\r\n?/g,`
`);if(s==="all"){const i=n.split(`
`);return(r?i.map(m=>m.trim()):i).join(a)}if(s==="paragraphs")return n.split(/\n[ \t]*\n+/).map(m=>{const d=m.split(`
`);return(r?d.map(c=>c.trim()):d).filter(c=>c.length>0||!r).join(a)}).join(`

`);const v=n.split(`
`),t=[];let p=!1;for(const i of v){const l=r?i.trim():i;l.length===0?(p||t.push(""),p=!0):(t.push(l),p=!1)}for(;t.length>0&&t[0]==="";)t.shift();for(;t.length>0&&t[t.length-1]==="";)t.pop();return t.join(`
`)},[s,a,r]);return e.jsx(E,{transform:b,deps:[s,a,r],inputLabel:"文本",outputLabel:"结果",inputPlaceholder:"粘贴带有换行符的文本...",sample:F,downloadName:"no-line-breaks.txt",options:e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(x,{label:"模式",children:e.jsx(T,{value:s,onValueChange:o=>f(o),children:e.jsxs(k,{children:[e.jsx(u,{value:"all",children:"加入全部"}),e.jsx(u,{value:"paragraphs",children:"保留段落"}),e.jsx(u,{value:"collapse",children:"折叠空白"})]})})}),s!=="collapse"&&e.jsx(x,{label:"加入角色",hint:"插入到连接线之间。使用空格、逗号等。",children:e.jsx(w,{value:a,onChange:o=>j(o.target.value),placeholder:"(空格)"})}),e.jsx(x,{label:"修剪每行",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(C,{id:"rlb-trim",checked:r,onCheckedChange:g}),e.jsx(S,{htmlFor:"rlb-trim",children:"删除前导/尾随空格"})]})})]})})}export{ie as default};
