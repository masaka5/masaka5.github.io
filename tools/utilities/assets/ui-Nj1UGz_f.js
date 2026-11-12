import{r as p,j as t}from"./toolbox-BAFlSbAu.js";import{T}from"./text-tool-DJbu6FIk.js";import{F as m}from"./panel-Bqi8iGiy.js";import{I as x}from"./input-z_zqgJn8.js";import{T as b}from"./textarea-a9bFzmkv.js";import"./use-view-state-Buv1JcBh.js";import"./product-controls-B1-Khcjt.js";import"./button-BucYEMq7.js";import"./index-BtnVBoHo.js";import"./ContextIsolator-DC_hgRVI.js";import"./useId-CQJPC48K.js";import"./SearchOutlined-avAJ2sSo.js";import"./copy-button-DibWWTQ8.js";import"./download-CsFYzBl3.js";import"./copy-Cnia4tn_.js";import"./createLucideIcon-D8fibnX9.js";import"./download-button-B6GEzIgs.js";import"./loader-circle-7RTOfogF.js";import"./download-DPmKNylC.js";import"./error-banner-K0cVVdwR.js";import"./upload-DbNze1mN.js";import"./eraser-9fZjLLdy.js";import"./index-CLt5N8Xt.js";const O=`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`;function i(r){return"'"+r.replace(/'/g,"'\\''")+"'"}function K(){const[r,g]=p.useState("https://api.example.com/graphql"),[a,j]=p.useState('{ "id": "42" }'),[n,S]=p.useState("");return t.jsx(T,{deps:[r,a,n],transform:e=>{const c=e.trim();if(!c)return"";let s;const u=a.trim();if(u)try{s=JSON.parse(u)}catch{throw new Error("变量必须是有效的 JSON（或留空）。")}const h=r.trim()||"https://api.example.com/graphql",l={query:c};s!==void 0&&(l.variables=s);const y=JSON.stringify(l),d=["  -H "+i("Content-Type: application/json")],o=n.trim();o&&d.push("  -H "+i("Authorization: "+o));const v=["curl -X POST "+i(h)+" \\",d.join(` \\
`)+" \\","  -d "+i(y)].join(`
`),f={"Content-Type":"application/json"};o&&(f.Authorization=o);const N=["const res = await fetch("+JSON.stringify(h)+", {",'  method: "POST",',"  headers: "+JSON.stringify(f,null,2).replace(/\n/g,`
  `)+",","  body: JSON.stringify("+JSON.stringify(l,null,2).replace(/\n/g,`
  `)+"),","});","const data = await res.json();"].join(`
`);return v+`

# --- equivalent fetch() ---

`+N},inputLabel:"GraphQL查询",outputLabel:"cURL + fetch()",sample:O,downloadName:"graphql.sh",downloadMime:"text/plain",options:t.jsxs(t.Fragment,{children:[t.jsx(m,{label:"端点URL",className:"min-w-[260px] flex-1",children:t.jsx(x,{value:r,onChange:e=>g(e.target.value)})}),t.jsx(m,{label:"授权标头",className:"min-w-[220px] flex-1",children:t.jsx(x,{value:n,onChange:e=>S(e.target.value),placeholder:"持有者眼睛…"})}),t.jsx(m,{label:"变量（JSON）",className:"min-w-[260px] flex-1",children:t.jsx(b,{value:a,onChange:e=>j(e.target.value),spellCheck:!1,className:"h-16 font-mono text-xs"})})]})})}export{K as default};
