import{r as c,j as o}from"./toolbox-C1bqIItI.js";import{F as u}from"./panel-BS_kjOg7.js";import{T as f}from"./text-tool-DKzwReiD.js";import{S as h}from"./switch-CtKsE6C3.js";import{T as x,a as b,b as p}from"./tabs-BR_HzUSj.js";import"./product-controls-DefmGwRs.js";import"./input-BQFgluN1.js";import"./index-N7Nfcwyv.js";import"./ContextIsolator-9GaOU_7w.js";import"./SearchOutlined-BqroMpgS.js";import"./textarea-CvYfK1Ma.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./useId-CzaMCTks.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";import"./KeyCode-HJ8jGXz0.js";import"./CloseOutlined-BO7eRoZi.js";import"./index-DBUEnVox.js";import"./Overflow-D4e4PvxS.js";function j(t){let n="",e=0;const s=t.length;for(;e<s;){const r=t[e]??"",l=t[e+1]??"";if(r==='"'){for(n+=r,e++;e<s;){const i=t[e]??"";if(n+=i,i==="\\"){n+=t[e+1]??"",e+=2;continue}if(e++,i==='"')break}continue}if(r==="'"){e++;let i="";for(;e<s;){const a=t[e]??"";if(a==="\\"){const m=t[e+1]??"";m==="'"?i+="'":m==='"'?i+='\\"':i+="\\"+m,e+=2;continue}if(a==="'"){e++;break}a==='"'?i+='\\"':i+=a,e++}n+=`"${i}"`;continue}if(r==="/"&&l==="/"){for(e+=2;e<s&&t[e]!==`
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
