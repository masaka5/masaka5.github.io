import{r as v,j as w}from"./toolbox-CmtkVXqR.js";import{T as E}from"./text-tool-DEvyHdcP.js";import{F as P}from"./panel-DmElCoWv.js";import{S as U}from"./switch-mkCNf92t.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./ContextIsolator-g3C8c1gr.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";import"./KeyCode-HJ8jGXz0.js";const L=`{
  "openapi": "3.0.0",
  "servers": [{ "url": "https://api.example.com/v1" }],
  "paths": {
    "/users/{id}": {
      "get": {
        "operationId": "getUser",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } },
          { "name": "verbose", "in": "query", "schema": { "type": "boolean" } }
        ]
      }
    },
    "/users": {
      "post": {
        "operationId": "createUser",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "age": { "type": "integer" }
                }
              }
            }
          }
        }
      }
    }
  }
}`;function A(n){return"'"+n.replace(/'/g,"'\\''")+"'"}function M(n){const c=n.split(`
`),e=[];for(const m of c){const t=T(m);if(t.trim()==="")continue;const h=t.length-t.trimStart().length;e.push({indent:h,content:t.trim()})}let o=0;function i(m){const t=m.trim();return t===""||t==="null"||t==="~"?null:t==="true"?!0:t==="false"?!1:/^-?\d+$/.test(t)||/^-?\d*\.\d+$/.test(t)?Number(t):t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?t.slice(1,-1):t}function r(m){const t=e[o];if(!t)return null;const h=t.indent;if(h<m)return null;if(t.content.startsWith("- ")||t.content==="-"){const s=[];for(;o<e.length;){const l=e[o];if(!l||l.indent!==h||!(l.content==="-"||l.content.startsWith("- ")))break;const u=l.content==="-"?"":l.content.slice(2);o+=1,u===""?s.push(r(h+1)):u.includes(": ")||u.endsWith(":")?(e.splice(o,0,{indent:h+2,content:u}),s.push(r(h+2))):s.push(i(u))}return s}const y={};for(;o<e.length;){const s=e[o];if(!s||s.indent!==h)break;const l=s.content.indexOf(":");if(l===-1)break;const u=p(s.content.slice(0,l)),g=s.content.slice(l+1).trim();if(o+=1,g===""){const x=e[o];x&&x.indent>h?y[u]=r(x.indent):y[u]=null}else y[u]=i(g)}return y}function p(m){const t=m.trim();return t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?t.slice(1,-1):t}return r(0)}function T(n){let c=!1,e=!1;for(let o=0;o<n.length;o+=1){const i=n[o];if(i==="'"&&!e)c=!c;else if(i==='"'&&!c)e=!e;else if(i==="#"&&!c&&!e){const r=n[o-1];if(o===0||r===" "||r==="	")return n.slice(0,o)}}return n}function f(n){return n&&typeof n=="object"&&!Array.isArray(n)?n:null}function $(n,c){const e=f(n);if(!e||c>5)return"string";if(e.example!==void 0)return e.example;if(Array.isArray(e.enum)&&e.enum.length>0)return e.enum[0]??null;switch(typeof e.type=="string"?e.type:void 0){case"integer":return 0;case"number":return 0;case"boolean":return!0;case"array":return[$(e.items,c+1)];case"object":{const i=f(e.properties),r={};if(i)for(const p of Object.keys(i))r[p]=$(i[p],c+1);return r}case"string":return"string";default:{const i=f(e.properties);if(i){const r={};for(const p of Object.keys(i))r[p]=$(i[p],c+1);return r}return"string"}}}function B(n){const c=$(n,0);return typeof c=="string"?c:String(c)}const F=["get","post","put","patch","delete","head","options"];function ut(){const[n,c]=v.useState(!0);return w.jsx(E,{deps:[n],transform:e=>{const o=e.trim();if(!o)return"";let i;try{i=JSON.parse(o)}catch{try{i=M(o)}catch{throw new Error("输入不是有效的 JSON 或 YAML。")}}const r=f(i);if(!r)throw new Error("文档必须是对象。");let p="";const m=r.servers;if(Array.isArray(m)&&m.length>0){const s=f(m[0]);s&&typeof s.url=="string"&&(p=s.url)}!p&&typeof r.host=="string"&&(p=`${Array.isArray(r.schemes)&&r.schemes[0]==="https"?"https":"http"}://${r.host}${typeof r.basePath=="string"?r.basePath:""}`),p=p.replace(/\/$/,"");const t=f(r.paths);if(!t)throw new Error("没有找到“路径”对象。");const h=n?` \\
  `:" ",y=[];for(const s of Object.keys(t)){const l=f(t[s]);if(l)for(const u of F){const g=f(l[u]);if(!g)continue;const x=typeof g.operationId=="string"?g.operationId:`${u.toUpperCase()} ${s}`,C=[],W=a=>{if(Array.isArray(a))for(const d of a){const b=f(d);b&&C.push(b)}};W(l.parameters),W(g.parameters);let k=s;const S=[],I=[];for(const a of C){const d=typeof a.name=="string"?a.name:"",b=typeof a.in=="string"?a.in:"";if(!d)continue;const O=B(a.schema);b==="path"?k=k.replace(`{${d}}`,encodeURIComponent(O)):b==="query"?a.required===!0&&S.push(`${encodeURIComponent(d)}=${encodeURIComponent(O)}`):b==="header"&&a.required===!0&&I.push([d,O])}const N=p+k+(S.length?"?"+S.join("&"):""),j=["curl"];u!=="get"&&j.push(`-X ${u.toUpperCase()}`),j.push(A(N));for(const[a,d]of I)j.push(`-H ${A(`${a}: ${d}`)}`);const q=f(g.requestBody);if(q){const a=f(q.content),d=a?f(a["application/json"]):null;if(d){const b=$(d.schema,0);j.push(`-H ${A("Content-Type: application/json")}`),j.push(`-d ${A(JSON.stringify(b))}`)}}y.push(`# ${x}
${j.join(h)}`)}}if(y.length===0)throw new Error("在路径下未找到任何操作。");return y.join(`

`)},inputLabel:"OpenAPI (JSON 或 YAML)",outputLabel:"卷曲",sample:L,downloadName:"openapi-curl.sh",downloadMime:"text/plain",options:w.jsx(P,{label:"线路延续",children:w.jsxs("label",{className:"flex h-9 items-center gap-2 text-sm",children:[w.jsx(U,{checked:n,onCheckedChange:c}),n?"多线":"单线"]})})})}export{ut as default};
