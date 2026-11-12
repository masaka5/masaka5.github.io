import{Q as ae,R as se,S as oe,T as le,U as ne,V as re,a as b,p as _e,i as u,t as k,b as ie,g as t,d as G,c as ce,s as q,f as o,W as de,X as ve,m as pe,o as c,e as x,r as S,v as l,w as fe,x as d,y as me,Y as ge,Z as ue,_ as xe,G as be,H as ye,$ as he,a0 as $e,I as we,a1 as ke,a2 as qe,a3 as Te,a4 as Se,P as je,a5 as Ce}from"./toolbox-CSYBKDGJ.js";import{T as ze,t as T,a as He}from"./tool-seo-B_rVr-By.js";import{C as Le}from"./copy-B-YRccjI.js";import"./rotate-cw-BkPYdDrq.js";function Pe(y,v){const h=ae(v,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.554.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const s=[["path",{d:"m16 18 6-6-6-6"}],["path",{d:"m8 6-6 6 6 6"}]];se(y,oe({name:"code"},()=>h,{get iconNode(){return s},children:(n,p)=>{var f=le(),$=ne(f);re($,v,"default",{}),b(n,f)},$$slots:{default:!0}}))}var Ie=S('<p class="text-xs text-muted"> </p>'),Ke=S('<div class="panel svelte-xw397n"><div class="flex items-center justify-between"><label class="panel-label svelte-xw397n"> </label> <button class="copy-btn svelte-xw397n"><!> </button></div> <textarea readonly="" class="code-area out svelte-xw397n" spellcheck="false"></textarea> <!></div>'),Ne=S('<div class="css-page svelte-xw397n"><!> <div class="panel svelte-xw397n"><label class="panel-label svelte-xw397n"> </label> <textarea class="code-area svelte-xw397n" spellcheck="false"></textarea> <p class="text-xs text-muted"> </p></div> <button class="btn highlight"> </button> <!> <p class="text-xs text-muted mt-2"> </p> <!></div>');function Oe(y,v){_e(v,!0);const h={"dev_tools.tools.json_name":we,"dev_tools.tools.diff_name":$e,"dev_tools.tools.word_count_name":he};let s=q(`body {
  margin: 0;
  padding: 0;
  /* Reset styles */
  font-family: sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}`),n=q(""),p=q(!1);function f(){let e=t(s);e=e.replace(/\/\*[\s\S]*?\*\//g,""),e=e.replace(/\s+/g," "),e=e.replace(/\s*\{\s*/g,"{"),e=e.replace(/\s*\}\s*/g,"}"),e=e.replace(/\s*:\s*/g,":"),e=e.replace(/\s*;\s*/g,";"),e=e.replace(/\s*,\s*/g,","),e=e.replace(/;}/g,"}"),x(n,e.trim(),!0)}async function $(){if(t(n))try{await navigator.clipboard.writeText(t(n)),x(p,!0),setTimeout(()=>x(p,!1),1500)}catch{}}const j=d(()=>{if(!t(n)||!t(s))return null;const e=t(s).length-t(n).length,r=t(s).length>0?Math.round(e/t(s).length*100):0;return{saved:e,pct:r}});var C=Ne(),z=l(C);{let e=d(ue),r=d(ge),_=d(me);ze(z,{category:"dev",get title(){return t(e)},get description(){return t(r)},get icon(){return Pe},backHref:"/dev-tools/",get backLabel(){return t(_)}})}var H=o(z,2),L=l(H),M=l(L),P=o(L,2),O=o(P,2),Q=l(O),m=o(H,2),U=l(m),I=o(m,2);{var V=e=>{var r=Ke(),_=l(r),i=l(_),w=l(i),N=o(i,2),R=l(N);{var Z=a=>{je(a,{size:14})},A=a=>{Le(a,{size:14})};u(R,a=>{t(p)?a(Z):a(A,-1)})}var D=o(R),B=o(_,2),E=o(B,2);{var F=a=>{var g=Ie(),J=l(g);k((ee,te)=>c(J,`${ee??""} 字符 · ${te??""}`),[()=>t(n).length.toLocaleString(),()=>Ce({pct:t(j).pct})]),b(a,g)};u(E,a=>{t(j)&&a(F)})}k((a,g)=>{c(w,a),c(D,` ${g??""}`),ye(B,t(n))},[()=>xe(),()=>be()]),G("click",N,$),b(e,r)};u(I,e=>{t(n)&&e(V)})}var K=o(I,2),W=l(K),X=o(K,2);{var Y=e=>{{let r=d(()=>T["dev-css-minify"].faqKeys.length>=4?[{q:qe?.()??"",a:ke?.()??""},{q:Se?.()??"",a:Te?.()??""}]:[]),_=d(()=>T["dev-css-minify"].related.map(i=>({href:i.href,name:h[i.nameKey]?.()??"",icon:i.icon})));He(e,{get faqs(){return t(r)},get relatedTools(){return t(_)}})}};u(X,e=>{T["dev-css-minify"]&&e(Y)})}k((e,r,_,i,w)=>{c(M,e),c(Q,`${r??""} 字符`),m.disabled=_,c(U,i),c(W,w)},[()=>de(),()=>t(s).length.toLocaleString(),()=>!t(s).trim(),()=>ve(),()=>pe()]),ie(P,()=>t(s),e=>x(s,e)),G("click",m,f),b(y,C),ce()}fe(["click"]);export{Oe as default};
