import{r as m,j as c}from"./toolbox-CmtkVXqR.js";import{T as p}from"./text-tool-DEvyHdcP.js";import"./product-controls-DM7ptYUH.js";import"./input-CQci13IV.js";import"./index-IMt1bn3i.js";import"./ContextIsolator-g3C8c1gr.js";import"./panel-DmElCoWv.js";import"./SearchOutlined-DekVZon5.js";import"./textarea-Cln-1zVs.js";import"./button-DMB0_Npy.js";import"./index-PE_KQwEV.js";import"./useId-Chs6QaAi.js";import"./copy-button-DLB5uroU.js";import"./download-CsFYzBl3.js";import"./copy-KM4IFqMu.js";import"./createLucideIcon-Zlr8o_Qc.js";import"./download-button-DYrLfnR0.js";import"./loader-circle-BvKtin14.js";import"./download-CNg6ERs9.js";import"./error-banner-DTT8smgf.js";import"./upload-w5Rxedod.js";import"./eraser-BA6fzkmk.js";function u(r){const e=/at position (\d+)/i.exec(r);if(e&&e[1]!==void 0){const t=Number(e[1]);if(Number.isFinite(t))return t}return null}function f(r){const e=/line (\d+) column (\d+)/i.exec(r);if(e&&e[1]!==void 0&&e[2]!==void 0){const t=Number(e[1]),n=Number(e[2]);if(Number.isFinite(t)&&Number.isFinite(n))return{line:t,column:n}}return null}function d(r,e){let t=1,n=1;const i=Math.min(e,r.length);for(let o=0;o<i;o++)r[o]===`
`?(t++,n=1):n++;return{line:t,column:n}}function $(r,e,t){const i=r.split(`
`)[e-1];if(i===void 0)return"";const o=`${" ".repeat(Math.max(0,t-1))}^`;return`

  ${i}
  ${o}`}function R(){const r=m.useCallback(e=>{if(!e.trim())return"";try{const t=JSON.parse(e);return`Valid JSON ✓

Root type: ${Array.isArray(t)?`array (${t.length} item${t.length===1?"":"s"})`:t===null?"null":typeof t=="object"?`object (${Object.keys(t).length} key${Object.keys(t).length===1?"":"s"})`:typeof t}`}catch(t){const n=t instanceof Error?t.message:String(t);let i=null,o=null;const s=u(n);if(s!==null){const l=d(e,s);i=l.line,o=l.column}else{const l=f(n);l&&(i=l.line,o=l.column)}const a=n.replace(/\s*at position \d+.*$/i,"").replace(/\s*in JSON at.*$/i,"").replace(/^JSON\.parse:\s*/i,"").trim();if(i!==null&&o!==null){const l=`line ${i}, column ${o}`;throw new Error(`Invalid JSON at ${l}: ${a}${$(e,i,o)}`)}throw new Error(`Invalid JSON: ${a||n}`)}},[]);return c.jsx(p,{transform:r,inputLabel:"JSON",outputLabel:"结果",inputPlaceholder:'{"name": "value"}',sample:`{
  "name": "Ada",
  "age": 36,
  "skills": ["math", "code"]
}`,downloadName:"validation.txt"})}export{R as default};
