import{r as p,j as t}from"./toolbox-UanOk967.js";import{T}from"./text-tool-Ce2pfWJ7.js";import{F as m}from"./panel-Dz7kmini.js";import{I as x}from"./input-C-alCsST.js";import{T as b}from"./textarea-DTeVqXwx.js";import"./button-UgOWl7Pw.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";const O=`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`;function a(r){return"'"+r.replace(/'/g,"'\\''")+"'"}function $(){const[r,g]=p.useState("https://api.example.com/graphql"),[n,j]=p.useState('{ "id": "42" }'),[i,S]=p.useState("");return t.jsx(T,{deps:[r,n,i],transform:e=>{const c=e.trim();if(!c)return"";let s;const u=n.trim();if(u)try{s=JSON.parse(u)}catch{throw new Error("变量必须是有效的 JSON（或留空）。")}const h=r.trim()||"https://api.example.com/graphql",l={query:c};s!==void 0&&(l.variables=s);const y=JSON.stringify(l),d=["  -H "+a("Content-Type: application/json")],o=i.trim();o&&d.push("  -H "+a("Authorization: "+o));const v=["curl -X POST "+a(h)+" \\",d.join(` \\
`)+" \\","  -d "+a(y)].join(`
`),f={"Content-Type":"application/json"};o&&(f.Authorization=o);const N=["const res = await fetch("+JSON.stringify(h)+", {",'  method: "POST",',"  headers: "+JSON.stringify(f,null,2).replace(/\n/g,`
  `)+",","  body: JSON.stringify("+JSON.stringify(l,null,2).replace(/\n/g,`
  `)+"),","});","const data = await res.json();"].join(`
`);return v+`

# --- equivalent fetch() ---

`+N},inputLabel:"GraphQL查询",outputLabel:"cURL + fetch()",sample:O,downloadName:"graphql.sh",downloadMime:"text/plain",options:t.jsxs(t.Fragment,{children:[t.jsx(m,{label:"端点URL",className:"min-w-[260px] flex-1",children:t.jsx(x,{value:r,onChange:e=>g(e.target.value)})}),t.jsx(m,{label:"授权标头",className:"min-w-[220px] flex-1",children:t.jsx(x,{value:i,onChange:e=>S(e.target.value),placeholder:"持有者眼睛…"})}),t.jsx(m,{label:"变量（JSON）",className:"min-w-[260px] flex-1",children:t.jsx(b,{value:n,onChange:e=>j(e.target.value),spellCheck:!1,className:"h-16 font-mono text-xs"})})]})})}export{$ as default};
