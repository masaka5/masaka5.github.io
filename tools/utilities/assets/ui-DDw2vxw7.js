import{r as v,u as T,j as e}from"./toolbox-X2JQkZJS.js";import{T as F}from"./text-tool-CVfCwMif.js";import{F as b}from"./panel-Bb9jn6HH.js";import{T as A,a as E,b as L}from"./tabs-XdEyTQ47.js";import{S as C}from"./switch-eAQxBvBb.js";import"./product-controls-DKzw6tMZ.js";import"./input-Cj95RvLc.js";import"./index-pWcJ1Cs1.js";import"./ContextIsolator-YulytHJS.js";import"./SearchOutlined-CdtN4l1l.js";import"./textarea-oe737Ggj.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./useId-Cj6lUCMN.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";import"./CloseOutlined-CadKeUxe.js";import"./index-xU3b9Pvt.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-gxE4pru3.js";const N=`brand-50 = #eff6ff
brand-100: #dbeafe
brand-500 = #3B82F6
brand-900 = #1e3a8a
accent = #F0A
surface: #fff
danger = #ef4444`;function O(t){if(/^#[0-9a-fA-F]{3}$/.test(t)){const o=t[1]??"",i=t[2]??"",l=t[3]??"";return`#${o}${o}${i}${i}${l}${l}`}return t}function g(t){return/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(t)?t:`'${t}'`}function y(t,o){return`{
${Object.entries(t).map(([a,m])=>{if(typeof m=="string")return`${o}  ${g(a)}: '${m}',`;const c=Object.entries(m).map(([s,n])=>`${o}    ${g(s)}: '${n}',`).join(`
`);return`${o}  ${g(a)}: {
${c}
${o}  },`}).join(`
`)}
${o}}`}function ct(){const[t,o]=v.useState("js"),[i,l]=T("tools/convert/convert-color-list-to-tailwind-config/ui.tsx:expand",!0),[a,m]=T("tools/convert/convert-color-list-to-tailwind-config/ui.tsx:lower",!0);return e.jsx(F,{deps:[t,i,a],sample:N,inputLabel:"名称 = #hex 对",outputLabel:t==="js"?"tailwind.config.js":"颜色.json",downloadName:t==="js"?"tailwind-colors.js":"tailwind-colors.json",transform:c=>{if(!c.trim())return"";const s={},n=[];if(c.split(`
`).forEach((d,S)=>{const u=d.trim();if(!u||u.startsWith("//"))return;const h=/^(.+?)\s*[:=]\s*(#?[0-9a-fA-F]{3,8})\s*$/.exec(u);if(!h){n.push(`Line ${S+1}: "${u}" — expected name = #hex`);return}const w=(h[1]??"").trim();let r=(h[2]??"").trim();r.startsWith("#")||(r=`#${r}`),i&&(r=O(r)),a&&(r=r.toLowerCase());const p=/^(.*?)[-_]?(\d{2,3})$/.exec(w);if(p&&p[1]&&p[2]){const x=p[1],$=p[2],j=s[x];j===void 0?s[x]={[$]:r}:typeof j=="object"?j[$]=r:s[x]={DEFAULT:j,[$]:r}}else s[w]=r}),n.length>0&&Object.keys(s).length===0)throw new Error(n.join(`
`));let f;return t==="json"?f=JSON.stringify(s,null,2):f=`/** @type {import("tailwindcss").Config} */
module.exports = {
  theme: {
    extend: {
      colors: ${y(s,"      ")},
    },
  },
};`,n.length>0?`// Skipped ${n.length} unparsable line(s):
`+n.map(d=>`// ${d}`).join(`
`)+`

`+f:f},options:e.jsxs(e.Fragment,{children:[e.jsx(b,{label:"输出",children:e.jsx(A,{value:t,onValueChange:c=>o(c),children:e.jsxs(E,{children:[e.jsx(L,{value:"js",children:"JS配置"}),e.jsx(L,{value:"json",children:"JSON"})]})})}),e.jsx(b,{label:"展开3位十六进制",children:e.jsx("div",{className:"flex h-9 items-center",children:e.jsx(C,{checked:i,onCheckedChange:l})})}),e.jsx(b,{label:"小写十六进制",children:e.jsx("div",{className:"flex h-9 items-center",children:e.jsx(C,{checked:a,onCheckedChange:m})})})]})})}export{ct as default};
