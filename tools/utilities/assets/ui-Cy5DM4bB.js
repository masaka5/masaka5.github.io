import{r as p,j as t}from"./toolbox-CmtkVXqR.js";import{T}from"./text-tool-DEvyHdcP.js";import{F as m}from"./panel-DmElCoWv.js";import{I as x}from"./input-CQci13IV.js";import{T as b}from"./textarea-Cln-1zVs.js";import"./product-controls-DM7ptYUH.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./ContextIsolator-g3C8c1gr.js";import"./useId-Chs6QaAi.js";import"./SearchOutlined-DekVZon5.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";import"./index-IMt1bn3i.js";const O=`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`;function a(r){return"'"+r.replace(/'/g,"'\\''")+"'"}function B(){const[r,g]=p.useState("https://api.example.com/graphql"),[i,j]=p.useState('{ "id": "42" }'),[n,S]=p.useState("");return t.jsx(T,{deps:[r,i,n],transform:e=>{const c=e.trim();if(!c)return"";let s;const u=i.trim();if(u)try{s=JSON.parse(u)}catch{throw new Error("变量必须是有效的 JSON（或留空）。")}const h=r.trim()||"https://api.example.com/graphql",l={query:c};s!==void 0&&(l.variables=s);const y=JSON.stringify(l),d=["  -H "+a("Content-Type: application/json")],o=n.trim();o&&d.push("  -H "+a("Authorization: "+o));const v=["curl -X POST "+a(h)+" \\",d.join(` \\
`)+" \\","  -d "+a(y)].join(`
`),f={"Content-Type":"application/json"};o&&(f.Authorization=o);const N=["const res = await fetch("+JSON.stringify(h)+", {",'  method: "POST",',"  headers: "+JSON.stringify(f,null,2).replace(/\n/g,`
  `)+",","  body: JSON.stringify("+JSON.stringify(l,null,2).replace(/\n/g,`
  `)+"),","});","const data = await res.json();"].join(`
`);return v+`

# --- equivalent fetch() ---

`+N},inputLabel:"GraphQL查询",outputLabel:"cURL + fetch()",sample:O,downloadName:"graphql.sh",downloadMime:"text/plain",options:t.jsxs(t.Fragment,{children:[t.jsx(m,{label:"端点URL",className:"min-w-[260px] flex-1",children:t.jsx(x,{value:r,onChange:e=>g(e.target.value)})}),t.jsx(m,{label:"授权标头",className:"min-w-[220px] flex-1",children:t.jsx(x,{value:n,onChange:e=>S(e.target.value),placeholder:"持有者眼睛…"})}),t.jsx(m,{label:"变量（JSON）",className:"min-w-[260px] flex-1",children:t.jsx(b,{value:i,onChange:e=>j(e.target.value),spellCheck:!1,className:"h-16 font-mono text-xs"})})]})})}export{B as default};
