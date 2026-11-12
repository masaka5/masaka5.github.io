import{r as m,j as n}from"./toolbox-C1bqIItI.js";import{F as d}from"./panel-BS_kjOg7.js";import{S as y}from"./switch-CtKsE6C3.js";import{S as k,a as j,b,c as E,d as u}from"./select-CybKzMZs.js";import{T as N}from"./text-tool-DKzwReiD.js";import"./ContextIsolator-9GaOU_7w.js";import"./KeyCode-HJ8jGXz0.js";import"./index-DBUEnVox.js";import"./useId-CzaMCTks.js";import"./SearchOutlined-BqroMpgS.js";import"./Overflow-D4e4PvxS.js";import"./useLocale-DuzSycax.js";import"./CloseOutlined-BO7eRoZi.js";import"./useZIndex-Dli3NBiq.js";import"./product-controls-DefmGwRs.js";import"./input-BQFgluN1.js";import"./index-N7Nfcwyv.js";import"./textarea-CvYfK1Ma.js";import"./button-BJ-wrhqh.js";import"./index-83IWjpAP.js";import"./copy-button-iC3vDNu6.js";import"./download-CsFYzBl3.js";import"./copy-Bvbnp1JM.js";import"./createLucideIcon-DrNwtYCa.js";import"./download-button--Rq100iY.js";import"./loader-circle-BOFQCFvQ.js";import"./download-UPZbp2PO.js";import"./error-banner-Drt_r24P.js";import"./upload-DzCXWlB2.js";import"./eraser-DNxZMTKL.js";const S=`<?xml version="1.0" encoding="UTF-8"?>
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
</plist>`;function h(e){const i=[];for(let o=0;o<e.childNodes.length;o++){const t=e.childNodes[o];t&&t.nodeType===1&&i.push(t)}return i}function T(e){const i=globalThis.atob,o=e.replace(/\s+/g,""),t=i(o),r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s)&255;return new TextDecoder().decode(r)}function x(e,i){const o=e.tagName.toLowerCase();switch(o){case"dict":{const t=h(e),r={};let s=0;for(;s<t.length;){const c=t[s];if(!c||c.tagName.toLowerCase()!=="key")throw new Error("<dict>期望交替的<key>和值元素。");const a=t[s+1];if(!a)throw new Error(`<key>${c.textContent??""}</key> has no matching value.`);r[c.textContent??""]=x(a,i),s+=2}return r}case"array":return h(e).map(t=>x(t,i));case"string":return e.textContent??"";case"integer":{const t=(e.textContent??"").trim(),r=Number.parseInt(t,10);if(!Number.isFinite(r))throw new Error(`Invalid <integer>: "${t}".`);return r}case"real":{const t=(e.textContent??"").trim(),r=Number.parseFloat(t);if(!Number.isFinite(r))throw new Error(`Invalid <real>: "${t}".`);return r}case"true":return!0;case"false":return!1;case"date":return(e.textContent??"").trim();case"data":{const t=(e.textContent??"").trim();if(i)try{return T(t)}catch{return t}return t}default:throw new Error(`Unsupported plist element <${o}>.`)}}function st(){const[e,i]=m.useState(!0),[o,t]=m.useState(!1),[r,s]=m.useState("2"),c=m.useCallback(a=>{if(!a.trim())return"";const w=new DOMParser().parseFromString(a,"application/xml"),f=w.querySelector("parsererror");if(f)throw new Error("Invalid XML: "+(f.textContent??"parse error").trim());const l=w.documentElement;if(!l)throw new Error("空文档。");let p;if(l.tagName.toLowerCase()==="plist"?p=h(l)[0]:p=l,!p)throw new Error("在<plist>内找不到值元素。");const g=x(p,o);if(!e)return JSON.stringify(g);const C=r==="tab"?"	":Number(r);return JSON.stringify(g,null,C)},[e,o,r]);return n.jsx(N,{transform:c,deps:[e,o,r],inputLabel:"XML plist",outputLabel:"JSON",inputPlaceholder:"<plist><dict>...</dict></plist>",sample:S,downloadName:"plist.json",downloadMime:"application/json",options:n.jsxs(n.Fragment,{children:[n.jsxs(d,{label:"输出",children:[n.jsx(y,{checked:e,onCheckedChange:i}),n.jsx("span",{className:"text-2xs text-muted-foreground",children:e?"漂亮":"缩小化"})]}),e&&n.jsx(d,{label:"缩进",children:n.jsxs(k,{value:r,onValueChange:a=>s(a),children:[n.jsx(j,{className:"w-[120px]",children:n.jsx(b,{})}),n.jsxs(E,{children:[n.jsx(u,{value:"2",children:"2 个空格"}),n.jsx(u,{value:"4",children:"4 个空格"}),n.jsx(u,{value:"tab",children:"标签"})]})]})}),n.jsx(d,{label:"解码<数据>",hint:"Base64 -> UTF-8 文本",children:n.jsx(y,{checked:o,onCheckedChange:t})})]})})}export{st as default};
