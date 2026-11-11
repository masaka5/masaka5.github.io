import{r as c,j as n}from"./toolbox-UanOk967.js";import{F as u}from"./panel-Dz7kmini.js";import{T as f}from"./text-tool-Ce2pfWJ7.js";import{S as h}from"./switch-DPt0k4tg.js";import{T as x,a as b,b as p}from"./tabs-DZAAdCmQ.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";import"./index-HQBJxcTJ.js";import"./index-BSkAzB9Z.js";import"./index-DiK7AOdK.js";import"./index-C-pHolA0.js";import"./index-Bp6S2Opf.js";function j(t){let o="",e=0;const s=t.length;for(;e<s;){const r=t[e]??"",l=t[e+1]??"";if(r==='"'){for(o+=r,e++;e<s;){const i=t[e]??"";if(o+=i,i==="\\"){o+=t[e+1]??"",e+=2;continue}if(e++,i==='"')break}continue}if(r==="'"){e++;let i="";for(;e<s;){const a=t[e]??"";if(a==="\\"){const m=t[e+1]??"";m==="'"?i+="'":m==='"'?i+='\\"':i+="\\"+m,e+=2;continue}if(a==="'"){e++;break}a==='"'?i+='\\"':i+=a,e++}o+=`"${i}"`;continue}if(r==="/"&&l==="/"){for(e+=2;e<s&&t[e]!==`
`;)e++;continue}if(r==="/"&&l==="*"){for(e+=2;e<s&&!(t[e]==="*"&&t[e+1]==="/");)e++;e+=2;continue}o+=r,e++}return o=o.replace(/,(\s*[}\]])/g,"$1"),o=o.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g,'$1"$2"$3'),o}function R(){const[t,o]=c.useState("2"),[e,s]=c.useState(!0),r=c.useCallback(l=>{if(!l.trim())return"";const i=j(l);if(!e)return i.trim();let a;try{a=JSON.parse(i)}catch(d){throw new Error(`Could not produce valid JSON: ${d.message}. 禁用“验证和重新格式化”以查看原始剥离输出。`)}if(t==="min")return JSON.stringify(a);const m=t==="tab"?"	":Number(t);return JSON.stringify(a,null,m)},[t,e]);return n.jsx(f,{transform:r,deps:[t,e],inputLabel:"JSONC/JSON5",outputLabel:"JSON",inputPlaceholder:`{
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
}`,downloadName:"output.json",downloadMime:"application/json",options:n.jsxs(n.Fragment,{children:[n.jsx(u,{label:"输出",children:n.jsx(x,{value:t,onValueChange:l=>o(l),children:n.jsxs(b,{children:[n.jsx(p,{value:"2",children:"2 个空格"}),n.jsx(p,{value:"4",children:"4 个空格"}),n.jsx(p,{value:"tab",children:"标签"}),n.jsx(p,{value:"min",children:"缩小"})]})})}),n.jsx(u,{label:"验证并重新格式化",hint:"关闭=原始剥离文本",children:n.jsx("div",{className:"flex h-9 items-center",children:n.jsx(h,{checked:e,onCheckedChange:s})})})]})})}export{R as default};
