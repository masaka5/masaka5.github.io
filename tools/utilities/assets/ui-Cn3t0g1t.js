import{r as w,j as A}from"./toolbox-X2JQkZJS.js";import{T}from"./text-tool-CVfCwMif.js";import"./product-controls-DKzw6tMZ.js";import"./input-Cj95RvLc.js";import"./index-pWcJ1Cs1.js";import"./ContextIsolator-YulytHJS.js";import"./panel-Bb9jn6HH.js";import"./SearchOutlined-CdtN4l1l.js";import"./textarea-oe737Ggj.js";import"./button-CeEuRYIw.js";import"./index-C21-gvg0.js";import"./useId-Cj6lUCMN.js";import"./copy-button-DO3bAtEE.js";import"./download-CsFYzBl3.js";import"./copy-CY3PqBfC.js";import"./createLucideIcon-DJgYpyeu.js";import"./download-button-B9QZroUH.js";import"./loader-circle-CLChOL1W.js";import"./download-DLltbPP4.js";import"./error-banner-CGlnGBX1.js";import"./upload-_exd0wa4.js";import"./eraser-CTbvRWqk.js";const y=`<h1>Hello World</h1>
<p>A short <strong>demo</strong> of <em>HTML</em> with a <a href="https://example.com">link</a> and <code>inline code</code>.</p>
<h2>Features</h2>
<ul>
  <li>Lists</li>
  <li><strong>Bold</strong> and <em>italic</em></li>
</ul>
<ol>
  <li>First</li>
  <li>Second</li>
</ol>
<blockquote>A blockquote.</blockquote>
<pre><code>const x = 1;
console.log(x);</code></pre>
<img src="https://example.com/img.png" alt="alt text" />`;function g(a){return a.replace(/\s+/g," ")}function d(a,h){if(a.nodeType===Node.TEXT_NODE)return g(a.textContent??"");if(a.nodeType!==Node.ELEMENT_NODE)return"";const e=a,i=e.tagName.toLowerCase(),n=t=>Array.from(e.childNodes).map(o=>d(o)).join("");switch(i){case"h1":case"h2":case"h3":case"h4":case"h5":case"h6":{const t=Number(i.slice(1));return`

${"#".repeat(t)} ${n().trim()}

`}case"p":return`

${n().trim()}

`;case"br":return`  
`;case"hr":return`

---

`;case"strong":case"b":{const t=n().trim();return t?`**${t}**`:""}case"em":case"i":{const t=n().trim();return t?`*${t}*`:""}case"del":case"s":case"strike":{const t=n().trim();return t?`~~${t}~~`:""}case"code":return e.parentElement&&e.parentElement.tagName.toLowerCase()==="pre"?e.textContent??"":`\`${e.textContent??""}\``;case"pre":{const t=e.querySelector("code"),o=(t?t.textContent:e.textContent)??"",r=t?.className.match(/language-([\w-]+)/);return`

\`\`\`${r?r[1]??"":""}
${o.replace(/\n$/,"")}
\`\`\`

`}case"a":{const t=e.getAttribute("href")??"",o=e.getAttribute("title"),r=n().trim()||t,s=o?` "${o}"`:"";return t?`[${r}](${t}${s})`:r}case"img":{const t=e.getAttribute("src")??"",o=e.getAttribute("alt")??"",r=e.getAttribute("title"),s=r?` "${r}"`:"";return`![${o}](${t}${s})`}case"blockquote":return`

${n().trim().split(`
`).map(r=>r.trim()===""?">":`> ${r}`).join(`
`)}

`;case"ul":case"ol":{const t=i==="ol",o=Array.from(e.children).filter(c=>c.tagName.toLowerCase()==="li"),r=e.getAttribute("start");let s=t&&r?Number(r):1;return Number.isFinite(s)||(s=1),`

${o.map((c,p)=>{const u=t?`${s+p}.`:"-",f=Array.from(c.childNodes).map(l=>d(l)).join("").trim(),$=" ".repeat(u.length+1),b=f.split(`
`).map((l,x)=>x===0||l===""?l:$+l).join(`
`);return`${u} ${b}`}).join(`
`)}

`}case"li":return n();case"table":{const t=Array.from(e.querySelectorAll("tr"));if(t.length===0)return"";const o=c=>g(d(c).trim()).replace(/\|/g,"\\|"),r=t[0];if(!r)return"";const s=Array.from(r.children).map(o),m=[];m.push(`| ${s.join(" | ")} |`),m.push(`| ${s.map(()=>"---").join(" | ")} |`);for(let c=1;c<t.length;c++){const p=t[c];if(!p)continue;const u=Array.from(p.children).map(o);m.push(`| ${u.join(" | ")} |`)}return`

${m.join(`
`)}

`}case"script":case"style":case"head":return"";case"span":case"div":case"section":case"article":case"main":case"body":case"html":default:{const t=n();return new Set(["div","section","article","main"]).has(i)?`
${t}
`:t}}}function I(){const a=w.useCallback(h=>{if(!h.trim())return"";if(typeof DOMParser>"u")throw new Error("DOMParser在此环境中不可用。");const i=new DOMParser().parseFromString(h,"text/html").body;if(!i)throw new Error("无法解析 HTML。");let n=d(i);return n=n.replace(/\n{3,}/g,`

`).trim(),n},[]);return A.jsx(T,{transform:a,inputLabel:"HTML",outputLabel:"降价",inputPlaceholder:"粘贴 HTML...",sample:y,downloadName:"output.md",downloadMime:"text/markdown"})}export{I as default};
