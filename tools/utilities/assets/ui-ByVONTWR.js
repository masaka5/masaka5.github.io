import{r as y,j as d}from"./toolbox-UanOk967.js";import{T as O}from"./text-tool-Ce2pfWJ7.js";import"./button-UgOWl7Pw.js";import"./panel-Dz7kmini.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";const T=`{
  "title": "Example",
  "owner": { "name": "Alice", "active": true },
  "ports": [8000, 8001],
  "servers": [
    { "host": "alpha", "port": 1 },
    { "host": "beta", "port": 2 }
  ]
}`;function s(t){return typeof t=="object"&&t!==null&&!Array.isArray(t)}function l(t){return Array.isArray(t)&&t.length>0&&t.every(o=>s(o))}function c(t){return/^[A-Za-z0-9_-]+$/.test(t)?t:JSON.stringify(t)}function g(t){return JSON.stringify(t)}function w(t){if(t===null)throw new Error("TOML没有空类型；在转换之前删除空值。");switch(typeof t){case"string":return g(t);case"boolean":return t?"true":"false";case"number":if(!Number.isFinite(t))throw new Error("TOML不能表示无穷大或NaN。");return String(t);default:throw new Error("不支持的标量类型。")}}function u(t){if(Array.isArray(t))return`[${t.map(o=>u(o)).join(", ")}]`;if(s(t)){const o=[];for(const r of Object.keys(t)){const i=t[r];i!==void 0&&o.push(`${c(r)} = ${u(i)}`)}return`{ ${o.join(", ")} }`}return w(t)}function f(t,o,r){const i=[],p=[],m=[];for(const e of Object.keys(t)){const n=t[e];n!==void 0&&(s(n)?p.push(e):l(n)?m.push(e):i.push(e))}for(const e of i){const n=t[e];if(n===void 0)continue;const a=u(n);r.push(`${c(e)} = ${a}`)}for(const e of p){const n=t[e];if(n===void 0||!s(n))continue;const a=[...o,e];r.length>0&&r[r.length-1]!==""&&r.push(""),r.push(`[${a.map(c).join(".")}]`),f(n,a,r)}for(const e of m){const n=t[e];if(n===void 0||!l(n))continue;const a=[...o,e];for(const h of n)r.length>0&&r[r.length-1]!==""&&r.push(""),r.push(`[[${a.map(c).join(".")}]]`),f(h,a,r)}}function b(t){if(!s(t))throw new Error("顶级 JSON 必须是要转换为 TOML 的对象。");const o=[];return f(t,[],o),o.join(`
`).replace(/\n{3,}/g,`

`).trim()+(o.length?`
`:"")}function F(){const t=y.useCallback(o=>{if(!o.trim())return"";let r;try{r=JSON.parse(o)}catch(i){throw new Error(`Invalid JSON: ${i.message}`)}return b(r)},[]);return d.jsx(O,{transform:t,inputLabel:"JSON",outputLabel:"TOML",inputPlaceholder:"粘贴 JSON 对象...",sample:T,downloadName:"config.toml",downloadMime:"application/toml"})}export{F as default};
