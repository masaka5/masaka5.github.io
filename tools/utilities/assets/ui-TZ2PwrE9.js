import{r as b,j as t}from"./toolbox-CmtkVXqR.js";import{T as F}from"./text-tool-DEvyHdcP.js";import{F as g}from"./panel-DmElCoWv.js";import{T as A,a as E,b as L}from"./tabs-CgjPmVkM.js";import{S}from"./switch-mkCNf92t.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./ContextIsolator-g3C8c1gr.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";import"./CloseOutlined-BbHBxdIs.js";import"./index-BOQNaMUu.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-ad_kj95Y.js";const N=`brand-50 = #eff6ff
brand-100: #dbeafe
brand-500 = #3B82F6
brand-900 = #1e3a8a
accent = #F0A
surface: #fff
danger = #ef4444`;function O(e){if(/^#[0-9a-fA-F]{3}$/.test(e)){const s=e[1]??"",i=e[2]??"",l=e[3]??"";return`#${s}${s}${i}${i}${l}${l}`}return e}function w(e){return/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(e)?e:`'${e}'`}function y(e,s){return`{
${Object.entries(e).map(([a,m])=>{if(typeof m=="string")return`${s}  ${w(a)}: '${m}',`;const c=Object.entries(m).map(([o,n])=>`${s}    ${w(o)}: '${n}',`).join(`
`);return`${s}  ${w(a)}: {
${c}
${s}  },`}).join(`
`)}
${s}}`}function ae(){const[e,s]=b.useState("js"),[i,l]=b.useState(!0),[a,m]=b.useState(!0);return t.jsx(F,{deps:[e,i,a],sample:N,inputLabel:"名称 = #hex 对",outputLabel:e==="js"?"tailwind.config.js":"颜色.json",downloadName:e==="js"?"tailwind-colors.js":"tailwind-colors.json",transform:c=>{if(!c.trim())return"";const o={},n=[];if(c.split(`
`).forEach((d,C)=>{const u=d.trim();if(!u||u.startsWith("//"))return;const h=/^(.+?)\s*[:=]\s*(#?[0-9a-fA-F]{3,8})\s*$/.exec(u);if(!h){n.push(`Line ${C+1}: "${u}" — expected name = #hex`);return}const T=(h[1]??"").trim();let r=(h[2]??"").trim();r.startsWith("#")||(r=`#${r}`),i&&(r=O(r)),a&&(r=r.toLowerCase());const p=/^(.*?)[-_]?(\d{2,3})$/.exec(T);if(p&&p[1]&&p[2]){const $=p[1],x=p[2],j=o[$];j===void 0?o[$]={[x]:r}:typeof j=="object"?j[x]=r:o[$]={DEFAULT:j,[x]:r}}else o[T]=r}),n.length>0&&Object.keys(o).length===0)throw new Error(n.join(`
`));let f;return e==="json"?f=JSON.stringify(o,null,2):f=`/** @type {import("tailwindcss").Config} */
module.exports = {
  theme: {
    extend: {
      colors: ${y(o,"      ")},
    },
  },
};`,n.length>0?`// Skipped ${n.length} unparsable line(s):
`+n.map(d=>`// ${d}`).join(`
`)+`

`+f:f},options:t.jsxs(t.Fragment,{children:[t.jsx(g,{label:"输出",children:t.jsx(A,{value:e,onValueChange:c=>s(c),children:t.jsxs(E,{children:[t.jsx(L,{value:"js",children:"JS配置"}),t.jsx(L,{value:"json",children:"JSON"})]})})}),t.jsx(g,{label:"展开3位十六进制",children:t.jsx("div",{className:"flex h-9 items-center",children:t.jsx(S,{checked:i,onCheckedChange:l})})}),t.jsx(g,{label:"小写十六进制",children:t.jsx("div",{className:"flex h-9 items-center",children:t.jsx(S,{checked:a,onCheckedChange:m})})})]})})}export{ae as default};
