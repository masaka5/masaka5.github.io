import{r as m,j as n}from"./toolbox-UanOk967.js";import{F as d}from"./panel-Dz7kmini.js";import{S as y}from"./switch-DPt0k4tg.js";import{S as k,a as j,b,c as E,d as u}from"./select-Bqhypqt4.js";import{T as N}from"./text-tool-Ce2pfWJ7.js";import"./index-HQBJxcTJ.js";import"./index-D17hSi50.js";import"./index-DiK7AOdK.js";import"./index-C-pHolA0.js";import"./index-Bp6S2Opf.js";import"./chevron-down-Yc_stEQ5.js";import"./createLucideIcon-CjCta3l7.js";import"./check-vTnZeKns.js";import"./button-UgOWl7Pw.js";import"./textarea-DTeVqXwx.js";import"./copy-button-CGwm1B35.js";import"./download-CsFYzBl3.js";import"./copy-DxHSqCOf.js";import"./download-button-CbvgAgfz.js";import"./loader-circle-DV99eh3f.js";import"./download-B_QuDumz.js";import"./error-banner-DenKuSgQ.js";import"./upload-GKSPvyMH.js";import"./eraser-BuPGOxvy.js";const S=`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Name</key>
  <string>Sample App</string>
  <key>Version</key>
  <integer>3</integer>
  <key>Ratio</key>
  <real>1.5</real>
  <key>Enabled</key>
  <true/>
  <key>Tags</key>
  <array>
    <string>fast</string>
    <string>free</string>
  </array>
  <key>Created</key>
  <date>2024-01-15T08:30:00Z</date>
</dict>
</plist>`;function h(t){const a=[];for(let o=0;o<t.childNodes.length;o++){const e=t.childNodes[o];e&&e.nodeType===1&&a.push(e)}return a}function T(t){const a=globalThis.atob,o=t.replace(/\s+/g,""),e=a(o),r=new Uint8Array(e.length);for(let s=0;s<e.length;s++)r[s]=e.charCodeAt(s)&255;return new TextDecoder().decode(r)}function x(t,a){const o=t.tagName.toLowerCase();switch(o){case"dict":{const e=h(t),r={};let s=0;for(;s<e.length;){const c=e[s];if(!c||c.tagName.toLowerCase()!=="key")throw new Error("<dict>期望交替的<key>和值元素。");const i=e[s+1];if(!i)throw new Error(`<key>${c.textContent??""}</key> has no matching value.`);r[c.textContent??""]=x(i,a),s+=2}return r}case"array":return h(t).map(e=>x(e,a));case"string":return t.textContent??"";case"integer":{const e=(t.textContent??"").trim(),r=Number.parseInt(e,10);if(!Number.isFinite(r))throw new Error(`Invalid <integer>: "${e}".`);return r}case"real":{const e=(t.textContent??"").trim(),r=Number.parseFloat(e);if(!Number.isFinite(r))throw new Error(`Invalid <real>: "${e}".`);return r}case"true":return!0;case"false":return!1;case"date":return(t.textContent??"").trim();case"data":{const e=(t.textContent??"").trim();if(a)try{return T(e)}catch{return e}return e}default:throw new Error(`Unsupported plist element <${o}>.`)}}function _(){const[t,a]=m.useState(!0),[o,e]=m.useState(!1),[r,s]=m.useState("2"),c=m.useCallback(i=>{if(!i.trim())return"";const w=new DOMParser().parseFromString(i,"application/xml"),f=w.querySelector("parsererror");if(f)throw new Error("Invalid XML: "+(f.textContent??"parse error").trim());const l=w.documentElement;if(!l)throw new Error("空文档。");let p;if(l.tagName.toLowerCase()==="plist"?p=h(l)[0]:p=l,!p)throw new Error("在<plist>内找不到值元素。");const g=x(p,o);if(!t)return JSON.stringify(g);const C=r==="tab"?"	":Number(r);return JSON.stringify(g,null,C)},[t,o,r]);return n.jsx(N,{transform:c,deps:[t,o,r],inputLabel:"XML plist",outputLabel:"JSON",inputPlaceholder:"<plist><dict>...</dict></plist>",sample:S,downloadName:"plist.json",downloadMime:"application/json",options:n.jsxs(n.Fragment,{children:[n.jsxs(d,{label:"输出",children:[n.jsx(y,{checked:t,onCheckedChange:a}),n.jsx("span",{className:"text-2xs text-muted-foreground",children:t?"漂亮":"缩小化"})]}),t&&n.jsx(d,{label:"缩进",children:n.jsxs(k,{value:r,onValueChange:i=>s(i),children:[n.jsx(j,{className:"w-[120px]",children:n.jsx(b,{})}),n.jsxs(E,{children:[n.jsx(u,{value:"2",children:"2 个空格"}),n.jsx(u,{value:"4",children:"4 个空格"}),n.jsx(u,{value:"tab",children:"标签"})]})]})}),n.jsx(d,{label:"解码<数据>",hint:"Base64 -> UTF-8 文本",children:n.jsx(y,{checked:o,onCheckedChange:e})})]})})}export{_ as default};
