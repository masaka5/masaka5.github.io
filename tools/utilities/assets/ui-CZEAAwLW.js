import{r as c,j as o}from"./toolbox-V8Mb6zl3.js";import{F as u}from"./panel-BVEEuXxF.js";import{T as f}from"./text-tool-BNJ1nLL1.js";import{S as h}from"./switch-Cd7u-X1w.js";import{T as x,a as b,b as p}from"./tabs-DhdYX72L.js";import"./button-yaYS2cEr.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";import"./index-B5fXPDQ_.js";import"./index-CB5QEDM1.js";import"./index-DWeD1Tma.js";import"./index-dzWK0ZpZ.js";import"./index-C-nIdkMn.js";function j(t){let n="",e=0;const s=t.length;for(;e<s;){const r=t[e]??"",l=t[e+1]??"";if(r==='"'){for(n+=r,e++;e<s;){const i=t[e]??"";if(n+=i,i==="\\"){n+=t[e+1]??"",e+=2;continue}if(e++,i==='"')break}continue}if(r==="'"){e++;let i="";for(;e<s;){const a=t[e]??"";if(a==="\\"){const m=t[e+1]??"";m==="'"?i+="'":m==='"'?i+='\\"':i+="\\"+m,e+=2;continue}if(a==="'"){e++;break}a==='"'?i+='\\"':i+=a,e++}n+=`"${i}"`;continue}if(r==="/"&&l==="/"){for(e+=2;e<s&&t[e]!==`
`;)e++;continue}if(r==="/"&&l==="*"){for(e+=2;e<s&&!(t[e]==="*"&&t[e+1]==="/");)e++;e+=2;continue}n+=r,e++}return n=n.replace(/,(\s*[}\]])/g,"$1"),n=n.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g,'$1"$2"$3'),n}function P(){const[t,n]=c.useState("2"),[e,s]=c.useState(!0),r=c.useCallback(l=>{if(!l.trim())return"";const i=j(l);if(!e)return i.trim();let a;try{a=JSON.parse(i)}catch(d){throw new Error(`Could not produce valid JSON: ${d.message}. Disable "Validate & reformat" to see the raw stripped output.`)}if(t==="min")return JSON.stringify(a);const m=t==="tab"?"	":Number(t);return JSON.stringify(a,null,m)},[t,e]);return o.jsx(f,{transform:r,deps:[t,e],inputLabel:"JSONC/JSON5",outputLabel:"JSON",inputPlaceholder:`{
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
}`,downloadName:"output.json",downloadMime:"application/json",options:o.jsxs(o.Fragment,{children:[o.jsx(u,{label:"输出",children:o.jsx(x,{value:t,onValueChange:l=>n(l),children:o.jsxs(b,{children:[o.jsx(p,{value:"2",children:"2 个空格"}),o.jsx(p,{value:"4",children:"4 个空格"}),o.jsx(p,{value:"tab",children:"标签"}),o.jsx(p,{value:"min",children:"缩小"})]})})}),o.jsx(u,{label:"验证并重新格式化",hint:"关闭=原始剥离文本",children:o.jsx("div",{className:"flex h-9 items-center",children:o.jsx(h,{checked:e,onCheckedChange:s})})})]})})}export{P as default};
