import{r as b,j as t}from"./toolbox-V8Mb6zl3.js";import{T as F}from"./text-tool-BNJ1nLL1.js";import{F as g}from"./panel-BVEEuXxF.js";import{T as A,a as E,b as L}from"./tabs-DhdYX72L.js";import{S}from"./switch-Cd7u-X1w.js";import"./button-yaYS2cEr.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";import"./index-B5fXPDQ_.js";import"./index-CB5QEDM1.js";import"./index-DWeD1Tma.js";import"./index-dzWK0ZpZ.js";import"./index-C-nIdkMn.js";const N=`brand-50 = #eff6ff
brand-100: #dbeafe
brand-500 = #3B82F6
brand-900 = #1e3a8a
accent = #F0A
surface: #fff
danger = #ef4444`;function O(e){if(/^#[0-9a-fA-F]{3}$/.test(e)){const s=e[1]??"",i=e[2]??"",l=e[3]??"";return`#${s}${s}${i}${i}${l}${l}`}return e}function w(e){return/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(e)?e:`'${e}'`}function y(e,s){return`{
${Object.entries(e).map(([a,m])=>{if(typeof m=="string")return`${s}  ${w(a)}: '${m}',`;const c=Object.entries(m).map(([n,o])=>`${s}    ${w(n)}: '${o}',`).join(`
`);return`${s}  ${w(a)}: {
${c}
${s}  },`}).join(`
`)}
${s}}`}function re(){const[e,s]=b.useState("js"),[i,l]=b.useState(!0),[a,m]=b.useState(!0);return t.jsx(F,{deps:[e,i,a],sample:N,inputLabel:"名称 = #hex 对",outputLabel:e==="js"?"tailwind.config.js":"颜色.json",downloadName:e==="js"?"tailwind-colors.js":"tailwind-colors.json",transform:c=>{if(!c.trim())return"";const n={},o=[];if(c.split(`
`).forEach((d,C)=>{const u=d.trim();if(!u||u.startsWith("//"))return;const h=/^(.+?)\s*[:=]\s*(#?[0-9a-fA-F]{3,8})\s*$/.exec(u);if(!h){o.push(`Line ${C+1}: "${u}" — expected name = #hex`);return}const T=(h[1]??"").trim();let r=(h[2]??"").trim();r.startsWith("#")||(r=`#${r}`),i&&(r=O(r)),a&&(r=r.toLowerCase());const p=/^(.*?)[-_]?(\d{2,3})$/.exec(T);if(p&&p[1]&&p[2]){const $=p[1],x=p[2],j=n[$];j===void 0?n[$]={[x]:r}:typeof j=="object"?j[x]=r:n[$]={DEFAULT:j,[x]:r}}else n[T]=r}),o.length>0&&Object.keys(n).length===0)throw new Error(o.join(`
`));let f;return e==="json"?f=JSON.stringify(n,null,2):f=`/** @type {import("tailwindcss").Config} */
module.exports = {
  theme: {
    extend: {
      colors: ${y(n,"      ")},
    },
  },
};`,o.length>0?`// Skipped ${o.length} unparsable line(s):
`+o.map(d=>`// ${d}`).join(`
`)+`

`+f:f},options:t.jsxs(t.Fragment,{children:[t.jsx(g,{label:"输出",children:t.jsx(A,{value:e,onValueChange:c=>s(c),children:t.jsxs(E,{children:[t.jsx(L,{value:"js",children:"JS配置"}),t.jsx(L,{value:"json",children:"JSON"})]})})}),t.jsx(g,{label:"展开3位十六进制",children:t.jsx("div",{className:"flex h-9 items-center",children:t.jsx(S,{checked:i,onCheckedChange:l})})}),t.jsx(g,{label:"小写十六进制",children:t.jsx("div",{className:"flex h-9 items-center",children:t.jsx(S,{checked:a,onCheckedChange:m})})})]})})}export{re as default};
