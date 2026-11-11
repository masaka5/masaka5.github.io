import{r as p,j as i}from"./toolbox-UanOk967.js";import{T as y}from"./text-tool-Ce2pfWJ7.js";import{F as d}from"./panel-Dz7kmini.js";import{S as f}from"./switch-DPt0k4tg.js";import{I as S}from"./input-C-alCsST.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./check-vTnZeKns.js";import"./createLucideIcon-CjCta3l7.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";import"./index-HQBJxcTJ.js";const b=`{
  "name": "Ada Lovelace",
  "age": 36,
  "email": "ada@example.com",
  "active": true,
  "createdAt": "2024-01-15T08:30:00Z",
  "tags": ["math", "code"],
  "address": { "city": "London", "zip": "EC1" },
  "orders": [
    { "id": 1, "total": 9.99 }
  ],
  "meta": null
}`;function h(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function N(e){return/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(e)}function A(e){return/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(e)}function T(e){return A(e)?e:JSON.stringify(e)}function x(e){switch(typeof e){case"string":return N(e)?"Date":"String";case"boolean":return"Boolean";case"number":return"Number";default:return"mongoose.Schema.Types.Mixed"}}function g(e){return"  ".repeat(e)}function $(e,r,s){const n=g(r+1),m=g(r),o=[];for(const a of Object.keys(e)){const t=e[a];if(t===void 0)continue;const c=T(a);if(t===null){o.push(`${n}${c}: mongoose.Schema.Types.Mixed`);continue}if(h(t)){o.push(`${n}${c}: ${$(t,r+1,s)}`);continue}if(Array.isArray(t)){const l=t[0];l===void 0?o.push(`${n}${c}: [mongoose.Schema.Types.Mixed]`):h(l)?o.push(`${n}${c}: [${$(l,r+1,s)}]`):o.push(`${n}${c}: [${x(l)}]`);continue}const u=x(t);s.required?o.push(`${n}${c}: { type: ${u}, required: true }`):o.push(`${n}${c}: ${u}`)}return`{
${o.join(`,
`)}
${m}}`}function w(e,r){let s;if(h(e))s=e;else if(Array.isArray(e)&&e[0]!==void 0&&h(e[0]))s=e[0];else throw new Error("顶级 JSON 必须是一个对象（或对象数组）才能生成 Mongoose 模式。");const n=$(s,0,r),m=r.timestamps?", { timestamps: true }":"",o=(r.modelName.trim()||"Model").replace(/[^A-Za-z0-9_$]/g,""),a=o.charAt(0).toLowerCase()+o.slice(1)+"Schema",t=[];return t.push("const mongoose = require('mongoose');"),t.push(""),t.push(`const ${a} = new mongoose.Schema(${n}${m});`),t.push(""),r.model?t.push(`module.exports = mongoose.model('${o}', ${a});`):t.push(`module.exports = ${a};`),t.join(`
`)+`
`}function U(){const[e,r]=p.useState(!0),[s,n]=p.useState(!1),[m,o]=p.useState(!0),[a,t]=p.useState("User"),c=p.useCallback(u=>{if(!u.trim())return"";let l;try{l=JSON.parse(u)}catch(j){throw new Error(`Invalid JSON: ${j.message}`)}return w(l,{timestamps:e,required:s,model:m,modelName:a})},[e,s,m,a]);return i.jsx(y,{transform:c,deps:[e,s,m,a],inputLabel:"JSON",outputLabel:"猫鼬模式",inputPlaceholder:"粘贴 JSON 对象...",sample:b,downloadName:"schema.js",downloadMime:"text/javascript",options:i.jsxs(i.Fragment,{children:[i.jsx(d,{label:"型号名称",className:"max-w-[160px]",children:i.jsx(S,{value:a,onChange:u=>t(u.target.value),placeholder:"用户",className:"h-8 font-mono"})}),i.jsx(d,{label:"时间戳：true",children:i.jsx(f,{checked:e,onCheckedChange:r})}),i.jsx(d,{label:"必填：正确",children:i.jsx(f,{checked:s,onCheckedChange:n})}),i.jsx(d,{label:"model() 包装器",children:i.jsx(f,{checked:m,onCheckedChange:o})})]})})}export{U as default};
