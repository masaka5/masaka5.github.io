import{r as v,j as e}from"./toolbox-BAFlSbAu.js";import{u as T}from"./use-view-state-Buv1JcBh.js";import{T as F}from"./text-tool-DJbu6FIk.js";import{F as b}from"./panel-Bqi8iGiy.js";import{T as A,a as E,b as L}from"./tabs-4oc-BJj3.js";import{S as C}from"./switch-D_tqQ3u1.js";import"./product-controls-B1-Khcjt.js";import"./input-z_zqgJn8.js";import"./index-CLt5N8Xt.js";import"./ContextIsolator-DC_hgRVI.js";import"./SearchOutlined-avAJ2sSo.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./useId-CQJPC48K.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";import"./CloseOutlined-DTTOE6cy.js";import"./index-CrsyJUrn.js";import"./KeyCode-HJ8jGXz0.js";import"./Overflow-CXeRYAeu.js";const N=`brand-50 = #eff6ff
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
${o}}`}function lt(){const[t,o]=v.useState("js"),[i,l]=T("tools/convert/convert-color-list-to-tailwind-config/ui.tsx:expand",!0),[a,m]=T("tools/convert/convert-color-list-to-tailwind-config/ui.tsx:lower",!0);return e.jsx(F,{deps:[t,i,a],sample:N,inputLabel:"名称 = #hex 对",outputLabel:t==="js"?"tailwind.config.js":"颜色.json",downloadName:t==="js"?"tailwind-colors.js":"tailwind-colors.json",transform:c=>{if(!c.trim())return"";const s={},n=[];if(c.split(`
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

`+f:f},options:e.jsxs(e.Fragment,{children:[e.jsx(b,{label:"输出",children:e.jsx(A,{value:t,onValueChange:c=>o(c),children:e.jsxs(E,{children:[e.jsx(L,{value:"js",children:"JS配置"}),e.jsx(L,{value:"json",children:"JSON"})]})})}),e.jsx(b,{label:"展开3位十六进制",children:e.jsx("div",{className:"flex h-9 items-center",children:e.jsx(C,{checked:i,onCheckedChange:l})})}),e.jsx(b,{label:"小写十六进制",children:e.jsx("div",{className:"flex h-9 items-center",children:e.jsx(C,{checked:a,onCheckedChange:m})})})]})})}export{lt as default};
