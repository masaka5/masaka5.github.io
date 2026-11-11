import{r as p,j as t}from"./toolbox-V8Mb6zl3.js";import{T}from"./text-tool-BNJ1nLL1.js";import{F as m}from"./panel-BVEEuXxF.js";import{I as x}from"./input-oXBawGgZ.js";import{T as b}from"./textarea-DS_6qMYC.js";import"./button-yaYS2cEr.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";const O=`query GetUser($id: ID!) {
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
