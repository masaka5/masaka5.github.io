import{r,j as e}from"./toolbox-V8Mb6zl3.js";import{F as f}from"./panel-BVEEuXxF.js";import{T as k}from"./text-tool-BNJ1nLL1.js";import{C as g}from"./checkbox-9j-WWg9-.js";import"./button-yaYS2cEr.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";import"./index-B5fXPDQ_.js";import"./index-C-nIdkMn.js";const y=`apple
apple
banana
banana
banana
cherry
apple
apple`;function I(){const[l,j]=r.useState(!1),[o,C]=r.useState(!1),[n,c]=r.useState("all"),b=r.useCallback(a=>{if(!a)return"";const p=a.replace(/\r\n?/g,`
`).split(`
`),u=t=>l?t.toLowerCase():t,s=[];for(const t of p){const m=s[s.length-1];m!==void 0&&u(m.line)===u(t)?m.count+=1:s.push({line:t,count:1})}let i;n==="repeated"?i=s.filter(t=>t.count>1):n==="unique"?i=s.filter(t=>t.count===1):i=s;const x=i.map(t=>o?`${String(t.count).padStart(7," ")} ${t.line}`:t.line).join(`
`),d=p.length-s.length,h=`# ${p.length} lines → ${s.length} runs (${d} duplicate line${d===1?"":"s"} collapsed)`;return x===""?h:`${x}

${h}`},[l,o,n]);return e.jsx(k,{transform:b,deps:[l,o,n],inputLabel:"线",outputLabel:"倒塌",sample:y,downloadName:"uniq.txt",options:e.jsxs(e.Fragment,{children:[e.jsx(f,{label:"显示",children:e.jsxs("div",{className:"flex h-8 items-center gap-3",children:[e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx("input",{type:"radio",name:"显示",checked:n==="all",onChange:()=>c("all")}),"全部"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx("input",{type:"radio",name:"显示",checked:n==="repeated",onChange:()=>c("repeated")}),"仅重复"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx("input",{type:"radio",name:"显示",checked:n==="unique",onChange:()=>c("unique")}),"唯一唯一"]})]})}),e.jsx(f,{label:"选项",children:e.jsxs("div",{className:"flex h-8 items-center gap-3",children:[e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(g,{checked:l,onCheckedChange:a=>j(a===!0)})," ","忽略大小写"]}),e.jsxs("label",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx(g,{checked:o,onCheckedChange:a=>C(a===!0)})," ","前缀计数（uniq -c）"]})]})})]})})}export{I as default};
