import{r as f,j as o}from"./toolbox-BAFlSbAu.js";import{u as c}from"./use-view-state-Buv1JcBh.js";import{F as u}from"./panel-Bqi8iGiy.js";import{T as h}from"./text-tool-DJbu6FIk.js";import{S as x}from"./switch-D_tqQ3u1.js";import{T as j,a as b,b as p}from"./tabs-4oc-BJj3.js";import"./product-controls-B1-Khcjt.js";import"./input-z_zqgJn8.js";import"./index-CLt5N8Xt.js";import"./ContextIsolator-DC_hgRVI.js";import"./SearchOutlined-avAJ2sSo.js";import"./textarea-a9bFzmkv.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./useId-CQJPC48K.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";import"./KeyCode-HJ8jGXz0.js";import"./CloseOutlined-DTTOE6cy.js";import"./index-CrsyJUrn.js";import"./Overflow-CXeRYAeu.js";function g(e){let n="",t=0;const s=e.length;for(;t<s;){const r=e[t]??"",l=e[t+1]??"";if(r==='"'){for(n+=r,t++;t<s;){const i=e[t]??"";if(n+=i,i==="\\"){n+=e[t+1]??"",t+=2;continue}if(t++,i==='"')break}continue}if(r==="'"){t++;let i="";for(;t<s;){const a=e[t]??"";if(a==="\\"){const m=e[t+1]??"";m==="'"?i+="'":m==='"'?i+='\\"':i+="\\"+m,t+=2;continue}if(a==="'"){t++;break}a==='"'?i+='\\"':i+=a,t++}n+=`"${i}"`;continue}if(r==="/"&&l==="/"){for(t+=2;t<s&&e[t]!==`
`;)t++;continue}if(r==="/"&&l==="*"){for(t+=2;t<s&&!(e[t]==="*"&&e[t+1]==="/");)t++;t+=2;continue}n+=r,t++}return n=n.replace(/,(\s*[}\]])/g,"$1"),n=n.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g,'$1"$2"$3'),n}function Q(){const[e,n]=c("tools/data/jsonc-to-json/ui.tsx:indent","2"),[t,s]=c("tools/data/jsonc-to-json/ui.tsx:validate",!0),r=f.useCallback(l=>{if(!l.trim())return"";const i=g(l);if(!t)return i.trim();let a;try{a=JSON.parse(i)}catch(d){throw new Error(`Could not produce valid JSON: ${d.message}. 禁用“验证和重新格式化”以查看原始剥离输出。`)}if(e==="min")return JSON.stringify(a);const m=e==="tab"?"	":Number(e);return JSON.stringify(a,null,m)},[e,t]);return o.jsx(h,{transform:r,deps:[e,t],inputLabel:"JSONC/JSON5",outputLabel:"JSON",inputPlaceholder:`{
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
}`,downloadName:"output.json",downloadMime:"application/json",options:o.jsxs(o.Fragment,{children:[o.jsx(u,{label:"输出",children:o.jsx(j,{value:e,onValueChange:l=>n(l),children:o.jsxs(b,{children:[o.jsx(p,{value:"2",children:"2 个空格"}),o.jsx(p,{value:"4",children:"4 个空格"}),o.jsx(p,{value:"tab",children:"标签"}),o.jsx(p,{value:"min",children:"缩小"})]})})}),o.jsx(u,{label:"验证并重新格式化",hint:"关闭=原始剥离文本",children:o.jsx("div",{className:"flex h-9 items-center",children:o.jsx(x,{checked:t,onCheckedChange:s})})})]})})}export{Q as default};
