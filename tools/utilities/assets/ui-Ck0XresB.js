import{r as c,j as o}from"./toolbox-CmtkVXqR.js";import{F as u}from"./panel-DmElCoWv.js";import{T as f}from"./text-tool-DEvyHdcP.js";import{S as h}from"./switch-mkCNf92t.js";import{T as x,a as b,b as p}from"./tabs-CgjPmVkM.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./ContextIsolator-g3C8c1gr.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";import"./KeyCode-HJ8jGXz0.js";import"./CloseOutlined-BbHBxdIs.js";import"./index-BOQNaMUu.js";import"./Overflow-ad_kj95Y.js";function j(t){let n="",e=0;const s=t.length;for(;e<s;){const r=t[e]??"",l=t[e+1]??"";if(r==='"'){for(n+=r,e++;e<s;){const i=t[e]??"";if(n+=i,i==="\\"){n+=t[e+1]??"",e+=2;continue}if(e++,i==='"')break}continue}if(r==="'"){e++;let i="";for(;e<s;){const a=t[e]??"";if(a==="\\"){const m=t[e+1]??"";m==="'"?i+="'":m==='"'?i+='\\"':i+="\\"+m,e+=2;continue}if(a==="'"){e++;break}a==='"'?i+='\\"':i+=a,e++}n+=`"${i}"`;continue}if(r==="/"&&l==="/"){for(e+=2;e<s&&t[e]!==`
`;)e++;continue}if(r==="/"&&l==="*"){for(e+=2;e<s&&!(t[e]==="*"&&t[e+1]==="/");)e++;e+=2;continue}n+=r,e++}return n=n.replace(/,(\s*[}\]])/g,"$1"),n=n.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g,'$1"$2"$3'),n}function H(){const[t,n]=c.useState("2"),[e,s]=c.useState(!0),r=c.useCallback(l=>{if(!l.trim())return"";const i=j(l);if(!e)return i.trim();let a;try{a=JSON.parse(i)}catch(d){throw new Error(`Could not produce valid JSON: ${d.message}. 禁用“验证和重新格式化”以查看原始剥离输出。`)}if(t==="min")return JSON.stringify(a);const m=t==="tab"?"	":Number(t);return JSON.stringify(a,null,m)},[t,e]);return o.jsx(f,{transform:r,deps:[t,e],inputLabel:"JSONC/JSON5",outputLabel:"JSON",inputPlaceholder:`{
  // a comment
  name: "example",
  tags: ["a", "b",], /* trailing comma */
}`,sample:`{
  // App configuration
  name: 'my-app',
  version: "1.2.3",
  features: [
    "search",
    "export", // trailing comma below
  ],
  /* nested block */
  limits: { max: 100, min: 0, },
}`,downloadName:"output.json",downloadMime:"application/json",options:o.jsxs(o.Fragment,{children:[o.jsx(u,{label:"输出",children:o.jsx(x,{value:t,onValueChange:l=>n(l),children:o.jsxs(b,{children:[o.jsx(p,{value:"2",children:"2 个空格"}),o.jsx(p,{value:"4",children:"4 个空格"}),o.jsx(p,{value:"tab",children:"标签"}),o.jsx(p,{value:"min",children:"缩小"})]})})}),o.jsx(u,{label:"验证并重新格式化",hint:"关闭=原始剥离文本",children:o.jsx("div",{className:"flex h-9 items-center",children:o.jsx(h,{checked:e,onCheckedChange:s})})})]})})}export{H as default};
