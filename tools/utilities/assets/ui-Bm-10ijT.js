import{r as w,j as A}from"./toolbox-V8Mb6zl3.js";import{T}from"./text-tool-BNJ1nLL1.js";import"./button-yaYS2cEr.js";import"./panel-BVEEuXxF.js";import"./textarea-DS_6qMYC.js";import"./copy-button-fBYmOqAm.js";import"./download-CsFYzBl3.js";import"./check-BojDDYCk.js";import"./createLucideIcon-CafGK0QX.js";import"./copy-CqpKjZ2k.js";import"./download-button-zTRTit45.js";import"./loader-circle-CLWSKXpK.js";import"./download-B6F43DuY.js";import"./error-banner-Bc4B1z3u.js";import"./upload-Bfq75gxE.js";import"./eraser-B_sdRlX8.js";const y=`<h1>Hello World</h1>
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
<img src="https://example.com/img.png" alt="alt text" />`;function g(a){return a.replace(/\s+/g," ")}function d(a,h){if(a.nodeType===Node.TEXT_NODE)return g(a.textContent??"");if(a.nodeType!==Node.ELEMENT_NODE)return"";const e=a,i=e.tagName.toLowerCase(),o=t=>Array.from(e.childNodes).map(n=>d(n)).join("");switch(i){case"h1":case"h2":case"h3":case"h4":case"h5":case"h6":{const t=Number(i.slice(1));return`

${"#".repeat(t)} ${o().trim()}

`}case"p":return`

${o().trim()}

`;case"br":return`  
`;case"hr":return`

---

`;case"strong":case"b":{const t=o().trim();return t?`**${t}**`:""}case"em":case"i":{const t=o().trim();return t?`*${t}*`:""}case"del":case"s":case"strike":{const t=o().trim();return t?`~~${t}~~`:""}case"code":return e.parentElement&&e.parentElement.tagName.toLowerCase()==="pre"?e.textContent??"":`\`${e.textContent??""}\``;case"pre":{const t=e.querySelector("code"),n=(t?t.textContent:e.textContent)??"",r=t?.className.match(/language-([\w-]+)/);return`

\`\`\`${r?r[1]??"":""}
${n.replace(/\n$/,"")}
\`\`\`

`}case"a":{const t=e.getAttribute("href")??"",n=e.getAttribute("title"),r=o().trim()||t,s=n?` "${n}"`:"";return t?`[${r}](${t}${s})`:r}case"img":{const t=e.getAttribute("src")??"",n=e.getAttribute("alt")??"",r=e.getAttribute("title"),s=r?` "${r}"`:"";return`![${n}](${t}${s})`}case"blockquote":return`

${o().trim().split(`
`).map(r=>r.trim()===""?">":`> ${r}`).join(`
`)}

`;case"ul":case"ol":{const t=i==="ol",n=Array.from(e.children).filter(c=>c.tagName.toLowerCase()==="li"),r=e.getAttribute("start");let s=t&&r?Number(r):1;return Number.isFinite(s)||(s=1),`

${n.map((c,u)=>{const p=t?`${s+u}.`:"-",f=Array.from(c.childNodes).map(l=>d(l)).join("").trim(),$=" ".repeat(p.length+1),b=f.split(`
`).map((l,x)=>x===0||l===""?l:$+l).join(`
`);return`${p} ${b}`}).join(`
`)}

`}case"li":return o();case"table":{const t=Array.from(e.querySelectorAll("tr"));if(t.length===0)return"";const n=c=>g(d(c).trim()).replace(/\|/g,"\\|"),r=t[0];if(!r)return"";const s=Array.from(r.children).map(n),m=[];m.push(`| ${s.join(" | ")} |`),m.push(`| ${s.map(()=>"---").join(" | ")} |`);for(let c=1;c<t.length;c++){const u=t[c];if(!u)continue;const p=Array.from(u.children).map(n);m.push(`| ${p.join(" | ")} |`)}return`

${m.join(`
`)}

`}case"script":case"style":case"head":return"";case"span":case"div":case"section":case"article":case"main":case"body":case"html":default:{const t=o();return new Set(["div","section","article","main"]).has(i)?`
${t}
`:t}}}function W(){const a=w.useCallback(h=>{if(!h.trim())return"";if(typeof DOMParser>"u")throw new Error("DOMParser在此环境中不可用。");const i=new DOMParser().parseFromString(h,"text/html").body;if(!i)throw new Error("无法解析 HTML。");let o=d(i);return o=o.replace(/\n{3,}/g,`

`).trim(),o},[]);return A.jsx(T,{transform:a,inputLabel:"HTML",outputLabel:"降价",inputPlaceholder:"粘贴 HTML...",sample:y,downloadName:"output.md",downloadMime:"text/markdown"})}export{W as default};
